//@ts-nocheck
/* eslint-disable */
import {
  Coin,
  CoinAmino,
  CoinSDKType,
} from "../../../cosmos/base/v1beta1/coin";
import {
  SwapAmountInRoute,
  SwapAmountInRouteAmino,
  SwapAmountInRouteSDKType,
  SwapAmountOutRoute,
  SwapAmountOutRouteAmino,
  SwapAmountOutRouteSDKType,
} from "../../poolmanager/v1beta1/swap_route";
import { Long } from "../../../helpers";
import * as _m0 from "protobufjs/minimal";
/**
 * ===================== MsgJoinPool
 * This is really MsgJoinPoolNoSwap
 */
export interface MsgJoinPool {
  sender: string;
  poolId: Long;
  shareOutAmount: string;
  tokenInMaxs: Coin[];
}
export interface MsgJoinPoolProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.MsgJoinPool";
  value: Uint8Array;
}
/**
 * ===================== MsgJoinPool
 * This is really MsgJoinPoolNoSwap
 */
export interface MsgJoinPoolAmino {
  sender: string;
  pool_id: string;
  share_out_amount: string;
  token_in_maxs: CoinAmino[];
}
export interface MsgJoinPoolAminoMsg {
  type: "osmosis/gamm/join-pool";
  value: MsgJoinPoolAmino;
}
/**
 * ===================== MsgJoinPool
 * This is really MsgJoinPoolNoSwap
 */
export interface MsgJoinPoolSDKType {
  sender: string;
  pool_id: Long;
  share_out_amount: string;
  token_in_maxs: CoinSDKType[];
}
export interface MsgJoinPoolResponse {
  shareOutAmount: string;
  tokenIn: Coin[];
}
export interface MsgJoinPoolResponseProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.MsgJoinPoolResponse";
  value: Uint8Array;
}
export interface MsgJoinPoolResponseAmino {
  share_out_amount: string;
  token_in: CoinAmino[];
}
export interface MsgJoinPoolResponseAminoMsg {
  type: "osmosis/gamm/join-pool-response";
  value: MsgJoinPoolResponseAmino;
}
export interface MsgJoinPoolResponseSDKType {
  share_out_amount: string;
  token_in: CoinSDKType[];
}
/** ===================== MsgExitPool */
export interface MsgExitPool {
  sender: string;
  poolId: Long;
  shareInAmount: string;
  tokenOutMins: Coin[];
}
export interface MsgExitPoolProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.MsgExitPool";
  value: Uint8Array;
}
/** ===================== MsgExitPool */
export interface MsgExitPoolAmino {
  sender: string;
  pool_id: string;
  share_in_amount: string;
  token_out_mins: CoinAmino[];
}
export interface MsgExitPoolAminoMsg {
  type: "osmosis/gamm/exit-pool";
  value: MsgExitPoolAmino;
}
/** ===================== MsgExitPool */
export interface MsgExitPoolSDKType {
  sender: string;
  pool_id: Long;
  share_in_amount: string;
  token_out_mins: CoinSDKType[];
}
export interface MsgExitPoolResponse {
  tokenOut: Coin[];
}
export interface MsgExitPoolResponseProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.MsgExitPoolResponse";
  value: Uint8Array;
}
export interface MsgExitPoolResponseAmino {
  token_out: CoinAmino[];
}
export interface MsgExitPoolResponseAminoMsg {
  type: "osmosis/gamm/exit-pool-response";
  value: MsgExitPoolResponseAmino;
}
export interface MsgExitPoolResponseSDKType {
  token_out: CoinSDKType[];
}
/** ===================== MsgSwapExactAmountIn */
export interface MsgSwapExactAmountIn {
  sender: string;
  routes: SwapAmountInRoute[];
  tokenIn?: Coin;
  tokenOutMinAmount: string;
}
export interface MsgSwapExactAmountInProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountIn";
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
  type: "osmosis/gamm/swap-exact-amount-in";
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
  typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountInResponse";
  value: Uint8Array;
}
export interface MsgSwapExactAmountInResponseAmino {
  token_out_amount: string;
}
export interface MsgSwapExactAmountInResponseAminoMsg {
  type: "osmosis/gamm/swap-exact-amount-in-response";
  value: MsgSwapExactAmountInResponseAmino;
}
export interface MsgSwapExactAmountInResponseSDKType {
  token_out_amount: string;
}
export interface MsgSwapExactAmountOut {
  sender: string;
  routes: SwapAmountOutRoute[];
  tokenInMaxAmount: string;
  tokenOut?: Coin;
}
export interface MsgSwapExactAmountOutProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountOut";
  value: Uint8Array;
}
export interface MsgSwapExactAmountOutAmino {
  sender: string;
  routes: SwapAmountOutRouteAmino[];
  token_in_max_amount: string;
  token_out?: CoinAmino;
}
export interface MsgSwapExactAmountOutAminoMsg {
  type: "osmosis/gamm/swap-exact-amount-out";
  value: MsgSwapExactAmountOutAmino;
}
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
  typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountOutResponse";
  value: Uint8Array;
}
export interface MsgSwapExactAmountOutResponseAmino {
  token_in_amount: string;
}
export interface MsgSwapExactAmountOutResponseAminoMsg {
  type: "osmosis/gamm/swap-exact-amount-out-response";
  value: MsgSwapExactAmountOutResponseAmino;
}
export interface MsgSwapExactAmountOutResponseSDKType {
  token_in_amount: string;
}
/**
 * ===================== MsgJoinSwapExternAmountIn
 * TODO: Rename to MsgJoinSwapExactAmountIn
 */
