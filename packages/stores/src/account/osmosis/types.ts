import { osmosis } from "@osmosis-labs/proto-codecs";

import { createMsgOpts } from "../utils";

export const osmosisMsgOpts = createMsgOpts({
  createBalancerPool: {
    gas: 350000,
    messageComposer:
      osmosis.gamm.poolmodels.balancer.v1beta1.MessageComposer.withTypeUrl
        .createBalancerPool,
  },
  createStableswapPool: {
    gas: 350000,
    messageComposer:
      osmosis.gamm.poolmodels.stableswap.v1beta1.MessageComposer.withTypeUrl
        .createStableswapPool,
  },
  createConcentratedPool: {
    messageComposer:
      osmosis.concentratedliquidity.poolmodel.concentrated.v1beta1
        .MessageComposer.withTypeUrl.createConcentratedPool,
    gas: 350000,
  },
  joinPool: {
    gas: 240000,
    shareCoinDecimals: 18,
    messageComposer: osmosis.gamm.v1beta1.MessageComposer.withTypeUrl.joinPool,
  },
  joinSwapExternAmountIn: {
    gas: 140000,
    shareCoinDecimals: 18,
    messageComposer:
      osmosis.gamm.v1beta1.MessageComposer.withTypeUrl.joinSwapExternAmountIn,
  },
  exitPool: {
    gas: 280000,
    shareCoinDecimals: 18,
    messageComposer: osmosis.gamm.v1beta1.MessageComposer.withTypeUrl.exitPool,
  },
  splitRouteSwapExactAmountIn: (numPools: number, numTicks = 0) => ({
    messageComposer:
      osmosis.poolmanager.v1beta1.MessageComposer.withTypeUrl
        .splitRouteSwapExactAmountIn,
    gas: 510_000 * numPools + 50_000 * numTicks,
  }),
  swapExactAmountIn: (numPools: number, numTicks = 0) => ({
    messageComposer:
      osmosis.poolmanager.v1beta1.MessageComposer.withTypeUrl.swapExactAmountIn,
    gas: 500_000 * numPools + 50_000 * numTicks,
  }),
  swapExactAmountOut: (numPools: number, numTicks = 0) => ({
    messageComposer:
      osmosis.poolmanager.v1beta1.MessageComposer.withTypeUrl
        .swapExactAmountOut,
    gas: 500_000 * numPools + 50_000 * numTicks,
  }),
  lockTokens: {
    gas: 450000,
    messageComposer: osmosis.lockup.MessageComposer.withTypeUrl.lockTokens,
  },
  superfluidDelegate: {
    gas: 500000,
    messageComposer:
      osmosis.superfluid.MessageComposer.withTypeUrl.superfluidDelegate,
  },
  lockAndSuperfluidDelegate: {
    gas: 540_000,
    messageComposer:
      osmosis.superfluid.MessageComposer.withTypeUrl.lockAndSuperfluidDelegate,
  },
  beginUnlocking: {
    // Gas per msg
    gas: 140000,
    messageComposer: osmosis.lockup.MessageComposer.withTypeUrl.beginUnlocking,
  },
  superfluidUndelegate: {
    gas: 300000,
    messageComposer:
      osmosis.superfluid.MessageComposer.withTypeUrl.superfluidUndelegate,
  },
  superfluidUnbondLock: {
    // Gas per msg
    gas: 300000,
    messageComposer:
      osmosis.superfluid.MessageComposer.withTypeUrl.superfluidUnbondLock,
  },
  unlockPeriodLock: {
    // Gas per msg
    gas: 140000,
  },
  unPoolWhitelistedPool: {
    gas: 3000000,
    messageComposer:
      osmosis.superfluid.MessageComposer.withTypeUrl.unPoolWhitelistedPool,
  },
  clCreatePosition: {
    messageComposer:
      osmosis.concentratedliquidity.v1beta1.MessageComposer.withTypeUrl
        .createPosition,
    gas: 3_000_000,
  },
  clCollectPositionsSpreadRewards: (numPositions: number) => ({
    messageComposer:
      osmosis.concentratedliquidity.v1beta1.MessageComposer.withTypeUrl
        .collectSpreadRewards,
    gas: 1_000_000 * numPositions,
  }),
  clCollectPositionsIncentivesRewards: (numPositions: number) => ({
    messageComposer:
      osmosis.concentratedliquidity.v1beta1.MessageComposer.withTypeUrl
        .collectIncentives,
    gas: 1_000_000 * numPositions,
  }),
  unlockAndMigrateSharesToFullRangeConcentratedPosition: (
    numLocks: number
  ) => ({
    messageComposer:
      osmosis.superfluid.MessageComposer.withTypeUrl
        .unlockAndMigrateSharesToFullRangeConcentratedPosition,
    gas: 2_000_000 * numLocks,
  }),
  clWithdrawPosition: {
    messageComposer:
      osmosis.concentratedliquidity.v1beta1.MessageComposer.withTypeUrl
        .withdrawPosition,
    gas: 3_000_000,
  },
  clAddToConcentratedPosition: {
    messageComposer:
      osmosis.concentratedliquidity.v1beta1.MessageComposer.withTypeUrl
        .addToPosition,
    gas: 2_200_000,
  },
  clAddToConcentatedSuperfluidPosition: {
    messageComposer:
      osmosis.superfluid.MessageComposer.withTypeUrl
        .addToConcentratedLiquiditySuperfluidPosition,
    gas: 2_500_000,
  },
  sfStakeSuperfluidPosition: {
    messageComposer:
      osmosis.superfluid.MessageComposer.withTypeUrl
        .lockExistingFullRangePositionAndSFStake,
    gas: 1_000_000,
  },
});

export const DEFAULT_SLIPPAGE = "2.5";
