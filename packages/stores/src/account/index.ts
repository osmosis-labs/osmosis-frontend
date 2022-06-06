import Long from "long";
import { DeepPartial } from "utility-types";
import deepmerge from "deepmerge";
import {
  ChainGetter,
  IQueriesStore,
  AccountSetBaseSuper,
  CosmosAccount,
} from "@keplr-wallet/stores";
import { Coin, CoinPretty, Dec, DecUtils, Int } from "@keplr-wallet/unit";
import { Currency, KeplrSignOptions } from "@keplr-wallet/types";
import { WeightedPoolEstimates } from "@osmosis-labs/math";
import { Pool } from "@osmosis-labs/pools";
import { OsmosisQueries } from "../queries";
import { osmosis } from "./msg/proto";
import * as Msgs from "./msg/make-msg";
import { OsmosisMsgOpts, defaultMsgOpts } from "./types";
import { StdFee } from "@cosmjs/launchpad";

export interface OsmosisAccount {
  osmosis: OsmosisAccountImpl;
}

export const OsmosisAccount = {
  use(options: {
    msgOptsCreator?: (
      chainId: string
    ) => DeepPartial<OsmosisMsgOpts> | undefined;
    queriesStore: IQueriesStore<OsmosisQueries>;
  }): (
    base: AccountSetBaseSuper & CosmosAccount,
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
          deepmerge<OsmosisMsgOpts, DeepPartial<OsmosisMsgOpts>>(
            defaultMsgOpts,
            msgOptsFromCreator ? msgOptsFromCreator : {}
          )
        ),
      };
    };
  },
};

export class OsmosisAccountImpl {
  constructor(
    protected readonly base: AccountSetBaseSuper & CosmosAccount,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>,
    protected readonly _msgOpts: OsmosisMsgOpts
  ) {}

  /**
   * https://docs.osmosis.zone/developing/modules/spec-gamm.html#create-pool
   * @param swapFee The swap fee of the pool. Should set as the percentage. (Ex. 10% -> 10)
   * @param assets Assets that will be provided to the pool initially. Token can be parsed as to primitive by convenience. `amount`s are not in micro.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fulfillment.
   */
  async sendCreatePoolMsg(
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
      swapFee: new Dec(swapFee)
        .quo(DecUtils.getTenExponentNInPrecisionRange(2))
        .toString(),
      exitFee: new Dec(0).toString(),
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
      type: this._msgOpts.createPool.type,
      value: {
        sender: this.base.bech32Address,
        poolParams,
        poolAssets,
        future_pool_governor: "24h",
      },
    };

