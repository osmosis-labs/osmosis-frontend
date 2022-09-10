import { GeneratedType, Registry } from "@cosmjs/proto-signing";
import { MsgCreateGauge, MsgAddToGauge } from "./tx";
export declare const registry: ReadonlyArray<[string, GeneratedType]>;
export declare const load: (protoRegistry: Registry) => void;
export declare const MessageComposer: {
    encoded: {
        createGauge(value: MsgCreateGauge): {
            typeUrl: string;
            value: Uint8Array;
        };
        addToGauge(value: MsgAddToGauge): {
            typeUrl: string;
            value: Uint8Array;
        };
    };
    withTypeUrl: {
        createGauge(value: MsgCreateGauge): {
            typeUrl: string;
            value: MsgCreateGauge;
        };
        addToGauge(value: MsgAddToGauge): {
            typeUrl: string;
            value: MsgAddToGauge;
        };
    };
    toJSON: {
        createGauge(value: MsgCreateGauge): {
            typeUrl: string;
            value: unknown;
        };
        addToGauge(value: MsgAddToGauge): {
            typeUrl: string;
            value: unknown;
        };
    };
    fromJSON: {
        createGauge(value: any): {
            typeUrl: string;
            value: MsgCreateGauge;
        };
        addToGauge(value: any): {
            typeUrl: string;
            value: MsgAddToGauge;
        };
    };
    fromPartial: {
        createGauge(value: MsgCreateGauge): {
            typeUrl: string;
            value: MsgCreateGauge;
        };
        addToGauge(value: MsgAddToGauge): {
            typeUrl: string;
            value: MsgAddToGauge;
        };
    };
};
