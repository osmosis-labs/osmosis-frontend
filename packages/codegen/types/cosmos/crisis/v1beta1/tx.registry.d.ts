import { GeneratedType, Registry } from "@cosmjs/proto-signing";
import { MsgVerifyInvariant } from "./tx";
export declare const registry: ReadonlyArray<[string, GeneratedType]>;
export declare const load: (protoRegistry: Registry) => void;
export declare const MessageComposer: {
    encoded: {
        verifyInvariant(value: MsgVerifyInvariant): {
            typeUrl: string;
            value: Uint8Array;
        };
    };
    withTypeUrl: {
        verifyInvariant(value: MsgVerifyInvariant): {
            typeUrl: string;
            value: MsgVerifyInvariant;
        };
    };
    toJSON: {
        verifyInvariant(value: MsgVerifyInvariant): {
            typeUrl: string;
            value: unknown;
        };
    };
    fromJSON: {
        verifyInvariant(value: any): {
            typeUrl: string;
            value: MsgVerifyInvariant;
        };
    };
    fromPartial: {
        verifyInvariant(value: MsgVerifyInvariant): {
            typeUrl: string;
            value: MsgVerifyInvariant;
        };
    };
};