    await this.base.cosmos.sendMsgs(
      "createPool",
      {
        aminoMsgs: [msg],
        protoMsgs: [
          {
            typeUrl: "/osmosis.gamm.v1beta1.MsgCreateBalancerPool",
            value: osmosis.gamm.v1beta1.MsgCreateBalancerPool.encode({
              sender: msg.value.sender,
              poolParams: {
                swapFee: this.changeDecStringToProtoBz(
                  msg.value.poolParams.swapFee
                ),
                exitFee: this.changeDecStringToProtoBz(
                  msg.value.poolParams.exitFee
                ),
              },
              poolAssets: msg.value.poolAssets,
              futurePoolGovernor: msg.value.future_pool_governor,
            }).finish(),
          },
        ],
      },
      memo,
      {
        amount: [],
        gas: this._msgOpts.createPool.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          this.queries.queryGammPools.waitFreshResponse();
          queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
            .balances.forEach((bal) => {
              if (
                assets.find(
                  (asset) =>
                    asset.token.currency.coinMinimalDenom ===
                    bal.currency.coinMinimalDenom
                )
              ) {
                bal.fetch();
              }
            });
        }

        if (onFulfill) {
          onFulfill(tx);
        }
      }
    );
  }

  /**
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

    await this.base.cosmos.sendMsgs(
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
          this._msgOpts.joinPool.shareCoinDecimals
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
          type: this._msgOpts.joinPool.type,
          value: {
            sender: this.base.bech32Address,
            poolId,
            shareOutAmount: new Dec(shareOutAmount)
              .mul(
                DecUtils.getTenExponentNInPrecisionRange(
                  this._msgOpts.joinPool.shareCoinDecimals
                )
              )
              .truncate()
              .toString(),
            tokenInMaxs,
          },
        };

        return {
          aminoMsgs: [msg],
          protoMsgs: [
            {
              typeUrl: "/osmosis.gamm.v1beta1.MsgJoinPool",
              value: osmosis.gamm.v1beta1.MsgJoinPool.encode({
                sender: msg.value.sender,
                poolId: Long.fromString(msg.value.poolId),
                shareOutAmount: msg.value.shareOutAmount,
                tokenInMaxs: msg.value.tokenInMaxs,
              }).finish(),
            },
          ],
        };
      },
      memo,
      {
        amount: [],
        gas: this._msgOpts.joinPool.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
            .balances.forEach((bal) => {
              // TODO: Explicitly refresh the share expected to be minted and provided to the pool.
              bal.fetch();
            });

          this.queries.queryGammPools.getPool(poolId)?.fetch();
        }

        onFulfill?.(tx);
      }
    );
  }

  /**
   * Join pool with only one asset.
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

    await this.base.cosmos.sendMsgs(
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

        const poolAsset = queryPool.getPoolAsset(
          tokenIn.currency.coinMinimalDenom
        );

        const estimated = WeightedPoolEstimates.estimateJoinSwapExternAmountIn(
          {
            amount: new Int(poolAsset.amount.toCoin().amount),
            weight: poolAsset.weight.toDec().truncate(),
          },
          pool,
          tokenIn,
          this._msgOpts.joinPool.shareCoinDecimals
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
          type: this._msgOpts.joinSwapExternAmountIn.type,
          value: {
            sender: this.base.bech32Address,
            poolId,
            tokenIn: {
              denom: coin.denom,
              amount: coin.amount.toString(),
            },
            shareOutMinAmount: shareOutMinAmount.toString(),
          },
        };

        return {
          aminoMsgs: [msg],
          protoMsgs: [
            {
              typeUrl: "/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn",
              value: osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn.encode({
                sender: msg.value.sender,
                poolId: Long.fromString(msg.value.poolId),
                tokenIn: msg.value.tokenIn,
                shareOutMinAmount: msg.value.shareOutMinAmount,
              }).finish(),
            },
          ],
        };
      },
      memo,
      {
        amount: [],
        gas: this._msgOpts.joinPool.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
            .balances.forEach((bal) => {
              bal.fetch();
            });
          this.queries.queryGammPools.getPool(poolId)?.fetch();
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

    await this.base.cosmos.sendMsgs(
      "swapExactAmountIn",
      async () => {
        await queries.queryGammPools.waitFreshResponse();
        const pools: Pool[] = [];
        for (const route of routes) {
          const queryPool = queries.queryGammPools.getPool(route.poolId);

          if (!queryPool) {
            throw new Error(
              `Pool #${route.poolId} of route with ${route.tokenOutCurrency.coinMinimalDenom} not found`
            );
          }

          const pool = queryPool.pool;
          if (!pool) {
            throw new Error("Unknown pool");
          }

          pools.push(pool);
        }

        const msg = Msgs.Amino.makeMultihopSwapExactAmountInMsg(
          this._msgOpts.swapExactAmountIn,
          this.base.bech32Address,
          tokenIn,
          pools.map((pool, i) => {
            const queryPool = queries.queryGammPools.getPool(pool.id);
            const tokenOutCurrency = routes[i].tokenOutCurrency;

            if (!queryPool) {
              throw new Error(`Pool #${pool.id} not found for route`);
            }

            if (i !== 0 && typeof routes[i - 1] === "undefined") {
              throw new Error("Previous route not found");
            }

            const inPoolAsset = queryPool.getPoolAsset(
              i === 0
                ? tokenIn.currency.coinMinimalDenom
                : routes[i - 1].tokenOutCurrency.coinMinimalDenom
            );
            const outPoolAsset = queryPool.getPoolAsset(
              tokenOutCurrency.coinMinimalDenom
            );

            return {
              pool: {
                id: pool.id,
                swapFee: pool.swapFee,
                inPoolAsset: {
                  ...inPoolAsset.amount.currency,
                  amount: new Int(inPoolAsset.amount.toCoin().amount),
                  weight: inPoolAsset.weight.toDec().truncate(),
                },
                outPoolAsset: {
                  amount: new Int(outPoolAsset.amount.toCoin().amount),
                  weight: outPoolAsset.weight.toDec().truncate(),
                },
              },
              tokenOutCurrency,
            };
          }),
          maxSlippage
        );

        return {
          aminoMsgs: [msg],
          protoMsgs: [
            {
              typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountIn",
              value: osmosis.gamm.v1beta1.MsgSwapExactAmountIn.encode({
                sender: msg.value.sender,
                routes: msg.value.routes.map((route) => {
                  return {
                    poolId: Long.fromString(route.poolId),
                    tokenOutDenom: route.tokenOutDenom,
                  };
                }),
                tokenIn: msg.value.tokenIn,
                tokenOutMinAmount: msg.value.tokenOutMinAmount,
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
            this._msgOpts.swapExactAmountIn.gas * Math.max(routes.length, 1)
          ).toString(),
      },
      signOptions,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
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
                bal.fetch();
              }
            });

          this.queries.queryGammPools.fetch();
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

    await this.base.cosmos.sendMsgs(
      "swapExactAmountIn",
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
          tokenIn.currency.coinMinimalDenom
        );
        const outPoolAsset = queryPool.getPoolAsset(
          tokenOutCurrency.coinMinimalDenom
        );
        const msg = Msgs.Amino.makeSwapExactAmountInMsg(
          {
            // ...pool, <= does not work w/ getters
            id: pool.id,
            swapFee: pool.swapFee,
            inPoolAsset: {
              ...inPoolAsset.amount.currency,
              amount: new Int(inPoolAsset.amount.toCoin().amount),
              weight: inPoolAsset.weight.toDec().truncate(),
            },
            outPoolAsset: {
              amount: new Int(outPoolAsset.amount.toCoin().amount),
              weight: outPoolAsset.weight.toDec().truncate(),
            },
          },
          this._msgOpts.swapExactAmountIn,
          this.base.bech32Address,
          tokenIn,
          tokenOutCurrency,
          maxSlippage
        );

        return {
          aminoMsgs: [msg],
          protoMsgs: [
            {
              typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountIn",
              value: osmosis.gamm.v1beta1.MsgSwapExactAmountIn.encode({
                sender: msg.value.sender,
                routes: msg.value.routes.map(
                  (route: { poolId: string; tokenOutDenom: string }) => {
                    return {
                      poolId: Long.fromString(route.poolId),
                      tokenOutDenom: route.tokenOutDenom,
                    };
                  }
                ),
                tokenIn: msg.value.tokenIn,
                tokenOutMinAmount: msg.value.tokenOutMinAmount,
              }).finish(),
            },
          ],
        };
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas: stdFee.gas ?? this._msgOpts.swapExactAmountIn.gas.toString(),
      },
      signOptions,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
            .balances.forEach((bal) => {
              if (
                bal.currency.coinMinimalDenom ===
                  tokenIn.currency.coinMinimalDenom ||
                bal.currency.coinMinimalDenom ===
                  tokenOutCurrency.coinMinimalDenom
              ) {
                bal.fetch();
              }
            });

          // Refresh the pool
          this.queries.queryGammPools.getPool(poolId)?.fetch();
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

    await this.base.cosmos.sendMsgs(
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

        const msg = Msgs.Amino.makeSwapExactAmountOutMsg(
          {
            id: pool.id,
            swapFee: pool.swapFee,
            inPoolAsset: {
              ...inPoolAsset.amount.currency,
              amount: new Int(inPoolAsset.amount.toCoin().amount),
              weight: inPoolAsset.weight.toDec().truncate(),
            },
            outPoolAsset: {
              amount: new Int(outPoolAsset.amount.toCoin().amount),
              weight: outPoolAsset.weight.toDec().truncate(),
            },
          },
          this._msgOpts.swapExactAmountOut,
          this.base.bech32Address,
          tokenInCurrency,
          {
            currency: tokenOut.currency,
            amount: new Dec(tokenOut.amount)
              .mul(
                DecUtils.getTenExponentNInPrecisionRange(
                  tokenOut.currency.coinDecimals
                )
              )
              .truncate()
              .toString(),
          },
          maxSlippage
        );

        return {
          aminoMsgs: [msg],
          protoMsgs: [
            {
              typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountOut",
              value: osmosis.gamm.v1beta1.MsgSwapExactAmountOut.encode({
                sender: msg.value.sender,
                routes: msg.value.routes.map(
                  (route: { poolId: string; tokenInDenom: string }) => {
                    return {
                      poolId: Long.fromString(route.poolId),
                      tokenInDenom: route.tokenInDenom,
                    };
                  }
                ),
                tokenOut: msg.value.tokenOut,
                tokenInMaxAmount: msg.value.tokenInMaxAmount,
              }).finish(),
            },
          ],
        };
      },
      memo,
      {
        amount: [],
        gas: this._msgOpts.swapExactAmountIn.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
            .balances.forEach((bal) => {
              if (
                bal.currency.coinMinimalDenom ===
                  tokenInCurrency.coinMinimalDenom ||
                bal.currency.coinMinimalDenom ===
                  tokenOut.currency.coinMinimalDenom
              ) {
                bal.fetch();
              }
            });

          this.queries.queryGammPools.getPool(poolId)?.fetch();
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

    await this.base.cosmos.sendMsgs(
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
          this._msgOpts.exitPool.shareCoinDecimals
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
          type: this._msgOpts.exitPool.type,
          value: {
            sender: this.base.bech32Address,
            poolId: pool.id,
            shareInAmount: new Dec(shareInAmount)
              .mul(
                DecUtils.getTenExponentNInPrecisionRange(
                  this._msgOpts.exitPool.shareCoinDecimals
                )
              )
              .truncate()
              .toString(),
            tokenOutMins,
          },
        };

        return {
          aminoMsgs: [msg],
          protoMsgs: [
            {
              typeUrl: "/osmosis.gamm.v1beta1.MsgExitPool",
              value: osmosis.gamm.v1beta1.MsgExitPool.encode({
                sender: msg.value.sender,
                poolId: Long.fromString(msg.value.poolId),
                shareInAmount: msg.value.shareInAmount,
                tokenOutMins: msg.value.tokenOutMins,
              }).finish(),
            },
          ],
        };
      },
      memo,
      {
        amount: [],
        gas: this._msgOpts.exitPool.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();

          this.queries.queryGammPools.getPool(poolId)?.fetch();
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
      type: this._msgOpts.lockTokens.type,
      value: {
        owner: this.base.bech32Address,
        // Duration should be encodec as nana sec.
        duration: (duration * 1_000_000_000).toString(),
        coins: primitiveTokens,
      },
    };

    await this.base.cosmos.sendMsgs(
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
        gas: this._msgOpts.lockTokens.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();

          // Refresh the locked coins
          this.queries.queryLockedCoins.get(this.base.bech32Address).fetch();
          this.queries.queryAccountLocked.get(this.base.bech32Address).fetch();
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
        type: this._msgOpts.superfluidDelegate.type,
        value: {
          sender: this.base.bech32Address,
          lock_id: lockId,
          val_addr: validatorAddress,
        },
      };
    });

    const protoMsgs = aminoMsgs.map((msg) => {
      return {
        typeUrl: "/osmosis.superfluid.MsgSuperfluidDelegate",
        value: osmosis.superfluid.MsgSuperfluidDelegate.encode({
          sender: msg.value.sender,
          lockId: Long.fromString(msg.value.lock_id),
          valAddr: msg.value.val_addr,
        }).finish(),
      };
    });

    await this.base.cosmos.sendMsgs(
      "superfluidDelegate",
      {
        aminoMsgs,
        protoMsgs,
      },
      memo,
      {
        amount: [],
        gas: this._msgOpts.lockAndSuperfluidDelegate.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();

          queries.osmosis?.querySuperfluidDelegations
            .getQuerySuperfluidDelegations(this.base.bech32Address)
            .fetch();
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
      type: this._msgOpts.lockAndSuperfluidDelegate.type,
      value: {
        sender: this.base.bech32Address,
        coins: primitiveTokens,
        val_addr: validatorAddress,
      },
    };

    await this.base.cosmos.sendMsgs(
      "lockAndSuperfluidDelegate",
      {
        aminoMsgs: [msg],
        protoMsgs: [
          {
            typeUrl: "/osmosis.superfluid.MsgLockAndSuperfluidDelegate",
            value: osmosis.superfluid.MsgLockAndSuperfluidDelegate.encode({
              sender: msg.value.sender,
              coins: msg.value.coins,
              valAddr: msg.value.val_addr,
            }).finish(),
          },
        ],
      },
      memo,
      {
        amount: [],
        gas: this._msgOpts.lockAndSuperfluidDelegate.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();

          // Refresh the locked coins
          queries.osmosis?.queryLockedCoins
            .get(this.base.bech32Address)
            .fetch();
          queries.osmosis?.queryAccountLocked
            .get(this.base.bech32Address)
            .fetch();

          queries.osmosis?.querySuperfluidDelegations
            .getQuerySuperfluidDelegations(this.base.bech32Address)
            .fetch();
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
        type: this._msgOpts.beginUnlocking.type,
        value: {
          owner: this.base.bech32Address,
          ID: lockId,
          coins: [],
        },
      };
    });

    const protoMsgs = msgs.map((msg) => {
      return {
        typeUrl: "/osmosis.lockup.MsgBeginUnlocking",
        value: osmosis.lockup.MsgBeginUnlocking.encode({
          owner: msg.value.owner,
          ID: Long.fromString(msg.value.ID),
        }).finish(),
      };
    });

    await this.base.cosmos.sendMsgs(
      "beginUnlocking",
      {
        aminoMsgs: msgs,
        protoMsgs,
      },
      memo,
      {
        amount: [],
        gas: (msgs.length * this._msgOpts.beginUnlocking.gas).toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();

          // Refresh the locked coins
          this.queries.queryLockedCoins.get(this.base.bech32Address).fetch();
          this.queries.queryUnlockingCoins.get(this.base.bech32Address).fetch();
          this.queries.queryAccountLocked.get(this.base.bech32Address).fetch();
        }

        onFulfill?.(tx);
      }
    );
  }

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
          type: this._msgOpts.beginUnlocking.type,
          value: {
            owner: this.base.bech32Address,
            // XXX: 얘는 어째서인지 소문자가 아님 ㅋ;
            ID: lock.lockId,
            coins: [],
          },
        });
      } else {
        msgs.push(
          {
            type: this._msgOpts.superfluidUndelegate.type,
            value: {
              sender: this.base.bech32Address,
              lock_id: lock.lockId,
            },
          },
          {
            type: this._msgOpts.superfluidUnbondLock.type,
            value: {
              sender: this.base.bech32Address,
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
      if (msg.type === this._msgOpts.beginUnlocking.type && msg.value.ID) {
        numBeginUnlocking++;
        return {
          typeUrl: "/osmosis.lockup.MsgBeginUnlocking",
          value: osmosis.lockup.MsgBeginUnlocking.encode({
            owner: msg.value.owner,
            ID: Long.fromString(msg.value.ID),
          }).finish(),
        };
      } else if (
        msg.type === this._msgOpts.superfluidUndelegate.type &&
        msg.value.lock_id
      ) {
        numSuperfluidUndelegate++;
        return {
          typeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegate",
          value: osmosis.superfluid.MsgSuperfluidUndelegate.encode({
            sender: msg.value.sender,
            lockId: Long.fromString(msg.value.lock_id),
          }).finish(),
        };
      } else if (
        msg.type === this._msgOpts.superfluidUnbondLock.type &&
        msg.value.lock_id
      ) {
        numSuperfluidUnbondLock++;
        return {
          typeUrl: "/osmosis.superfluid.MsgSuperfluidUnbondLock",
          value: osmosis.superfluid.MsgSuperfluidUnbondLock.encode({
            sender: msg.value.sender,
            lockId: Long.fromString(msg.value.lock_id),
          }).finish(),
        };
      } else {
        throw new Error("Invalid locks");
      }
    });

    await this.base.cosmos.sendMsgs(
      "beginUnlocking",
      {
        aminoMsgs: msgs,
        protoMsgs,
      },
      memo,
      {
        amount: [],
        gas: (
          numBeginUnlocking * this._msgOpts.beginUnlocking.gas +
          numSuperfluidUndelegate * this._msgOpts.superfluidUndelegate.gas +
          numSuperfluidUnbondLock * this._msgOpts.superfluidUnbondLock.gas
        ).toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
            .fetch();

          // Refresh the locked coins
          queries.osmosis?.queryLockedCoins
            .get(this.base.bech32Address)
            .fetch();
          queries.osmosis?.queryUnlockingCoins
            .get(this.base.bech32Address)
            .fetch();
          queries.osmosis?.queryAccountLocked
            .get(this.base.bech32Address)
            .fetch();

          queries.osmosis?.querySuperfluidDelegations
            .getQuerySuperfluidDelegations(this.base.bech32Address)
            .fetch();
          queries.osmosis?.querySuperfluidUndelegations
            .getQuerySuperfluidDelegations(this.base.bech32Address)
            .fetch();
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
      type: this._msgOpts.unPoolWhitelistedPool.type,
      value: {
        sender: this.base.bech32Address,
        pool_id: poolId,
      },
    };

    const protoMsg = {
      typeUrl: "/osmosis.superfluid.MsgUnPoolWhitelistedPool",
      value: osmosis.superfluid.MsgUnPoolWhitelistedPool.encode({
        sender: msg.value.sender,
        poolId: Long.fromString(msg.value.pool_id),
      }).finish(),
    };

    await this.base.cosmos.sendMsgs(
      "unPoolWhitelistedPool",
      {
        aminoMsgs: [msg],
        protoMsgs: [protoMsg],
      },
      memo,
      {
        amount: [],
        gas: this._msgOpts.unPoolWhitelistedPool.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);

          // Refresh the unlocking coins
          queries.osmosis?.queryLockedCoins
            .get(this.base.bech32Address)
            .fetch();
          queries.osmosis?.queryUnlockingCoins
            .get(this.base.bech32Address)
            .fetch();
          queries.osmosis?.queryAccountLocked
            .get(this.base.bech32Address)
            .fetch();

          queries.osmosis?.querySuperfluidDelegations
            .getQuerySuperfluidDelegations(this.base.bech32Address)
            .fetch();
          queries.osmosis?.querySuperfluidUndelegations
            .getQuerySuperfluidDelegations(this.base.bech32Address)
            .fetch();
        }

        if (onFulfill) {
          onFulfill(tx);
        }
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
