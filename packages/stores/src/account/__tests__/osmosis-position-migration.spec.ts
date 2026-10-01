import {
  makeCreatePositionMsg,
  makeSwapExactAmountInMsg,
  makeWithdrawPositionMsg,
} from "@osmosis-labs/tx";
import { CoinPretty, Dec, Int } from "@osmosis-labs/unit";

import { OsmosisAccountImpl } from "../osmosis";

jest.mock("@osmosis-labs/tx", () => ({
  ...jest.requireActual("@osmosis-labs/tx"),
  makeCreatePositionMsg: jest.fn(),
  makeSwapExactAmountInMsg: jest.fn(),
  makeWithdrawPositionMsg: jest.fn(),
}));

const CHAIN_ID = "osmosis-1";
const ADDRESS = "osmo1migrationtest";
const ASSET_DENOM = "uatom";
const NOBLE_USDC_DENOM = "ibc/NOBLE_USDC";
const ALLOYED_USDC_DENOM = "factory/osmo1/alloyed/allUSDC";
const TRANSMUTER_POOL_ID = "1234";

const assetCurrency = {
  coinDenom: "ATOM",
  coinMinimalDenom: ASSET_DENOM,
  coinDecimals: 6,
};
const nobleUsdcCurrency = {
  coinDenom: "USDC.noble",
  coinMinimalDenom: NOBLE_USDC_DENOM,
  coinDecimals: 6,
};

/* Sentinel messages: the mocked makers return them and the test only
   asserts they flow through to signAndBroadcast in order, so the proto value
   shapes are irrelevant - cast past them. */
const stubMsg = <T>(typeUrl: string) =>
  ({ typeUrl, value: {} } as unknown as T);
const withdrawMessage =
  stubMsg<Awaited<ReturnType<typeof makeWithdrawPositionMsg>>>(
    "/test.withdraw"
  );
const convertMessage = stubMsg<
  Awaited<ReturnType<typeof makeSwapExactAmountInMsg>>
>("/test.swap-exact-in");
const probeCreateMessage =
  stubMsg<Awaited<ReturnType<typeof makeCreatePositionMsg>>>(
    "/test.create-probe"
  );
const protectedCreateMessage = stubMsg<
  Awaited<ReturnType<typeof makeCreatePositionMsg>>
>("/test.create-protected");

const positionEvent = (
  type: "withdraw_position" | "create_position",
  amount0: string,
  amount1: string
) => ({
  type,
  attributes: [
    { key: "amount0", value: amount0 },
    { key: "amount1", value: amount1 },
  ],
});

