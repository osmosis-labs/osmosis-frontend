import { EncodeObject } from "@cosmjs/proto-signing";
import { StdFee } from "@cosmjs/stargate";
import {
  ChainGetter,
  CosmosQueries,
  IQueriesStore,
} from "@keplr-wallet/stores";
import { BondStatus } from "@keplr-wallet/stores/build/query/cosmos/staking/types";
import { Currency, KeplrSignOptions } from "@keplr-wallet/types";
import { Coin, CoinPretty, Dec, DecUtils, Int } from "@keplr-wallet/unit";
import * as WeightedPoolEstimates from "@osmosis-labs/math";
import * as PoolMath from "@osmosis-labs/math";
import deepmerge from "deepmerge";
import Long from "long";
import { DeepPartial } from "utility-types";

import { AccountStore, CosmosAccount, CosmwasmAccount } from "../../account";
import { OsmosisQueries } from "../../queries";
import { osmosisMsgOpts } from "./types";

export interface OsmosisAccount {
  osmosis: OsmosisAccountImpl;
}

export const OsmosisAccount = {
  use(options: {
    msgOptsCreator?: (
      chainId: string
    ) => DeepPartial<typeof osmosisMsgOpts> | undefined;
    queriesStore: IQueriesStore<CosmosQueries & OsmosisQueries>;
  }): (
    base: AccountStore<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>,
    chainGetter: ChainGetter,
    chainId: string
  ) => OsmosisAccount {
    return (base, chainGetter, chainId) => {
      const msgOptsFromCreator = options.msgOptsCreator
        ? options.msgOptsCreator(chainId)
        : undefined;

      return {
        osmosis: new OsmosisAccountImpl(
          base,
          chainGetter,
          chainId,
          options.queriesStore,
          deepmerge<typeof osmosisMsgOpts, DeepPartial<typeof osmosisMsgOpts>>(
            osmosisMsgOpts,
            msgOptsFromCreator ? msgOptsFromCreator : {}
          )
        ),
      };
    };
  },
};

export class OsmosisAccountImpl {
  constructor(
    protected readonly base: AccountStore<any>,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: IQueriesStore<
      CosmosQueries & OsmosisQueries
    >,
    protected readonly msgOpts: typeof osmosisMsgOpts
  ) {}

  private get address() {
    return this.base.getWallet(this.chainId)?.address ?? "";
  }

  /**
   * Create balancer/weighted pool.
   * @param swapFee The swap fee of the pool. Should set as the percentage. (Ex. 10% -> 10)
   * @param assets Assets that will be provided to the pool initially, with weights. Token can be parsed as to primitive by convenience. `amount`s are not in micro.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fulfillment.
   */
  async sendCreateBalancerPoolMsg(
    swapFee: string,
    assets: {
      // Int
      weight: string;
      // Ex) 10 atom.
      token: {
        currency: Currency;
        amount: string;
      };
    }[],
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const poolAssets: {
      weight: string;
      token: {
        denom: string;
        amount: string;
      };
    }[] = [];

    for (const asset of assets) {
      poolAssets.push({
        weight: asset.weight,
        token: {
          denom: asset.token.currency.coinMinimalDenom,
          amount: new Dec(asset.token.amount)
            .mul(
              DecUtils.getTenExponentNInPrecisionRange(
                asset.token.currency.coinDecimals
              )
            )
            .truncate()
            .toString(),
        },
      });
    }

    const msg = this.msgOpts.createBalancerPool.messageComposer({
      futurePoolGovernor: "24h",
      poolAssets,
      sender: this.address,
      poolParams: {
        swapFee: new Dec(swapFee)
          .quo(DecUtils.getTenExponentNInPrecisionRange(2))
          .toString(),
        exitFee: new Dec(0).toString(),
      },
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "createBalancerPool",
      [msg],
      memo,
      {
        amount: [],
        gas: this.msgOpts.createBalancerPool.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          this.queries.queryGammPools.waitFreshResponse();
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((bal) => {
              if (
                assets.find(
                  (asset) =>
                    asset.token.currency.coinMinimalDenom ===
                    bal.currency.coinMinimalDenom
                )
              ) {
                bal.waitFreshResponse();
              }
            });
        }

        onFulfill?.(tx);
      }
    );
  }

