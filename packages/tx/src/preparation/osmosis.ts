import type { StdFee } from "@cosmjs/amino";
import type { EncodeObject } from "@cosmjs/proto-signing";
import * as OsmosisMath from "@osmosis-labs/math";
import { BigDec, maxTick, minTick } from "@osmosis-labs/math";
import {
  queryAccountDelegatedPositions,
  queryPositionById,
} from "@osmosis-labs/server";
import {
  AppCurrency,
  Coin,
  CoinPretty,
  Currency,
  Dec,
  DecUtils,
  Int,
} from "@osmosis-labs/unit";

import {
  assertJoinPoolData,
  getJoinPoolTokenInMaxs,
  getJoinSwapShareOutMinAmount,
  type JoinPoolData,
} from "../account/osmosis/join-pool";
import type { DeliverTxResponse, SignOptions } from "../account/types";
import { getLastPositionEventAmounts } from "../events";
import {
  makeAddToConcentratedLiquiditySuperfluidPositionMsg,
  makeAddToGaugeMsg,
  makeAddToPositionMsg,
  makeBeginRedelegateMsg,
  makeBeginUnlockingMsg,
  makeCollectIncentivesMsg,
  makeCollectSpreadRewardsMsg,
  makeCreateBalancerPoolMsg,
  makeCreateConcentratedPoolMsg,
  makeCreateFullRangePositionAndSuperfluidDelegateMsg,
  makeCreateGaugeMsg,
  makeCreatePositionMsg,
  makeCreateStableswapPoolMsg,
  makeDelegateToValidatorSetMsg,
  makeExitPoolMsg,
  makeJoinPoolMsg,
  makeJoinSwapExternAmountInMsg,
  makeLockAndSuperfluidDelegateMsg,
  makeLockTokensMsg,
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
} from "../message-composers";
import {
  prepareTransaction,
  type TransactionPreparationContext,
} from "./types";

const DEFAULT_SLIPPAGE = "2.5";
const HIGH_DEFAULT_SLIPPAGE = "15";

/** The slice of a concentrated pool's state needed to build a create-position tx. */
export interface ConcentratedPoolInfo {
  tickSpacing: number;
  currentSqrtPrice: BigDec;
}

async function fetchPosition(
  context: TransactionPreparationContext,
  positionId: string
) {
  const { position } = await queryPositionById({
    chainList: context.chains,
    chainId: context.chainId,
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
function makeCoinPretty(
  context: TransactionPreparationContext,
  coin: Coin
): CoinPretty {
  const currency = context.findCurrency(coin.denom);
  if (!currency) throw new Error("Unknown currency");
  return new CoinPretty(currency, coin.amount);
}

export async function prepareCreateBalancerPoolMsg(
  context: TransactionPreparationContext,
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
    sender: context.address,
    poolParams: {
      swapFee: new Dec(swapFee)
        .quo(DecUtils.getTenExponentNInPrecisionRange(2))
        .toString(),
      exitFee: new Dec(0).toString(),
    },
  });

  return prepareTransaction(
    "createBalancerPool",
    [msg],
    memo,
    undefined,
    undefined,
    onFulfill
  );
}

export async function prepareCreateConcentratedPoolMsg(
  context: TransactionPreparationContext,
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
    sender: context.address,
    spreadFactor: new Dec(spreadFactor).toString(),
    tickSpacing: BigInt(tickSpacing),
  });

  return prepareTransaction(
    "createConcentratedPool",
    [msg],
    memo,
    undefined,
    undefined,
    onFulfill
  );
}

