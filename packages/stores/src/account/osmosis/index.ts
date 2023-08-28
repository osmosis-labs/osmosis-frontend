import { EncodeObject } from "@cosmjs/proto-signing";
import {
  ChainGetter,
  CosmosQueries,
  IQueriesStore,
} from "@keplr-wallet/stores";
import { BondStatus } from "@keplr-wallet/stores/build/query/cosmos/staking/types";
import { Currency, KeplrSignOptions } from "@keplr-wallet/types";
import { Coin, CoinPretty, Dec, DecUtils, Int } from "@keplr-wallet/unit";
import * as OsmosisMath from "@osmosis-labs/math";
import { Duration } from "@osmosis-labs/proto-codecs/build/codegen/google/protobuf/duration";
import deepmerge from "deepmerge";
import Long from "long";
import { DeepPartial } from "utility-types";

import { AccountStore, CosmosAccount, CosmwasmAccount } from "../../account";
import { OsmosisQueries } from "../../queries";
import { QueriesExternalStore } from "../../queries-external";
import { DeliverTxResponse } from "../types";
import { findNewClPositionId } from "./tx-response";
import { DEFAULT_SLIPPAGE, osmosisMsgOpts } from "./types";

export interface OsmosisAccount {
  osmosis: OsmosisAccountImpl;
}
export const OsmosisAccount = {
  use(options: {
    msgOptsCreator?: (
      chainId: string
    ) => DeepPartial<typeof osmosisMsgOpts> | undefined;
    queriesStore: IQueriesStore<CosmosQueries & OsmosisQueries>;
    queriesExternalStore?: QueriesExternalStore;
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
          ),
          options.queriesExternalStore
        ),
      };
    };
  },
};

export class OsmosisAccountImpl {
  constructor(
    protected readonly base: AccountStore<
      [OsmosisAccount, CosmosAccount, CosmwasmAccount]
    >,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: IQueriesStore<
      CosmosQueries & OsmosisQueries
    >,
    readonly msgOpts: typeof osmosisMsgOpts,
    protected readonly queriesExternalStore?: QueriesExternalStore
  ) {}

