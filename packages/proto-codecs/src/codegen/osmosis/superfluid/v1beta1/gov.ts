//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../../binary";
import {
  SuperfluidAsset,
  SuperfluidAssetAmino,
  SuperfluidAssetSDKType,
} from "../superfluid";
/**
 * SetSuperfluidAssetsProposal is a gov Content type to update the superfluid
 * assets
 */
export interface SetSuperfluidAssetsProposal {
  $typeUrl?: "/osmosis.superfluid.v1beta1.SetSuperfluidAssetsProposal";
  title: string;
  description: string;
  assets: SuperfluidAsset[];
}
export interface SetSuperfluidAssetsProposalProtoMsg {
  typeUrl: "/osmosis.superfluid.v1beta1.SetSuperfluidAssetsProposal";
  value: Uint8Array;
}
/**
 * SetSuperfluidAssetsProposal is a gov Content type to update the superfluid
 * assets
 */
export interface SetSuperfluidAssetsProposalAmino {
  title?: string;
  description?: string;
  assets?: SuperfluidAssetAmino[];
}
export interface SetSuperfluidAssetsProposalAminoMsg {
  type: "osmosis/set-superfluid-assets-proposal";
  value: SetSuperfluidAssetsProposalAmino;
}
/**
 * SetSuperfluidAssetsProposal is a gov Content type to update the superfluid
 * assets
 */
export interface SetSuperfluidAssetsProposalSDKType {
  $typeUrl?: "/osmosis.superfluid.v1beta1.SetSuperfluidAssetsProposal";
  title: string;
  description: string;
  assets: SuperfluidAssetSDKType[];
}
/**
 * RemoveSuperfluidAssetsProposal is a gov Content type to remove the superfluid
 * assets by denom
 */
export interface RemoveSuperfluidAssetsProposal {
  $typeUrl?: "/osmosis.superfluid.v1beta1.RemoveSuperfluidAssetsProposal";
  title: string;
  description: string;
  superfluidAssetDenoms: string[];
}
export interface RemoveSuperfluidAssetsProposalProtoMsg {
  typeUrl: "/osmosis.superfluid.v1beta1.RemoveSuperfluidAssetsProposal";
  value: Uint8Array;
}
/**
 * RemoveSuperfluidAssetsProposal is a gov Content type to remove the superfluid
 * assets by denom
 */
export interface RemoveSuperfluidAssetsProposalAmino {
  title?: string;
  description?: string;
  superfluid_asset_denoms?: string[];
}
export interface RemoveSuperfluidAssetsProposalAminoMsg {
  type: "osmosis/del-superfluid-assets-proposal";
  value: RemoveSuperfluidAssetsProposalAmino;
}
/**
 * RemoveSuperfluidAssetsProposal is a gov Content type to remove the superfluid
 * assets by denom
 */
export interface RemoveSuperfluidAssetsProposalSDKType {
  $typeUrl?: "/osmosis.superfluid.v1beta1.RemoveSuperfluidAssetsProposal";
  title: string;
  description: string;
  superfluid_asset_denoms: string[];
}
/**
 * UpdateUnpoolWhiteListProposal is a gov Content type to update the
 * allowed list of pool ids.
 */
export interface UpdateUnpoolWhiteListProposal {
  $typeUrl?: "/osmosis.superfluid.v1beta1.UpdateUnpoolWhiteListProposal";
  title: string;
  description: string;
  ids: bigint[];
  isOverwrite: boolean;
}
export interface UpdateUnpoolWhiteListProposalProtoMsg {
  typeUrl: "/osmosis.superfluid.v1beta1.UpdateUnpoolWhiteListProposal";
  value: Uint8Array;
}
/**
 * UpdateUnpoolWhiteListProposal is a gov Content type to update the
 * allowed list of pool ids.
 */
export interface UpdateUnpoolWhiteListProposalAmino {
  title?: string;
  description?: string;
  ids?: string[];
  is_overwrite?: boolean;
}
export interface UpdateUnpoolWhiteListProposalAminoMsg {
  type: "osmosis/update-unpool-whitelist";
  value: UpdateUnpoolWhiteListProposalAmino;
}
/**
 * UpdateUnpoolWhiteListProposal is a gov Content type to update the
 * allowed list of pool ids.
 */