  /**
   * Create stableswap pool.
   * @param swapFee The swap fee of the pool. Should set as the percentage. (Ex. 10% -> 10)
   * @param assets Assets that will be provided to the pool initially, with scaling factors. Token can be parsed as to primitive by convenience. `amount`s are not in micro.
   * @param memo Transaction memo.
   * @param scalingFactorControllerAddress Osmo address of account permitted to change scaling factors later.
   * @param onFulfill Callback to handle tx fulfillment.
   */
  async sendCreateStableswapPoolMsg(
    swapFee: string,
    assets: {
      scalingFactor: number;
      // Ex) 10 atom.
      token: {
        currency: Currency;
        amount: string;
      };
    }[],
    scalingFactorControllerAddress?: string,
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const poolParams = {
      swapFee: new Dec(swapFee)
        .quo(DecUtils.getTenExponentNInPrecisionRange(2))
        .toString(),
      exitFee: new Dec(0).toString(),
    };

    const initialPoolLiquidity: {
      denom: string;
      amount: string;
    }[] = [];

    /** Denom -> Long(scalingFactor) */
    const scalingFactorsMap: Map<string, Long> = new Map<string, Long>();

    for (const asset of assets) {
      initialPoolLiquidity.push({
        denom: asset.token.currency.coinMinimalDenom,
        amount: new Dec(asset.token.amount)
          .mul(
            DecUtils.getTenExponentNInPrecisionRange(
              asset.token.currency.coinDecimals
            )
          )
          .truncate()
          .toString(),
      });
      scalingFactorsMap.set(
        asset.token.currency.coinMinimalDenom,
        new Long(asset.scalingFactor)
      );
    }

    // sort initial liquidity and scaling factors to pass chain encoding check
    // chain does this to make sure that index of scaling factors is consistent with token indexes
    initialPoolLiquidity.sort((a, b) => a.denom.localeCompare(b.denom));
    const sortedScalingFactors: Long[] = [];
    initialPoolLiquidity.forEach((asset) => {
      const scalingFactor = scalingFactorsMap.get(asset.denom);
      if (!scalingFactor) {
        throw new Error(
          `Scaling factor for asset ${asset.denom} missing in scalingFactorsMap`
        );
      }

      sortedScalingFactors.push(scalingFactor);
    });

    const msg = this.msgOpts.createStableswapPool.messageComposer({
      sender: this.address,
      futurePoolGovernor: "24h",
      scalingFactors: sortedScalingFactors,
      initialPoolLiquidity,
      scalingFactorController: scalingFactorControllerAddress ?? "",
      poolParams,
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "createStableswapPool",
      [msg],
      memo,
      {
        amount: [],
        gas: this.msgOpts.createStableswapPool.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          this.queries.queryGammPools.waitFreshResponse();
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((bal) => {
              if (
                assets.find(
                  (asset) =>
                    asset.token.currency.coinMinimalDenom ===
                    bal.currency.coinMinimalDenom
                )
              ) {
                bal.waitFreshResponse();
              }
            });
        }

        onFulfill?.(tx);
      }
    );
  }

