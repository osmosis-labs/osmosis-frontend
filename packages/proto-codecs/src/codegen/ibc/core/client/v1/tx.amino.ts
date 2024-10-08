//@ts-nocheck
import {
  MsgCreateClient,
  MsgIBCSoftwareUpgrade,
  MsgRecoverClient,
  MsgSubmitMisbehaviour,
  MsgUpdateClient,
  MsgUpdateParams,
  MsgUpgradeClient,
} from "./tx";
export const AminoConverter = {
  "/ibc.core.client.v1.MsgCreateClient": {
    aminoType: "cosmos-sdk/MsgCreateClient",
    toAmino: MsgCreateClient.toAmino,
    fromAmino: MsgCreateClient.fromAmino,
  },
  "/ibc.core.client.v1.MsgUpdateClient": {
    aminoType: "cosmos-sdk/MsgUpdateClient",
    toAmino: MsgUpdateClient.toAmino,
    fromAmino: MsgUpdateClient.fromAmino,
  },
  "/ibc.core.client.v1.MsgUpgradeClient": {
    aminoType: "cosmos-sdk/MsgUpgradeClient",
    toAmino: MsgUpgradeClient.toAmino,
    fromAmino: MsgUpgradeClient.fromAmino,
  },
  "/ibc.core.client.v1.MsgSubmitMisbehaviour": {
    aminoType: "cosmos-sdk/MsgSubmitMisbehaviour",
    toAmino: MsgSubmitMisbehaviour.toAmino,
    fromAmino: MsgSubmitMisbehaviour.fromAmino,
  },
  "/ibc.core.client.v1.MsgRecoverClient": {
    aminoType: "cosmos-sdk/MsgRecoverClient",
    toAmino: MsgRecoverClient.toAmino,
    fromAmino: MsgRecoverClient.fromAmino,
  },
  "/ibc.core.client.v1.MsgIBCSoftwareUpgrade": {
    aminoType: "cosmos-sdk/MsgIBCSoftwareUpgrade",
    toAmino: MsgIBCSoftwareUpgrade.toAmino,
    fromAmino: MsgIBCSoftwareUpgrade.fromAmino,
  },
  "/ibc.core.client.v1.MsgUpdateParams": {
    aminoType: "cosmos-sdk/MsgUpdateParams",
    toAmino: MsgUpdateParams.toAmino,
    fromAmino: MsgUpdateParams.fromAmino,
  },
};