  private get address() {
    return this.base.getWallet(this.chainId)?.address ?? "";
  }

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
      undefined,
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          this.queries.queryPools.waitFreshResponse();
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
    const msg = this.msgOpts.createConcentratedPool.messageComposer({
      denom0,
      denom1,
      sender: this.address,
      spreadFactor: new Dec(spreadFactor).toString(),
      tickSpacing: BigInt(tickSpacing),
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "createConcentratedPool",
      [msg],
      memo,
      undefined,
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          this.queries.queryPools.waitFreshResponse();
          queries.queryBalances
            .getQueryBech32Address(this.address)
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
    const sortedScalingFactors: bigint[] = [];
    initialPoolLiquidity.forEach((asset) => {
      const scalingFactor = scalingFactorsMap.get(asset.denom);
      if (!scalingFactor) {
        throw new Error(
          `Scaling factor for asset ${asset.denom} missing in scalingFactorsMap`
        );
      }

      sortedScalingFactors.push(BigInt(scalingFactor.toString()));
    });

    const msg = this.msgOpts.createStableswapPool.messageComposer({
      sender: this.address,
      futurePoolGovernor: "24h",
      scalingFactors: sortedScalingFactors,
      initialPoolLiquidity,
      /**
       * Empty string provoke a message discrepancy between the amino and proto message.
       * Telescope team has been notified. While awaiting a fix, set the type to any.
       * */
      scalingFactorController: scalingFactorControllerAddress as any,
      poolParams,
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "createStableswapPool",
      [msg],
      memo,
      undefined,
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          this.queries.queryPools.waitFreshResponse();
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

    await this.base.signAndBroadcast(
      this.chainId,
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
          poolId: BigInt(poolId),
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
      undefined,
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

    await this.base.signAndBroadcast(
      this.chainId,
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
          poolId: BigInt(poolId),
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
      undefined,
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
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
   * @param lowerTick Lower tick index.
   * @param upperTick Upper tick index.
   * @param superfluidValidatorAddress Optional superfluid validator address if superfluid staking this position.
   * @param baseDeposit Base asset currency and amount.
   * @param quoteDeposit Quote asset currency and amount.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fullfillment given raw response.
   */
  async sendCreateConcentratedLiquidityPositionMsg(
    poolId: string,
    lowerTick: Int,
    upperTick: Int,
    superfluidValidatorAddress?: string,
    baseDeposit?: { currency: Currency; amount: string },
    quoteDeposit?: { currency: Currency; amount: string },
    maxSlippage = DEFAULT_SLIPPAGE,
    memo: string = "",
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    const queries = this.queries;

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
      baseCoin = new Coin(baseDeposit.currency.coinMinimalDenom, baseAmount);
    }
    if (quoteDeposit !== undefined && quoteDeposit.amount !== undefined) {
      const quoteAmount = new Dec(quoteDeposit.amount)
        .mul(
          DecUtils.getTenExponentNInPrecisionRange(
            quoteDeposit.currency.coinDecimals
          )
        )
        .truncate();
      quoteCoin = new Coin(quoteDeposit.currency.coinMinimalDenom, quoteAmount);
    }
    const sortedCoins = [baseCoin, quoteCoin]
      .filter((coin): coin is Coin => coin !== undefined)
      .sort((a, b) => a?.denom.localeCompare(b?.denom))
      .map(({ denom, amount }) => ({ denom, amount: amount.toString() }));

    let msg;
    if (superfluidValidatorAddress) {
      // send superfluid delegate version (full range only)
      msg = this.msgOpts.clCreateSuperfluidPosition.messageComposer({
        valAddr: superfluidValidatorAddress,
        coins: sortedCoins,
        poolId: BigInt(poolId),
        sender: this.address,
      });
    } else {
      // full tolerance if 0 sqrt price so no positions
      let token_min_amount0 = "0";
      let token_min_amount1 = "0";

      // 3 cases:
      // - If position is active, consists of both tokens
      // - If position is under current tick, consists only of token 1.
      // - If position is above current tick, consists only of token 0.
      if (!queryPool.concentratedLiquidityPoolInfo?.currentSqrtPrice.isZero()) {
        const currentSqrtPrice =
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
          queryPool.concentratedLiquidityPoolInfo?.currentSqrtPrice!;

        const currentTick = OsmosisMath.priceToTick(
          currentSqrtPrice.mul(currentSqrtPrice).toDec()
        );

        const slippageMultiplier = new Dec(1).sub(
          new Dec(maxSlippage).quo(new Dec(100))
        );

        if (currentTick >= lowerTick && currentTick < upperTick) {
          // Position consists of both tokens
          token_min_amount0 = baseCoin
            ? new Dec(baseCoin.amount)
                .mul(slippageMultiplier)
                .truncate()
                .toString()
            : token_min_amount0;

          token_min_amount1 = quoteCoin
            ? new Dec(quoteCoin.amount)
                .mul(slippageMultiplier)
                .truncate()
                .toString()
            : token_min_amount1;
        } else if (currentTick < lowerTick) {
          // Position consists of 1 token only.
          token_min_amount0 = baseCoin
            ? new Dec(baseCoin.amount)
                .mul(slippageMultiplier)
                .truncate()
                .toString()
            : token_min_amount0;
        } else if (currentTick >= upperTick) {
          // Position consists of 1 token only.
          token_min_amount1 = quoteCoin
            ? new Dec(quoteCoin.amount)
                .mul(slippageMultiplier)
                .truncate()
                .toString()
            : token_min_amount1;
        }
      }

      // create position message with custom price range
      msg = this.msgOpts.clCreatePosition.messageComposer({
        poolId: BigInt(poolId),
        lowerTick: BigInt(lowerTick.toString()),
        upperTick: BigInt(upperTick.toString()),
        sender: this.address,
        tokenMinAmount0: token_min_amount0,
        tokenMinAmount1: token_min_amount1,
        tokensProvided: sortedCoins,
      });
    }
    await this.base.signAndBroadcast(
      this.chainId,
      superfluidValidatorAddress
        ? "clCreateSuperfluidPosition"
        : "clCreatePosition",
      [msg],
      memo,
      undefined,
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((bal) => {
              bal.waitFreshResponse();
            });
          this.queries.queryPools.getPool(poolId)?.waitFreshResponse();
          this.queries.queryAccountsPositions
            .get(this.address)
            ?.waitFreshResponse();

          // refresh metrics of new position
          const newPositionID = findNewClPositionId(tx);
          if (newPositionID) {
            setTimeout(() => {
              this.queriesExternalStore?.queryPositionsPerformaceMetrics
                .get(newPositionID)
                ?.waitFreshResponse();
            }, 30_000);
          }

          if (superfluidValidatorAddress) {
            this.queries?.queryAccountsSuperfluidDelegatedPositions
              .get(this.address)
              .waitFreshResponse();
          }
        }
        onFulfill?.(tx);
      }
    );
  }

  /**
   * Stake an existing full range concentrated liquidity position to given validator.
   * This is achieved by withdrawing the full position in one message, and creating + staking in another.
   *
   * @param positionId Position ID to stake.
   * @param validatorAddress Validator address to stake to.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fullfillment given raw response.
   */
  async sendStakeExistingPositionMsg(
    positionId: string,
    validatorAddress: string,
    memo: string = "",
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    const queryPosition =
      this.queries.queryLiquidityPositionsById.getForPositionId(positionId);
    await queryPosition.waitFreshResponse();

    const fullLiquidityAmount = queryPosition.liquidity;
    const baseAsset = queryPosition.baseAsset;
    const quoteAsset = queryPosition.quoteAsset;
    const poolId = queryPosition.poolId;

    if (!fullLiquidityAmount) throw new Error("No liquidity amount found");
    if (!poolId) throw new Error("No pool ID found");

    const withdrawPositionMsg = this.msgOpts.clWithdrawPosition.messageComposer(
      {
        positionId: BigInt(positionId),
        sender: this.address,
        liquidityAmount: fullLiquidityAmount.toString(),
      }
    );

    if (!baseAsset || !quoteAsset)
      throw new Error("No assets found in position");

    const createAndSfDelegateMsg =
      this.msgOpts.clCreateAndSuperfluidDelegatePosition.messageComposer({
        poolId: BigInt(poolId),
        coins: [
          queryPosition.baseAsset.toCoin(),
          queryPosition.quoteAsset.toCoin(),
        ].sort((a, b) => a?.denom.localeCompare(b?.denom)),
        sender: this.address,
        valAddr: validatorAddress,
      });

    await this.base.signAndBroadcast(
      this.chainId,
      "sfCreateAndStakeSuperfluidPosition",
      [withdrawPositionMsg, createAndSfDelegateMsg],
      memo,
      undefined,
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          queryPosition.waitFreshResponse();
          this.queries?.queryAccountsPositions
            .get(this.address)
            .waitFreshResponse();
          this.queries?.queryAccountsSuperfluidDelegatedPositions
            .get(this.address)
            .waitFreshResponse();
        }
        onFulfill?.(tx);
      }
    );
  }

  /**
   * Adds to a concentrated liquidity position, if successful replacing the old position with a new position and ID.
   * Handles a superfluid staked position.
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
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    // refresh position
    const queryPosition =
      this.queries.queryLiquidityPositionsById.getForPositionId(positionId);
    await queryPosition.waitFreshResponse();
    if (!queryPosition.poolId) throw new Error("Position not found");

    // get CL pool
    const queryClPool = this.queries.queryPools.getPool(queryPosition.poolId);
    if (!queryClPool) throw new Error("Pool not found");
    await queryClPool.waitResponse();

    // calculate desired amounts with slippage
    const amount0WithSlippage = new Dec(amount0)
      .mul(new Dec(1).sub(new Dec(maxSlippage).quo(new Dec(100))))
      .truncate()
      .toString();
    const amount1WithSlippage = new Dec(amount1)
      .mul(new Dec(1).sub(new Dec(maxSlippage).quo(new Dec(100))))
      .truncate()
      .toString();

    const queryDelegatedPositions =
      this.queries.queryAccountsSuperfluidDelegatedPositions.get(this.address);
    await queryDelegatedPositions.waitResponse();
    const isSuperfluidStaked =
      queryDelegatedPositions.delegatedPositionIds.includes(positionId);

    const msg = isSuperfluidStaked
      ? this.msgOpts.clAddToConcentatedSuperfluidPosition.messageComposer({
          positionId: BigInt(positionId),
          sender: this.address,
          tokenDesired0: {
            denom: queryClPool.poolAssetDenoms[0],
            amount: amount0WithSlippage,
          },
          tokenDesired1: {
            denom: queryClPool.poolAssetDenoms[1],
            amount: amount1WithSlippage,
          },
        })
      : this.msgOpts.clAddToConcentratedPosition.messageComposer({
          amount0,
          amount1,
          positionId: BigInt(positionId),
          sender: this.address,
          tokenMinAmount0: amount0WithSlippage,
          tokenMinAmount1: amount1WithSlippage,
        });

    await this.base.signAndBroadcast(
      this.chainId,
      "clAddToPosition",
      [msg],
      memo,
      undefined,
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // refresh relevant balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
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
            .get(this.address)
            .waitFreshResponse();

          // if it's staked, fetch new delegation amount and new ID
          if (isSuperfluidStaked) {
            queryDelegatedPositions.waitFreshResponse();
          }

          // refresh metrics of new position
          const newPositionID = findNewClPositionId(tx);
          if (newPositionID) {
            // wait a long time for indexer to run
            setTimeout(() => {
              this.queriesExternalStore?.queryPositionsPerformaceMetrics
                .get(newPositionID)
                ?.waitFreshResponse();
            }, 30_000);
          }
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
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    const msg = this.msgOpts.clWithdrawPosition.messageComposer({
      liquidityAmount: liquidityAmount.toString(),
      positionId: BigInt(positionId),
      sender: this.address,
    });

    return this.base.signAndBroadcast(
      this.chainId,
      "clWithdrawPosition",
      [msg],
      memo,
      undefined,
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          const queries = this.queriesStore.get(this.chainId);
          const queryPosition =
            this.queries.queryLiquidityPositionsById.getForPositionId(
              positionId
            );
          queries.queryBalances
            .getQueryBech32Address(this.address)
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
            .get(this.address)
            .waitFreshResponse();

          // refresh metrics of same position, since it's the same ID after withdrawing
          setTimeout(() => {
            this.queriesExternalStore?.queryPositionsPerformaceMetrics
              .get(positionId)
              ?.waitFreshResponse();
          }, 30_000);
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
    onFulfill?: (tx: DeliverTxResponse) => void
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
    const spreadRewardsMsgOpts = this.msgOpts.clCollectPositionsSpreadRewards;
    const incentiveRewardsMsgOpts =
      this.msgOpts.clCollectPositionsIncentivesRewards;

    const spreadRewardsMsg = spreadRewardsMsgOpts.messageComposer({
      positionIds: positionIdsWithSpreadRewards.map((val) => BigInt(val)),
      sender: this.address,
    });
    const incentiveRewardsMsg = incentiveRewardsMsgOpts.messageComposer({
      positionIds: positionIdsWithIncentiveRewards.map((val) => BigInt(val)),
      sender: this.address,
    });

    // reject if no rewards to collect
    if (
      positionIdsWithSpreadRewards.length === 0 &&
      positionIdsWithIncentiveRewards.length === 0
    ) {
      return Promise.reject("No rewards to collect");
    }

    await this.base.signAndBroadcast(
      this.chainId,
      "collectAllPositionsRewards",
      () => {
        // only accumulate collection msgs that have rewards
        const msgs: (typeof incentiveRewardsMsg | typeof spreadRewardsMsg)[] =
          [];

        if (positionIdsWithSpreadRewards.length > 0) {
          msgs.push(spreadRewardsMsg);
        }

        if (
          positionIdsWithIncentiveRewards.length > 0 &&
          alsoCollectIncentiveRewards
        ) {
          msgs.push(incentiveRewardsMsg);
        }

        return msgs;
      },
      memo,
      undefined,
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((bal) => {
              bal.waitFreshResponse();
            });
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
   * @param numTicksCrossed Number of CL ticks crossed for swap quote.
   * @param memo Transaction memo.
   * @param TxFee Fee options.
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
    signOptions?: KeplrSignOptions,
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    const msg = this.msgOpts.splitRouteSwapExactAmountIn.messageComposer({
      sender: this.address,
      routes: routes.map(({ pools, tokenInAmount }) => ({
        pools: pools.map(({ id, tokenOutDenom }) => ({
          poolId: BigInt(id),
          tokenOutDenom: tokenOutDenom,
        })),
        tokenInAmount: tokenInAmount,
      })),
      tokenInDenom: tokenIn.currency.coinMinimalDenom,
      tokenOutMinAmount,
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "splitRouteSwapExactAmountIn",
      [msg],
      memo,
      undefined,
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
            .get(this.address)
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
   * @param numTicksCrossed Number of CL ticks crossed for swap quote.
   * @param memo Transaction memo.
   * @param TxFee Fee options.
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
    signOptions?: KeplrSignOptions,
    onFulfill?: (tx: any) => void
  ) {
    const tokenInCoin = new Coin(
      tokenIn.currency.coinMinimalDenom,
      tokenIn.amount
    );
    const msg = this.msgOpts.swapExactAmountIn.messageComposer({
      sender: this.address,
      routes: pools.map(({ id, tokenOutDenom }) => {
        return {
          poolId: BigInt(id),
          tokenOutDenom: tokenOutDenom,
        };
      }),
      tokenIn: {
        denom: tokenInCoin.denom,
        amount: tokenInCoin.amount.toString(),
      },
      tokenOutMinAmount,
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "swapExactAmountIn",
      [msg],
      memo,
      undefined,
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
            .get(this.address)
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
   * @param numTicksCrossed Number of CL ticks crossed for swap quote.
   * @param memo Transaction memo.
   * @param TxFee Fee options.
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
    signOptions?: KeplrSignOptions,
    onFulfill?: (tx: any) => void
  ) {
    await this.base.signAndBroadcast(
      this.chainId,
      "swapExactAmountOut",
      async () => {
        const outUAmount = new Dec(tokenOut.amount)
          .mul(
            DecUtils.getTenExponentNInPrecisionRange(
              tokenOut.currency.coinDecimals
            )
          )
          .truncate();
        const coin = new Coin(tokenOut.currency.coinMinimalDenom, outUAmount);

        const msg = this.msgOpts.swapExactAmountOut.messageComposer({
          sender: this.address,
          tokenInMaxAmount,
          tokenOut: {
            denom: coin.denom,
            amount: coin.amount.toString(),
          },
          routes: pools.map(({ id, tokenInDenom }) => {
            return {
              poolId: BigInt(id),
              tokenInDenom,
            };
          }),
        });

        return [msg];
      },
      memo,
      undefined,
      signOptions,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
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
            .get(this.address)
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

    await this.base.signAndBroadcast(
      this.chainId,
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
          poolId: BigInt(pool.id),
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
      undefined,
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
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
   * @param lockIds Locks to migrate. If migrating unlocked shares, leave undefined or pass array value of `-1`.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fullfillment given raw response.
   */
  async sendMigrateSharesToFullRangeConcentratedPositionMsgs(
    poolId: string,
    lockIds: string[] | undefined,
    maxSlippage: string = DEFAULT_SLIPPAGE,
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const queryPool = this.queries.queryPools.getPool(poolId);

    if (!Boolean(queryPool) || !queryPool) {
      throw new Error("Unknown pool");
    }

    const multiMsgs: ReturnType<
      (typeof osmosisMsgOpts)["unlockAndMigrateSharesToFullRangeConcentratedPosition"]["messageComposer"]
    >[] = [];

    // refresh data
    const accountLocked = this.queries.queryAccountLocked.get(this.address);
    await accountLocked.waitFreshResponse();
    await queryPool.waitFreshResponse();

    const queryAccountBalances = this.queriesStore
      .get(this.chainId)
      .queryBalances.getQueryBech32Address(this.address);
    const queryPoolShares = queryAccountBalances.balances.find(
      (balance) =>
        balance.currency.coinMinimalDenom ===
        queryPool.shareCurrency.coinMinimalDenom
    );
    await queryPoolShares?.waitFreshResponse();

    (lockIds ?? ["-1"]).forEach((lockId) => {
      // ensure the lock ID is associated with the account, and that the coins locked are gamm shares
      // if lock is -1, the shares are not locked and are in bank
      const poolGammShares =
        lockId === "-1"
          ? queryPoolShares?.balance
          : accountLocked.lockedCoins
              .concat(accountLocked.unlockingCoins)
              .find(
                ({ amount, lockIds }) =>
                  amount.currency.coinMinimalDenom ===
                    queryPool.shareCurrency.coinMinimalDenom &&
                  lockIds.includes(lockId)
              )?.amount;

      if (!poolGammShares) {
        throw new Error(`User shares for pool #${poolId} not found`);
      }
      if (!queryPool?.sharePool?.totalShare) {
        throw new Error(`Pool ${poolId} missing share info`);
      }

      const poolAssets = queryPool?.poolAssets.map(({ amount }) => ({
        denom: amount.currency.coinMinimalDenom,
        amount: new Int(amount.toCoin().amount),
      }));
      if (!poolAssets) throw new Error("Unknown pool assets");

      // estimate exit pool for each locked share in pool
      const estimated = OsmosisMath.estimateExitSwap(
        {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          totalShare: queryPool.sharePool.totalShare,
          poolAssets,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          exitFee: queryPool!.exitFee.toDec(),
        },
        this.makeCoinPretty,
        poolGammShares.toDec().toString(),
        poolGammShares.currency.coinDecimals
      );

      const maxSlippageDec = new Dec(maxSlippage).quo(
        DecUtils.getTenExponentNInPrecisionRange(2)
      );
      const sortedSlippageTokenOuts = estimated.tokenOuts
        .map((tokenOut) => ({
          denom: tokenOut.currency.coinMinimalDenom,
          amount: tokenOut
            .toDec()
            .mul(new Dec(1).sub(maxSlippageDec))
            .mul(
              DecUtils.getTenExponentNInPrecisionRange(
                tokenOut.currency.coinDecimals
              )
            )
            .truncate()
            .toString(),
        }))
        .sort((a, b) => a.denom.localeCompare(b.denom));

      const msg =
        this.msgOpts.unlockAndMigrateSharesToFullRangeConcentratedPosition.messageComposer(
          {
            sender: this.address,
            lockId: BigInt(lockId),
            tokenOutMins: sortedSlippageTokenOuts,
            sharesToMigrate: {
              denom: poolGammShares.currency.coinMinimalDenom,
              amount: poolGammShares.toCoin().amount,
            },
          }
        );

      multiMsgs.push(msg);
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "unlockAndMigrateToFullRangePosition",
      multiMsgs,
      memo,
      undefined,
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // refresh pool that was exited
          queryPool.waitFreshResponse();

          // refresh relevant share balance
          this.queriesStore
            .get(this.chainId)
            .queryBalances.getQueryBech32Address(this.address)
            .balances.forEach((balance) => {
              if (
                queryPool.shareCurrency.coinMinimalDenom ===
                balance.currency.coinMinimalDenom
              ) {
                balance.waitFreshResponse();
              }
            });

          // refresh removed un/locked coins and new account positions
          this.queries.queryAccountLocked.get(this.address).waitFreshResponse();
          this.queries.queryUnlockingCoins
            .get(this.address)
            .waitFreshResponse();
          this.queries.queryAccountsPositions
            .get(this.address)
            .waitFreshResponse();

          // refresh superfluid delegation of positions
          this.queries.queryAccountsSuperfluidDelegatedPositions
            .get(this.address)
            .waitFreshResponse();
          this.queries.queryAccountsSuperfluidUndelegatingPositions
            .get(this.address)
            .waitFreshResponse();

          // refresh unbonding positions
          this.queries.queryAccountsUnbondingPositions
            .get(this.address)
            .waitFreshResponse();
        }

        onFulfill?.(tx);
      }
    );
  }

