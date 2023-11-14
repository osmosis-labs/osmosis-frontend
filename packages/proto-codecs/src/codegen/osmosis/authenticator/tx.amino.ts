//@ts-nocheck
import { MsgAddAuthenticator, MsgRemoveAuthenticator } from "./tx";
export const AminoConverter = {
  "/osmosis.authenticator.MsgAddAuthenticator": {
    aminoType: "osmosis/authenticator/add-authenticator",
    toAmino: MsgAddAuthenticator.toAmino,
    fromAmino: MsgAddAuthenticator.fromAmino,
  },
  "/osmosis.authenticator.MsgRemoveAuthenticator": {
    aminoType: "osmosis/authenticator/remove-authenticator",
    toAmino: MsgRemoveAuthenticator.toAmino,
    fromAmino: MsgRemoveAuthenticator.fromAmino,
  },
};
