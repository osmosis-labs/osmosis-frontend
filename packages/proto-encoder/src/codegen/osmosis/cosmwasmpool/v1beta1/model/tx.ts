//@ts-nocheck
/* eslint-disable */
import { Long } from "../../../../helpers";
import * as _m0 from "protobufjs/minimal";
/** ===================== MsgCreateCosmwasmPool */
export interface MsgCreateCosmWasmPool {
  codeId: Long;
  instantiateMsg: Uint8Array;
  sender: string;
}
export interface MsgCreateCosmWasmPoolProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.MsgCreateCosmWasmPool";
  value: Uint8Array;
}
/** ===================== MsgCreateCosmwasmPool */
export interface MsgCreateCosmWasmPoolAmino {
  code_id: string;
  instantiate_msg: Uint8Array;
  sender: string;
}
export interface MsgCreateCosmWasmPoolAminoMsg {
  type: "osmosis/cosmwasmpool/create-cosm-wasm-pool";
  value: MsgCreateCosmWasmPoolAmino;
}
/** ===================== MsgCreateCosmwasmPool */
export interface MsgCreateCosmWasmPoolSDKType {
  code_id: Long;
  instantiate_msg: Uint8Array;
  sender: string;
}
/** Returns a unique poolID to identify the pool with. */
export interface MsgCreateCosmWasmPoolResponse {
  poolId: Long;
}
export interface MsgCreateCosmWasmPoolResponseProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.MsgCreateCosmWasmPoolResponse";
  value: Uint8Array;
}
/** Returns a unique poolID to identify the pool with. */
export interface MsgCreateCosmWasmPoolResponseAmino {
  pool_id: string;
}
export interface MsgCreateCosmWasmPoolResponseAminoMsg {
  type: "osmosis/cosmwasmpool/create-cosm-wasm-pool-response";
  value: MsgCreateCosmWasmPoolResponseAmino;
}
/** Returns a unique poolID to identify the pool with. */
export interface MsgCreateCosmWasmPoolResponseSDKType {
  pool_id: Long;
}
function createBaseMsgCreateCosmWasmPool(): MsgCreateCosmWasmPool {
  return {
    codeId: Long.UZERO,
    instantiateMsg: new Uint8Array(),
    sender: "",
  };
}
export const MsgCreateCosmWasmPool = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.MsgCreateCosmWasmPool",
  encode(
    message: MsgCreateCosmWasmPool,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.codeId.isZero()) {
      writer.uint32(8).uint64(message.codeId);
    }
    if (message.instantiateMsg.length !== 0) {
      writer.uint32(18).bytes(message.instantiateMsg);
    }
    if (message.sender !== "") {
      writer.uint32(26).string(message.sender);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgCreateCosmWasmPool {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateCosmWasmPool();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.codeId = reader.uint64() as Long;
          break;
        case 2:
          message.instantiateMsg = reader.bytes();
          break;
        case 3:
          message.sender = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateCosmWasmPool>): MsgCreateCosmWasmPool {
    const message = createBaseMsgCreateCosmWasmPool();
    message.codeId =
      object.codeId !== undefined && object.codeId !== null
        ? Long.fromValue(object.codeId)
        : Long.UZERO;
    message.instantiateMsg = object.instantiateMsg ?? new Uint8Array();
    message.sender = object.sender ?? "";
    return message;
  },
  fromAmino(object: MsgCreateCosmWasmPoolAmino): MsgCreateCosmWasmPool {
    return {
      codeId: Long.fromString(object.code_id),
      instantiateMsg: object.instantiate_msg,
      sender: object.sender,
    };
  },
  toAmino(message: MsgCreateCosmWasmPool): MsgCreateCosmWasmPoolAmino {
    const obj: any = {};
    obj.code_id = message.codeId ? message.codeId.toString() : undefined;
    obj.instantiate_msg = message.instantiateMsg;
    obj.sender = message.sender;
    return obj;
  },
  fromAminoMsg(object: MsgCreateCosmWasmPoolAminoMsg): MsgCreateCosmWasmPool {
    return MsgCreateCosmWasmPool.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCreateCosmWasmPool): MsgCreateCosmWasmPoolAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/create-cosm-wasm-pool",
      value: MsgCreateCosmWasmPool.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCreateCosmWasmPoolProtoMsg): MsgCreateCosmWasmPool {
    return MsgCreateCosmWasmPool.decode(message.value);
  },
  toProto(message: MsgCreateCosmWasmPool): Uint8Array {
    return MsgCreateCosmWasmPool.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateCosmWasmPool): MsgCreateCosmWasmPoolProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.MsgCreateCosmWasmPool",
      value: MsgCreateCosmWasmPool.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateCosmWasmPoolResponse(): MsgCreateCosmWasmPoolResponse {
  return {
    poolId: Long.UZERO,
  };
}
export const MsgCreateCosmWasmPoolResponse = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.MsgCreateCosmWasmPoolResponse",
  encode(
    message: MsgCreateCosmWasmPoolResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.poolId.isZero()) {
      writer.uint32(8).uint64(message.poolId);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgCreateCosmWasmPoolResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateCosmWasmPoolResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgCreateCosmWasmPoolResponse>
  ): MsgCreateCosmWasmPoolResponse {
    const message = createBaseMsgCreateCosmWasmPoolResponse();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: MsgCreateCosmWasmPoolResponseAmino
  ): MsgCreateCosmWasmPoolResponse {
    return {
      poolId: Long.fromString(object.pool_id),
    };
  },
  toAmino(
    message: MsgCreateCosmWasmPoolResponse
  ): MsgCreateCosmWasmPoolResponseAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgCreateCosmWasmPoolResponseAminoMsg
  ): MsgCreateCosmWasmPoolResponse {
    return MsgCreateCosmWasmPoolResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgCreateCosmWasmPoolResponse
  ): MsgCreateCosmWasmPoolResponseAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/create-cosm-wasm-pool-response",
      value: MsgCreateCosmWasmPoolResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgCreateCosmWasmPoolResponseProtoMsg
  ): MsgCreateCosmWasmPoolResponse {
    return MsgCreateCosmWasmPoolResponse.decode(message.value);
  },
  toProto(message: MsgCreateCosmWasmPoolResponse): Uint8Array {
    return MsgCreateCosmWasmPoolResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCreateCosmWasmPoolResponse
  ): MsgCreateCosmWasmPoolResponseProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.MsgCreateCosmWasmPoolResponse",
      value: MsgCreateCosmWasmPoolResponse.encode(message).finish(),
    };
  },
};
