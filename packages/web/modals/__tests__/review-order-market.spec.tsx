import "@testing-library/jest-dom";

import { DEFAULT_VS_CURRENCY } from "@osmosis-labs/server";
import { ObservableSlippageConfig } from "@osmosis-labs/stores";
import { Dec, IntPretty, PricePretty } from "@osmosis-labs/unit";
import { fireEvent, render, screen } from "@testing-library/react";
import { ComponentProps, useEffect, useRef } from "react";

import { MultiLanguageProvider } from "~/hooks/language/context";

const OSMO = {
  coinDenom: "OSMO",
  coinMinimalDenom: "uosmo",
  coinDecimals: 6,
  coinImageUrl: "/tokens/generated/osmo.svg",
  coinName: "Osmosis",
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
    key === "tab" ? "swap" : key === "type" ? "market" : null,
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

// react-modal unmounts its content on close and then calls onAfterClose; the
// mock does the same so the reopen behaviour can be exercised.
jest.mock("~/modals", () => ({
  ModalBase: function ModalBase({
    children,
    isOpen,
    onAfterClose,
  }: {
    children: React.ReactNode;
    isOpen: boolean;
    onAfterClose?: () => void;
  }) {
    const wasOpen = useRef(isOpen);
    useEffect(() => {
      if (wasOpen.current && !isOpen) onAfterClose?.();
      wasOpen.current = isOpen;
    }, [isOpen, onAfterClose]);
    return isOpen ? <div data-testid="review-modal">{children}</div> : null;
  },
}));

import { ReviewOrder } from "~/modals/review-order";

const usd = (value: string) =>
  new PricePretty(DEFAULT_VS_CURRENCY, new Dec(value));

type Props = ComponentProps<typeof ReviewOrder>;

function makeProps(overrides: Partial<Props> = {}): Props {
  const slippageConfig = new ObservableSlippageConfig();
  slippageConfig.setManualSlippage("1");
  return {
    isOpen: true,
    onClose: jest.fn(),
    confirmAction: jest.fn(),
    isConfirmationDisabled: false,
    title: "Review trade",
    orderType: "market",
    quoteType: "out-given-in",
    slippageConfig,
    fromAsset: OSMO as any,
    toAsset: USDC as any,
    inAmountFiat: usd("100"),
    amountWithSlippage: new IntPretty(new Dec("99")),
    fiatAmountWithSlippage: usd("99"),
    expectedOutputFiat: usd("100"),
    gasAmount: usd("0.01"),
    ...overrides,
  };
}

function renderReview(props: Props) {
  const view = render(
    <MultiLanguageProvider defaultLanguage="en">
      <ReviewOrder {...props} />
    </MultiLanguageProvider>
  );
  return {
    ...view,
    rerenderReview: (next: Props) =>
      view.rerender(
        <MultiLanguageProvider defaultLanguage="en">
          <ReviewOrder {...next} />
        </MultiLanguageProvider>
      ),
  };
}

const confirmButton = () => screen.getByRole("button", { name: /^confirm$/i });
const disparityCheckbox = () => screen.queryByRole("checkbox");

describe("ReviewOrder market safety rails", () => {
  let consoleError: jest.SpyInstance;
  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => consoleError.mockRestore());

  describe("high-loss acknowledgement", () => {
    const lossy = { fiatAmountWithSlippage: usd("50") };

    it("requires ticking the acknowledgement before Confirm enables", () => {
      renderReview(makeProps(lossy));

      expect(disparityCheckbox()).toBeInTheDocument();
      expect(confirmButton()).toBeDisabled();

      fireEvent.click(disparityCheckbox()!);
      expect(confirmButton()).toBeEnabled();
    });

    it("is not shown for a resting limit order", () => {
      renderReview(makeProps({ ...lossy, orderType: "limit" }));

      expect(disparityCheckbox()).not.toBeInTheDocument();
      expect(confirmButton()).toBeEnabled();
    });

    it("is not shown when the minimum received is close to the value sent", () => {
      renderReview(makeProps());

      expect(disparityCheckbox()).not.toBeInTheDocument();
      expect(confirmButton()).toBeEnabled();
    });

    it("is cleared when the review is closed and reopened", () => {
      const props = makeProps(lossy);
      const { rerenderReview } = renderReview(props);
      fireEvent.click(disparityCheckbox()!);
      expect(confirmButton()).toBeEnabled();

      rerenderReview({ ...props, isOpen: false });
      rerenderReview({ ...props, isOpen: true });

      expect(confirmButton()).toBeDisabled();
    });
  });

  describe("minimum output that serializes to zero", () => {
    it("disables Confirm with an explanation, and offers no acknowledgement", () => {
      renderReview(
        makeProps({
          // Below one base unit of a 6-decimal asset.
          amountWithSlippage: new IntPretty(new Dec("0.0000004")),
          inAmountFiat: undefined,
          fiatAmountWithSlippage: undefined,
        })
      );

      expect(
        screen.getByText(/amount too small to swap with this slippage/i)
      ).toBeInTheDocument();
      expect(disparityCheckbox()).not.toBeInTheDocument();
      expect(confirmButton()).toBeDisabled();
    });

    it("does not apply to limit orders", () => {
      renderReview(
        makeProps({
          orderType: "limit",
          amountWithSlippage: new IntPretty(new Dec("0.0000004")),
          inAmountFiat: undefined,
          fiatAmountWithSlippage: undefined,
        })
      );

      expect(
        screen.queryByText(/amount too small to swap with this slippage/i)
      ).not.toBeInTheDocument();
      expect(confirmButton()).toBeEnabled();
    });
  });

  describe("high slippage warning", () => {
    it("warns above 1%", () => {
      const props = makeProps();
      props.slippageConfig!.setManualSlippage("1.5");
      renderReview(props);

      expect(
        screen.getByText(/your trade may result in significant loss of value/i)
      ).toBeInTheDocument();
    });

    it("does not warn at exactly 1%", () => {
      renderReview(makeProps());

      expect(
        screen.queryByText(
          /your trade may result in significant loss of value/i
        )
      ).not.toBeInTheDocument();
    });
  });

  describe("quote drift", () => {
    it("replaces Confirm with Quote updated once the minimum output drops by the tolerance, until accepted", () => {
      const props = makeProps();
      const { rerenderReview } = renderReview(props);
      expect(confirmButton()).toBeInTheDocument();

      rerenderReview({
        ...props,
        amountWithSlippage: new IntPretty(new Dec("98")),
      });
      expect(screen.getByText(/quote updated/i)).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /^confirm$/i })
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /accept/i }));
      expect(screen.queryByText(/quote updated/i)).not.toBeInTheDocument();
      expect(confirmButton()).toBeInTheDocument();
    });

    it("ignores drift smaller than the tolerance", () => {
      const props = makeProps();
      const { rerenderReview } = renderReview(props);

      rerenderReview({
        ...props,
        amountWithSlippage: new IntPretty(new Dec("98.5")),
      });
      expect(screen.queryByText(/quote updated/i)).not.toBeInTheDocument();
    });

    it("measures from the quote at reopen, not from a previous trade", () => {
      const props = makeProps();
      const { rerenderReview } = renderReview(props);

      rerenderReview({ ...props, isOpen: false });
      rerenderReview({
        ...props,
        isOpen: true,
        amountWithSlippage: new IntPretty(new Dec("50")),
      });
      expect(screen.queryByText(/quote updated/i)).not.toBeInTheDocument();
    });

    it("never fires at a zero tolerance", () => {
      const props = makeProps();
      props.slippageConfig!.setManualSlippage("0");
      const { rerenderReview } = renderReview(props);

      rerenderReview({
        ...props,
        amountWithSlippage: new IntPretty(new Dec("98.99")),
      });
      expect(screen.queryByText(/quote updated/i)).not.toBeInTheDocument();
    });
  });

  describe("slippage input", () => {
    const slippageInput = () => screen.getByPlaceholderText(/%$/);

    it("does not commit 0% while the user types 0.5", () => {
      const props = makeProps();
      renderReview(props);

      fireEvent.focus(slippageInput());
      fireEvent.change(slippageInput(), { target: { value: "0" } });
      expect(props.slippageConfig!.manualSlippageStr).toBe("1");
      fireEvent.change(slippageInput(), { target: { value: "0." } });
      expect(props.slippageConfig!.manualSlippageStr).toBe("1");
      fireEvent.change(slippageInput(), { target: { value: "0.5" } });
      expect(props.slippageConfig!.manualSlippageStr).toBe("0.5");
    });

    it("accepts a lone '.' without crashing", () => {
      const props = makeProps();
      renderReview(props);

      fireEvent.change(slippageInput(), { target: { value: "." } });
      expect(slippageInput()).toHaveValue("0.");
      expect(props.slippageConfig!.manualSlippageStr).toBe("1");
    });

    it("rejects a second decimal place", () => {
      const props = makeProps();
      renderReview(props);

      fireEvent.change(slippageInput(), { target: { value: "0.5" } });
      fireEvent.change(slippageInput(), { target: { value: "0.55" } });
      expect(slippageInput()).toHaveValue("0.5");
    });

    it("completes a trailing '.' on blur so display and submission agree", () => {
      const props = makeProps();
      renderReview(props);

      fireEvent.change(slippageInput(), { target: { value: "2." } });
      fireEvent.blur(slippageInput());
      expect(slippageInput()).toHaveValue("2");
      expect(props.slippageConfig!.manualSlippageStr).toBe("2");
    });

    it("hands back to the tool's own slippage when left at 0", () => {
      const props = makeProps();
      renderReview(props);

      fireEvent.change(slippageInput(), { target: { value: "0" } });
      fireEvent.blur(slippageInput());
      expect(slippageInput()).toHaveValue("");
      expect(props.slippageConfig!.isManualSlippage).toBe(false);
    });

    it("shows the slippage that will be submitted as the placeholder", () => {
      // A fresh config sits on its first preset (0.5%), not on the nominal
      // 0.1% default the placeholder used to show.
      const slippageConfig = new ObservableSlippageConfig();
      slippageConfig.setDefaultSlippage("0.1");
      slippageConfig.select(0);
      renderReview(makeProps({ slippageConfig }));

      expect(slippageInput()).toHaveAttribute("placeholder", "0.5%");
    });

    it("does not change the submitted slippage on focus", () => {
      // Focus used to switch to manual mode, silently replacing a preset
      // (e.g. one the fee-error path raised to 3%) with the manual 0.5%.
      const slippageConfig = new ObservableSlippageConfig();
      slippageConfig.select(2);
      renderReview(makeProps({ slippageConfig }));

      fireEvent.focus(slippageInput());
      expect(slippageConfig.slippage.toDec().equals(new Dec("0.03"))).toBe(
        true
      );
    });

    it("clearing the field returns to the tool's preset", () => {
      const slippageConfig = new ObservableSlippageConfig();
      slippageConfig.select(2);
      renderReview(makeProps({ slippageConfig }));

      fireEvent.change(slippageInput(), { target: { value: "2" } });
      expect(slippageConfig.slippage.toDec().equals(new Dec("0.02"))).toBe(
        true
      );
      fireEvent.change(slippageInput(), { target: { value: "" } });
      expect(slippageConfig.slippage.toDec().equals(new Dec("0.03"))).toBe(
        true
      );
    });

    it("clamps values above 99.9%", () => {
      const props = makeProps();
      renderReview(props);

      fireEvent.change(slippageInput(), { target: { value: "150" } });
      expect(slippageInput()).toHaveValue("99.9");
      expect(props.slippageConfig!.manualSlippageStr).toBe("99.9");
    });
  });

  describe("automatic slippage indicators", () => {
    it("flags an auto-adjusted slippage", () => {
      renderReview(makeProps({ slippageSource: "auto" }));
      expect(screen.getByText("Slippage auto-adjusted")).toBeInTheDocument();
    });

    it("does not flag a typed, fee-error or default slippage", () => {
      for (const slippageSource of ["user", "fee-error", "default"] as const) {
        const { unmount } = renderReview(makeProps({ slippageSource }));
        expect(
          screen.queryByText("Slippage auto-adjusted")
        ).not.toBeInTheDocument();
        unmount();
      }
    });

    it("hides the auto-adjusted flag while the user has typed a value", () => {
      renderReview(makeProps({ slippageSource: "auto" }));
      fireEvent.change(screen.getByPlaceholderText(/%$/), {
        target: { value: "2" },
      });
      expect(
        screen.queryByText("Slippage auto-adjusted")
      ).not.toBeInTheDocument();
    });

    it("warns when route liquidity could not be verified, without blocking", () => {
      renderReview(
        makeProps({ slippageSource: "default", slippageLiquidityUnknown: true })
      );
      expect(
        screen.getByText(/couldn't verify this route's liquidity/i)
      ).toBeInTheDocument();
      expect(confirmButton()).toBeEnabled();
    });

    it("marks a typed value as the user's, and clearing hands it back", () => {
      const props = makeProps({ slippageSource: "auto" });
      renderReview(props);
      const input = screen.getByPlaceholderText(/%$/);

      fireEvent.change(input, { target: { value: "2" } });
      expect(props.slippageConfig!.userOverrodeSlippage).toBe(true);

      fireEvent.change(input, { target: { value: "" } });
      expect(props.slippageConfig!.userOverrodeSlippage).toBe(false);
      // An automatic caller re-applies its own value; dropping to the preset
      // here would briefly submit 0.5%.
      expect(props.slippageConfig!.isManualSlippage).toBe(true);
    });
  });
});
