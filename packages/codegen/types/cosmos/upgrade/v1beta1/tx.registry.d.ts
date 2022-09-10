import { GeneratedType, Registry } from "@cosmjs/proto-signing";
import { MsgSoftwareUpgrade, MsgCancelUpgrade } from "./tx";
export declare const registry: ReadonlyArray<[string, GeneratedType]>;
export declare const load: (protoRegistry: Registry) => void;
export declare const MessageComposer: {
    encoded: {
        softwareUpgrade(value: MsgSoftwareUpgrade): {
            typeUrl: string;
            value: Uint8Array;
        };
        cancelUpgrade(value: MsgCancelUpgrade): {
            typeUrl: string;
            value: Uint8Array;
        };
    };
    withTypeUrl: {
        softwareUpgrade(value: MsgSoftwareUpgrade): {
            typeUrl: string;
            value: MsgSoftwareUpgrade;
        };
        cancelUpgrade(value: MsgCancelUpgrade): {
            typeUrl: string;
            value: MsgCancelUpgrade;
        };
    };
    toJSON: {
        softwareUpgrade(value: MsgSoftwareUpgrade): {
            typeUrl: string;
            value: unknown;
        };
        cancelUpgrade(value: MsgCancelUpgrade): {
            typeUrl: string;
            value: unknown;
        };
    };
    fromJSON: {
        softwareUpgrade(value: any): {
            typeUrl: string;
            value: MsgSoftwareUpgrade;
        };
        cancelUpgrade(value: any): {
            typeUrl: string;
            value: MsgCancelUpgrade;
        };
    };
    fromPartial: {
        softwareUpgrade(value: MsgSoftwareUpgrade): {
            typeUrl: string;
            value: MsgSoftwareUpgrade;
        };
        cancelUpgrade(value: MsgCancelUpgrade): {
            typeUrl: string;
            value: MsgCancelUpgrade;
        };
    };
};
