import * as _m0 from "protobufjs/minimal";

import {
  Metadata,
  MetadataAmino,
  MetadataSDKType,
} from "../../../cosmos/bank/v1beta1/bank";
import {
  Coin,
  CoinAmino,
  CoinSDKType,
} from "../../../cosmos/base/v1beta1/coin";
/**
 * MsgCreateDenom defines the message structure for the CreateDenom gRPC service
 * method. It allows an account to create a new denom. It requires a sender
 * address and a sub denomination. The (sender_address, sub_denomination) tuple
 * must be unique and cannot be re-used.
 *
 * The resulting denom created is defined as
 * <factory/{creatorAddress}/{subdenom}>. The resulting denom's admin is
 * originally set to be the creator, but this can be changed later. The token
 * denom does not indicate the current admin.
 */
export interface MsgCreateDenom {
  sender: string;
  /** subdenom can be up to 44 "alphanumeric" characters long. */
  subdenom: string;
}
export interface MsgCreateDenomProtoMsg {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgCreateDenom";
  value: Uint8Array;
}
/**
 * MsgCreateDenom defines the message structure for the CreateDenom gRPC service
 * method. It allows an account to create a new denom. It requires a sender
 * address and a sub denomination. The (sender_address, sub_denomination) tuple
 * must be unique and cannot be re-used.
 *
 * The resulting denom created is defined as
 * <factory/{creatorAddress}/{subdenom}>. The resulting denom's admin is
 * originally set to be the creator, but this can be changed later. The token
 * denom does not indicate the current admin.
 */
export interface MsgCreateDenomAmino {
  sender: string;
  /** subdenom can be up to 44 "alphanumeric" characters long. */
  subdenom: string;
}
export interface MsgCreateDenomAminoMsg {
  type: "osmosis/tokenfactory/create-denom";
  value: MsgCreateDenomAmino;
}
/**
 * MsgCreateDenom defines the message structure for the CreateDenom gRPC service
 * method. It allows an account to create a new denom. It requires a sender
 * address and a sub denomination. The (sender_address, sub_denomination) tuple
 * must be unique and cannot be re-used.
 *
 * The resulting denom created is defined as
 * <factory/{creatorAddress}/{subdenom}>. The resulting denom's admin is
 * originally set to be the creator, but this can be changed later. The token
 * denom does not indicate the current admin.
 */
export interface MsgCreateDenomSDKType {
  sender: string;
  subdenom: string;
}
/**
 * MsgCreateDenomResponse is the return value of MsgCreateDenom
 * It returns the full string of the newly created denom
 */
export interface MsgCreateDenomResponse {
  newTokenDenom: string;
}
export interface MsgCreateDenomResponseProtoMsg {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgCreateDenomResponse";
  value: Uint8Array;
}
/**
 * MsgCreateDenomResponse is the return value of MsgCreateDenom
 * It returns the full string of the newly created denom
 */
export interface MsgCreateDenomResponseAmino {
  new_token_denom: string;
}
export interface MsgCreateDenomResponseAminoMsg {
  type: "osmosis/tokenfactory/create-denom-response";
  value: MsgCreateDenomResponseAmino;
}
/**
 * MsgCreateDenomResponse is the return value of MsgCreateDenom
 * It returns the full string of the newly created denom
 */
export interface MsgCreateDenomResponseSDKType {
  new_token_denom: string;
}
/**
 * MsgMint is the sdk.Msg type for allowing an admin account to mint
 * more of a token.  For now, we only support minting to the sender account
 */
export interface MsgMint {
  sender: string;
  amount?: Coin;
  mintToAddress: string;
}
export interface MsgMintProtoMsg {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgMint";
  value: Uint8Array;
}
/**
 * MsgMint is the sdk.Msg type for allowing an admin account to mint
 * more of a token.  For now, we only support minting to the sender account
 */
export interface MsgMintAmino {
  sender: string;
  amount?: CoinAmino;
  mintToAddress: string;
}
export interface MsgMintAminoMsg {
  type: "osmosis/tokenfactory/mint";
  value: MsgMintAmino;
}
/**
 * MsgMint is the sdk.Msg type for allowing an admin account to mint
 * more of a token.  For now, we only support minting to the sender account
 */