export async function prepareCreateStableswapPoolMsg(
  context: TransactionPreparationContext,
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

  /** Denom -> integer scaling factor. */
  const scalingFactorsMap: Map<string, bigint> = new Map<string, bigint>();

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
      BigInt(asset.scalingFactor)
    );
  }

  // sort initial liquidity and scaling factors to pass chain encoding check
  // chain does this to make sure that index of scaling factors is consistent with token indexes
  initialPoolLiquidity.sort((a, b) => a.denom.localeCompare(b.denom));
  const sortedScalingFactors: bigint[] = [];
  initialPoolLiquidity.forEach((asset) => {
    const scalingFactor = scalingFactorsMap.get(asset.denom);
    if (scalingFactor === undefined) {
      throw new Error(
        `Scaling factor for asset ${asset.denom} missing in scalingFactorsMap`
      );
    }

    sortedScalingFactors.push(BigInt(scalingFactor.toString()));
  });

  const msg = await makeCreateStableswapPoolMsg({
    sender: context.address,
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

  return prepareTransaction(
    "createStableswapPool",
    [msg],
    memo,
    undefined,
    undefined,
    onFulfill
  );
}

export async function prepareJoinPoolMsg(
  context: TransactionPreparationContext,
  poolId: string,
  pool: JoinPoolData,
  shareOutAmount: string,
  maxSlippage: string = DEFAULT_SLIPPAGE,
  memo: string = "",
  onFulfill?: (tx: DeliverTxResponse) => void
) {
  assertJoinPoolData(poolId, pool);

  return prepareTransaction(
    "joinPool",
    async () => {
      const tokenInMaxs = getJoinPoolTokenInMaxs(
        pool,
        shareOutAmount,
        maxSlippage,
        makeJoinPoolMsg.shareCoinDecimals
      );

      const msg = await makeJoinPoolMsg({
        poolId: BigInt(poolId),
        sender: context.address,
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
    onFulfill
  );
}

export async function prepareJoinSwapExternAmountInMsg(
  context: TransactionPreparationContext,
  poolId: string,
  pool: JoinPoolData,
  tokenIn: { currency: Currency; amount: string },
  maxSlippage: string = DEFAULT_SLIPPAGE,
  memo: string = "",
  onFulfill?: (tx: DeliverTxResponse) => void
) {
  assertJoinPoolData(poolId, pool);

  return prepareTransaction(
    "joinPool",
    async () => {
      const amount = new Dec(tokenIn.amount)
        .mul(
          DecUtils.getTenExponentNInPrecisionRange(
            tokenIn.currency.coinDecimals
          )
        )
        .truncate();
      const coin = new Coin(tokenIn.currency.coinMinimalDenom, amount);

      const shareOutMinAmount = getJoinSwapShareOutMinAmount(
        pool,
        tokenIn,
        maxSlippage,
        makeJoinSwapExternAmountInMsg.shareCoinDecimals
      );

      const msg = await makeJoinSwapExternAmountInMsg({
        poolId: BigInt(poolId),
        sender: context.address,
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
    onFulfill
  );
}

export async function prepareCreateConcentratedLiquidityPositionMsg(
  context: TransactionPreparationContext,
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
  // avoid serializing 0 ticks issue
  if (lowerTick.isZero()) lowerTick = new Int(-pool.tickSpacing);
  if (upperTick.isZero()) upperTick = new Int(pool.tickSpacing);

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
      sender: context.address,
    });
  } else {
    // full tolerance if 0 sqrt price so no positions
    let token_min_amount0 = "0";
    let token_min_amount1 = "0";

    // 3 cases:
    // - If position is active, consists of both tokens
    // - If position is under current tick, consists only of token 1.
    // - If position is above current tick, consists only of token 0.
    if (!pool.currentSqrtPrice.isZero()) {
      const currentSqrtPrice = pool.currentSqrtPrice;

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
      sender: context.address,
      tokenMinAmount0: token_min_amount0,
      tokenMinAmount1: token_min_amount1,
      tokensProvided: sortedCoins,
    });
  }
  return prepareTransaction(
    superfluidValidatorAddress
      ? "clCreateSuperfluidPosition"
      : "clCreatePosition",
    [msg],
    memo,
    undefined,
    undefined,
    onFulfill
  );
}

export async function prepareCreateConcentratedLiquidityInitialFullRangePositionMsg(
  context: TransactionPreparationContext,
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
    sender: context.address,
    tokenMinAmount0: token_min_amount0,
    tokenMinAmount1: token_min_amount1,
    tokensProvided: sortedCoins,
  });

  return prepareTransaction(
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

export async function prepareStakeExistingPositionMsg(
  context: TransactionPreparationContext,
  positionId: string,
  validatorAddress: string,
  memo: string = "",
  onFulfill?: (tx: DeliverTxResponse) => void
) {
  const {
    liquidity: fullLiquidityAmount,
    baseAsset,
    quoteAsset,
    poolId,
  } = await fetchPosition(context, positionId);

  if (!fullLiquidityAmount) throw new Error("No liquidity amount found");
  if (!poolId) throw new Error("No pool ID found");

  const withdrawPositionMsg = await makeWithdrawPositionMsg({
    positionId: BigInt(positionId),
    sender: context.address,
    liquidityAmount: fullLiquidityAmount.toString(),
  });

  if (!baseAsset || !quoteAsset) throw new Error("No assets found in position");

  const createAndSfDelegateMsg =
    await makeCreateFullRangePositionAndSuperfluidDelegateMsg({
      poolId: BigInt(poolId),
      coins: [
        { denom: baseAsset.denom, amount: baseAsset.amount },
        { denom: quoteAsset.denom, amount: quoteAsset.amount },
      ].sort((a, b) => a?.denom.localeCompare(b?.denom)),
      sender: context.address,
      valAddr: validatorAddress,
    });

  return prepareTransaction(
    "sfCreateAndStakeSuperfluidPosition",
    [withdrawPositionMsg, createAndSfDelegateMsg],
    memo,
    undefined,
    undefined,
    onFulfill
  );
}

export async function prepareMigrateConcentratedLiquidityPositionMsg(
  context: TransactionPreparationContext,
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
  const {
    liquidity: fullLiquidityAmount,
    baseAsset,
    quoteAsset,
  } = await fetchPosition(context, positionId);

  if (!fullLiquidityAmount) throw new Error("No liquidity amount found");
  if (!baseAsset || !quoteAsset) throw new Error("No assets found in position");

  const withdrawPositionMsg = await makeWithdrawPositionMsg({
    positionId: BigInt(positionId),
    sender: context.address,
    liquidityAmount: fullLiquidityAmount.toString(),
  });

  // The withdraw pays out the SOURCE pool's denoms, one of which is the
  // bridged USDC the destination pool does not hold, so its exact outputs
  // size both the conversion swap and the create.
  const withdrawSim = await context.simulatePositionMigration({
    chainId: context.chainId,
    messages: [withdrawPositionMsg],
    bech32Address: context.address,
  });
  const withdrawAmounts = getLastPositionEventAmounts(
    withdrawSim.events,
    "withdraw_position"
  );
  if (!withdrawAmounts)
    throw new Error("Withdraw simulation produced no withdraw_position event");
  // withdraw_position amount0/amount1 are indexed by the SOURCE pool's
  // token0/token1; the position query's base/quote follow the same order.
  const withdrawn = new Map<string, Int>([
    [baseAsset.denom, withdrawAmounts.amount0],
    [quoteAsset.denom, withdrawAmounts.amount1],
  ]);

  const bridgedUsdcOut = withdrawn.get(usdcConversion.fromDenom);
  const assetDenom = [baseAsset.denom, quoteAsset.denom].find(
    (d) => d !== usdcConversion.fromDenom
  );
  const assetOut = assetDenom ? withdrawn.get(assetDenom) : undefined;
  if (!bridgedUsdcOut || !assetDenom || !assetOut)
    throw new Error(
      `Position does not pay out ${usdcConversion.fromDenom}; refusing to migrate`
    );

  /* The position's amounts drift with price between simulation and the block
       this lands in, so everything downstream of the withdraw is sized 0.5%
       under the simulated outputs. Whatever the buffer leaves over stays in
       the wallet, which is the flow's dust policy anyway.

       These amounts are fixed at signing, and no Cosmos message spends "only
       what this transaction received": if the withdraw under-delivers one
       side, the swap or create covers the shortfall from tokens already in
       the wallet. Two properties are structural. The alloyed side cannot
       over-draw at all, because the swap's min out is exactly what the create
       provides. And a shortfall the wallet cannot cover fails the transfer
       and reverts the whole transaction, position included. What is NOT
       enforced onchain: the create minimums constrain the destination
       deposits, never the withdraw's own outputs, so a covered shortfall can
       reach the full sized amount of one side - a bound the UI discloses as
       concrete amounts rather than calling small - and the surplus the
       withdraw returns on the other side is valued at whatever the source
       pool traded at in that block, not guaranteed equivalent at the
       destination's price. What keeps that window to seconds is timing: the
       eligibility recheck runs again via the signing callback below, after
       wallet approval and immediately before broadcast (a prompt can be held
       open indefinitely), and this transaction opts into a timeout height so
       a signature that does sit stale expires instead of executing late. */
  const buffer = (amount: Int, bps: number) =>
    new Int(
      (
        (BigInt(amount.toString()) * BigInt(10_000 - bps)) /
        BigInt(10_000)
      ).toString()
    );
  const swapIn = buffer(bridgedUsdcOut, 50);
  const assetProvide = buffer(assetOut, 50);
  // the transmuter converts 1:1; 20bps headroom covers any taker fee
  const alloyedUsdcMin = buffer(swapIn, 20);
  if (!swapIn.isPositive() || !assetProvide.isPositive())
    throw new Error("Withdrawn amounts too small to migrate");

  const convertMsg = await makeSwapExactAmountInMsg({
    pools: [
      {
        id: usdcConversion.transmuterPoolId,
        tokenOutDenom: usdcConversion.toDenom,
      },
    ],
    tokenIn: {
      coinMinimalDenom: usdcConversion.fromDenom,
      amount: swapIn.toString(),
    },
    tokenOutMinAmount: alloyedUsdcMin.toString(),
    userOsmoAddress: context.address,
  });

  const tokensProvided = [
    { denom: assetDenom, amount: assetProvide.toString() },
    { denom: usdcConversion.toDenom, amount: alloyedUsdcMin.toString() },
  ].sort((a, b) => a.denom.localeCompare(b.denom));

  const mkCreateMsg = (min0: string, min1: string) =>
    makeCreatePositionMsg({
      poolId: BigInt(toPoolId),
      lowerTick: BigInt(lowerTick.toString()),
      upperTick: BigInt(upperTick.toString()),
      sender: context.address,
      tokenMinAmount0: min0,
      tokenMinAmount1: min1,
      tokensProvided,
    });

  /* Simulate the full three-message transaction with zeroed create minimums
       purely to learn what the create would consume; that pair is never
       broadcast. The real minimums floor 1% under those amounts: with them a
       create on worse terms fails and the whole transaction, withdraw and
       conversion included, reverts. */
  const probeSim = await context.simulatePositionMigration({
    chainId: context.chainId,
    messages: [withdrawPositionMsg, convertMsg, await mkCreateMsg("0", "0")],
    bech32Address: context.address,
  });

  /* The create's own deposits come from the probe's create_position event,
       whose amount0/amount1 are indexed by the DESTINATION pool's token0 and
       token1 - exactly what tokenMinAmount0/1 expect, so no denom mapping.
       Never derive these from coinsSpent: for any transaction containing a
       swap, getSumTotalSpenderCoinsSpent short-circuits to the swap's
       tokens_in and drops the create's deposits entirely, which would zero
       both minimums and disable the only onchain price protection. */
  const probeDeposits = getLastPositionEventAmounts(
    probeSim.events,
    "create_position"
  );
  if (!probeDeposits)
    throw new Error("Simulation produced no create_position event");

  const toMinAmount = (deposited: Int) => {
    if (!deposited.isPositive()) return "0";
    const kept = new Dec(deposited.toString()).mul(
      new Dec(1).sub(new Dec(minAmountTolerancePercent).quo(new Dec(100)))
    );
    const floored = kept.truncate();
    // A zero minimum on a side that does get deposited is exactly the
    // silent-success case these guard against, so floor at one base unit.
    return floored.isPositive() ? floored.toString() : "1";
  };

  const createPositionMsg = await mkCreateMsg(
    toMinAmount(probeDeposits.amount0),
    toMinAmount(probeDeposits.amount1)
  );

  /* Two simulations have passed since the caller last checked eligibility.
       Re-run their gate before involving the wallet at all, so a flow that
       has already gone stale never reaches a prompt. */
  if (preBroadcastCheck) await preBroadcastCheck();

  return prepareTransaction(
    "clMigratePosition",
    [withdrawPositionMsg, convertMsg, createPositionMsg],
    memo,
    undefined,
    undefined,
    {
      /* The decisive run of the gate: after the user approves in the
           wallet - a wait only they control - and immediately before the
           signed bytes are broadcast. Throwing here discards the signed
           transaction; past here the remaining drift window is broadcast
           plus inclusion, seconds rather than however long the prompt sat
           open. */
      onSign: preBroadcastCheck,
      onFulfill,
    },
    undefined,
    /* useTimeoutHeight: this flow's safety model needs the signed
         transaction to expire rather than stay broadcastable forever. */
    true
  );
}

export async function prepareAddToConcentratedLiquidityPositionMsg(
  context: TransactionPreparationContext,
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

  // Fresh read from chain REST; a failed request throws before anything is
  // signed rather than being treated as "not staked".
  const delegated = await queryAccountDelegatedPositions({
    chainList: context.chains,
    chainId: context.chainId,
    bech32Address: context.address,
  });
  const isSuperfluidStaked = delegated.cl_pool_user_position_records.some(
    ({ position_id }) => position_id === positionId
  );

  const msg = isSuperfluidStaked
    ? await makeAddToConcentratedLiquiditySuperfluidPositionMsg({
        positionId: BigInt(positionId),
        sender: context.address,
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
        sender: context.address,
        tokenMinAmount0: amount0WithSlippage,
        tokenMinAmount1: amount1WithSlippage,
      });

  return prepareTransaction(
    "clAddToPosition",
    [msg],
    memo,
    undefined,
    undefined,
    onFulfill
  );
}

export async function prepareWithdrawConcentratedLiquidityPositionMsg(
  context: TransactionPreparationContext,
  positionId: string,
  liquidityAmount: Dec,
  memo: string = "",
  onFulfill?: (tx: DeliverTxResponse) => void
) {
  const msg = await makeWithdrawPositionMsg({
    liquidityAmount: liquidityAmount.toString(),
    positionId: BigInt(positionId),
    sender: context.address,
  });

  return prepareTransaction(
    "clWithdrawPosition",
    [msg],
    memo,
    undefined,
    undefined,
    onFulfill
  );
}

export async function prepareCollectAllPositionsRewardsMsgs(
  context: TransactionPreparationContext,
  positionIdsWithSpreadRewards: string[],
  positionIdsWithIncentiveRewards: string[],
  memo: string = "",
  onFulfill?: (tx: DeliverTxResponse) => void
) {
  const spreadRewardsMsg = await makeCollectSpreadRewardsMsg({
    positionIds: positionIdsWithSpreadRewards.map((val) => BigInt(val)),
    sender: context.address,
  });
  const incentiveRewardsMsg = await makeCollectIncentivesMsg({
    positionIds: positionIdsWithIncentiveRewards.map((val) => BigInt(val)),
    sender: context.address,
  });

  // reject if no rewards to collect
  if (
    positionIdsWithSpreadRewards.length === 0 &&
    positionIdsWithIncentiveRewards.length === 0
  ) {
    throw new Error("No rewards to collect");
  }

  return prepareTransaction(
    "collectAllPositionsRewards",
    () => {
      // only accumulate collection msgs that have rewards
      const msgs: (typeof incentiveRewardsMsg | typeof spreadRewardsMsg)[] = [];

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
    onFulfill
  );
}

export async function prepareSplitRouteSwapExactAmountInMsg(
  context: TransactionPreparationContext,
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
    userOsmoAddress: context.address,
  });

  return prepareTransaction(
    "splitRouteSwapExactAmountIn",
    [msg],
    memo,
    signOptions?.fee,
    signOptions,
    onFulfill
  );
}

export async function prepareSplitRouteSwapExactAmountOutMsg(
  context: TransactionPreparationContext,
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
    userOsmoAddress: context.address,
  });

  return prepareTransaction(
    "splitRouteSwapExactAmountOut",
    [msg],
    memo,
    signOptions?.fee,
    signOptions,
    onFulfill
  );
}

