//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../../binary";
import {
  Coin,
  CoinAmino,
  CoinSDKType,
} from "../../../cosmos/base/v1beta1/coin";
import {
  Metadata,
  MetadataAmino,
  MetadataSDKType,
} from "../../../cosmos/bank/v1beta1/bank";

// MsgCreateDenom

export interface MsgCreateDenom {
  sender: string;
  subdenom: string;
}
export interface MsgCreateDenomProtoMsg {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgCreateDenom";
  value: Uint8Array;
}
export interface MsgCreateDenomAmino {
  sender?: string;
  subdenom?: string;
}
export interface MsgCreateDenomSDKType {
  sender: string;
  subdenom: string;
}
export interface MsgCreateDenomResponse {
  newTokenDenom: string;
}

function createBaseMsgCreateDenom(): MsgCreateDenom {
  return { sender: "", subdenom: "" };
}

export const MsgCreateDenom = {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgCreateDenom",
  encode(
    message: MsgCreateDenom,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.sender !== "") writer.uint32(10).string(message.sender);
    if (message.subdenom !== "") writer.uint32(18).string(message.subdenom);
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgCreateDenom {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateDenom();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.subdenom = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateDenom>): MsgCreateDenom {
    const message = createBaseMsgCreateDenom();
    message.sender = object.sender ?? "";
    message.subdenom = object.subdenom ?? "";
    return message;
  },
  fromAmino(object: MsgCreateDenomAmino): MsgCreateDenom {
    return {
      sender: object.sender ?? "",
      subdenom: object.subdenom ?? "",
    };
  },
  toAmino(message: MsgCreateDenom): MsgCreateDenomAmino {
    return {
      sender: message.sender,
      subdenom: message.subdenom,
    };
  },
  toProto(message: MsgCreateDenom): Uint8Array {
    return MsgCreateDenom.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateDenom): MsgCreateDenomProtoMsg {
    return {
      typeUrl: "/osmosis.tokenfactory.v1beta1.MsgCreateDenom",
      value: MsgCreateDenom.encode(message).finish(),
    };
  },
};

// MsgSetDenomMetadata

export interface MsgSetDenomMetadata {
  sender: string;
  metadata: Metadata;
}
export interface MsgSetDenomMetadataProtoMsg {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgSetDenomMetadata";
  value: Uint8Array;
}
export interface MsgSetDenomMetadataAmino {
  sender?: string;
  metadata?: MetadataAmino;
}
export interface MsgSetDenomMetadataSDKType {
  sender: string;
  metadata: MetadataSDKType;
}

function createBaseMsgSetDenomMetadata(): MsgSetDenomMetadata {
  return {
    sender: "",
    metadata: {
      description: "",
      denomUnits: [],
      base: "",
      display: "",
      name: "",
      symbol: "",
      uri: "",
      uriHash: "",
    },
  };
}

export const MsgSetDenomMetadata = {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgSetDenomMetadata",
  encode(
    message: MsgSetDenomMetadata,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.sender !== "") writer.uint32(10).string(message.sender);
    if (message.metadata !== undefined)
      Metadata.encode(message.metadata, writer.uint32(18).fork()).ldelim();
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgSetDenomMetadata {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetDenomMetadata();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.metadata = Metadata.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSetDenomMetadata>): MsgSetDenomMetadata {
    const message = createBaseMsgSetDenomMetadata();
    message.sender = object.sender ?? "";
    message.metadata = object.metadata
      ? Metadata.fromPartial(object.metadata)
      : createBaseMsgSetDenomMetadata().metadata;
    return message;
  },
  fromAmino(object: MsgSetDenomMetadataAmino): MsgSetDenomMetadata {
    return {
      sender: object.sender ?? "",
      metadata: {
        description: object.metadata?.description ?? "",
        denomUnits: (object.metadata?.denom_units ?? []).map((u: any) => ({
          denom: u.denom ?? "",
          exponent: u.exponent ?? 0,
          aliases: u.aliases ?? [],
        })),
        base: object.metadata?.base ?? "",
        display: object.metadata?.display ?? "",
        name: object.metadata?.name ?? "",
        symbol: object.metadata?.symbol ?? "",
        uri: object.metadata?.uri ?? "",
        uriHash: object.metadata?.uri_hash ?? "",
      },
    };
  },
  toAmino(message: MsgSetDenomMetadata): MsgSetDenomMetadataAmino {
    return {
      sender: message.sender,
      metadata: {
        description: message.metadata.description,
        denom_units: message.metadata.denomUnits.map((u) => ({
          denom: u.denom,
          exponent: u.exponent,
          aliases: u.aliases,
        })),
        base: message.metadata.base,
        display: message.metadata.display,
        name: message.metadata.name,
        symbol: message.metadata.symbol,
        uri: message.metadata.uri,
        uri_hash: message.metadata.uriHash,
      },
    };
  },
  toProto(message: MsgSetDenomMetadata): Uint8Array {
    return MsgSetDenomMetadata.encode(message).finish();
  },
  toProtoMsg(message: MsgSetDenomMetadata): MsgSetDenomMetadataProtoMsg {
    return {
      typeUrl: "/osmosis.tokenfactory.v1beta1.MsgSetDenomMetadata",
      value: MsgSetDenomMetadata.encode(message).finish(),
    };
  },
};

