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
  makeSuperfluidDelegateMsg,
  makeSuperfluidUnbondLockMsg,
  makeSuperfluidUndelegateMsg,
  makeSwapExactAmountInMsg,
  makeSwapExactAmountOutMsg,
  makeUndelegateFromRebalancedValidatorSetMsg,
  makeUndelegateFromValidatorSetMsg,
  makeWithdrawDelegationRewardsMsg,
  makeWithdrawPositionMsg,
} from "../message-composers/osmosis";
import { createMsgOpts } from "../utils";

export const osmosisMsgOpts = createMsgOpts({
  createBalancerPool: {
    messageComposer: makeCreateBalancerPoolMsg,
  },
  createStableswapPool: {
    messageComposer: makeCreateStableswapPoolMsg,
  },
  createConcentratedPool: {
    messageComposer: makeCreateConcentratedPoolMsg,
  },
  joinPool: {
    shareCoinDecimals: 18,
    messageComposer: makeJoinPoolMsg,
  },
  joinSwapExternAmountIn: {
    shareCoinDecimals: 18,
    messageComposer: makeJoinSwapExternAmountInMsg,
  },
  exitPool: {
    shareCoinDecimals: 18,
    messageComposer: makeExitPoolMsg,
  },
  splitRouteSwapExactAmountIn: {
    messageComposer: makeSplitRoutesSwapExactAmountInMsg,
  },
  swapExactAmountIn: {
    messageComposer: makeSwapExactAmountInMsg,
  },
  swapExactAmountOut: {
    messageComposer: makeSwapExactAmountOutMsg,
  },
  lockTokens: {
    messageComposer: makeLockTokensMsg,
  },
  superfluidDelegate: {
    messageComposer: makeSuperfluidDelegateMsg,
  },
  lockAndSuperfluidDelegate: {
    messageComposer: makeLockAndSuperfluidDelegateMsg,
  },
  beginUnlocking: {
    messageComposer: makeBeginUnlockingMsg,
  },
  superfluidUndelegate: {
    messageComposer: makeSuperfluidUndelegateMsg,
  },
  superfluidUnbondLock: {
    messageComposer: makeSuperfluidUnbondLockMsg,
  },
  unlockPeriodLock: {
    gas: 140000,
  },
  clCreatePosition: {
    messageComposer: makeCreatePositionMsg,
    gas: 3_000_000,
  },
  clCreateSuperfluidPosition: {
    messageComposer: makeCreateFullRangePositionAndSuperfluidDelegateMsg,
  },
  clCollectPositionsSpreadRewards: {
    messageComposer: makeCollectSpreadRewardsMsg,
  },
  clCollectPositionsIncentivesRewards: {
    messageComposer: makeCollectIncentivesMsg,
  },
  clWithdrawPosition: {
    messageComposer: makeWithdrawPositionMsg,
  },
  clAddToConcentratedPosition: {
    messageComposer: makeAddToPositionMsg,
  },
  clAddToConcentatedSuperfluidPosition: {
    messageComposer: makeAddToConcentratedLiquiditySuperfluidPositionMsg,
  },
  clCreateAndSuperfluidDelegatePosition: {
    messageComposer: makeCreateFullRangePositionAndSuperfluidDelegateMsg,
  },
  undelegateFromValidatorSet: {
    messageComposer: makeUndelegateFromValidatorSetMsg,
  },
  delegateToValidatorSet: {
    gas: 500000,
    messageComposer: makeDelegateToValidatorSetMsg,
  },
  withdrawDelegationRewards: {
    messageComposer: makeWithdrawDelegationRewardsMsg,
  },
  setValidatorSetPreference: {
    messageComposer: makeSetValidatorSetPreferenceMsg,
  },
  undelegateFromRebalancedValidatorSet: {
    messageComposer: makeUndelegateFromRebalancedValidatorSetMsg,
  },
  addAuthenticator: {
    messageComposer: makeAddAuthenticatorMsg,
  },
  removeAuthenticator: {
    messageComposer: makeRemoveAuthenticatorMsg,
  },
});

export const DEFAULT_SLIPPAGE = "2.5";
