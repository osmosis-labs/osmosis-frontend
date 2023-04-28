import { FeeToken, FeeTokenAmino, FeeTokenSDKType } from "./feetoken";
import * as _m0 from "protobufjs/minimal";
/**
 * UpdateFeeTokenProposal is a gov Content type for adding a new whitelisted fee
 * token. It must specify a denom along with gamm pool ID to use as a spot price
 * calculator. It can be used to add a new denom to the whitelist It can also be
 * used to update the Pool to associate with the denom. If Pool ID is set to 0,
 * it will remove the denom from the whitelisted set.
 */
export interface UpdateFeeTokenProposal {
  $typeUrl?: string;
  title: string;
  description: string;
  feetoken?: FeeToken;
}
export interface UpdateFeeTokenProposalProtoMsg {
  typeUrl: "/osmosis.txfees.v1beta1.UpdateFeeTokenProposal";
  value: Uint8Array;
}
/**
 * UpdateFeeTokenProposal is a gov Content type for adding a new whitelisted fee
 * token. It must specify a denom along with gamm pool ID to use as a spot price
 * calculator. It can be used to add a new denom to the whitelist It can also be
 * used to update the Pool to associate with the denom. If Pool ID is set to 0,
 * it will remove the denom from the whitelisted set.
 */
export interface UpdateFeeTokenProposalAmino {
  title: string;
  description: string;
  feetoken?: FeeTokenAmino;
}
export interface UpdateFeeTokenProposalAminoMsg {
  type: "osmosis/UpdateFeeTokenProposal";
  value: UpdateFeeTokenProposalAmino;
}
/**
 * UpdateFeeTokenProposal is a gov Content type for adding a new whitelisted fee
 * token. It must specify a denom along with gamm pool ID to use as a spot price
 * calculator. It can be used to add a new denom to the whitelist It can also be
 * used to update the Pool to associate with the denom. If Pool ID is set to 0,
 * it will remove the denom from the whitelisted set.
 */
export interface UpdateFeeTokenProposalSDKType {
  $typeUrl?: string;
  title: string;
  description: string;
  feetoken?: FeeTokenSDKType;
}
function createBaseUpdateFeeTokenProposal(): UpdateFeeTokenProposal {
  return {
    $typeUrl: "/osmosis.txfees.v1beta1.UpdateFeeTokenProposal",
    title: "",
    description: "",
    feetoken: undefined,
  };
}
export const UpdateFeeTokenProposal = {
  typeUrl: "/osmosis.txfees.v1beta1.UpdateFeeTokenProposal",
  encode(
    message: UpdateFeeTokenProposal,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    if (message.feetoken !== undefined) {
      FeeToken.encode(message.feetoken, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): UpdateFeeTokenProposal {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateFeeTokenProposal();
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
          message.feetoken = FeeToken.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<UpdateFeeTokenProposal>): UpdateFeeTokenProposal {
    const message = createBaseUpdateFeeTokenProposal();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.feetoken =
      object.feetoken !== undefined && object.feetoken !== null
        ? FeeToken.fromPartial(object.feetoken)
        : undefined;
    return message;
  },
  fromAmino(object: UpdateFeeTokenProposalAmino): UpdateFeeTokenProposal {
    return {
      title: object.title,
      description: object.description,
      feetoken: object?.feetoken
        ? FeeToken.fromAmino(object.feetoken)
        : undefined,
    };
  },
  toAmino(message: UpdateFeeTokenProposal): UpdateFeeTokenProposalAmino {
    const obj: any = {};
    obj.title = message.title;
    obj.description = message.description;
    obj.feetoken = message.feetoken
      ? FeeToken.toAmino(message.feetoken)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: UpdateFeeTokenProposalAminoMsg): UpdateFeeTokenProposal {
    return UpdateFeeTokenProposal.fromAmino(object.value);
  },
  toAminoMsg(message: UpdateFeeTokenProposal): UpdateFeeTokenProposalAminoMsg {
    return {
      type: "osmosis/UpdateFeeTokenProposal",
      value: UpdateFeeTokenProposal.toAmino(message),
    };
  },
  fromProtoMsg(
    message: UpdateFeeTokenProposalProtoMsg
  ): UpdateFeeTokenProposal {
    return UpdateFeeTokenProposal.decode(message.value);
  },
  toProto(message: UpdateFeeTokenProposal): Uint8Array {
    return UpdateFeeTokenProposal.encode(message).finish();
  },
  toProtoMsg(message: UpdateFeeTokenProposal): UpdateFeeTokenProposalProtoMsg {
    return {
      typeUrl: "/osmosis.txfees.v1beta1.UpdateFeeTokenProposal",
      value: UpdateFeeTokenProposal.encode(message).finish(),
    };
  },
};
