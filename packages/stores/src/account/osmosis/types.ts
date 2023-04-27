import { osmosis } from "@osmosis-labs/proto-encoder";

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
  swapExactAmountIn: {
    gas: 250000,
    messageComposer:
      osmosis.gamm.v1beta1.MessageComposer.withTypeUrl.swapExactAmountIn,
  },
  swapExactAmountOut: {
    gas: 250000,
    messageComposer:
      osmosis.gamm.v1beta1.MessageComposer.withTypeUrl.swapExactAmountOut,
  },
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
    gas: 502000,
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
});
