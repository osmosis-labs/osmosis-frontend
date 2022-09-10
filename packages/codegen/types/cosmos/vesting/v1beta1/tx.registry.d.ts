import { GeneratedType, Registry } from "@cosmjs/proto-signing";
import { MsgCreateVestingAccount, MsgCreatePermanentLockedAccount, MsgCreatePeriodicVestingAccount } from "./tx";
export declare const registry: ReadonlyArray<[string, GeneratedType]>;
export declare const load: (protoRegistry: Registry) => void;
export declare const MessageComposer: {
    encoded: {
        createVestingAccount(value: MsgCreateVestingAccount): {
            typeUrl: string;
            value: Uint8Array;
        };
        createPermanentLockedAccount(value: MsgCreatePermanentLockedAccount): {
            typeUrl: string;
            value: Uint8Array;
        };
        createPeriodicVestingAccount(value: MsgCreatePeriodicVestingAccount): {
            typeUrl: string;
            value: Uint8Array;
        };
    };
    withTypeUrl: {
        createVestingAccount(value: MsgCreateVestingAccount): {
            typeUrl: string;
            value: MsgCreateVestingAccount;
        };
        createPermanentLockedAccount(value: MsgCreatePermanentLockedAccount): {
            typeUrl: string;
            value: MsgCreatePermanentLockedAccount;
        };
        createPeriodicVestingAccount(value: MsgCreatePeriodicVestingAccount): {
            typeUrl: string;
            value: MsgCreatePeriodicVestingAccount;
        };
    };
    toJSON: {
        createVestingAccount(value: MsgCreateVestingAccount): {
            typeUrl: string;
            value: unknown;
        };
        createPermanentLockedAccount(value: MsgCreatePermanentLockedAccount): {
            typeUrl: string;
            value: unknown;
        };
        createPeriodicVestingAccount(value: MsgCreatePeriodicVestingAccount): {
            typeUrl: string;
            value: unknown;
        };
    };
    fromJSON: {
        createVestingAccount(value: any): {
            typeUrl: string;
            value: MsgCreateVestingAccount;
        };
        createPermanentLockedAccount(value: any): {
            typeUrl: string;
            value: MsgCreatePermanentLockedAccount;
        };
        createPeriodicVestingAccount(value: any): {
            typeUrl: string;
            value: MsgCreatePeriodicVestingAccount;
        };
    };
    fromPartial: {
        createVestingAccount(value: MsgCreateVestingAccount): {
            typeUrl: string;
            value: MsgCreateVestingAccount;
        };
        createPermanentLockedAccount(value: MsgCreatePermanentLockedAccount): {
            typeUrl: string;
            value: MsgCreatePermanentLockedAccount;
        };
        createPeriodicVestingAccount(value: MsgCreatePeriodicVestingAccount): {
            typeUrl: string;
            value: MsgCreatePeriodicVestingAccount;
        };
    };
};
