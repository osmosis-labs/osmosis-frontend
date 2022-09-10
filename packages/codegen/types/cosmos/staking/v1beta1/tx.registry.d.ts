import { GeneratedType, Registry } from "@cosmjs/proto-signing";
import { MsgCreateValidator, MsgEditValidator, MsgDelegate, MsgBeginRedelegate, MsgUndelegate } from "./tx";
export declare const registry: ReadonlyArray<[string, GeneratedType]>;
export declare const load: (protoRegistry: Registry) => void;
export declare const MessageComposer: {
    encoded: {
        createValidator(value: MsgCreateValidator): {
            typeUrl: string;
            value: Uint8Array;
        };
        editValidator(value: MsgEditValidator): {
            typeUrl: string;
            value: Uint8Array;
        };
        delegate(value: MsgDelegate): {
            typeUrl: string;
            value: Uint8Array;
        };
        beginRedelegate(value: MsgBeginRedelegate): {
            typeUrl: string;
            value: Uint8Array;
        };
        undelegate(value: MsgUndelegate): {
            typeUrl: string;
            value: Uint8Array;
        };
    };
    withTypeUrl: {
        createValidator(value: MsgCreateValidator): {
            typeUrl: string;
            value: MsgCreateValidator;
        };
        editValidator(value: MsgEditValidator): {
            typeUrl: string;
            value: MsgEditValidator;
        };
        delegate(value: MsgDelegate): {
            typeUrl: string;
            value: MsgDelegate;
        };
        beginRedelegate(value: MsgBeginRedelegate): {
            typeUrl: string;
            value: MsgBeginRedelegate;
        };
        undelegate(value: MsgUndelegate): {
            typeUrl: string;
            value: MsgUndelegate;
        };
    };
    toJSON: {
        createValidator(value: MsgCreateValidator): {
            typeUrl: string;
            value: unknown;
        };
        editValidator(value: MsgEditValidator): {
            typeUrl: string;
            value: unknown;
        };
        delegate(value: MsgDelegate): {
            typeUrl: string;
            value: unknown;
        };
        beginRedelegate(value: MsgBeginRedelegate): {
            typeUrl: string;
            value: unknown;
        };
        undelegate(value: MsgUndelegate): {
            typeUrl: string;
            value: unknown;
        };
    };
    fromJSON: {
        createValidator(value: any): {
            typeUrl: string;
            value: MsgCreateValidator;
        };
        editValidator(value: any): {
            typeUrl: string;
            value: MsgEditValidator;
        };
        delegate(value: any): {
            typeUrl: string;
            value: MsgDelegate;
        };
        beginRedelegate(value: any): {
            typeUrl: string;
            value: MsgBeginRedelegate;
        };
        undelegate(value: any): {
            typeUrl: string;
            value: MsgUndelegate;
        };
    };
    fromPartial: {
        createValidator(value: MsgCreateValidator): {
            typeUrl: string;
            value: MsgCreateValidator;
        };
        editValidator(value: MsgEditValidator): {
            typeUrl: string;
            value: MsgEditValidator;
        };
        delegate(value: MsgDelegate): {
            typeUrl: string;
            value: MsgDelegate;
        };
        beginRedelegate(value: MsgBeginRedelegate): {
            typeUrl: string;
            value: MsgBeginRedelegate;
        };
        undelegate(value: MsgUndelegate): {
            typeUrl: string;
            value: MsgUndelegate;
        };
    };
};
