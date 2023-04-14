/* eslint-disable */
import {
  chainId,
  deepContained,
  getEventFromTx,
  RootStore,
  waitAccountLoaded,
} from "../../__tests_e2e__/test-env";
import { Dec, DecUtils, Int, IntPretty, Coin } from "@keplr-wallet/unit";
import { Currency } from "@keplr-wallet/types";
import { estimateSwapExactAmountIn } from "@osmosis-labs/math";
import { ObservableQueryPool } from "src/queries";

jest.setTimeout(60000);

describe("Test Osmosis Swap Exact Amount In Tx", () => {
  let { accountStore, queriesStore } = new RootStore();
  let queryPool: ObservableQueryPool | undefined;

  beforeEach(async () => {
    const account = accountStore.getAccount(chainId);
    account.cosmos.broadcastMode = "block";
    await waitAccountLoaded(account);

    // And prepare the pool
    await new Promise<any>((resolve, reject) => {
      account.osmosis
        .sendCreateBalancerPoolMsg(
          "0",
          [
            {
              weight: "100",
              token: {
                currency: {
                  coinDenom: "ION",
                  coinMinimalDenom: "uion",
                  coinDecimals: 6,
                },
                amount: "100",
              },
            },
            {
              weight: "200",
              token: {
                currency: {
                  coinDenom: "OSMO",
                  coinMinimalDenom: "uosmo",
                  coinDecimals: 6,
                },
                amount: "100",
              },
            },
          ],
          "",
          (tx) => {
            resolve(tx);
          }
        )
        .catch(reject);
    });

    // refresh stores
    await queriesStore
      .get(chainId)
      .osmosis!.queryGammNumPools.waitFreshResponse();
    await queriesStore.get(chainId).osmosis!.queryGammPools.waitFreshResponse();

    // set poolId
    const numPools =
      queriesStore.get(chainId).osmosis!.queryGammNumPools.numPools;
    const poolId = numPools.toString();

    // get query pool
    queryPool = queriesStore
      .get(chainId)
      .osmosis!.queryGammPools.getPool(poolId);
  });

  test("should fail with unregistered pool asset", async () => {
    const account = accountStore.getAccount(chainId);

    await expect(
      account.osmosis.sendSwapExactAmountInMsg(
        queryPool!.id,
        {
          currency: {
            coinDenom: "ION",
            coinMinimalDenom: "uion",
            coinDecimals: 6,
          },
          amount: "10",
        },
        {
          coinDenom: "BAR",
          coinMinimalDenom: "ubar",
          coinDecimals: 6,
        }
      )
    ).rejects.not.toBeNull();
  });

  test("should fail with unregistered pool asset (2)", async () => {
    const account = accountStore.getAccount(chainId);

    await expect(
      account.osmosis.sendSwapExactAmountInMsg(
        queryPool!.id,
        {
          currency: {
            coinDenom: "BAR",
            coinMinimalDenom: "ubar",
            coinDecimals: 6,
          },
          amount: "10",
        },
        {
          coinDenom: "ATOM",
          coinMinimalDenom: "uatom",
          coinDecimals: 6,
        }
      )
    ).rejects.not.toBeNull();
  });

  test("with no max slippage", async () => {
    const account = accountStore.getAccount(chainId);

    const tokenIn = {
      currency: {
        coinDenom: "ION",
        coinMinimalDenom: "uion",
        coinDecimals: 6,
      },
      amount: "1",
    };
    const tokenOutCurrency = {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
    };

    const estimated = await estimateSwapExactIn(
      queryPool!,
      tokenIn,
      tokenOutCurrency
    );

    const tx = await new Promise<any>((resolve, reject) => {
      account.osmosis
        .sendSwapExactAmountInMsg(
          queryPool!.id,
          tokenIn,
          tokenOutCurrency,
          "0",
          "",
          {},
          {},
          (tx) => {
            resolve(tx);
          }
        )
        .catch(reject);
    });

    deepContained(
      {
        type: "message",
        attributes: [
          {
            key: "action",
            value: "/osmosis.gamm.v1beta1.MsgSwapExactAmountIn",
          },
          { key: "module", value: "gamm" },
          {
            key: "sender",
            value: account.bech32Address,
          },
        ],
      },
      getEventFromTx(tx, "message")
    );

    deepContained(
      {
        type: "transfer",
        attributes: [
          { key: "amount", value: "1000000uion" },
          {
            key: "amount",
            value:
              estimated.tokenOut
                .toDec()
                .mul(
                  DecUtils.getTenExponentNInPrecisionRange(
                    tokenOutCurrency.coinDecimals
                  )
                )
                .truncate()
                .toString() + tokenOutCurrency.coinMinimalDenom,
          },
        ],
      },
      getEventFromTx(tx, "transfer")
    );
  });

  test("with price impact", async () => {
    const account = accountStore.getAccount(chainId);

    const tokenIn = {
      currency: {
        coinDenom: "ION",
        coinMinimalDenom: "uion",
        coinDecimals: 6,
      },
      amount: "1",
    };
    const tokenOutCurrency = {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
    };

    const estimated = await estimateSwapExactIn(
      queryPool!,
      tokenIn,
      tokenOutCurrency
    );

    const doubleSlippage = new IntPretty(
      estimated.priceImpact.toDec().mul(new Dec(2))
    )
      .locale(false)
      .maxDecimals(4)
      .trim(true);

    expect(doubleSlippage.toDec().gt(new Dec(0))).toBeTruthy();

    const tx = await new Promise<any>((resolve, reject) => {
      account.osmosis
        .sendSwapExactAmountInMsg(
          queryPool!.id,
          tokenIn,
          tokenOutCurrency,
          doubleSlippage.toString(),
          "",
          {},
          {},
          (tx) => {
            resolve(tx);
          }
        )
        .catch(reject);
    });

    deepContained(
      {
        type: "message",
        attributes: [
          {
            key: "action",
            value: "/osmosis.gamm.v1beta1.MsgSwapExactAmountIn",
          },
          { key: "module", value: "gamm" },
          {
            key: "sender",
            value: account.bech32Address,
          },
        ],
      },
      getEventFromTx(tx, "message")
    );

    deepContained(
      {
        type: "transfer",
        attributes: [
          { key: "amount", value: "1000000uion" },
          {
            key: "amount",
            value:
              estimated.tokenOut
                .toDec()
                .mul(
                  DecUtils.getTenExponentNInPrecisionRange(
                    tokenOutCurrency.coinDecimals
                  )
                )
                .truncate()
                .toString() + tokenOutCurrency.coinMinimalDenom,
          },
        ],
      },
      getEventFromTx(tx, "transfer")
    );
  });

  test("with exactly matched slippage and max slippage", async () => {
    const account = accountStore.getAccount(chainId);

    const tokenIn = {
      currency: {
        coinDenom: "ION",
        coinMinimalDenom: "uion",
        coinDecimals: 6,
      },
      amount: "1",
    };
    const tokenOutCurrency = {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
    };

    const estimated = await estimateSwapExactIn(
      queryPool!,
      tokenIn,
      tokenOutCurrency
    );

    expect(estimated.priceImpact.toDec().gt(new Dec(0))).toBeTruthy();

    const tx = await new Promise<any>((resolve, reject) => {
      account.osmosis
        .sendSwapExactAmountInMsg(
          queryPool!.id,
          tokenIn,
          tokenOutCurrency,
          estimated.priceImpact.maxDecimals(18).toString(),
          "",
          {},
          {},
          (tx) => {
            resolve(tx);
          }
        )
        .catch(reject);
    });

    deepContained(
      {
        type: "message",
        attributes: [
          {
            key: "action",
            value: "/osmosis.gamm.v1beta1.MsgSwapExactAmountIn",
          },
          { key: "module", value: "gamm" },
          {
            key: "sender",
            value: account.bech32Address,
          },
        ],
      },
      getEventFromTx(tx, "message")
    );

    deepContained(
      {
        type: "transfer",
        attributes: [
          { key: "amount", value: "1000000uion" },
          {
            key: "amount",
            value:
              estimated.tokenOut
                .toDec()
                .mul(
                  DecUtils.getTenExponentNInPrecisionRange(
                    tokenOutCurrency.coinDecimals
                  )
                )
                .truncate()
                .toString() + tokenOutCurrency.coinMinimalDenom,
          },
        ],
      },
      getEventFromTx(tx, "transfer")
    );
  });

  test("should fail with more max price impact than calculated price impact", async () => {
    const account = accountStore.getAccount(chainId);

    const tokenIn = {
      currency: {
        coinDenom: "ION",
        coinMinimalDenom: "uion",
        coinDecimals: 6,
      },
      amount: "1",
    };
    const tokenOutCurrency = {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
    };

    const estimated = await estimateSwapExactIn(
      queryPool!,
      tokenIn,
      tokenOutCurrency
    );

    const added = new IntPretty(
      estimated.priceImpact.toDec().sub(new Dec("0.01"))
    )
      .locale(false)
      .maxDecimals(4);

    expect(estimated.priceImpact.toDec().gt(new Dec(0))).toBeTruthy();
    expect(added.toDec().gt(new Dec(0))).toBeTruthy();

    await expect(
      new Promise<any>((resolve, reject) => {
        account.osmosis
          .sendSwapExactAmountInMsg(
            queryPool!.id,
            tokenIn,
            tokenOutCurrency,
            added.toString(),
            "",
            {},
            {},
            (tx) => {
              resolve(tx);
            }
          )
          .catch(reject);
      })
    ).rejects.not.toBeNull();
  });
});