export async function prepareSwapExactAmountInMsg(
  context: TransactionPreparationContext,
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
    userOsmoAddress: context.address,
  });

  return prepareTransaction(
    "swapExactAmountIn",
    [msg],
    memo,
    signOptions?.fee,
    signOptions,
    onFulfill
  );
}

export async function prepareSwapExactAmountOutMsg(
  context: TransactionPreparationContext,
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
  return prepareTransaction(
    "swapExactAmountOut",
    async () => {
      const msg = await makeSwapExactAmountOutMsg({
        userOsmoAddress: context.address,
        tokenInMaxAmount,
        tokenOut,
        pools,
      });
      return [msg];
    },
    memo,
    undefined,
    signOptions,
    onFulfill
  );
}

export async function prepareExitPoolMsg(
  context: TransactionPreparationContext,
  poolId: string,
  shareInAmount: string,
  poolTotalShares: Int,
  poolAssets: { denom: string; amount: string }[],
  poolExitFee: Dec,
  maxSlippage: string = DEFAULT_SLIPPAGE,
  memo: string = "",
  onFulfill?: (tx: DeliverTxResponse) => void
) {
  const mkp = (coin: Coin) => makeCoinPretty(context, coin);

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

  // If the token amount is very large, indicating high precision,
  // increase slippage tolerance to allow for the high precision.
  if (poolAssets.some(({ amount }) => amount.length > 18)) {
    maxSlippage = HIGH_DEFAULT_SLIPPAGE;
  }

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
    sender: context.address,
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

  return prepareTransaction(
    "exitPool",
    [msg],
    memo,
    undefined,
    undefined,
    onFulfill
  );
}

