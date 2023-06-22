import { StdFee } from "@cosmjs/launchpad";
import {
  AccountSetBaseSuper,
  ChainGetter,
  CosmosAccount,
  CosmosQueries,
  IQueriesStore,
  ProtoMsgsOrWithAminoMsgs,
} from "@keplr-wallet/stores";
import { BondStatus } from "@keplr-wallet/stores/build/query/cosmos/staking/types";
import { Currency, KeplrSignOptions } from "@keplr-wallet/types";
import { Coin, CoinPretty, Dec, DecUtils, Int } from "@keplr-wallet/unit";
import * as OsmosisMath from "@osmosis-labs/math";
import deepmerge from "deepmerge";
import Long from "long";
import { DeepPartial } from "utility-types";

import { OsmosisQueries } from "../queries";
import * as Msgs from "./msg/amino";
import { osmosis } from "./msg/proto";
import { DEFAULT_SLIPPAGE, defaultMsgOpts, OsmosisMsgOpts } from "./msg-opts";

export interface OsmosisAccount {
  osmosis: OsmosisAccountImpl;
}

export const OsmosisAccount = {
  use(options: {
    msgOptsCreator?: (
      chainId: string
    ) => DeepPartial<OsmosisMsgOpts> | undefined;
    queriesStore: IQueriesStore<CosmosQueries & OsmosisQueries>;
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
    protected readonly queriesStore: IQueriesStore<
      CosmosQueries & OsmosisQueries
    >,
    protected readonly _msgOpts: OsmosisMsgOpts
  ) {}

  /**
   * Create balancer/weighted pool.
   * @param swapFee The swap fee of the pool. Should set as the percentage. (Ex. 10% -> 10)
   * @param assets Assets that will be provided to the pool initially, with weights. Token can be parsed as to primitive by convenience. `amount`s are not in micro.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fulfillment given raw response.
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
      type: this._msgOpts.createBalancerPool.type,
      value: {
        sender: this.base.bech32Address,
        pool_params: poolParams,
        pool_assets: poolAssets,
        future_pool_governor: "24h",
      },
    };

    await this.base.cosmos.sendMsgs(
      "createBalancerPool",
      {
        aminoMsgs: [msg],
        protoMsgs: [
          {
            typeUrl:
              "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool",
            value:
              osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool.encode(
                {
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
                }
              ).finish(),
          },
        ],
      },
      memo,
      {
        amount: [],
        gas: this._msgOpts.createBalancerPool.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          this.queries.queryPools.waitFreshResponse();
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
                bal.waitFreshResponse();
              }
            });
        }

        onFulfill?.(tx);
      }
    );
  }

  /**
   * Create concentrated liquidity pool, with no positions.
   *
   * @param denom0 Base denom in pool.
   * @param denom1 Quote denom in pool.
   * @param tickSpacing Tick spacing.
   * @param spreadFactor Spread factor.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fulfillment given raw response.
   */
  async sendCreateConcentratedPoolMsg(
    denom0: string,
    denom1: string,
    tickSpacing: number,
    spreadFactor: number,
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const msg = {
      type: this._msgOpts.createConcentratedPool.type,
      value: {
        sender: this.base.bech32Address,
        denom0,
        denom1,
        tick_spacing: tickSpacing.toString(),
        spread_factor: new Dec(spreadFactor).toString(),
      },
    };

    await this.base.cosmos.sendMsgs(
      "createConcentratedPool",
      {
        aminoMsgs: [msg],
        protoMsgs: [
          {
            typeUrl:
              "/osmosis.concentratedliquidity.v1beta1.MsgCreateConcentratedPool",
            value:
              osmosis.concentratedliquidity.v1beta1.MsgCreateConcentratedPool.encode(
                {
                  sender: msg.value.sender,
                  denom0: msg.value.denom0,
                  denom1: msg.value.denom1,
                  tickSpacing: new Long(Number(msg.value.tick_spacing)),
                  spreadFactor: this.changeDecStringToProtoBz(
                    msg.value.spread_factor
                  ),
                }
              ).finish(),
          },
        ],
      },
      memo,
      {
        amount: [],
        gas: this._msgOpts.createConcentratedPool.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          this.queries.queryPools.waitFreshResponse();
          queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
            .balances.forEach((bal) => {
              if (
                bal.currency.coinMinimalDenom === denom0 ||
                bal.currency.coinMinimalDenom === denom1
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
   * @param onFulfill Callback to handle tx fulfillment given raw response.
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
      type: this._msgOpts.createStableswapPool.type,
      value: {
        sender: this.base.bech32Address,
        pool_params: poolParams,
        initial_pool_liquidity: initialPoolLiquidity,
        scaling_factors: sortedScalingFactors.map((sf) => sf.toString()),
        future_pool_governor: "24h",
        scaling_factor_controller: scalingFactorControllerAddress,
      },
    };

    await this.base.cosmos.sendMsgs(
      "createStableswapPool",
      {
        aminoMsgs: [msg],
        protoMsgs: [
          {
            typeUrl:
              "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool",
            value:
              osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool.encode(
                {
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
                }
              ).finish(),
          },
        ],
      },
      memo,
      {
        amount: [],
        gas: this._msgOpts.createStableswapPool.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          this.queries.queryPools.waitFreshResponse();
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
   * @param onFulfill Callback to handle tx fulfillment given raw response.
   */
  async sendJoinPoolMsg(
    poolId: string,
    shareOutAmount: string,
    maxSlippage: string = DEFAULT_SLIPPAGE,
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const queries = this.queries;
    const mkp = this.makeCoinPretty;

    await this.base.cosmos.sendMsgs(
      "joinPool",
      async () => {
        const queryPool = queries.queryPools.getPool(poolId);

        if (!queryPool) {
          throw new Error(`Pool #${poolId} not found`);
        }

        await queryPool.waitFreshResponse();

        const pool = queryPool.sharePool;
        if (!pool) {
          throw new Error("Not a share pool");
        }

        const maxSlippageDec = new Dec(maxSlippage).quo(
          DecUtils.getTenExponentNInPrecisionRange(2)
        );

        const estimated = OsmosisMath.estimateJoinSwap(
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
            pool_id: poolId,
            share_out_amount: new Dec(shareOutAmount)
              .mul(
                DecUtils.getTenExponentNInPrecisionRange(
                  this._msgOpts.joinPool.shareCoinDecimals
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
              typeUrl: "/osmosis.gamm.v1beta1.MsgJoinPool",
              value: osmosis.gamm.v1beta1.MsgJoinPool.encode({
                sender: msg.value.sender,
                poolId: Long.fromString(msg.value.pool_id),
                shareOutAmount: msg.value.share_out_amount,
                tokenInMaxs: msg.value.token_in_maxs,
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
              bal.waitFreshResponse();
            });

          this.queries.queryPools.getPool(poolId)?.waitFreshResponse();
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
   * @param onFulfill Callback to handle tx fullfillment given raw response.
   */
  async sendJoinSwapExternAmountInMsg(
    poolId: string,
    tokenIn: { currency: Currency; amount: string },
    maxSlippage: string = DEFAULT_SLIPPAGE,
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const queries = this.queries;

    await this.base.cosmos.sendMsgs(
      "joinPool",
      async () => {
        const queryPool = queries.queryPools.getPool(poolId);

        if (!queryPool) {
          throw new Error(`Pool #${poolId} not found`);
        }

        await queryPool.waitFreshResponse();

        // TODO: fork on the pool type
        const pool = queryPool.sharePool;
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

        const estimated = OsmosisMath.estimateJoinSwapExternAmountIn(
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
              typeUrl: "/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn",
              value: osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn.encode({
                sender: msg.value.sender,
                poolId: Long.fromString(msg.value.pool_id),
                tokenIn: msg.value.token_in,
                shareOutMinAmount: msg.value.share_out_min_amount,
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
              bal.waitFreshResponse();
            });
          this.queries.queryPools.getPool(poolId)?.waitFreshResponse();
        }

        onFulfill?.(tx);
      }
    );
  }

  /**
   * Create a concentrated liquidity position in a pool.
   *
   * @param poolId ID of pool to create position in.
   * @param baseDeposit Base asset currency and amount.
   * @param quoteDeposit Quote asset currency and amount.
   * @param lowerTick Lower tick index.
   * @param upperTick Upper tick index.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fullfillment given raw response.
   */
  async sendCreateConcentratedLiquidityPositionMsg(
    poolId: string,
    lowerTick: Int,
    upperTick: Int,
    baseDeposit?: { currency: Currency; amount: string },
    quoteDeposit?: { currency: Currency; amount: string },
    maxSlippage = DEFAULT_SLIPPAGE,
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const queries = this.queries;

    await this.base.cosmos.sendMsgs(
      "clCreatePosition",
      () => {
        const queryPool = queries.queryPools.getPool(poolId);

        if (!queryPool) {
          throw new Error(`Pool #${poolId} not found`);
        }

        const type = queryPool.pool.type;
        if (type !== "concentrated") {
          throw new Error("Must be concentrated pool");
        }

        let baseCoin: Coin | undefined;
        let quoteCoin: Coin | undefined;

        if (baseDeposit !== undefined && baseDeposit.amount !== undefined) {
          const baseAmount = new Dec(baseDeposit.amount)
            .mul(
              DecUtils.getTenExponentNInPrecisionRange(
                baseDeposit.currency.coinDecimals
              )
            )
            .truncate();
          baseCoin = new Coin(
            baseDeposit.currency.coinMinimalDenom,
            baseAmount
          );
        }

        if (quoteDeposit !== undefined && quoteDeposit.amount !== undefined) {
          const quoteAmount = new Dec(quoteDeposit.amount)
            .mul(
              DecUtils.getTenExponentNInPrecisionRange(
                quoteDeposit.currency.coinDecimals
              )
            )
            .truncate();
          quoteCoin = new Coin(
            quoteDeposit.currency.coinMinimalDenom,
            quoteAmount
          );
        }

        const sortedCoins = [baseCoin, quoteCoin]
          .filter((coin): coin is Coin => coin !== undefined)
          .sort((a, b) => a?.denom.localeCompare(b?.denom))
          .map(({ denom, amount }) => ({ denom, amount: amount.toString() }));

        const token_min_amount0 =
          baseCoin &&
          // full tolerance if 0 sqrt price so no positions
          !queryPool.concentratedLiquidityPoolInfo?.currentSqrtPrice.isZero()
            ? new Dec(baseCoin.amount)
                .mul(new Dec(1).sub(new Dec(maxSlippage).quo(new Dec(100))))
                .truncate()
                .toString()
            : "0";
        const token_min_amount1 =
          quoteCoin &&
          // full tolerance if 0 sqrt price so no positions
          !queryPool.concentratedLiquidityPoolInfo?.currentSqrtPrice.isZero()
            ? new Dec(quoteCoin.amount)
                .mul(new Dec(1).sub(new Dec(maxSlippage).quo(new Dec(100))))
                .truncate()
                .toString()
            : "0";

        const msg = {
          type: this._msgOpts.clCreatePosition.type,
          value: {
            pool_id: poolId,
            sender: this.base.bech32Address,
            lower_tick: lowerTick.toString(),
            upper_tick: upperTick.toString(),
            tokens_provided: sortedCoins,
            token_min_amount0,
            token_min_amount1,
          },
        };

        return {
          aminoMsgs: [msg],
          protoMsgs: [
            {
              typeUrl:
                "/osmosis.concentratedliquidity.v1beta1.MsgCreatePosition",
              value:
                osmosis.concentratedliquidity.v1beta1.MsgCreatePosition.encode({
                  sender: msg.value.sender,
                  poolId: Long.fromString(msg.value.pool_id),
                  lowerTick: Long.fromString(lowerTick.toString()),
                  upperTick: Long.fromString(upperTick.toString()),
                  tokensProvided: sortedCoins,
                  tokenMinAmount0: token_min_amount0,
                  tokenMinAmount1: token_min_amount1,
                }).finish(),
            },
          ],
        };
      },
      memo,
      {
        amount: [],
        gas: this._msgOpts.clCreatePosition.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
            .balances.forEach((bal) => {
              bal.waitFreshResponse();
            });
          this.queries.queryPools.getPool(poolId)?.waitFreshResponse();
          this.queries.queryAccountsPositions
            .get(this.base.bech32Address)
            ?.waitFreshResponse();
        }

        onFulfill?.(tx);
      }
    );
  }

  /**
   * Adds to a concentrated liquidity position, if successful replacing the old position with a new position and ID.
   *
   * @param positionId Position ID.
   * @param amount0 Integer amount of token0 to add to the position.
   * @param amount1 Integer amount of token1 to add to the position.
   * @param maxSlippage Max token amounts slippage as whole %. Default `2.5`, meaning 2.5%.
   * @param memo Optional memo to add to the transaction.
   * @param onFulfill Optional callback to be called when tx is fulfilled.
   */
  async sendAddToConcentratedLiquidityPositionMsg(
    positionId: string,
    amount0: string,
    amount1: string,
    maxSlippage = DEFAULT_SLIPPAGE,
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    // refresh position
    const queryPosition =
      this.queries.queryLiquidityPositionsById.getForPositionId(positionId);
    await queryPosition.waitFreshResponse();

    const amount0WithSlippage = new Dec(amount0)
      .mul(new Dec(1).sub(new Dec(maxSlippage).quo(new Dec(100))))
      .truncate()
      .toString();
    const amount1WithSlippage = new Dec(amount1)
      .mul(new Dec(1).sub(new Dec(maxSlippage).quo(new Dec(100))))
      .truncate()
      .toString();

    const aminoMsg = {
      type: this._msgOpts.clAddToConcentratedPosition.type,
      value: {
        position_id: positionId,
        sender: this.base.bech32Address,
        amount0: amount0,
        amount1: amount1,
        token_min_amount0: amount0WithSlippage,
        token_min_amount1: amount1WithSlippage,
      },
    };

    const protoMsg = {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgAddToPosition",
      value: osmosis.concentratedliquidity.v1beta1.MsgAddToPosition.encode({
        positionId: Long.fromString(aminoMsg.value.position_id),
        sender: aminoMsg.value.sender,
        amount0: aminoMsg.value.amount0,
        amount1: aminoMsg.value.amount1,
        tokenMinAmount0: aminoMsg.value.token_min_amount0,
        tokenMinAmount1: aminoMsg.value.token_min_amount1,
      }).finish(),
    };

    await this.base.cosmos.sendMsgs(
      "clAddToPosition",
      {
        aminoMsgs: [aminoMsg],
        protoMsgs: [protoMsg],
      },
      memo,
      {
        amount: [],
        gas: this._msgOpts.clAddToConcentratedPosition.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // refresh relevant balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
            .balances.forEach((bal) => {
              if (
                bal.balance.currency.coinMinimalDenom ===
                  queryPosition.baseAsset?.currency.coinMinimalDenom ||
                bal.balance.currency.coinMinimalDenom ===
                  queryPosition.quoteAsset?.currency.coinMinimalDenom
              )
                bal.waitFreshResponse();
            });

          // refresh all user positions since IDs shift after adding to a position
          queries.osmosis?.queryAccountsPositions
            .get(this.base.bech32Address)
            .waitFreshResponse();
        }

        onFulfill?.(tx);
      }
    );
  }

  /**
   * Withdraw all or some liquidity from a position.
   *
   * @param positionId ID of the position to withdraw from.
   * @param liquidityAmount L value of liquidity to withdraw, can be derived from liquidity of position.
   * @param memo Memo of the transaction.
   * @param onFulfill Callback to handle tx fullfillment given raw response.
   * @returns
   */
  async sendWithdrawConcentratedLiquidityPositionMsg(
    positionId: string,
    liquidityAmount: Dec,
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const aminoMsg = {
      type: this._msgOpts.clWithdrawPosition.type,
      value: {
        position_id: positionId,
        sender: this.base.bech32Address,
        liquidity_amount: liquidityAmount.toString(),
      },
    };

    const protoMsg = {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition",
      value: osmosis.concentratedliquidity.v1beta1.MsgWithdrawPosition.encode({
        positionId: Long.fromString(aminoMsg.value.position_id),
        sender: aminoMsg.value.sender,
        liquidityAmount: this.changeDecStringToProtoBz(
          new Dec(aminoMsg.value.liquidity_amount)
            .mul(
              DecUtils.getTenExponentNInPrecisionRange(
                aminoMsg.value.liquidity_amount.split(".")[1]?.length ?? 0
              )
            )
            .truncate()
            .toString()
        ),
      }).finish(),
    };

    return this.base.cosmos.sendMsgs(
      "clWithdrawPosition",
      { aminoMsgs: [aminoMsg], protoMsgs: [protoMsg] },
      memo,
      {
        amount: [],
        gas: this._msgOpts.clWithdrawPosition.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          const queries = this.queriesStore.get(this.chainId);
          const queryPosition =
            this.queries.queryLiquidityPositionsById.getForPositionId(
              positionId
            );
          queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
            .balances.forEach((bal) => {
              if (
                queryPosition.baseAsset?.currency.coinMinimalDenom ===
                  bal.currency.coinMinimalDenom ||
                queryPosition.quoteAsset?.currency.coinMinimalDenom ===
                  bal.currency.coinMinimalDenom
              )
                bal.waitFreshResponse();
            });

          queries.osmosis?.queryAccountsPositions
            .get(this.base.bech32Address)
            .waitFreshResponse();
        }

        onFulfill?.(tx);
      }
    );
  }

  /**
   * Collects rewards from given positions by ID if rewards are available.
   * Also collects incentive rewards by default if rewards are available.
   * Constructs a multi msg as necessary.
   *
   * Rejects without sending a tx if no rewards are available.
   *
   * @param positionIds Position IDs to collect rewards from.
   * @param alsoCollectIncentiveRewards Whether to also collect incentive rewards.
   * @param memo Memo.
   * @param onFulfill Callback to handle tx fullfillment given raw response.
   */
  async sendCollectAllPositionsRewardsMsgs(
    positionIds: string[],
    alsoCollectIncentiveRewards = true,
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    // refresh positions
    const queryPositions =
      this.queries.queryLiquidityPositionsById.getForPositionIds(positionIds);
    await Promise.all(queryPositions.map((q) => q.waitFreshResponse()));

    // only collect rewards from positions that have rewards to save gas
    type PositionsIdsWithRewards = {
      positionIdsWithSpreadRewards: string[];
      positionIdsWithIncentiveRewards: string[];
    };
    const { positionIdsWithSpreadRewards, positionIdsWithIncentiveRewards } =
      queryPositions.reduce<PositionsIdsWithRewards>(
        (accumulator, position) => {
          if (position.claimableSpreadRewards.length > 0) {
            accumulator.positionIdsWithSpreadRewards.push(position.id);
          }
          if (position.claimableIncentiveRewards.length > 0) {
            accumulator.positionIdsWithIncentiveRewards.push(position.id);
          }
          return accumulator;
        },
        {
          positionIdsWithSpreadRewards: [],
          positionIdsWithIncentiveRewards: [],
        }
      );

    // get msgs info, calculate estimated gas amount based on the number of positions
    const spreadRewardsMsgOpts = this._msgOpts.clCollectPositionsSpreadRewards(
      positionIdsWithSpreadRewards.length
    );
    const incentiveRewardsMsgOpts =
      this._msgOpts.clCollectPositionsIncentivesRewards(
        positionIdsWithIncentiveRewards.length
      );

    // construct amino msgs for legacy purposes
    const spreadRewardsMsgAmino = {
      type: spreadRewardsMsgOpts.type,
      value: {
        sender: this.base.bech32Address,
        position_ids: positionIdsWithSpreadRewards,
      },
    };
    const incentiveRewardsMsgAmino = {
      type: incentiveRewardsMsgOpts.type,
      value: {
        sender: this.base.bech32Address,
        position_ids: positionIdsWithIncentiveRewards,
      },
    };

    // reject if no rewards to collect
    if (
      positionIdsWithSpreadRewards.length === 0 &&
      positionIdsWithIncentiveRewards.length === 0
    ) {
      return Promise.reject("No rewards to collect");
    }

    await this.base.cosmos.sendMsgs(
      "collectAllPositionsRewards",
      () => {
        // construct proto msgs
        const spreadRewardsMsgProto = {
          typeUrl:
            "/osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewards",
          value:
            osmosis.concentratedliquidity.v1beta1.MsgCollectSpreadRewards.encode(
              {
                sender: this.base.bech32Address,
                positionIds: positionIdsWithSpreadRewards.map((id) =>
                  Long.fromString(id)
                ),
              }
            ).finish(),
        };
        const incentiveRewardsMsgProto = {
          typeUrl:
            "/osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives",
          value:
            osmosis.concentratedliquidity.v1beta1.MsgCollectIncentives.encode({
              sender: this.base.bech32Address,
              positionIds: positionIdsWithIncentiveRewards.map((id) =>
                Long.fromString(id)
              ),
            }).finish(),
        };

        // only accumulate collection msgs that have rewards
        const aminoMsgs: { type: string; value: Record<string, any> }[] = [];
        const protoMsgs: { typeUrl: string; value: any }[] = [];
        if (positionIdsWithSpreadRewards.length > 0) {
          aminoMsgs.push(spreadRewardsMsgAmino);
          protoMsgs.push(spreadRewardsMsgProto);
        }
        if (
          positionIdsWithIncentiveRewards.length > 0 &&
          alsoCollectIncentiveRewards
        ) {
          aminoMsgs.push(incentiveRewardsMsgAmino);
          protoMsgs.push(incentiveRewardsMsgProto);
        }

        return {
          aminoMsgs,
          protoMsgs,
        };
      },
      memo,
      {
        amount: [],
        gas: (
          spreadRewardsMsgOpts.gas + incentiveRewardsMsgOpts.gas
        ).toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
            .balances.forEach((bal) => {
              bal.waitFreshResponse();
            });
          this.queries.queryAccountsPositions
            .get(this.base.bech32Address)
            ?.waitFreshResponse();

          positionIds.forEach((id) => {
            this.queries.queryLiquidityPositionsById
              .getForPositionId(id)
              ?.waitFreshResponse();
          });
        }

        onFulfill?.(tx);
      }
    );
  }

  /**
   *
   * @param routes Routes to split swap through.
   * @param tokenIn Token swapping in.
   * @param tokenOutMinAmount Minimum amount of token out expected.
   * @param memo Transaction memo.
   * @param stdFee Fee options.
   * @param signOptions Signing options.
   * @param onFulfill Callback to handle tx fullfillment given raw response.
   */
  async sendSplitRouteSwapExactAmountInMsg(
    routes: {
      pools: {
        id: string;
        tokenOutDenom: string;
      }[];
      tokenInAmount: string;
    }[],
    tokenIn: { currency: Currency },
    tokenOutMinAmount: string,
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    signOptions?: KeplrSignOptions,
    onFulfill?: (tx: any) => void
  ) {
    const numPools = routes.reduce((acc, route) => acc + route.pools.length, 0);
    await this.base.cosmos.sendMsgs(
      "splitRouteSwapExactAmountIn",
      () => {
        const msg = Msgs.Amino.makeSplitRouteSwapExactAmountInMsg(
          this._msgOpts.splitRouteSwapExactAmountIn(numPools),
          this.base.bech32Address,
          routes,
          tokenIn.currency.coinMinimalDenom,
          tokenOutMinAmount
        );

        return {
          aminoMsgs: [msg],
          protoMsgs: [
            {
              typeUrl:
                "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn",
              value:
                osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn.encode(
                  {
                    sender: msg.value.sender,
                    routes: msg.value.routes.map((route) => ({
                      pools: route.pools.map((pool) => ({
                        poolId: Long.fromString(pool.pool_id),
                        tokenOutDenom: pool.token_out_denom,
                      })),
                      tokenInAmount: route.token_in_amount,
                    })),
                    tokenInDenom: msg.value.token_in_denom,
                    tokenOutMinAmount: msg.value.token_out_min_amount,
                  }
                ).finish(),
            },
          ],
        };
      },
      memo,
      {
        amount: stdFee.amount ?? [],
        gas:
          stdFee.gas ??
          this._msgOpts.splitRouteSwapExactAmountIn(numPools).gas.toString(),
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
                routes
                  .flatMap(({ pools }) => pools)
                  .find(
                    (pool) =>
                      pool.tokenOutDenom === bal.currency.coinMinimalDenom
                  )
              ) {
                bal.waitFreshResponse();
              }
            });

          routes
            .flatMap(({ pools }) => pools)
            .forEach(({ id: poolId }) => {
              queries.osmosis?.queryPools.getPool(poolId)?.waitFreshResponse();
            });

          queries.osmosis?.queryAccountsPositions
            .get(this.base.bech32Address)
            .waitFreshResponse();
        }

        onFulfill?.(tx);
      }
    );
  }

  /**
   * Perform swap through one or more pools, with a desired input token.
   *
   * https://docs.osmosis.zone/developing/modules/spec-gamm.html#swap-exact-amount-in
   * @param pools Desired pools to swap through.
   * @param tokenIn Token being swapped.
   * @param tokenOutMinAmount Min out amount.
   * @param memo Transaction memo.
   * @param stdFee Fee options.
   * @param signOptions Signing options.
   * @param onFulfill Callback to handle tx fullfillment given raw response.
   */
  async sendSwapExactAmountInMsg(
    pools: {
      id: string;
      tokenOutDenom: string;
    }[],
    tokenIn: { currency: Currency; amount: string },
    tokenOutMinAmount: string,
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    signOptions?: KeplrSignOptions,
    onFulfill?: (tx: any) => void
  ) {
    await this.base.cosmos.sendMsgs(
      "swapExactAmountIn",
      async () => {
        // make message with estimated min out amounts
        const msg = Msgs.Amino.makeSwapExactAmountInMsg(
          this._msgOpts.swapExactAmountIn(pools.length),
          this.base.bech32Address,
          tokenIn,
          pools,
          tokenOutMinAmount
        );

        // encode proto messages from amino msg data
        return {
          aminoMsgs: [msg],
          protoMsgs: [
            {
              typeUrl: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn",
              value: osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn.encode({
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
          this._msgOpts.swapExactAmountIn(pools.length).gas.toString(),
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
                pools.find(
                  (pool) => pool.tokenOutDenom === bal.currency.coinMinimalDenom
                )
              ) {
                bal.waitFreshResponse();
              }
            });

          pools.forEach(({ id: poolId }) => {
            queries.osmosis?.queryPools.getPool(poolId)?.waitFreshResponse();
          });

          queries.osmosis?.queryAccountsPositions
            .get(this.base.bech32Address)
            .waitFreshResponse();
        }

        onFulfill?.(tx);
      }
    );
  }

  /**
   * https://docs.osmosis.zone/developing/modules/spec-gamm.html#swap-exact-amount-out
   * @param pools Desired pools to swap through.
   * @param tokenOut Token specified out.
   * @param tokenInMaxAmount Max token in.
   * @param memo Transaction memo.
   * @param stdFee Fee options.
   * @param signOptions Signing options.
   * @param onFulfill Callback to handle tx fullfillment given raw response.
   */
  async sendSwapExactAmountOutMsg(
    pools: {
      id: string;
      tokenInDenom: string;
    }[],
    tokenOut: { currency: Currency; amount: string },
    tokenInMaxAmount: string,
    memo: string = "",
    stdFee: Partial<StdFee> = {},
    signOptions?: KeplrSignOptions,
    onFulfill?: (tx: any) => void
  ) {
    await this.base.cosmos.sendMsgs(
      "swapExactAmountOut",
      async () => {
        const msg = Msgs.Amino.makeSwapExactAmountOutMsg(
          tokenOut,
          pools,
          tokenInMaxAmount,
          this._msgOpts.swapExactAmountOut(pools.length),
          this.base.bech32Address
        );

        return {
          aminoMsgs: [msg],
          protoMsgs: [
            {
              typeUrl: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut",
              value: osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut.encode({
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
          this._msgOpts.swapExactAmountIn(pools.length).gas.toString(),
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
                pools.some(
                  ({ tokenInDenom }) =>
                    tokenInDenom === bal.currency.coinMinimalDenom
                ) ||
                bal.currency.coinMinimalDenom ===
                  tokenOut.currency.coinMinimalDenom
              ) {
                bal.waitFreshResponse();
              }
            });

          pools.forEach(({ id }) =>
            this.queries.queryPools.getPool(id)?.waitFreshResponse()
          );

          queries.osmosis?.queryAccountsPositions
            .get(this.base.bech32Address)
            .waitFreshResponse();
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
   * @param onFulfill Callback to handle tx fullfillment given raw response.
   */
  async sendExitPoolMsg(
    poolId: string,
    shareInAmount: string,
    maxSlippage: string = DEFAULT_SLIPPAGE,
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const queries = this.queries;
    const mkp = this.makeCoinPretty;

    await this.base.cosmos.sendMsgs(
      "exitPool",
      async () => {
        const queryPool = queries.queryPools.getPool(poolId);

        if (!queryPool) {
          throw new Error(`Pool #${poolId} not found`);
        }

        await queryPool.waitFreshResponse();

        const pool = queryPool.sharePool;
        if (!pool) {
          throw new Error("Unknown pool");
        }

        const estimated = OsmosisMath.estimateExitSwap(
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
            pool_id: pool.id,
            share_in_amount: new Dec(shareInAmount)
              .mul(
                DecUtils.getTenExponentNInPrecisionRange(
                  this._msgOpts.exitPool.shareCoinDecimals
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
              typeUrl: "/osmosis.gamm.v1beta1.MsgExitPool",
              value: osmosis.gamm.v1beta1.MsgExitPool.encode({
                sender: msg.value.sender,
                poolId: Long.fromString(msg.value.pool_id),
                shareInAmount: msg.value.share_in_amount,
                tokenOutMins: msg.value.token_out_mins,
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
            .balances.forEach((balance) => balance.waitFreshResponse());

          this.queries.queryPools.getPool(poolId)?.waitFreshResponse();
        }

        onFulfill?.(tx);
      }
    );
  }

  /**
   * Automatically migrates **locked OR unlocked** shares to full range concentrated position.
   * With lock IDs, will send a separate migrate message per given ID.
   * Handles superfluid stake status.
   *
   * @param poolId Id of pool to exit.
   * @param lockIds Locks to migrate. If migrating unlocked shares, leave undefined.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fullfillment given raw response.
   */
  async sendMigrateSharesToFullRangeConcentratedPositionMsgs(
    poolId: string,
    lockIds: string[] | undefined,
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const queryPool = this.queries.queryPools.getPool(poolId);

    if (!Boolean(queryPool) || !queryPool) {
      throw new Error("Unknown pool");
    }

    const multiMsgs: ProtoMsgsOrWithAminoMsgs = {
      aminoMsgs: [],
      protoMsgs: [],
    };

    // refresh data
    const accountLocked = this.queries.queryAccountLocked.get(
      this.base.bech32Address
    );
    await accountLocked.waitFreshResponse();
    await queryPool.waitFreshResponse();

    const queryBalances = this.queriesStore
      .get(this.chainId)
      .queryBalances.getQueryBech32Address(this.base.bech32Address);

    (lockIds ?? ["0"]).forEach((lockId) => {
      // ensure the lock ID is associated with the account, and that the coins locked are gamm shares
      // if lock is 0, the shares are not unlocked and are in bank
      const poolGammShares =
        lockId === "0"
          ? queryBalances.getBalanceFromCurrency(queryPool.shareCurrency)
          : accountLocked.lockedCoins.filter(
              ({ amount, lockIds }) =>
                amount.denom.includes(`gamm/${poolId}`) &&
                lockIds.includes(lockId)
            )?.[0].amount;
      if (!poolGammShares || queryPool?.sharePool?.totalShare) return;

      const poolAssets = queryPool?.poolAssets.map(({ amount }) => ({
        denom: amount.currency.coinMinimalDenom,
        amount: new Int(amount.toCoin().amount),
      }));
      if (!poolAssets) throw new Error("Unknown pool assets");

      // estimate exit pool for each locked share in pool
      const estimated = OsmosisMath.estimateExitSwap(
        {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          totalShare: queryPool!.sharePool!.totalShare,
          poolAssets,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          exitFee: queryPool!.exitFee.toDec(),
        },
        this.makeCoinPretty,
        poolGammShares.toCoin().amount,
        poolGammShares.currency.coinDecimals
      );

      multiMsgs.aminoMsgs.push({
        type: this._msgOpts.unlockAndMigrateSharesToFullRangeConcentratedPosition(
          1
        ).type,
        value: {
          sender: this.base.bech32Address,
          lock_id: lockId,
          shares_to_migrate: {
            denom: poolGammShares.currency.coinMinimalDenom,
            amount: poolGammShares.toCoin().amount,
          },
          token_out_mins: estimated.tokenOuts.map((tokenOut) => ({
            denom: tokenOut.currency.coinMinimalDenom,
            amount: tokenOut.toCoin().amount,
          })),
        },
      });

      multiMsgs.protoMsgs.push({
        typeUrl:
          "/osmosis.superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition",
        value:
          osmosis.superfluid.MsgUnlockAndMigrateSharesToFullRangeConcentratedPosition.encode(
            {
              lockId: Long.fromString(lockId),
              sender: this.base.bech32Address,
              sharesToMigrate: {
                denom: poolGammShares.currency.coinMinimalDenom,
                amount: poolGammShares.toCoin().amount,
              },
              tokenOutMins: estimated.tokenOuts.map((tokenOut) => ({
                denom: tokenOut.currency.coinMinimalDenom,
                amount: tokenOut.toCoin().amount,
              })),
            }
          ).finish(),
      });
    });

    await this.base.cosmos.sendMsgs(
      "unlockAndMigrateToFullRangePosition",
      multiMsgs,
      memo,
      {
        amount: [],
        gas: this._msgOpts
          .unlockAndMigrateSharesToFullRangeConcentratedPosition(
            multiMsgs.aminoMsgs.length
          )
          .gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.base.bech32Address)
            .balances.forEach((balance) => balance.waitFreshResponse());

          // refresh pool that was exited
          queryPool?.waitFreshResponse();

          // refresh removed locked coins and new account positions
          this.queries.queryAccountLocked
            .get(this.base.bech32Address)
            .waitFreshResponse();
          this.queries.queryAccountsPositions
            .get(this.base.bech32Address)
            .waitFreshResponse();
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
   * @param onFulfill Callback to handle tx fullfillment given raw response.
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
            .balances.forEach((balance) => balance.waitFreshResponse());

          // Refresh the locked coins
          this.queries.queryLockedCoins
            .get(this.base.bech32Address)
            .waitFreshResponse();
          this.queries.queryAccountLocked
            .get(this.base.bech32Address)
            .waitFreshResponse();
        }

        onFulfill?.(tx);
      }
    );
  }

  /** https://docs.osmosis.zone/overview/osmo.html#superfluid-staking
   * @param lockIds Ids of LP bonded locks.
   * @param validatorAddress Bech32 address of validator to delegate to.
   * @param memo Tx memo.
   * @param onFulfill Callback to handle tx fullfillment given raw response.
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
            .balances.forEach((balance) => balance.waitFreshResponse());

          queries.osmosis?.queryAccountLocked
            .get(this.base.bech32Address)
            .waitFreshResponse();

          queries.cosmos.queryValidators
            .getQueryStatus(BondStatus.Bonded)
            .waitFreshResponse();

          queries.osmosis?.querySuperfluidDelegations
            .getQuerySuperfluidDelegations(this.base.bech32Address)
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
   * @param onFulfill Callback to handle tx fullfillment given raw response.
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
            .balances.forEach((balance) => balance.waitFreshResponse());

          // Refresh the locked coins
          queries.osmosis?.queryLockedCoins
            .get(this.base.bech32Address)
            .waitFreshResponse();
          queries.osmosis?.queryAccountLocked
            .get(this.base.bech32Address)
            .waitFreshResponse();

          queries.osmosis?.querySuperfluidDelegations
            .getQuerySuperfluidDelegations(this.base.bech32Address)
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
   * @param onFulfill Callback to handle tx fullfillment given raw response.
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
            .balances.forEach((balance) => balance.waitFreshResponse());

          // Refresh the locked coins
          this.queries.queryLockedCoins
            .get(this.base.bech32Address)
            .waitFreshResponse();
          this.queries.queryUnlockingCoins
            .get(this.base.bech32Address)
            .waitFreshResponse();
          this.queries.queryAccountLocked
            .get(this.base.bech32Address)
            .waitFreshResponse();
        }

        onFulfill?.(tx);
      }
    );
  }

  /**
   * https://docs.osmosis.zone/developing/osmosis-core/modules/spec-superfluid.html#superfluid-unbond-lock
   * @param locks IDs and whether the lock is synthetic
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fullfillment given raw response.
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
            .balances.forEach((balance) => balance.waitFreshResponse());

          // Refresh the locked coins
          queries.osmosis?.queryLockedCoins
            .get(this.base.bech32Address)
            .waitFreshResponse();
          queries.osmosis?.queryUnlockingCoins
            .get(this.base.bech32Address)
            .waitFreshResponse();
          queries.osmosis?.queryAccountLocked
            .get(this.base.bech32Address)
            .waitFreshResponse();

          queries.osmosis?.querySuperfluidDelegations
            .getQuerySuperfluidDelegations(this.base.bech32Address)
            .waitFreshResponse();
          queries.osmosis?.querySuperfluidUndelegations
            .getQuerySuperfluidDelegations(this.base.bech32Address)
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
            .waitFreshResponse();
          queries.osmosis?.queryUnlockingCoins
            .get(this.base.bech32Address)
            .waitFreshResponse();
          queries.osmosis?.queryAccountLocked
            .get(this.base.bech32Address)
            .waitFreshResponse();

          queries.osmosis?.querySuperfluidDelegations
            .getQuerySuperfluidDelegations(this.base.bech32Address)
            .waitFreshResponse();
          queries.osmosis?.querySuperfluidUndelegations
            .getQuerySuperfluidDelegations(this.base.bech32Address)
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

export * from "./msg-opts";