  // async sendUnbondAndConvertAndStakeMsgs(
  //   lockIds: string[],
  //   validatorAddress: string,
  //   availableGammShares: CoinPretty[] = [],
  //   memo = "",
  //   onFulfill: (tx: DeliverTxResponse) => void
  // ) {}

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

    const msg = this.msgOpts.lockTokens.messageComposer({
      owner: this.address,
      coins: primitiveTokens,
      duration: Duration.fromPartial({
        seconds: BigInt(duration),
        nanos: 0,
      }),
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "lockTokens",
      [msg],
      memo,
      undefined,
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
   * @param onFulfill Callback to handle tx fullfillment given raw response.
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
        lockId: BigInt(lockId),
        valAddr: validatorAddress,
      });
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "superfluidDelegate",
      msgs,
      memo,
      undefined,
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
      undefined,
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
   * @param onFulfill Callback to handle tx fullfillment given raw response.
   */
  async sendBeginUnlockingMsg(
    lockIds: string[],
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const msgs = lockIds.map((lockId) => {
      return this.msgOpts.beginUnlocking.messageComposer({
        owner: this.address,
        ID: BigInt(lockId),
        coins: [],
      });
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "beginUnlocking",
      msgs,
      memo,
      undefined,
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
   * Will unbond normal locks or synthetic locks if superfluid.
   *
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
    const msgs = locks.reduce((msgs, lock) => {
      if (!lock.isSyntheticLock) {
        // normal unlock
        msgs.push(
          this.msgOpts.beginUnlocking.messageComposer({
            owner: this.address,
            ID: BigInt(lock.lockId),
            coins: [],
          })
        );
      } else {
        // unbond and unlock
        msgs.push(
          this.msgOpts.superfluidUndelegate.messageComposer({
            sender: this.address,
            lockId: BigInt(lock.lockId),
          }),
          this.msgOpts.superfluidUnbondLock.messageComposer({
            sender: this.address,
            lockId: BigInt(lock.lockId),
          })
        );
      }
      return msgs;
    }, [] as EncodeObject[]);

    await this.base.signAndBroadcast(
      this.chainId,
      "beginUnlocking",
      msgs,
      memo,
      undefined,
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          const queries = this.queriesStore.get(this.chainId);

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

          // refresh superfluid pool share delegations
          queries.osmosis?.querySuperfluidDelegations
            .getQuerySuperfluidDelegations(this.address)
            .waitFreshResponse();
          queries.osmosis?.querySuperfluidUndelegations
            .getQuerySuperfluidDelegations(this.address)
            .waitFreshResponse();

          // refresh user CL positions
          queries.osmosis?.queryAccountsPositions
            .get(this.address)
            .waitFreshResponse();

          // refresh CL position delegations
          queries.osmosis?.queryAccountsSuperfluidDelegatedPositions
            .get(this.address)
            .waitFreshResponse();
          queries.osmosis?.queryAccountsSuperfluidUndelegatingPositions
            .get(this.address)
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
      poolId: BigInt(poolId),
      sender: this.address,
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "unPoolWhitelistedPool",
      [msg],
      memo,
      undefined,
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

          this.queries.queryAccountsUnbondingPositions
            .get(this.address)
            .waitFreshResponse();
        }

        onFulfill?.(tx);
      }
    );
  }

