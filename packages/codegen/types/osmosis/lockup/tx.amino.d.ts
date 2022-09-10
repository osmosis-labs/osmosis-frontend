import { AminoMsg } from "@cosmjs/amino";
import { MsgLockTokens, MsgBeginUnlockingAll, MsgBeginUnlocking, MsgExtendLockup } from "./tx";
export interface AminoMsgLockTokens extends AminoMsg {
    type: "osmosis/lockup/lock-tokens";
    value: {
        owner: string;
        duration: {
            seconds: string;
            nanos: number;
        };
        coins: {
            denom: string;
            amount: string;
        }[];
    };
}
export interface AminoMsgBeginUnlockingAll extends AminoMsg {
    type: "osmosis/lockup/begin-unlocking-all";
    value: {
        owner: string;
    };
}
export interface AminoMsgBeginUnlocking extends AminoMsg {
    type: "osmosis/lockup/begin-unlocking";
    value: {
        owner: string;
        ID: string;
        coins: {
            denom: string;
            amount: string;
        }[];
    };
}
export interface AminoMsgExtendLockup extends AminoMsg {
    type: "osmosis/lockup/extend-lockup";
    value: {
        owner: string;
        ID: string;
        duration: {
            seconds: string;
            nanos: number;
        };
    };
}
export declare const AminoConverter: {
    "/osmosis.lockup.MsgLockTokens": {
        aminoType: string;
        toAmino: ({ owner, duration, coins }: MsgLockTokens) => AminoMsgLockTokens["value"];
        fromAmino: ({ owner, duration, coins }: AminoMsgLockTokens["value"]) => MsgLockTokens;
    };
    "/osmosis.lockup.MsgBeginUnlockingAll": {
        aminoType: string;
        toAmino: ({ owner }: MsgBeginUnlockingAll) => AminoMsgBeginUnlockingAll["value"];
        fromAmino: ({ owner }: AminoMsgBeginUnlockingAll["value"]) => MsgBeginUnlockingAll;
    };
    "/osmosis.lockup.MsgBeginUnlocking": {
        aminoType: string;
        toAmino: ({ owner, ID, coins }: MsgBeginUnlocking) => AminoMsgBeginUnlocking["value"];
        fromAmino: ({ owner, ID, coins }: AminoMsgBeginUnlocking["value"]) => MsgBeginUnlocking;
    };
    "/osmosis.lockup.MsgExtendLockup": {
        aminoType: string;
        toAmino: ({ owner, ID, duration }: MsgExtendLockup) => AminoMsgExtendLockup["value"];
        fromAmino: ({ owner, ID, duration }: AminoMsgExtendLockup["value"]) => MsgExtendLockup;
    };
};
