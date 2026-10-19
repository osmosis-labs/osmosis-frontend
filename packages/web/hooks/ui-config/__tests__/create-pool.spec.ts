import { AppCurrency } from "@osmosis-labs/unit";
import { act, renderHook } from "@testing-library/react";

import { useCreatePoolConfig } from "~/hooks/ui-config/use-create-pool-config";

let mockBalances: { amount: string; coin?: { currency: AppCurrency } }[] = [];
jest.mock("~/utils/trpc", () => ({
  api: {
    local: {
      balances: {
        getUserBalances: { useQuery: () => ({ data: mockBalances }) },
      },
    },
  },
}));

const osmo: AppCurrency = {
  coinDenom: "OSMO",
  coinMinimalDenom: "uosmo",
  coinDecimals: 6,
};
const atom: AppCurrency = {
  coinDenom: "ATOM",
  coinMinimalDenom: "uatom",
  coinDecimals: 6,
};
const usdc: AppCurrency = {
  coinDenom: "USDC",
  coinMinimalDenom: "uusdc",
  coinDecimals: 6,
};
const gamm: AppCurrency = {
  coinDenom: "GAMM/POOL/1",
  coinMinimalDenom: "gamm/pool/1",
  coinDecimals: 18,
};

const sender = "osmo1fl48vsnmsdzcv85q5d2q4z5ajdha8yu3aq6l09";
// a valid bech32 address with another prefix
const otherPrefixAddress = "cosmos1fl48vsnmsdzcv85q5d2q4z5ajdha8yu34mf0eh";

const balances = [
  { amount: "1000000000", coin: { currency: osmo } },
  { amount: "2500000", coin: { currency: atom } },
  { amount: "7", coin: { currency: usdc } },
  { amount: "5", coin: { currency: gamm } },
  { amount: "10" },
];

function renderConfig(address = sender) {
  return renderHook(() => useCreatePoolConfig(address));
}

