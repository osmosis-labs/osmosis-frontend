import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("~/utils/trpc", () => ({
  api: {
    edge: {
      assets: {
        getBridgeAssetWithVariants: {
          useQuery: jest.fn(() => ({ data: undefined })),
        },
      },
    },
  },
}));

// Keep the transfer-details subtree light so a quote with `selectedQuote` set
// can render without a fully-formed quote: the retention cases below only need
// the From/To asset boxes and the warning area.
jest.mock("../quote-detail", () => {
  const Stub = () => null;
  return {
    BridgeProviderDropdownRow: Stub,
    EstimatedTimeRow: Stub,
    ExpandDetailsControlContent: Stub,
    NetworkFeeRow: Stub,
    ProviderFeesRow: Stub,
    QuoteDetailRow: Stub,
    TotalFeesRow: Stub,
  };
});
jest.mock("../query-remaining-time", () => ({
  QueryRemainingTime: () => null,
}));
jest.mock("~/utils/formatter", () => ({
  formatPretty: (coin: { denom?: string }) => coin?.denom ?? "",
}));

import { MultiLanguageProvider } from "~/hooks/language";
import type { BridgeChainWithDisplayInfo } from "~/server/api/routers/bridge-transfer";

import { ReviewScreen } from "../review-screen";
import { BridgeQuote } from "../use-bridge-quotes";

const osmosis: BridgeChainWithDisplayInfo = {
  chainId: "osmosis-1",
  chainType: "cosmos",
  chainName: "osmosis",
  bech32Prefix: "osmo",
  prettyName: "Osmosis",
  color: "#ffffff",
  logoUri: "/osmosis.svg",
};

const bitcoin: BridgeChainWithDisplayInfo = {
  chainId: "bitcoin",
  chainType: "bitcoin",
  prettyName: "Bitcoin",
  color: "#ffffff",
  logoUri: "/bitcoin.svg",
};

/**
 * Minimal BridgeQuote stub: `selectedQuote` stays undefined so the heavy
 * TransferDetails/AssetBox subtrees render null and the spec exercises only
 * the acknowledgement gate wiring.
 */
const makeQuote = (overrides?: Partial<BridgeQuote>): BridgeQuote =>
  ({
    selectedQuote: undefined,
    userCanAdvance: true,
    isTxPending: false,
    isApprovingToken: false,
    txButtonText: undefined,
    errorBoxMessage: undefined,
    highLossWarningActive: false,
    warningNeedsAcknowledgement: false,
    hasAcknowledgedLoss: false,
    setLossAcknowledged: jest.fn(),
    ...overrides,
  }) as unknown as BridgeQuote;

const warnedQuote = (overrides?: Partial<BridgeQuote>): BridgeQuote =>
  makeQuote({
    userCanAdvance: false, // an active warning sets errorBoxMessage upstream
    errorBoxMessage: {
      heading: "Slippage is high",
      description: "Slippage on this transfer is high.",
    },
    highLossWarningActive: true,
    warningNeedsAcknowledgement: true,
    ...overrides,
  });

const renderScreen = (quote: BridgeQuote) =>
  render(
    <MultiLanguageProvider defaultLanguage="en">
      <ReviewScreen
        direction="withdraw"
        selectedDenom="BTC"
        fromChain={osmosis}
        toChain={bitcoin}
        fromAsset={{ address: "allBTC", decimals: 8, denom: "BTC" } as any}
        toAsset={{ address: "sat", decimals: 8, denom: "BTC" } as any}
        fromAddress="osmo1abc"
        toAddress="bc1qxyz"
        fromWalletIcon={undefined}
        toWalletIcon={undefined}
        quote={quote}
        isManualAddress={false}
        onCancel={jest.fn()}
        onConfirm={jest.fn()}
      />
    </MultiLanguageProvider>
  );

const confirmButton = () => screen.getByRole("button", { name: /confirm/i });
const acknowledgementCheckbox = () =>
  screen.queryByRole("checkbox", {
    name: /heavy loss of funds/i,
  });

