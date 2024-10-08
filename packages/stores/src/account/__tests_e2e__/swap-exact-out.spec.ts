/* eslint-disable */
import {
  deepContained,
  getEventFromTx,
  getLatestQueryPool,
  initAccount,
  RootStore,
  waitAccountLoaded,
} from "../../tests/test-env";
import { Dec, Int, Coin, DecUtils, IntPretty } from "@keplr-wallet/unit";
import { Currency } from "@keplr-wallet/types";
import { estimateSwapExactAmountOut } from "@osmosis-labs/math";
import { ObservableQueryPool } from "../../queries-external/pools";
import { TestOsmosisChainId } from "../../tests/mock-data";

describe("Test Osmosis Swap Exact Amount Out Tx", () => {
  const { accountStore, queriesStore } = new RootStore();
  let queryPool: ObservableQueryPool | undefined;

  let account: ReturnType<(typeof accountStore)["getWallet"]>;
  beforeAll(async () => {
    await initAccount(accountStore, TestOsmosisChainId);
    account = accountStore.getWallet(TestOsmosisChainId);
    await waitAccountLoaded(account);
  });

  beforeEach(async () => {
    // And prepare the pool
    await account?.osmosis.sendCreateBalancerPoolMsg("0", [
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
      {
        weight: "300",
        token: {
          currency: {
            coinDenom: "ION",
            coinMinimalDenom: "uion",
            coinDecimals: 6,
          },
          amount: "100",
        },
      },
    ]);

    queryPool = await getLatestQueryPool(TestOsmosisChainId, queriesStore);
  });

  test("should fail with unregistered pool asset", async () => {
    const account = accountStore.getWallet(TestOsmosisChainId);

    await expect(
      new Promise((resolve, reject) => {
        account?.osmosis
          .sendSwapExactAmountOutMsg(
            [{ id: queryPool!.id, tokenInDenom: "uion" }],
            {
              coinMinimalDenom: "ucan",
              amount: "1",
            },
            "10",
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

  test("should fail with unregistered pool asset (2)", async () => {
    const account = accountStore.getWallet(TestOsmosisChainId);

    await expect(
      new Promise((resolve, reject) => {
        account?.osmosis
          .sendSwapExactAmountOutMsg(
            [{ id: queryPool!.id, tokenInDenom: "ukwon" }],
            {
              coinMinimalDenom: "udo",
              amount: "1",
            },
            "10",
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

  test("succeed with no max slippage", async () => {
    const account = accountStore.getWallet(TestOsmosisChainId);

    const tokenInCurrency = {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
    };
    const tokenOut = {
      coinMinimalDenom: "uion",
      amount: "1",
    };

    const estimated = await estimateSwapExactOut(
      queryPool!,
      tokenInCurrency,
      tokenOut
    );

    const tx = await new Promise<any>((resolve, reject) => {
      account?.osmosis
        .sendSwapExactAmountOutMsg(
          [
            {
              id: queryPool!.id,
              tokenInDenom: tokenInCurrency.coinMinimalDenom,
            },
          ],
          tokenOut,
          estimated.tokenIn
            .toDec()
            .mul(
              DecUtils.getTenExponentNInPrecisionRange(
                tokenInCurrency.coinDecimals
              )
            )
            .mul(new Dec(1))
            .truncate()
            .toString(),
          undefined,
          undefined,
          (tx) => {
            if (tx.code) reject(tx.rawLog);
            else resolve(tx);
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
            value: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut",
          },
          { key: "module", value: "poolmanager" },
          {
            key: "sender",
            value: account?.address,
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
              estimated.tokenIn
                .toDec()
                .mul(
                  DecUtils.getTenExponentNInPrecisionRange(
                    tokenInCurrency.coinDecimals
                  )
                )
                .truncate()
                .toString() + tokenInCurrency.coinMinimalDenom,
          },
        ],
      },
      getEventFromTx(tx, "transfer")
    );
  });

  test("succeed with slippage", async () => {
    const account = accountStore.getWallet(TestOsmosisChainId);

    const tokenInCurrency = {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
    };
    const tokenOut = {
      coinMinimalDenom: "uion",
      amount: "1",
    };

    const estimated = await estimateSwapExactOut(
      queryPool!,
      tokenInCurrency,
      tokenOut
    );

    const slippageTolerance = new Dec(0.01);

    const tx = await new Promise<any>((resolve, reject) => {
      account?.osmosis
        .sendSwapExactAmountOutMsg(
          [
            {
              id: queryPool!.id,
              tokenInDenom: tokenInCurrency.coinMinimalDenom,
            },
          ],
          tokenOut,
          estimated.tokenIn
            .toDec()
            .mul(
              DecUtils.getTenExponentNInPrecisionRange(
                tokenInCurrency.coinDecimals
              )
            )
            .mul(new Dec(1).add(slippageTolerance))
            .truncate()
            .toString(),
          undefined,
          undefined,
          (tx) => {
            if (tx.code) reject(tx.rawLog);
            else resolve(tx);
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
            value: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut",
          },
          { key: "module", value: "poolmanager" },
          {
            key: "sender",
            value: account?.address,
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
              estimated.tokenIn
                .toDec()
                .mul(
                  DecUtils.getTenExponentNInPrecisionRange(
                    tokenInCurrency.coinDecimals
                  )
                )
                .truncate()
                .toString() + tokenInCurrency.coinMinimalDenom,
          },
        ],
      },
      getEventFromTx(tx, "transfer")
    );
  });

  test("succeed with exactly matched slippage and max slippage", async () => {
    const account = accountStore.getWallet(TestOsmosisChainId);

    const tokenInCurrency = {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
    };
    const tokenOut = {
      coinMinimalDenom: "uion",
      amount: "1",
    };

    const estimated = await estimateSwapExactOut(
      queryPool!,
      tokenInCurrency,
      tokenOut
    );

    expect(estimated.priceImpact.toDec().gt(new Dec(0))).toBeTruthy();

    const tx = await new Promise<any>((resolve, reject) => {
      account?.osmosis
        .sendSwapExactAmountOutMsg(
          [
            {
              id: queryPool!.id,
              tokenInDenom: tokenInCurrency.coinMinimalDenom,
            },
          ],
          tokenOut,
          estimated.tokenIn.toCoin().amount,
          undefined,
          undefined,
          (tx) => {
            if (tx.code) reject(tx.rawLog);
            else resolve(tx);
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
            value: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut",
          },
          { key: "module", value: "poolmanager" },
          {
            key: "sender",
            value: account?.address,
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
              estimated.tokenIn
                .toDec()
                .mul(
                  DecUtils.getTenExponentNInPrecisionRange(
                    tokenInCurrency.coinDecimals
                  )
                )
                .truncate()
                .toString() + tokenInCurrency.coinMinimalDenom,
          },
        ],
      },
      getEventFromTx(tx, "transfer")
    );
  });

  test("should fail with more max price impact than calculated price impact", async () => {
    const account = accountStore.getWallet(TestOsmosisChainId);

    const tokenInCurrency = {
      coinDenom: "OSMO",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
    };
    const tokenOut = {
      coinMinimalDenom: "uion",
      amount: "1",
    };

    const estimated = await estimateSwapExactOut(
      queryPool!,
      tokenInCurrency,
      tokenOut
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
        account?.osmosis
          .sendSwapExactAmountOutMsg(
            [
              {
                id: queryPool!.id,
                tokenInDenom: tokenInCurrency.coinMinimalDenom,
              },
            ],
            tokenOut,
            "10",
            undefined,
            undefined,
            (tx) => {
              if (tx.code) reject(tx.rawLog);
              else resolve(tx);
            }
          )
          .catch(reject);
      })
    ).rejects.not.toBeNull();
  });
});

async function estimateSwapExactOut(
  queryPool: ObservableQueryPool,
  tokenInCurrency: Currency,
  tokenOut: { coinMinimalDenom: string; amount: string }
) {
  await queryPool.waitFreshResponse();
  const inPoolAsset = queryPool.getPoolAsset(tokenInCurrency.coinMinimalDenom);
  const outPoolAsset = queryPool.getPoolAsset(tokenOut.coinMinimalDenom);
  const inPoolAssetWeight = queryPool.weightedPoolInfo?.assets
    .find(({ denom }) => denom === inPoolAsset.amount.currency.coinMinimalDenom)
    ?.weight.locale(false);
  const outPoolAssetWeight = queryPool.weightedPoolInfo?.assets
    .find(
      ({ denom }) => denom === outPoolAsset.amount.currency.coinMinimalDenom
    )
    ?.weight.locale(false);
  const poolAssets = queryPool.stableSwapInfo
    ? queryPool.stableSwapInfo.assets
    : [];

  return estimateSwapExactAmountOut(
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
      tokenOut.coinMinimalDenom,
      new Dec(tokenOut.amount).truncate().toString()
    ),
    tokenInCurrency
  );
}