export async function prepareCreateGaugeMsg(
  context: TransactionPreparationContext,
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
  const primitiveCoins = coins.map((coin) => ({
    amount: coin.amount,
    denom: coin.currency.coinMinimalDenom,
  }));

  const [{ Duration }, { LockQueryType }] = await Promise.all([
    import("@osmosis-labs/proto-codecs/build/codegen/google/protobuf/duration"),
    import("@osmosis-labs/proto-codecs/build/codegen/osmosis/lockup/lock"),
  ]);

  const msg = await makeCreateGaugeMsg({
    isPerpetual,
    owner: context.address,
    distributeTo:
      distributeTo.type === "byDuration"
        ? {
            lockQueryType: LockQueryType.ByDuration,
            denom: distributeTo.denom,
            duration: Duration.fromPartial({
              seconds: BigInt(distributeTo.durationSeconds),
              nanos: 0,
            }),
            timestamp: new Date(0),
          }
        : {
            // The chain derives the no-lock denom from poolId; the
            // condition's denom must be left empty. Its duration carries
            // the required position uptime.
            lockQueryType: LockQueryType.NoLock,
            denom: "",
            duration: Duration.fromPartial({
              seconds: BigInt(Math.floor(distributeTo.uptimeSeconds)),
              nanos: Math.round((distributeTo.uptimeSeconds % 1) * 1e9),
            }),
            timestamp: new Date(0),
          },
    coins: primitiveCoins,
    // Floor to whole seconds. The amino sign path (telescope's
    // Timestamp.toAmino) strips sub-second precision from start_time, but the
    // broadcast proto body keeps the nanos, so a Date with millisecond
    // precision (e.g. `new Date()`) makes the signed amino doc and the chain's
    // re-derived amino disagree -> "signature verification failed". Sub-second
    // precision is meaningless here anyway (the chain floors the start to the
    // next epoch).
    startTime: new Date(Math.floor(startTime.getTime() / 1000) * 1000),
    numEpochsPaidOver: BigInt(numEpochsPaidOver),
    poolId:
      distributeTo.type === "noLock" ? BigInt(distributeTo.poolId) : BigInt(0),
  });

  return prepareTransaction(
    "createGauge",
    [msg],
    memo,
    undefined,
    undefined,
    onFulfill
  );
}

