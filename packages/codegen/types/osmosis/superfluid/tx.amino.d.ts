import { AminoMsg } from "@cosmjs/amino";
import { MsgSuperfluidDelegate, MsgSuperfluidUndelegate, MsgSuperfluidUnbondLock, MsgLockAndSuperfluidDelegate, MsgUnPoolWhitelistedPool } from "./tx";
export interface AminoMsgSuperfluidDelegate extends AminoMsg {
    type: "osmosis/superfluid-delegate";
    value: {
        sender: string;
        lock_id: string;
        val_addr: string;
    };
}
export interface AminoMsgSuperfluidUndelegate extends AminoMsg {
    type: "osmosis/superfluid-undelegate";
    value: {
        sender: string;
        lock_id: string;
    };
}
export interface AminoMsgSuperfluidUnbondLock extends AminoMsg {
    type: "osmosis/superfluid-unbond-lock";
    value: {
        sender: string;
        lock_id: string;
    };
}
export interface AminoMsgLockAndSuperfluidDelegate extends AminoMsg {
    type: "osmosis/lock-and-superfluid-delegate";
    value: {
        sender: string;
        coins: {
            denom: string;
            amount: string;
        }[];
        val_addr: string;
    };
}
export interface AminoMsgUnPoolWhitelistedPool extends AminoMsg {
    type: "osmosis/unpool-whitelisted-pool";
    value: {
        sender: string;
        pool_id: string;
    };
}
export declare const AminoConverter: {
    "/osmosis.superfluid.MsgSuperfluidDelegate": {
        aminoType: string;
        toAmino: ({ sender, lockId, valAddr }: MsgSuperfluidDelegate) => AminoMsgSuperfluidDelegate["value"];
        fromAmino: ({ sender, lock_id, val_addr }: AminoMsgSuperfluidDelegate["value"]) => MsgSuperfluidDelegate;
    };
    "/osmosis.superfluid.MsgSuperfluidUndelegate": {
        aminoType: string;
        toAmino: ({ sender, lockId }: MsgSuperfluidUndelegate) => AminoMsgSuperfluidUndelegate["value"];
        fromAmino: ({ sender, lock_id }: AminoMsgSuperfluidUndelegate["value"]) => MsgSuperfluidUndelegate;
    };
    "/osmosis.superfluid.MsgSuperfluidUnbondLock": {
        aminoType: string;
        toAmino: ({ sender, lockId }: MsgSuperfluidUnbondLock) => AminoMsgSuperfluidUnbondLock["value"];
        fromAmino: ({ sender, lock_id }: AminoMsgSuperfluidUnbondLock["value"]) => MsgSuperfluidUnbondLock;
    };
    "/osmosis.superfluid.MsgLockAndSuperfluidDelegate": {
        aminoType: string;
        toAmino: ({ sender, coins, valAddr }: MsgLockAndSuperfluidDelegate) => AminoMsgLockAndSuperfluidDelegate["value"];
        fromAmino: ({ sender, coins, val_addr }: AminoMsgLockAndSuperfluidDelegate["value"]) => MsgLockAndSuperfluidDelegate;
    };
    "/osmosis.superfluid.MsgUnPoolWhitelistedPool": {
        aminoType: string;
        toAmino: ({ sender, poolId }: MsgUnPoolWhitelistedPool) => AminoMsgUnPoolWhitelistedPool["value"];
        fromAmino: ({ sender, pool_id }: AminoMsgUnPoolWhitelistedPool["value"]) => MsgUnPoolWhitelistedPool;
    };
};
