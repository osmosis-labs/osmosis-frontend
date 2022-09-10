import { Any } from "../../../google/protobuf/any";
import { Coin } from "../../base/v1beta1/coin";
import { VoteOption, WeightedVoteOption, voteOptionFromJSON } from "./gov";
import { AminoMsg } from "@cosmjs/amino";
import { Long } from "@osmonauts/helpers";
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
export const AminoConverter = {
  "/cosmos.gov.v1beta1.MsgSubmitProposal": {
    aminoType: "cosmos-sdk/MsgSubmitProposal",
    toAmino: ({
      content,
      initialDeposit,
      proposer
    }: MsgSubmitProposal): AminoMsgSubmitProposal["value"] => {
      return {
        content: {
          type_url: content.typeUrl,
          value: content.value
        },
        initial_deposit: initialDeposit.map(el0 => ({
          denom: el0.denom,
          amount: el0.amount
        })),
        proposer
      };
    },
    fromAmino: ({
      content,
      initial_deposit,
      proposer
    }: AminoMsgSubmitProposal["value"]): MsgSubmitProposal => {
      return {
        content: {
          typeUrl: content.type_url,
          value: content.value
        },
        initialDeposit: initial_deposit.map(el0 => ({
          denom: el0.denom,
          amount: el0.amount
        })),
        proposer
      };
    }
  },
  "/cosmos.gov.v1beta1.MsgVote": {
    aminoType: "cosmos-sdk/MsgVote",
    toAmino: ({
      proposalId,
      voter,
      option
    }: MsgVote): AminoMsgVote["value"] => {
      return {
        proposal_id: proposalId.toString(),
        voter,
        option
      };
    },
    fromAmino: ({
      proposal_id,
      voter,
      option
    }: AminoMsgVote["value"]): MsgVote => {
      return {
        proposalId: Long.fromString(proposal_id),
        voter,
        option: voteOptionFromJSON(option)
      };
    }
  },
  "/cosmos.gov.v1beta1.MsgVoteWeighted": {
    aminoType: "cosmos-sdk/MsgVoteWeighted",
    toAmino: ({
      proposalId,
      voter,
      options
    }: MsgVoteWeighted): AminoMsgVoteWeighted["value"] => {
      return {
        proposal_id: proposalId.toString(),
        voter,
        options: options.map(el0 => ({
          option: el0.option,
          weight: el0.weight
        }))
      };
    },
    fromAmino: ({
      proposal_id,
      voter,
      options
    }: AminoMsgVoteWeighted["value"]): MsgVoteWeighted => {
      return {
        proposalId: Long.fromString(proposal_id),
        voter,
        options: options.map(el0 => ({
          option: voteOptionFromJSON(el0.option),
          weight: el0.weight
        }))
      };
    }
  },
  "/cosmos.gov.v1beta1.MsgDeposit": {
    aminoType: "cosmos-sdk/MsgDeposit",
    toAmino: ({
      proposalId,
      depositor,
      amount
    }: MsgDeposit): AminoMsgDeposit["value"] => {
      return {
        proposal_id: proposalId.toString(),
        depositor,
        amount: amount.map(el0 => ({
          denom: el0.denom,
          amount: el0.amount
        }))
      };
    },
    fromAmino: ({
      proposal_id,
      depositor,
      amount
    }: AminoMsgDeposit["value"]): MsgDeposit => {
      return {
        proposalId: Long.fromString(proposal_id),
        depositor,
        amount: amount.map(el0 => ({
          denom: el0.denom,
          amount: el0.amount
        }))
      };
    }
  }
};