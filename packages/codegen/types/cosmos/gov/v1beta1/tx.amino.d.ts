import { AminoMsg } from "@cosmjs/amino";
import { MsgSubmitProposal, MsgVote, MsgVoteWeighted, MsgDeposit } from "./tx";
export interface AminoMsgSubmitProposal extends AminoMsg {
    type: "cosmos-sdk/MsgSubmitProposal";
    value: {
        content: {
            type_url: string;
            value: Uint8Array;
        };
        initial_deposit: {
            denom: string;
            amount: string;
        }[];
        proposer: string;
    };
}
export interface AminoMsgVote extends AminoMsg {
    type: "cosmos-sdk/MsgVote";
    value: {
        proposal_id: string;
        voter: string;
        option: number;
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
    "/cosmos.gov.v1beta1.MsgSubmitProposal": {
        aminoType: string;
        toAmino: ({ content, initialDeposit, proposer }: MsgSubmitProposal) => AminoMsgSubmitProposal["value"];
        fromAmino: ({ content, initial_deposit, proposer }: AminoMsgSubmitProposal["value"]) => MsgSubmitProposal;
    };
    "/cosmos.gov.v1beta1.MsgVote": {
        aminoType: string;
        toAmino: ({ proposalId, voter, option }: MsgVote) => AminoMsgVote["value"];
        fromAmino: ({ proposal_id, voter, option }: AminoMsgVote["value"]) => MsgVote;
    };
    "/cosmos.gov.v1beta1.MsgVoteWeighted": {
        aminoType: string;
        toAmino: ({ proposalId, voter, options }: MsgVoteWeighted) => AminoMsgVoteWeighted["value"];
        fromAmino: ({ proposal_id, voter, options }: AminoMsgVoteWeighted["value"]) => MsgVoteWeighted;
    };
    "/cosmos.gov.v1beta1.MsgDeposit": {
        aminoType: string;
        toAmino: ({ proposalId, depositor, amount }: MsgDeposit) => AminoMsgDeposit["value"];
        fromAmino: ({ proposal_id, depositor, amount }: AminoMsgDeposit["value"]) => MsgDeposit;
    };
};