export async function prepareAddToGaugeMsg(
  context: TransactionPreparationContext,
  gaugeId: string,
  rewards: { currency: Currency; amount: string }[],
  memo: string = "",
  onFulfill?: (tx: DeliverTxResponse) => void
) {
  const primitiveRewards = rewards.map((coin) => ({
    amount: coin.amount,
    denom: coin.currency.coinMinimalDenom,
  }));

  const msg = await makeAddToGaugeMsg({
    owner: context.address,
    gaugeId: BigInt(gaugeId),
    rewards: primitiveRewards,
  });

  return prepareTransaction(
    "addToGauge",
    [msg],
    memo,
    undefined,
    undefined,
    onFulfill
  );
}

export async function prepareLockTokensMsg(
  context: TransactionPreparationContext,
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

  const { Duration } =
    await import("@osmosis-labs/proto-codecs/build/codegen/google/protobuf/duration");

  const msg = await makeLockTokensMsg({
    owner: context.address,
    coins: primitiveTokens,
    duration: Duration.fromPartial({
      seconds: BigInt(duration),
      nanos: 0,
    }),
  });

  return prepareTransaction(
    "lockTokens",
    [msg],
    memo,
    undefined,
    undefined,
    onFulfill
  );
}

export async function prepareSuperfluidDelegateMsg(
  context: TransactionPreparationContext,
  lockIds: string[],
  validatorAddress: string,
  memo: string = "",
  onFulfill?: (tx: DeliverTxResponse) => void
) {
  if (lockIds.length === 0) throw new Error("No locks to delegate");

  const msgs = await Promise.all(
    lockIds.map(async (lockId) => {
      return await makeSuperfluidDelegateMsg({
        sender: context.address,
        lockId: BigInt(lockId),
        valAddr: validatorAddress,
      });
    })
  );

  return prepareTransaction(
    "superfluidDelegate",
    msgs,
    memo,
    undefined,
    undefined,
    onFulfill
  );
}

