import { AminoMsg } from "@cosmjs/amino";
import { MsgCreateVestingAccount, MsgCreatePermanentLockedAccount, MsgCreatePeriodicVestingAccount } from "./tx";
export interface AminoMsgCreateVestingAccount extends AminoMsg {
    type: "cosmos-sdk/MsgCreateVestingAccount";
    value: {
        from_address: string;
        to_address: string;
        amount: {
            denom: string;
            amount: string;
        }[];
        end_time: string;
        delayed: boolean;
    };
}
export interface AminoMsgCreatePermanentLockedAccount extends AminoMsg {
    type: "cosmos-sdk/MsgCreatePermanentLockedAccount";
    value: {
        from_address: string;
        to_address: string;
        amount: {
            denom: string;
            amount: string;
        }[];
    };
}
export interface AminoMsgCreatePeriodicVestingAccount extends AminoMsg {
    type: "cosmos-sdk/MsgCreatePeriodicVestingAccount";
    value: {
        from_address: string;
        to_address: string;
        start_time: string;
        vesting_periods: {
            length: string;
            amount: {
                denom: string;
                amount: string;
            }[];
        }[];
    };
}
export declare const AminoConverter: {
    "/cosmos.vesting.v1beta1.MsgCreateVestingAccount": {
        aminoType: string;
        toAmino: ({ fromAddress, toAddress, amount, endTime, delayed }: MsgCreateVestingAccount) => AminoMsgCreateVestingAccount["value"];
        fromAmino: ({ from_address, to_address, amount, end_time, delayed }: AminoMsgCreateVestingAccount["value"]) => MsgCreateVestingAccount;
    };
    "/cosmos.vesting.v1beta1.MsgCreatePermanentLockedAccount": {
        aminoType: string;
        toAmino: ({ fromAddress, toAddress, amount }: MsgCreatePermanentLockedAccount) => AminoMsgCreatePermanentLockedAccount["value"];
        fromAmino: ({ from_address, to_address, amount }: AminoMsgCreatePermanentLockedAccount["value"]) => MsgCreatePermanentLockedAccount;
    };
    "/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccount": {
        aminoType: string;
        toAmino: ({ fromAddress, toAddress, startTime, vestingPeriods }: MsgCreatePeriodicVestingAccount) => AminoMsgCreatePeriodicVestingAccount["value"];
        fromAmino: ({ from_address, to_address, start_time, vesting_periods }: AminoMsgCreatePeriodicVestingAccount["value"]) => MsgCreatePeriodicVestingAccount;
    };
};
