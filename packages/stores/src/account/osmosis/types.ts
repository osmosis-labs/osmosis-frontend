import { osmosis } from "@osmosis-labs/proto-codecs";

import { createMsgOpts } from "../utils";

export const osmosisMsgOpts = createMsgOpts({
  createBalancerPool: {
    messageComposer:
      osmosis.gamm.poolmodels.balancer.v1beta1.MessageComposer.withTypeUrl
        .createBalancerPool,
  },
  createStableswapPool: {
    messageComposer:
      osmosis.gamm.poolmodels.stableswap.v1beta1.MessageComposer.withTypeUrl
        .createStableswapPool,
  },
  createConcentratedPool: {
    messageComposer:
      osmosis.concentratedliquidity.poolmodel.concentrated.v1beta1
        .MessageComposer.withTypeUrl.createConcentratedPool,
  },
  joinPool: {
    shareCoinDecimals: 18,
    messageComposer: osmosis.gamm.v1beta1.MessageComposer.withTypeUrl.joinPool,
  },
  joinSwapExternAmountIn: {
    shareCoinDecimals: 18,
    messageComposer:
      osmosis.gamm.v1beta1.MessageComposer.withTypeUrl.joinSwapExternAmountIn,
  },
  exitPool: {
    shareCoinDecimals: 18,
    messageComposer: osmosis.gamm.v1beta1.MessageComposer.withTypeUrl.exitPool,
  },
  splitRouteSwapExactAmountIn: {
    messageComposer:
      osmosis.poolmanager.v1beta1.MessageComposer.withTypeUrl
        .splitRouteSwapExactAmountIn,
  },
  swapExactAmountIn: {
    messageComposer:
      osmosis.poolmanager.v1beta1.MessageComposer.withTypeUrl.swapExactAmountIn,
  },
  swapExactAmountOut: {
    messageComposer:
      osmosis.poolmanager.v1beta1.MessageComposer.withTypeUrl
        .swapExactAmountOut,
  },
  lockTokens: {
    messageComposer: osmosis.lockup.MessageComposer.withTypeUrl.lockTokens,
  },
  superfluidDelegate: {
    messageComposer:
      osmosis.superfluid.MessageComposer.withTypeUrl.superfluidDelegate,
  },
  lockAndSuperfluidDelegate: {
    messageComposer:
      osmosis.superfluid.MessageComposer.withTypeUrl.lockAndSuperfluidDelegate,
  },
  beginUnlocking: {
    messageComposer: osmosis.lockup.MessageComposer.withTypeUrl.beginUnlocking,
  },
  superfluidUndelegate: {
    messageComposer:
      osmosis.superfluid.MessageComposer.withTypeUrl.superfluidUndelegate,
  },
  superfluidUnbondLock: {
    // Gas per msg
    messageComposer:
      osmosis.superfluid.MessageComposer.withTypeUrl.superfluidUnbondLock,
  },
  unlockPeriodLock: {
    // Gas per msg
    gas: 140000,
  },
  unPoolWhitelistedPool: {
    messageComposer:
      osmosis.superfluid.MessageComposer.withTypeUrl.unPoolWhitelistedPool,
  },
  clCreatePosition: {
    messageComposer:
      osmosis.concentratedliquidity.v1beta1.MessageComposer.withTypeUrl
        .createPosition,
    gas: 3_000_000,
  },
  clCreateSuperfluidPosition: {
    messageComposer:
      osmosis.superfluid.MessageComposer.withTypeUrl
        .createFullRangePositionAndSuperfluidDelegate,
  },
  clCollectPositionsSpreadRewards: {
    messageComposer:
      osmosis.concentratedliquidity.v1beta1.MessageComposer.withTypeUrl
        .collectSpreadRewards,
  },
  clCollectPositionsIncentivesRewards: {
    messageComposer:
      osmosis.concentratedliquidity.v1beta1.MessageComposer.withTypeUrl
        .collectIncentives,
  },
  unlockAndMigrateSharesToFullRangeConcentratedPosition: {
    messageComposer:
      osmosis.superfluid.MessageComposer.withTypeUrl
        .unlockAndMigrateSharesToFullRangeConcentratedPosition,
  },
  clWithdrawPosition: {
    messageComposer:
      osmosis.concentratedliquidity.v1beta1.MessageComposer.withTypeUrl
        .withdrawPosition,
  },
  clAddToConcentratedPosition: {
    messageComposer:
      osmosis.concentratedliquidity.v1beta1.MessageComposer.withTypeUrl
        .addToPosition,
  },
  clAddToConcentatedSuperfluidPosition: {
    messageComposer:
      osmosis.superfluid.MessageComposer.withTypeUrl
        .addToConcentratedLiquiditySuperfluidPosition,
  },
  clCreateAndSuperfluidDelegatePosition: {
    messageComposer:
      osmosis.superfluid.MessageComposer.withTypeUrl
        .createFullRangePositionAndSuperfluidDelegate,
  },
  undelegateFromValidatorSet: {
    gas: 500000,
    messageComposer:
      osmosis.valsetpref.v1beta1.MessageComposer.withTypeUrl
        .undelegateFromValidatorSet,
  },
  delegateToValidatorSet: {
    gas: 500000,
    messageComposer:
      osmosis.valsetpref.v1beta1.MessageComposer.withTypeUrl
        .delegateToValidatorSet,
  },
  withdrawDelegationRewards: {
    gas: 500000,
    messageComposer:
      osmosis.valsetpref.v1beta1.MessageComposer.withTypeUrl
        .withdrawDelegationRewards,
  },
});

export const DEFAULT_SLIPPAGE = "2.5";
