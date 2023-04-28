import * as _m0 from "protobufjs/minimal";
/**
 * SetProtoRevEnabledProposal is a gov Content type to update whether the
 * protorev module is enabled
 */
export interface SetProtoRevEnabledProposal {
  $typeUrl?: string;
  title: string;
  description: string;
  enabled: boolean;
}
export interface SetProtoRevEnabledProposalProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.SetProtoRevEnabledProposal";
  value: Uint8Array;
}
/**
 * SetProtoRevEnabledProposal is a gov Content type to update whether the
 * protorev module is enabled
 */
export interface SetProtoRevEnabledProposalAmino {
  title: string;
  description: string;
  enabled: boolean;
}
export interface SetProtoRevEnabledProposalAminoMsg {
  type: "osmosis/protorev/set-proto-rev-enabled-proposal";
  value: SetProtoRevEnabledProposalAmino;
}
/**
 * SetProtoRevEnabledProposal is a gov Content type to update whether the
 * protorev module is enabled
 */
export interface SetProtoRevEnabledProposalSDKType {
  $typeUrl?: string;
  title: string;
  description: string;
  enabled: boolean;
}
/**
 * SetProtoRevAdminAccountProposal is a gov Content type to set the admin
 * account that will receive permissions to alter hot routes and set the
 * developer address that will be receiving a share of profits from the module
 */
export interface SetProtoRevAdminAccountProposal {
  $typeUrl?: string;
  title: string;
  description: string;
  account: string;
}
export interface SetProtoRevAdminAccountProposalProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.SetProtoRevAdminAccountProposal";
  value: Uint8Array;
}
/**
 * SetProtoRevAdminAccountProposal is a gov Content type to set the admin
 * account that will receive permissions to alter hot routes and set the
 * developer address that will be receiving a share of profits from the module
 */
export interface SetProtoRevAdminAccountProposalAmino {
  title: string;
  description: string;
  account: string;
}
export interface SetProtoRevAdminAccountProposalAminoMsg {
  type: "osmosis/protorev/set-proto-rev-admin-account-proposal";
  value: SetProtoRevAdminAccountProposalAmino;
}
/**
 * SetProtoRevAdminAccountProposal is a gov Content type to set the admin
 * account that will receive permissions to alter hot routes and set the
 * developer address that will be receiving a share of profits from the module
 */
export interface SetProtoRevAdminAccountProposalSDKType {
  $typeUrl?: string;
  title: string;
  description: string;
  account: string;
}
function createBaseSetProtoRevEnabledProposal(): SetProtoRevEnabledProposal {
  return {
    $typeUrl: "/osmosis.protorev.v1beta1.SetProtoRevEnabledProposal",
    title: "",
    description: "",
    enabled: false,
  };
}
export const SetProtoRevEnabledProposal = {
  typeUrl: "/osmosis.protorev.v1beta1.SetProtoRevEnabledProposal",
  encode(
    message: SetProtoRevEnabledProposal,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    if (message.enabled === true) {
      writer.uint32(24).bool(message.enabled);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): SetProtoRevEnabledProposal {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSetProtoRevEnabledProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.title = reader.string();
          break;
        case 2:
          message.description = reader.string();
          break;
        case 3:
          message.enabled = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<SetProtoRevEnabledProposal>
  ): SetProtoRevEnabledProposal {
    const message = createBaseSetProtoRevEnabledProposal();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.enabled = object.enabled ?? false;
    return message;
  },
  fromAmino(
    object: SetProtoRevEnabledProposalAmino
  ): SetProtoRevEnabledProposal {
    return {
      title: object.title,
      description: object.description,
      enabled: object.enabled,
    };
  },
  toAmino(
    message: SetProtoRevEnabledProposal
  ): SetProtoRevEnabledProposalAmino {
    const obj: any = {};
    obj.title = message.title;
    obj.description = message.description;
    obj.enabled = message.enabled;
    return obj;
  },
  fromAminoMsg(
    object: SetProtoRevEnabledProposalAminoMsg
  ): SetProtoRevEnabledProposal {
    return SetProtoRevEnabledProposal.fromAmino(object.value);
  },
  toAminoMsg(
    message: SetProtoRevEnabledProposal
  ): SetProtoRevEnabledProposalAminoMsg {
    return {
      type: "osmosis/protorev/set-proto-rev-enabled-proposal",
      value: SetProtoRevEnabledProposal.toAmino(message),
    };
  },
  fromProtoMsg(
    message: SetProtoRevEnabledProposalProtoMsg
  ): SetProtoRevEnabledProposal {
    return SetProtoRevEnabledProposal.decode(message.value);
  },
  toProto(message: SetProtoRevEnabledProposal): Uint8Array {
    return SetProtoRevEnabledProposal.encode(message).finish();
  },
  toProtoMsg(
    message: SetProtoRevEnabledProposal
  ): SetProtoRevEnabledProposalProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.SetProtoRevEnabledProposal",
      value: SetProtoRevEnabledProposal.encode(message).finish(),
    };
  },
};
function createBaseSetProtoRevAdminAccountProposal(): SetProtoRevAdminAccountProposal {
  return {
    $typeUrl: "/osmosis.protorev.v1beta1.SetProtoRevAdminAccountProposal",
    title: "",
    description: "",
    account: "",
  };
}
export const SetProtoRevAdminAccountProposal = {
  typeUrl: "/osmosis.protorev.v1beta1.SetProtoRevAdminAccountProposal",
  encode(
    message: SetProtoRevAdminAccountProposal,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    if (message.account !== "") {
      writer.uint32(26).string(message.account);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): SetProtoRevAdminAccountProposal {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSetProtoRevAdminAccountProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.title = reader.string();
          break;
        case 2:
          message.description = reader.string();
          break;
        case 3:
          message.account = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<SetProtoRevAdminAccountProposal>
  ): SetProtoRevAdminAccountProposal {
    const message = createBaseSetProtoRevAdminAccountProposal();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.account = object.account ?? "";
    return message;
  },
  fromAmino(
    object: SetProtoRevAdminAccountProposalAmino
  ): SetProtoRevAdminAccountProposal {
    return {
      title: object.title,
      description: object.description,
      account: object.account,
    };
  },
  toAmino(
    message: SetProtoRevAdminAccountProposal
  ): SetProtoRevAdminAccountProposalAmino {
    const obj: any = {};
    obj.title = message.title;
    obj.description = message.description;
    obj.account = message.account;
    return obj;
  },
  fromAminoMsg(
    object: SetProtoRevAdminAccountProposalAminoMsg
  ): SetProtoRevAdminAccountProposal {
    return SetProtoRevAdminAccountProposal.fromAmino(object.value);
  },
  toAminoMsg(
    message: SetProtoRevAdminAccountProposal
  ): SetProtoRevAdminAccountProposalAminoMsg {
    return {
      type: "osmosis/protorev/set-proto-rev-admin-account-proposal",
      value: SetProtoRevAdminAccountProposal.toAmino(message),
    };
  },
  fromProtoMsg(
    message: SetProtoRevAdminAccountProposalProtoMsg
  ): SetProtoRevAdminAccountProposal {
    return SetProtoRevAdminAccountProposal.decode(message.value);
  },
  toProto(message: SetProtoRevAdminAccountProposal): Uint8Array {
    return SetProtoRevAdminAccountProposal.encode(message).finish();
  },
  toProtoMsg(
    message: SetProtoRevAdminAccountProposal
  ): SetProtoRevAdminAccountProposalProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.SetProtoRevAdminAccountProposal",
      value: SetProtoRevAdminAccountProposal.encode(message).finish(),
    };
  },
};