export async function prepareLockAndSuperfluidDelegateMsg(
  context: TransactionPreparationContext,
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
    sender: context.address,
    coins: primitiveTokens,
    valAddr: validatorAddress,
  });

  return prepareTransaction(
    "lockAndSuperfluidDelegate",
    [msg],
    memo,
    undefined,
    undefined,
    onFulfill
  );
}

export async function prepareBeginUnlockingMsg(
  context: TransactionPreparationContext,
  lockIds: string[],
  memo: string = "",
  onFulfill?: (tx: DeliverTxResponse) => void
) {
  const msgs = await Promise.all(
    lockIds.map(async (lockId) => {
      return makeBeginUnlockingMsg({
        owner: context.address,
        iD: BigInt(lockId),
        coins: [],
      });
    })
  );

  return prepareTransaction(
    "beginUnlocking",
    msgs,
    memo,
    undefined,
    undefined,
    onFulfill
  );
}

export async function prepareBeginUnlockingMsgOrSuperfluidUnbondLockMsgIfSyntheticLock(
  context: TransactionPreparationContext,
  locks: {
    lockId: string;
    isSynthetic: boolean;
  }[],
  memo: string = "",
  onFulfill?: (tx: DeliverTxResponse) => void
) {
  const msgs = await locks.reduce(
    async (msgsPromise, lock) => {
      const msgs = await msgsPromise;
      if (!lock.isSynthetic) {
        // normal unlock
        msgs.push(
          await makeBeginUnlockingMsg({
            owner: context.address,
            iD: BigInt(lock.lockId),
            coins: [],
          })
        );
      } else {
        // unbond and unlock
        msgs.push(
          await makeSuperfluidUndelegateMsg({
            sender: context.address,
            lockId: BigInt(lock.lockId),
          }),
          await makeSuperfluidUnbondLockMsg({
            sender: context.address,
            lockId: BigInt(lock.lockId),
          })
        );
      }
      return msgs;
    },
    Promise.resolve([] as EncodeObject[])
  );

  return prepareTransaction(
    "beginUnlocking",
    msgs,
    memo,
    undefined,
    undefined,
    onFulfill
  );
}

