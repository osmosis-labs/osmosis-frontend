//@ts-nocheck
/* eslint-disable */
import {
  SwapAmountInRoute,
  SwapAmountInRouteAmino,
  SwapAmountInRouteSDKType,
  SwapAmountOutRoute,
  SwapAmountOutRouteAmino,
  SwapAmountOutRouteSDKType,
} from "./swap_route";
import {
  Coin,
  CoinAmino,
  CoinSDKType,
} from "../../../cosmos/base/v1beta1/coin";
import * as _m0 from "protobufjs/minimal";
/** ===================== MsgSwapExactAmountIn */
export interface MsgSwapExactAmountIn {
  sender: string;
  routes: SwapAmountInRoute[];
  tokenIn?: Coin;
  tokenOutMinAmount: string;
}
export interface MsgSwapExactAmountInProtoMsg {
  typeUrl: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn";
  value: Uint8Array;
}
/** ===================== MsgSwapExactAmountIn */
export interface MsgSwapExactAmountInAmino {
  sender: string;
  routes: SwapAmountInRouteAmino[];
  token_in?: CoinAmino;
  token_out_min_amount: string;
}
export interface MsgSwapExactAmountInAminoMsg {
  type: "osmosis/poolmanager/swap-exact-amount-in";
  value: MsgSwapExactAmountInAmino;
}
/** ===================== MsgSwapExactAmountIn */
export interface MsgSwapExactAmountInSDKType {
  sender: string;
  routes: SwapAmountInRouteSDKType[];
  token_in?: CoinSDKType;
  token_out_min_amount: string;
}
export interface MsgSwapExactAmountInResponse {
  tokenOutAmount: string;
}
export interface MsgSwapExactAmountInResponseProtoMsg {
  typeUrl: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountInResponse";
  value: Uint8Array;
}
export interface MsgSwapExactAmountInResponseAmino {
  token_out_amount: string;
}
export interface MsgSwapExactAmountInResponseAminoMsg {
  type: "osmosis/poolmanager/swap-exact-amount-in-response";
  value: MsgSwapExactAmountInResponseAmino;
}
export interface MsgSwapExactAmountInResponseSDKType {
  token_out_amount: string;
}
/** ===================== MsgSwapExactAmountOut */
export interface MsgSwapExactAmountOut {
  sender: string;
  routes: SwapAmountOutRoute[];
  tokenInMaxAmount: string;
  tokenOut?: Coin;
}
export interface MsgSwapExactAmountOutProtoMsg {
  typeUrl: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut";
  value: Uint8Array;
}
/** ===================== MsgSwapExactAmountOut */
export interface MsgSwapExactAmountOutAmino {
  sender: string;
  routes: SwapAmountOutRouteAmino[];
  token_in_max_amount: string;
  token_out?: CoinAmino;
}
export interface MsgSwapExactAmountOutAminoMsg {
  type: "osmosis/poolmanager/swap-exact-amount-out";
  value: MsgSwapExactAmountOutAmino;
}
/** ===================== MsgSwapExactAmountOut */
export interface MsgSwapExactAmountOutSDKType {
  sender: string;
  routes: SwapAmountOutRouteSDKType[];
  token_in_max_amount: string;
  token_out?: CoinSDKType;
}
export interface MsgSwapExactAmountOutResponse {
  tokenInAmount: string;
}
export interface MsgSwapExactAmountOutResponseProtoMsg {
  typeUrl: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountOutResponse";
  value: Uint8Array;
}
export interface MsgSwapExactAmountOutResponseAmino {
  token_in_amount: string;
}
export interface MsgSwapExactAmountOutResponseAminoMsg {
  type: "osmosis/poolmanager/swap-exact-amount-out-response";
  value: MsgSwapExactAmountOutResponseAmino;
}
export interface MsgSwapExactAmountOutResponseSDKType {
  token_in_amount: string;
}
function createBaseMsgSwapExactAmountIn(): MsgSwapExactAmountIn {
  return {
    sender: "",
    routes: [],
    tokenIn: undefined,
    tokenOutMinAmount: "",
  };
}
export const MsgSwapExactAmountIn = {
  typeUrl: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn",
  encode(
    message: MsgSwapExactAmountIn,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    for (const v of message.routes) {
      SwapAmountInRoute.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.tokenIn !== undefined) {
      Coin.encode(message.tokenIn, writer.uint32(26).fork()).ldelim();
    }
    if (message.tokenOutMinAmount !== "") {
      writer.uint32(34).string(message.tokenOutMinAmount);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSwapExactAmountIn {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSwapExactAmountIn();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.routes.push(
            SwapAmountInRoute.decode(reader, reader.uint32())
          );
          break;
        case 3:
          message.tokenIn = Coin.decode(reader, reader.uint32());
          break;
        case 4:
          message.tokenOutMinAmount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSwapExactAmountIn>): MsgSwapExactAmountIn {
    const message = createBaseMsgSwapExactAmountIn();
    message.sender = object.sender ?? "";
    message.routes =
      object.routes?.map((e) => SwapAmountInRoute.fromPartial(e)) || [];
    message.tokenIn =
      object.tokenIn !== undefined && object.tokenIn !== null
        ? Coin.fromPartial(object.tokenIn)
        : undefined;
    message.tokenOutMinAmount = object.tokenOutMinAmount ?? "";
    return message;
  },
  fromAmino(object: MsgSwapExactAmountInAmino): MsgSwapExactAmountIn {
    return {
      sender: object.sender,
      routes: Array.isArray(object?.routes)
        ? object.routes.map((e: any) => SwapAmountInRoute.fromAmino(e))
        : [],
      tokenIn: object?.token_in ? Coin.fromAmino(object.token_in) : undefined,
      tokenOutMinAmount: object.token_out_min_amount,
    };
  },
  toAmino(message: MsgSwapExactAmountIn): MsgSwapExactAmountInAmino {
    const obj: any = {};
    obj.sender = message.sender;
    if (message.routes) {
      obj.routes = message.routes.map((e) =>
        e ? SwapAmountInRoute.toAmino(e) : undefined
      );
    } else {
      obj.routes = [];
    }
    obj.token_in = message.tokenIn ? Coin.toAmino(message.tokenIn) : undefined;
    obj.token_out_min_amount = message.tokenOutMinAmount;
    return obj;
  },
  fromAminoMsg(object: MsgSwapExactAmountInAminoMsg): MsgSwapExactAmountIn {
    return MsgSwapExactAmountIn.fromAmino(object.value);
  },
  toAminoMsg(message: MsgSwapExactAmountIn): MsgSwapExactAmountInAminoMsg {
    return {
      type: "osmosis/poolmanager/swap-exact-amount-in",
      value: MsgSwapExactAmountIn.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgSwapExactAmountInProtoMsg): MsgSwapExactAmountIn {
    return MsgSwapExactAmountIn.decode(message.value);
  },
  toProto(message: MsgSwapExactAmountIn): Uint8Array {
    return MsgSwapExactAmountIn.encode(message).finish();
  },
  toProtoMsg(message: MsgSwapExactAmountIn): MsgSwapExactAmountInProtoMsg {
    return {
      typeUrl: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountIn",
      value: MsgSwapExactAmountIn.encode(message).finish(),
    };
  },
};
function createBaseMsgSwapExactAmountInResponse(): MsgSwapExactAmountInResponse {
  return {
    tokenOutAmount: "",
  };
}
export const MsgSwapExactAmountInResponse = {
  typeUrl: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountInResponse",
  encode(
    message: MsgSwapExactAmountInResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.tokenOutAmount !== "") {
      writer.uint32(10).string(message.tokenOutAmount);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSwapExactAmountInResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSwapExactAmountInResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.tokenOutAmount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgSwapExactAmountInResponse>
  ): MsgSwapExactAmountInResponse {
    const message = createBaseMsgSwapExactAmountInResponse();
    message.tokenOutAmount = object.tokenOutAmount ?? "";
    return message;
  },
  fromAmino(
    object: MsgSwapExactAmountInResponseAmino
  ): MsgSwapExactAmountInResponse {
    return {
      tokenOutAmount: object.token_out_amount,
    };
  },
  toAmino(
    message: MsgSwapExactAmountInResponse
  ): MsgSwapExactAmountInResponseAmino {
    const obj: any = {};
    obj.token_out_amount = message.tokenOutAmount;
    return obj;
  },
  fromAminoMsg(
    object: MsgSwapExactAmountInResponseAminoMsg
  ): MsgSwapExactAmountInResponse {
    return MsgSwapExactAmountInResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSwapExactAmountInResponse
  ): MsgSwapExactAmountInResponseAminoMsg {
    return {
      type: "osmosis/poolmanager/swap-exact-amount-in-response",
      value: MsgSwapExactAmountInResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSwapExactAmountInResponseProtoMsg
  ): MsgSwapExactAmountInResponse {
    return MsgSwapExactAmountInResponse.decode(message.value);
  },
  toProto(message: MsgSwapExactAmountInResponse): Uint8Array {
    return MsgSwapExactAmountInResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSwapExactAmountInResponse
  ): MsgSwapExactAmountInResponseProtoMsg {
    return {
      typeUrl: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountInResponse",
      value: MsgSwapExactAmountInResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgSwapExactAmountOut(): MsgSwapExactAmountOut {
  return {
    sender: "",
    routes: [],
    tokenInMaxAmount: "",
    tokenOut: undefined,
  };
}
export const MsgSwapExactAmountOut = {
  typeUrl: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut",
  encode(
    message: MsgSwapExactAmountOut,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    for (const v of message.routes) {
      SwapAmountOutRoute.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.tokenInMaxAmount !== "") {
      writer.uint32(26).string(message.tokenInMaxAmount);
    }
    if (message.tokenOut !== undefined) {
      Coin.encode(message.tokenOut, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSwapExactAmountOut {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSwapExactAmountOut();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.routes.push(
            SwapAmountOutRoute.decode(reader, reader.uint32())
          );
          break;
        case 3:
          message.tokenInMaxAmount = reader.string();
          break;
        case 4:
          message.tokenOut = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgSwapExactAmountOut>): MsgSwapExactAmountOut {
    const message = createBaseMsgSwapExactAmountOut();
    message.sender = object.sender ?? "";
    message.routes =
      object.routes?.map((e) => SwapAmountOutRoute.fromPartial(e)) || [];
    message.tokenInMaxAmount = object.tokenInMaxAmount ?? "";
    message.tokenOut =
      object.tokenOut !== undefined && object.tokenOut !== null
        ? Coin.fromPartial(object.tokenOut)
        : undefined;
    return message;
  },
  fromAmino(object: MsgSwapExactAmountOutAmino): MsgSwapExactAmountOut {
    return {
      sender: object.sender,
      routes: Array.isArray(object?.routes)
        ? object.routes.map((e: any) => SwapAmountOutRoute.fromAmino(e))
        : [],
      tokenInMaxAmount: object.token_in_max_amount,
      tokenOut: object?.token_out
        ? Coin.fromAmino(object.token_out)
        : undefined,
    };
  },
  toAmino(message: MsgSwapExactAmountOut): MsgSwapExactAmountOutAmino {
    const obj: any = {};
    obj.sender = message.sender;
    if (message.routes) {
      obj.routes = message.routes.map((e) =>
        e ? SwapAmountOutRoute.toAmino(e) : undefined
      );
    } else {
      obj.routes = [];
    }
    obj.token_in_max_amount = message.tokenInMaxAmount;
    obj.token_out = message.tokenOut
      ? Coin.toAmino(message.tokenOut)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: MsgSwapExactAmountOutAminoMsg): MsgSwapExactAmountOut {
    return MsgSwapExactAmountOut.fromAmino(object.value);
  },
  toAminoMsg(message: MsgSwapExactAmountOut): MsgSwapExactAmountOutAminoMsg {
    return {
      type: "osmosis/poolmanager/swap-exact-amount-out",
      value: MsgSwapExactAmountOut.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgSwapExactAmountOutProtoMsg): MsgSwapExactAmountOut {
    return MsgSwapExactAmountOut.decode(message.value);
  },
  toProto(message: MsgSwapExactAmountOut): Uint8Array {
    return MsgSwapExactAmountOut.encode(message).finish();
  },
  toProtoMsg(message: MsgSwapExactAmountOut): MsgSwapExactAmountOutProtoMsg {
    return {
      typeUrl: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountOut",
      value: MsgSwapExactAmountOut.encode(message).finish(),
    };
  },
};
function createBaseMsgSwapExactAmountOutResponse(): MsgSwapExactAmountOutResponse {
  return {
    tokenInAmount: "",
  };
}
export const MsgSwapExactAmountOutResponse = {
  typeUrl: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountOutResponse",
  encode(
    message: MsgSwapExactAmountOutResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.tokenInAmount !== "") {
      writer.uint32(10).string(message.tokenInAmount);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgSwapExactAmountOutResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSwapExactAmountOutResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.tokenInAmount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgSwapExactAmountOutResponse>
  ): MsgSwapExactAmountOutResponse {
    const message = createBaseMsgSwapExactAmountOutResponse();
    message.tokenInAmount = object.tokenInAmount ?? "";
    return message;
  },
  fromAmino(
    object: MsgSwapExactAmountOutResponseAmino
  ): MsgSwapExactAmountOutResponse {
    return {
      tokenInAmount: object.token_in_amount,
    };
  },
  toAmino(
    message: MsgSwapExactAmountOutResponse
  ): MsgSwapExactAmountOutResponseAmino {
    const obj: any = {};
    obj.token_in_amount = message.tokenInAmount;
    return obj;
  },
  fromAminoMsg(
    object: MsgSwapExactAmountOutResponseAminoMsg
  ): MsgSwapExactAmountOutResponse {
    return MsgSwapExactAmountOutResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSwapExactAmountOutResponse
  ): MsgSwapExactAmountOutResponseAminoMsg {
    return {
      type: "osmosis/poolmanager/swap-exact-amount-out-response",
      value: MsgSwapExactAmountOutResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSwapExactAmountOutResponseProtoMsg
  ): MsgSwapExactAmountOutResponse {
    return MsgSwapExactAmountOutResponse.decode(message.value);
  },
  toProto(message: MsgSwapExactAmountOutResponse): Uint8Array {
    return MsgSwapExactAmountOutResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSwapExactAmountOutResponse
  ): MsgSwapExactAmountOutResponseProtoMsg {
    return {
      typeUrl: "/osmosis.poolmanager.v1beta1.MsgSwapExactAmountOutResponse",
      value: MsgSwapExactAmountOutResponse.encode(message).finish(),
    };
  },
};