export interface UpdateUnpoolWhiteListProposalSDKType {
  $typeUrl?: "/osmosis.superfluid.v1beta1.UpdateUnpoolWhiteListProposal";
  title: string;
  description: string;
  ids: bigint[];
  is_overwrite: boolean;
}
function createBaseSetSuperfluidAssetsProposal(): SetSuperfluidAssetsProposal {
  return {
    $typeUrl: "/osmosis.superfluid.v1beta1.SetSuperfluidAssetsProposal",
    title: "",
    description: "",
    assets: [],
  };
}
export const SetSuperfluidAssetsProposal = {
  typeUrl: "/osmosis.superfluid.v1beta1.SetSuperfluidAssetsProposal",
  encode(
    message: SetSuperfluidAssetsProposal,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    for (const v of message.assets) {
      SuperfluidAsset.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): SetSuperfluidAssetsProposal {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSetSuperfluidAssetsProposal();
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
          message.assets.push(SuperfluidAsset.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<SetSuperfluidAssetsProposal>
  ): SetSuperfluidAssetsProposal {
    const message = createBaseSetSuperfluidAssetsProposal();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.assets =
      object.assets?.map((e) => SuperfluidAsset.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: SetSuperfluidAssetsProposalAmino
  ): SetSuperfluidAssetsProposal {
    const message = createBaseSetSuperfluidAssetsProposal();
    if (object.title !== undefined && object.title !== null) {
      message.title = object.title;
    }
    if (object.description !== undefined && object.description !== null) {
      message.description = object.description;
    }
    message.assets =
      object.assets?.map((e) => SuperfluidAsset.fromAmino(e)) || [];
    return message;
  },
  toAmino(
    message: SetSuperfluidAssetsProposal
  ): SetSuperfluidAssetsProposalAmino {
    const obj: any = {};
    obj.title = message.title === "" ? undefined : message.title;
    obj.description =
      message.description === "" ? undefined : message.description;
    if (message.assets) {
      obj.assets = message.assets.map((e) =>
        e ? SuperfluidAsset.toAmino(e) : undefined
      );
    } else {
      obj.assets = message.assets;
    }
    return obj;
  },
  fromAminoMsg(
    object: SetSuperfluidAssetsProposalAminoMsg
  ): SetSuperfluidAssetsProposal {
    return SetSuperfluidAssetsProposal.fromAmino(object.value);
  },
  toAminoMsg(
    message: SetSuperfluidAssetsProposal
  ): SetSuperfluidAssetsProposalAminoMsg {
    return {
      type: "osmosis/set-superfluid-assets-proposal",
      value: SetSuperfluidAssetsProposal.toAmino(message),
    };
  },
  fromProtoMsg(
    message: SetSuperfluidAssetsProposalProtoMsg
  ): SetSuperfluidAssetsProposal {
    return SetSuperfluidAssetsProposal.decode(message.value);
  },
  toProto(message: SetSuperfluidAssetsProposal): Uint8Array {
    return SetSuperfluidAssetsProposal.encode(message).finish();
  },
  toProtoMsg(
    message: SetSuperfluidAssetsProposal
  ): SetSuperfluidAssetsProposalProtoMsg {
    return {
      typeUrl: "/osmosis.superfluid.v1beta1.SetSuperfluidAssetsProposal",
      value: SetSuperfluidAssetsProposal.encode(message).finish(),
    };
  },
};
function createBaseRemoveSuperfluidAssetsProposal(): RemoveSuperfluidAssetsProposal {
  return {
    $typeUrl: "/osmosis.superfluid.v1beta1.RemoveSuperfluidAssetsProposal",
    title: "",
    description: "",
    superfluidAssetDenoms: [],
  };
}
export const RemoveSuperfluidAssetsProposal = {
  typeUrl: "/osmosis.superfluid.v1beta1.RemoveSuperfluidAssetsProposal",
  encode(
    message: RemoveSuperfluidAssetsProposal,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    for (const v of message.superfluidAssetDenoms) {
      writer.uint32(26).string(v!);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): RemoveSuperfluidAssetsProposal {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRemoveSuperfluidAssetsProposal();
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
          message.superfluidAssetDenoms.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<RemoveSuperfluidAssetsProposal>
  ): RemoveSuperfluidAssetsProposal {
    const message = createBaseRemoveSuperfluidAssetsProposal();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.superfluidAssetDenoms =
      object.superfluidAssetDenoms?.map((e) => e) || [];
    return message;
  },
  fromAmino(
    object: RemoveSuperfluidAssetsProposalAmino
  ): RemoveSuperfluidAssetsProposal {
    const message = createBaseRemoveSuperfluidAssetsProposal();
    if (object.title !== undefined && object.title !== null) {
      message.title = object.title;
    }
    if (object.description !== undefined && object.description !== null) {
      message.description = object.description;
    }
    message.superfluidAssetDenoms =
      object.superfluid_asset_denoms?.map((e) => e) || [];
    return message;
  },
  toAmino(
    message: RemoveSuperfluidAssetsProposal
  ): RemoveSuperfluidAssetsProposalAmino {
    const obj: any = {};
    obj.title = message.title === "" ? undefined : message.title;
    obj.description =
      message.description === "" ? undefined : message.description;
    if (message.superfluidAssetDenoms) {
      obj.superfluid_asset_denoms = message.superfluidAssetDenoms.map((e) => e);
    } else {
      obj.superfluid_asset_denoms = message.superfluidAssetDenoms;
    }
    return obj;
  },
  fromAminoMsg(
    object: RemoveSuperfluidAssetsProposalAminoMsg
  ): RemoveSuperfluidAssetsProposal {
    return RemoveSuperfluidAssetsProposal.fromAmino(object.value);
  },
  toAminoMsg(
    message: RemoveSuperfluidAssetsProposal
  ): RemoveSuperfluidAssetsProposalAminoMsg {
    return {
      type: "osmosis/del-superfluid-assets-proposal",
      value: RemoveSuperfluidAssetsProposal.toAmino(message),
    };
  },
  fromProtoMsg(
    message: RemoveSuperfluidAssetsProposalProtoMsg
  ): RemoveSuperfluidAssetsProposal {
    return RemoveSuperfluidAssetsProposal.decode(message.value);
  },
  toProto(message: RemoveSuperfluidAssetsProposal): Uint8Array {
    return RemoveSuperfluidAssetsProposal.encode(message).finish();
  },
  toProtoMsg(
    message: RemoveSuperfluidAssetsProposal
  ): RemoveSuperfluidAssetsProposalProtoMsg {
    return {
      typeUrl: "/osmosis.superfluid.v1beta1.RemoveSuperfluidAssetsProposal",
      value: RemoveSuperfluidAssetsProposal.encode(message).finish(),
    };
  },
};
function createBaseUpdateUnpoolWhiteListProposal(): UpdateUnpoolWhiteListProposal {
  return {
    $typeUrl: "/osmosis.superfluid.v1beta1.UpdateUnpoolWhiteListProposal",
    title: "",
    description: "",
    ids: [],
    isOverwrite: false,
  };
}
export const UpdateUnpoolWhiteListProposal = {
  typeUrl: "/osmosis.superfluid.v1beta1.UpdateUnpoolWhiteListProposal",
  encode(
    message: UpdateUnpoolWhiteListProposal,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    writer.uint32(26).fork();
    for (const v of message.ids) {
      writer.uint64(v);
    }
    writer.ldelim();
    if (message.isOverwrite === true) {
      writer.uint32(32).bool(message.isOverwrite);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): UpdateUnpoolWhiteListProposal {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUpdateUnpoolWhiteListProposal();
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
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.ids.push(reader.uint64());
            }
          } else {
            message.ids.push(reader.uint64());
          }
          break;
        case 4:
          message.isOverwrite = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<UpdateUnpoolWhiteListProposal>
  ): UpdateUnpoolWhiteListProposal {
    const message = createBaseUpdateUnpoolWhiteListProposal();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.ids = object.ids?.map((e) => BigInt(e.toString())) || [];
    message.isOverwrite = object.isOverwrite ?? false;
    return message;
  },
  fromAmino(
    object: UpdateUnpoolWhiteListProposalAmino
  ): UpdateUnpoolWhiteListProposal {
    const message = createBaseUpdateUnpoolWhiteListProposal();
    if (object.title !== undefined && object.title !== null) {
      message.title = object.title;
    }
    if (object.description !== undefined && object.description !== null) {
      message.description = object.description;
    }
    message.ids = object.ids?.map((e) => BigInt(e)) || [];
    if (object.is_overwrite !== undefined && object.is_overwrite !== null) {
      message.isOverwrite = object.is_overwrite;
    }
    return message;
  },
  toAmino(
    message: UpdateUnpoolWhiteListProposal
  ): UpdateUnpoolWhiteListProposalAmino {
    const obj: any = {};
    obj.title = message.title === "" ? undefined : message.title;
    obj.description =
      message.description === "" ? undefined : message.description;
    if (message.ids) {
      obj.ids = message.ids.map((e) => e.toString());
    } else {
      obj.ids = message.ids;
    }
    obj.is_overwrite =
      message.isOverwrite === false ? undefined : message.isOverwrite;
    return obj;
  },
  fromAminoMsg(
    object: UpdateUnpoolWhiteListProposalAminoMsg
  ): UpdateUnpoolWhiteListProposal {
    return UpdateUnpoolWhiteListProposal.fromAmino(object.value);
  },
  toAminoMsg(
    message: UpdateUnpoolWhiteListProposal
  ): UpdateUnpoolWhiteListProposalAminoMsg {
    return {
      type: "osmosis/update-unpool-whitelist",
      value: UpdateUnpoolWhiteListProposal.toAmino(message),
    };
  },
  fromProtoMsg(
    message: UpdateUnpoolWhiteListProposalProtoMsg
  ): UpdateUnpoolWhiteListProposal {
    return UpdateUnpoolWhiteListProposal.decode(message.value);
  },
  toProto(message: UpdateUnpoolWhiteListProposal): Uint8Array {
    return UpdateUnpoolWhiteListProposal.encode(message).finish();
  },
  toProtoMsg(
    message: UpdateUnpoolWhiteListProposal
  ): UpdateUnpoolWhiteListProposalProtoMsg {
    return {
      typeUrl: "/osmosis.superfluid.v1beta1.UpdateUnpoolWhiteListProposal",
      value: UpdateUnpoolWhiteListProposal.encode(message).finish(),
    };
  },
};
