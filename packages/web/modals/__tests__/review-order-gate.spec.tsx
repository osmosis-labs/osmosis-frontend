/* eslint-disable import/no-extraneous-dependencies */
import "@testing-library/jest-dom";

import { CoinPretty, Dec, IntPretty, RatePretty } from "@osmosis-labs/unit";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

import { HighPriceImpactGate, HighSlippageGate } from "~/config/trade-warnings";

/** Mutable query state, so a test can put the modal on the limit tab. */
const queryState: Record<string, string> = { tab: "swap", type: "market" };

jest.mock("nuqs", () => ({
  parseAsString: {
    withDefault: (defaultValue: string) => ({ defaultValue }),
  },
  useQueryState: (key: string, parser: { defaultValue: string }) => [
    queryState[key] ?? parser.defaultValue,
    jest.fn(),
  ],
}));

// The modal chrome is a react-modal portal; the gate is what is under test. This
// stub keeps the one behaviour that matters here — content is hidden when closed,
// while `ReviewOrder` itself stays mounted and keeps its state.
jest.mock("~/modals", () => ({
  ModalBase: ({
    isOpen,
    children,
  }: {
    isOpen: boolean;
    children: React.ReactNode;
  }) => (isOpen ? <div>{children}</div> : null),
}));

jest.mock("~/stores", () => ({
  useStore: () => ({
    accountStore: {
      osmosisChainId: "osmosis-1",
      getWallet: () => ({ address: "osmo1abc" }),
    },
  }),
}));

jest.mock("~/hooks/use-is-cosmos-new-account", () => ({
  useIsCosmosNewAccount: () => ({ isNewAccount: false }),
}));

jest.mock("~/hooks", () => ({
  ...jest.requireActual("~/hooks"),
  useAmplitudeAnalytics: () => ({ logEvent: jest.fn() }),
  useFeatureFlags: () => ({
    oneClickTrading: false,
    swapToolSimulateFee: false,
  }),
  useWindowSize: () => ({ isMobile: false }),
  useOneClickTradingSwapReview: () => ({
    isEnabled: false,
    changes: undefined,
    setChanges: jest.fn(),
    transactionParams: undefined,
    remainingSpendLimit: undefined,
    wouldExceedSpendLimit: () => false,
    setTransactionParams: jest.fn(),
    resetParams: jest.fn(),
    setPreviousIsOneClickEnabled: jest.fn(),
  }),
}));

import { MultiLanguageProvider } from "~/hooks/language";

import { ReviewOrder } from "../review-order";

const osmo = { coinDenom: "OSMO", coinMinimalDenom: "uosmo", coinDecimals: 6 };
const atom = { coinDenom: "ATOM", coinMinimalDenom: "uatom", coinDecimals: 6 };

/** A slippage config stub exposing only what the modal reads. */
const slippageConfigStub = (slippage: Dec) =>
  ({
    slippage: new RatePretty(slippage),
    defaultManualSlippage: "0.5",
    setManualSlippage: jest.fn(),
  } as any);

type Props = React.ComponentProps<typeof ReviewOrder>;

const baseProps = (): Props => ({
  isOpen: true,
  onClose: jest.fn(),
  confirmAction: jest.fn(),
  isConfirmationDisabled: false,
  title: "Review trade",
  slippageConfig: slippageConfigStub(new Dec("0.005")),
  amountWithSlippage: new IntPretty(new Dec("100")),
  fromAsset: osmo as any,
  toAsset: atom as any,
  inAmountToken: new CoinPretty(osmo, new Dec("1000000")),
  quoteType: "out-given-in",
});

const renderModal = (props: Props) => {
  const ui = (p: Props) => (
    <MultiLanguageProvider defaultLanguage="en">
      <ReviewOrder {...p} />
    </MultiLanguageProvider>
  );
  const utils = render(ui(props));
  return { ...utils, rerenderWith: (p: Props) => utils.rerender(ui(p)) };
};

const checkbox = () =>
  screen.queryByRole("checkbox", {
    name: /lose a significant amount of value/i,
  });
const confirmButton = () => screen.getByRole("button", { name: /confirm/i });

/** Impact as the router reports it: negative. */
const quotedImpact = (magnitude: Dec) => new RatePretty(magnitude.neg());

const highImpact = quotedImpact(HighPriceImpactGate.add(new Dec("0.02")));
const lowImpact = quotedImpact(new Dec("0.02"));

beforeEach(() => {
  queryState.tab = "swap";
  queryState.type = "market";
});

