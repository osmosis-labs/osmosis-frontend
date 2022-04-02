import { MsgOpt } from "@keplr-wallet/stores";

export interface OsmosisMsgOpts {
  readonly createPool: MsgOpt;
  readonly joinPool: MsgOpt & {
    shareCoinDecimals: number;
  };
  readonly joinSwapExternAmountIn: MsgOpt & {
    shareCoinDecimals: number;
  };
  readonly exitPool: MsgOpt & {
    shareCoinDecimals: number;
  };
  readonly swapExactAmountIn: MsgOpt;
  readonly swapExactAmountOut: MsgOpt;
  readonly lockTokens: MsgOpt;
  readonly beginUnlocking: MsgOpt;
  readonly unlockPeriodLock: MsgOpt;
}

export const defaultMsgOpts: OsmosisMsgOpts = {
  createPool: {
    type: "osmosis/gamm/create-pool",
    gas: 250000,
  },
  joinPool: {
    type: "osmosis/gamm/join-pool",
    gas: 140000,
    shareCoinDecimals: 18,
  },
  joinSwapExternAmountIn: {
    type: "osmosis/gamm/join-swap-extern-amount-in",
    gas: 140000,
    shareCoinDecimals: 18,
  },
  exitPool: {
    type: "osmosis/gamm/exit-pool",
    gas: 140000,
    shareCoinDecimals: 18,
  },
  swapExactAmountIn: {
    type: "osmosis/gamm/swap-exact-amount-in",
    gas: 250000,
  },
  swapExactAmountOut: {
    type: "osmosis/gamm/swap-exact-amount-out",
    gas: 250000,
  },
  lockTokens: {
    type: "osmosis/lockup/lock-tokens",
    gas: 250000,
  },
  beginUnlocking: {
    type: "osmosis/lockup/begin-unlock-period-lock",
    // Gas per msg
    gas: 140000,
  },
  unlockPeriodLock: {
    type: "osmosis/lockup/unlock-period-lock",
    // Gas per msg
    gas: 140000,
  },
};
