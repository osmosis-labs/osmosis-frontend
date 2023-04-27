//@ts-nocheck
/* eslint-disable */
import { MsgRegisterInterchainAccount, MsgSendTx } from "./tx";
export const AminoConverter = {
  "/ibc.applications.interchain_accounts.controller.v1.MsgRegisterInterchainAccount":
    {
      aminoType: "cosmos-sdk/MsgRegisterInterchainAccount",
      toAmino: MsgRegisterInterchainAccount.toAmino,
      fromAmino: MsgRegisterInterchainAccount.fromAmino,
    },
  "/ibc.applications.interchain_accounts.controller.v1.MsgSendTx": {
    aminoType: "cosmos-sdk/MsgSendTx",
    toAmino: MsgSendTx.toAmino,
    fromAmino: MsgSendTx.fromAmino,
  },
};
