import { AminoMsg } from "@cosmjs/amino";
import { AminoHeight } from "@osmonauts/helpers";
import { MsgConnectionOpenInit, MsgConnectionOpenTry, MsgConnectionOpenAck, MsgConnectionOpenConfirm } from "./tx";
export interface AminoMsgConnectionOpenInit extends AminoMsg {
    type: "cosmos-sdk/MsgConnectionOpenInit";
    value: {
        client_id: string;
        counterparty: {
            client_id: string;
            connection_id: string;
            prefix: {
                key_prefix: Uint8Array;
            };
        };
        version: {
            identifier: string;
            features: string[];
        };
        delay_period: string;
        signer: string;
    };
}
export interface AminoMsgConnectionOpenTry extends AminoMsg {
    type: "cosmos-sdk/MsgConnectionOpenTry";
    value: {
        client_id: string;
        previous_connection_id: string;
        client_state: {
            type_url: string;
            value: Uint8Array;
        };
        counterparty: {
            client_id: string;
            connection_id: string;
            prefix: {
                key_prefix: Uint8Array;
            };
        };
        delay_period: string;
        counterparty_versions: {
            identifier: string;
            features: string[];
        }[];
        proof_height: AminoHeight;
        proof_init: Uint8Array;
        proof_client: Uint8Array;
        proof_consensus: Uint8Array;
        consensus_height: AminoHeight;
        signer: string;
    };
}
export interface AminoMsgConnectionOpenAck extends AminoMsg {
    type: "cosmos-sdk/MsgConnectionOpenAck";
    value: {
        connection_id: string;
        counterparty_connection_id: string;
        version: {
            identifier: string;
            features: string[];
        };
        client_state: {
            type_url: string;
            value: Uint8Array;
        };
        proof_height: AminoHeight;
        proof_try: Uint8Array;
        proof_client: Uint8Array;
        proof_consensus: Uint8Array;
        consensus_height: AminoHeight;
        signer: string;
    };
}
export interface AminoMsgConnectionOpenConfirm extends AminoMsg {
    type: "cosmos-sdk/MsgConnectionOpenConfirm";
    value: {
        connection_id: string;
        proof_ack: Uint8Array;
        proof_height: AminoHeight;
        signer: string;
    };
}
export declare const AminoConverter: {
    "/ibc.core.connection.v1.MsgConnectionOpenInit": {
        aminoType: string;
        toAmino: ({ clientId, counterparty, version, delayPeriod, signer }: MsgConnectionOpenInit) => AminoMsgConnectionOpenInit["value"];
        fromAmino: ({ client_id, counterparty, version, delay_period, signer }: AminoMsgConnectionOpenInit["value"]) => MsgConnectionOpenInit;
    };
    "/ibc.core.connection.v1.MsgConnectionOpenTry": {
        aminoType: string;
        toAmino: ({ clientId, previousConnectionId, clientState, counterparty, delayPeriod, counterpartyVersions, proofHeight, proofInit, proofClient, proofConsensus, consensusHeight, signer }: MsgConnectionOpenTry) => AminoMsgConnectionOpenTry["value"];
        fromAmino: ({ client_id, previous_connection_id, client_state, counterparty, delay_period, counterparty_versions, proof_height, proof_init, proof_client, proof_consensus, consensus_height, signer }: AminoMsgConnectionOpenTry["value"]) => MsgConnectionOpenTry;
    };
    "/ibc.core.connection.v1.MsgConnectionOpenAck": {
        aminoType: string;
        toAmino: ({ connectionId, counterpartyConnectionId, version, clientState, proofHeight, proofTry, proofClient, proofConsensus, consensusHeight, signer }: MsgConnectionOpenAck) => AminoMsgConnectionOpenAck["value"];
        fromAmino: ({ connection_id, counterparty_connection_id, version, client_state, proof_height, proof_try, proof_client, proof_consensus, consensus_height, signer }: AminoMsgConnectionOpenAck["value"]) => MsgConnectionOpenAck;
    };
    "/ibc.core.connection.v1.MsgConnectionOpenConfirm": {
        aminoType: string;
        toAmino: ({ connectionId, proofAck, proofHeight, signer }: MsgConnectionOpenConfirm) => AminoMsgConnectionOpenConfirm["value"];
        fromAmino: ({ connection_id, proof_ack, proof_height, signer }: AminoMsgConnectionOpenConfirm["value"]) => MsgConnectionOpenConfirm;
    };
};
