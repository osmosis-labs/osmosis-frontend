import { StdFee } from "@cosmjs/launchpad";
import {
  ChainGetter,
  CosmosQueries,
  IQueriesStore,
} from "@keplr-wallet/stores";
import { BondStatus } from "@keplr-wallet/stores/build/query/cosmos/staking/types";
import { Currency, KeplrSignOptions } from "@keplr-wallet/types";
import { Coin, CoinPretty, Dec, DecUtils, Int } from "@keplr-wallet/unit";
import * as WeightedPoolEstimates from "@osmosis-labs/math";
import { Pool } from "@osmosis-labs/pools";
import deepmerge from "deepmerge";
import Long from "long";
import { AccountStore } from "src/account";
import { DeepPartial } from "utility-types";

import { OsmosisQueries } from "../queries";
import * as Msgs from "./msg/make-msg";
import { osmosis } from "./msg/proto";
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
    base: AccountStore,
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
    const poolParams = {
      swap_fee: new Dec(swapFee)
        .quo(DecUtils.getTenExponentNInPrecisionRange(2))
        .toString(),
      exit_fee: new Dec(0).toString(),
    };

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

    const msg = {
      type: this.msgOpts.createBalancerPool.type,
      value: {
        sender: this.address,
        pool_params: poolParams,
        pool_assets: poolAssets,
        future_pool_governor: "24h",
      },
    };

    await this.base.sign(
      this.chainId,
      "createBalancerPool",
      {
        aminoMsgs: [msg],
        protoMsgs: [
          {
            typeUrl: this.msgOpts.createBalancerPool.protoTypeUrl,
            value: this.msgOpts.createBalancerPool.protoClass
              .encode({
                sender: msg.value.sender,
                poolParams: {
                  swapFee: this.changeDecStringToProtoBz(
                    msg.value.pool_params.swap_fee
                  ),
                  exitFee: this.changeDecStringToProtoBz(
                    msg.value.pool_params.exit_fee
                  ),
                },
                poolAssets: msg.value.pool_assets,
                futurePoolGovernor: msg.value.future_pool_governor,
              })
              .finish(),
          },
        ],
      },
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
      swap_fee: new Dec(swapFee)
        .quo(DecUtils.getTenExponentNInPrecisionRange(2))
        .toString(),
      exit_fee: new Dec(0).toString(),
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

    const msg = {
      type: this.msgOpts.createStableswapPool.type,
      value: {
        sender: this.address,
        pool_params: poolParams,
        initial_pool_liquidity: initialPoolLiquidity,
        scaling_factors: sortedScalingFactors.map((sf) => sf.toString()),
        future_pool_governor: "24h",
        scaling_factor_controller: scalingFactorControllerAddress,
      },
    };

    await this.base.sign(
      this.chainId,
      "createStableswapPool",
      {
        aminoMsgs: [msg],
        protoMsgs: [
          {
            typeUrl: this.msgOpts.createStableswapPool.protoTypeUrl,
            value: this.msgOpts.createStableswapPool.protoClass
              .encode({
                sender: msg.value.sender,
                poolParams: {
                  swapFee: this.changeDecStringToProtoBz(
                    msg.value.pool_params.swap_fee
                  ),
                  exitFee: this.changeDecStringToProtoBz(
                    msg.value.pool_params.exit_fee
                  ),
                },
                initialPoolLiquidity: msg.value.initial_pool_liquidity,
                scalingFactors: sortedScalingFactors,
                scalingFactorController: msg.value.scaling_factor_controller,
                futurePoolGovernor: msg.value.future_pool_governor,
              })
              .finish(),
          },
        ],
      },
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

    await this.base.sign(
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
          ? null
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

        const msg = {
          type: this.msgOpts.joinPool.type,
          value: {
            sender: this.address,
            pool_id: poolId,
            share_out_amount: new Dec(shareOutAmount)
              .mul(
                DecUtils.getTenExponentNInPrecisionRange(
                  this.msgOpts.joinPool.shareCoinDecimals
                )
              )
              .truncate()
              .toString(),
            token_in_maxs: tokenInMaxs,
          },
        };

        return {
          aminoMsgs: [msg],
          protoMsgs: [
            {
              typeUrl: this.msgOpts.joinPool.protoTypeUrl,
              value: this.msgOpts.joinPool.protoClass
                .encode({
                  sender: msg.value.sender,
                  poolId: Long.fromString(msg.value.pool_id),
                  shareOutAmount: msg.value.share_out_amount,
                  tokenInMaxs: msg.value.token_in_maxs,
                })
                .finish(),
            },
          ],
        };
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

    await this.base.sign(
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

        const msg = {
          type: this.msgOpts.joinSwapExternAmountIn.type,
          value: {
            sender: this.address,
            pool_id: poolId,
            token_in: {
              denom: coin.denom,
              amount: coin.amount.toString(),
            },
            share_out_min_amount: shareOutMinAmount.toString(),
          },
        };

        return {
          aminoMsgs: [msg],
          protoMsgs: [
            {
              typeUrl: this.msgOpts.joinSwapExternAmountIn.protoTypeUrl,
              value: this.msgOpts.joinSwapExternAmountIn.protoClass
                .encode({
                  sender: msg.value.sender,
                  poolId: Long.fromString(msg.value.pool_id),
                  tokenIn: msg.value.token_in,
                  shareOutMinAmount: msg.value.share_out_min_amount,
                })
                .finish(),
            },
          ],
        };
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
   * @param maxSlippage Max tolerated slippage.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fullfillment.
   */
  async sendMultihopSwapExactAmountInMsg(
    routes: {
      poolId: string;
      tokenOutCurrency: Currency;
    }[],
    tokenIn: { currency: Currency; amount: string },
    maxSlippage: string = "0",
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    signOptions?: KeplrSignOptions,
    onFulfill?: (tx: any) => void
  ) {
    const queries = this.queries;

    await this.base.sign(
      this.chainId,
      "swapExactAmountIn",
      async () => {
        // refresh data and get pools
        await queries.queryIncentivizedPools.waitFreshResponse();
        const pools: Pool[] = [];
        for (const route of routes) {
          const queryPool = queries.queryGammPools.getPool(route.poolId);

          if (!queryPool) {
            throw new Error(
              `Pool #${route.poolId} of route with ${route.tokenOutCurrency.coinMinimalDenom} not found`
            );
          }

          await queryPool.waitFreshResponse();

          const pool = queryPool.pool;
          if (!pool) {
            throw new Error("Unknown pool");
          }

          pools.push(pool);
        }

        // make message with estimated min out amounts
        const msg = Msgs.Amino.makeMultihopSwapExactAmountInMsg(
          this.msgOpts.swapExactAmountIn,
          this.address,
          tokenIn,
          pools.map((pool, i) => {
            const queryPool = queries.queryGammPools.getPool(pool.id);
            const isIncentivized =
              queries.queryIncentivizedPools.isIncentivized(pool.id);
            const tokenOutCurrency = routes[i].tokenOutCurrency;

            if (!queryPool) {
              throw new Error(`Pool #${pool.id} not found for route`);
            }

            if (i !== 0 && typeof routes[i - 1] === "undefined") {
              throw new Error("Previous route not found");
            }

            // reconcile weighted and stable pool asset data
            const inPoolAsset = queryPool.getPoolAsset(
              i === 0
                ? tokenIn.currency.coinMinimalDenom
                : routes[i - 1].tokenOutCurrency.coinMinimalDenom
            );
            const outPoolAsset = queryPool.getPoolAsset(
              tokenOutCurrency.coinMinimalDenom
            );
            const inPoolAssetWeight = queryPool.weightedPoolInfo?.assets.find(
              ({ denom }) =>
                denom === inPoolAsset.amount.currency.coinMinimalDenom
            )?.weight;
            const outPoolAssetWeight = queryPool.weightedPoolInfo?.assets.find(
              ({ denom }) =>
                denom === outPoolAsset.amount.currency.coinMinimalDenom
            )?.weight;

            const poolAssets = queryPool?.stableSwapInfo
              ? queryPool.stableSwapInfo.assets
              : [];

            return {
              pool: {
                id: pool.id,
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
                isIncentivized,
                poolAssets,
              },
              tokenOutCurrency,
            };
          }),
          this.chainGetter.getChain(this.chainId).stakeCurrency
            .coinMinimalDenom,
          maxSlippage
        );

        // encode proto messages from amino msg data
        return {
          aminoMsgs: [msg],
          protoMsgs: [
            {
              typeUrl: this.msgOpts.swapExactAmountIn.protoTypeUrl,
              value: osmosis.gamm.v1beta1.MsgSwapExactAmountIn.encode({
                sender: msg.value.sender,
                routes: msg.value.routes.map((route) => {
                  return {
                    poolId: Long.fromString(route.pool_id),
                    tokenOutDenom: route.token_out_denom,
                  };
                }),
                tokenIn: msg.value.token_in,
                tokenOutMinAmount: msg.value.token_out_min_amount,
              }).finish(),
            },
          ],
        };
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
   * @param maxSlippage Max tolerated slippage.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fullfillment.
   */
  async sendSwapExactAmountInMsg(
    poolId: string,
    tokenIn: { currency: Currency; amount: string },
    tokenOutCurrency: Currency,
    maxSlippage: string = "0",
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    signOptions?: KeplrSignOptions,
    onFulfill?: (tx: any) => void
  ) {
    const queries = this.queries;

    await this.base.sign(
      this.chainId,
      "swapExactAmountIn",
      async () => {
        // get pool info and refetch
        const queryPool = queries.queryGammPools.getPool(poolId);
        if (!queryPool) {
          throw new Error(`Pool #${poolId} not found`);
        }
        await queryPool.waitFreshResponse();
        const pool = queryPool.pool;
        if (!pool) {
          throw new Error("Unknown pool");
        }

        // reconcile weighted and stable pool asset data
        const inPoolAsset = queryPool.getPoolAsset(
          tokenIn.currency.coinMinimalDenom
        );
        const outPoolAsset = queryPool.getPoolAsset(
          tokenOutCurrency.coinMinimalDenom
        );
        const inPoolAssetWeight = queryPool.weightedPoolInfo?.assets.find(
          ({ denom }) => denom === inPoolAsset.amount.currency.coinMinimalDenom
        )?.weight;
        const outPoolAssetWeight = queryPool.weightedPoolInfo?.assets.find(
          ({ denom }) => denom === outPoolAsset.amount.currency.coinMinimalDenom
        )?.weight;
        const poolAssets = queryPool.stableSwapInfo
          ? queryPool.stableSwapInfo.assets
          : [];

        const msg = Msgs.Amino.makeSwapExactAmountInMsg(
          {
            // ...pool, <= does not work w/ getters
            id: pool.id,
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
          this.msgOpts.swapExactAmountIn,
          this.address,
          tokenIn,
          tokenOutCurrency,
          maxSlippage
        );

        return {
          aminoMsgs: [msg],
          protoMsgs: [
            {
              typeUrl: this.msgOpts.swapExactAmountIn.protoTypeUrl,
              value: this.msgOpts.swapExactAmountIn.protoClass
                .encode({
                  sender: msg.value.sender,
                  routes: msg.value.routes.map(
                    (route: { pool_id: string; token_out_denom: string }) => {
                      return {
                        poolId: Long.fromString(route.pool_id),
                        tokenOutDenom: route.token_out_denom,
                      };
                    }
                  ),
                  tokenIn: msg.value.token_in,
                  tokenOutMinAmount: msg.value.token_out_min_amount,
                })
                .finish(),
            },
          ],
        };
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

    await this.base.sign(
      this.chainId,
      "swapExactAmountOut",
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

        const msg = Msgs.Amino.makeSwapExactAmountOutMsg(
          {
            id: pool.id,
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
          this.msgOpts.swapExactAmountOut,
          this.address,
          tokenInCurrency,
          tokenOut,
          maxSlippage
        );

        return {
          aminoMsgs: [msg],
          protoMsgs: [
            {
              typeUrl: this.msgOpts.swapExactAmountOut.protoTypeUrl,
              value: this.msgOpts.swapExactAmountOut.protoClass
                .encode({
                  sender: msg.value.sender,
                  routes: msg.value.routes.map(
                    (route: { pool_id: string; token_in_denom: string }) => {
                      return {
                        poolId: Long.fromString(route.pool_id),
                        tokenInDenom: route.token_in_denom,
                      };
                    }
                  ),
                  tokenOut: msg.value.token_out,
                  tokenInMaxAmount: msg.value.token_in_max_amount,
                })
                .finish(),
            },
          ],
        };
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

    await this.base.sign(
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
          ? null
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

        const msg = {
          type: this.msgOpts.exitPool.type,
          value: {
            sender: this.address,
            pool_id: pool.id,
            share_in_amount: new Dec(shareInAmount)
              .mul(
                DecUtils.getTenExponentNInPrecisionRange(
                  this.msgOpts.exitPool.shareCoinDecimals
                )
              )
              .truncate()
              .toString(),
            token_out_mins: tokenOutMins,
          },
        };

        return {
          aminoMsgs: [msg],
          protoMsgs: [
            {
              typeUrl: this.msgOpts.exitPool.protoTypeUrl,
              value: this.msgOpts.exitPool.protoClass
                .encode({
                  sender: msg.value.sender,
                  poolId: Long.fromString(msg.value.pool_id),
                  shareInAmount: msg.value.share_in_amount,
                  tokenOutMins: msg.value.token_out_mins,
                })
                .finish(),
            },
          ],
        };
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
          queries.queryBalances.getQueryBech32Address(this.address).fetch();

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

    const msg = {
      type: this.msgOpts.lockTokens.type,
      value: {
        owner: this.address,
        // Duration should be encodec as nana sec.
        duration: (duration * 1_000_000_000).toString(),
        coins: primitiveTokens,
      },
    };

    await this.base.sign(
      this.chainId,
      "lockTokens",
      {
        aminoMsgs: [msg],
        protoMsgs: [
          {
            typeUrl: "/osmosis.lockup.MsgLockTokens",
            value: osmosis.lockup.MsgLockTokens.encode({
              owner: msg.value.owner,
              duration: {
                seconds: Long.fromNumber(
                  Math.floor(parseInt(msg.value.duration) / 1_000_000_000)
                ),
                nanos: parseInt(msg.value.duration) % 1_000_000_000,
              },
              coins: msg.value.coins,
            }).finish(),
          },
        ],
      },
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
          queries.queryBalances.getQueryBech32Address(this.address).fetch();

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
    const aminoMsgs = lockIds.map((lockId) => {
      return {
        type: this.msgOpts.superfluidDelegate.type,
        value: {
          sender: this.address,
          lock_id: lockId,
          val_addr: validatorAddress,
        },
      };
    });

    const protoMsgs = aminoMsgs.map((msg) => {
      return {
        typeUrl: this.msgOpts.superfluidDelegate.protoTypeUrl,
        value: this.msgOpts.superfluidDelegate.protoClass
          .encode({
            sender: msg.value.sender,
            lockId: Long.fromString(msg.value.lock_id),
            valAddr: msg.value.val_addr,
          })
          .finish(),
      };
    });

    await this.base.sign(
      this.chainId,
      "superfluidDelegate",
      {
        aminoMsgs,
        protoMsgs,
      },
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
          queries.queryBalances.getQueryBech32Address(this.address).fetch();

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

    const msg = {
      type: this.msgOpts.lockAndSuperfluidDelegate.type,
      value: {
        sender: this.address,
        coins: primitiveTokens,
        val_addr: validatorAddress,
      },
    };

    await this.base.sign(
      this.chainId,
      "lockAndSuperfluidDelegate",
      {
        aminoMsgs: [msg],
        protoMsgs: [
          {
            typeUrl: this.msgOpts.lockAndSuperfluidDelegate.protoTypeUrl,
            value: this.msgOpts.lockAndSuperfluidDelegate.protoClass
              .encode({
                sender: msg.value.sender,
                coins: msg.value.coins,
                valAddr: msg.value.val_addr,
              })
              .finish(),
          },
        ],
      },
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
          queries.queryBalances.getQueryBech32Address(this.address).fetch();

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
      return {
        type: this.msgOpts.beginUnlocking.type,
        value: {
          owner: this.address,
          ID: lockId,
          coins: [],
        },
      };
    });

    const protoMsgs = msgs.map((msg) => {
      return {
        typeUrl: this.msgOpts.beginUnlocking.protoTypeUrl,
        value: this.msgOpts.beginUnlocking.protoClass
          .encode({
            owner: msg.value.owner,
            ID: Long.fromString(msg.value.ID),
          })
          .finish(),
      };
    });

    await this.base.sign(
      this.chainId,
      "beginUnlocking",
      {
        aminoMsgs: msgs,
        protoMsgs,
      },
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
          queries.queryBalances.getQueryBech32Address(this.address).fetch();

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
    const msgs: { type: string; value: any }[] = [];

    for (const lock of locks) {
      if (!lock.isSyntheticLock) {
        msgs.push({
          type: this.msgOpts.beginUnlocking.type,
          value: {
            owner: this.address,
            // XXX: 얘는 어째서인지 소문자가 아님 ㅋ;
            ID: lock.lockId,
            coins: [],
          },
        });
      } else {
        msgs.push(
          {
            type: this.msgOpts.superfluidUndelegate.type,
            value: {
              sender: this.address,
              lock_id: lock.lockId,
            },
          },
          {
            type: this.msgOpts.superfluidUnbondLock.type,
            value: {
              sender: this.address,
              lock_id: lock.lockId,
            },
          }
        );
      }
    }

    let numBeginUnlocking = 0;
    let numSuperfluidUndelegate = 0;
    let numSuperfluidUnbondLock = 0;

    const protoMsgs = msgs.map((msg) => {
      if (msg.type === this.msgOpts.beginUnlocking.type && msg.value.ID) {
        numBeginUnlocking++;
        return {
          typeUrl: this.msgOpts.beginUnlocking.protoTypeUrl,
          value: this.msgOpts.beginUnlocking.protoClass
            .encode({
              owner: msg.value.owner,
              ID: Long.fromString(msg.value.ID),
            })
            .finish(),
        };
      } else if (
        msg.type === this.msgOpts.superfluidUndelegate.type &&
        msg.value.lock_id
      ) {
        numSuperfluidUndelegate++;
        return {
          typeUrl: this.msgOpts.superfluidUndelegate.protoTypeUrl,
          value: this.msgOpts.superfluidUndelegate.protoClass
            .encode({
              sender: msg.value.sender,
              lockId: Long.fromString(msg.value.lock_id),
            })
            .finish(),
        };
      } else if (
        msg.type === this.msgOpts.superfluidUnbondLock.type &&
        msg.value.lock_id
      ) {
        numSuperfluidUnbondLock++;
        return {
          typeUrl: this.msgOpts.superfluidUnbondLock.protoTypeUrl,
          value: this.msgOpts.superfluidUnbondLock.protoClass
            .encode({
              sender: msg.value.sender,
              lockId: Long.fromString(msg.value.lock_id),
            })
            .finish(),
        };
      } else {
        throw new Error("Invalid locks");
      }
    });

    await this.base.sign(
      this.chainId,
      "beginUnlocking",
      {
        aminoMsgs: msgs,
        protoMsgs,
      },
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
          queries.queryBalances.getQueryBech32Address(this.address).fetch();

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
    const msg = {
      type: this.msgOpts.unPoolWhitelistedPool.type,
      value: {
        sender: this.address,
        pool_id: poolId,
      },
    };

    const protoMsg = {
      typeUrl: this.msgOpts.unPoolWhitelistedPool.protoTypeUrl,
      value: this.msgOpts.unPoolWhitelistedPool.protoClass
        .encode({
          sender: msg.value.sender,
          poolId: Long.fromString(msg.value.pool_id),
        })
        .finish(),
    };

    await this.base.sign(
      this.chainId,
      "unPoolWhitelistedPool",
      {
        aminoMsgs: [msg],
        protoMsgs: [protoMsg],
      },
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
