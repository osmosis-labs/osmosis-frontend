import type { StdFee } from "@cosmjs/amino";
import { ChainGetter } from "@osmosis-labs/keplr-stores";
import { BigDec } from "@osmosis-labs/math";
import { queryPositionById } from "@osmosis-labs/server";
import type {
  DeliverTxResponse,
  JoinPoolData,
  SignOptions,
} from "@osmosis-labs/tx";
import {
  prepareAddToConcentratedLiquidityPositionMsg,
  prepareAddToGaugeMsg,
  prepareBeginUnlockingMsg,
  prepareBeginUnlockingMsgOrSuperfluidUnbondLockMsgIfSyntheticLock,
  prepareCollectAllPositionsRewardsMsgs,
  prepareCreateBalancerPoolMsg,
  prepareCreateConcentratedLiquidityInitialFullRangePositionMsg,
  prepareCreateConcentratedLiquidityPositionMsg,
  prepareCreateConcentratedPoolMsg,
  prepareCreateGaugeMsg,
  prepareCreateStableswapPoolMsg,
  prepareDelegateToValidatorSetMsg,
  prepareExitPoolMsg,
  prepareJoinPoolMsg,
  prepareJoinSwapExternAmountInMsg,
  prepareLockAndSuperfluidDelegateMsg,
  prepareLockTokensMsg,
  prepareMigrateConcentratedLiquidityPositionMsg,
  prepareRedelegateMsgs,
  prepareSetValidatorSetPreferenceAndDelegateToValidatorSetMsg,
  prepareSetValidatorSetPreferenceMsg,
  prepareSplitRouteSwapExactAmountInMsg,
  prepareSplitRouteSwapExactAmountOutMsg,
  prepareStakeExistingPositionMsg,
  prepareSuperfluidDelegateMsg,
  prepareSwapExactAmountInMsg,
  prepareSwapExactAmountOutMsg,
  prepareUndelegateFromRebalancedValidatorSet,
  prepareUndelegateFromValidatorSetMsg,
  prepareWithdrawConcentratedLiquidityPositionMsg,
  prepareWithdrawDelegationRewardsAndSendDelegateToValidatorSetMsgs,
  prepareWithdrawDelegationRewardsMsg,
  type TransactionPreparationContext,
} from "@osmosis-labs/tx";
import { AppCurrency, Currency, Dec, Int } from "@osmosis-labs/unit";

import { AccountStore, CosmosAccount, CosmwasmAccount } from "../../account";

const DEFAULT_SLIPPAGE = "2.5";

/** The slice of a concentrated pool's state needed to build a create-position tx. */
export interface ConcentratedPoolInfo {
  tickSpacing: number;
  currentSqrtPrice: BigDec;
}

export interface OsmosisAccount {
  osmosis: OsmosisAccountImpl;
}