export interface MsgMintSDKType {
  sender: string;
  amount?: CoinSDKType;
  mintToAddress: string;
}
export interface MsgMintResponse {}
export interface MsgMintResponseProtoMsg {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgMintResponse";
  value: Uint8Array;
}
export interface MsgMintResponseAmino {}
export interface MsgMintResponseAminoMsg {
  type: "osmosis/tokenfactory/mint-response";
  value: MsgMintResponseAmino;
}
export interface MsgMintResponseSDKType {}
/**
 * MsgBurn is the sdk.Msg type for allowing an admin account to burn
 * a token.  For now, we only support burning from the sender account.
 */
export interface MsgBurn {
  sender: string;
  amount?: Coin;
  burnFromAddress: string;
}
export interface MsgBurnProtoMsg {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgBurn";
  value: Uint8Array;
}
/**
 * MsgBurn is the sdk.Msg type for allowing an admin account to burn
 * a token.  For now, we only support burning from the sender account.
 */
export interface MsgBurnAmino {
  sender: string;
  amount?: CoinAmino;
  burnFromAddress: string;
}
export interface MsgBurnAminoMsg {
  type: "osmosis/tokenfactory/burn";
  value: MsgBurnAmino;
}
/**
 * MsgBurn is the sdk.Msg type for allowing an admin account to burn
 * a token.  For now, we only support burning from the sender account.
 */
export interface MsgBurnSDKType {
  sender: string;
  amount?: CoinSDKType;
  burnFromAddress: string;
}
export interface MsgBurnResponse {}
export interface MsgBurnResponseProtoMsg {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgBurnResponse";
  value: Uint8Array;
}
export interface MsgBurnResponseAmino {}
export interface MsgBurnResponseAminoMsg {
  type: "osmosis/tokenfactory/burn-response";
  value: MsgBurnResponseAmino;
}
export interface MsgBurnResponseSDKType {}
/**
 * MsgChangeAdmin is the sdk.Msg type for allowing an admin account to reassign
 * adminship of a denom to a new account
 */
export interface MsgChangeAdmin {
  sender: string;
  denom: string;
  newAdmin: string;
}
export interface MsgChangeAdminProtoMsg {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgChangeAdmin";
  value: Uint8Array;
}
/**
 * MsgChangeAdmin is the sdk.Msg type for allowing an admin account to reassign
 * adminship of a denom to a new account
 */
export interface MsgChangeAdminAmino {
  sender: string;
  denom: string;
  new_admin: string;
}
export interface MsgChangeAdminAminoMsg {
  type: "osmosis/tokenfactory/change-admin";
  value: MsgChangeAdminAmino;
}
/**
 * MsgChangeAdmin is the sdk.Msg type for allowing an admin account to reassign
 * adminship of a denom to a new account
 */
export interface MsgChangeAdminSDKType {
  sender: string;
  denom: string;
  new_admin: string;
}
/**
 * MsgChangeAdminResponse defines the response structure for an executed
 * MsgChangeAdmin message.
 */
export interface MsgChangeAdminResponse {}
export interface MsgChangeAdminResponseProtoMsg {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgChangeAdminResponse";
  value: Uint8Array;
}
/**
 * MsgChangeAdminResponse defines the response structure for an executed
 * MsgChangeAdmin message.
 */
export interface MsgChangeAdminResponseAmino {}
export interface MsgChangeAdminResponseAminoMsg {
  type: "osmosis/tokenfactory/change-admin-response";
  value: MsgChangeAdminResponseAmino;
}
/**
 * MsgChangeAdminResponse defines the response structure for an executed
 * MsgChangeAdmin message.
 */
export interface MsgChangeAdminResponseSDKType {}
/**
 * MsgSetBeforeSendHook is the sdk.Msg type for allowing an admin account to
 * assign a CosmWasm contract to call with a BeforeSend hook
 */
export interface MsgSetBeforeSendHook {
  sender: string;
  denom: string;
  cosmwasmAddress: string;
}
export interface MsgSetBeforeSendHookProtoMsg {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgSetBeforeSendHook";
  value: Uint8Array;
}
/**
 * MsgSetBeforeSendHook is the sdk.Msg type for allowing an admin account to
 * assign a CosmWasm contract to call with a BeforeSend hook
 */
export interface MsgSetBeforeSendHookAmino {
  sender: string;
  denom: string;
  cosmwasm_address: string;
}
export interface MsgSetBeforeSendHookAminoMsg {
  type: "osmosis/tokenfactory/set-before-send-hook";
  value: MsgSetBeforeSendHookAmino;
}
/**
 * MsgSetBeforeSendHook is the sdk.Msg type for allowing an admin account to
 * assign a CosmWasm contract to call with a BeforeSend hook
 */
