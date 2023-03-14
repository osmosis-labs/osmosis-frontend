import { MsgOpt } from "@keplr-wallet/stores";

import { osmosis } from "./msg/proto";

interface AccountMsgOpt extends MsgOpt {
  protoTypeUrl: string;
  protoClass: any;
  shareCoinDecimals?: number;
}

export const createMsgOpts = <Dict extends Record<string, AccountMsgOpt>>(
  dict: Dict
) => dict;

export const osmosisMsgOpts = createMsgOpts({
  createBalancerPool: {
    type: "osmosis/gamm/create-balancer-pool",
    gas: 350000,
    protoClass: osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool,
    protoTypeUrl:
      "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool" as const,
  },
  createStableswapPool: {
    type: "osmosis/gamm/create-stableswap-pool",
    gas: 350000,
    protoClass:
      osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool,
    protoTypeUrl:
      "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool" as const,
  },
  joinPool: {
    type: "osmosis/gamm/join-pool",
    gas: 240000,
    shareCoinDecimals: 18,
    protoClass: osmosis.gamm.v1beta1.MsgJoinPool,
    protoTypeUrl: "/osmosis.gamm.v1beta1.MsgJoinPool" as const,
  },
  joinSwapExternAmountIn: {
    type: "osmosis/gamm/join-swap-extern-amount-in",
    gas: 140000,
    shareCoinDecimals: 18,
    protoClass: osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn,
    protoTypeUrl: "/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn" as const,
  },
  exitPool: {
    type: "osmosis/gamm/exit-pool",
    gas: 280000,
    shareCoinDecimals: 18,
    protoClass: osmosis.gamm.v1beta1.MsgExitPool,
    protoTypeUrl: "/osmosis.gamm.v1beta1.MsgExitPool" as const,
  },
  swapExactAmountIn: {
    type: "osmosis/gamm/swap-exact-amount-in",
    gas: 250000,
    protoClass: osmosis.gamm.v1beta1.MsgSwapExactAmountIn,
    protoTypeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountIn" as const,
  },
  swapExactAmountOut: {
    type: "osmosis/gamm/swap-exact-amount-out",
    gas: 250000,
    protoClass: osmosis.gamm.v1beta1.MsgSwapExactAmountOut,
    protoTypeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountOut" as const,
  },
  lockTokens: {
    type: "osmosis/lockup/lock-tokens",
    gas: 450000,
    protoClass: osmosis.lockup.MsgLockTokens,
    protoTypeUrl: "/osmosis.lockup.MsgLockTokens" as const,
  },
  superfluidDelegate: {
    type: "osmosis/superfluid-delegate",
    gas: 500000,
    protoClass: osmosis.superfluid.MsgSuperfluidDelegate,
    protoTypeUrl: "/osmosis.superfluid.MsgSuperfluidDelegate" as const,
  },
  lockAndSuperfluidDelegate: {
    type: "osmosis/lock-and-superfluid-delegate",
    gas: 500000,
    protoClass: osmosis.superfluid.MsgLockAndSuperfluidDelegate,
    protoTypeUrl: "/osmosis.superfluid.MsgLockAndSuperfluidDelegate" as const,
  },
  beginUnlocking: {
    type: "osmosis/lockup/begin-unlock-period-lock",
    // Gas per msg
    gas: 140000,
    protoClass: osmosis.lockup.MsgBeginUnlocking,
    protoTypeUrl: "/osmosis.lockup.MsgBeginUnlocking" as const,
  },
  superfluidUndelegate: {
    type: "osmosis/superfluid-undelegate",
    gas: 300000,
    protoClass: osmosis.superfluid.MsgSuperfluidUndelegate,
    protoTypeUrl: "/osmosis.superfluid.MsgSuperfluidUndelegate" as const,
  },
  superfluidUnbondLock: {
    type: "osmosis/superfluid-unbond-lock",
    // Gas per msg
    gas: 300000,
    protoClass: osmosis.superfluid.MsgSuperfluidUnbondLock,
    protoTypeUrl: "/osmosis.superfluid.MsgSuperfluidUnbondLock" as const,
  },
  unlockPeriodLock: {
    type: "osmosis/lockup/unlock-period-lock",
    // Gas per msg
    gas: 140000,
    protoClass: undefined,
    protoTypeUrl: "",
  },
  unPoolWhitelistedPool: {
    type: "osmosis/unpool-whitelisted-pool",
    gas: 3000000,
    protoClass: osmosis.superfluid.MsgUnPoolWhitelistedPool,
    protoTypeUrl: "/osmosis.superfluid.MsgUnPoolWhitelistedPool" as const,
  },
});
