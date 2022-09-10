import { GeneratedType, Registry } from "@cosmjs/proto-signing";
import { MsgCreateBalancerPool } from "./tx";
export declare const registry: ReadonlyArray<[string, GeneratedType]>;
export declare const load: (protoRegistry: Registry) => void;
export declare const MessageComposer: {
    encoded: {
        createBalancerPool(value: MsgCreateBalancerPool): {
            typeUrl: string;
            value: Uint8Array;
        };
    };
    withTypeUrl: {
        createBalancerPool(value: MsgCreateBalancerPool): {
            typeUrl: string;
            value: MsgCreateBalancerPool;
        };
    };
    toJSON: {
        createBalancerPool(value: MsgCreateBalancerPool): {
            typeUrl: string;
            value: unknown;
        };
    };
    fromJSON: {
        createBalancerPool(value: any): {
            typeUrl: string;
            value: MsgCreateBalancerPool;
        };
    };
    fromPartial: {
        createBalancerPool(value: MsgCreateBalancerPool): {
            typeUrl: string;
            value: MsgCreateBalancerPool;
        };
    };
};
