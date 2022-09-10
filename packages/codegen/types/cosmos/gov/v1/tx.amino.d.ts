import { AminoMsg } from "@cosmjs/amino";
import { MsgSubmitProposal, MsgExecLegacyContent, MsgVote, MsgVoteWeighted, MsgDeposit } from "./tx";
export interface AminoMsgSubmitProposal extends AminoMsg {
    type: "cosmos-sdk/MsgSubmitProposal";
    value: {
        messages: {
            type_url: string;
            value: Uint8Array;
        }[];
        initial_deposit: {
            denom: string;
            amount: string;
        }[];
        proposer: string;
        metadata: string;
    };
}
export interface AminoMsgExecLegacyContent extends AminoMsg {
    type: "cosmos-sdk/MsgExecLegacyContent";
    value: {
        content: {
            type_url: string;
            value: Uint8Array;
        };
        authority: string;
    };
}
export interface AminoMsgVote extends AminoMsg {
    type: "cosmos-sdk/MsgVote";
    value: {
        proposal_id: string;
        voter: string;
        option: number;
        metadata: string;
    };
}
export interface AminoMsgVoteWeighted extends AminoMsg {
    type: "cosmos-sdk/MsgVoteWeighted";
    value: {
        proposal_id: string;
        voter: string;
        options: {
            option: number;
            weight: string;
        }[];
        metadata: string;
    };
}
export interface AminoMsgDeposit extends AminoMsg {
    type: "cosmos-sdk/MsgDeposit";
    value: {
        proposal_id: string;
        depositor: string;
        amount: {
            denom: string;
            amount: string;
        }[];
    };
}
export declare const AminoConverter: {
    "/cosmos.gov.v1.MsgSubmitProposal": {
        aminoType: string;
        toAmino: ({ messages, initialDeposit, proposer, metadata }: MsgSubmitProposal) => AminoMsgSubmitProposal["value"];
        fromAmino: ({ messages, initial_deposit, proposer, metadata }: AminoMsgSubmitProposal["value"]) => MsgSubmitProposal;
    };
    "/cosmos.gov.v1.MsgExecLegacyContent": {
        aminoType: string;
        toAmino: ({ content, authority }: MsgExecLegacyContent) => AminoMsgExecLegacyContent["value"];
        fromAmino: ({ content, authority }: AminoMsgExecLegacyContent["value"]) => MsgExecLegacyContent;
    };
    "/cosmos.gov.v1.MsgVote": {
        aminoType: string;
        toAmino: ({ proposalId, voter, option, metadata }: MsgVote) => AminoMsgVote["value"];
        fromAmino: ({ proposal_id, voter, option, metadata }: AminoMsgVote["value"]) => MsgVote;
    };
    "/cosmos.gov.v1.MsgVoteWeighted": {
        aminoType: string;
        toAmino: ({ proposalId, voter, options, metadata }: MsgVoteWeighted) => AminoMsgVoteWeighted["value"];
        fromAmino: ({ proposal_id, voter, options, metadata }: AminoMsgVoteWeighted["value"]) => MsgVoteWeighted;
    };
    "/cosmos.gov.v1.MsgDeposit": {
        aminoType: string;
        toAmino: ({ proposalId, depositor, amount }: MsgDeposit) => AminoMsgDeposit["value"];
        fromAmino: ({ proposal_id, depositor, amount }: AminoMsgDeposit["value"]) => MsgDeposit;
    };
};
