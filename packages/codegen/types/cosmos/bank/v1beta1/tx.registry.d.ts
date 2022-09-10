import { GeneratedType, Registry } from "@cosmjs/proto-signing";
import { MsgSend, MsgMultiSend } from "./tx";
export declare const registry: ReadonlyArray<[string, GeneratedType]>;
export declare const load: (protoRegistry: Registry) => void;
export declare const MessageComposer: {
    encoded: {
        send(value: MsgSend): {
            typeUrl: string;
            value: Uint8Array;
        };
        multiSend(value: MsgMultiSend): {
            typeUrl: string;
            value: Uint8Array;
        };
    };
    withTypeUrl: {
        send(value: MsgSend): {
            typeUrl: string;
            value: MsgSend;
        };
        multiSend(value: MsgMultiSend): {
            typeUrl: string;
            value: MsgMultiSend;
        };
    };
    toJSON: {
        send(value: MsgSend): {
            typeUrl: string;
            value: unknown;
        };
        multiSend(value: MsgMultiSend): {
            typeUrl: string;
            value: unknown;
        };
    };
    fromJSON: {
        send(value: any): {
            typeUrl: string;
            value: MsgSend;
        };
        multiSend(value: any): {
            typeUrl: string;
            value: MsgMultiSend;
        };
    };
    fromPartial: {
        send(value: MsgSend): {
            typeUrl: string;
            value: MsgSend;
        };
        multiSend(value: MsgMultiSend): {
            typeUrl: string;
            value: MsgMultiSend;
        };
    };
};
