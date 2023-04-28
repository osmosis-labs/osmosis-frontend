//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import { Long } from "../../../helpers";
/** ===================== MsgCreateConcentratedPool */
export interface MsgCreateConcentratedPool {
  sender: string;
  denom0: string;
  denom1: string;
  tickSpacing: Long;
  exponentAtPriceOne: string;
  swapFee: string;
}
export interface MsgCreateConcentratedPoolProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCreateConcentratedPool";
  value: Uint8Array;
}
/** ===================== MsgCreateConcentratedPool */
export interface MsgCreateConcentratedPoolAmino {
  sender: string;
  denom0: string;
  denom1: string;
  tick_spacing: string;
  exponent_at_price_one: string;
  swap_fee: string;
}
export interface MsgCreateConcentratedPoolAminoMsg {
  type: "osmosis/concentratedliquidity/create-concentrated-pool";
  value: MsgCreateConcentratedPoolAmino;
}
/** ===================== MsgCreateConcentratedPool */
export interface MsgCreateConcentratedPoolSDKType {
  sender: string;
  denom0: string;
  denom1: string;
  tick_spacing: Long;
  exponent_at_price_one: string;
  swap_fee: string;
}
/** Returns a unique poolID to identify the pool with. */
export interface MsgCreateConcentratedPoolResponse {
  poolId: Long;
}
export interface MsgCreateConcentratedPoolResponseProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCreateConcentratedPoolResponse";
  value: Uint8Array;
}
/** Returns a unique poolID to identify the pool with. */
export interface MsgCreateConcentratedPoolResponseAmino {
  pool_id: string;
}
export interface MsgCreateConcentratedPoolResponseAminoMsg {
  type: "osmosis/concentratedliquidity/create-concentrated-pool-response";
  value: MsgCreateConcentratedPoolResponseAmino;
}
/** Returns a unique poolID to identify the pool with. */
export interface MsgCreateConcentratedPoolResponseSDKType {
  pool_id: Long;
}
function createBaseMsgCreateConcentratedPool(): MsgCreateConcentratedPool {
  return {
    sender: "",
    denom0: "",
    denom1: "",
    tickSpacing: Long.UZERO,
    exponentAtPriceOne: "",
    swapFee: "",
  };
}
export const MsgCreateConcentratedPool = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.MsgCreateConcentratedPool",
  encode(
    message: MsgCreateConcentratedPool,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (message.denom0 !== "") {
      writer.uint32(18).string(message.denom0);
    }
    if (message.denom1 !== "") {
      writer.uint32(26).string(message.denom1);
    }
    if (!message.tickSpacing.isZero()) {
      writer.uint32(32).uint64(message.tickSpacing);
    }
    if (message.exponentAtPriceOne !== "") {
      writer.uint32(42).string(message.exponentAtPriceOne);
    }
    if (message.swapFee !== "") {
      writer.uint32(74).string(message.swapFee);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgCreateConcentratedPool {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateConcentratedPool();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.denom0 = reader.string();
          break;
        case 3:
          message.denom1 = reader.string();
          break;
        case 4:
          message.tickSpacing = reader.uint64() as Long;
          break;
        case 5:
          message.exponentAtPriceOne = reader.string();
          break;
        case 9:
          message.swapFee = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgCreateConcentratedPool>
  ): MsgCreateConcentratedPool {
    const message = createBaseMsgCreateConcentratedPool();
    message.sender = object.sender ?? "";
    message.denom0 = object.denom0 ?? "";
    message.denom1 = object.denom1 ?? "";
    message.tickSpacing =
      object.tickSpacing !== undefined && object.tickSpacing !== null
        ? Long.fromValue(object.tickSpacing)
        : Long.UZERO;
    message.exponentAtPriceOne = object.exponentAtPriceOne ?? "";
    message.swapFee = object.swapFee ?? "";
    return message;
  },
  fromAmino(object: MsgCreateConcentratedPoolAmino): MsgCreateConcentratedPool {
    return {
      sender: object.sender,
      denom0: object.denom0,
      denom1: object.denom1,
      tickSpacing: Long.fromString(object.tick_spacing),
      exponentAtPriceOne: object.exponent_at_price_one,
      swapFee: object.swap_fee,
    };
  },
  toAmino(message: MsgCreateConcentratedPool): MsgCreateConcentratedPoolAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.denom0 = message.denom0;
    obj.denom1 = message.denom1;
    obj.tick_spacing = message.tickSpacing
      ? message.tickSpacing.toString()
      : undefined;
    obj.exponent_at_price_one = message.exponentAtPriceOne;
    obj.swap_fee = message.swapFee;
    return obj;
  },
  fromAminoMsg(
    object: MsgCreateConcentratedPoolAminoMsg
  ): MsgCreateConcentratedPool {
    return MsgCreateConcentratedPool.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgCreateConcentratedPool
  ): MsgCreateConcentratedPoolAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/create-concentrated-pool",
      value: MsgCreateConcentratedPool.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgCreateConcentratedPoolProtoMsg
  ): MsgCreateConcentratedPool {
    return MsgCreateConcentratedPool.decode(message.value);
  },
  toProto(message: MsgCreateConcentratedPool): Uint8Array {
    return MsgCreateConcentratedPool.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCreateConcentratedPool
  ): MsgCreateConcentratedPoolProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.MsgCreateConcentratedPool",
      value: MsgCreateConcentratedPool.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateConcentratedPoolResponse(): MsgCreateConcentratedPoolResponse {
  return {
    poolId: Long.UZERO,
  };
}
export const MsgCreateConcentratedPoolResponse = {
  typeUrl:
    "/osmosis.concentratedliquidity.v1beta1.MsgCreateConcentratedPoolResponse",
  encode(
    message: MsgCreateConcentratedPoolResponse,
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
  ): MsgCreateConcentratedPoolResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateConcentratedPoolResponse();
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
    object: Partial<MsgCreateConcentratedPoolResponse>
  ): MsgCreateConcentratedPoolResponse {
    const message = createBaseMsgCreateConcentratedPoolResponse();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: MsgCreateConcentratedPoolResponseAmino
  ): MsgCreateConcentratedPoolResponse {
    return {
      poolId: Long.fromString(object.pool_id),
    };
  },
  toAmino(
    message: MsgCreateConcentratedPoolResponse
  ): MsgCreateConcentratedPoolResponseAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgCreateConcentratedPoolResponseAminoMsg
  ): MsgCreateConcentratedPoolResponse {
    return MsgCreateConcentratedPoolResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgCreateConcentratedPoolResponse
  ): MsgCreateConcentratedPoolResponseAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/create-concentrated-pool-response",
      value: MsgCreateConcentratedPoolResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgCreateConcentratedPoolResponseProtoMsg
  ): MsgCreateConcentratedPoolResponse {
    return MsgCreateConcentratedPoolResponse.decode(message.value);
  },
  toProto(message: MsgCreateConcentratedPoolResponse): Uint8Array {
    return MsgCreateConcentratedPoolResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCreateConcentratedPoolResponse
  ): MsgCreateConcentratedPoolResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.concentratedliquidity.v1beta1.MsgCreateConcentratedPoolResponse",
      value: MsgCreateConcentratedPoolResponse.encode(message).finish(),
    };
  },
};
