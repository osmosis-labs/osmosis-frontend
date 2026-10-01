import "@testing-library/jest-dom";

import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { CoinPretty, Dec, PricePretty } from "@osmosis-labs/unit";
import { render, screen } from "@testing-library/react";

import { MultiLanguageProvider } from "~/hooks/language/context";

const ATOM = {
  coinDenom: "ATOM",
  coinMinimalDenom:
    "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
  coinDecimals: 6,
  coinImageUrl: "/tokens/generated/atom.svg",
  coinName: "Cosmos Hub",
};

const USDC = {
  coinDenom: "USDC",
  coinMinimalDenom:
    "factory/osmo147h5x9pcj7lm0cttlaefx6sqq5vdfnmwfcqxkmjd7exqm9gc7grqhr75m0/alloyed/allUSDC",
  coinDecimals: 6,
  coinImageUrl: "/tokens/generated/usdc.svg",
  coinName: "USD Coin",
};

jest.mock("nuqs", () => ({
  parseAsString: { withDefault: () => ({}) },
  useQueryState: (key: string) => [
    key === "tab" ? "sell" : key === "type" ? "limit" : null,
    jest.fn(),
  ],
}));

jest.mock("~/stores", () => ({
  useStore: () => ({
    accountStore: {
      osmosisChainId: "osmosis-1",
      getWallet: () => ({ address: "osmo1test" }),
    },
  }),
}));

jest.mock("~/hooks", () => {
  const actual = jest.requireActual("~/hooks");
  return {
    ...actual,
    useAmplitudeAnalytics: () => ({ logEvent: jest.fn() }),
    useFeatureFlags: () => ({ oneClickTrading: false }),
    useOneClickTradingSwapReview: () => ({
      isEnabled: false,
      isExpired: false,
      isLoading: false,
      changes: [],
      setChanges: jest.fn(),
      transactionParams: undefined,
      wouldExceedSpendLimit: () => false,
      remainingSpendLimit: undefined,
      setTransactionParams: jest.fn(),
      resetParams: jest.fn(),
      setPreviousIsOneClickEnabled: jest.fn(),
    }),
    useWindowSize: () => ({ isMobile: false }),
  };
});

jest.mock("~/hooks/use-is-cosmos-new-account", () => ({
  useIsCosmosNewAccount: () => ({ isNewAccount: true }),
}));

jest.mock("~/modals", () => ({
  ModalBase: ({
    children,
    isOpen,
  }: {
    children: React.ReactNode;
    isOpen: boolean;
  }) => (isOpen ? <div data-testid="review-modal">{children}</div> : null),
}));

import { ReviewOrder } from "~/modals/review-order";

describe("ReviewOrder limit sell", () => {
  it("renders Confirm without throwing", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() =>
      render(
        <MultiLanguageProvider defaultLanguage="en">
          <ReviewOrder
            isOpen
            onClose={jest.fn()}
            confirmAction={jest.fn()}
            isConfirmationDisabled={false}
            title="Review trade"
            percentAdjusted={new Dec("0.05")}
            limitPriceFiat={
              new PricePretty(DEFAULT_VS_CURRENCY, new Dec("1.569"))
            }
            baseDenom="ATOM"
            isBeyondOppositePrice={false}
            inAmountToken={new CoinPretty(ATOM, "1010000")}
            inAmountFiat={new PricePretty(DEFAULT_VS_CURRENCY, new Dec("1.01"))}
            expectedOutput={new CoinPretty(USDC, "1010000")}
            expectedOutputFiat={
              new PricePretty(DEFAULT_VS_CURRENCY, new Dec("1.01"))
            }
            fromAsset={ATOM as any}
            toAsset={USDC as any}
            gasAmount={new PricePretty(DEFAULT_VS_CURRENCY, new Dec("0.01"))}
          />
        </MultiLanguageProvider>
      )
    ).not.toThrow();

    expect(screen.getByTestId("review-modal")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /confirm/i })
    ).toBeInTheDocument();

    spy.mockRestore();
  });
});