async function estimateSwapExactIn(
  queryPool: ObservableQueryPool,
  tokenIn: { currency: Currency; amount: string },
  tokenOutCurrency: Currency
) {
  await queryPool.waitFreshResponse();
  const inPoolAsset = queryPool.getPoolAsset(tokenIn.currency.coinMinimalDenom);
  const outPoolAsset = queryPool.getPoolAsset(
    tokenOutCurrency.coinMinimalDenom
  );
  const inPoolAssetWeight = queryPool.weightedPoolInfo?.assets.find(
    ({ denom }) => denom === inPoolAsset.amount.currency.coinMinimalDenom
  )?.weight;
  const outPoolAssetWeight = queryPool.weightedPoolInfo?.assets.find(
    ({ denom }) => denom === outPoolAsset.amount.currency.coinMinimalDenom
  )?.weight;
  const poolAssets = queryPool?.stableSwapInfo
    ? queryPool.stableSwapInfo.assets
    : [];
  return estimateSwapExactAmountIn(
    {
      inPoolAsset: {
        ...inPoolAsset.amount.currency,
        amount: new Int(inPoolAsset.amount.toCoin().amount),
        weight: inPoolAssetWeight
          ? new Int(inPoolAssetWeight.toString())
          : undefined,
      },
      outPoolAsset: {
        denom: outPoolAsset.amount.currency.coinMinimalDenom,
        amount: new Int(outPoolAsset.amount.toCoin().amount),
        weight: outPoolAssetWeight
          ? new Int(outPoolAsset.toString())
          : undefined,
      },
      poolAssets,
      swapFee: queryPool.swapFee.toDec(),
    },
    new Coin(
      tokenIn.currency.coinMinimalDenom,
      new Dec(tokenIn.amount)
        .mul(
          DecUtils.getTenExponentNInPrecisionRange(
            tokenIn.currency.coinDecimals
          )
        )
        .truncate()
        .toString()
    ),
    tokenOutCurrency
  );
}
