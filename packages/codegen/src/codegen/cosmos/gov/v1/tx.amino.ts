import { Any } from "../../../google/protobuf/any";
import { Coin } from "../../base/v1beta1/coin";
import { VoteOption, WeightedVoteOption, voteOptionFromJSON } from "./gov";
import { AminoMsg } from "@cosmjs/amino";
import { Long } from "@osmonauts/helpers";
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
export const AminoConverter = {
  "/cosmos.gov.v1.MsgSubmitProposal": {
    aminoType: "cosmos-sdk/MsgSubmitProposal",
    toAmino: ({
      messages,
      initialDeposit,
      proposer,
      metadata
    }: MsgSubmitProposal): AminoMsgSubmitProposal["value"] => {
      return {
        messages: messages.map(el0 => ({
          type_url: el0.typeUrl,
          value: el0.value
        })),
        initial_deposit: initialDeposit.map(el0 => ({
          denom: el0.denom,
          amount: el0.amount
        })),
        proposer,
        metadata
      };
    },
    fromAmino: ({
      messages,
      initial_deposit,
      proposer,
      metadata
    }: AminoMsgSubmitProposal["value"]): MsgSubmitProposal => {
      return {
        messages: messages.map(el0 => ({
          typeUrl: el0.type_url,
          value: el0.value
        })),
        initialDeposit: initial_deposit.map(el0 => ({
          denom: el0.denom,
          amount: el0.amount
        })),
        proposer,
        metadata
      };
    }
  },
  "/cosmos.gov.v1.MsgExecLegacyContent": {
    aminoType: "cosmos-sdk/MsgExecLegacyContent",
    toAmino: ({
      content,
      authority
    }: MsgExecLegacyContent): AminoMsgExecLegacyContent["value"] => {
      return {
        content: {
          type_url: content.typeUrl,
          value: content.value
        },
        authority
      };
    },
    fromAmino: ({
      content,
      authority
    }: AminoMsgExecLegacyContent["value"]): MsgExecLegacyContent => {
      return {
        content: {
          typeUrl: content.type_url,
          value: content.value
        },
        authority
      };
    }
  },
  "/cosmos.gov.v1.MsgVote": {
    aminoType: "cosmos-sdk/MsgVote",
    toAmino: ({
      proposalId,
      voter,
      option,
      metadata
    }: MsgVote): AminoMsgVote["value"] => {
      return {
        proposal_id: proposalId.toString(),
        voter,
        option,
        metadata
      };
    },
    fromAmino: ({
      proposal_id,
      voter,
      option,
      metadata
    }: AminoMsgVote["value"]): MsgVote => {
      return {
        proposalId: Long.fromString(proposal_id),
        voter,
        option: voteOptionFromJSON(option),
        metadata
      };
    }
  },
  "/cosmos.gov.v1.MsgVoteWeighted": {
    aminoType: "cosmos-sdk/MsgVoteWeighted",
    toAmino: ({
      proposalId,
      voter,
      options,
      metadata
    }: MsgVoteWeighted): AminoMsgVoteWeighted["value"] => {
      return {
        proposal_id: proposalId.toString(),
        voter,
        options: options.map(el0 => ({
          option: el0.option,
          weight: el0.weight
        })),
        metadata
      };
    },
    fromAmino: ({
      proposal_id,
      voter,
      options,
      metadata
    }: AminoMsgVoteWeighted["value"]): MsgVoteWeighted => {
      return {
        proposalId: Long.fromString(proposal_id),
        voter,
        options: options.map(el0 => ({
          option: voteOptionFromJSON(el0.option),
          weight: el0.weight
        })),
        metadata
      };
    }
  },
  "/cosmos.gov.v1.MsgDeposit": {
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