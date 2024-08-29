import type { StdFee } from "@cosmjs/amino";
import type { EncodeObject } from "@cosmjs/proto-signing";
import { AppCurrency, Currency } from "@keplr-wallet/types";
import { Coin, CoinPretty, Dec, DecUtils, Int } from "@keplr-wallet/unit";
import {
  ChainGetter,
  CosmosQueries,
  IQueriesStore,
} from "@osmosis-labs/keplr-stores";
import * as OsmosisMath from "@osmosis-labs/math";
import { maxTick, minTick } from "@osmosis-labs/math";
import {
  makeAddAuthenticatorMsg,
  makeAddToConcentratedLiquiditySuperfluidPositionMsg,
  makeAddToPositionMsg,
  makeBeginUnlockingMsg,
  makeCollectIncentivesMsg,
  makeCollectSpreadRewardsMsg,
  makeCreateBalancerPoolMsg,
  makeCreateConcentratedPoolMsg,
  makeCreateFullRangePositionAndSuperfluidDelegateMsg,
  makeCreatePositionMsg,
  makeCreateStableswapPoolMsg,
  makeDelegateToValidatorSetMsg,
  makeExitPoolMsg,
  makeJoinPoolMsg,
  makeJoinSwapExternAmountInMsg,
  makeLockAndSuperfluidDelegateMsg,
  makeLockTokensMsg,
  makeRemoveAuthenticatorMsg,
  makeSetValidatorSetPreferenceMsg,
  makeSplitRoutesSwapExactAmountInMsg,
  makeSplitRoutesSwapExactAmountOutMsg,
  makeSuperfluidDelegateMsg,
  makeSuperfluidUnbondLockMsg,
  makeSuperfluidUndelegateMsg,
  makeSwapExactAmountInMsg,
  makeSwapExactAmountOutMsg,
  makeUndelegateFromRebalancedValidatorSetMsg,
  makeUndelegateFromValidatorSetMsg,
  makeWithdrawDelegationRewardsMsg,
  makeWithdrawPositionMsg,
} from "@osmosis-labs/tx";
import { BondStatus } from "@osmosis-labs/types";
import Long from "long";

import { AccountStore, CosmosAccount, CosmwasmAccount } from "../../account";
import { OsmosisQueries } from "../../queries";
import { QueriesExternalStore } from "../../queries-external";
import { DeliverTxResponse, SignOptions } from "../types";
import { findNewClPositionId } from "./tx-response";

const DEFAULT_SLIPPAGE = "2.5";

export interface OsmosisAccount {
  osmosis: OsmosisAccountImpl;
}