export async function prepareUndelegateFromRebalancedValidatorSet(
  context: TransactionPreparationContext,
  coin: { amount: string; denom: Currency },
  memo: string = "",
  onFulfill?: (tx: DeliverTxResponse) => void
) {
  return prepareTransaction(
    "undelegateFromValidatorSet",
    [
      await makeUndelegateFromRebalancedValidatorSetMsg({
        delegator: context.address,
        coin: {
          denom: coin.denom.coinMinimalDenom,
          amount: coin.amount,
        },
      }),
    ],
    memo,
    undefined,
    undefined,
    onFulfill
  );
}

export async function prepareUndelegateFromValidatorSetMsg(
  context: TransactionPreparationContext,
  coin: { amount: string; denom: Currency },
  memo: string = "",
  onFulfill?: (tx: DeliverTxResponse) => void
) {
  return prepareTransaction(
    "undelegateFromValidatorSet",
    [
      await makeUndelegateFromValidatorSetMsg({
        delegator: context.address,
        coin: {
          denom: coin.denom.coinMinimalDenom,
          amount: coin.amount,
        },
      }),
    ],
    memo,
    undefined,
    undefined,
    onFulfill
  );
}

export async function prepareDelegateToValidatorSetMsg(
  context: TransactionPreparationContext,
  coin: { amount: string; denom: Currency },
  memo: string = "",
  onFulfill?: (tx: DeliverTxResponse) => void
) {
  return prepareTransaction(
    "delegateToValidatorSet",
    [
      await makeDelegateToValidatorSetMsg({
        delegator: context.address,
        coin: {
          denom: coin.denom.coinMinimalDenom,
          amount: coin.amount,
        },
      }),
    ],
    memo,
    undefined,
    undefined,
    onFulfill
  );
}

