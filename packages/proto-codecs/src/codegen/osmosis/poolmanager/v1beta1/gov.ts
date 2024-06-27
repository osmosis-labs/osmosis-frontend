//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../../binary";
import {
  DenomPairTakerFee,
  DenomPairTakerFeeAmino,
  DenomPairTakerFeeSDKType,
} from "./tx";
/**
 * DenomPairTakerFeeProposal is a type for adding/removing a custom taker fee(s)
 * for one or more denom pairs.
 */
export interface DenomPairTakerFeeProposal {
  title: string;
  description: string;
  denomPairTakerFee: DenomPairTakerFee[];
}
export interface DenomPairTakerFeeProposalProtoMsg {
  typeUrl: "/osmosis.poolmanager.v1beta1.DenomPairTakerFeeProposal";
  value: Uint8Array;
}
/**
 * DenomPairTakerFeeProposal is a type for adding/removing a custom taker fee(s)
 * for one or more denom pairs.
 */
export interface DenomPairTakerFeeProposalAmino {
  title?: string;
  description?: string;
  denom_pair_taker_fee?: DenomPairTakerFeeAmino[];
}
export interface DenomPairTakerFeeProposalAminoMsg {
  type: "osmosis/poolmanager/denom-pair-taker-fee-proposal";
  value: DenomPairTakerFeeProposalAmino;
}
/**
 * DenomPairTakerFeeProposal is a type for adding/removing a custom taker fee(s)
 * for one or more denom pairs.
 */
export interface DenomPairTakerFeeProposalSDKType {
  title: string;
  description: string;
  denom_pair_taker_fee: DenomPairTakerFeeSDKType[];
}
function createBaseDenomPairTakerFeeProposal(): DenomPairTakerFeeProposal {
  return {
    title: "",
    description: "",
    denomPairTakerFee: [],
  };
}
export const DenomPairTakerFeeProposal = {
  typeUrl: "/osmosis.poolmanager.v1beta1.DenomPairTakerFeeProposal",
  encode(
    message: DenomPairTakerFeeProposal,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    for (const v of message.denomPairTakerFee) {
      DenomPairTakerFee.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): DenomPairTakerFeeProposal {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDenomPairTakerFeeProposal();
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
          message.denomPairTakerFee.push(
            DenomPairTakerFee.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<DenomPairTakerFeeProposal>
  ): DenomPairTakerFeeProposal {
    const message = createBaseDenomPairTakerFeeProposal();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.denomPairTakerFee =
      object.denomPairTakerFee?.map((e) => DenomPairTakerFee.fromPartial(e)) ||
      [];
    return message;
  },
  fromAmino(object: DenomPairTakerFeeProposalAmino): DenomPairTakerFeeProposal {
    const message = createBaseDenomPairTakerFeeProposal();
    if (object.title !== undefined && object.title !== null) {
      message.title = object.title;
    }
    if (object.description !== undefined && object.description !== null) {
      message.description = object.description;
    }
    message.denomPairTakerFee =
      object.denom_pair_taker_fee?.map((e) => DenomPairTakerFee.fromAmino(e)) ||
      [];
    return message;
  },
  toAmino(message: DenomPairTakerFeeProposal): DenomPairTakerFeeProposalAmino {
    const obj: any = {};
    obj.title = message.title === "" ? undefined : message.title;
    obj.description =
      message.description === "" ? undefined : message.description;
    if (message.denomPairTakerFee) {
      obj.denom_pair_taker_fee = message.denomPairTakerFee.map((e) =>
        e ? DenomPairTakerFee.toAmino(e) : undefined
      );
    } else {
      obj.denom_pair_taker_fee = message.denomPairTakerFee;
    }
    return obj;
  },
  fromAminoMsg(
    object: DenomPairTakerFeeProposalAminoMsg
  ): DenomPairTakerFeeProposal {
    return DenomPairTakerFeeProposal.fromAmino(object.value);
  },
  toAminoMsg(
    message: DenomPairTakerFeeProposal
  ): DenomPairTakerFeeProposalAminoMsg {
    return {
      type: "osmosis/poolmanager/denom-pair-taker-fee-proposal",
      value: DenomPairTakerFeeProposal.toAmino(message),
    };
  },
  fromProtoMsg(
    message: DenomPairTakerFeeProposalProtoMsg
  ): DenomPairTakerFeeProposal {
    return DenomPairTakerFeeProposal.decode(message.value);
  },
  toProto(message: DenomPairTakerFeeProposal): Uint8Array {
    return DenomPairTakerFeeProposal.encode(message).finish();
  },
  toProtoMsg(
    message: DenomPairTakerFeeProposal
  ): DenomPairTakerFeeProposalProtoMsg {
    return {
      typeUrl: "/osmosis.poolmanager.v1beta1.DenomPairTakerFeeProposal",
      value: DenomPairTakerFeeProposal.encode(message).finish(),
    };
  },
};