describe("sendMigrateConcentratedLiquidityPositionMsg", () => {
  const queryPosition = {
    waitFreshResponse: jest.fn(),
    liquidity: new Dec("123456"),
    baseAsset: new CoinPretty(assetCurrency, new Int("1000")),
    quoteAsset: new CoinPretty(nobleUsdcCurrency, new Int("2000")),
  };
  const queryAccountsPositions = { waitFreshResponse: jest.fn() };
  const base = {
    getWallet: jest.fn(() => ({ address: ADDRESS })),
    simulatePositionMigration: jest.fn(),
    signAndBroadcast: jest.fn(),
  };
  const queriesStore = {
    get: jest.fn(() => ({
      osmosis: {
        queryLiquidityPositionsById: {
          getForPositionId: jest.fn(() => queryPosition),
        },
        queryAccountsPositions: {
          get: jest.fn(() => queryAccountsPositions),
        },
      },
      queryBalances: {
        getQueryBech32Address: jest.fn(() => ({ balances: [] })),
      },
    })),
  };

  const makeAccount = () => {
    type ConstructorArgs = ConstructorParameters<typeof OsmosisAccountImpl>;
    return new OsmosisAccountImpl(
      base as unknown as ConstructorArgs[0],
      {} as ConstructorArgs[1],
      CHAIN_ID,
      queriesStore as unknown as ConstructorArgs[3]
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    queryPosition.waitFreshResponse.mockResolvedValue(undefined);
    base.simulatePositionMigration
      .mockResolvedValueOnce({
        gasUsed: 1,
        coinsSpent: [],
        events: [positionEvent("withdraw_position", "1000", "2000")],
      })
      .mockResolvedValueOnce({
        gasUsed: 1,
        coinsSpent: [],
        events: [positionEvent("create_position", "1986", "995")],
      });
    base.signAndBroadcast.mockResolvedValue(undefined);
    jest.mocked(makeWithdrawPositionMsg).mockResolvedValue(withdrawMessage);
    jest.mocked(makeSwapExactAmountInMsg).mockResolvedValue(convertMessage);
    jest
      .mocked(makeCreatePositionMsg)
      .mockResolvedValueOnce(probeCreateMessage)
      .mockResolvedValueOnce(protectedCreateMessage);
  });

  it("builds and signs the protected exact-in migration batch in order", async () => {
    const preBroadcastCheck = jest.fn().mockResolvedValue(undefined);

    await makeAccount().sendMigrateConcentratedLiquidityPositionMsg(
      "42",
      "3501",
      new Int("-100"),
      new Int("200"),
      1,
      {
        fromDenom: NOBLE_USDC_DENOM,
        toDenom: ALLOYED_USDC_DENOM,
        transmuterPoolId: TRANSMUTER_POOL_ID,
      },
      preBroadcastCheck
    );

    expect(makeWithdrawPositionMsg).toHaveBeenCalledWith({
      positionId: BigInt(42),
      sender: ADDRESS,
      // Dec renders at full 18-decimal precision; the chain parses the
      // LegacyDec string exactly as the live migrations sent it.
      liquidityAmount: "123456.000000000000000000",
    });
    expect(makeSwapExactAmountInMsg).toHaveBeenCalledWith({
      pools: [{ id: TRANSMUTER_POOL_ID, tokenOutDenom: ALLOYED_USDC_DENOM }],
      tokenIn: { coinMinimalDenom: NOBLE_USDC_DENOM, amount: "1990" },
      tokenOutMinAmount: "1986",
      userOsmoAddress: ADDRESS,
    });
    expect(makeCreatePositionMsg).toHaveBeenNthCalledWith(1, {
      poolId: BigInt(3501),
      lowerTick: BigInt(-100),
      upperTick: BigInt(200),
      sender: ADDRESS,
      tokenMinAmount0: "0",
      tokenMinAmount1: "0",
      tokensProvided: [
        { denom: ALLOYED_USDC_DENOM, amount: "1986" },
        { denom: ASSET_DENOM, amount: "995" },
      ],
    });
    expect(makeCreatePositionMsg).toHaveBeenNthCalledWith(2, {
      poolId: BigInt(3501),
      lowerTick: BigInt(-100),
      upperTick: BigInt(200),
      sender: ADDRESS,
      tokenMinAmount0: "1966",
      tokenMinAmount1: "985",
      tokensProvided: [
        { denom: ALLOYED_USDC_DENOM, amount: "1986" },
        { denom: ASSET_DENOM, amount: "995" },
      ],
    });

    expect(preBroadcastCheck).toHaveBeenCalledTimes(1);
    expect(base.signAndBroadcast).toHaveBeenCalledWith(
      CHAIN_ID,
      "clMigratePosition",
      [withdrawMessage, convertMessage, protectedCreateMessage],
      "",
      undefined,
      undefined,
      expect.objectContaining({ onSign: preBroadcastCheck }),
      undefined,
      true
    );

    const txEvents = base.signAndBroadcast.mock.calls[0][6] as {
      onSign: () => Promise<void>;
    };
    await txEvents.onSign();
    expect(preBroadcastCheck).toHaveBeenCalledTimes(2);
  });

  it("refuses before signing when the final safety check fails", async () => {
    const preBroadcastCheck = jest
      .fn()
      .mockRejectedValue(new Error("migration config changed"));

    await expect(
      makeAccount().sendMigrateConcentratedLiquidityPositionMsg(
        "42",
        "3501",
        new Int("-100"),
        new Int("200"),
        1,
        {
          fromDenom: NOBLE_USDC_DENOM,
          toDenom: ALLOYED_USDC_DENOM,
          transmuterPoolId: TRANSMUTER_POOL_ID,
        },
        preBroadcastCheck
      )
    ).rejects.toThrow("migration config changed");

    expect(preBroadcastCheck).toHaveBeenCalledTimes(1);
    expect(base.signAndBroadcast).not.toHaveBeenCalled();
  });
});
