/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Currency } from "@keplr-wallet/types";
import { Coin, Dec, DecUtils, Int, IntPretty } from "@keplr-wallet/unit";
import { estimateSwapExactAmountIn } from "@osmosis-labs/math";
import { OptimizedRoutes } from "@osmosis-labs/pools";
import { when } from "mobx";

import {
  chainId,
  deepContained,
  getEventFromTx,
  getLatestQueryPool,
  RootStore,
  waitAccountLoaded,
} from "../../__tests_e2e__/test-env";
import { ObservableQueryPool } from "../../queries";

describe("Test Osmosis Swap Exact Amount In Tx", () => {
  const { accountStore, queriesStore } = new RootStore();
  let queryPool: ObservableQueryPool | undefined;

  beforeEach(async () => {
    const account = accountStore.getAccount(chainId);
    account.cosmos.broadcastMode = "sync";
    await waitAccountLoaded(account);

    // And prepare the pool
    await account.osmosis.sendCreateBalancerPoolMsg(
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
      ""
    );

    queryPool = await getLatestQueryPool(chainId, queriesStore);
  });

  test("should fail with unregistered pool asset", async () => {
    const account = accountStore.getAccount(chainId);

    await expect(
      new Promise((resolve, reject) => {
        account.osmosis.sendSwapExactAmountInMsg(
          [{ id: queryPool!.id, tokenOutDenom: "ubar" }],
          {
            currency: {
              coinDenom: "FOO",
              coinMinimalDenom: "ufoo",
              coinDecimals: 6,
            },
            amount: "10",
          },
          "1",
          undefined,
          undefined,
          undefined,
          (tx) => {
            if (tx.code) reject(tx);
            else resolve(tx);
          }
        );
      })
    ).rejects.not.toBeNull();
  });

  test("should fail with unregistered pool asset (2)", async () => {
    const account = accountStore.getAccount(chainId);

    await expect(
      new Promise((resolve, reject) => {
        account.osmosis.sendSwapExactAmountInMsg(
          [{ id: queryPool!.id, tokenOutDenom: "uatom" }],
          {
            currency: {
              coinDenom: "ION",
              coinMinimalDenom: "uion",
              coinDecimals: 6,
            },
            amount: "10",
          },
          "1",
          undefined,
          undefined,
          undefined,
          (tx) => {
            if (tx.code) reject(tx);
            else resolve(tx);
          }
        );
      })
    ).rejects.not.toBeNull();
  });

  test("succeed with no max slippage - single route", async () => {
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

    const estimated = await estimateSharePoolSwapExactIn(
      queryPool!,
      tokenIn,
      tokenOutCurrency
    );

    const tx = await new Promise<any>((resolve, reject) => {
      account.osmosis
        .sendSwapExactAmountInMsg(
          [
            {
              id: queryPool!.id,
              tokenOutDenom: tokenOutCurrency.coinMinimalDenom,
            },
          ],
          tokenIn,
          "1",
          undefined,
          undefined,
          undefined,
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
            value: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn",
          },
          { key: "module", value: "poolmanager" },
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

  test("succeed with slippage - single route", async () => {
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

    const estimated = await estimateSharePoolSwapExactIn(
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
          [
            {
              id: queryPool!.id,
              tokenOutDenom: tokenOutCurrency.coinMinimalDenom,
            },
          ],
          tokenIn,
          "1",
          undefined,
          undefined,
          undefined,
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
            value: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn",
          },
          { key: "module", value: "poolmanager" },
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

  test("with exactly matched slippage and max slippage - single route", async () => {
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

    const estimated = await estimateSharePoolSwapExactIn(
      queryPool!,
      tokenIn,
      tokenOutCurrency
    );

    expect(estimated.priceImpact.toDec().gt(new Dec(0))).toBeTruthy();

    const tx = await new Promise<any>((resolve, reject) => {
      account.osmosis
        .sendSwapExactAmountInMsg(
          [
            {
              id: queryPool!.id,
              tokenOutDenom: tokenOutCurrency.coinMinimalDenom,
            },
          ],
          tokenIn,
          "1",
          undefined,
          undefined,
          undefined,
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
            value: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn",
          },
          { key: "module", value: "poolmanager" },
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

  test("should fail with more max price impact than calculated price impact - single route", async () => {
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

    const estimated = await estimateSharePoolSwapExactIn(
      queryPool!,
      tokenIn,
      tokenOutCurrency
    );

    const slippageTolerance = new Dec("0.01");

    const added = new IntPretty(
      estimated.priceImpact.toDec().sub(slippageTolerance)
    )
      .locale(false)
      .maxDecimals(4);

    // should be positive values
    expect(estimated.priceImpact.toDec().gt(new Dec(0))).toBeTruthy();
    expect(added.toDec().gt(new Dec(0))).toBeTruthy();

    const outWithLess = estimated.tokenOut
      .moveDecimalPointRight(tokenOutCurrency.coinDecimals)
      .toDec()
      .mul(new Dec(1).sub(slippageTolerance));

    await expect(
      new Promise<any>((resolve, reject) => {
        account.osmosis
          .sendSwapExactAmountInMsg(
            [
              {
                id: queryPool!.id,
                tokenOutDenom: tokenOutCurrency.coinMinimalDenom,
              },
            ],
            tokenIn,
            outWithLess.toString(),
            undefined,
            undefined,
            undefined,
            (tx) => {
              if (tx.code) reject(tx);
              else resolve(tx);
            }
          )
          .catch(reject);
      })
    ).rejects.not.toBeNull();
  });

  test("succeed without slippage - split route 2 pools", async () => {
    // create an additional pool (exactly the same as beforeEach pool)
    const account = accountStore.getAccount(chainId);
    account.cosmos.broadcastMode = "sync";
    await waitAccountLoaded(account);
    await account.osmosis.sendCreateBalancerPoolMsg(
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
      ""
    );

    const pool2 = await getLatestQueryPool(chainId, queriesStore);

    // ION > OSMO via router
    const routablePools = [queryPool!, pool2].map(({ pool }) => pool);
    const router = new OptimizedRoutes({
      pools: routablePools,
      incentivizedPoolIds: [],
      stakeCurrencyMinDenom: "ufoo",
      preferredPoolIds: [pool2.id], // add second pool as preferred so it must split
      getPoolTotalValueLocked: () => new Dec(0),
    });

    const tokenIn = {
      currency: {
        coinDenom: "ION",
        coinMinimalDenom: "uion",
        coinDecimals: 6,
      },
      amount: "10000", // amount is base denominated
    };
    const tokenOutCurrency = {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
    };

    const { amount, split } = await router.routeByTokenIn(
      {
        denom: tokenIn.currency.coinMinimalDenom,
        amount: new Int(tokenIn.amount),
      },
      tokenOutCurrency.coinMinimalDenom
    );

    const tx = await new Promise<any>((resolve, reject) => {
      account.osmosis
        .sendSplitRouteSwapExactAmountInMsg(
          split.map((route) => ({
            pools: route.pools.map(({ id }, index) => ({
              id,
              tokenOutDenom: route.tokenOutDenoms[index],
            })),
            tokenInAmount: route.initialAmount.toString(),
          })),
          tokenIn,
          amount.toString(),
          undefined,
          undefined,
          undefined,
          (tx) => {
            if (tx.code) reject(tx);
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
            value:
              "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn",
          },
          { key: "module", value: "poolmanager" },
          {
            key: "sender",
            value: account.bech32Address,
          },
        ],
      },
      getEventFromTx(tx, "message")
    );

    // since this is a split route, there are two transfers that occur for the two pools
    // it appears the router does a 90 / 10 split for pool 1 / 2
    deepContained(
      {
        type: "transfer",
        attributes: [
          {
            key: "amount",
            value:
              split[0].initialAmount.toString() +
              tokenIn.currency.coinMinimalDenom,
          },
          {
            key: "amount",
            value:
              new Dec(amount).mul(new Dec(0.9)).roundUp().toString() +
              tokenOutCurrency.coinMinimalDenom,
          },
          {
            key: "amount",
            value:
              split[1].initialAmount.toString() +
              tokenIn.currency.coinMinimalDenom,
          },
          {
            key: "amount",
            value:
              new Dec(amount).mul(new Dec(0.1)).truncate().toString() +
              tokenOutCurrency.coinMinimalDenom,
          },
        ],
      },
      getEventFromTx(tx, "transfer")
    );
  });
});

async function estimateSharePoolSwapExactIn(
  queryPool: ObservableQueryPool,
  tokenIn: { currency: Currency; amount: string },
  tokenOutCurrency: Currency
) {
  queryPool.waitFreshResponse();
  await when(() => !queryPool.isFetching);

  const inPoolAsset = queryPool.getPoolAsset(tokenIn.currency.coinMinimalDenom);
  const outPoolAsset = queryPool.getPoolAsset(
    tokenOutCurrency.coinMinimalDenom
  );
  const inPoolAssetWeight = queryPool.weightedPoolInfo?.assets
    .find(({ denom }) => denom === inPoolAsset.amount.currency.coinMinimalDenom)
    ?.weight.locale(false);
  const outPoolAssetWeight = queryPool.weightedPoolInfo?.assets
    .find(
      ({ denom }) => denom === outPoolAsset.amount.currency.coinMinimalDenom
    )
    ?.weight.locale(false);
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
          ? new Int(outPoolAssetWeight.toString())
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