export interface MsgJoinSwapExternAmountIn {
  sender: string;
  poolId: Long;
  tokenIn?: Coin;
  shareOutMinAmount: string;
}
export interface MsgJoinSwapExternAmountInProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn";
  value: Uint8Array;
}
/**
 * ===================== MsgJoinSwapExternAmountIn
 * TODO: Rename to MsgJoinSwapExactAmountIn
 */
export interface MsgJoinSwapExternAmountInAmino {
  sender: string;
  pool_id: string;
  token_in?: CoinAmino;
  share_out_min_amount: string;
}
export interface MsgJoinSwapExternAmountInAminoMsg {
  type: "osmosis/gamm/join-swap-extern-amount-in";
  value: MsgJoinSwapExternAmountInAmino;
}
/**
 * ===================== MsgJoinSwapExternAmountIn
 * TODO: Rename to MsgJoinSwapExactAmountIn
 */
export interface MsgJoinSwapExternAmountInSDKType {
  sender: string;
  pool_id: Long;
  token_in?: CoinSDKType;
  share_out_min_amount: string;
}
export interface MsgJoinSwapExternAmountInResponse {
  shareOutAmount: string;
}
export interface MsgJoinSwapExternAmountInResponseProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountInResponse";
  value: Uint8Array;
}
export interface MsgJoinSwapExternAmountInResponseAmino {
  share_out_amount: string;
}
export interface MsgJoinSwapExternAmountInResponseAminoMsg {
  type: "osmosis/gamm/join-swap-extern-amount-in-response";
  value: MsgJoinSwapExternAmountInResponseAmino;
}
export interface MsgJoinSwapExternAmountInResponseSDKType {
  share_out_amount: string;
}
/** ===================== MsgJoinSwapShareAmountOut */
export interface MsgJoinSwapShareAmountOut {
  sender: string;
  poolId: Long;
  tokenInDenom: string;
  shareOutAmount: string;
  tokenInMaxAmount: string;
}
export interface MsgJoinSwapShareAmountOutProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOut";
  value: Uint8Array;
}
/** ===================== MsgJoinSwapShareAmountOut */
export interface MsgJoinSwapShareAmountOutAmino {
  sender: string;
  pool_id: string;
  token_in_denom: string;
  share_out_amount: string;
  token_in_max_amount: string;
}
export interface MsgJoinSwapShareAmountOutAminoMsg {
  type: "osmosis/gamm/join-swap-share-amount-out";
  value: MsgJoinSwapShareAmountOutAmino;
}
/** ===================== MsgJoinSwapShareAmountOut */
export interface MsgJoinSwapShareAmountOutSDKType {
  sender: string;
  pool_id: Long;
  token_in_denom: string;
  share_out_amount: string;
  token_in_max_amount: string;
}
export interface MsgJoinSwapShareAmountOutResponse {
  tokenInAmount: string;
}
export interface MsgJoinSwapShareAmountOutResponseProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOutResponse";
  value: Uint8Array;
}
export interface MsgJoinSwapShareAmountOutResponseAmino {
  token_in_amount: string;
}
export interface MsgJoinSwapShareAmountOutResponseAminoMsg {
  type: "osmosis/gamm/join-swap-share-amount-out-response";
  value: MsgJoinSwapShareAmountOutResponseAmino;
}
export interface MsgJoinSwapShareAmountOutResponseSDKType {
  token_in_amount: string;
}
/** ===================== MsgExitSwapShareAmountIn */
export interface MsgExitSwapShareAmountIn {
  sender: string;
  poolId: Long;
  tokenOutDenom: string;
  shareInAmount: string;
  tokenOutMinAmount: string;
}
export interface MsgExitSwapShareAmountInProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.MsgExitSwapShareAmountIn";
  value: Uint8Array;
}
/** ===================== MsgExitSwapShareAmountIn */
export interface MsgExitSwapShareAmountInAmino {
  sender: string;
  pool_id: string;
  token_out_denom: string;
  share_in_amount: string;
  token_out_min_amount: string;
}
export interface MsgExitSwapShareAmountInAminoMsg {
  type: "osmosis/gamm/exit-swap-share-amount-in";
  value: MsgExitSwapShareAmountInAmino;
}
/** ===================== MsgExitSwapShareAmountIn */
export interface MsgExitSwapShareAmountInSDKType {
  sender: string;
  pool_id: Long;
  token_out_denom: string;
  share_in_amount: string;
  token_out_min_amount: string;
}
export interface MsgExitSwapShareAmountInResponse {
  tokenOutAmount: string;
}
export interface MsgExitSwapShareAmountInResponseProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.MsgExitSwapShareAmountInResponse";
  value: Uint8Array;
}
export interface MsgExitSwapShareAmountInResponseAmino {
  token_out_amount: string;
}
export interface MsgExitSwapShareAmountInResponseAminoMsg {
  type: "osmosis/gamm/exit-swap-share-amount-in-response";
  value: MsgExitSwapShareAmountInResponseAmino;
}
export interface MsgExitSwapShareAmountInResponseSDKType {
  token_out_amount: string;
}
/** ===================== MsgExitSwapExternAmountOut */
export interface MsgExitSwapExternAmountOut {
  sender: string;
  poolId: Long;
  tokenOut?: Coin;
  shareInMaxAmount: string;
}
export interface MsgExitSwapExternAmountOutProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut";
  value: Uint8Array;
}
/** ===================== MsgExitSwapExternAmountOut */
export interface MsgExitSwapExternAmountOutAmino {
  sender: string;
  pool_id: string;
  token_out?: CoinAmino;
  share_in_max_amount: string;
}
export interface MsgExitSwapExternAmountOutAminoMsg {
  type: "osmosis/gamm/exit-swap-extern-amount-out";
  value: MsgExitSwapExternAmountOutAmino;
}
/** ===================== MsgExitSwapExternAmountOut */
export interface MsgExitSwapExternAmountOutSDKType {
  sender: string;
  pool_id: Long;
  token_out?: CoinSDKType;
  share_in_max_amount: string;
}
export interface MsgExitSwapExternAmountOutResponse {
  shareInAmount: string;
}
export interface MsgExitSwapExternAmountOutResponseProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.MsgExitSwapExternAmountOutResponse";
  value: Uint8Array;
}
export interface MsgExitSwapExternAmountOutResponseAmino {
  share_in_amount: string;
}
export interface MsgExitSwapExternAmountOutResponseAminoMsg {
  type: "osmosis/gamm/exit-swap-extern-amount-out-response";
  value: MsgExitSwapExternAmountOutResponseAmino;
}
export interface MsgExitSwapExternAmountOutResponseSDKType {
  share_in_amount: string;
}
function createBaseMsgJoinPool(): MsgJoinPool {
  return {
    sender: "",
    poolId: Long.UZERO,
    shareOutAmount: "",
    tokenInMaxs: [],
  };
}
export const MsgJoinPool = {
  typeUrl: "/osmosis.gamm.v1beta1.MsgJoinPool",
  encode(
    message: MsgJoinPool,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (!message.poolId.isZero()) {
      writer.uint32(16).uint64(message.poolId);
    }
    if (message.shareOutAmount !== "") {
      writer.uint32(26).string(message.shareOutAmount);
    }
    for (const v of message.tokenInMaxs) {
      Coin.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgJoinPool {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgJoinPool();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.poolId = reader.uint64() as Long;
          break;
        case 3:
          message.shareOutAmount = reader.string();
          break;
        case 4:
          message.tokenInMaxs.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgJoinPool>): MsgJoinPool {
    const message = createBaseMsgJoinPool();
    message.sender = object.sender ?? "";
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.shareOutAmount = object.shareOutAmount ?? "";
    message.tokenInMaxs =
      object.tokenInMaxs?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgJoinPoolAmino): MsgJoinPool {
    return {
      sender: object.sender,
      poolId: Long.fromString(object.pool_id),
      shareOutAmount: object.share_out_amount,
      tokenInMaxs: Array.isArray(object?.token_in_maxs)
        ? object.token_in_maxs.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(message: MsgJoinPool): MsgJoinPoolAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.share_out_amount = message.shareOutAmount;
    if (message.tokenInMaxs) {
      obj.token_in_maxs = message.tokenInMaxs.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.token_in_maxs = [];
    }
    return obj;
  },
  fromAminoMsg(object: MsgJoinPoolAminoMsg): MsgJoinPool {
    return MsgJoinPool.fromAmino(object.value);
  },
  toAminoMsg(message: MsgJoinPool): MsgJoinPoolAminoMsg {
    return {
      type: "osmosis/gamm/join-pool",
      value: MsgJoinPool.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgJoinPoolProtoMsg): MsgJoinPool {
    return MsgJoinPool.decode(message.value);
  },
  toProto(message: MsgJoinPool): Uint8Array {
    return MsgJoinPool.encode(message).finish();
  },
  toProtoMsg(message: MsgJoinPool): MsgJoinPoolProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.MsgJoinPool",
      value: MsgJoinPool.encode(message).finish(),
    };
  },
};
function createBaseMsgJoinPoolResponse(): MsgJoinPoolResponse {
  return {
    shareOutAmount: "",
    tokenIn: [],
  };
}
export const MsgJoinPoolResponse = {
  typeUrl: "/osmosis.gamm.v1beta1.MsgJoinPoolResponse",
  encode(
    message: MsgJoinPoolResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.shareOutAmount !== "") {
      writer.uint32(10).string(message.shareOutAmount);
    }
    for (const v of message.tokenIn) {
      Coin.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgJoinPoolResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgJoinPoolResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.shareOutAmount = reader.string();
          break;
        case 2:
          message.tokenIn.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgJoinPoolResponse>): MsgJoinPoolResponse {
    const message = createBaseMsgJoinPoolResponse();
    message.shareOutAmount = object.shareOutAmount ?? "";
    message.tokenIn = object.tokenIn?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgJoinPoolResponseAmino): MsgJoinPoolResponse {
    return {
      shareOutAmount: object.share_out_amount,
      tokenIn: Array.isArray(object?.token_in)
        ? object.token_in.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(message: MsgJoinPoolResponse): MsgJoinPoolResponseAmino {
    const obj: any = {};
    obj.share_out_amount = message.shareOutAmount;
    if (message.tokenIn) {
      obj.token_in = message.tokenIn.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.token_in = [];
    }
    return obj;
  },
  fromAminoMsg(object: MsgJoinPoolResponseAminoMsg): MsgJoinPoolResponse {
    return MsgJoinPoolResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgJoinPoolResponse): MsgJoinPoolResponseAminoMsg {
    return {
      type: "osmosis/gamm/join-pool-response",
      value: MsgJoinPoolResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgJoinPoolResponseProtoMsg): MsgJoinPoolResponse {
    return MsgJoinPoolResponse.decode(message.value);
  },
  toProto(message: MsgJoinPoolResponse): Uint8Array {
    return MsgJoinPoolResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgJoinPoolResponse): MsgJoinPoolResponseProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.MsgJoinPoolResponse",
      value: MsgJoinPoolResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgExitPool(): MsgExitPool {
  return {
    sender: "",
    poolId: Long.UZERO,
    shareInAmount: "",
    tokenOutMins: [],
  };
}
export const MsgExitPool = {
  typeUrl: "/osmosis.gamm.v1beta1.MsgExitPool",
  encode(
    message: MsgExitPool,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (!message.poolId.isZero()) {
      writer.uint32(16).uint64(message.poolId);
    }
    if (message.shareInAmount !== "") {
      writer.uint32(26).string(message.shareInAmount);
    }
    for (const v of message.tokenOutMins) {
      Coin.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgExitPool {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExitPool();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.poolId = reader.uint64() as Long;
          break;
        case 3:
          message.shareInAmount = reader.string();
          break;
        case 4:
          message.tokenOutMins.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgExitPool>): MsgExitPool {
    const message = createBaseMsgExitPool();
    message.sender = object.sender ?? "";
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.shareInAmount = object.shareInAmount ?? "";
    message.tokenOutMins =
      object.tokenOutMins?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgExitPoolAmino): MsgExitPool {
    return {
      sender: object.sender,
      poolId: Long.fromString(object.pool_id),
      shareInAmount: object.share_in_amount,
      tokenOutMins: Array.isArray(object?.token_out_mins)
        ? object.token_out_mins.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(message: MsgExitPool): MsgExitPoolAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.share_in_amount = message.shareInAmount;
    if (message.tokenOutMins) {
      obj.token_out_mins = message.tokenOutMins.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.token_out_mins = [];
    }
    return obj;
  },
  fromAminoMsg(object: MsgExitPoolAminoMsg): MsgExitPool {
    return MsgExitPool.fromAmino(object.value);
  },
  toAminoMsg(message: MsgExitPool): MsgExitPoolAminoMsg {
    return {
      type: "osmosis/gamm/exit-pool",
      value: MsgExitPool.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgExitPoolProtoMsg): MsgExitPool {
    return MsgExitPool.decode(message.value);
  },
  toProto(message: MsgExitPool): Uint8Array {
    return MsgExitPool.encode(message).finish();
  },
  toProtoMsg(message: MsgExitPool): MsgExitPoolProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.MsgExitPool",
      value: MsgExitPool.encode(message).finish(),
    };
  },
};
function createBaseMsgExitPoolResponse(): MsgExitPoolResponse {
  return {
    tokenOut: [],
  };
}
export const MsgExitPoolResponse = {
  typeUrl: "/osmosis.gamm.v1beta1.MsgExitPoolResponse",
  encode(
    message: MsgExitPoolResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.tokenOut) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MsgExitPoolResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExitPoolResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.tokenOut.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgExitPoolResponse>): MsgExitPoolResponse {
    const message = createBaseMsgExitPoolResponse();
    message.tokenOut = object.tokenOut?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: MsgExitPoolResponseAmino): MsgExitPoolResponse {
    return {
      tokenOut: Array.isArray(object?.token_out)
        ? object.token_out.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(message: MsgExitPoolResponse): MsgExitPoolResponseAmino {
    const obj: any = {};
    if (message.tokenOut) {
      obj.token_out = message.tokenOut.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.token_out = [];
    }
    return obj;
  },
  fromAminoMsg(object: MsgExitPoolResponseAminoMsg): MsgExitPoolResponse {
    return MsgExitPoolResponse.fromAmino(object.value);
  },
  toAminoMsg(message: MsgExitPoolResponse): MsgExitPoolResponseAminoMsg {
    return {
      type: "osmosis/gamm/exit-pool-response",
      value: MsgExitPoolResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgExitPoolResponseProtoMsg): MsgExitPoolResponse {
    return MsgExitPoolResponse.decode(message.value);
  },
  toProto(message: MsgExitPoolResponse): Uint8Array {
    return MsgExitPoolResponse.encode(message).finish();
  },
  toProtoMsg(message: MsgExitPoolResponse): MsgExitPoolResponseProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.MsgExitPoolResponse",
      value: MsgExitPoolResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgSwapExactAmountIn(): MsgSwapExactAmountIn {
  return {
    sender: "",
    routes: [],
    tokenIn: undefined,
    tokenOutMinAmount: "",
  };
}
export const MsgSwapExactAmountIn = {
  typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountIn",
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
      type: "osmosis/gamm/swap-exact-amount-in",
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
      typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountIn",
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
  typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountInResponse",
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
      type: "osmosis/gamm/swap-exact-amount-in-response",
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
      typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountInResponse",
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
  typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountOut",
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
      type: "osmosis/gamm/swap-exact-amount-out",
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
      typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountOut",
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
  typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountOutResponse",
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
      type: "osmosis/gamm/swap-exact-amount-out-response",
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
      typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountOutResponse",
      value: MsgSwapExactAmountOutResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgJoinSwapExternAmountIn(): MsgJoinSwapExternAmountIn {
  return {
    sender: "",
    poolId: Long.UZERO,
    tokenIn: undefined,
    shareOutMinAmount: "",
  };
}
export const MsgJoinSwapExternAmountIn = {
  typeUrl: "/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn",
  encode(
    message: MsgJoinSwapExternAmountIn,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (!message.poolId.isZero()) {
      writer.uint32(16).uint64(message.poolId);
    }
    if (message.tokenIn !== undefined) {
      Coin.encode(message.tokenIn, writer.uint32(26).fork()).ldelim();
    }
    if (message.shareOutMinAmount !== "") {
      writer.uint32(34).string(message.shareOutMinAmount);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgJoinSwapExternAmountIn {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgJoinSwapExternAmountIn();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.poolId = reader.uint64() as Long;
          break;
        case 3:
          message.tokenIn = Coin.decode(reader, reader.uint32());
          break;
        case 4:
          message.shareOutMinAmount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgJoinSwapExternAmountIn>
  ): MsgJoinSwapExternAmountIn {
    const message = createBaseMsgJoinSwapExternAmountIn();
    message.sender = object.sender ?? "";
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.tokenIn =
      object.tokenIn !== undefined && object.tokenIn !== null
        ? Coin.fromPartial(object.tokenIn)
        : undefined;
    message.shareOutMinAmount = object.shareOutMinAmount ?? "";
    return message;
  },
  fromAmino(object: MsgJoinSwapExternAmountInAmino): MsgJoinSwapExternAmountIn {
    return {
      sender: object.sender,
      poolId: Long.fromString(object.pool_id),
      tokenIn: object?.token_in ? Coin.fromAmino(object.token_in) : undefined,
      shareOutMinAmount: object.share_out_min_amount,
    };
  },
  toAmino(message: MsgJoinSwapExternAmountIn): MsgJoinSwapExternAmountInAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.token_in = message.tokenIn ? Coin.toAmino(message.tokenIn) : undefined;
    obj.share_out_min_amount = message.shareOutMinAmount;
    return obj;
  },
  fromAminoMsg(
    object: MsgJoinSwapExternAmountInAminoMsg
  ): MsgJoinSwapExternAmountIn {
    return MsgJoinSwapExternAmountIn.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgJoinSwapExternAmountIn
  ): MsgJoinSwapExternAmountInAminoMsg {
    return {
      type: "osmosis/gamm/join-swap-extern-amount-in",
      value: MsgJoinSwapExternAmountIn.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgJoinSwapExternAmountInProtoMsg
  ): MsgJoinSwapExternAmountIn {
    return MsgJoinSwapExternAmountIn.decode(message.value);
  },
  toProto(message: MsgJoinSwapExternAmountIn): Uint8Array {
    return MsgJoinSwapExternAmountIn.encode(message).finish();
  },
  toProtoMsg(
    message: MsgJoinSwapExternAmountIn
  ): MsgJoinSwapExternAmountInProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn",
      value: MsgJoinSwapExternAmountIn.encode(message).finish(),
    };
  },
};
function createBaseMsgJoinSwapExternAmountInResponse(): MsgJoinSwapExternAmountInResponse {
  return {
    shareOutAmount: "",
  };
}
export const MsgJoinSwapExternAmountInResponse = {
  typeUrl: "/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountInResponse",
  encode(
    message: MsgJoinSwapExternAmountInResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.shareOutAmount !== "") {
      writer.uint32(10).string(message.shareOutAmount);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgJoinSwapExternAmountInResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgJoinSwapExternAmountInResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.shareOutAmount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgJoinSwapExternAmountInResponse>
  ): MsgJoinSwapExternAmountInResponse {
    const message = createBaseMsgJoinSwapExternAmountInResponse();
    message.shareOutAmount = object.shareOutAmount ?? "";
    return message;
  },
  fromAmino(
    object: MsgJoinSwapExternAmountInResponseAmino
  ): MsgJoinSwapExternAmountInResponse {
    return {
      shareOutAmount: object.share_out_amount,
    };
  },
  toAmino(
    message: MsgJoinSwapExternAmountInResponse
  ): MsgJoinSwapExternAmountInResponseAmino {
    const obj: any = {};
    obj.share_out_amount = message.shareOutAmount;
    return obj;
  },
  fromAminoMsg(
    object: MsgJoinSwapExternAmountInResponseAminoMsg
  ): MsgJoinSwapExternAmountInResponse {
    return MsgJoinSwapExternAmountInResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgJoinSwapExternAmountInResponse
  ): MsgJoinSwapExternAmountInResponseAminoMsg {
    return {
      type: "osmosis/gamm/join-swap-extern-amount-in-response",
      value: MsgJoinSwapExternAmountInResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgJoinSwapExternAmountInResponseProtoMsg
  ): MsgJoinSwapExternAmountInResponse {
    return MsgJoinSwapExternAmountInResponse.decode(message.value);
  },
  toProto(message: MsgJoinSwapExternAmountInResponse): Uint8Array {
    return MsgJoinSwapExternAmountInResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgJoinSwapExternAmountInResponse
  ): MsgJoinSwapExternAmountInResponseProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountInResponse",
      value: MsgJoinSwapExternAmountInResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgJoinSwapShareAmountOut(): MsgJoinSwapShareAmountOut {
  return {
    sender: "",
    poolId: Long.UZERO,
    tokenInDenom: "",
    shareOutAmount: "",
    tokenInMaxAmount: "",
  };
}
export const MsgJoinSwapShareAmountOut = {
  typeUrl: "/osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOut",
  encode(
    message: MsgJoinSwapShareAmountOut,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (!message.poolId.isZero()) {
      writer.uint32(16).uint64(message.poolId);
    }
    if (message.tokenInDenom !== "") {
      writer.uint32(26).string(message.tokenInDenom);
    }
    if (message.shareOutAmount !== "") {
      writer.uint32(34).string(message.shareOutAmount);
    }
    if (message.tokenInMaxAmount !== "") {
      writer.uint32(42).string(message.tokenInMaxAmount);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgJoinSwapShareAmountOut {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgJoinSwapShareAmountOut();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.poolId = reader.uint64() as Long;
          break;
        case 3:
          message.tokenInDenom = reader.string();
          break;
        case 4:
          message.shareOutAmount = reader.string();
          break;
        case 5:
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
    object: Partial<MsgJoinSwapShareAmountOut>
  ): MsgJoinSwapShareAmountOut {
    const message = createBaseMsgJoinSwapShareAmountOut();
    message.sender = object.sender ?? "";
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.tokenInDenom = object.tokenInDenom ?? "";
    message.shareOutAmount = object.shareOutAmount ?? "";
    message.tokenInMaxAmount = object.tokenInMaxAmount ?? "";
    return message;
  },
  fromAmino(object: MsgJoinSwapShareAmountOutAmino): MsgJoinSwapShareAmountOut {
    return {
      sender: object.sender,
      poolId: Long.fromString(object.pool_id),
      tokenInDenom: object.token_in_denom,
      shareOutAmount: object.share_out_amount,
      tokenInMaxAmount: object.token_in_max_amount,
    };
  },
  toAmino(message: MsgJoinSwapShareAmountOut): MsgJoinSwapShareAmountOutAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.token_in_denom = message.tokenInDenom;
    obj.share_out_amount = message.shareOutAmount;
    obj.token_in_max_amount = message.tokenInMaxAmount;
    return obj;
  },
  fromAminoMsg(
    object: MsgJoinSwapShareAmountOutAminoMsg
  ): MsgJoinSwapShareAmountOut {
    return MsgJoinSwapShareAmountOut.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgJoinSwapShareAmountOut
  ): MsgJoinSwapShareAmountOutAminoMsg {
    return {
      type: "osmosis/gamm/join-swap-share-amount-out",
      value: MsgJoinSwapShareAmountOut.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgJoinSwapShareAmountOutProtoMsg
  ): MsgJoinSwapShareAmountOut {
    return MsgJoinSwapShareAmountOut.decode(message.value);
  },
  toProto(message: MsgJoinSwapShareAmountOut): Uint8Array {
    return MsgJoinSwapShareAmountOut.encode(message).finish();
  },
  toProtoMsg(
    message: MsgJoinSwapShareAmountOut
  ): MsgJoinSwapShareAmountOutProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOut",
      value: MsgJoinSwapShareAmountOut.encode(message).finish(),
    };
  },
};
function createBaseMsgJoinSwapShareAmountOutResponse(): MsgJoinSwapShareAmountOutResponse {
  return {
    tokenInAmount: "",
  };
}
export const MsgJoinSwapShareAmountOutResponse = {
  typeUrl: "/osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOutResponse",
  encode(
    message: MsgJoinSwapShareAmountOutResponse,
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
  ): MsgJoinSwapShareAmountOutResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgJoinSwapShareAmountOutResponse();
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
    object: Partial<MsgJoinSwapShareAmountOutResponse>
  ): MsgJoinSwapShareAmountOutResponse {
    const message = createBaseMsgJoinSwapShareAmountOutResponse();
    message.tokenInAmount = object.tokenInAmount ?? "";
    return message;
  },
  fromAmino(
    object: MsgJoinSwapShareAmountOutResponseAmino
  ): MsgJoinSwapShareAmountOutResponse {
    return {
      tokenInAmount: object.token_in_amount,
    };
  },
  toAmino(
    message: MsgJoinSwapShareAmountOutResponse
  ): MsgJoinSwapShareAmountOutResponseAmino {
    const obj: any = {};
    obj.token_in_amount = message.tokenInAmount;
    return obj;
  },
  fromAminoMsg(
    object: MsgJoinSwapShareAmountOutResponseAminoMsg
  ): MsgJoinSwapShareAmountOutResponse {
    return MsgJoinSwapShareAmountOutResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgJoinSwapShareAmountOutResponse
  ): MsgJoinSwapShareAmountOutResponseAminoMsg {
    return {
      type: "osmosis/gamm/join-swap-share-amount-out-response",
      value: MsgJoinSwapShareAmountOutResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgJoinSwapShareAmountOutResponseProtoMsg
  ): MsgJoinSwapShareAmountOutResponse {
    return MsgJoinSwapShareAmountOutResponse.decode(message.value);
  },
  toProto(message: MsgJoinSwapShareAmountOutResponse): Uint8Array {
    return MsgJoinSwapShareAmountOutResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgJoinSwapShareAmountOutResponse
  ): MsgJoinSwapShareAmountOutResponseProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.MsgJoinSwapShareAmountOutResponse",
      value: MsgJoinSwapShareAmountOutResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgExitSwapShareAmountIn(): MsgExitSwapShareAmountIn {
  return {
    sender: "",
    poolId: Long.UZERO,
    tokenOutDenom: "",
    shareInAmount: "",
    tokenOutMinAmount: "",
  };
}
export const MsgExitSwapShareAmountIn = {
  typeUrl: "/osmosis.gamm.v1beta1.MsgExitSwapShareAmountIn",
  encode(
    message: MsgExitSwapShareAmountIn,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (!message.poolId.isZero()) {
      writer.uint32(16).uint64(message.poolId);
    }
    if (message.tokenOutDenom !== "") {
      writer.uint32(26).string(message.tokenOutDenom);
    }
    if (message.shareInAmount !== "") {
      writer.uint32(34).string(message.shareInAmount);
    }
    if (message.tokenOutMinAmount !== "") {
      writer.uint32(42).string(message.tokenOutMinAmount);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgExitSwapShareAmountIn {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExitSwapShareAmountIn();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.poolId = reader.uint64() as Long;
          break;
        case 3:
          message.tokenOutDenom = reader.string();
          break;
        case 4:
          message.shareInAmount = reader.string();
          break;
        case 5:
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
    object: Partial<MsgExitSwapShareAmountIn>
  ): MsgExitSwapShareAmountIn {
    const message = createBaseMsgExitSwapShareAmountIn();
    message.sender = object.sender ?? "";
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.tokenOutDenom = object.tokenOutDenom ?? "";
    message.shareInAmount = object.shareInAmount ?? "";
    message.tokenOutMinAmount = object.tokenOutMinAmount ?? "";
    return message;
  },
  fromAmino(object: MsgExitSwapShareAmountInAmino): MsgExitSwapShareAmountIn {
    return {
      sender: object.sender,
      poolId: Long.fromString(object.pool_id),
      tokenOutDenom: object.token_out_denom,
      shareInAmount: object.share_in_amount,
      tokenOutMinAmount: object.token_out_min_amount,
    };
  },
  toAmino(message: MsgExitSwapShareAmountIn): MsgExitSwapShareAmountInAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.token_out_denom = message.tokenOutDenom;
    obj.share_in_amount = message.shareInAmount;
    obj.token_out_min_amount = message.tokenOutMinAmount;
    return obj;
  },
  fromAminoMsg(
    object: MsgExitSwapShareAmountInAminoMsg
  ): MsgExitSwapShareAmountIn {
    return MsgExitSwapShareAmountIn.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgExitSwapShareAmountIn
  ): MsgExitSwapShareAmountInAminoMsg {
    return {
      type: "osmosis/gamm/exit-swap-share-amount-in",
      value: MsgExitSwapShareAmountIn.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgExitSwapShareAmountInProtoMsg
  ): MsgExitSwapShareAmountIn {
    return MsgExitSwapShareAmountIn.decode(message.value);
  },
  toProto(message: MsgExitSwapShareAmountIn): Uint8Array {
    return MsgExitSwapShareAmountIn.encode(message).finish();
  },
  toProtoMsg(
    message: MsgExitSwapShareAmountIn
  ): MsgExitSwapShareAmountInProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.MsgExitSwapShareAmountIn",
      value: MsgExitSwapShareAmountIn.encode(message).finish(),
    };
  },
};
function createBaseMsgExitSwapShareAmountInResponse(): MsgExitSwapShareAmountInResponse {
  return {
    tokenOutAmount: "",
  };
}
export const MsgExitSwapShareAmountInResponse = {
  typeUrl: "/osmosis.gamm.v1beta1.MsgExitSwapShareAmountInResponse",
  encode(
    message: MsgExitSwapShareAmountInResponse,
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
  ): MsgExitSwapShareAmountInResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExitSwapShareAmountInResponse();
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
    object: Partial<MsgExitSwapShareAmountInResponse>
  ): MsgExitSwapShareAmountInResponse {
    const message = createBaseMsgExitSwapShareAmountInResponse();
    message.tokenOutAmount = object.tokenOutAmount ?? "";
    return message;
  },
  fromAmino(
    object: MsgExitSwapShareAmountInResponseAmino
  ): MsgExitSwapShareAmountInResponse {
    return {
      tokenOutAmount: object.token_out_amount,
    };
  },
  toAmino(
    message: MsgExitSwapShareAmountInResponse
  ): MsgExitSwapShareAmountInResponseAmino {
    const obj: any = {};
    obj.token_out_amount = message.tokenOutAmount;
    return obj;
  },
  fromAminoMsg(
    object: MsgExitSwapShareAmountInResponseAminoMsg
  ): MsgExitSwapShareAmountInResponse {
    return MsgExitSwapShareAmountInResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgExitSwapShareAmountInResponse
  ): MsgExitSwapShareAmountInResponseAminoMsg {
    return {
      type: "osmosis/gamm/exit-swap-share-amount-in-response",
      value: MsgExitSwapShareAmountInResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgExitSwapShareAmountInResponseProtoMsg
  ): MsgExitSwapShareAmountInResponse {
    return MsgExitSwapShareAmountInResponse.decode(message.value);
  },
  toProto(message: MsgExitSwapShareAmountInResponse): Uint8Array {
    return MsgExitSwapShareAmountInResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgExitSwapShareAmountInResponse
  ): MsgExitSwapShareAmountInResponseProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.MsgExitSwapShareAmountInResponse",
      value: MsgExitSwapShareAmountInResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgExitSwapExternAmountOut(): MsgExitSwapExternAmountOut {
  return {
    sender: "",
    poolId: Long.UZERO,
    tokenOut: undefined,
    shareInMaxAmount: "",
  };
}
export const MsgExitSwapExternAmountOut = {
  typeUrl: "/osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut",
  encode(
    message: MsgExitSwapExternAmountOut,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (!message.poolId.isZero()) {
      writer.uint32(16).uint64(message.poolId);
    }
    if (message.tokenOut !== undefined) {
      Coin.encode(message.tokenOut, writer.uint32(26).fork()).ldelim();
    }
    if (message.shareInMaxAmount !== "") {
      writer.uint32(34).string(message.shareInMaxAmount);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgExitSwapExternAmountOut {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExitSwapExternAmountOut();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.poolId = reader.uint64() as Long;
          break;
        case 3:
          message.tokenOut = Coin.decode(reader, reader.uint32());
          break;
        case 4:
          message.shareInMaxAmount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgExitSwapExternAmountOut>
  ): MsgExitSwapExternAmountOut {
    const message = createBaseMsgExitSwapExternAmountOut();
    message.sender = object.sender ?? "";
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.tokenOut =
      object.tokenOut !== undefined && object.tokenOut !== null
        ? Coin.fromPartial(object.tokenOut)
        : undefined;
    message.shareInMaxAmount = object.shareInMaxAmount ?? "";
    return message;
  },
  fromAmino(
    object: MsgExitSwapExternAmountOutAmino
  ): MsgExitSwapExternAmountOut {
    return {
      sender: object.sender,
      poolId: Long.fromString(object.pool_id),
      tokenOut: object?.token_out
        ? Coin.fromAmino(object.token_out)
        : undefined,
      shareInMaxAmount: object.share_in_max_amount,
    };
  },
  toAmino(
    message: MsgExitSwapExternAmountOut
  ): MsgExitSwapExternAmountOutAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.token_out = message.tokenOut
      ? Coin.toAmino(message.tokenOut)
      : undefined;
    obj.share_in_max_amount = message.shareInMaxAmount;
    return obj;
  },
  fromAminoMsg(
    object: MsgExitSwapExternAmountOutAminoMsg
  ): MsgExitSwapExternAmountOut {
    return MsgExitSwapExternAmountOut.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgExitSwapExternAmountOut
  ): MsgExitSwapExternAmountOutAminoMsg {
    return {
      type: "osmosis/gamm/exit-swap-extern-amount-out",
      value: MsgExitSwapExternAmountOut.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgExitSwapExternAmountOutProtoMsg
  ): MsgExitSwapExternAmountOut {
    return MsgExitSwapExternAmountOut.decode(message.value);
  },
  toProto(message: MsgExitSwapExternAmountOut): Uint8Array {
    return MsgExitSwapExternAmountOut.encode(message).finish();
  },
  toProtoMsg(
    message: MsgExitSwapExternAmountOut
  ): MsgExitSwapExternAmountOutProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.MsgExitSwapExternAmountOut",
      value: MsgExitSwapExternAmountOut.encode(message).finish(),
    };
  },
};
function createBaseMsgExitSwapExternAmountOutResponse(): MsgExitSwapExternAmountOutResponse {
  return {
    shareInAmount: "",
  };
}
export const MsgExitSwapExternAmountOutResponse = {
  typeUrl: "/osmosis.gamm.v1beta1.MsgExitSwapExternAmountOutResponse",
  encode(
    message: MsgExitSwapExternAmountOutResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.shareInAmount !== "") {
      writer.uint32(10).string(message.shareInAmount);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgExitSwapExternAmountOutResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgExitSwapExternAmountOutResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.shareInAmount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgExitSwapExternAmountOutResponse>
  ): MsgExitSwapExternAmountOutResponse {
    const message = createBaseMsgExitSwapExternAmountOutResponse();
    message.shareInAmount = object.shareInAmount ?? "";
    return message;
  },
  fromAmino(
    object: MsgExitSwapExternAmountOutResponseAmino
  ): MsgExitSwapExternAmountOutResponse {
    return {
      shareInAmount: object.share_in_amount,
    };
  },
  toAmino(
    message: MsgExitSwapExternAmountOutResponse
  ): MsgExitSwapExternAmountOutResponseAmino {
    const obj: any = {};
    obj.share_in_amount = message.shareInAmount;
    return obj;
  },
  fromAminoMsg(
    object: MsgExitSwapExternAmountOutResponseAminoMsg
  ): MsgExitSwapExternAmountOutResponse {
    return MsgExitSwapExternAmountOutResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgExitSwapExternAmountOutResponse
  ): MsgExitSwapExternAmountOutResponseAminoMsg {
    return {
      type: "osmosis/gamm/exit-swap-extern-amount-out-response",
      value: MsgExitSwapExternAmountOutResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgExitSwapExternAmountOutResponseProtoMsg
  ): MsgExitSwapExternAmountOutResponse {
    return MsgExitSwapExternAmountOutResponse.decode(message.value);
  },
  toProto(message: MsgExitSwapExternAmountOutResponse): Uint8Array {
    return MsgExitSwapExternAmountOutResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgExitSwapExternAmountOutResponse
  ): MsgExitSwapExternAmountOutResponseProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.MsgExitSwapExternAmountOutResponse",
      value: MsgExitSwapExternAmountOutResponse.encode(message).finish(),
    };
  },
};