// MsgMint

export interface MsgMint {
  sender: string;
  amount: Coin;
  mintToAddress: string;
}
export interface MsgMintProtoMsg {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgMint";
  value: Uint8Array;
}
export interface MsgMintAmino {
  sender?: string;
  amount?: CoinAmino;
  mint_to_address?: string;
}
export interface MsgMintSDKType {
  sender: string;
  amount: CoinSDKType;
  mint_to_address: string;
}

function createBaseMsgMint(): MsgMint {
  return { sender: "", amount: { denom: "", amount: "" }, mintToAddress: "" };
}

export const MsgMint = {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgMint",
  encode(
    message: MsgMint,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.sender !== "") writer.uint32(10).string(message.sender);
    if (message.amount !== undefined)
      Coin.encode(message.amount, writer.uint32(18).fork()).ldelim();
    if (message.mintToAddress !== "")
      writer.uint32(26).string(message.mintToAddress);
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgMint {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgMint();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        case 3:
          message.mintToAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgMint>): MsgMint {
    const message = createBaseMsgMint();
    message.sender = object.sender ?? "";
    message.amount = object.amount
      ? Coin.fromPartial(object.amount)
      : createBaseMsgMint().amount;
    message.mintToAddress = object.mintToAddress ?? "";
    return message;
  },
  fromAmino(object: MsgMintAmino): MsgMint {
    return {
      sender: object.sender ?? "",
      amount: {
        denom: object.amount?.denom ?? "",
        amount: object.amount?.amount ?? "",
      },
      mintToAddress: object.mint_to_address ?? "",
    };
  },
  toAmino(message: MsgMint): MsgMintAmino {
    return {
      sender: message.sender,
      amount: { denom: message.amount.denom, amount: message.amount.amount },
      mint_to_address: message.mintToAddress,
    };
  },
  toProto(message: MsgMint): Uint8Array {
    return MsgMint.encode(message).finish();
  },
  toProtoMsg(message: MsgMint): MsgMintProtoMsg {
    return {
      typeUrl: "/osmosis.tokenfactory.v1beta1.MsgMint",
      value: MsgMint.encode(message).finish(),
    };
  },
};

// MsgChangeAdmin

export interface MsgChangeAdmin {
  sender: string;
  denom: string;
  newAdmin: string;
}
export interface MsgChangeAdminProtoMsg {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgChangeAdmin";
  value: Uint8Array;
}
export interface MsgChangeAdminAmino {
  sender?: string;
  denom?: string;
  new_admin?: string;
}
export interface MsgChangeAdminSDKType {
  sender: string;
  denom: string;
  new_admin: string;
}

function createBaseMsgChangeAdmin(): MsgChangeAdmin {
  return { sender: "", denom: "", newAdmin: "" };
}

export const MsgChangeAdmin = {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgChangeAdmin",
  encode(
    message: MsgChangeAdmin,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.sender !== "") writer.uint32(10).string(message.sender);
    if (message.denom !== "") writer.uint32(18).string(message.denom);
    if (message.newAdmin !== "") writer.uint32(26).string(message.newAdmin);
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): MsgChangeAdmin {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgChangeAdmin();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.denom = reader.string();
          break;
        case 3:
          message.newAdmin = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgChangeAdmin>): MsgChangeAdmin {
    const message = createBaseMsgChangeAdmin();
    message.sender = object.sender ?? "";
    message.denom = object.denom ?? "";
    message.newAdmin = object.newAdmin ?? "";
    return message;
  },
  fromAmino(object: MsgChangeAdminAmino): MsgChangeAdmin {
    return {
      sender: object.sender ?? "",
      denom: object.denom ?? "",
      newAdmin: object.new_admin ?? "",
    };
  },
  toAmino(message: MsgChangeAdmin): MsgChangeAdminAmino {
    return {
      sender: message.sender,
      denom: message.denom,
      new_admin: message.newAdmin,
    };
  },
  toProto(message: MsgChangeAdmin): Uint8Array {
    return MsgChangeAdmin.encode(message).finish();
  },
  toProtoMsg(message: MsgChangeAdmin): MsgChangeAdminProtoMsg {
    return {
      typeUrl: "/osmosis.tokenfactory.v1beta1.MsgChangeAdmin",
      value: MsgChangeAdmin.encode(message).finish(),
    };
  },
};