  /**
   * Method to undelegate from validator set.
   * @param coin The coin object with denom and amount to undelegate.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fulfillment given raw response.
   */
  async sendUndelegateFromValidatorSetMsg(
    coin: { amount: string; denom: Currency },
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    await this.base.signAndBroadcast(
      this.chainId,
      "undelegateFromValidatorSet",
      [
        this.msgOpts.undelegateFromValidatorSet.messageComposer({
          delegator: this.address,
          coin: {
            denom: coin.denom.coinMinimalDenom,
            amount: coin.amount,
          },
        }),
      ],
      memo,
      undefined,
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((balance) => balance.waitFreshResponse());

          queries.cosmos.queryUnbondingDelegations
            .getQueryBech32Address(this.address)
            .waitFreshResponse();
          queries.cosmos.queryDelegations
            .getQueryBech32Address(this.address)
            .waitFreshResponse();

          queries.cosmos.queryRewards
            .getQueryBech32Address(this.address)
            .waitFreshResponse();
        }
        onFulfill?.(tx);
      }
    );
  }

  /**
   * Method to delegate to validator set.
   * @param coin The coin object with denom and amount to delegate.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fulfillment given raw response.
   */
  async sendDelegateToValidatorSetMsg(
    coin: { amount: string; denom: Currency },
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    await this.base.signAndBroadcast(
      this.chainId,
      "delegateToValidatorSet",
      [
        this.msgOpts.delegateToValidatorSet.messageComposer({
          delegator: this.address,
          coin: {
            denom: coin.denom.coinMinimalDenom,
            amount: coin.amount,
          },
        }),
      ],
      memo,
      undefined,
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((balance) => balance.waitFreshResponse());

          queries.cosmos.queryDelegations
            .getQueryBech32Address(this.address)
            .waitFreshResponse();

          queries.cosmos.queryRewards
            .getQueryBech32Address(this.address)
            .waitFreshResponse();
        }
        onFulfill?.(tx);
      }
    );
  }

  /**
   * Method to withdraw delegation rewards.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fulfillment given raw response.
   */
  async sendWithdrawDelegationRewardsMsg(
    memo: string = "",
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    await this.base.signAndBroadcast(
      this.chainId,
      "withdrawDelegationRewards",
      [
        this.msgOpts.withdrawDelegationRewards.messageComposer({
          delegator: this.address,
        }),
      ],
      memo,
      {
        amount: [],
        gas: this.msgOpts.withdrawDelegationRewards.gas.toString(),
      },
      undefined,
      (tx) => {
        if (tx.code == null || tx.code === 0) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((balance) => balance.waitFreshResponse());

          queries.cosmos.queryDelegations
            .getQueryBech32Address(this.address)
            .waitFreshResponse();

          queries.cosmos.queryRewards
            .getQueryBech32Address(this.address)
            .waitFreshResponse();
        }
        onFulfill?.(tx);
      }
    );
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
