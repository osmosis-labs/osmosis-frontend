import { GeneratedType, Registry } from "@cosmjs/proto-signing";
import { MsgChannelOpenInit, MsgChannelOpenTry, MsgChannelOpenAck, MsgChannelOpenConfirm, MsgChannelCloseInit, MsgChannelCloseConfirm, MsgRecvPacket, MsgTimeout, MsgTimeoutOnClose, MsgAcknowledgement } from "./tx";
export declare const registry: ReadonlyArray<[string, GeneratedType]>;
export declare const load: (protoRegistry: Registry) => void;
export declare const MessageComposer: {
    encoded: {
        channelOpenInit(value: MsgChannelOpenInit): {
            typeUrl: string;
            value: Uint8Array;
        };
        channelOpenTry(value: MsgChannelOpenTry): {
            typeUrl: string;
            value: Uint8Array;
        };
        channelOpenAck(value: MsgChannelOpenAck): {
            typeUrl: string;
            value: Uint8Array;
        };
        channelOpenConfirm(value: MsgChannelOpenConfirm): {
            typeUrl: string;
            value: Uint8Array;
        };
        channelCloseInit(value: MsgChannelCloseInit): {
            typeUrl: string;
            value: Uint8Array;
        };
        channelCloseConfirm(value: MsgChannelCloseConfirm): {
            typeUrl: string;
            value: Uint8Array;
        };
        recvPacket(value: MsgRecvPacket): {
            typeUrl: string;
            value: Uint8Array;
        };
        timeout(value: MsgTimeout): {
            typeUrl: string;
            value: Uint8Array;
        };
        timeoutOnClose(value: MsgTimeoutOnClose): {
            typeUrl: string;
            value: Uint8Array;
        };
        acknowledgement(value: MsgAcknowledgement): {
            typeUrl: string;
            value: Uint8Array;
        };
    };
    withTypeUrl: {
        channelOpenInit(value: MsgChannelOpenInit): {
            typeUrl: string;
            value: MsgChannelOpenInit;
        };
        channelOpenTry(value: MsgChannelOpenTry): {
            typeUrl: string;
            value: MsgChannelOpenTry;
        };
        channelOpenAck(value: MsgChannelOpenAck): {
            typeUrl: string;
            value: MsgChannelOpenAck;
        };
        channelOpenConfirm(value: MsgChannelOpenConfirm): {
            typeUrl: string;
            value: MsgChannelOpenConfirm;
        };
        channelCloseInit(value: MsgChannelCloseInit): {
            typeUrl: string;
            value: MsgChannelCloseInit;
        };
        channelCloseConfirm(value: MsgChannelCloseConfirm): {
            typeUrl: string;
            value: MsgChannelCloseConfirm;
        };
        recvPacket(value: MsgRecvPacket): {
            typeUrl: string;
            value: MsgRecvPacket;
        };
        timeout(value: MsgTimeout): {
            typeUrl: string;
            value: MsgTimeout;
        };
        timeoutOnClose(value: MsgTimeoutOnClose): {
            typeUrl: string;
            value: MsgTimeoutOnClose;
        };
        acknowledgement(value: MsgAcknowledgement): {
            typeUrl: string;
            value: MsgAcknowledgement;
        };
    };
    toJSON: {
        channelOpenInit(value: MsgChannelOpenInit): {
            typeUrl: string;
            value: unknown;
        };
        channelOpenTry(value: MsgChannelOpenTry): {
            typeUrl: string;
            value: unknown;
        };
        channelOpenAck(value: MsgChannelOpenAck): {
            typeUrl: string;
            value: unknown;
        };
        channelOpenConfirm(value: MsgChannelOpenConfirm): {
            typeUrl: string;
            value: unknown;
        };
        channelCloseInit(value: MsgChannelCloseInit): {
            typeUrl: string;
            value: unknown;
        };
        channelCloseConfirm(value: MsgChannelCloseConfirm): {
            typeUrl: string;
            value: unknown;
        };
        recvPacket(value: MsgRecvPacket): {
            typeUrl: string;
            value: unknown;
        };
        timeout(value: MsgTimeout): {
            typeUrl: string;
            value: unknown;
        };
        timeoutOnClose(value: MsgTimeoutOnClose): {
            typeUrl: string;
            value: unknown;
        };
        acknowledgement(value: MsgAcknowledgement): {
            typeUrl: string;
            value: unknown;
        };
    };
    fromJSON: {
        channelOpenInit(value: any): {
            typeUrl: string;
            value: MsgChannelOpenInit;
        };
        channelOpenTry(value: any): {
            typeUrl: string;
            value: MsgChannelOpenTry;
        };
        channelOpenAck(value: any): {
            typeUrl: string;
            value: MsgChannelOpenAck;
        };
        channelOpenConfirm(value: any): {
            typeUrl: string;
            value: MsgChannelOpenConfirm;
        };
        channelCloseInit(value: any): {
            typeUrl: string;
            value: MsgChannelCloseInit;
        };
        channelCloseConfirm(value: any): {
            typeUrl: string;
            value: MsgChannelCloseConfirm;
        };
        recvPacket(value: any): {
            typeUrl: string;
            value: MsgRecvPacket;
        };
        timeout(value: any): {
            typeUrl: string;
            value: MsgTimeout;
        };
        timeoutOnClose(value: any): {
            typeUrl: string;
            value: MsgTimeoutOnClose;
        };
        acknowledgement(value: any): {
            typeUrl: string;
            value: MsgAcknowledgement;
        };
    };
    fromPartial: {
        channelOpenInit(value: MsgChannelOpenInit): {
            typeUrl: string;
            value: MsgChannelOpenInit;
        };
        channelOpenTry(value: MsgChannelOpenTry): {
            typeUrl: string;
            value: MsgChannelOpenTry;
        };
        channelOpenAck(value: MsgChannelOpenAck): {
            typeUrl: string;
            value: MsgChannelOpenAck;
        };
        channelOpenConfirm(value: MsgChannelOpenConfirm): {
            typeUrl: string;
            value: MsgChannelOpenConfirm;
        };
        channelCloseInit(value: MsgChannelCloseInit): {
            typeUrl: string;
            value: MsgChannelCloseInit;
        };
        channelCloseConfirm(value: MsgChannelCloseConfirm): {
            typeUrl: string;
            value: MsgChannelCloseConfirm;
        };
        recvPacket(value: MsgRecvPacket): {
            typeUrl: string;
            value: MsgRecvPacket;
        };
        timeout(value: MsgTimeout): {
            typeUrl: string;
            value: MsgTimeout;
        };
        timeoutOnClose(value: MsgTimeoutOnClose): {
            typeUrl: string;
            value: MsgTimeoutOnClose;
        };
        acknowledgement(value: MsgAcknowledgement): {
            typeUrl: string;
            value: MsgAcknowledgement;
        };
    };
};
