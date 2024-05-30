//@ts-nocheck
import {
  MsgAddAuthenticator,
  MsgRemoveAuthenticator,
  MsgSetActiveState,
} from "./tx";
export const AminoConverter = {
  "/osmosis.smartaccount.v1beta1.MsgAddAuthenticator": {
    aminoType: "osmosis/smartaccount/add-authenticator",
    toAmino: MsgAddAuthenticator.toAmino,
    fromAmino: MsgAddAuthenticator.fromAmino,
  },
  "/osmosis.smartaccount.v1beta1.MsgRemoveAuthenticator": {
    aminoType: "osmosis/smartaccount/remove-authenticator",
    toAmino: MsgRemoveAuthenticator.toAmino,
    fromAmino: MsgRemoveAuthenticator.fromAmino,
  },
  "/osmosis.smartaccount.v1beta1.MsgSetActiveState": {
    aminoType: "osmosis/smartaccount/set-active-state",
    toAmino: MsgSetActiveState.toAmino,
    fromAmino: MsgSetActiveState.fromAmino,
  },
};