describe("useCreatePoolConfig", () => {
  beforeEach(() => {
    mockBalances = balances;
  });

  it("lists sendable currencies from balances, without gamm shares or unknown coins", () => {
    const { result } = renderConfig();
    expect(
      result.current.sendableCurrencies.map((c) => c.coinMinimalDenom)
    ).toEqual(["uosmo", "uatom", "uusdc"]);
    expect(result.current.positiveBalanceError).toBeUndefined();
  });

  it("errors without balances", () => {
    mockBalances = [];
    const { result } = renderConfig();
    expect(result.current.positiveBalanceError?.message).toBe(
      "You have no assets to deposit"
    );
  });

  it("only adds assets once the pool type is chosen, up to the max", () => {
    const { result } = renderConfig();
    act(() => result.current.addAsset(osmo));
    expect(result.current.assets).toHaveLength(0);

    act(() => result.current.setPoolType("weighted"));
    act(() => result.current.addAsset(osmo));
    act(() => result.current.addAsset(atom));
    expect(result.current.assets.map((a) => a.percentage)).toEqual(["0", "0"]);
    expect(
      result.current.remainingSelectableCurrencies.map(
        (c) => c.coinMinimalDenom
      )
    ).toEqual(["uusdc"]);
    expect(result.current.canAddAsset).toBe(true);

    act(() => result.current.addAsset(usdc));
    // all sendable currencies are used
    expect(result.current.canAddAsset).toBe(false);
    act(() => result.current.addAsset(usdc));
    expect(result.current.assets).toHaveLength(3);
  });

  it("validates weighted percentages", () => {
    const { result } = renderConfig();
    act(() => result.current.setPoolType("weighted"));
    act(() => result.current.addAsset(osmo));
    act(() => result.current.addAsset(atom));

    expect(result.current.percentageError?.message).toBe(
      "Non-positive percentage"
    );
    act(() => result.current.setAssetPercentageAt(0, ".5"));
    expect(result.current.assets[0].percentage).toBe("0.5");
    act(() => result.current.setAssetPercentageAt(1, "50"));
    expect(result.current.percentageError?.message).toBe(
      "Sum of percentages is not 100"
    );
    act(() => result.current.setBalancedPercentages());
    expect(result.current.assets.map((a) => a.percentage)).toEqual([
      "50",
      "50",
    ]);
    expect(result.current.percentageError).toBeUndefined();
    expect(result.current.balancedPercentage.toDec().toString()).toBe(
      "0.500000000000000000"
    );
  });

  it("balances an odd number of assets to 100 in total", () => {
    const { result } = renderConfig();
    act(() => result.current.setPoolType("weighted"));
    act(() => result.current.addAsset(osmo));
    act(() => result.current.addAsset(atom));
    act(() => result.current.addAsset(usdc));
    act(() => result.current.setBalancedPercentages());
    expect(result.current.assets.map((a) => a.percentage)).toEqual([
      "33",
      "33",
      "34",
    ]);
    expect(result.current.percentageError).toBeUndefined();
  });

  it("validates stable scaling factors", () => {
    const { result } = renderConfig();
    act(() => result.current.setPoolType("stable"));
    act(() => result.current.addAsset(osmo));
    expect(result.current.assets[0].scalingFactor).toBe(1);
    act(() => result.current.setScalingFactorAt(0, "abc"));
    expect(result.current.assets[0].scalingFactor).toBe(1);
    act(() => result.current.setScalingFactorAt(0, "0.5"));
    expect(result.current.scalingFactorError?.message).toBe(
      "Scaling factor too low"
    );
    act(() => result.current.setScalingFactorAt(0, "1.5"));
    expect(result.current.scalingFactorError?.message).toBe(
      "Scaling factor not an integer"
    );
    act(() => result.current.setScalingFactorAt(0, "100"));
    expect(result.current.scalingFactorError).toBeUndefined();
  });

  it("validates the swap fee", () => {
    const { result } = renderConfig();
    expect(result.current.swapFeeError).toBeUndefined();
    for (const [fee, message] of [
      ["-1", "Negative swap fee"],
      ["100", "Swap fee too high"],
      ["abc", "Invalid swap fee"],
    ]) {
      act(() => result.current.setSwapFee(fee));
      expect(result.current.swapFeeError?.message).toBe(message);
    }
    act(() => result.current.setSwapFee("0.3"));
    expect(result.current.swapFeeError).toBeUndefined();
  });

  it("validates the scaling factor controller for stable pools only", () => {
    const { result } = renderConfig();
    act(() => result.current.setScalingFactorControllerAddress("nope"));
    expect(result.current.scalingFactorControllerAddress).toBe("");

    act(() => result.current.setPoolType("stable"));
    act(() => result.current.setScalingFactorControllerAddress("nope"));
    expect(result.current.scalingFactorControllerError?.message).toBe(
      "Invalid scaling factor controller address"
    );
    act(() => result.current.setScalingFactorControllerAddress(sender));
    expect(result.current.scalingFactorControllerError).toBeUndefined();
    act(() =>
      result.current.setScalingFactorControllerAddress(otherPrefixAddress)
    );
    expect(result.current.scalingFactorControllerError).toBeDefined();
  });

  it("validates amounts against balances, and max uses the whole balance", () => {
    const { result } = renderConfig();
    act(() => result.current.setPoolType("weighted"));
    act(() => result.current.addAsset(osmo));
    act(() => result.current.addAsset(atom));
    expect(result.current.amountError?.message).toBe("Amount is empty");

    act(() => result.current.assets[0].amountConfig.setAmount(".5"));
    expect(result.current.assets[0].amountConfig.amount).toBe("0.5");
    act(() => result.current.assets[1].amountConfig.setAmount("2.6"));
    expect(result.current.amountError?.message).toBe("Insufficient amount");
    act(() => result.current.assets[1].amountConfig.setIsMax(true));
    expect(result.current.assets[1].amountConfig.isMax).toBe(true);
    expect(result.current.assets[1].amountConfig.amount).toBe("2.5");
    expect(result.current.amountError).toBeUndefined();

    // typing leaves max mode
    act(() => result.current.assets[1].amountConfig.setAmount("1"));
    expect(result.current.assets[1].amountConfig.isMax).toBe(false);
    expect(result.current.assets[1].amountConfig.amount).toBe("1");

    act(() => result.current.assets[0].amountConfig.setAmount("0"));
    expect(result.current.amountError?.message).toBe("Amount is zero");
  });

  it("keeps duplicate flags and fee acknowledgement in state", () => {
    const { result } = renderConfig();
    act(() => result.current.setDuplicateBlocking(true));
    act(() => result.current.setDuplicateAcknowledged(true));
    act(() => result.current.setAcknowledgeFee(true));
    expect(result.current.duplicateBlocking).toBe(true);
    expect(result.current.duplicateAcknowledged).toBe(true);
    expect(result.current.acknowledgeFee).toBe(true);
  });

  it("checks the asset count", () => {
    const { result } = renderConfig();
    expect(result.current.assetCountError?.message).toBe(
      "Minimum of 2 assets required"
    );
  });

  it("keeps its setters stable across state changes", () => {
    const { result } = renderConfig();
    const { setPoolType, setSwapFee, setDuplicateBlocking } = result.current;
    act(() => result.current.setSwapFee("1"));
    expect(result.current.setPoolType).toBe(setPoolType);
    expect(result.current.setSwapFee).toBe(setSwapFee);
    expect(result.current.setDuplicateBlocking).toBe(setDuplicateBlocking);
  });
});

