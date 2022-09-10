import { AminoMsg } from "@cosmjs/amino";
import { AminoHeight } from "@osmonauts/helpers";
import { MsgChannelOpenInit, MsgChannelOpenTry, MsgChannelOpenAck, MsgChannelOpenConfirm, MsgChannelCloseInit, MsgChannelCloseConfirm, MsgRecvPacket, MsgTimeout, MsgTimeoutOnClose, MsgAcknowledgement } from "./tx";
export interface AminoMsgChannelOpenInit extends AminoMsg {
    type: "cosmos-sdk/MsgChannelOpenInit";
    value: {
        port_id: string;
        channel: {
            state: number;
            ordering: number;
            counterparty: {
                port_id: string;
                channel_id: string;
            };
            connection_hops: string[];
            version: string;
        };
        signer: string;
    };
}
export interface AminoMsgChannelOpenTry extends AminoMsg {
    type: "cosmos-sdk/MsgChannelOpenTry";
    value: {
        port_id: string;
        previous_channel_id: string;
        channel: {
            state: number;
            ordering: number;
            counterparty: {
                port_id: string;
                channel_id: string;
            };
            connection_hops: string[];
            version: string;
        };
        counterparty_version: string;
        proof_init: Uint8Array;
        proof_height: AminoHeight;
        signer: string;
    };
}
export interface AminoMsgChannelOpenAck extends AminoMsg {
    type: "cosmos-sdk/MsgChannelOpenAck";
    value: {
        port_id: string;
        channel_id: string;
        counterparty_channel_id: string;
        counterparty_version: string;
        proof_try: Uint8Array;
        proof_height: AminoHeight;
        signer: string;
    };
}
export interface AminoMsgChannelOpenConfirm extends AminoMsg {
    type: "cosmos-sdk/MsgChannelOpenConfirm";
    value: {
        port_id: string;
        channel_id: string;
        proof_ack: Uint8Array;
        proof_height: AminoHeight;
        signer: string;
    };
}
export interface AminoMsgChannelCloseInit extends AminoMsg {
    type: "cosmos-sdk/MsgChannelCloseInit";
    value: {
        port_id: string;
        channel_id: string;
        signer: string;
    };
}
export interface AminoMsgChannelCloseConfirm extends AminoMsg {
    type: "cosmos-sdk/MsgChannelCloseConfirm";
    value: {
        port_id: string;
        channel_id: string;
        proof_init: Uint8Array;
        proof_height: AminoHeight;
        signer: string;
    };
}
export interface AminoMsgRecvPacket extends AminoMsg {
    type: "cosmos-sdk/MsgRecvPacket";
    value: {
        packet: {
            sequence: string;
            source_port: string;
            source_channel: string;
            destination_port: string;
            destination_channel: string;
            data: Uint8Array;
            timeout_height: AminoHeight;
            timeout_timestamp: string;
        };
        proof_commitment: Uint8Array;
        proof_height: AminoHeight;
        signer: string;
    };
}
export interface AminoMsgTimeout extends AminoMsg {
    type: "cosmos-sdk/MsgTimeout";
    value: {
        packet: {
            sequence: string;
            source_port: string;
            source_channel: string;
            destination_port: string;
            destination_channel: string;
            data: Uint8Array;
            timeout_height: AminoHeight;
            timeout_timestamp: string;
        };
        proof_unreceived: Uint8Array;
        proof_height: AminoHeight;
        next_sequence_recv: string;
        signer: string;
    };
}
export interface AminoMsgTimeoutOnClose extends AminoMsg {
    type: "cosmos-sdk/MsgTimeoutOnClose";
    value: {
        packet: {
            sequence: string;
            source_port: string;
            source_channel: string;
            destination_port: string;
            destination_channel: string;
            data: Uint8Array;
            timeout_height: AminoHeight;
            timeout_timestamp: string;
        };
        proof_unreceived: Uint8Array;
        proof_close: Uint8Array;
        proof_height: AminoHeight;
        next_sequence_recv: string;
        signer: string;
    };
}
export interface AminoMsgAcknowledgement extends AminoMsg {
    type: "cosmos-sdk/MsgAcknowledgement";
    value: {
        packet: {
            sequence: string;
            source_port: string;
            source_channel: string;
            destination_port: string;
            destination_channel: string;
            data: Uint8Array;
            timeout_height: AminoHeight;
            timeout_timestamp: string;
        };
        acknowledgement: Uint8Array;
        proof_acked: Uint8Array;
        proof_height: AminoHeight;
        signer: string;
    };
}
export declare const AminoConverter: {
    "/ibc.core.channel.v1.MsgChannelOpenInit": {
        aminoType: string;
        toAmino: ({ portId, channel, signer }: MsgChannelOpenInit) => AminoMsgChannelOpenInit["value"];
        fromAmino: ({ port_id, channel, signer }: AminoMsgChannelOpenInit["value"]) => MsgChannelOpenInit;
    };
    "/ibc.core.channel.v1.MsgChannelOpenTry": {
        aminoType: string;
        toAmino: ({ portId, previousChannelId, channel, counterpartyVersion, proofInit, proofHeight, signer }: MsgChannelOpenTry) => AminoMsgChannelOpenTry["value"];
        fromAmino: ({ port_id, previous_channel_id, channel, counterparty_version, proof_init, proof_height, signer }: AminoMsgChannelOpenTry["value"]) => MsgChannelOpenTry;
    };
    "/ibc.core.channel.v1.MsgChannelOpenAck": {
        aminoType: string;
        toAmino: ({ portId, channelId, counterpartyChannelId, counterpartyVersion, proofTry, proofHeight, signer }: MsgChannelOpenAck) => AminoMsgChannelOpenAck["value"];
        fromAmino: ({ port_id, channel_id, counterparty_channel_id, counterparty_version, proof_try, proof_height, signer }: AminoMsgChannelOpenAck["value"]) => MsgChannelOpenAck;
    };
    "/ibc.core.channel.v1.MsgChannelOpenConfirm": {
        aminoType: string;
        toAmino: ({ portId, channelId, proofAck, proofHeight, signer }: MsgChannelOpenConfirm) => AminoMsgChannelOpenConfirm["value"];
        fromAmino: ({ port_id, channel_id, proof_ack, proof_height, signer }: AminoMsgChannelOpenConfirm["value"]) => MsgChannelOpenConfirm;
    };
    "/ibc.core.channel.v1.MsgChannelCloseInit": {
        aminoType: string;
        toAmino: ({ portId, channelId, signer }: MsgChannelCloseInit) => AminoMsgChannelCloseInit["value"];
        fromAmino: ({ port_id, channel_id, signer }: AminoMsgChannelCloseInit["value"]) => MsgChannelCloseInit;
    };
    "/ibc.core.channel.v1.MsgChannelCloseConfirm": {
        aminoType: string;
        toAmino: ({ portId, channelId, proofInit, proofHeight, signer }: MsgChannelCloseConfirm) => AminoMsgChannelCloseConfirm["value"];
        fromAmino: ({ port_id, channel_id, proof_init, proof_height, signer }: AminoMsgChannelCloseConfirm["value"]) => MsgChannelCloseConfirm;
    };
    "/ibc.core.channel.v1.MsgRecvPacket": {
        aminoType: string;
        toAmino: ({ packet, proofCommitment, proofHeight, signer }: MsgRecvPacket) => AminoMsgRecvPacket["value"];
        fromAmino: ({ packet, proof_commitment, proof_height, signer }: AminoMsgRecvPacket["value"]) => MsgRecvPacket;
    };
    "/ibc.core.channel.v1.MsgTimeout": {
        aminoType: string;
        toAmino: ({ packet, proofUnreceived, proofHeight, nextSequenceRecv, signer }: MsgTimeout) => AminoMsgTimeout["value"];
        fromAmino: ({ packet, proof_unreceived, proof_height, next_sequence_recv, signer }: AminoMsgTimeout["value"]) => MsgTimeout;
    };
    "/ibc.core.channel.v1.MsgTimeoutOnClose": {
        aminoType: string;
        toAmino: ({ packet, proofUnreceived, proofClose, proofHeight, nextSequenceRecv, signer }: MsgTimeoutOnClose) => AminoMsgTimeoutOnClose["value"];
        fromAmino: ({ packet, proof_unreceived, proof_close, proof_height, next_sequence_recv, signer }: AminoMsgTimeoutOnClose["value"]) => MsgTimeoutOnClose;
    };
    "/ibc.core.channel.v1.MsgAcknowledgement": {
        aminoType: string;
        toAmino: ({ packet, acknowledgement, proofAcked, proofHeight, signer }: MsgAcknowledgement) => AminoMsgAcknowledgement["value"];
        fromAmino: ({ packet, acknowledgement, proof_acked, proof_height, signer }: AminoMsgAcknowledgement["value"]) => MsgAcknowledgement;
    };
};