export const OsmosisAccount = {
  use(): (
    base: AccountStore<[OsmosisAccount, CosmosAccount, CosmwasmAccount]>,
    chainGetter: ChainGetter,
    chainId: string
  ) => OsmosisAccount {
    return (base, chainGetter, chainId) => {
      return {
        osmosis: new OsmosisAccountImpl(base, chainGetter, chainId),
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
    protected readonly chainId: string
  ) {}

  /**
   * Reads a CL position fresh from chain REST (hedged across the registry's
   * REST endpoints), replacing the MobX `queryLiquidityPositionsById` +
   * `waitFreshResponse()` this used to do. Throws if the request fails, so a
   * tx is never built from missing data.
   */
  protected async fetchPosition(positionId: string) {
    const { position } = await queryPositionById({
      chainList: this.base.chains,
      chainId: this.chainId,
      id: positionId,
    });
    const asset = (a: { denom: string; amount: string }) =>
      a.denom && a.amount ? { denom: a.denom, amount: a.amount } : undefined;
    return {
      liquidity: position.position.liquidity
        ? new Dec(position.position.liquidity)
        : undefined,
      poolId: position.position.pool_id,
      /** `asset0` */
      baseAsset: asset(position.asset0),
      /** `asset1` */
      quoteAsset: asset(position.asset1),
    };
  }

  private get preparationContext(): TransactionPreparationContext {
    const getAddress = () => this.address;
    return {
      get address() {
        return getAddress();
      },
      chainId: this.chainId,
      chains: this.base.chains,
      findCurrency: (denom) =>
        this.chainGetter.getChain(this.chainId).findCurrency(denom),
      stakeCurrency: () =>
        this.chainGetter.getChain(this.chainId).stakeCurrency,
      simulatePositionMigration: (input) =>
        this.base.simulatePositionMigration(input),
    };
  }

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
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareCreateBalancerPoolMsg(
        this.preparationContext,
        swapFee,
        assets,
        memo,
        onFulfill
      ))
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
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareCreateConcentratedPoolMsg(
        this.preparationContext,
        denom0,
        denom1,
        tickSpacing,
        spreadFactor,
        memo,
        onFulfill
      ))
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
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareCreateStableswapPoolMsg(
        this.preparationContext,
        swapFee,
        assets,
        scalingFactorControllerAddress,
        memo,
        onFulfill
      ))
    );
  }

  /**
   * Join pool with multiple assets.
   *
   * https://docs.osmosis.zone/developing/modules/spec-gamm.html#join-pool
   * @param poolId Id of pool.
   * @param pool Current share pool state, used to estimate the max token amounts in.
   * @param shareOutAmount LP share amount.
   * @param maxSlippage Max tolerated slippage. Default: 2.5.
   * @param memo Memo attachment.
   * @param onFulfill Callback to handle tx fulfillment given raw response.
   */
  async sendJoinPoolMsg(
    poolId: string,
    pool: JoinPoolData,
    shareOutAmount: string,
    maxSlippage: string = DEFAULT_SLIPPAGE,
    memo: string = "",
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareJoinPoolMsg(
        this.preparationContext,
        poolId,
        pool,
        shareOutAmount,
        maxSlippage,
        memo,
        onFulfill
      ))
    );
  }

  /**
   * Join pool with only one asset with a weighted pool.
   *
   * https://docs.osmosis.zone/developing/modules/spec-gamm.html#join-swap-extern-amount-in
   * @param poolId Id of pool to swap within.
   * @param pool Current weighted pool state, used to estimate the min shares out.
   * @param tokenIn Token being swapped in. `tokenIn.amount` is NOT in micro amount.
   * @param maxSlippage Max tolerated slippage. Default: 2.5.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fullfillment given raw response.
   */
  async sendJoinSwapExternAmountInMsg(
    poolId: string,
    pool: JoinPoolData,
    tokenIn: { currency: Currency; amount: string },
    maxSlippage: string = DEFAULT_SLIPPAGE,
    memo: string = "",
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareJoinSwapExternAmountInMsg(
        this.preparationContext,
        poolId,
        pool,
        tokenIn,
        maxSlippage,
        memo,
        onFulfill
      ))
    );
  }

  /**
   * Create a concentrated liquidity position in a pool.
   *
   * @param poolId ID of pool to create position in.
   * @param pool Current concentrated pool state, read by the caller from the tRPC pool
   * it already holds. Supplies `tickSpacing` (zero-tick correction) and
   * `currentSqrtPrice` (slippage minimums).
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
    pool: ConcentratedPoolInfo,
    lowerTick: Int,
    upperTick: Int,
    superfluidValidatorAddress?: string,
    baseDeposit?: { currency: Currency; amount: string },
    quoteDeposit?: { currency: Currency; amount: string },
    maxSlippage = "15",
    memo: string = "",
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareCreateConcentratedLiquidityPositionMsg(
        this.preparationContext,
        poolId,
        pool,
        lowerTick,
        upperTick,
        superfluidValidatorAddress,
        baseDeposit,
        quoteDeposit,
        maxSlippage,
        memo,
        onFulfill
      ))
    );
  }

  async sendCreateConcentratedLiquidityInitialFullRangePositionMsg(
    poolId: string,
    memo: string = "",
    base: { token: AppCurrency; amount: string },
    quote: { token: AppCurrency; amount: string },
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareCreateConcentratedLiquidityInitialFullRangePositionMsg(
        this.preparationContext,
        poolId,
        memo,
        base,
        quote,
        onFulfill
      ))
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
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareStakeExistingPositionMsg(
        this.preparationContext,
        positionId,
        validatorAddress,
        memo,
        onFulfill
      ))
    );
  }

  /**
   * Migrates a concentrated liquidity position to an equivalent pool,
   * preserving its tick range, by withdrawing the full position in one
   * message and creating the new position in another.
   *
   * Both messages share one transaction, so a failing create reverts the
   * withdraw with it and the user keeps their original position. That
   * guarantee only holds because `tokenMinAmount0/1` are set: at zero, a
   * create on unexpectedly bad terms succeeds instead of reverting. The
   * minimums come from simulating the exact message batch and reading the
   * create's own event amounts, rather than from recomputing liquidity math
   * client-side where a rounding disagreement with the chain would either
   * revert every honest migration or floor at a useless value.
   *
   * @param positionId Position to migrate.
   * @param toPoolId Destination pool. Must share the source pool's tick
   * spacing and spread factor; the caller is responsible for verifying that
   * against live pool state before calling.
   * @param lowerTick Lower tick, copied verbatim from the source position.
   * @param upperTick Upper tick, copied verbatim from the source position.
   * @param minAmountTolerancePercent Tolerance applied to the simulated
   * amounts when deriving the minimums. Deliberately looser than the price
   * divergence gate: it absorbs pool state moving between simulation and
   * broadcast, not mispricing.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fulfillment given raw response.
   */
  async sendMigrateConcentratedLiquidityPositionMsg(
    positionId: string,
    toPoolId: string,
    lowerTick: Int,
    upperTick: Int,
    minAmountTolerancePercent: number,
    usdcConversion: {
      /** USDC denom the source pool pairs against (bridged, e.g. USDC.noble). */
      fromDenom: string;
      /** USDC denom the destination pool pairs against (the alloy). */
      toDenom: string;
      /** Transmuter pool converting between them at 1:1. */
      transmuterPoolId: string;
    },
    /**
     * Final gate, invoked twice: after the sizing simulations before the
     * wallet is asked to sign (so a stale flow never reaches a prompt), and
     * again after the wallet approves, immediately before the signed bytes
     * are broadcast. The second run is the one that matters: a user can hold
     * the wallet prompt open indefinitely, and while this transaction's
     * timeout height eventually kills a stale signature, only a
     * post-approval check bounds the drift window of a fresh one to
     * broadcast plus inclusion. Throwing at either point
     * aborts the migration with nothing broadcast. Callers use it to
     * re-verify price divergence against uncached chain state.
     */
    preBroadcastCheck?: () => Promise<void>,
    memo: string = "",
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareMigrateConcentratedLiquidityPositionMsg(
        this.preparationContext,
        positionId,
        toPoolId,
        lowerTick,
        upperTick,
        minAmountTolerancePercent,
        usdcConversion,
        preBroadcastCheck,
        memo,
        onFulfill
      ))
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
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareAddToConcentratedLiquidityPositionMsg(
        this.preparationContext,
        positionId,
        coin0,
        coin1,
        maxSlippage,
        memo,
        onFulfill
      ))
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
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareWithdrawConcentratedLiquidityPositionMsg(
        this.preparationContext,
        positionId,
        liquidityAmount,
        memo,
        onFulfill
      ))
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
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareCollectAllPositionsRewardsMsgs(
        this.preparationContext,
        positionIdsWithSpreadRewards,
        positionIdsWithIncentiveRewards,
        memo,
        onFulfill
      ))
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
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareSplitRouteSwapExactAmountInMsg(
        this.preparationContext,
        routes,
        tokenIn,
        tokenOutMinAmount,
        memo,
        signOptions,
        onFulfill
      ))
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
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareSplitRouteSwapExactAmountOutMsg(
        this.preparationContext,
        routes,
        tokenOut,
        tokenInMaxAmount,
        memo,
        signOptions,
        onFulfill
      ))
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
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareSwapExactAmountInMsg(
        this.preparationContext,
        pools,
        tokenIn,
        tokenOutMinAmount,
        memo,
        signOptions,
        onFulfill
      ))
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
      ...(await prepareSwapExactAmountOutMsg(
        this.preparationContext,
        pools,
        tokenOut,
        tokenInMaxAmount,
        memo,
        signOptions,
        onFulfill
      ))
    );
  }

  /**
   * https://docs.osmosis.zone/developing/modules/spec-gamm.html#exit-pool
   * @param poolId Id of pool to exit.
   * @param shareInAmount LP shares to redeem.
   * @param maxSlippage Max tolerated slippage. Default: 2.5, 15 with high precision amounts.
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
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareExitPoolMsg(
        this.preparationContext,
        poolId,
        shareInAmount,
        poolTotalShares,
        poolAssets,
        poolExitFee,
        maxSlippage,
        memo,
        onFulfill
      ))
    );
  }

  /**
   * Creates an external incentive gauge on a pool via
   * osmosis.incentives.MsgCreateGauge.
   *
   * @param distributeTo Gauge target: `byDuration` for share (lockup) pools
   *   — denom is the pool share denom and duration one of the pool's
   *   lockable durations — or `noLock` for concentrated pools, where the
   *   chain derives the internal no-lock denom from the pool id and
   *   `uptimeSeconds` is the minimum time in range a position needs before
   *   it qualifies (anti just-in-time liquidity; must be one of the CL
   *   module's authorized uptimes or creation is rejected).
   * @param coins Reward coins funding the gauge, in minimal (chain) units.
   * @param startTime When distribution may begin; emissions start at the
   *   first epoch after this time.
   * @param numEpochsPaidOver Number of epochs the rewards are spread over
   *   (must be 1 for perpetual gauges).
   * @param isPerpetual Perpetual gauges distribute their full balance every
   *   epoch and are refilled with MsgAddToGauge.
   * @param memo Tx memo.
   * @param onFulfill Callback to handle tx fulfillment given raw response.
   */
  async sendCreateGaugeMsg(
    distributeTo:
      | { type: "byDuration"; denom: string; durationSeconds: number }
      | { type: "noLock"; poolId: string; uptimeSeconds: number },
    coins: { currency: Currency; amount: string }[],
    startTime: Date,
    numEpochsPaidOver: number,
    isPerpetual: boolean = false,
    memo: string = "",
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareCreateGaugeMsg(
        this.preparationContext,
        distributeTo,
        coins,
        startTime,
        numEpochsPaidOver,
        isPerpetual,
        memo,
        onFulfill
      ))
    );
  }

  /**
   * Tops up an existing incentive gauge via osmosis.incentives.MsgAddToGauge.
   *
   * @param gaugeId Id of the gauge to fund.
   * @param rewards Additional reward coins, in minimal (chain) units.
   * @param memo Tx memo.
   * @param onFulfill Callback to handle tx fulfillment given raw response.
   */
  async sendAddToGaugeMsg(
    gaugeId: string,
    rewards: { currency: Currency; amount: string }[],
    memo: string = "",
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareAddToGaugeMsg(
        this.preparationContext,
        gaugeId,
        rewards,
        memo,
        onFulfill
      ))
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
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareLockTokensMsg(
        this.preparationContext,
        duration,
        tokens,
        memo,
        onFulfill
      ))
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
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareSuperfluidDelegateMsg(
        this.preparationContext,
        lockIds,
        validatorAddress,
        memo,
        onFulfill
      ))
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
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareLockAndSuperfluidDelegateMsg(
        this.preparationContext,
        tokens,
        validatorAddress,
        memo,
        onFulfill
      ))
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
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareBeginUnlockingMsg(
        this.preparationContext,
        lockIds,
        memo,
        onFulfill
      ))
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
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareBeginUnlockingMsgOrSuperfluidUnbondLockMsgIfSyntheticLock(
        this.preparationContext,
        locks,
        memo,
        onFulfill
      ))
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
      ...(await prepareUndelegateFromRebalancedValidatorSet(
        this.preparationContext,
        coin,
        memo,
        onFulfill
      ))
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
      ...(await prepareUndelegateFromValidatorSetMsg(
        this.preparationContext,
        coin,
        memo,
        onFulfill
      ))
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
      ...(await prepareDelegateToValidatorSetMsg(
        this.preparationContext,
        coin,
        memo,
        onFulfill
      ))
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
      ...(await prepareWithdrawDelegationRewardsMsg(
        this.preparationContext,
        memo,
        onFulfill
      ))
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
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareSetValidatorSetPreferenceMsg(
        this.preparationContext,
        validators,
        memo,
        onFulfill
      ))
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
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareSetValidatorSetPreferenceAndDelegateToValidatorSetMsg(
        this.preparationContext,
        validators,
        coin,
        memo,
        onFulfill
      ))
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
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareWithdrawDelegationRewardsAndSendDelegateToValidatorSetMsgs(
        this.preparationContext,
        coin,
        memo,
        onFulfill
      ))
    );
  }

  /**
   * Method to move stake between specific validators, optionally replacing the
   * validator set preference in the same tx. Used to move stake off validators
   * that have left the active set without rebalancing the rest of the stake
   * (which MsgRedelegateValidatorSet would do).
   * @param redelegations Source validator, destination validator and amount (in the staking denom's minimal units) for each redelegation.
   * @param validatorSetPreference Validator addresses to set as an equally weighted preference, or undefined to leave the preference unchanged.
   * @param memo Transaction memo.
   * @param onFulfill Callback to handle tx fulfillment given raw response.
   */
  async sendRedelegateMsgs(
    redelegations: {
      validatorSrcAddress: string;
      validatorDstAddress: string;
      amount: string;
    }[],
    validatorSetPreference?: string[],
    memo: string = "",
    onFulfill?: (tx: DeliverTxResponse) => void
  ) {
    await this.base.signAndBroadcast(
      this.chainId,
      ...(await prepareRedelegateMsgs(
        this.preparationContext,
        redelegations,
        validatorSetPreference,
        memo,
        onFulfill
      ))
    );
  }
}
