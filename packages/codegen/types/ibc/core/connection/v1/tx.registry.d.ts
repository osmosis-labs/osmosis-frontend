import { GeneratedType, Registry } from "@cosmjs/proto-signing";
import { MsgConnectionOpenInit, MsgConnectionOpenTry, MsgConnectionOpenAck, MsgConnectionOpenConfirm } from "./tx";
export declare const registry: ReadonlyArray<[string, GeneratedType]>;
export declare const load: (protoRegistry: Registry) => void;
export declare const MessageComposer: {
    encoded: {
        connectionOpenInit(value: MsgConnectionOpenInit): {
            typeUrl: string;
            value: Uint8Array;
        };
        connectionOpenTry(value: MsgConnectionOpenTry): {
            typeUrl: string;
            value: Uint8Array;
        };
        connectionOpenAck(value: MsgConnectionOpenAck): {
            typeUrl: string;
            value: Uint8Array;
        };
        connectionOpenConfirm(value: MsgConnectionOpenConfirm): {
            typeUrl: string;
            value: Uint8Array;
        };
    };
    withTypeUrl: {
        connectionOpenInit(value: MsgConnectionOpenInit): {
            typeUrl: string;
            value: MsgConnectionOpenInit;
        };
        connectionOpenTry(value: MsgConnectionOpenTry): {
            typeUrl: string;
            value: MsgConnectionOpenTry;
        };
        connectionOpenAck(value: MsgConnectionOpenAck): {
            typeUrl: string;
            value: MsgConnectionOpenAck;
        };
        connectionOpenConfirm(value: MsgConnectionOpenConfirm): {
            typeUrl: string;
            value: MsgConnectionOpenConfirm;
        };
    };
    toJSON: {
        connectionOpenInit(value: MsgConnectionOpenInit): {
            typeUrl: string;
            value: unknown;
        };
        connectionOpenTry(value: MsgConnectionOpenTry): {
            typeUrl: string;
            value: unknown;
        };
        connectionOpenAck(value: MsgConnectionOpenAck): {
            typeUrl: string;
            value: unknown;
        };
        connectionOpenConfirm(value: MsgConnectionOpenConfirm): {
            typeUrl: string;
            value: unknown;
        };
    };
    fromJSON: {
        connectionOpenInit(value: any): {
            typeUrl: string;
            value: MsgConnectionOpenInit;
        };
        connectionOpenTry(value: any): {
            typeUrl: string;
            value: MsgConnectionOpenTry;
        };
        connectionOpenAck(value: any): {
            typeUrl: string;
            value: MsgConnectionOpenAck;
        };
        connectionOpenConfirm(value: any): {
            typeUrl: string;
            value: MsgConnectionOpenConfirm;
        };
    };
    fromPartial: {
        connectionOpenInit(value: MsgConnectionOpenInit): {
            typeUrl: string;
            value: MsgConnectionOpenInit;
        };
        connectionOpenTry(value: MsgConnectionOpenTry): {
            typeUrl: string;
            value: MsgConnectionOpenTry;
        };
        connectionOpenAck(value: MsgConnectionOpenAck): {
            typeUrl: string;
            value: MsgConnectionOpenAck;
        };
        connectionOpenConfirm(value: MsgConnectionOpenConfirm): {
            typeUrl: string;
            value: MsgConnectionOpenConfirm;
        };
    };
};
