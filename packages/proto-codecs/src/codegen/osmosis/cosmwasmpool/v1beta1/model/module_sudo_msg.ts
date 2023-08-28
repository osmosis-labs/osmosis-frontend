//@ts-nocheck
import { Decimal } from "@cosmjs/math";

import { BinaryReader, BinaryWriter } from "../../../../binary";
import {
  Coin,
  CoinAmino,
  CoinSDKType,
} from "../../../../cosmos/base/v1beta1/coin";
/** ===================== SwapExactAmountIn */
export interface SwapExactAmountIn {
  sender: string;
  /** token_in is the token to be sent to the pool. */
  tokenIn: Coin;
  /** token_out_denom is the token denom to be received from the pool. */
  tokenOutDenom: string;
  /**
   * token_out_min_amount is the minimum amount of token_out to be received from
   * the pool.
   */
  tokenOutMinAmount: string;
  /** swap_fee is the swap fee for this swap estimate. */
  swapFee: string;
}
export interface SwapExactAmountInProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.SwapExactAmountIn";
  value: Uint8Array;
}
/** ===================== SwapExactAmountIn */
export interface SwapExactAmountInAmino {
  sender: string;
  /** token_in is the token to be sent to the pool. */
  token_in?: CoinAmino;
  /** token_out_denom is the token denom to be received from the pool. */
  token_out_denom: string;
  /**
   * token_out_min_amount is the minimum amount of token_out to be received from
   * the pool.
   */
  token_out_min_amount: string;
  /** swap_fee is the swap fee for this swap estimate. */
  swap_fee: string;
}
export interface SwapExactAmountInAminoMsg {
  type: "osmosis/cosmwasmpool/swap-exact-amount-in";
  value: SwapExactAmountInAmino;
}
/** ===================== SwapExactAmountIn */
export interface SwapExactAmountInSDKType {
  sender: string;
  token_in: CoinSDKType;
  token_out_denom: string;
  token_out_min_amount: string;
  swap_fee: string;
}
export interface SwapExactAmountInSudoMsg {
  /**
   * swap_exact_amount_in is the structure containing all the request
   * information for this message.
   */
  swapExactAmountIn: SwapExactAmountIn;
}
export interface SwapExactAmountInSudoMsgProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.SwapExactAmountInSudoMsg";
  value: Uint8Array;
}
export interface SwapExactAmountInSudoMsgAmino {
  /**
   * swap_exact_amount_in is the structure containing all the request
   * information for this message.
   */
  swap_exact_amount_in?: SwapExactAmountInAmino;
}
export interface SwapExactAmountInSudoMsgAminoMsg {
  type: "osmosis/cosmwasmpool/swap-exact-amount-in-sudo-msg";
  value: SwapExactAmountInSudoMsgAmino;
}
export interface SwapExactAmountInSudoMsgSDKType {
  swap_exact_amount_in: SwapExactAmountInSDKType;
}
export interface SwapExactAmountInSudoMsgResponse {
  /** token_out_amount is the token out computed from this swap estimate call. */
  tokenOutAmount: string;
}
export interface SwapExactAmountInSudoMsgResponseProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.SwapExactAmountInSudoMsgResponse";
  value: Uint8Array;
}
export interface SwapExactAmountInSudoMsgResponseAmino {
  /** token_out_amount is the token out computed from this swap estimate call. */
  token_out_amount: string;
}
export interface SwapExactAmountInSudoMsgResponseAminoMsg {
  type: "osmosis/cosmwasmpool/swap-exact-amount-in-sudo-msg-response";
  value: SwapExactAmountInSudoMsgResponseAmino;
}
export interface SwapExactAmountInSudoMsgResponseSDKType {
  token_out_amount: string;
}
/** ===================== SwapExactAmountOut */
export interface SwapExactAmountOut {
  sender: string;
  /** token_out is the token to be sent out of the pool. */
  tokenOut: Coin;
  /** token_in_denom is the token denom to be sent too the pool. */
  tokenInDenom: string;
  /**
   * token_in_max_amount is the maximum amount of token_in to be sent to the
   * pool.
   */
  tokenInMaxAmount: string;
  /** swap_fee is the swap fee for this swap estimate. */
  swapFee: string;
}
export interface SwapExactAmountOutProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.SwapExactAmountOut";
  value: Uint8Array;
}
/** ===================== SwapExactAmountOut */
export interface SwapExactAmountOutAmino {
  sender: string;
  /** token_out is the token to be sent out of the pool. */
  token_out?: CoinAmino;
  /** token_in_denom is the token denom to be sent too the pool. */
  token_in_denom: string;
  /**
   * token_in_max_amount is the maximum amount of token_in to be sent to the
   * pool.
   */
  token_in_max_amount: string;
  /** swap_fee is the swap fee for this swap estimate. */
  swap_fee: string;
}
export interface SwapExactAmountOutAminoMsg {
  type: "osmosis/cosmwasmpool/swap-exact-amount-out";
  value: SwapExactAmountOutAmino;
}
/** ===================== SwapExactAmountOut */
export interface SwapExactAmountOutSDKType {
  sender: string;
  token_out: CoinSDKType;
  token_in_denom: string;
  token_in_max_amount: string;
  swap_fee: string;
}
export interface SwapExactAmountOutSudoMsg {
  /**
   * swap_exact_amount_out is the structure containing all the request
   * information for this message.
   */
  swapExactAmountOut: SwapExactAmountOut;
}
export interface SwapExactAmountOutSudoMsgProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.SwapExactAmountOutSudoMsg";
  value: Uint8Array;
}
export interface SwapExactAmountOutSudoMsgAmino {
  /**
   * swap_exact_amount_out is the structure containing all the request
   * information for this message.
   */
  swap_exact_amount_out?: SwapExactAmountOutAmino;
}
export interface SwapExactAmountOutSudoMsgAminoMsg {
  type: "osmosis/cosmwasmpool/swap-exact-amount-out-sudo-msg";
  value: SwapExactAmountOutSudoMsgAmino;
}
export interface SwapExactAmountOutSudoMsgSDKType {
  swap_exact_amount_out: SwapExactAmountOutSDKType;
}
export interface SwapExactAmountOutSudoMsgResponse {
  /** token_in_amount is the token in computed from this swap estimate call. */
  tokenInAmount: string;
}
export interface SwapExactAmountOutSudoMsgResponseProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.SwapExactAmountOutSudoMsgResponse";
  value: Uint8Array;
}
export interface SwapExactAmountOutSudoMsgResponseAmino {
  /** token_in_amount is the token in computed from this swap estimate call. */
  token_in_amount: string;
}
export interface SwapExactAmountOutSudoMsgResponseAminoMsg {
  type: "osmosis/cosmwasmpool/swap-exact-amount-out-sudo-msg-response";
  value: SwapExactAmountOutSudoMsgResponseAmino;
}
export interface SwapExactAmountOutSudoMsgResponseSDKType {
  token_in_amount: string;
}
function createBaseSwapExactAmountIn(): SwapExactAmountIn {
  return {
    sender: "",
    tokenIn: undefined,
    tokenOutDenom: "",
    tokenOutMinAmount: "",
    swapFee: "",
  };
}
export const SwapExactAmountIn = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.SwapExactAmountIn",
  encode(
    message: SwapExactAmountIn,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (message.tokenIn !== undefined) {
      Coin.encode(message.tokenIn, writer.uint32(18).fork()).ldelim();
    }
    if (message.tokenOutDenom !== "") {
      writer.uint32(26).string(message.tokenOutDenom);
    }
    if (message.tokenOutMinAmount !== "") {
      writer.uint32(34).string(message.tokenOutMinAmount);
    }
    if (message.swapFee !== "") {
      writer
        .uint32(42)
        .string(Decimal.fromUserInput(message.swapFee, 18).atomics);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): SwapExactAmountIn {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSwapExactAmountIn();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.tokenIn = Coin.decode(reader, reader.uint32());
          break;
        case 3:
          message.tokenOutDenom = reader.string();
          break;
        case 4:
          message.tokenOutMinAmount = reader.string();
          break;
        case 5:
          message.swapFee = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<SwapExactAmountIn>): SwapExactAmountIn {
    const message = createBaseSwapExactAmountIn();
    message.sender = object.sender ?? "";
    message.tokenIn =
      object.tokenIn !== undefined && object.tokenIn !== null
        ? Coin.fromPartial(object.tokenIn)
        : undefined;
    message.tokenOutDenom = object.tokenOutDenom ?? "";
    message.tokenOutMinAmount = object.tokenOutMinAmount ?? "";
    message.swapFee = object.swapFee ?? "";
    return message;
  },
  fromAmino(object: SwapExactAmountInAmino): SwapExactAmountIn {
    return {
      sender: object.sender,
      tokenIn: object?.token_in ? Coin.fromAmino(object.token_in) : undefined,
      tokenOutDenom: object.token_out_denom,
      tokenOutMinAmount: object.token_out_min_amount,
      swapFee: object.swap_fee,
    };
  },
  toAmino(message: SwapExactAmountIn): SwapExactAmountInAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.token_in = message.tokenIn ? Coin.toAmino(message.tokenIn) : undefined;
    obj.token_out_denom = message.tokenOutDenom;
    obj.token_out_min_amount = message.tokenOutMinAmount;
    obj.swap_fee = message.swapFee;
    return obj;
  },
  fromAminoMsg(object: SwapExactAmountInAminoMsg): SwapExactAmountIn {
    return SwapExactAmountIn.fromAmino(object.value);
  },
  toAminoMsg(message: SwapExactAmountIn): SwapExactAmountInAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/swap-exact-amount-in",
      value: SwapExactAmountIn.toAmino(message),
    };
  },
  fromProtoMsg(message: SwapExactAmountInProtoMsg): SwapExactAmountIn {
    return SwapExactAmountIn.decode(message.value);
  },
  toProto(message: SwapExactAmountIn): Uint8Array {
    return SwapExactAmountIn.encode(message).finish();
  },
  toProtoMsg(message: SwapExactAmountIn): SwapExactAmountInProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.SwapExactAmountIn",
      value: SwapExactAmountIn.encode(message).finish(),
    };
  },
};
function createBaseSwapExactAmountInSudoMsg(): SwapExactAmountInSudoMsg {
  return {
    swapExactAmountIn: SwapExactAmountIn.fromPartial({}),
  };
}
export const SwapExactAmountInSudoMsg = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.SwapExactAmountInSudoMsg",
  encode(
    message: SwapExactAmountInSudoMsg,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.swapExactAmountIn !== undefined) {
      SwapExactAmountIn.encode(
        message.swapExactAmountIn,
        writer.uint32(10).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): SwapExactAmountInSudoMsg {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSwapExactAmountInSudoMsg();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.swapExactAmountIn = SwapExactAmountIn.decode(
            reader,
            reader.uint32()
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
    object: Partial<SwapExactAmountInSudoMsg>
  ): SwapExactAmountInSudoMsg {
    const message = createBaseSwapExactAmountInSudoMsg();
    message.swapExactAmountIn =
      object.swapExactAmountIn !== undefined &&
      object.swapExactAmountIn !== null
        ? SwapExactAmountIn.fromPartial(object.swapExactAmountIn)
        : undefined;
    return message;
  },
  fromAmino(object: SwapExactAmountInSudoMsgAmino): SwapExactAmountInSudoMsg {
    return {
      swapExactAmountIn: object?.swap_exact_amount_in
        ? SwapExactAmountIn.fromAmino(object.swap_exact_amount_in)
        : undefined,
    };
  },
  toAmino(message: SwapExactAmountInSudoMsg): SwapExactAmountInSudoMsgAmino {
    const obj: any = {};
    obj.swap_exact_amount_in = message.swapExactAmountIn
      ? SwapExactAmountIn.toAmino(message.swapExactAmountIn)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: SwapExactAmountInSudoMsgAminoMsg
  ): SwapExactAmountInSudoMsg {
    return SwapExactAmountInSudoMsg.fromAmino(object.value);
  },
  toAminoMsg(
    message: SwapExactAmountInSudoMsg
  ): SwapExactAmountInSudoMsgAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/swap-exact-amount-in-sudo-msg",
      value: SwapExactAmountInSudoMsg.toAmino(message),
    };
  },
  fromProtoMsg(
    message: SwapExactAmountInSudoMsgProtoMsg
  ): SwapExactAmountInSudoMsg {
    return SwapExactAmountInSudoMsg.decode(message.value);
  },
  toProto(message: SwapExactAmountInSudoMsg): Uint8Array {
    return SwapExactAmountInSudoMsg.encode(message).finish();
  },
  toProtoMsg(
    message: SwapExactAmountInSudoMsg
  ): SwapExactAmountInSudoMsgProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.SwapExactAmountInSudoMsg",
      value: SwapExactAmountInSudoMsg.encode(message).finish(),
    };
  },
};
function createBaseSwapExactAmountInSudoMsgResponse(): SwapExactAmountInSudoMsgResponse {
  return {
    tokenOutAmount: "",
  };
}
export const SwapExactAmountInSudoMsgResponse = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.SwapExactAmountInSudoMsgResponse",
  encode(
    message: SwapExactAmountInSudoMsgResponse,
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
  ): SwapExactAmountInSudoMsgResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSwapExactAmountInSudoMsgResponse();
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
    object: Partial<SwapExactAmountInSudoMsgResponse>
  ): SwapExactAmountInSudoMsgResponse {
    const message = createBaseSwapExactAmountInSudoMsgResponse();
    message.tokenOutAmount = object.tokenOutAmount ?? "";
    return message;
  },
  fromAmino(
    object: SwapExactAmountInSudoMsgResponseAmino
  ): SwapExactAmountInSudoMsgResponse {
    return {
      tokenOutAmount: object.token_out_amount,
    };
  },
  toAmino(
    message: SwapExactAmountInSudoMsgResponse
  ): SwapExactAmountInSudoMsgResponseAmino {
    const obj: any = {};
    obj.token_out_amount = message.tokenOutAmount;
    return obj;
  },
  fromAminoMsg(
    object: SwapExactAmountInSudoMsgResponseAminoMsg
  ): SwapExactAmountInSudoMsgResponse {
    return SwapExactAmountInSudoMsgResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: SwapExactAmountInSudoMsgResponse
  ): SwapExactAmountInSudoMsgResponseAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/swap-exact-amount-in-sudo-msg-response",
      value: SwapExactAmountInSudoMsgResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: SwapExactAmountInSudoMsgResponseProtoMsg
  ): SwapExactAmountInSudoMsgResponse {
    return SwapExactAmountInSudoMsgResponse.decode(message.value);
  },
  toProto(message: SwapExactAmountInSudoMsgResponse): Uint8Array {
    return SwapExactAmountInSudoMsgResponse.encode(message).finish();
  },
  toProtoMsg(
    message: SwapExactAmountInSudoMsgResponse
  ): SwapExactAmountInSudoMsgResponseProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.SwapExactAmountInSudoMsgResponse",
      value: SwapExactAmountInSudoMsgResponse.encode(message).finish(),
    };
  },
};
function createBaseSwapExactAmountOut(): SwapExactAmountOut {
  return {
    sender: "",
    tokenOut: undefined,
    tokenInDenom: "",
    tokenInMaxAmount: "",
    swapFee: "",
  };
}
export const SwapExactAmountOut = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.SwapExactAmountOut",
  encode(
    message: SwapExactAmountOut,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (message.tokenOut !== undefined) {
      Coin.encode(message.tokenOut, writer.uint32(18).fork()).ldelim();
    }
    if (message.tokenInDenom !== "") {
      writer.uint32(26).string(message.tokenInDenom);
    }
    if (message.tokenInMaxAmount !== "") {
      writer.uint32(34).string(message.tokenInMaxAmount);
    }
    if (message.swapFee !== "") {
      writer
        .uint32(42)
        .string(Decimal.fromUserInput(message.swapFee, 18).atomics);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): SwapExactAmountOut {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSwapExactAmountOut();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.tokenOut = Coin.decode(reader, reader.uint32());
          break;
        case 3:
          message.tokenInDenom = reader.string();
          break;
        case 4:
          message.tokenInMaxAmount = reader.string();
          break;
        case 5:
          message.swapFee = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<SwapExactAmountOut>): SwapExactAmountOut {
    const message = createBaseSwapExactAmountOut();
    message.sender = object.sender ?? "";
    message.tokenOut =
      object.tokenOut !== undefined && object.tokenOut !== null
        ? Coin.fromPartial(object.tokenOut)
        : undefined;
    message.tokenInDenom = object.tokenInDenom ?? "";
    message.tokenInMaxAmount = object.tokenInMaxAmount ?? "";
    message.swapFee = object.swapFee ?? "";
    return message;
  },
  fromAmino(object: SwapExactAmountOutAmino): SwapExactAmountOut {
    return {
      sender: object.sender,
      tokenOut: object?.token_out
        ? Coin.fromAmino(object.token_out)
        : undefined,
      tokenInDenom: object.token_in_denom,
      tokenInMaxAmount: object.token_in_max_amount,
      swapFee: object.swap_fee,
    };
  },
  toAmino(message: SwapExactAmountOut): SwapExactAmountOutAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.token_out = message.tokenOut
      ? Coin.toAmino(message.tokenOut)
      : undefined;
    obj.token_in_denom = message.tokenInDenom;
    obj.token_in_max_amount = message.tokenInMaxAmount;
    obj.swap_fee = message.swapFee;
    return obj;
  },
  fromAminoMsg(object: SwapExactAmountOutAminoMsg): SwapExactAmountOut {
    return SwapExactAmountOut.fromAmino(object.value);
  },
  toAminoMsg(message: SwapExactAmountOut): SwapExactAmountOutAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/swap-exact-amount-out",
      value: SwapExactAmountOut.toAmino(message),
    };
  },
  fromProtoMsg(message: SwapExactAmountOutProtoMsg): SwapExactAmountOut {
    return SwapExactAmountOut.decode(message.value);
  },
  toProto(message: SwapExactAmountOut): Uint8Array {
    return SwapExactAmountOut.encode(message).finish();
  },
  toProtoMsg(message: SwapExactAmountOut): SwapExactAmountOutProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.SwapExactAmountOut",
      value: SwapExactAmountOut.encode(message).finish(),
    };
  },
};
function createBaseSwapExactAmountOutSudoMsg(): SwapExactAmountOutSudoMsg {
  return {
    swapExactAmountOut: SwapExactAmountOut.fromPartial({}),
  };
}
export const SwapExactAmountOutSudoMsg = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.SwapExactAmountOutSudoMsg",
  encode(
    message: SwapExactAmountOutSudoMsg,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.swapExactAmountOut !== undefined) {
      SwapExactAmountOut.encode(
        message.swapExactAmountOut,
        writer.uint32(10).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): SwapExactAmountOutSudoMsg {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSwapExactAmountOutSudoMsg();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.swapExactAmountOut = SwapExactAmountOut.decode(
            reader,
            reader.uint32()
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
    object: Partial<SwapExactAmountOutSudoMsg>
  ): SwapExactAmountOutSudoMsg {
    const message = createBaseSwapExactAmountOutSudoMsg();
    message.swapExactAmountOut =
      object.swapExactAmountOut !== undefined &&
      object.swapExactAmountOut !== null
        ? SwapExactAmountOut.fromPartial(object.swapExactAmountOut)
        : undefined;
    return message;
  },
  fromAmino(object: SwapExactAmountOutSudoMsgAmino): SwapExactAmountOutSudoMsg {
    return {
      swapExactAmountOut: object?.swap_exact_amount_out
        ? SwapExactAmountOut.fromAmino(object.swap_exact_amount_out)
        : undefined,
    };
  },
  toAmino(message: SwapExactAmountOutSudoMsg): SwapExactAmountOutSudoMsgAmino {
    const obj: any = {};
    obj.swap_exact_amount_out = message.swapExactAmountOut
      ? SwapExactAmountOut.toAmino(message.swapExactAmountOut)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: SwapExactAmountOutSudoMsgAminoMsg
  ): SwapExactAmountOutSudoMsg {
    return SwapExactAmountOutSudoMsg.fromAmino(object.value);
  },
  toAminoMsg(
    message: SwapExactAmountOutSudoMsg
  ): SwapExactAmountOutSudoMsgAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/swap-exact-amount-out-sudo-msg",
      value: SwapExactAmountOutSudoMsg.toAmino(message),
    };
  },
  fromProtoMsg(
    message: SwapExactAmountOutSudoMsgProtoMsg
  ): SwapExactAmountOutSudoMsg {
    return SwapExactAmountOutSudoMsg.decode(message.value);
  },
  toProto(message: SwapExactAmountOutSudoMsg): Uint8Array {
    return SwapExactAmountOutSudoMsg.encode(message).finish();
  },
  toProtoMsg(
    message: SwapExactAmountOutSudoMsg
  ): SwapExactAmountOutSudoMsgProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.SwapExactAmountOutSudoMsg",
      value: SwapExactAmountOutSudoMsg.encode(message).finish(),
    };
  },
};
function createBaseSwapExactAmountOutSudoMsgResponse(): SwapExactAmountOutSudoMsgResponse {
  return {
    tokenInAmount: "",
  };
}
export const SwapExactAmountOutSudoMsgResponse = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.SwapExactAmountOutSudoMsgResponse",
  encode(
    message: SwapExactAmountOutSudoMsgResponse,
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
  ): SwapExactAmountOutSudoMsgResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSwapExactAmountOutSudoMsgResponse();
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
    object: Partial<SwapExactAmountOutSudoMsgResponse>
  ): SwapExactAmountOutSudoMsgResponse {
    const message = createBaseSwapExactAmountOutSudoMsgResponse();
    message.tokenInAmount = object.tokenInAmount ?? "";
    return message;
  },
  fromAmino(
    object: SwapExactAmountOutSudoMsgResponseAmino
  ): SwapExactAmountOutSudoMsgResponse {
    return {
      tokenInAmount: object.token_in_amount,
    };
  },
  toAmino(
    message: SwapExactAmountOutSudoMsgResponse
  ): SwapExactAmountOutSudoMsgResponseAmino {
    const obj: any = {};
    obj.token_in_amount = message.tokenInAmount;
    return obj;
  },
  fromAminoMsg(
    object: SwapExactAmountOutSudoMsgResponseAminoMsg
  ): SwapExactAmountOutSudoMsgResponse {
    return SwapExactAmountOutSudoMsgResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: SwapExactAmountOutSudoMsgResponse
  ): SwapExactAmountOutSudoMsgResponseAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/swap-exact-amount-out-sudo-msg-response",
      value: SwapExactAmountOutSudoMsgResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: SwapExactAmountOutSudoMsgResponseProtoMsg
  ): SwapExactAmountOutSudoMsgResponse {
    return SwapExactAmountOutSudoMsgResponse.decode(message.value);
  },
  toProto(message: SwapExactAmountOutSudoMsgResponse): Uint8Array {
    return SwapExactAmountOutSudoMsgResponse.encode(message).finish();
  },
  toProtoMsg(
    message: SwapExactAmountOutSudoMsgResponse
  ): SwapExactAmountOutSudoMsgResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.cosmwasmpool.v1beta1.SwapExactAmountOutSudoMsgResponse",
      value: SwapExactAmountOutSudoMsgResponse.encode(message).finish(),
    };
  },
};
