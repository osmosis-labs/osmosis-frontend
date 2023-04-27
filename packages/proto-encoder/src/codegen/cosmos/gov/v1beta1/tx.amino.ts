//@ts-nocheck
/* eslint-disable */
import { MsgSubmitProposal, MsgVote, MsgVoteWeighted, MsgDeposit } from "./tx";
export const AminoConverter = {
  "/cosmos.gov.v1beta1.MsgSubmitProposal": {
    aminoType: "cosmos-sdk/v1/MsgSubmitProposal",
    toAmino: MsgSubmitProposal.toAmino,
    fromAmino: MsgSubmitProposal.fromAmino,
  },
  "/cosmos.gov.v1beta1.MsgVote": {
    aminoType: "cosmos-sdk/v1/MsgVote",
    toAmino: MsgVote.toAmino,
    fromAmino: MsgVote.fromAmino,
  },
  "/cosmos.gov.v1beta1.MsgVoteWeighted": {
    aminoType: "cosmos-sdk/v1/MsgVoteWeighted",
    toAmino: MsgVoteWeighted.toAmino,
    fromAmino: MsgVoteWeighted.fromAmino,
  },
  "/cosmos.gov.v1beta1.MsgDeposit": {
    aminoType: "cosmos-sdk/v1/MsgDeposit",
    toAmino: MsgDeposit.toAmino,
    fromAmino: MsgDeposit.fromAmino,
  },
};