describe("ReviewScreen loss-acknowledgement gate", () => {
  it("renders no checkbox and an enabled confirm for a benign quote", () => {
    renderScreen(makeQuote());

    expect(acknowledgementCheckbox()).not.toBeInTheDocument();
    expect(confirmButton()).toBeEnabled();
  });

  it("renders the warning copy + checkbox and disables confirm while unacknowledged", () => {
    renderScreen(warnedQuote());

    expect(screen.getByText("Slippage is high")).toBeInTheDocument();
    expect(acknowledgementCheckbox()).toBeInTheDocument();
    expect(acknowledgementCheckbox()).not.toBeChecked();
    expect(confirmButton()).toBeDisabled();
  });

  it("forwards checkbox ticks to setLossAcknowledged", () => {
    const setLossAcknowledged = jest.fn();
    renderScreen(warnedQuote({ setLossAcknowledged }));

    fireEvent.click(acknowledgementCheckbox()!);

    expect(setLossAcknowledged).toHaveBeenCalledWith(true);
  });

  it("enables confirm once the warning is acknowledged", () => {
    renderScreen(
      warnedQuote({
        hasAcknowledgedLoss: true,
        warningNeedsAcknowledgement: false,
      })
    );

    expect(acknowledgementCheckbox()).toBeChecked();
    expect(confirmButton()).toBeEnabled();
  });

  it("disables confirm again when the acknowledgement is re-armed by drift", () => {
    const { rerender } = renderScreen(
      warnedQuote({
        hasAcknowledgedLoss: true,
        warningNeedsAcknowledgement: false,
      })
    );
    expect(confirmButton()).toBeEnabled();

    rerender(
      <MultiLanguageProvider defaultLanguage="en">
        <ReviewScreen
          direction="withdraw"
          selectedDenom="BTC"
          fromChain={osmosis}
          toChain={bitcoin}
          fromAsset={{ address: "allBTC", decimals: 8, denom: "BTC" } as any}
          toAsset={{ address: "sat", decimals: 8, denom: "BTC" } as any}
          fromAddress="osmo1abc"
          toAddress="bc1qxyz"
          fromWalletIcon={undefined}
          toWalletIcon={undefined}
          quote={warnedQuote()}
          isManualAddress={false}
          onCancel={jest.fn()}
          onConfirm={jest.fn()}
        />
      </MultiLanguageProvider>
    );

    expect(acknowledgementCheckbox()).not.toBeChecked();
    expect(confirmButton()).toBeDisabled();
  });

  // Regression (found in MTN-199 QA): the acknowledgement lives in the parent's
  // `useBridgeQuotes`, so it outlives this screen's unmount. Navigating back to
  // the amount screen and returning without touching the quote left the checkbox
  // still ticked, because an unchanged quote gives the frozen-basis check nothing
  // to re-arm. Consent is per visit to the signing surface.
  it("clears an inherited acknowledgement on mount", () => {
    const setLossAcknowledged = jest.fn();

    renderScreen(
      warnedQuote({
        hasAcknowledgedLoss: true,
        warningNeedsAcknowledgement: false,
        setLossAcknowledged,
      })
    );

    expect(setLossAcknowledged).toHaveBeenCalledWith(false);
  });

  it("hides the checkbox and keeps confirm disabled when a non-acknowledgeable error owns the warning slot", () => {
    // e.g. insufficient fee or insufficient balance coexisting with a warn
    // flag: highLossWarningActive is false (the errorBox belongs to the fee
    // error / the balance check zeroes the flag), so the loss checkbox must
    // not render and cannot unlock the button.
    renderScreen(
      makeQuote({
        userCanAdvance: false,
        errorBoxMessage: {
          heading: "Insufficient funds for fees",
          description: "You need funds to pay network and bridging fees.",
        },
        highLossWarningActive: false,
        // the raw warn flag can still be true upstream; the gate must not care
        warningNeedsAcknowledgement: true,
      })
    );

    expect(screen.getByText("Insufficient funds for fees")).toBeInTheDocument();
    expect(acknowledgementCheckbox()).not.toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();
  });

  // Regression (MTN-351): a failed background refetch drops `selectedQuote`.
  // The screen must keep the last good quote on screen (dimmed) instead of
  // unrendering it, and render the hook's `errorBoxMessage` as-is. The hook's
  // `someError` branch already resolves an all-providers failure to the plain
  // "no quotes available" copy, so the screen does not second-guess it.
  it("keeps the last good quote and shows the hook's no-quotes message when a refetch drops it", () => {
    const goodQuote = {
      quote: { input: { fiatValue: undefined, amount: { denom: "WETH" } } },
      expectedOutput: { denom: "WETH" },
      expectedOutputFiat: undefined,
      estimatedTime: { humanize: () => "16 minutes" },
    } as unknown as BridgeQuote["selectedQuote"];

    const element = (quote: BridgeQuote) => (
      <MultiLanguageProvider defaultLanguage="en">
        <ReviewScreen
          direction="withdraw"
          selectedDenom="BTC"
          fromChain={osmosis}
          toChain={bitcoin}
          fromAsset={{ address: "allBTC", decimals: 8, denom: "BTC" } as any}
          toAsset={{ address: "sat", decimals: 8, denom: "BTC" } as any}
          fromAddress="osmo1abc"
          toAddress="bc1qxyz"
          fromWalletIcon={undefined}
          toWalletIcon={undefined}
          quote={quote}
          isManualAddress={false}
          onCancel={jest.fn()}
          onConfirm={jest.fn()}
        />
      </MultiLanguageProvider>
    );

    const { rerender } = render(
      element(makeQuote({ selectedQuote: goodQuote }))
    );

    // Live quote: both asset boxes are on screen, no outdated message yet.
    expect(screen.getByText("From")).toBeInTheDocument();
    expect(screen.getByText("To")).toBeInTheDocument();
    expect(screen.queryByText(/no quotes available/i)).not.toBeInTheDocument();

    // A failed refetch: selectedQuote is gone and the hook has resolved the
    // all-providers failure to its plain no-quotes copy.
    rerender(
      element(
        makeQuote({
          selectedQuote: undefined,
          userCanAdvance: false,
          errorBoxMessage: {
            heading: "No quotes available",
            description:
              "We couldn't get a quote for this amount. Try a different amount, or check again shortly.",
          },
        })
      )
    );

    // The boxes stay (retained from the last good quote), the hook's no-quotes
    // copy is shown, no checkbox, and Confirm is disabled.
    expect(screen.getByText("From")).toBeInTheDocument();
    expect(screen.getByText("To")).toBeInTheDocument();
    expect(screen.getByText(/no quotes available/i)).toBeInTheDocument();
    expect(acknowledgementCheckbox()).not.toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();
  });

  // Case 2 (MTN-351): the user pinned a provider that then lost its quote, but
  // another provider still has one. We keep the pin (no silent auto-switch) and
  // show the "this option is unavailable" copy, pointing at the other options,
  // rather than "no quotes available".
  it("shows the pinned-option-unavailable message when alternatives exist", () => {
    const goodQuote = {
      quote: { input: { fiatValue: undefined, amount: { denom: "WETH" } } },
      expectedOutput: { denom: "WETH" },
      expectedOutputFiat: undefined,
      estimatedTime: { humanize: () => "16 minutes" },
    } as unknown as BridgeQuote["selectedQuote"];

    const element = (quote: BridgeQuote) => (
      <MultiLanguageProvider defaultLanguage="en">
        <ReviewScreen
          direction="withdraw"
          selectedDenom="BTC"
          fromChain={osmosis}
          toChain={bitcoin}
          fromAsset={{ address: "allBTC", decimals: 8, denom: "BTC" } as any}
          toAsset={{ address: "sat", decimals: 8, denom: "BTC" } as any}
          fromAddress="osmo1abc"
          toAddress="bc1qxyz"
          fromWalletIcon={undefined}
          toWalletIcon={undefined}
          quote={quote}
          isManualAddress={false}
          onCancel={jest.fn()}
          onConfirm={jest.fn()}
        />
      </MultiLanguageProvider>
    );

    const { rerender } = render(
      element(makeQuote({ selectedQuote: goodQuote }))
    );

    // The pinned provider drops its quote, but another provider still has one.
    rerender(
      element(
        makeQuote({
          selectedQuote: undefined,
          userCanAdvance: false,
          successfulQuotes: [{ data: { provider: { id: "Squid" } } }] as any,
        })
      )
    );

    expect(screen.getByText(/this option is unavailable/i)).toBeInTheDocument();
    expect(screen.queryByText(/no quotes available/i)).not.toBeInTheDocument();
    expect(acknowledgementCheckbox()).not.toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();
  });

  it("surfaces the error copy when the quote itself errors", () => {
    // e.g. all providers fail a 30s refetch on the review screen: the
    // details/amount boxes unrender, so the error box is the only signal —
    // it must render even with no loss warning active.
    renderScreen(
      makeQuote({
        userCanAdvance: false,
        errorBoxMessage: {
          heading: "Something isn't working",
          description: "Sorry for the inconvenience, try again later.",
        },
        highLossWarningActive: false,
      })
    );

    expect(screen.getByText("Something isn't working")).toBeInTheDocument();
    expect(acknowledgementCheckbox()).not.toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();
  });
});
