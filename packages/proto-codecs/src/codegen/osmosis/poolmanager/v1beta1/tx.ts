//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../../binary";
import {
  Coin,
  CoinAmino,
  CoinSDKType,
} from "../../../cosmos/base/v1beta1/coin";
import {
  SwapAmountInRoute,
  SwapAmountInRouteAmino,
  SwapAmountInRouteSDKType,
  SwapAmountInSplitRoute,
  SwapAmountInSplitRouteAmino,
  SwapAmountInSplitRouteSDKType,
  SwapAmountOutRoute,
  SwapAmountOutRouteAmino,
  SwapAmountOutRouteSDKType,
  SwapAmountOutSplitRoute,
  SwapAmountOutSplitRouteAmino,
  SwapAmountOutSplitRouteSDKType,
} from "./swap_route";
/** ===================== MsgSwapExactAmountIn */
export interface MsgSwapExactAmountIn {
  sender: string;
  routes: SwapAmountInRoute[];
  tokenIn: Coin;
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
  token_in: CoinSDKType;
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
/** ===================== MsgSplitRouteSwapExactAmountIn */
export interface MsgSplitRouteSwapExactAmountIn {
  sender: string;
  routes: SwapAmountInSplitRoute[];
  tokenInDenom: string;
  tokenOutMinAmount: string;
}
export interface MsgSplitRouteSwapExactAmountInProtoMsg {
  typeUrl: "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn";
  value: Uint8Array;
}
/** ===================== MsgSplitRouteSwapExactAmountIn */
export interface MsgSplitRouteSwapExactAmountInAmino {
  sender: string;
  routes: SwapAmountInSplitRouteAmino[];
  token_in_denom: string;
  token_out_min_amount: string;
}
export interface MsgSplitRouteSwapExactAmountInAminoMsg {
  type: "osmosis/poolmanager/split-amount-in";
  value: MsgSplitRouteSwapExactAmountInAmino;
}
/** ===================== MsgSplitRouteSwapExactAmountIn */
export interface MsgSplitRouteSwapExactAmountInSDKType {
  sender: string;
  routes: SwapAmountInSplitRouteSDKType[];
  token_in_denom: string;
  token_out_min_amount: string;
}
export interface MsgSplitRouteSwapExactAmountInResponse {
  tokenOutAmount: string;
}
export interface MsgSplitRouteSwapExactAmountInResponseProtoMsg {
  typeUrl: "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountInResponse";
  value: Uint8Array;
}
export interface MsgSplitRouteSwapExactAmountInResponseAmino {
  token_out_amount: string;
}
export interface MsgSplitRouteSwapExactAmountInResponseAminoMsg {
  type: "osmosis/poolmanager/split-route-swap-exact-amount-in-response";
  value: MsgSplitRouteSwapExactAmountInResponseAmino;
}
export interface MsgSplitRouteSwapExactAmountInResponseSDKType {
  token_out_amount: string;
}
/** ===================== MsgSwapExactAmountOut */
export interface MsgSwapExactAmountOut {
  sender: string;
  routes: SwapAmountOutRoute[];
  tokenInMaxAmount: string;
  tokenOut: Coin;
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
  token_out: CoinSDKType;
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
/** ===================== MsgSplitRouteSwapExactAmountOut */
export interface MsgSplitRouteSwapExactAmountOut {
  sender: string;
  routes: SwapAmountOutSplitRoute[];
  tokenOutDenom: string;
  tokenInMaxAmount: string;
}
export interface MsgSplitRouteSwapExactAmountOutProtoMsg {
  typeUrl: "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOut";
  value: Uint8Array;
}
/** ===================== MsgSplitRouteSwapExactAmountOut */
export interface MsgSplitRouteSwapExactAmountOutAmino {
  sender: string;
  routes: SwapAmountOutSplitRouteAmino[];
  token_out_denom: string;
  token_in_max_amount: string;
}
export interface MsgSplitRouteSwapExactAmountOutAminoMsg {
  type: "osmosis/poolmanager/split-amount-out";
  value: MsgSplitRouteSwapExactAmountOutAmino;
}
/** ===================== MsgSplitRouteSwapExactAmountOut */
export interface MsgSplitRouteSwapExactAmountOutSDKType {
  sender: string;
  routes: SwapAmountOutSplitRouteSDKType[];
  token_out_denom: string;
  token_in_max_amount: string;
}
export interface MsgSplitRouteSwapExactAmountOutResponse {
  tokenInAmount: string;
}
export interface MsgSplitRouteSwapExactAmountOutResponseProtoMsg {
  typeUrl: "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOutResponse";
  value: Uint8Array;
}
export interface MsgSplitRouteSwapExactAmountOutResponseAmino {
  token_in_amount: string;
}
export interface MsgSplitRouteSwapExactAmountOutResponseAminoMsg {
  type: "osmosis/poolmanager/split-route-swap-exact-amount-out-response";
  value: MsgSplitRouteSwapExactAmountOutResponseAmino;
}
export interface MsgSplitRouteSwapExactAmountOutResponseSDKType {
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
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
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
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgSwapExactAmountIn {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
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
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.tokenOutAmount !== "") {
      writer.uint32(10).string(message.tokenOutAmount);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgSwapExactAmountInResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
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
function createBaseMsgSplitRouteSwapExactAmountIn(): MsgSplitRouteSwapExactAmountIn {
  return {
    sender: "",
    routes: [],
    tokenInDenom: "",
    tokenOutMinAmount: "",
  };
}
export const MsgSplitRouteSwapExactAmountIn = {
  typeUrl: "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn",
  encode(
    message: MsgSplitRouteSwapExactAmountIn,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    for (const v of message.routes) {
      SwapAmountInSplitRoute.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.tokenInDenom !== "") {
      writer.uint32(26).string(message.tokenInDenom);
    }
    if (message.tokenOutMinAmount !== "") {
      writer.uint32(34).string(message.tokenOutMinAmount);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgSplitRouteSwapExactAmountIn {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSplitRouteSwapExactAmountIn();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.routes.push(
            SwapAmountInSplitRoute.decode(reader, reader.uint32())
          );
          break;
        case 3:
          message.tokenInDenom = reader.string();
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
  fromPartial(
    object: Partial<MsgSplitRouteSwapExactAmountIn>
  ): MsgSplitRouteSwapExactAmountIn {
    const message = createBaseMsgSplitRouteSwapExactAmountIn();
    message.sender = object.sender ?? "";
    message.routes =
      object.routes?.map((e) => SwapAmountInSplitRoute.fromPartial(e)) || [];
    message.tokenInDenom = object.tokenInDenom ?? "";
    message.tokenOutMinAmount = object.tokenOutMinAmount ?? "";
    return message;
  },
  fromAmino(
    object: MsgSplitRouteSwapExactAmountInAmino
  ): MsgSplitRouteSwapExactAmountIn {
    return {
      sender: object.sender,
      routes: Array.isArray(object?.routes)
        ? object.routes.map((e: any) => SwapAmountInSplitRoute.fromAmino(e))
        : [],
      tokenInDenom: object.token_in_denom,
      tokenOutMinAmount: object.token_out_min_amount,
    };
  },
  toAmino(
    message: MsgSplitRouteSwapExactAmountIn
  ): MsgSplitRouteSwapExactAmountInAmino {
    const obj: any = {};
    obj.sender = message.sender;
    if (message.routes) {
      obj.routes = message.routes.map((e) =>
        e ? SwapAmountInSplitRoute.toAmino(e) : undefined
      );
    } else {
      obj.routes = [];
    }
    obj.token_in_denom = message.tokenInDenom;
    obj.token_out_min_amount = message.tokenOutMinAmount;
    return obj;
  },
  fromAminoMsg(
    object: MsgSplitRouteSwapExactAmountInAminoMsg
  ): MsgSplitRouteSwapExactAmountIn {
    return MsgSplitRouteSwapExactAmountIn.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSplitRouteSwapExactAmountIn
  ): MsgSplitRouteSwapExactAmountInAminoMsg {
    return {
      type: "osmosis/poolmanager/split-amount-in",
      value: MsgSplitRouteSwapExactAmountIn.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSplitRouteSwapExactAmountInProtoMsg
  ): MsgSplitRouteSwapExactAmountIn {
    return MsgSplitRouteSwapExactAmountIn.decode(message.value);
  },
  toProto(message: MsgSplitRouteSwapExactAmountIn): Uint8Array {
    return MsgSplitRouteSwapExactAmountIn.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSplitRouteSwapExactAmountIn
  ): MsgSplitRouteSwapExactAmountInProtoMsg {
    return {
      typeUrl: "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountIn",
      value: MsgSplitRouteSwapExactAmountIn.encode(message).finish(),
    };
  },
};
function createBaseMsgSplitRouteSwapExactAmountInResponse(): MsgSplitRouteSwapExactAmountInResponse {
  return {
    tokenOutAmount: "",
  };
}
export const MsgSplitRouteSwapExactAmountInResponse = {
  typeUrl:
    "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountInResponse",
  encode(
    message: MsgSplitRouteSwapExactAmountInResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.tokenOutAmount !== "") {
      writer.uint32(10).string(message.tokenOutAmount);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgSplitRouteSwapExactAmountInResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSplitRouteSwapExactAmountInResponse();
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
    object: Partial<MsgSplitRouteSwapExactAmountInResponse>
  ): MsgSplitRouteSwapExactAmountInResponse {
    const message = createBaseMsgSplitRouteSwapExactAmountInResponse();
    message.tokenOutAmount = object.tokenOutAmount ?? "";
    return message;
  },
  fromAmino(
    object: MsgSplitRouteSwapExactAmountInResponseAmino
  ): MsgSplitRouteSwapExactAmountInResponse {
    return {
      tokenOutAmount: object.token_out_amount,
    };
  },
  toAmino(
    message: MsgSplitRouteSwapExactAmountInResponse
  ): MsgSplitRouteSwapExactAmountInResponseAmino {
    const obj: any = {};
    obj.token_out_amount = message.tokenOutAmount;
    return obj;
  },
  fromAminoMsg(
    object: MsgSplitRouteSwapExactAmountInResponseAminoMsg
  ): MsgSplitRouteSwapExactAmountInResponse {
    return MsgSplitRouteSwapExactAmountInResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSplitRouteSwapExactAmountInResponse
  ): MsgSplitRouteSwapExactAmountInResponseAminoMsg {
    return {
      type: "osmosis/poolmanager/split-route-swap-exact-amount-in-response",
      value: MsgSplitRouteSwapExactAmountInResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSplitRouteSwapExactAmountInResponseProtoMsg
  ): MsgSplitRouteSwapExactAmountInResponse {
    return MsgSplitRouteSwapExactAmountInResponse.decode(message.value);
  },
  toProto(message: MsgSplitRouteSwapExactAmountInResponse): Uint8Array {
    return MsgSplitRouteSwapExactAmountInResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSplitRouteSwapExactAmountInResponse
  ): MsgSplitRouteSwapExactAmountInResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountInResponse",
      value: MsgSplitRouteSwapExactAmountInResponse.encode(message).finish(),
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
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
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
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgSwapExactAmountOut {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
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
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.tokenInAmount !== "") {
      writer.uint32(10).string(message.tokenInAmount);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgSwapExactAmountOutResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
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
function createBaseMsgSplitRouteSwapExactAmountOut(): MsgSplitRouteSwapExactAmountOut {
  return {
    sender: "",
    routes: [],
    tokenOutDenom: "",
    tokenInMaxAmount: "",
  };
}
export const MsgSplitRouteSwapExactAmountOut = {
  typeUrl: "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOut",
  encode(
    message: MsgSplitRouteSwapExactAmountOut,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    for (const v of message.routes) {
      SwapAmountOutSplitRoute.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.tokenOutDenom !== "") {
      writer.uint32(26).string(message.tokenOutDenom);
    }
    if (message.tokenInMaxAmount !== "") {
      writer.uint32(34).string(message.tokenInMaxAmount);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgSplitRouteSwapExactAmountOut {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSplitRouteSwapExactAmountOut();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.routes.push(
            SwapAmountOutSplitRoute.decode(reader, reader.uint32())
          );
          break;
        case 3:
          message.tokenOutDenom = reader.string();
          break;
        case 4:
          message.tokenInMaxAmount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgSplitRouteSwapExactAmountOut>
  ): MsgSplitRouteSwapExactAmountOut {
    const message = createBaseMsgSplitRouteSwapExactAmountOut();
    message.sender = object.sender ?? "";
    message.routes =
      object.routes?.map((e) => SwapAmountOutSplitRoute.fromPartial(e)) || [];
    message.tokenOutDenom = object.tokenOutDenom ?? "";
    message.tokenInMaxAmount = object.tokenInMaxAmount ?? "";
    return message;
  },
  fromAmino(
    object: MsgSplitRouteSwapExactAmountOutAmino
  ): MsgSplitRouteSwapExactAmountOut {
    return {
      sender: object.sender,
      routes: Array.isArray(object?.routes)
        ? object.routes.map((e: any) => SwapAmountOutSplitRoute.fromAmino(e))
        : [],
      tokenOutDenom: object.token_out_denom,
      tokenInMaxAmount: object.token_in_max_amount,
    };
  },
  toAmino(
    message: MsgSplitRouteSwapExactAmountOut
  ): MsgSplitRouteSwapExactAmountOutAmino {
    const obj: any = {};
    obj.sender = message.sender;
    if (message.routes) {
      obj.routes = message.routes.map((e) =>
        e ? SwapAmountOutSplitRoute.toAmino(e) : undefined
      );
    } else {
      obj.routes = [];
    }
    obj.token_out_denom = message.tokenOutDenom;
    obj.token_in_max_amount = message.tokenInMaxAmount;
    return obj;
  },
  fromAminoMsg(
    object: MsgSplitRouteSwapExactAmountOutAminoMsg
  ): MsgSplitRouteSwapExactAmountOut {
    return MsgSplitRouteSwapExactAmountOut.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSplitRouteSwapExactAmountOut
  ): MsgSplitRouteSwapExactAmountOutAminoMsg {
    return {
      type: "osmosis/poolmanager/split-amount-out",
      value: MsgSplitRouteSwapExactAmountOut.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSplitRouteSwapExactAmountOutProtoMsg
  ): MsgSplitRouteSwapExactAmountOut {
    return MsgSplitRouteSwapExactAmountOut.decode(message.value);
  },
  toProto(message: MsgSplitRouteSwapExactAmountOut): Uint8Array {
    return MsgSplitRouteSwapExactAmountOut.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSplitRouteSwapExactAmountOut
  ): MsgSplitRouteSwapExactAmountOutProtoMsg {
    return {
      typeUrl: "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOut",
      value: MsgSplitRouteSwapExactAmountOut.encode(message).finish(),
    };
  },
};
function createBaseMsgSplitRouteSwapExactAmountOutResponse(): MsgSplitRouteSwapExactAmountOutResponse {
  return {
    tokenInAmount: "",
  };
}
export const MsgSplitRouteSwapExactAmountOutResponse = {
  typeUrl:
    "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOutResponse",
  encode(
    message: MsgSplitRouteSwapExactAmountOutResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.tokenInAmount !== "") {
      writer.uint32(10).string(message.tokenInAmount);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgSplitRouteSwapExactAmountOutResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSplitRouteSwapExactAmountOutResponse();
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
    object: Partial<MsgSplitRouteSwapExactAmountOutResponse>
  ): MsgSplitRouteSwapExactAmountOutResponse {
    const message = createBaseMsgSplitRouteSwapExactAmountOutResponse();
    message.tokenInAmount = object.tokenInAmount ?? "";
    return message;
  },
  fromAmino(
    object: MsgSplitRouteSwapExactAmountOutResponseAmino
  ): MsgSplitRouteSwapExactAmountOutResponse {
    return {
      tokenInAmount: object.token_in_amount,
    };
  },
  toAmino(
    message: MsgSplitRouteSwapExactAmountOutResponse
  ): MsgSplitRouteSwapExactAmountOutResponseAmino {
    const obj: any = {};
    obj.token_in_amount = message.tokenInAmount;
    return obj;
  },
  fromAminoMsg(
    object: MsgSplitRouteSwapExactAmountOutResponseAminoMsg
  ): MsgSplitRouteSwapExactAmountOutResponse {
    return MsgSplitRouteSwapExactAmountOutResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgSplitRouteSwapExactAmountOutResponse
  ): MsgSplitRouteSwapExactAmountOutResponseAminoMsg {
    return {
      type: "osmosis/poolmanager/split-route-swap-exact-amount-out-response",
      value: MsgSplitRouteSwapExactAmountOutResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgSplitRouteSwapExactAmountOutResponseProtoMsg
  ): MsgSplitRouteSwapExactAmountOutResponse {
    return MsgSplitRouteSwapExactAmountOutResponse.decode(message.value);
  },
  toProto(message: MsgSplitRouteSwapExactAmountOutResponse): Uint8Array {
    return MsgSplitRouteSwapExactAmountOutResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgSplitRouteSwapExactAmountOutResponse
  ): MsgSplitRouteSwapExactAmountOutResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.poolmanager.v1beta1.MsgSplitRouteSwapExactAmountOutResponse",
      value: MsgSplitRouteSwapExactAmountOutResponse.encode(message).finish(),
    };
  },
};