export interface MsgSetBeforeSendHookSDKType {
  sender: string;
  denom: string;
  cosmwasm_address: string;
}
/**
 * MsgSetBeforeSendHookResponse defines the response structure for an executed
 * MsgSetBeforeSendHook message.
 */
export interface MsgSetBeforeSendHookResponse {}
export interface MsgSetBeforeSendHookResponseProtoMsg {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgSetBeforeSendHookResponse";
  value: Uint8Array;
}
/**
 * MsgSetBeforeSendHookResponse defines the response structure for an executed
 * MsgSetBeforeSendHook message.
 */
export interface MsgSetBeforeSendHookResponseAmino {}
export interface MsgSetBeforeSendHookResponseAminoMsg {
  type: "osmosis/tokenfactory/set-before-send-hook-response";
  value: MsgSetBeforeSendHookResponseAmino;
}
/**
 * MsgSetBeforeSendHookResponse defines the response structure for an executed
 * MsgSetBeforeSendHook message.
 */
export interface MsgSetBeforeSendHookResponseSDKType {}
/**
 * MsgSetDenomMetadata is the sdk.Msg type for allowing an admin account to set
 * the denom's bank metadata
 */
export interface MsgSetDenomMetadata {
  sender: string;
  metadata?: Metadata;
}
export interface MsgSetDenomMetadataProtoMsg {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgSetDenomMetadata";
  value: Uint8Array;
}
/**
 * MsgSetDenomMetadata is the sdk.Msg type for allowing an admin account to set
 * the denom's bank metadata
 */
export interface MsgSetDenomMetadataAmino {
  sender: string;
  metadata?: MetadataAmino;
}
export interface MsgSetDenomMetadataAminoMsg {
  type: "osmosis/tokenfactory/set-denom-metadata";
  value: MsgSetDenomMetadataAmino;
}
/**
 * MsgSetDenomMetadata is the sdk.Msg type for allowing an admin account to set
 * the denom's bank metadata
 */
export interface MsgSetDenomMetadataSDKType {
  sender: string;
  metadata?: MetadataSDKType;
}
/**
 * MsgSetDenomMetadataResponse defines the response structure for an executed
 * MsgSetDenomMetadata message.
 */
export interface MsgSetDenomMetadataResponse {}
export interface MsgSetDenomMetadataResponseProtoMsg {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgSetDenomMetadataResponse";
  value: Uint8Array;
}
/**
 * MsgSetDenomMetadataResponse defines the response structure for an executed
 * MsgSetDenomMetadata message.
 */
export interface MsgSetDenomMetadataResponseAmino {}
export interface MsgSetDenomMetadataResponseAminoMsg {
  type: "osmosis/tokenfactory/set-denom-metadata-response";
  value: MsgSetDenomMetadataResponseAmino;
}
/**
 * MsgSetDenomMetadataResponse defines the response structure for an executed
 * MsgSetDenomMetadata message.
 */