export const OsmosisAccount = {
  use(options: {
    queriesStore: IQueriesStore<CosmosQueries & OsmosisQueries>;
    queriesExternalStore?: QueriesExternalStore;
  }): (
    base: AccountStore<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>,
    chainGetter: ChainGetter,
    chainId: string
  ) => OsmosisAccount {
    return (base, chainGetter, chainId) => {
      return {
        osmosis: new OsmosisAccountImpl(
          base,
          chainGetter,
          chainId,
          options.queriesStore,
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
    onFulfill?: (tx: DeliverTxResponse) => void
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

    const msg = await makeCreateBalancerPoolMsg({
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
        if (!tx.code) {
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
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    const msg = await makeCreateConcentratedPoolMsg({
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
        if (!tx.code) {
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
    onFulfill?: (tx: DeliverTxResponse) => void
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

    const msg = await makeCreateStableswapPoolMsg({
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
        if (!tx.code) {
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
    onFulfill?: (tx: DeliverTxResponse) => void
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
          makeJoinPoolMsg.shareCoinDecimals
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

        const msg = await makeJoinPoolMsg({
          poolId: BigInt(poolId),
          sender: this.address,
          shareOutAmount: new Dec(shareOutAmount)
            .mul(
              DecUtils.getTenExponentNInPrecisionRange(
                makeJoinPoolMsg.shareCoinDecimals
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
        if (!tx.code) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((bal) => {
              // TODO: Explicitly refresh the share expected to be minted and provided to the pool.
              bal.waitFreshResponse();
            });

          this.queries.queryGammPoolShare.fetch(this.address);

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
    onFulfill?: (tx: DeliverTxResponse) => void
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
          makeJoinSwapExternAmountInMsg.shareCoinDecimals
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

        const msg = await makeJoinSwapExternAmountInMsg({
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
        if (!tx.code) {
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((bal) => {
              bal.waitFreshResponse();
            });
          this.queries.queryGammPoolShare.fetch(this.address);

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
    maxSlippage = "15",
    memo: string = "",
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    const queries = this.queries;

    const queryPool = queries.queryPools.getPool(poolId);
    if (!queryPool) {
      throw new Error(`Pool #${poolId} not found`);
    }

    const type = queryPool.pool.type;
    const clInfo = queryPool.concentratedLiquidityPoolInfo;
    if (type !== "concentrated" || !clInfo) {
      throw new Error("Must be concentrated pool");
    }

    // avoid serializing 0 ticks issue
    if (lowerTick.isZero()) lowerTick = new Int(-clInfo.tickSpacing);
    if (upperTick.isZero()) upperTick = new Int(clInfo.tickSpacing);

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
      msg = await makeCreateFullRangePositionAndSuperfluidDelegateMsg({
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
      msg = await makeCreatePositionMsg({
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
        if (!tx.code) {
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

  async sendCreateConcentratedLiquidityInitialFullRangePositionMsg(
    poolId: string,
    memo: string = "",
    base: { token: AppCurrency; amount: string },
    quote: { token: AppCurrency; amount: string },
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    let token_min_amount0 = "0";
    let token_min_amount1 = "0";

    const slippageMultiplier = new Dec(1).sub(new Dec(15).quo(new Dec(100)));

    token_min_amount0 = base
      ? new Dec(base.amount).mul(slippageMultiplier).truncate().toString()
      : token_min_amount0;

    token_min_amount1 = quote
      ? new Dec(quote.amount).mul(slippageMultiplier).truncate().toString()
      : token_min_amount1;

    const sortedCoins = [base, quote]
      .sort((a, b) =>
        a?.token.coinMinimalDenom.localeCompare(b?.token.coinMinimalDenom)
      )
      .map(({ token, amount }) => ({
        denom: token.coinMinimalDenom,
        amount: new Dec(amount)
          .mul(DecUtils.getTenExponentNInPrecisionRange(token.coinDecimals))
          .truncate()
          .toString(),
      }));

    const msg = await makeCreatePositionMsg({
      poolId: BigInt(poolId),
      lowerTick: BigInt(minTick.toString()),
      upperTick: BigInt(maxTick.toString()),
      sender: this.address,
      tokenMinAmount0: token_min_amount0,
      tokenMinAmount1: token_min_amount1,
      tokensProvided: sortedCoins,
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "clCreatePosition",
      [msg],
      memo,
      undefined,
      undefined,
      (tx) => {
        if (!tx.code) {
          onFulfill?.(tx);
        }
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

    const withdrawPositionMsg = await makeWithdrawPositionMsg({
      positionId: BigInt(positionId),
      sender: this.address,
      liquidityAmount: fullLiquidityAmount.toString(),
    });

    if (!baseAsset || !quoteAsset)
      throw new Error("No assets found in position");

    const createAndSfDelegateMsg =
      await makeCreateFullRangePositionAndSuperfluidDelegateMsg({
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
        if (!tx.code) {
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
   * @param coin0 Denom and amount of tokne 0 to add to the position.
   * @param coin1 Denom and amount of token1 to add to the position.
   * @param maxSlippage Max token amounts slippage as whole %. Default `2.5`, meaning 2.5%.
   * @param memo Optional memo to add to the transaction.
   * @param onFulfill Optional callback to be called when tx is fulfilled.
   */
  async sendAddToConcentratedLiquidityPositionMsg(
    positionId: string,
    coin0: {
      denom: string;
      amount: string;
    },
    coin1: {
      denom: string;
      amount: string;
    },
    maxSlippage = "20",
    memo: string = "",
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    // calculate desired amounts with slippage
    const amount0WithSlippage = new Dec(coin0.amount)
      .mul(new Dec(1).sub(new Dec(maxSlippage).quo(new Dec(100))))
      .truncate()
      .toString();
    const amount1WithSlippage = new Dec(coin1.amount)
      .mul(new Dec(1).sub(new Dec(maxSlippage).quo(new Dec(100))))
      .truncate()
      .toString();

    const queryDelegatedPositions =
      this.queries.queryAccountsSuperfluidDelegatedPositions.get(this.address);
    await queryDelegatedPositions.waitResponse();
    const isSuperfluidStaked =
      queryDelegatedPositions.delegatedPositionIds.includes(positionId);

    const msg = isSuperfluidStaked
      ? await makeAddToConcentratedLiquiditySuperfluidPositionMsg({
          positionId: BigInt(positionId),
          sender: this.address,
          tokenDesired0: {
            denom: coin0.denom,
            amount: amount0WithSlippage,
          },
          tokenDesired1: {
            denom: coin1.denom,
            amount: amount1WithSlippage,
          },
        })
      : await makeAddToPositionMsg({
          amount0: coin0.amount,
          amount1: coin1.amount,
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
        if (!tx.code) {
          // refresh relevant balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((bal) => {
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
    const msg = await makeWithdrawPositionMsg({
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
        if (!tx.code) {
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
   * Constructs a multi msg as necessary.
   *
   * Rejects without sending a tx if no rewards are available.
   *
   * @param positionIdsWithSpreadRewards Position IDs to collect spread rewards from.
   * @param positionIdsWithIncentiveRewards Position IDs to collect incentive rewards from.
   * @param memo Memo.
   * @param onFulfill Callback to handle tx fullfillment given raw response.
   */
  async sendCollectAllPositionsRewardsMsgs(
    positionIdsWithSpreadRewards: string[],
    positionIdsWithIncentiveRewards: string[],
    memo: string = "",
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    const spreadRewardsMsg = await makeCollectSpreadRewardsMsg({
      positionIds: positionIdsWithSpreadRewards.map((val) => BigInt(val)),
      sender: this.address,
    });
    const incentiveRewardsMsg = await makeCollectIncentivesMsg({
      positionIds: positionIdsWithIncentiveRewards.map((val) => BigInt(val)),
      sender: this.address,
    });

    // reject if no rewards to collect
    if (
      positionIdsWithSpreadRewards.length === 0 &&
      positionIdsWithIncentiveRewards.length === 0
    ) {
      throw new Error("No rewards to collect");
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

        if (positionIdsWithIncentiveRewards.length > 0) {
          msgs.push(incentiveRewardsMsg);
        }

        return msgs;
      },
      memo,
      undefined,
      undefined,
      (tx) => {
        if (!tx.code) {
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((bal) => {
              bal.waitFreshResponse();
            });
          positionIdsWithSpreadRewards
            .concat(positionIdsWithIncentiveRewards)
            .forEach((id) => {
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
    tokenIn: { coinMinimalDenom: string },
    tokenOutMinAmount: string,
    memo: string = "",
    signOptions?: SignOptions & { fee?: StdFee },
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    const msg = await makeSplitRoutesSwapExactAmountInMsg({
      routes,
      tokenIn,
      tokenOutMinAmount,
      userOsmoAddress: this.address,
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "splitRouteSwapExactAmountIn",
      [msg],
      memo,
      signOptions?.fee,
      signOptions,
      (tx) => {
        if (!tx.code) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((bal) => {
              if (
                bal.currency.coinMinimalDenom === tokenIn.coinMinimalDenom ||
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
  async sendSplitRouteSwapExactAmountOutMsg(
    routes: {
      pools: {
        id: string;
        tokenInDenom: string;
      }[];
      tokenOutAmount: string;
    }[],
    tokenOut: { coinMinimalDenom: string },
    tokenInMaxAmount: string,
    memo: string = "",
    signOptions?: SignOptions & { fee?: StdFee },
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    const msg = await makeSplitRoutesSwapExactAmountOutMsg({
      routes,
      tokenOut,
      tokenInMaxAmount,
      userOsmoAddress: this.address,
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "splitRouteSwapExactAmountOut",
      [msg],
      memo,
      signOptions?.fee,
      signOptions,
      (tx) => {
        if (!tx.code) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((bal) => {
              if (
                bal.currency.coinMinimalDenom === tokenOut.coinMinimalDenom ||
                routes
                  .flatMap(({ pools }) => pools)
                  .find(
                    (pool) =>
                      pool.tokenInDenom === bal.currency.coinMinimalDenom
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
   * @param tokenOutMinAmount Min out amount. Slippage calculation included.
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
    tokenIn: { coinMinimalDenom: string; amount: string },
    tokenOutMinAmount: string,
    memo: string = "",
    signOptions?: SignOptions & { fee?: StdFee },
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    const msg = await makeSwapExactAmountInMsg({
      pools,
      tokenIn,
      tokenOutMinAmount,
      userOsmoAddress: this.address,
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "swapExactAmountIn",
      [msg],
      memo,
      signOptions?.fee,
      signOptions,
      (tx) => {
        if (!tx.code) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((bal) => {
              if (
                bal.currency.coinMinimalDenom === tokenIn.coinMinimalDenom ||
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
   * @param tokenInMaxAmount Max token in. Slippage included.
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
    tokenOut: { coinMinimalDenom: string; amount: string },
    tokenInMaxAmount: string,
    memo: string = "",
    signOptions?: SignOptions,
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    await this.base.signAndBroadcast(
      this.chainId,
      "swapExactAmountOut",
      async () => {
        const msg = await makeSwapExactAmountOutMsg({
          userOsmoAddress: this.address,
          tokenInMaxAmount,
          tokenOut,
          pools,
        });
        return [msg];
      },
      memo,
      undefined,
      signOptions,
      (tx) => {
        if (!tx.code) {
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
                bal.currency.coinMinimalDenom === tokenOut.coinMinimalDenom
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
    poolTotalShares: Int,
    poolAssets: { denom: string; amount: string }[],
    poolExitFee: Dec,
    maxSlippage: string = DEFAULT_SLIPPAGE,
    memo: string = "",
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    const mkp = this.makeCoinPretty;

    const estimated = OsmosisMath.estimateExitSwap(
      {
        totalShare: poolTotalShares,
        poolAssets: poolAssets.map((asset) => ({
          ...asset,
          amount: new Int(asset.amount),
        })),
        exitFee: poolExitFee,
      },
      mkp,
      shareInAmount,
      makeExitPoolMsg.shareCoinDecimals
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

    const msg = await makeExitPoolMsg({
      poolId: BigInt(poolId),
      sender: this.address,
      shareInAmount: new Dec(shareInAmount)
        .mul(
          DecUtils.getTenExponentNInPrecisionRange(
            makeExitPoolMsg.shareCoinDecimals
          )
        )
        .truncate()
        .toString(),
      tokenOutMins,
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "exitPool",
      [msg],
      memo,
      undefined,
      undefined,
      (tx) => {
        if (!tx.code) {
          const queries = this.queriesStore.get(this.chainId);
          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((balance) => balance.waitFreshResponse());
          this.queries.queryGammPoolShare.fetch(this.address);

          this.queries.queryPools.getPool(poolId)?.waitFreshResponse();
        }

        onFulfill?.(tx);
      }
    );
  }

  /**
   * Lock tokens for some duration into a lock. Useful for allowing the user to capture bonding incentives.
   *
   * @param duration Duration, in seconds, to lock up the tokens.
   * @param tokens Base token amount to lock.
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
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    const primitiveTokens = tokens.map((token) => {
      return {
        amount: token.amount,
        denom: token.currency.coinMinimalDenom,
      };
    });

    const { Duration } = await import(
      "@osmosis-labs/proto-codecs/build/codegen/google/protobuf/duration"
    );

    const msg = await makeLockTokensMsg({
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
        if (!tx.code) {
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

  /**
   * @param lockIds Ids of LP bonded locks.
   * @param validatorAddress Bech32 address of validator to delegate to.
   * @param memo Tx memo.
   * @param onFulfill Callback to handle tx fullfillment given raw response.
   */
  async sendSuperfluidDelegateMsg(
    lockIds: string[],
    validatorAddress: string,
    memo: string = "",
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    if (lockIds.length === 0) throw new Error("No locks to delegate");

    const msgs = await Promise.all(
      lockIds.map(async (lockId) => {
        return await makeSuperfluidDelegateMsg({
          sender: this.address,
          lockId: BigInt(lockId),
          valAddr: validatorAddress,
        });
      })
    );

    await this.base.signAndBroadcast(
      this.chainId,
      "superfluidDelegate",
      msgs,
      memo,
      undefined,
      undefined,
      (tx) => {
        if (!tx.code) {
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
   * @param tokens LP tokens to delegate and lock.
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
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    const primitiveTokens = tokens.map((token) => {
      return {
        amount: token.amount,
        denom: token.currency.coinMinimalDenom,
      };
    });

    const msg = await makeLockAndSuperfluidDelegateMsg({
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
        if (!tx.code) {
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
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    const msgs = await Promise.all(
      lockIds.map(async (lockId) => {
        return makeBeginUnlockingMsg({
          owner: this.address,
          ID: BigInt(lockId),
          coins: [],
        });
      })
    );

    await this.base.signAndBroadcast(
      this.chainId,
      "beginUnlocking",
      msgs,
      memo,
      undefined,
      undefined,
      (tx) => {
        if (!tx.code) {
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
      isSynthetic: boolean;
    }[],
    memo: string = "",
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    const msgs = await locks.reduce(async (msgsPromise, lock) => {
      const msgs = await msgsPromise;
      if (!lock.isSynthetic) {
        // normal unlock
        msgs.push(
          await makeBeginUnlockingMsg({
            owner: this.address,
            ID: BigInt(lock.lockId),
            coins: [],
          })
        );
      } else {
        // unbond and unlock
        msgs.push(
          await makeSuperfluidUndelegateMsg({
            sender: this.address,
            lockId: BigInt(lock.lockId),
          }),
          await makeSuperfluidUnbondLockMsg({
            sender: this.address,
            lockId: BigInt(lock.lockId),
          })
        );
      }
      return msgs;
    }, Promise.resolve([] as EncodeObject[]));

    await this.base.signAndBroadcast(
      this.chainId,
      "beginUnlocking",
      msgs,
      memo,
      undefined,
      undefined,
      (tx) => {
        if (!tx.code) {
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

  /**
   * Method to undelegate from validator set.
   * note - this replaces sendUndelegateFromValidatorSetMsg
   * @param coin The coin object with denom and amount to undelegate.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fulfillment given raw response.
   */
  async sendUndelegateFromRebalancedValidatorSet(
    coin: { amount: string; denom: Currency },
    memo: string = "",
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    await this.base.signAndBroadcast(
      this.chainId,
      "undelegateFromValidatorSet",
      [
        await makeUndelegateFromRebalancedValidatorSetMsg({
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
        if (!tx.code) {
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
   * Method to undelegate from validator set.
   * @param coin The coin object with denom and amount to undelegate.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fulfillment given raw response.
   */
  async sendUndelegateFromValidatorSetMsg(
    coin: { amount: string; denom: Currency },
    memo: string = "",
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    await this.base.signAndBroadcast(
      this.chainId,
      "undelegateFromValidatorSet",
      [
        await makeUndelegateFromValidatorSetMsg({
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
        if (!tx.code) {
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
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    await this.base.signAndBroadcast(
      this.chainId,
      "delegateToValidatorSet",
      [
        await makeDelegateToValidatorSetMsg({
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
        if (!tx.code) {
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
        await makeWithdrawDelegationRewardsMsg({
          delegator: this.address,
        }),
      ],
      memo,
      undefined,
      undefined,
      (tx) => {
        if (!tx.code) {
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
   * Method to set validator set preference.
   * @param validators An array of validator addresses to set as preference.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fulfillment given raw response.
   */
  async sendSetValidatorSetPreferenceMsg(
    validators: string[],
    memo: string = "",
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    const weight = new Dec(1).quo(new Dec(validators.length)).toString();

    if (!validators.length)
      throw new Error(
        "Please provide 1 or more validator address to set as preference"
      );

    await this.base.signAndBroadcast(
      this.chainId,
      "setValidatorSetPreference",
      [
        await makeSetValidatorSetPreferenceMsg({
          delegator: this.address,
          preferences: validators.map((validator) => ({
            weight,
            valOperAddress: validator,
          })),
        }),
      ],
      memo,
      undefined,
      undefined,
      (tx) => {
        if (!tx.code) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);

          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((balance) => balance.waitFreshResponse());

          // refresh the valsetpref
          this.queries.queryUsersValidatorPreferences
            .get(this.address)
            .waitFreshResponse();

          // refresh query delegations
          queries.cosmos.queryDelegations
            .getQueryBech32Address(this.address)
            .waitFreshResponse();
        }
        onFulfill?.(tx);
      }
    );
  }

  /**
   * Method to set validator set preference and delegate to validator set
   * @param validators An array of validator addresses to set as preference.
   * @param coin The coin object with denom and amount to delegate.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fulfillment given raw response.
   */
  async sendSetValidatorSetPreferenceAndDelegateToValidatorSetMsg(
    validators: string[],
    coin: { amount: string; denom: Currency },
    memo: string = "",
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    const weight = new Dec(1).quo(new Dec(validators.length)).toString();

    if (!validators.length)
      throw new Error(
        "Please provide 1 or more validator address to set as preference"
      );

    const setValidatorSetPreferenceMsg = await makeSetValidatorSetPreferenceMsg(
      {
        delegator: this.address,
        preferences: validators.map((validator) => ({
          weight,
          valOperAddress: validator,
        })),
      }
    );

    const setDelegateToValidatorSetMsg = await makeDelegateToValidatorSetMsg({
      delegator: this.address,
      coin: {
        denom: coin.denom.coinMinimalDenom,
        amount: coin.amount,
      },
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "SetValidatorSetPreferenceandDelegateToValidatorSet",
      [setValidatorSetPreferenceMsg, setDelegateToValidatorSetMsg],
      memo,
      undefined,
      undefined,
      (tx) => {
        if (!tx.code) {
          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);

          queries.queryBalances
            .getQueryBech32Address(this.address)
            .balances.forEach((balance) => balance.waitFreshResponse());

          // refresh query delegations
          queries.cosmos.queryDelegations
            .getQueryBech32Address(this.address)
            .waitFreshResponse();

          queries.cosmos.queryRewards
            .getQueryBech32Address(this.address)
            .waitFreshResponse();

          // refresh the valsetpref
          this.queries.queryUsersValidatorPreferences
            .get(this.address)
            .waitFreshResponse();
        }
        onFulfill?.(tx);
      }
    );
  }

  /**
   * Method to withdraw delegation rewards and delegate to validator set - staking collect and reinvest
   * @param coin The coin object with denom and amount to delegate.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fulfillment given raw response.
   */
  async sendWithdrawDelegationRewardsAndSendDelegateToValidatorSetMsgs(
    coin: { amount: string; denom: Currency },
    memo: string = "",
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    const withdrawDelegationRewardsMsg = await makeWithdrawDelegationRewardsMsg(
      {
        delegator: this.address,
      }
    );

    const delegateToValidatorSetMsg = await makeDelegateToValidatorSetMsg({
      delegator: this.address,
      coin: {
        denom: coin.denom.coinMinimalDenom,
        amount: coin.amount,
      },
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "withdrawDelegationRewardsAndSendDelegateToValidatorSet",
      [withdrawDelegationRewardsMsg, delegateToValidatorSetMsg],
      memo,
      undefined,
      undefined,
      (tx) => {
        if (!tx.code) {
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

  async sendAddOrRemoveAuthenticatorsMsg({
    addAuthenticators,
    removeAuthenticators,
    memo = "",
    onFulfill,
    onBroadcasted,
    signOptions,
  }: {
    addAuthenticators: { type: string; data: Uint8Array }[];
    removeAuthenticators: bigint[];
    memo?: string;
    onFulfill?: (tx: DeliverTxResponse) => void;
    onBroadcasted?: () => void;
    signOptions?: SignOptions;
  }) {
    const addAuthenticatorMsgs = addAuthenticators.map((authenticator) =>
      makeAddAuthenticatorMsg({
        type: authenticator.type,
        data: authenticator.data,
        sender: this.address,
      })
    );
    const removeAuthenticatorMsgs = removeAuthenticators.map((id) =>
      makeRemoveAuthenticatorMsg({
        id,
        sender: this.address,
      })
    );
    const msgs = await Promise.all([
      ...removeAuthenticatorMsgs,
      ...addAuthenticatorMsgs,
    ]);

    await this.base.signAndBroadcast(
      this.chainId,
      "addOrRemoveAuthenticators",
      msgs,
      memo,
      undefined,
      signOptions,
      {
        onBroadcasted,
        onFulfill: (tx) => {
          if (!tx.code) {
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
        },
      }
    );
  }

  async sendAddAuthenticatorsMsg(
    authenticators: { type: string; data: any }[],
    memo: string = "",
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    const addAuthenticatorMsgs = await Promise.all(
      authenticators.map((authenticator) =>
        makeAddAuthenticatorMsg({
          type: authenticator.type,
          data: authenticator.data,
          sender: this.address,
        })
      )
    );

    await this.base.signAndBroadcast(
      this.chainId,
      "addAuthenticator",
      addAuthenticatorMsgs,
      memo,
      undefined,
      undefined,
      (tx) => {
        if (!tx.code) {
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

  async sendRemoveAuthenticatorMsg(
    id: bigint,
    memo: string = "",
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    const removeAuthenticatorMsg = await makeRemoveAuthenticatorMsg({
      id: id,
      sender: this.address,
    });

    await this.base.signAndBroadcast(
      this.chainId,
      "removeAuthenticator",
      [removeAuthenticatorMsg],
      memo,
      undefined,
      undefined,
      (tx) => {
        if (!tx.code) {
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