export async function prepareWithdrawDelegationRewardsMsg(
  context: TransactionPreparationContext,
  memo: string = "",
  onFulfill?: (tx: DeliverTxResponse) => void
) {
  return prepareTransaction(
    "withdrawDelegationRewards",
    [
      await makeWithdrawDelegationRewardsMsg({
        delegator: context.address,
      }),
    ],
    memo,
    undefined,
    undefined,
    onFulfill
  );
}

export async function prepareSetValidatorSetPreferenceMsg(
  context: TransactionPreparationContext,
  validators: string[],
  memo: string = "",
  onFulfill?: (tx: DeliverTxResponse) => void
) {
  const weight = new Dec(1).quo(new Dec(validators.length)).toString();

  if (!validators.length)
    throw new Error(
      "Please provide 1 or more validator address to set as preference"
    );

  return prepareTransaction(
    "setValidatorSetPreference",
    [
      await makeSetValidatorSetPreferenceMsg({
        delegator: context.address,
        preferences: validators.map((validator) => ({
          weight,
          valOperAddress: validator,
        })),
      }),
    ],
    memo,
    undefined,
    undefined,
    onFulfill
  );
}

export async function prepareSetValidatorSetPreferenceAndDelegateToValidatorSetMsg(
  context: TransactionPreparationContext,
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

  const setValidatorSetPreferenceMsg = await makeSetValidatorSetPreferenceMsg({
    delegator: context.address,
    preferences: validators.map((validator) => ({
      weight,
      valOperAddress: validator,
    })),
  });

  const setDelegateToValidatorSetMsg = await makeDelegateToValidatorSetMsg({
    delegator: context.address,
    coin: {
      denom: coin.denom.coinMinimalDenom,
      amount: coin.amount,
    },
  });

  return prepareTransaction(
    "SetValidatorSetPreferenceandDelegateToValidatorSet",
    [setValidatorSetPreferenceMsg, setDelegateToValidatorSetMsg],
    memo,
    undefined,
    undefined,
    onFulfill
  );
}

export async function prepareWithdrawDelegationRewardsAndSendDelegateToValidatorSetMsgs(
  context: TransactionPreparationContext,
  coin: { amount: string; denom: Currency },
  memo: string = "",
  onFulfill?: (tx: DeliverTxResponse) => void
) {
  const withdrawDelegationRewardsMsg = await makeWithdrawDelegationRewardsMsg({
    delegator: context.address,
  });

  const delegateToValidatorSetMsg = await makeDelegateToValidatorSetMsg({
    delegator: context.address,
    coin: {
      denom: coin.denom.coinMinimalDenom,
      amount: coin.amount,
    },
  });

  return prepareTransaction(
    "withdrawDelegationRewardsAndSendDelegateToValidatorSet",
    [withdrawDelegationRewardsMsg, delegateToValidatorSetMsg],
    memo,
    undefined,
    undefined,
    onFulfill
  );
}

export async function prepareRedelegateMsgs(
  context: TransactionPreparationContext,
  redelegations: {
    validatorSrcAddress: string;
    validatorDstAddress: string;
    amount: string;
  }[],
  validatorSetPreference?: string[],
  memo: string = "",
  onFulfill?: (tx: DeliverTxResponse) => void
) {
  if (!redelegations.length)
    throw new Error("Please provide 1 or more redelegations");

  if (validatorSetPreference && !validatorSetPreference.length)
    throw new Error(
      "Please provide 1 or more validator address to set as preference"
    );

  const stakeDenom = context.stakeCurrency().coinMinimalDenom;

  const msgs: EncodeObject[] = await Promise.all(
    redelegations.map(({ validatorSrcAddress, validatorDstAddress, amount }) =>
      makeBeginRedelegateMsg({
        delegatorAddress: context.address,
        validatorSrcAddress,
        validatorDstAddress,
        amount: { denom: stakeDenom, amount },
      })
    )
  );

  if (validatorSetPreference) {
    const weight = new Dec(1)
      .quo(new Dec(validatorSetPreference.length))
      .toString();

    msgs.push(
      await makeSetValidatorSetPreferenceMsg({
        delegator: context.address,
        preferences: validatorSetPreference.map((validator) => ({
          weight,
          valOperAddress: validator,
        })),
      })
    );
  }

  return prepareTransaction(
    "redelegate",
    msgs,
    memo,
    undefined,
    undefined,
    onFulfill
  );
}
