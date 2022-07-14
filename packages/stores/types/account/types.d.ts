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
    readonly superfluidDelegate: MsgOpt;
    readonly lockAndSuperfluidDelegate: MsgOpt;
    readonly beginUnlocking: MsgOpt;
    readonly superfluidUndelegate: MsgOpt;
    readonly superfluidUnbondLock: MsgOpt;
    readonly unlockPeriodLock: MsgOpt;
    readonly unPoolWhitelistedPool: MsgOpt;
}
export declare const defaultMsgOpts: OsmosisMsgOpts;