export interface MsgSetDenomMetadataResponseSDKType {}
export interface MsgForceTransfer {
  sender: string;
  amount?: Coin;
  transferFromAddress: string;
  transferToAddress: string;
}
export interface MsgForceTransferProtoMsg {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgForceTransfer";
  value: Uint8Array;
}
export interface MsgForceTransferAmino {
  sender: string;
  amount?: CoinAmino;
  transferFromAddress: string;
  transferToAddress: string;
}
export interface MsgForceTransferAminoMsg {
  type: "osmosis/tokenfactory/force-transfer";
  value: MsgForceTransferAmino;
}
export interface MsgForceTransferSDKType {
  sender: string;
  amount?: CoinSDKType;
  transferFromAddress: string;
  transferToAddress: string;
}
export interface MsgForceTransferResponse {}
export interface MsgForceTransferResponseProtoMsg {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgForceTransferResponse";
  value: Uint8Array;
}
export interface MsgForceTransferResponseAmino {}
export interface MsgForceTransferResponseAminoMsg {
  type: "osmosis/tokenfactory/force-transfer-response";
  value: MsgForceTransferResponseAmino;
}
export interface MsgForceTransferResponseSDKType {}
function createBaseMsgCreateDenom(): MsgCreateDenom {
  return {
    sender: "",
    subdenom: "",
  };
}
export const MsgCreateDenom = {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgCreateDenom",
  encode(
    message: MsgCreateDenom,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (message.subdenom !== "") {
      writer.uint32(18).string(message.subdenom);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCreateDenom {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
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
          break;
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
      sender: object.sender,
      subdenom: object.subdenom,
    };
  },
  toAmino(message: MsgCreateDenom): MsgCreateDenomAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.subdenom = message.subdenom;
    return obj;
  },
  fromAminoMsg(object: MsgCreateDenomAminoMsg): MsgCreateDenom {
    return MsgCreateDenom.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCreateDenom): MsgCreateDenomAminoMsg {
    return {
      type: "osmosis/tokenfactory/create-denom",
      value: MsgCreateDenom.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCreateDenomProtoMsg): MsgCreateDenom {
    return MsgCreateDenom.decode(message.value);
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
function createBaseMsgCreateDenomResponse(): MsgCreateDenomResponse {
  return {
    newTokenDenom: "",
  };
}
export const MsgCreateDenomResponse = {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgCreateDenomResponse",
  encode(
    message: MsgCreateDenomResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.newTokenDenom !== "") {
      writer.uint32(10).string(message.newTokenDenom);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgCreateDenomResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateDenomResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.newTokenDenom = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateDenomResponse>): MsgCreateDenomResponse {
    const message = createBaseMsgCreateDenomResponse();
    message.newTokenDenom = object.newTokenDenom ?? "";
    return message;
  },
  fromAmino(object: MsgCreateDenomResponseAmino): MsgCreateDenomResponse {
    return {
      newTokenDenom: object.new_token_denom,
    };
  },
  toAmino(message: MsgCreateDenomResponse): MsgCreateDenomResponseAmino {
    const obj: any = {};
    obj.new_token_denom = message.newTokenDenom;
    return obj;
  },
  fromAminoMsg(object: MsgCreateDenomResponseAminoMsg): MsgCreateDenomResponse {
    return MsgCreateDenomResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCreateDenomResponse): MsgCreateDenomResponseAminoMsg {
    return {
      type: "osmosis/tokenfactory/create-denom-response",
      value: MsgCreateDenomResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgCreateDenomResponseProtoMsg
  ): MsgCreateDenomResponse {
    return MsgCreateDenomResponse.decode(message.value);
  },
  toProto(message: MsgCreateDenomResponse): Uint8Array {
    return MsgCreateDenomResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateDenomResponse): MsgCreateDenomResponseProtoMsg {
    return {
      typeUrl: "/osmosis.tokenfactory.v1beta1.MsgCreateDenomResponse",
      value: MsgCreateDenomResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgMint(): MsgMint {
  return {
    sender: "",
    amount: undefined,
    mintToAddress: "",
  };
}
export const MsgMint = {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgMint",
  encode(
    message: MsgMint,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(18).fork()).ldelim();
    }
    if (message.mintToAddress !== "") {
      writer.uint32(26).string(message.mintToAddress);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgMint {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
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
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgMint>): MsgMint {
    const message = createBaseMsgMint();
    message.sender = object.sender ?? "";
    message.amount =
      object.amount !== undefined && object.amount !== null
        ? Coin.fromPartial(object.amount)
        : undefined;
    message.mintToAddress = object.mintToAddress ?? "";
    return message;
  },
  fromAmino(object: MsgMintAmino): MsgMint {
    return {
      sender: object.sender,
      amount: object?.amount ? Coin.fromAmino(object.amount) : undefined,
      mintToAddress: object.mintToAddress,
    };
  },
  toAmino(message: MsgMint): MsgMintAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.amount = message.amount ? Coin.toAmino(message.amount) : undefined;
    obj.mintToAddress = message.mintToAddress;
    return obj;
  },
  fromAminoMsg(object: MsgMintAminoMsg): MsgMint {
    return MsgMint.fromAmino(object.value);
  },
  toAminoMsg(message: MsgMint): MsgMintAminoMsg {
    return {
      type: "osmosis/tokenfactory/mint",
      value: MsgMint.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgMintProtoMsg): MsgMint {
    return MsgMint.decode(message.value);
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
function createBaseMsgMintResponse(): MsgMintResponse {
  return {};
}
export const MsgMintResponse = {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgMintResponse",
  encode(
    _: MsgMintResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgMintResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgMintResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgMintResponse>): MsgMintResponse {
    const message = createBaseMsgMintResponse();
    return message;
  },
  fromAmino(_: MsgMintResponseAmino): MsgMintResponse {
    return {};
  },
  toAmino(_: MsgMintResponse): MsgMintResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgMintResponseAminoMsg): MsgMintResponse {
    return MsgMintResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgMintResponse): MsgMintResponseAminoMsg {
    return {
      type: "osmosis/tokenfactory/mint-response",
      value: MsgMintResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgMintResponseProtoMsg): MsgMintResponse {
    return MsgMintResponse.decode(message.value);
  },
  toProto(message: MsgMintResponse): Uint8Array {
    return MsgMintResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgMintResponse): MsgMintResponseProtoMsg {
    return {
      typeUrl: "/osmosis.tokenfactory.v1beta1.MsgMintResponse",
      value: MsgMintResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgBurn(): MsgBurn {
  return {
    sender: "",
    amount: undefined,
    burnFromAddress: "",
  };
}
export const MsgBurn = {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgBurn",
  encode(
    message: MsgBurn,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(18).fork()).ldelim();
    }
    if (message.burnFromAddress !== "") {
      writer.uint32(26).string(message.burnFromAddress);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgBurn {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBurn();
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
          message.burnFromAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgBurn>): MsgBurn {
    const message = createBaseMsgBurn();
    message.sender = object.sender ?? "";
    message.amount =
      object.amount !== undefined && object.amount !== null
        ? Coin.fromPartial(object.amount)
        : undefined;
    message.burnFromAddress = object.burnFromAddress ?? "";
    return message;
  },
  fromAmino(object: MsgBurnAmino): MsgBurn {
    return {
      sender: object.sender,
      amount: object?.amount ? Coin.fromAmino(object.amount) : undefined,
      burnFromAddress: object.burnFromAddress,
    };
  },
  toAmino(message: MsgBurn): MsgBurnAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.amount = message.amount ? Coin.toAmino(message.amount) : undefined;
    obj.burnFromAddress = message.burnFromAddress;
    return obj;
  },
  fromAminoMsg(object: MsgBurnAminoMsg): MsgBurn {
    return MsgBurn.fromAmino(object.value);
  },
  toAminoMsg(message: MsgBurn): MsgBurnAminoMsg {
    return {
      type: "osmosis/tokenfactory/burn",
      value: MsgBurn.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgBurnProtoMsg): MsgBurn {
    return MsgBurn.decode(message.value);
  },
  toProto(message: MsgBurn): Uint8Array {
    return MsgBurn.encode(message).finish();
  },
  toProtoMsg(message: MsgBurn): MsgBurnProtoMsg {
    return {
      typeUrl: "/osmosis.tokenfactory.v1beta1.MsgBurn",
      value: MsgBurn.encode(message).finish(),
    };
  },
};
function createBaseMsgBurnResponse(): MsgBurnResponse {
  return {};
}
export const MsgBurnResponse = {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgBurnResponse",
  encode(
    _: MsgBurnResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgBurnResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgBurnResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgBurnResponse>): MsgBurnResponse {
    const message = createBaseMsgBurnResponse();
    return message;
  },
  fromAmino(_: MsgBurnResponseAmino): MsgBurnResponse {
    return {};
  },
  toAmino(_: MsgBurnResponse): MsgBurnResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgBurnResponseAminoMsg): MsgBurnResponse {
    return MsgBurnResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgBurnResponse): MsgBurnResponseAminoMsg {
    return {
      type: "osmosis/tokenfactory/burn-response",
      value: MsgBurnResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgBurnResponseProtoMsg): MsgBurnResponse {
    return MsgBurnResponse.decode(message.value);
  },
  toProto(message: MsgBurnResponse): Uint8Array {
    return MsgBurnResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgBurnResponse): MsgBurnResponseProtoMsg {
    return {
      typeUrl: "/osmosis.tokenfactory.v1beta1.MsgBurnResponse",
      value: MsgBurnResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgChangeAdmin(): MsgChangeAdmin {
  return {
    sender: "",
    denom: "",
    newAdmin: "",
  };
}
export const MsgChangeAdmin = {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgChangeAdmin",
  encode(
    message: MsgChangeAdmin,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (message.denom !== "") {
      writer.uint32(18).string(message.denom);
    }
    if (message.newAdmin !== "") {
      writer.uint32(26).string(message.newAdmin);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgChangeAdmin {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
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
          break;
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
      sender: object.sender,
      denom: object.denom,
      newAdmin: object.new_admin,
    };
  },
  toAmino(message: MsgChangeAdmin): MsgChangeAdminAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.denom = message.denom;
    obj.new_admin = message.newAdmin;
    return obj;
  },
  fromAminoMsg(object: MsgChangeAdminAminoMsg): MsgChangeAdmin {
    return MsgChangeAdmin.fromAmino(object.value);
  },
  toAminoMsg(message: MsgChangeAdmin): MsgChangeAdminAminoMsg {
    return {
      type: "osmosis/tokenfactory/change-admin",
      value: MsgChangeAdmin.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgChangeAdminProtoMsg): MsgChangeAdmin {
    return MsgChangeAdmin.decode(message.value);
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
function createBaseMsgChangeAdminResponse(): MsgChangeAdminResponse {
  return {};
}
export const MsgChangeAdminResponse = {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgChangeAdminResponse",
  encode(
    _: MsgChangeAdminResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgChangeAdminResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgChangeAdminResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgChangeAdminResponse>): MsgChangeAdminResponse {
    const message = createBaseMsgChangeAdminResponse();
    return message;
  },
  fromAmino(_: MsgChangeAdminResponseAmino): MsgChangeAdminResponse {
    return {};
  },
  toAmino(_: MsgChangeAdminResponse): MsgChangeAdminResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: MsgChangeAdminResponseAminoMsg): MsgChangeAdminResponse {
    return MsgChangeAdminResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgChangeAdminResponse): MsgChangeAdminResponseAminoMsg {
    return {
      type: "osmosis/tokenfactory/change-admin-response",
      value: MsgChangeAdminResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgChangeAdminResponseProtoMsg
  ): MsgChangeAdminResponse {
    return MsgChangeAdminResponse.decode(message.value);
  },
  toProto(message: MsgChangeAdminResponse): Uint8Array {
    return MsgChangeAdminResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgChangeAdminResponse): MsgChangeAdminResponseProtoMsg {
    return {
      typeUrl: "/osmosis.tokenfactory.v1beta1.MsgChangeAdminResponse",
      value: MsgChangeAdminResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgSetBeforeSendHook(): MsgSetBeforeSendHook {
  return {
    sender: "",
    denom: "",
    cosmwasmAddress: "",
  };
}
export const MsgSetBeforeSendHook = {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgSetBeforeSendHook",
  encode(
    message: MsgSetBeforeSendHook,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (message.denom !== "") {
      writer.uint32(18).string(message.denom);
    }
    if (message.cosmwasmAddress !== "") {
      writer.uint32(26).string(message.cosmwasmAddress);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSetBeforeSendHook {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetBeforeSendHook();
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
          message.cosmwasmAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSetBeforeSendHook>): MsgSetBeforeSendHook {
    const message = createBaseMsgSetBeforeSendHook();
    message.sender = object.sender ?? "";
    message.denom = object.denom ?? "";
    message.cosmwasmAddress = object.cosmwasmAddress ?? "";
    return message;
  },
  fromAmino(object: MsgSetBeforeSendHookAmino): MsgSetBeforeSendHook {
    return {
      sender: object.sender,
      denom: object.denom,
      cosmwasmAddress: object.cosmwasm_address,
    };
  },
  toAmino(message: MsgSetBeforeSendHook): MsgSetBeforeSendHookAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.denom = message.denom;
    obj.cosmwasm_address = message.cosmwasmAddress;
    return obj;
  },
  fromAminoMsg(object: MsgSetBeforeSendHookAminoMsg): MsgSetBeforeSendHook {
    return MsgSetBeforeSendHook.fromAmino(object.value);
  },
  toAminoMsg(message: MsgSetBeforeSendHook): MsgSetBeforeSendHookAminoMsg {
    return {
      type: "osmosis/tokenfactory/set-before-send-hook",
      value: MsgSetBeforeSendHook.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgSetBeforeSendHookProtoMsg): MsgSetBeforeSendHook {
    return MsgSetBeforeSendHook.decode(message.value);
  },
  toProto(message: MsgSetBeforeSendHook): Uint8Array {
    return MsgSetBeforeSendHook.encode(message).finish();
  },
  toProtoMsg(message: MsgSetBeforeSendHook): MsgSetBeforeSendHookProtoMsg {
    return {
      typeUrl: "/osmosis.tokenfactory.v1beta1.MsgSetBeforeSendHook",
      value: MsgSetBeforeSendHook.encode(message).finish(),
    };
  },
};
function createBaseMsgSetBeforeSendHookResponse(): MsgSetBeforeSendHookResponse {
  return {};
}
export const MsgSetBeforeSendHookResponse = {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgSetBeforeSendHookResponse",
  encode(
    _: MsgSetBeforeSendHookResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSetBeforeSendHookResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetBeforeSendHookResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    _: Partial<MsgSetBeforeSendHookResponse>
  ): MsgSetBeforeSendHookResponse {
    const message = createBaseMsgSetBeforeSendHookResponse();
    return message;
  },
  fromAmino(
    _: MsgSetBeforeSendHookResponseAmino
  ): MsgSetBeforeSendHookResponse {
    return {};
  },
  toAmino(_: MsgSetBeforeSendHookResponse): MsgSetBeforeSendHookResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: MsgSetBeforeSendHookResponseAminoMsg
  ): MsgSetBeforeSendHookResponse {
    return MsgSetBeforeSendHookResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSetBeforeSendHookResponse
  ): MsgSetBeforeSendHookResponseAminoMsg {
    return {
      type: "osmosis/tokenfactory/set-before-send-hook-response",
      value: MsgSetBeforeSendHookResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSetBeforeSendHookResponseProtoMsg
  ): MsgSetBeforeSendHookResponse {
    return MsgSetBeforeSendHookResponse.decode(message.value);
  },
  toProto(message: MsgSetBeforeSendHookResponse): Uint8Array {
    return MsgSetBeforeSendHookResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSetBeforeSendHookResponse
  ): MsgSetBeforeSendHookResponseProtoMsg {
    return {
      typeUrl: "/osmosis.tokenfactory.v1beta1.MsgSetBeforeSendHookResponse",
      value: MsgSetBeforeSendHookResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgSetDenomMetadata(): MsgSetDenomMetadata {
  return {
    sender: "",
    metadata: undefined,
  };
}
export const MsgSetDenomMetadata = {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgSetDenomMetadata",
  encode(
    message: MsgSetDenomMetadata,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (message.metadata !== undefined) {
      Metadata.encode(message.metadata, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSetDenomMetadata {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
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
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSetDenomMetadata>): MsgSetDenomMetadata {
    const message = createBaseMsgSetDenomMetadata();
    message.sender = object.sender ?? "";
    message.metadata =
      object.metadata !== undefined && object.metadata !== null
        ? Metadata.fromPartial(object.metadata)
        : undefined;
    return message;
  },
  fromAmino(object: MsgSetDenomMetadataAmino): MsgSetDenomMetadata {
    return {
      sender: object.sender,
      metadata: object?.metadata
        ? Metadata.fromAmino(object.metadata)
        : undefined,
    };
  },
  toAmino(message: MsgSetDenomMetadata): MsgSetDenomMetadataAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.metadata = message.metadata
      ? Metadata.toAmino(message.metadata)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgSetDenomMetadataAminoMsg): MsgSetDenomMetadata {
    return MsgSetDenomMetadata.fromAmino(object.value);
  },
  toAminoMsg(message: MsgSetDenomMetadata): MsgSetDenomMetadataAminoMsg {
    return {
      type: "osmosis/tokenfactory/set-denom-metadata",
      value: MsgSetDenomMetadata.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgSetDenomMetadataProtoMsg): MsgSetDenomMetadata {
    return MsgSetDenomMetadata.decode(message.value);
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
function createBaseMsgSetDenomMetadataResponse(): MsgSetDenomMetadataResponse {
  return {};
}
export const MsgSetDenomMetadataResponse = {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgSetDenomMetadataResponse",
  encode(
    _: MsgSetDenomMetadataResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSetDenomMetadataResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSetDenomMetadataResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    _: Partial<MsgSetDenomMetadataResponse>
  ): MsgSetDenomMetadataResponse {
    const message = createBaseMsgSetDenomMetadataResponse();
    return message;
  },
  fromAmino(_: MsgSetDenomMetadataResponseAmino): MsgSetDenomMetadataResponse {
    return {};
  },
  toAmino(_: MsgSetDenomMetadataResponse): MsgSetDenomMetadataResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: MsgSetDenomMetadataResponseAminoMsg
  ): MsgSetDenomMetadataResponse {
    return MsgSetDenomMetadataResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSetDenomMetadataResponse
  ): MsgSetDenomMetadataResponseAminoMsg {
    return {
      type: "osmosis/tokenfactory/set-denom-metadata-response",
      value: MsgSetDenomMetadataResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSetDenomMetadataResponseProtoMsg
  ): MsgSetDenomMetadataResponse {
    return MsgSetDenomMetadataResponse.decode(message.value);
  },
  toProto(message: MsgSetDenomMetadataResponse): Uint8Array {
    return MsgSetDenomMetadataResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSetDenomMetadataResponse
  ): MsgSetDenomMetadataResponseProtoMsg {
    return {
      typeUrl: "/osmosis.tokenfactory.v1beta1.MsgSetDenomMetadataResponse",
      value: MsgSetDenomMetadataResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgForceTransfer(): MsgForceTransfer {
  return {
    sender: "",
    amount: undefined,
    transferFromAddress: "",
    transferToAddress: "",
  };
}
export const MsgForceTransfer = {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgForceTransfer",
  encode(
    message: MsgForceTransfer,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(18).fork()).ldelim();
    }
    if (message.transferFromAddress !== "") {
      writer.uint32(26).string(message.transferFromAddress);
    }
    if (message.transferToAddress !== "") {
      writer.uint32(34).string(message.transferToAddress);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgForceTransfer {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgForceTransfer();
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
          message.transferFromAddress = reader.string();
          break;
        case 4:
          message.transferToAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgForceTransfer>): MsgForceTransfer {
    const message = createBaseMsgForceTransfer();
    message.sender = object.sender ?? "";
    message.amount =
      object.amount !== undefined && object.amount !== null
        ? Coin.fromPartial(object.amount)
        : undefined;
    message.transferFromAddress = object.transferFromAddress ?? "";
    message.transferToAddress = object.transferToAddress ?? "";
    return message;
  },
  fromAmino(object: MsgForceTransferAmino): MsgForceTransfer {
    return {
      sender: object.sender,
      amount: object?.amount ? Coin.fromAmino(object.amount) : undefined,
      transferFromAddress: object.transferFromAddress,
      transferToAddress: object.transferToAddress,
    };
  },
  toAmino(message: MsgForceTransfer): MsgForceTransferAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.amount = message.amount ? Coin.toAmino(message.amount) : undefined;
    obj.transferFromAddress = message.transferFromAddress;
    obj.transferToAddress = message.transferToAddress;
    return obj;
  },
  fromAminoMsg(object: MsgForceTransferAminoMsg): MsgForceTransfer {
    return MsgForceTransfer.fromAmino(object.value);
  },
  toAminoMsg(message: MsgForceTransfer): MsgForceTransferAminoMsg {
    return {
      type: "osmosis/tokenfactory/force-transfer",
      value: MsgForceTransfer.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgForceTransferProtoMsg): MsgForceTransfer {
    return MsgForceTransfer.decode(message.value);
  },
  toProto(message: MsgForceTransfer): Uint8Array {
    return MsgForceTransfer.encode(message).finish();
  },
  toProtoMsg(message: MsgForceTransfer): MsgForceTransferProtoMsg {
    return {
      typeUrl: "/osmosis.tokenfactory.v1beta1.MsgForceTransfer",
      value: MsgForceTransfer.encode(message).finish(),
    };
  },
};
function createBaseMsgForceTransferResponse(): MsgForceTransferResponse {
  return {};
}
export const MsgForceTransferResponse = {
  typeUrl: "/osmosis.tokenfactory.v1beta1.MsgForceTransferResponse",
  encode(
    _: MsgForceTransferResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgForceTransferResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgForceTransferResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(_: Partial<MsgForceTransferResponse>): MsgForceTransferResponse {
    const message = createBaseMsgForceTransferResponse();
    return message;
  },
  fromAmino(_: MsgForceTransferResponseAmino): MsgForceTransferResponse {
    return {};
  },
  toAmino(_: MsgForceTransferResponse): MsgForceTransferResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: MsgForceTransferResponseAminoMsg
  ): MsgForceTransferResponse {
    return MsgForceTransferResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgForceTransferResponse
  ): MsgForceTransferResponseAminoMsg {
    return {
      type: "osmosis/tokenfactory/force-transfer-response",
      value: MsgForceTransferResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgForceTransferResponseProtoMsg
  ): MsgForceTransferResponse {
    return MsgForceTransferResponse.decode(message.value);
  },
  toProto(message: MsgForceTransferResponse): Uint8Array {
    return MsgForceTransferResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgForceTransferResponse
  ): MsgForceTransferResponseProtoMsg {
    return {
      typeUrl: "/osmosis.tokenfactory.v1beta1.MsgForceTransferResponse",
      value: MsgForceTransferResponse.encode(message).finish(),
    };
  },
};