  /**
   * Join pool with multiple assets.
   *
   * https://docs.osmosis.zone/developing/modules/spec-gamm.html#join-pool
   * @param poolId Id of pool.
   * @param shareOutAmount LP share amount.
   * @param maxSlippage Max tolerated slippage. Default: 2.5.
   * @param memo Memo attachment.
   * @param onFulfill Callback to handle tx fulfillment.
   */
  async sendJoinPoolMsg(
    poolId: string,
    shareOutAmount: string,
    maxSlippage: string = "2.5",
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const queries = this.queries;
    const mkp = this.makeCoinPretty;

    await this.base.signAndBroadcast(
      this.chainId,
      "joinPool",
      async () => {
        const queryPool = queries.queryGammPools.getPool(poolId);

        if (!queryPool) {
          throw new Error(`Pool #${poolId} not found`);
        }

        await queryPool.waitFreshResponse();

        const pool = queryPool.pool;
        if (!pool) {
          throw new Error("Unknown pool");
        }

        const maxSlippageDec = new Dec(maxSlippage).quo(
          DecUtils.getTenExponentNInPrecisionRange(2)
        );

        const estimated = WeightedPoolEstimates.estimateJoinSwap(
          pool,
          pool.poolAssets,
          mkp,
          shareOutAmount,
          this.msgOpts.joinPool.shareCoinDecimals
        );

        const tokenInMaxs = maxSlippageDec.equals(new Dec(0))
          ? []
          : estimated.tokenIns.map((tokenIn) => {
              // TODO: Add the method like toPrimitiveCoin()?
              const dec = tokenIn.toDec();
              const amount = dec
                .mul(
                  DecUtils.getTenExponentNInPrecisionRange(
                    tokenIn.currency.coinDecimals
                  )
                )
                .mul(new Dec(1).add(maxSlippageDec))
                .truncate();

              return {
                denom: tokenIn.currency.coinMinimalDenom,
                amount: amount.toString(),
              };
            });

        const msg = this.msgOpts.joinPool.messageComposer({
          poolId: Long.fromString(poolId),
          sender: this.address,
          shareOutAmount: new Dec(shareOutAmount)
            .mul(
              DecUtils.getTenExponentNInPrecisionRange(
                this.msgOpts.joinPool.shareCoinDecimals
              )
            )
            .truncate()
            .toString(),
          tokenInMaxs: tokenInMaxs,
        });

        return [msg];
      },
      memo,
      {
        amount: [],
        gas: this.msgOpts.joinPool.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((bal) => {
              // TODO: Explicitly refresh the share expected to be minted and provided to the pool.
              bal.waitFreshResponse();
            });

          this.queries.queryGammPools.getPool(poolId)?.waitFreshResponse();
        }

        onFulfill?.(tx);
      }
    );
  }

  /**
   * Join pool with only one asset with a weighted pool.
   *
   * https://docs.osmosis.zone/developing/modules/spec-gamm.html#join-swap-extern-amount-in
   * @param poolId Id of pool to swap within.
   * @param tokenIn Token being swapped in. `tokenIn.amount` is NOT in micro amount.
   * @param maxSlippage Max tolerated slippage. Default: 2.5.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fullfillment.
   */
  async sendJoinSwapExternAmountInMsg(
    poolId: string,
    tokenIn: { currency: Currency; amount: string },
    maxSlippage: string = "2.5",
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const queries = this.queries;

    await this.base.signAndBroadcast(
      this.chainId,
      "joinPool",
      async () => {
        const queryPool = queries.queryGammPools.getPool(poolId);

        if (!queryPool) {
          throw new Error(`Pool #${poolId} not found`);
        }

        await queryPool.waitFreshResponse();

        const pool = queryPool.pool;
        if (!pool) {
          throw new Error("Unknown pool");
        }

        const totalWeight = queryPool.weightedPoolInfo?.totalWeight;
        if (!totalWeight) {
          throw new Error("Must be weighted pool");
        }

        const poolAsset = queryPool.getPoolAsset(
          tokenIn.currency.coinMinimalDenom
        );

        const poolAssetWeight = queryPool.weightedPoolInfo?.assets.find(
          (asset) => asset.denom === poolAsset.amount.currency.coinMinimalDenom
        )?.weight;
        if (!poolAssetWeight) {
          throw new Error("Pool asset not weighted");
        }

        const estimated = WeightedPoolEstimates.estimateJoinSwapExternAmountIn(
          {
            amount: new Int(poolAsset.amount.toCoin().amount),
            weight: new Int(poolAssetWeight.toDec().truncate().toString()),
          },
          {
            totalShare: pool.totalShare,
            totalWeight: new Int(totalWeight.toDec().truncate().toString()),
            swapFee: pool.swapFee,
          },
          tokenIn,
          this.msgOpts.joinPool.shareCoinDecimals
        );

        const amount = new Dec(tokenIn.amount)
          .mul(
            DecUtils.getTenExponentNInPrecisionRange(
              tokenIn.currency.coinDecimals
            )
          )
          .truncate();
        const coin = new Coin(tokenIn.currency.coinMinimalDenom, amount);

        const outRatio = new Dec(1).sub(new Dec(maxSlippage).quo(new Dec(100))); // not outRatio
        const shareOutMinAmount = estimated.shareOutAmountRaw
          .toDec()
          .mul(outRatio)
          .truncate();

        const msg = this.msgOpts.joinSwapExternAmountIn.messageComposer({
          poolId: Long.fromString(poolId),
          sender: this.address,
          tokenIn: {
            denom: coin.denom,
            amount: coin.amount.toString(),
          },
          shareOutMinAmount: shareOutMinAmount.toString(),
        });

        return [msg];
      },
      memo,
      {
        amount: [],
        gas: this.msgOpts.joinPool.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((bal) => {
              bal.waitFreshResponse();
            });
          this.queries.queryGammPools.getPool(poolId)?.waitFreshResponse();
        }

        onFulfill?.(tx);
      }
    );
  }

  /**
   * Perform multiple swaps that are routed through multiple pools, with a desired input token.
   *
   * https://docs.osmosis.zone/developing/modules/spec-gamm.html#swap-exact-amount-in
   * @param routes Desired pools to swap through.
   * @param tokenIn Token being swapped.
   * @param tokenOutMinAmount Min amount of out token.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fullfillment.
   */
  async sendMultihopSwapExactAmountInMsg(
    routes: {
      poolId: string;
      tokenOutCurrency: Currency;
    }[],
    tokenIn: { currency: Currency; amount: string },
    tokenOutMinAmount: string,
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    signOptions?: KeplrSignOptions,
    onFulfill?: (tx: any) => void
  ) {
    await this.base.signAndBroadcast(
      this.chainId,
      "swapExactAmountIn",
      async () => {
        const msg = this.msgOpts.swapExactAmountIn.messageComposer({
          sender: this.address,
          routes: routes.map((route) => ({
            poolId: Long.fromString(route.poolId),
            tokenOutDenom: route.tokenOutCurrency.coinMinimalDenom,
          })),
          tokenOutMinAmount: tokenOutMinAmount.toString(),
          tokenIn: {
            denom: tokenIn.currency.coinMinimalDenom,
            amount: tokenIn.amount.toString(),
          },
        });

        return [msg];
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas:
          stdFee.gas ??
          (
            this.msgOpts.swapExactAmountIn.gas * Math.max(routes.length, 1)
          ).toString(),
      },
      signOptions,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((bal) => {
              if (
                bal.currency.coinMinimalDenom ===
                  tokenIn.currency.coinMinimalDenom ||
                routes.find(
                  (r) =>
                    r.tokenOutCurrency.coinMinimalDenom ===
                    bal.currency.coinMinimalDenom
                )
              ) {
                bal.waitFreshResponse();
              }
            });

          routes.forEach(({ poolId }) =>
            queries.osmosis?.queryGammPools.getPool(poolId)?.waitFreshResponse()
          );
        }

        onFulfill?.(tx);
      }
    );
  }

  /**
   * https://docs.osmosis.zone/developing/modules/spec-gamm.html#swap-exact-amount-in
   * @param poolId Id of pool to swap within.
   * @param tokenIn Token being swapped in. `tokenIn.amount` is NOT in micro.
   * @param tokenOutCurrency Currency of outgoing token.
   * @param tokenOutMinAmount Min amount of out token.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fullfillment.
   */
  async sendSwapExactAmountInMsg(
    poolId: string,
    tokenIn: { currency: Currency; amount: string },
    tokenOutCurrency: Currency,
    tokenOutMinAmount: string,
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    signOptions?: KeplrSignOptions,
    onFulfill?: (tx: any) => void
  ) {
    await this.base.signAndBroadcast(
      this.chainId,
      "swapExactAmountIn",
      async () => {
        const msg = this.msgOpts.swapExactAmountIn.messageComposer({
          routes: [
            {
              poolId: Long.fromString(poolId),
              tokenOutDenom: tokenOutCurrency.coinMinimalDenom,
            },
          ],
          tokenIn: {
            denom: tokenIn.currency.coinMinimalDenom,
            amount: tokenIn.amount.toString(),
          },
          sender: this.address,
          tokenOutMinAmount: tokenOutMinAmount.toString(),
        });

        return [msg];
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas: stdFee.gas ?? this.msgOpts.swapExactAmountIn.gas.toString(),
      },
      signOptions,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((bal) => {
              if (
                bal.currency.coinMinimalDenom ===
                  tokenIn.currency.coinMinimalDenom ||
                bal.currency.coinMinimalDenom ===
                  tokenOutCurrency.coinMinimalDenom
              ) {
                bal.waitFreshResponse();
              }
            });

          // Refresh the pool
          this.queries.queryGammPools.getPool(poolId)?.waitFreshResponse();
        }

        onFulfill?.(tx);
      }
    );
  }

  /**
   * https://docs.osmosis.zone/developing/modules/spec-gamm.html#swap-exact-amount-out
   * @param poolId Id of pool to swap within.
   * @param tokenInCurrency Currency of incoming token.
   * @param tokenOut Token being swapped. `tokenIn.amount` is NOT in micro.
   * @param maxSlippage Max amount of tolerated slippage.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fullfillment.
   */
  async sendSwapExactAmountOutMsg(
    poolId: string,
    tokenInCurrency: Currency,
    tokenOut: { currency: Currency; amount: string },
    maxSlippage: string = "0",
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const queries = this.queries;

    await this.base.signAndBroadcast(
      this.chainId,
      "swapExactAmountOut",
      async () => {
        const queryPool = queries.queryGammPools.getPool(poolId);

        if (!queryPool) {
          throw new Error(`Pool #${poolId} not found`);
        }

        const pool = queryPool.pool;
        if (!pool) {
          throw new Error("Unknown pool");
        }

        const inPoolAsset = queryPool.getPoolAsset(
          tokenInCurrency.coinMinimalDenom
        );
        const outPoolAsset = queryPool.getPoolAsset(
          tokenOut.currency.coinMinimalDenom
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

        const outUAmount = new Dec(tokenOut.amount)
          .mul(
            DecUtils.getTenExponentNInPrecisionRange(
              tokenOut.currency.coinDecimals
            )
          )
          .truncate();
        const coin = new Coin(tokenOut.currency.coinMinimalDenom, outUAmount);

        const estimated = PoolMath.estimateSwapExactAmountOut(
          {
            swapFee: pool.swapFee,
            inPoolAsset: {
              ...inPoolAsset.amount.currency,
              amount: new Int(inPoolAsset.amount.toCoin().amount),
              weight: inPoolAssetWeight
                ? new Int(inPoolAssetWeight.toDec().truncate().toString())
                : undefined,
            },
            outPoolAsset: {
              denom: outPoolAsset.amount.currency.coinMinimalDenom,
              amount: new Int(outPoolAsset.amount.toCoin().amount),
              weight: outPoolAssetWeight
                ? new Int(outPoolAssetWeight.toDec().truncate().toString())
                : undefined,
            },
            poolAssets,
          },
          coin,
          tokenInCurrency
        );

        const maxSlippageDec = new Dec(maxSlippage).quo(
          DecUtils.getTenExponentNInPrecisionRange(2)
        );

        const tokenInMaxAmount = maxSlippageDec.equals(new Dec(0))
          ? // TODO: Set exact 2^128 - 1
            new Int(1_000_000_000_000)
          : PoolMath.calcPriceImpactWithAmount(
              estimated.raw.spotPriceBefore,
              outUAmount,
              maxSlippageDec
            );

        const msg = this.msgOpts.swapExactAmountOut.messageComposer({
          sender: this.address,
          routes: [
            {
              poolId: Long.fromString(pool.id),
              tokenInDenom: tokenInCurrency.coinMinimalDenom,
            },
          ],
          tokenOut: {
            denom: coin.denom,
            amount: coin.amount.toString(),
          },
          tokenInMaxAmount: tokenInMaxAmount.toString(),
        });

        return [msg];
      },
      memo,
      {
        amount: [],
        gas: this.msgOpts.swapExactAmountIn.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((bal) => {
              if (
                bal.currency.coinMinimalDenom ===
                  tokenInCurrency.coinMinimalDenom ||
                bal.currency.coinMinimalDenom ===
                  tokenOut.currency.coinMinimalDenom
              ) {
                bal.waitFreshResponse();
              }
            });

          this.queries.queryGammPools.getPool(poolId)?.waitFreshResponse();
        }

        onFulfill?.(tx);
      }
    );
  }

  /**
   * https://docs.osmosis.zone/developing/modules/spec-gamm.html#exit-pool
   * @param poolId Id of pool to exit.
   * @param shareInAmount LP shares to redeem.
   * @param maxSlippage Max tolerated slippage. Default: 2.5.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fullfillment.
   */
  async sendExitPoolMsg(
    poolId: string,
    shareInAmount: string,
    maxSlippage: string = "2.5",
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const queries = this.queries;
    const mkp = this.makeCoinPretty;

    await this.base.signAndBroadcast(
      this.chainId,
      "exitPool",
      async () => {
        const queryPool = queries.queryGammPools.getPool(poolId);

        if (!queryPool) {
          throw new Error(`Pool #${poolId} not found`);
        }

        await queryPool.waitFreshResponse();

        const pool = queryPool.pool;
        if (!pool) {
          throw new Error("Unknown pool");
        }

        const estimated = WeightedPoolEstimates.estimateExitSwap(
          pool,
          mkp,
          shareInAmount,
          this.msgOpts.exitPool.shareCoinDecimals
        );

        const maxSlippageDec = new Dec(maxSlippage).quo(
          DecUtils.getTenExponentNInPrecisionRange(2)
        );

        const tokenOutMins = maxSlippageDec.equals(new Dec(0))
          ? []
          : estimated.tokenOuts.map((tokenOut) => {
              return {
                denom: tokenOut.currency.coinMinimalDenom,
                amount: tokenOut
                  .toDec() // TODO: confirm toDec() respects token dec count
                  .mul(new Dec(1).sub(maxSlippageDec))
                  .mul(
                    DecUtils.getTenExponentNInPrecisionRange(
                      tokenOut.currency.coinDecimals
                    )
                  )
                  .truncate()
                  .toString(),
              };
            });

        const msg = this.msgOpts.exitPool.messageComposer({
          poolId: Long.fromString(pool.id),
          sender: this.address,
          shareInAmount: new Dec(shareInAmount)
            .mul(
              DecUtils.getTenExponentNInPrecisionRange(
                this.msgOpts.exitPool.shareCoinDecimals
              )
            )
            .truncate()
            .toString(),
          tokenOutMins,
        });

        return [msg];
      },
      memo,
      {
        amount: [],
        gas: this.msgOpts.exitPool.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((balance) => balance.waitFreshResponse());

          this.queries.queryGammPools.getPool(poolId)?.waitFreshResponse();
        }

        onFulfill?.(tx);
      }
    );
  }

  /**
   * https://docs.osmosis.zone/developing/modules/spec-lockup.html#lock-tokens
   * @param duration Duration, in seconds, to lock up the tokens.
   * @param tokens Tokens to lock. `amount`s are not in micro.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fullfillment.
   */
  async sendLockTokensMsg(
    duration: number,
    tokens: {
      currency: Currency;
      amount: string;
    }[],
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const primitiveTokens = tokens.map((token) => {
      const amount = new Dec(token.amount)
        .mul(
          DecUtils.getTenExponentNInPrecisionRange(token.currency.coinDecimals)
        )
        .truncate();

      return {
        amount: amount.toString(),
        denom: token.currency.coinMinimalDenom,
      };
    });

    const msg = this.msgOpts.lockTokens.messageComposer({
      owner: this.address,
      coins: primitiveTokens,
      duration: {
        seconds: Long.fromNumber(duration),
        nanos: duration * 1_000_000_000,
      },
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "lockTokens",
      [msg],
      memo,
      {
        amount: [],
        gas: this.msgOpts.lockTokens.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((balance) => balance.waitFreshResponse());

          // Refresh the locked coins
          this.queries.queryLockedCoins.get(this.address).waitFreshResponse();
          this.queries.queryAccountLocked.get(this.address).waitFreshResponse();
        }

        onFulfill?.(tx);
      }
    );
  }

  /** https://docs.osmosis.zone/overview/osmo.html#superfluid-staking
   * @param lockIds Ids of LP bonded locks.
   * @param validatorAddress Bech32 address of validator to delegate to.
   * @param memo Tx memo.
   * @param onFulfill Callback to handle tx fullfillment.
   */
  async sendSuperfluidDelegateMsg(
    lockIds: string[],
    validatorAddress: string,
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const msgs = lockIds.map((lockId) => {
      return this.msgOpts.superfluidDelegate.messageComposer({
        sender: this.address,
        lockId: Long.fromString(lockId),
        valAddr: validatorAddress,
      });
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "superfluidDelegate",
      msgs,
      memo,
      {
        amount: [],
        gas: this.msgOpts.lockAndSuperfluidDelegate.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((balance) => balance.waitFreshResponse());

          queries.osmosis?.queryAccountLocked
            .get(this.address)
            .waitFreshResponse();

          queries.cosmos.queryValidators
            .getQueryStatus(BondStatus.Bonded)
            .waitFreshResponse();

          queries.osmosis?.querySuperfluidDelegations
            .getQuerySuperfluidDelegations(this.address)
            .waitFreshResponse();
        }

        onFulfill?.(tx);
      }
    );
  }

  /** https://docs.osmosis.zone/overview/osmo.html#superfluid-staking
   * @param tokens LP tokens to delegate and lock. `amount`s are not in micro.
   * @param validatorAddress Validator address to delegate to.
   * @param memo Tx memo.
   * @param onFulfill Callback to handle tx fullfillment.
   */
  async sendLockAndSuperfluidDelegateMsg(
    tokens: {
      currency: Currency;
      amount: string;
    }[],
    validatorAddress: string,
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const primitiveTokens = tokens.map((token) => {
      const amount = new Dec(token.amount)
        .mul(
          DecUtils.getTenExponentNInPrecisionRange(token.currency.coinDecimals)
        )
        .truncate();

      return {
        amount: amount.toString(),
        denom: token.currency.coinMinimalDenom,
      };
    });

    const msg = this.msgOpts.lockAndSuperfluidDelegate.messageComposer({
      sender: this.address,
      coins: primitiveTokens,
      valAddr: validatorAddress,
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "lockAndSuperfluidDelegate",
      [msg],
      memo,
      {
        amount: [],
        gas: this.msgOpts.lockAndSuperfluidDelegate.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((balance) => balance.waitFreshResponse());

          // Refresh the locked coins
          queries.osmosis?.queryLockedCoins
            .get(this.address)
            .waitFreshResponse();
          queries.osmosis?.queryAccountLocked
            .get(this.address)
            .waitFreshResponse();

          queries.osmosis?.querySuperfluidDelegations
            .getQuerySuperfluidDelegations(this.address)
            .waitFreshResponse();
        }

        onFulfill?.(tx);
      }
    );
  }

  /**
   * https://docs.osmosis.zone/developing/modules/spec-lockup.html#begin-unlock-by-id
   * @param lockIds Ids of locks to unlock.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fullfillment.
   */
  async sendBeginUnlockingMsg(
    lockIds: string[],
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const msgs = lockIds.map((lockId) => {
      return this.msgOpts.beginUnlocking.messageComposer({
        owner: this.address,
        ID: Long.fromString(lockId),
        coins: [],
      });
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "beginUnlocking",
      msgs,
      memo,
      {
        amount: [],
        gas: (msgs.length * this.msgOpts.beginUnlocking.gas).toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((balance) => balance.waitFreshResponse());

          // Refresh the locked coins
          this.queries.queryLockedCoins.get(this.address).waitFreshResponse();
          this.queries.queryUnlockingCoins
            .get(this.address)
            .waitFreshResponse();
          this.queries.queryAccountLocked.get(this.address).waitFreshResponse();
        }

        onFulfill?.(tx);
      }
    );
  }

  /**
   * https://docs.osmosis.zone/developing/osmosis-core/modules/spec-superfluid.html#superfluid-unbond-lock
   * @param locks IDs and whether the lock is synthetic
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fullfillment.
   */
  async sendBeginUnlockingMsgOrSuperfluidUnbondLockMsgIfSyntheticLock(
    locks: {
      lockId: string;
      isSyntheticLock: boolean;
    }[],
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const msgs: EncodeObject[] = [];
    let numBeginUnlocking = 0;
    let numSuperfluidUndelegate = 0;
    let numSuperfluidUnbondLock = 0;

    for (const lock of locks) {
      if (!lock.isSyntheticLock) {
        numBeginUnlocking++;
        msgs.push(
          this.msgOpts.beginUnlocking.messageComposer({
            owner: this.address,
            ID: Long.fromString(lock.lockId),
            coins: [],
          })
        );
      } else {
        numSuperfluidUndelegate++;
        numSuperfluidUnbondLock++;
        msgs.push(
          this.msgOpts.superfluidUndelegate.messageComposer({
            lockId: Long.fromString(lock.lockId),
            sender: this.address,
          }),
          this.msgOpts.superfluidUnbondLock.messageComposer({
            lockId: Long.fromString(lock.lockId),
            sender: this.address,
          })
        );
      }
    }

    await this.base.signAndBroadcast(
      this.chainId,
      "beginUnlocking",
      msgs,
      memo,
      {
        amount: [],
        gas: (
          numBeginUnlocking * this.msgOpts.beginUnlocking.gas +
          numSuperfluidUndelegate * this.msgOpts.superfluidUndelegate.gas +
          numSuperfluidUnbondLock * this.msgOpts.superfluidUnbondLock.gas
        ).toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((balance) => balance.waitFreshResponse());

          // Refresh the locked coins
          queries.osmosis?.queryLockedCoins
            .get(this.address)
            .waitFreshResponse();
          queries.osmosis?.queryUnlockingCoins
            .get(this.address)
            .waitFreshResponse();
          queries.osmosis?.queryAccountLocked
            .get(this.address)
            .waitFreshResponse();

          queries.osmosis?.querySuperfluidDelegations
            .getQuerySuperfluidDelegations(this.address)
            .waitFreshResponse();
          queries.osmosis?.querySuperfluidUndelegations
            .getQuerySuperfluidDelegations(this.address)
            .waitFreshResponse();
        }

        onFulfill?.(tx);
      }
    );
  }

  async sendUnPoolWhitelistedPoolMsg(
    poolId: string,
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const msg = this.msgOpts.unPoolWhitelistedPool.messageComposer({
      poolId: Long.fromString(poolId),
      sender: this.address,
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "unPoolWhitelistedPool",
      [msg],
      memo,
      {
        amount: [],
        gas: this.msgOpts.unPoolWhitelistedPool.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);

          // Refresh the unlocking coins
          queries.osmosis?.queryLockedCoins
            .get(this.address)
            .waitFreshResponse();
          queries.osmosis?.queryUnlockingCoins
            .get(this.address)
            .waitFreshResponse();
          queries.osmosis?.queryAccountLocked
            .get(this.address)
            .waitFreshResponse();

          queries.osmosis?.querySuperfluidDelegations
            .getQuerySuperfluidDelegations(this.address)
            .waitFreshResponse();
          queries.osmosis?.querySuperfluidUndelegations
            .getQuerySuperfluidDelegations(this.address)
            .waitFreshResponse();
        }

        onFulfill?.(tx);
      }
    );
  }

  protected changeDecStringToProtoBz(decStr: string): string {
    let r = decStr;
    while (r.length >= 2 && (r.startsWith(".") || r.startsWith("0"))) {
      r = r.slice(1);
    }

    return r;
  }

  protected get queries() {
    // eslint-disable-next-line
    return this.queriesStore.get(this.chainId).osmosis!;
  }

  protected makeCoinPretty = (coin: Coin): CoinPretty => {
    const currency = this.chainGetter
      .getChain(this.chainId)
      .findCurrency(coin.denom);
    if (!currency) {
      throw new Error("Unknown currency");
    }
    return new CoinPretty(currency, coin.amount);
  };
}

export * from "./types";