describe("ReviewOrder acknowledgement gate", () => {
  it("renders no checkbox and an enabled confirm for an unremarkable trade", () => {
    renderModal({ ...baseProps(), priceImpactTokenOut: lowImpact });

    expect(checkbox()).not.toBeInTheDocument();
    expect(confirmButton()).toBeEnabled();
  });

  it("gates a high price impact behind the checkbox", () => {
    renderModal({ ...baseProps(), priceImpactTokenOut: highImpact });

    expect(checkbox()).toBeInTheDocument();
    expect(checkbox()).not.toBeChecked();
    expect(confirmButton()).toBeDisabled();
  });

  it("shows the user what impact they are being asked to accept", () => {
    renderModal({ ...baseProps(), priceImpactTokenOut: highImpact });

    expect(screen.getByText("Price impact is high")).toBeInTheDocument();
  });

  it("enables confirm once the box is ticked, and disables it again when unticked", () => {
    renderModal({ ...baseProps(), priceImpactTokenOut: highImpact });

    fireEvent.click(checkbox()!);
    expect(checkbox()).toBeChecked();
    expect(confirmButton()).toBeEnabled();

    fireEvent.click(checkbox()!);
    expect(checkbox()).not.toBeChecked();
    expect(confirmButton()).toBeDisabled();
  });

  it("gates a high slippage tolerance independently of price impact", () => {
    renderModal({
      ...baseProps(),
      slippageConfig: slippageConfigStub(HighSlippageGate),
      priceImpactTokenOut: lowImpact,
    });

    expect(checkbox()).toBeInTheDocument();
    expect(confirmButton()).toBeDisabled();
  });

  it("does not fire the transaction while the gate is unsatisfied", () => {
    const confirmAction = jest.fn();
    renderModal({
      ...baseProps(),
      confirmAction,
      priceImpactTokenOut: highImpact,
    });

    fireEvent.click(confirmButton());

    expect(confirmAction).not.toHaveBeenCalled();
  });

  it("forwards the acknowledged figures for the auth memo on confirm", () => {
    const confirmAction = jest.fn();
    renderModal({
      ...baseProps(),
      confirmAction,
      priceImpactTokenOut: highImpact,
    });

    fireEvent.click(checkbox()!);
    fireEvent.click(confirmButton());

    expect(confirmAction).toHaveBeenCalledTimes(1);
    const flags = confirmAction.mock.calls[0][0].warnFlags;
    expect(flags.priceImpact.toString()).toBe(
      HighPriceImpactGate.add(new Dec("0.02")).toString()
    );
    // A tolerance is never recorded as a realized loss.
    expect(flags.totalLoss).toBeUndefined();
  });

  it("stamps nothing for a trade that needed no acknowledgement", () => {
    const confirmAction = jest.fn();
    renderModal({
      ...baseProps(),
      confirmAction,
      priceImpactTokenOut: lowImpact,
    });

    fireEvent.click(confirmButton());

    expect(confirmAction).toHaveBeenCalledWith({ warnFlags: undefined });
  });

  it("re-arms when the quote worsens beyond the tolerance", () => {
    const props = { ...baseProps(), priceImpactTokenOut: highImpact };
    const { rerenderWith } = renderModal(props);

    fireEvent.click(checkbox()!);
    expect(confirmButton()).toBeEnabled();

    rerenderWith({
      ...props,
      priceImpactTokenOut: quotedImpact(
        HighPriceImpactGate.add(new Dec("0.2"))
      ),
    });

    expect(checkbox()).not.toBeChecked();
    expect(confirmButton()).toBeDisabled();
  });

  it("keeps the acknowledgement when the quote drifts within the tolerance", () => {
    const props = { ...baseProps(), priceImpactTokenOut: highImpact };
    const { rerenderWith } = renderModal(props);

    fireEvent.click(checkbox()!);

    rerenderWith({
      ...props,
      priceImpactTokenOut: quotedImpact(
        HighPriceImpactGate.add(new Dec("0.021"))
      ),
    });

    expect(checkbox()).toBeChecked();
    expect(confirmButton()).toBeEnabled();
  });

  // The silent auto-raise in `useDynamicSlippageConfig` can move an already
  // accepted basis from 0.5% to 5% with no notification. Because slippage is one
  // of the compared figures, that worsening re-arms the box for free.
  it("re-arms when slippage is silently raised under the user", () => {
    const props = { ...baseProps(), priceImpactTokenOut: highImpact };
    const { rerenderWith } = renderModal(props);

    fireEvent.click(checkbox()!);
    expect(confirmButton()).toBeEnabled();

    rerenderWith({
      ...props,
      slippageConfig: slippageConfigStub(new Dec("0.05")),
    });

    expect(checkbox()).not.toBeChecked();
    expect(confirmButton()).toBeDisabled();
  });

  // The step-3.5 correction: this component renders unconditionally and passes
  // `isOpen` down, so its body stays mounted between opens. A mount-keyed reset
  // (which is what the bridge uses) would never fire here, leaving a tick alive
  // across close/reopen. Asserted by toggling `isOpen`, never by remounting.
  it("re-arms on reopen without being remounted", () => {
    const props = { ...baseProps(), priceImpactTokenOut: highImpact };
    const { rerenderWith } = renderModal(props);

    fireEvent.click(checkbox()!);
    expect(confirmButton()).toBeEnabled();

    rerenderWith({ ...props, isOpen: false });
    expect(checkbox()).not.toBeInTheDocument();

    rerenderWith({ ...props, isOpen: true });

    expect(checkbox()).not.toBeChecked();
    expect(confirmButton()).toBeDisabled();
  });

  it("re-arms when the trade itself changes, with the figures unchanged", () => {
    const props = { ...baseProps(), priceImpactTokenOut: highImpact };
    const { rerenderWith } = renderModal(props);

    fireEvent.click(checkbox()!);
    expect(confirmButton()).toBeEnabled();

    rerenderWith({
      ...props,
      inAmountToken: new CoinPretty(osmo, new Dec("2000000")),
    });

    expect(checkbox()).not.toBeChecked();
  });

  describe("drift-banner precedence", () => {
    // At most one of {drift banner} / {checkbox + confirm} may be interactable.
    const driftedProps = () => ({
      ...baseProps(),
      priceImpactTokenOut: highImpact,
      amountWithSlippage: new IntPretty(new Dec("100")),
    });

    it("hides the checkbox and the confirm button while the quote has drifted", () => {
      const props = driftedProps();
      const { rerenderWith } = renderModal(props);

      expect(checkbox()).toBeInTheDocument();

      // output drops 10%, far beyond the 0.5% tolerance
      rerenderWith({
        ...props,
        amountWithSlippage: new IntPretty(new Dec("90")),
      });

      expect(checkbox()).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /confirm/i })).toBeNull();
      expect(screen.getByText("Quote updated")).toBeInTheDocument();
    });

    // Accepting the updated quote dismisses the banner and brings the confirm
    // row back, but the loss acknowledgement does not survive it. The two guards
    // cover independent risks — the banner is the market moving against you,
    // while the checkbox is this trade's own price impact, which can be unchanged
    // while the output drops — yet a user who accepts a worse quote is looking at
    // materially different terms from the ones they consented to. Re-asking is
    // the safer default on a signing surface, and it keeps the stamped memo tied
    // to figures the user ticked against.
    it("dismisses the banner on accept and re-arms the acknowledgement", () => {
      const props = driftedProps();
      const { rerenderWith } = renderModal(props);

      fireEvent.click(checkbox()!);
      rerenderWith({
        ...props,
        amountWithSlippage: new IntPretty(new Dec("90")),
      });

      fireEvent.click(screen.getByRole("button", { name: /accept/i }));

      expect(screen.queryByText("Quote updated")).toBeNull();
      expect(checkbox()).not.toBeChecked();
      expect(confirmButton()).toBeDisabled();
    });

    // The re-arm is specific to accepting a drifted quote. A trade that never
    // gated in the first place must not come back from "Accept" with a disabled
    // confirm button and no checkbox to satisfy.
    it("leaves an ungated trade confirmable after accepting a drifted quote", () => {
      const props = { ...driftedProps(), priceImpactTokenOut: lowImpact };
      const { rerenderWith } = renderModal(props);

      expect(checkbox()).not.toBeInTheDocument();

      rerenderWith({
        ...props,
        amountWithSlippage: new IntPretty(new Dec("90")),
      });
      fireEvent.click(screen.getByRole("button", { name: /accept/i }));

      expect(screen.queryByText("Quote updated")).toBeNull();
      expect(checkbox()).not.toBeInTheDocument();
      expect(confirmButton()).toBeEnabled();
    });
  });

  describe("true limit orders", () => {
    beforeEach(() => {
      queryState.type = "limit";
    });

    it("gates an order priced across the book", () => {
      renderModal({
        ...baseProps(),
        priceImpactTokenOut: lowImpact,
        isBeyondOppositePrice: true,
        percentAdjusted: new Dec("0.0325"),
      });

      expect(checkbox()).toBeInTheDocument();
      expect(confirmButton()).toBeDisabled();
    });

    it("stamps how far past market the order was priced", () => {
      const confirmAction = jest.fn();
      renderModal({
        ...baseProps(),
        confirmAction,
        priceImpactTokenOut: lowImpact,
        isBeyondOppositePrice: true,
        percentAdjusted: new Dec("0.0325"),
      });

      fireEvent.click(checkbox()!);
      fireEvent.click(confirmButton());

      const flags = confirmAction.mock.calls[0][0].warnFlags;
      expect(flags.marketFillDistance.toString()).toBe(
        new Dec("0.0325").toString()
      );
    });

    it("does not gate an order resting on its own side of the book", () => {
      renderModal({
        ...baseProps(),
        priceImpactTokenOut: lowImpact,
        isBeyondOppositePrice: false,
        percentAdjusted: new Dec("0.0325"),
      });

      expect(checkbox()).not.toBeInTheDocument();
      expect(confirmButton()).toBeEnabled();
    });
  });
});
