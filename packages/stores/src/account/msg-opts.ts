import { MsgOpt } from "@keplr-wallet/stores";

export interface OsmosisMsgOpts {
  readonly createBalancerPool: MsgOpt;
  readonly createStableswapPool: MsgOpt;
  readonly joinPool: MsgOpt & {
    shareCoinDecimals: number;
  };
  readonly joinSwapExternAmountIn: MsgOpt & {
    shareCoinDecimals: number;
  };
  readonly exitPool: MsgOpt & {
    shareCoinDecimals: number;
  };
  readonly splitRouteSwapExactAmountIn: (numPools: number) => MsgOpt;
  readonly swapExactAmountIn: (numPools: number) => MsgOpt;
  readonly swapExactAmountOut: (numPools: number) => MsgOpt;
  readonly lockTokens: MsgOpt;
  readonly superfluidDelegate: MsgOpt;
  readonly lockAndSuperfluidDelegate: MsgOpt;
  readonly beginUnlocking: MsgOpt;
  readonly superfluidUndelegate: MsgOpt;
  readonly superfluidUnbondLock: MsgOpt;
  readonly unlockPeriodLock: MsgOpt;
  readonly unPoolWhitelistedPool: MsgOpt;
}

export const defaultMsgOpts: OsmosisMsgOpts = {
  createBalancerPool: {
    type: "osmosis/gamm/create-balancer-pool",
    gas: 350000,
  },
  createStableswapPool: {
    type: "osmosis/gamm/create-stableswap-pool",
    gas: 350000,
  },
  joinPool: {
    type: "osmosis/gamm/join-pool",
    gas: 240000,
    shareCoinDecimals: 18,
  },
  joinSwapExternAmountIn: {
    type: "osmosis/gamm/join-swap-extern-amount-in",
    gas: 140000,
    shareCoinDecimals: 18,
  },
  exitPool: {
    type: "osmosis/gamm/exit-pool",
    gas: 280000,
    shareCoinDecimals: 18,
  },
  splitRouteSwapExactAmountIn: (numPools: number) => ({
    type: "osmosis/poolmanager/split-amount-in",
    gas: 110_000 * numPools,
  }),
  swapExactAmountIn: (numPools: number) => ({
    type: "osmosis/poolmanager/swap-exact-amount-in",
    gas: 25_0000 * numPools,
  }),
  swapExactAmountOut: (numPools: number) => ({
    type: "osmosis/poolmanager/swap-exact-amount-out",
    gas: 25_0000 * numPools,
  }),
  lockTokens: {
    type: "osmosis/lockup/lock-tokens",
    gas: 450000,
  },
  superfluidDelegate: {
    type: "osmosis/superfluid-delegate",
    gas: 500000,
  },
  lockAndSuperfluidDelegate: {
    type: "osmosis/lock-and-superfluid-delegate",
    gas: 502000,
  },
  beginUnlocking: {
    type: "osmosis/lockup/begin-unlock-period-lock",
    // Gas per msg
    gas: 140000,
  },
  superfluidUndelegate: {
    type: "osmosis/superfluid-undelegate",
    gas: 300000,
  },
  superfluidUnbondLock: {
    type: "osmosis/superfluid-unbond-lock",
    // Gas per msg
    gas: 300000,
  },
  unlockPeriodLock: {
    type: "osmosis/lockup/unlock-period-lock",
    // Gas per msg
    gas: 140000,
  },
  unPoolWhitelistedPool: {
    type: "osmosis/unpool-whitelisted-pool",
    gas: 3000000,
  },
};
