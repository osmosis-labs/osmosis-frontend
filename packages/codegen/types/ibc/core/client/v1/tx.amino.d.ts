import { AminoMsg } from "@cosmjs/amino";
import { MsgCreateClient, MsgUpdateClient, MsgUpgradeClient, MsgSubmitMisbehaviour } from "./tx";
export interface AminoMsgCreateClient extends AminoMsg {
    type: "cosmos-sdk/MsgCreateClient";
    value: {
        client_state: {
            type_url: string;
            value: Uint8Array;
        };
        consensus_state: {
            type_url: string;
            value: Uint8Array;
        };
        signer: string;
    };
}
export interface AminoMsgUpdateClient extends AminoMsg {
    type: "cosmos-sdk/MsgUpdateClient";
    value: {
        client_id: string;
        header: {
            type_url: string;
            value: Uint8Array;
        };
        signer: string;
    };
}
export interface AminoMsgUpgradeClient extends AminoMsg {
    type: "cosmos-sdk/MsgUpgradeClient";
    value: {
        client_id: string;
        client_state: {
            type_url: string;
            value: Uint8Array;
        };
        consensus_state: {
            type_url: string;
            value: Uint8Array;
        };
        proof_upgrade_client: Uint8Array;
        proof_upgrade_consensus_state: Uint8Array;
        signer: string;
    };
}
export interface AminoMsgSubmitMisbehaviour extends AminoMsg {
    type: "cosmos-sdk/MsgSubmitMisbehaviour";
    value: {
        client_id: string;
        misbehaviour: {
            type_url: string;
            value: Uint8Array;
        };
        signer: string;
    };
}
export declare const AminoConverter: {
    "/ibc.core.client.v1.MsgCreateClient": {
        aminoType: string;
        toAmino: ({ clientState, consensusState, signer }: MsgCreateClient) => AminoMsgCreateClient["value"];
        fromAmino: ({ client_state, consensus_state, signer }: AminoMsgCreateClient["value"]) => MsgCreateClient;
    };
    "/ibc.core.client.v1.MsgUpdateClient": {
        aminoType: string;
        toAmino: ({ clientId, header, signer }: MsgUpdateClient) => AminoMsgUpdateClient["value"];
        fromAmino: ({ client_id, header, signer }: AminoMsgUpdateClient["value"]) => MsgUpdateClient;
    };
    "/ibc.core.client.v1.MsgUpgradeClient": {
        aminoType: string;
        toAmino: ({ clientId, clientState, consensusState, proofUpgradeClient, proofUpgradeConsensusState, signer }: MsgUpgradeClient) => AminoMsgUpgradeClient["value"];
        fromAmino: ({ client_id, client_state, consensus_state, proof_upgrade_client, proof_upgrade_consensus_state, signer }: AminoMsgUpgradeClient["value"]) => MsgUpgradeClient;
    };
    "/ibc.core.client.v1.MsgSubmitMisbehaviour": {
        aminoType: string;
        toAmino: ({ clientId, misbehaviour, signer }: MsgSubmitMisbehaviour) => AminoMsgSubmitMisbehaviour["value"];
        fromAmino: ({ client_id, misbehaviour, signer }: AminoMsgSubmitMisbehaviour["value"]) => MsgSubmitMisbehaviour;
    };
};
