import { Grant } from "./authz";
import { Any } from "../../../google/protobuf/any";
import { AminoMsg } from "@cosmjs/amino";
import { Timestamp } from "../../../google/protobuf/timestamp";
import { MsgGrant, MsgExec, MsgRevoke } from "./tx";
export interface AminoMsgGrant extends AminoMsg {
  type: "cosmos-sdk/MsgGrant";
  value: {
    granter: string;
    grantee: string;
    grant: {
      authorization: {
        type_url: string;
        value: Uint8Array;
      };
      expiration: {
        seconds: string;
        nanos: number;
      };
    };
  };
}
export interface AminoMsgExec extends AminoMsg {
  type: "cosmos-sdk/MsgExec";
  value: {
    grantee: string;
    msgs: {
      type_url: string;
      value: Uint8Array;
    }[];
  };
}
export interface AminoMsgRevoke extends AminoMsg {
  type: "cosmos-sdk/MsgRevoke";
  value: {
    granter: string;
    grantee: string;
    msg_type_url: string;
  };
}
export const AminoConverter = {
  "/cosmos.authz.v1beta1.MsgGrant": {
    aminoType: "cosmos-sdk/MsgGrant",
    toAmino: ({
      granter,
      grantee,
      grant
    }: MsgGrant): AminoMsgGrant["value"] => {
      return {
        granter,
        grantee,
        grant: {
          authorization: {
            type_url: grant.authorization.typeUrl,
            value: grant.authorization.value
          },
          expiration: grant.expiration
        }
      };
    },
    fromAmino: ({
      granter,
      grantee,
      grant
    }: AminoMsgGrant["value"]): MsgGrant => {
      return {
        granter,
        grantee,
        grant: {
          authorization: {
            typeUrl: grant.authorization.type_url,
            value: grant.authorization.value
          },
          expiration: grant.expiration
        }
      };
    }
  },
  "/cosmos.authz.v1beta1.MsgExec": {
    aminoType: "cosmos-sdk/MsgExec",
    toAmino: ({
      grantee,
      msgs
    }: MsgExec): AminoMsgExec["value"] => {
      return {
        grantee,
        msgs: msgs.map(el0 => ({
          type_url: el0.typeUrl,
          value: el0.value
        }))
      };
    },
    fromAmino: ({
      grantee,
      msgs
    }: AminoMsgExec["value"]): MsgExec => {
      return {
        grantee,
        msgs: msgs.map(el0 => ({
          typeUrl: el0.type_url,
          value: el0.value
        }))
      };
    }
  },
  "/cosmos.authz.v1beta1.MsgRevoke": {
    aminoType: "cosmos-sdk/MsgRevoke",
    toAmino: ({
      granter,
      grantee,
      msgTypeUrl
    }: MsgRevoke): AminoMsgRevoke["value"] => {
      return {
        granter,
        grantee,
        msg_type_url: msgTypeUrl
      };
    },
    fromAmino: ({
      granter,
      grantee,
      msg_type_url
    }: AminoMsgRevoke["value"]): MsgRevoke => {
      return {
        granter,
        grantee,
        msgTypeUrl: msg_type_url
      };
    }
  }
};