// Expectations captured from the legacy config before its removal.
describe("useCreatePoolConfig state transitions", () => {
  type Config = ReturnType<typeof useCreatePoolConfig>;

  const snapshot = (c: Config) => ({
    poolType: c.poolType,
    swapFee: c.swapFee,
    canAddAsset: c.canAddAsset,
    errors: [
      c.positiveBalanceError,
      c.assetCountError,
      c.percentageError,
      c.scalingFactorError,
      c.swapFeeError,
      c.amountError,
      c.scalingFactorControllerError,
    ].map((e) => e?.constructor.name),
    assets: c.assets.map((a) => ({
      percentage: a.percentage,
      scalingFactor: a.scalingFactor,
      amount: a.amountConfig.amount,
      denom: a.amountConfig.sendCurrency.coinMinimalDenom,
    })),
  });

  const steps: ((c: Config) => void)[] = [
    (c) => c.setPoolType("weighted"),
    (c) => c.addAsset(osmo),
    (c) => c.addAsset(atom),
    (c) => c.addAsset(usdc),
    (c) => c.assets[0].amountConfig.setAmount(".25"),
    (c) => c.assets[1].amountConfig.setAmount("3"),
    (c) => c.setAssetPercentageAt(0, ".5"),
    (c) => c.setAssetPercentageAt(5, "10"),
    (c) => c.setBalancedPercentages(),
    (c) => c.assets[1].amountConfig.setIsMax(true),
    (c) => c.assets[2].amountConfig.setAmount("7.0000001"),
    (c) => c.removeAssetAt(2),
    (c) => c.setSwapFee("0.5"),
    (c) => c.setSwapFee("100"),
    (c) => c.setPoolType("stable"),
    (c) => c.setScalingFactorAt(0, "0"),
    (c) => c.setScalingFactorControllerAddress("osmo1bad"),
    (c) => c.setScalingFactorControllerAddress(sender),
    (c) => c.setScalingFactorControllerAddress(otherPrefixAddress),
    (c) => c.setPoolType("weighted"),
    (c) => c.removeAssetAt(0),
    (c) => c.removeAssetAt(0),
  ];

  it("matches after every step", () => {
    mockBalances = balances;
    const { result } = renderConfig();

    const states = [snapshot(result.current)];
    steps.forEach((step) => {
      act(() => step(result.current));
      states.push(snapshot(result.current));
    });
    expect(states).toMatchSnapshot();
  });
});
