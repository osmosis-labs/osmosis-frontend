//@ts-nocheck
import { Decimal } from "@cosmjs/math";

import { BinaryReader, BinaryWriter } from "../../../../binary";
import {
  Coin,
  CoinAmino,
  CoinSDKType,
} from "../../../../cosmos/base/v1beta1/coin";
/** ===================== GetSwapFeeQueryMsg */
export interface GetSwapFeeQueryMsg {
  /** get_swap_fee is the query strcuture to get swap fee. */
  getSwapFee: EmptyStruct;
}
export interface GetSwapFeeQueryMsgProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.GetSwapFeeQueryMsg";
  value: Uint8Array;
}
/** ===================== GetSwapFeeQueryMsg */
export interface GetSwapFeeQueryMsgAmino {
  /** get_swap_fee is the query strcuture to get swap fee. */
  get_swap_fee?: EmptyStructAmino;
}
export interface GetSwapFeeQueryMsgAminoMsg {
  type: "osmosis/cosmwasmpool/get-swap-fee-query-msg";
  value: GetSwapFeeQueryMsgAmino;
}
/** ===================== GetSwapFeeQueryMsg */
export interface GetSwapFeeQueryMsgSDKType {
  get_swap_fee: EmptyStructSDKType;
}
export interface GetSwapFeeQueryMsgResponse {
  /** swap_fee is the swap fee for this swap estimate. */
  swapFee: string;
}
export interface GetSwapFeeQueryMsgResponseProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.GetSwapFeeQueryMsgResponse";
  value: Uint8Array;
}
export interface GetSwapFeeQueryMsgResponseAmino {
  /** swap_fee is the swap fee for this swap estimate. */
  swap_fee: string;
}
export interface GetSwapFeeQueryMsgResponseAminoMsg {
  type: "osmosis/cosmwasmpool/get-swap-fee-query-msg-response";
  value: GetSwapFeeQueryMsgResponseAmino;
}
export interface GetSwapFeeQueryMsgResponseSDKType {
  swap_fee: string;
}
/** ===================== SpotPriceQueryMsg */
export interface SpotPrice {
  /** quote_asset_denom is the quote asset of the spot query. */
  quoteAssetDenom: string;
  /** base_asset_denom is the base asset of the spot query. */
  baseAssetDenom: string;
}
export interface SpotPriceProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.SpotPrice";
  value: Uint8Array;
}
/** ===================== SpotPriceQueryMsg */
export interface SpotPriceAmino {
  /** quote_asset_denom is the quote asset of the spot query. */
  quote_asset_denom: string;
  /** base_asset_denom is the base asset of the spot query. */
  base_asset_denom: string;
}
export interface SpotPriceAminoMsg {
  type: "osmosis/cosmwasmpool/spot-price";
  value: SpotPriceAmino;
}
/** ===================== SpotPriceQueryMsg */
export interface SpotPriceSDKType {
  quote_asset_denom: string;
  base_asset_denom: string;
}
export interface SpotPriceQueryMsg {
  /**
   * spot_price is the structure containing request field of the spot price
   * query message.
   */
  spotPrice: SpotPrice;
}
export interface SpotPriceQueryMsgProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.SpotPriceQueryMsg";
  value: Uint8Array;
}
export interface SpotPriceQueryMsgAmino {
  /**
   * spot_price is the structure containing request field of the spot price
   * query message.
   */
  spot_price?: SpotPriceAmino;
}
export interface SpotPriceQueryMsgAminoMsg {
  type: "osmosis/cosmwasmpool/spot-price-query-msg";
  value: SpotPriceQueryMsgAmino;
}
export interface SpotPriceQueryMsgSDKType {
  spot_price: SpotPriceSDKType;
}
export interface SpotPriceQueryMsgResponse {
  /** spot_price is the spot price returned. */
  spotPrice: string;
}
export interface SpotPriceQueryMsgResponseProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.SpotPriceQueryMsgResponse";
  value: Uint8Array;
}
export interface SpotPriceQueryMsgResponseAmino {
  /** spot_price is the spot price returned. */
  spot_price: string;
}
export interface SpotPriceQueryMsgResponseAminoMsg {
  type: "osmosis/cosmwasmpool/spot-price-query-msg-response";
  value: SpotPriceQueryMsgResponseAmino;
}
export interface SpotPriceQueryMsgResponseSDKType {
  spot_price: string;
}
/** ===================== GetTotalPoolLiquidityQueryMsg */
export interface EmptyStruct {}
export interface EmptyStructProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.EmptyStruct";
  value: Uint8Array;
}
/** ===================== GetTotalPoolLiquidityQueryMsg */
export interface EmptyStructAmino {}
export interface EmptyStructAminoMsg {
  type: "osmosis/cosmwasmpool/empty-struct";
  value: EmptyStructAmino;
}
/** ===================== GetTotalPoolLiquidityQueryMsg */
export interface EmptyStructSDKType {}
export interface GetTotalPoolLiquidityQueryMsg {
  /**
   * get_total_pool_liquidity is the structure containing request field of the
   * total pool liquidity query message.
   */
  getTotalPoolLiquidity: EmptyStruct;
}
export interface GetTotalPoolLiquidityQueryMsgProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.GetTotalPoolLiquidityQueryMsg";
  value: Uint8Array;
}
export interface GetTotalPoolLiquidityQueryMsgAmino {
  /**
   * get_total_pool_liquidity is the structure containing request field of the
   * total pool liquidity query message.
   */
  get_total_pool_liquidity?: EmptyStructAmino;
}
export interface GetTotalPoolLiquidityQueryMsgAminoMsg {
  type: "osmosis/cosmwasmpool/get-total-pool-liquidity-query-msg";
  value: GetTotalPoolLiquidityQueryMsgAmino;
}
export interface GetTotalPoolLiquidityQueryMsgSDKType {
  get_total_pool_liquidity: EmptyStructSDKType;
}
export interface GetTotalPoolLiquidityQueryMsgResponse {
  /**
   * total_pool_liquidity is the total liquidity in the pool denominated in
   *  coins.
   */
  totalPoolLiquidity: Coin[];
}
export interface GetTotalPoolLiquidityQueryMsgResponseProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.GetTotalPoolLiquidityQueryMsgResponse";
  value: Uint8Array;
}
export interface GetTotalPoolLiquidityQueryMsgResponseAmino {
  /**
   * total_pool_liquidity is the total liquidity in the pool denominated in
   *  coins.
   */
  total_pool_liquidity: CoinAmino[];
}
export interface GetTotalPoolLiquidityQueryMsgResponseAminoMsg {
  type: "osmosis/cosmwasmpool/get-total-pool-liquidity-query-msg-response";
  value: GetTotalPoolLiquidityQueryMsgResponseAmino;
}
export interface GetTotalPoolLiquidityQueryMsgResponseSDKType {
  total_pool_liquidity: CoinSDKType[];
}
/** ===================== GetTotalSharesQueryMsg */
export interface GetTotalSharesQueryMsg {
  /**
   * get_total_shares is the structure containing request field of the
   * total shares query message.
   */
  getTotalShares: EmptyStruct;
}
export interface GetTotalSharesQueryMsgProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.GetTotalSharesQueryMsg";
  value: Uint8Array;
}
/** ===================== GetTotalSharesQueryMsg */
export interface GetTotalSharesQueryMsgAmino {
  /**
   * get_total_shares is the structure containing request field of the
   * total shares query message.
   */
  get_total_shares?: EmptyStructAmino;
}
export interface GetTotalSharesQueryMsgAminoMsg {
  type: "osmosis/cosmwasmpool/get-total-shares-query-msg";
  value: GetTotalSharesQueryMsgAmino;
}
/** ===================== GetTotalSharesQueryMsg */
export interface GetTotalSharesQueryMsgSDKType {
  get_total_shares: EmptyStructSDKType;
}
export interface GetTotalSharesQueryMsgResponse {
  /** total_shares is the amount of shares returned. */
  totalShares: string;
}
export interface GetTotalSharesQueryMsgResponseProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.GetTotalSharesQueryMsgResponse";
  value: Uint8Array;
}
export interface GetTotalSharesQueryMsgResponseAmino {
  /** total_shares is the amount of shares returned. */
  total_shares: string;
}
export interface GetTotalSharesQueryMsgResponseAminoMsg {
  type: "osmosis/cosmwasmpool/get-total-shares-query-msg-response";
  value: GetTotalSharesQueryMsgResponseAmino;
}
export interface GetTotalSharesQueryMsgResponseSDKType {
  total_shares: string;
}
function createBaseGetSwapFeeQueryMsg(): GetSwapFeeQueryMsg {
  return {
    getSwapFee: EmptyStruct.fromPartial({}),
  };
}
export const GetSwapFeeQueryMsg = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.GetSwapFeeQueryMsg",
  encode(
    message: GetSwapFeeQueryMsg,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.getSwapFee !== undefined) {
      EmptyStruct.encode(message.getSwapFee, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): GetSwapFeeQueryMsg {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetSwapFeeQueryMsg();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.getSwapFee = EmptyStruct.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<GetSwapFeeQueryMsg>): GetSwapFeeQueryMsg {
    const message = createBaseGetSwapFeeQueryMsg();
    message.getSwapFee =
      object.getSwapFee !== undefined && object.getSwapFee !== null
        ? EmptyStruct.fromPartial(object.getSwapFee)
        : undefined;
    return message;
  },
  fromAmino(object: GetSwapFeeQueryMsgAmino): GetSwapFeeQueryMsg {
    return {
      getSwapFee: object?.get_swap_fee
        ? EmptyStruct.fromAmino(object.get_swap_fee)
        : undefined,
    };
  },
  toAmino(message: GetSwapFeeQueryMsg): GetSwapFeeQueryMsgAmino {
    const obj: any = {};
    obj.get_swap_fee = message.getSwapFee
      ? EmptyStruct.toAmino(message.getSwapFee)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: GetSwapFeeQueryMsgAminoMsg): GetSwapFeeQueryMsg {
    return GetSwapFeeQueryMsg.fromAmino(object.value);
  },
  toAminoMsg(message: GetSwapFeeQueryMsg): GetSwapFeeQueryMsgAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/get-swap-fee-query-msg",
      value: GetSwapFeeQueryMsg.toAmino(message),
    };
  },
  fromProtoMsg(message: GetSwapFeeQueryMsgProtoMsg): GetSwapFeeQueryMsg {
    return GetSwapFeeQueryMsg.decode(message.value);
  },
  toProto(message: GetSwapFeeQueryMsg): Uint8Array {
    return GetSwapFeeQueryMsg.encode(message).finish();
  },
  toProtoMsg(message: GetSwapFeeQueryMsg): GetSwapFeeQueryMsgProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.GetSwapFeeQueryMsg",
      value: GetSwapFeeQueryMsg.encode(message).finish(),
    };
  },
};
function createBaseGetSwapFeeQueryMsgResponse(): GetSwapFeeQueryMsgResponse {
  return {
    swapFee: "",
  };
}
export const GetSwapFeeQueryMsgResponse = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.GetSwapFeeQueryMsgResponse",
  encode(
    message: GetSwapFeeQueryMsgResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.swapFee !== "") {
      writer
        .uint32(26)
        .string(Decimal.fromUserInput(message.swapFee, 18).atomics);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): GetSwapFeeQueryMsgResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetSwapFeeQueryMsgResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 3:
          message.swapFee = Decimal.fromAtomics(reader.string(), 18).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<GetSwapFeeQueryMsgResponse>
  ): GetSwapFeeQueryMsgResponse {
    const message = createBaseGetSwapFeeQueryMsgResponse();
    message.swapFee = object.swapFee ?? "";
    return message;
  },
  fromAmino(
    object: GetSwapFeeQueryMsgResponseAmino
  ): GetSwapFeeQueryMsgResponse {
    return {
      swapFee: object.swap_fee,
    };
  },
  toAmino(
    message: GetSwapFeeQueryMsgResponse
  ): GetSwapFeeQueryMsgResponseAmino {
    const obj: any = {};
    obj.swap_fee = message.swapFee;
    return obj;
  },
  fromAminoMsg(
    object: GetSwapFeeQueryMsgResponseAminoMsg
  ): GetSwapFeeQueryMsgResponse {
    return GetSwapFeeQueryMsgResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: GetSwapFeeQueryMsgResponse
  ): GetSwapFeeQueryMsgResponseAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/get-swap-fee-query-msg-response",
      value: GetSwapFeeQueryMsgResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: GetSwapFeeQueryMsgResponseProtoMsg
  ): GetSwapFeeQueryMsgResponse {
    return GetSwapFeeQueryMsgResponse.decode(message.value);
  },
  toProto(message: GetSwapFeeQueryMsgResponse): Uint8Array {
    return GetSwapFeeQueryMsgResponse.encode(message).finish();
  },
  toProtoMsg(
    message: GetSwapFeeQueryMsgResponse
  ): GetSwapFeeQueryMsgResponseProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.GetSwapFeeQueryMsgResponse",
      value: GetSwapFeeQueryMsgResponse.encode(message).finish(),
    };
  },
};
function createBaseSpotPrice(): SpotPrice {
  return {
    quoteAssetDenom: "",
    baseAssetDenom: "",
  };
}
export const SpotPrice = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.SpotPrice",
  encode(
    message: SpotPrice,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.quoteAssetDenom !== "") {
      writer.uint32(10).string(message.quoteAssetDenom);
    }
    if (message.baseAssetDenom !== "") {
      writer.uint32(18).string(message.baseAssetDenom);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): SpotPrice {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSpotPrice();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.quoteAssetDenom = reader.string();
          break;
        case 2:
          message.baseAssetDenom = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<SpotPrice>): SpotPrice {
    const message = createBaseSpotPrice();
    message.quoteAssetDenom = object.quoteAssetDenom ?? "";
    message.baseAssetDenom = object.baseAssetDenom ?? "";
    return message;
  },
  fromAmino(object: SpotPriceAmino): SpotPrice {
    return {
      quoteAssetDenom: object.quote_asset_denom,
      baseAssetDenom: object.base_asset_denom,
    };
  },
  toAmino(message: SpotPrice): SpotPriceAmino {
    const obj: any = {};
    obj.quote_asset_denom = message.quoteAssetDenom;
    obj.base_asset_denom = message.baseAssetDenom;
    return obj;
  },
  fromAminoMsg(object: SpotPriceAminoMsg): SpotPrice {
    return SpotPrice.fromAmino(object.value);
  },
  toAminoMsg(message: SpotPrice): SpotPriceAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/spot-price",
      value: SpotPrice.toAmino(message),
    };
  },
  fromProtoMsg(message: SpotPriceProtoMsg): SpotPrice {
    return SpotPrice.decode(message.value);
  },
  toProto(message: SpotPrice): Uint8Array {
    return SpotPrice.encode(message).finish();
  },
  toProtoMsg(message: SpotPrice): SpotPriceProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.SpotPrice",
      value: SpotPrice.encode(message).finish(),
    };
  },
};
function createBaseSpotPriceQueryMsg(): SpotPriceQueryMsg {
  return {
    spotPrice: SpotPrice.fromPartial({}),
  };
}
export const SpotPriceQueryMsg = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.SpotPriceQueryMsg",
  encode(
    message: SpotPriceQueryMsg,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.spotPrice !== undefined) {
      SpotPrice.encode(message.spotPrice, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): SpotPriceQueryMsg {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSpotPriceQueryMsg();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.spotPrice = SpotPrice.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<SpotPriceQueryMsg>): SpotPriceQueryMsg {
    const message = createBaseSpotPriceQueryMsg();
    message.spotPrice =
      object.spotPrice !== undefined && object.spotPrice !== null
        ? SpotPrice.fromPartial(object.spotPrice)
        : undefined;
    return message;
  },
  fromAmino(object: SpotPriceQueryMsgAmino): SpotPriceQueryMsg {
    return {
      spotPrice: object?.spot_price
        ? SpotPrice.fromAmino(object.spot_price)
        : undefined,
    };
  },
  toAmino(message: SpotPriceQueryMsg): SpotPriceQueryMsgAmino {
    const obj: any = {};
    obj.spot_price = message.spotPrice
      ? SpotPrice.toAmino(message.spotPrice)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: SpotPriceQueryMsgAminoMsg): SpotPriceQueryMsg {
    return SpotPriceQueryMsg.fromAmino(object.value);
  },
  toAminoMsg(message: SpotPriceQueryMsg): SpotPriceQueryMsgAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/spot-price-query-msg",
      value: SpotPriceQueryMsg.toAmino(message),
    };
  },
  fromProtoMsg(message: SpotPriceQueryMsgProtoMsg): SpotPriceQueryMsg {
    return SpotPriceQueryMsg.decode(message.value);
  },
  toProto(message: SpotPriceQueryMsg): Uint8Array {
    return SpotPriceQueryMsg.encode(message).finish();
  },
  toProtoMsg(message: SpotPriceQueryMsg): SpotPriceQueryMsgProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.SpotPriceQueryMsg",
      value: SpotPriceQueryMsg.encode(message).finish(),
    };
  },
};
function createBaseSpotPriceQueryMsgResponse(): SpotPriceQueryMsgResponse {
  return {
    spotPrice: "",
  };
}
export const SpotPriceQueryMsgResponse = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.SpotPriceQueryMsgResponse",
  encode(
    message: SpotPriceQueryMsgResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.spotPrice !== "") {
      writer.uint32(10).string(message.spotPrice);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): SpotPriceQueryMsgResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSpotPriceQueryMsgResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.spotPrice = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<SpotPriceQueryMsgResponse>
  ): SpotPriceQueryMsgResponse {
    const message = createBaseSpotPriceQueryMsgResponse();
    message.spotPrice = object.spotPrice ?? "";
    return message;
  },
  fromAmino(object: SpotPriceQueryMsgResponseAmino): SpotPriceQueryMsgResponse {
    return {
      spotPrice: object.spot_price,
    };
  },
  toAmino(message: SpotPriceQueryMsgResponse): SpotPriceQueryMsgResponseAmino {
    const obj: any = {};
    obj.spot_price = message.spotPrice;
    return obj;
  },
  fromAminoMsg(
    object: SpotPriceQueryMsgResponseAminoMsg
  ): SpotPriceQueryMsgResponse {
    return SpotPriceQueryMsgResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: SpotPriceQueryMsgResponse
  ): SpotPriceQueryMsgResponseAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/spot-price-query-msg-response",
      value: SpotPriceQueryMsgResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: SpotPriceQueryMsgResponseProtoMsg
  ): SpotPriceQueryMsgResponse {
    return SpotPriceQueryMsgResponse.decode(message.value);
  },
  toProto(message: SpotPriceQueryMsgResponse): Uint8Array {
    return SpotPriceQueryMsgResponse.encode(message).finish();
  },
  toProtoMsg(
    message: SpotPriceQueryMsgResponse
  ): SpotPriceQueryMsgResponseProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.SpotPriceQueryMsgResponse",
      value: SpotPriceQueryMsgResponse.encode(message).finish(),
    };
  },
};
function createBaseEmptyStruct(): EmptyStruct {
  return {};
}
export const EmptyStruct = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.EmptyStruct",
  encode(
    _: EmptyStruct,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): EmptyStruct {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEmptyStruct();
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
  fromPartial(_: Partial<EmptyStruct>): EmptyStruct {
    const message = createBaseEmptyStruct();
    return message;
  },
  fromAmino(_: EmptyStructAmino): EmptyStruct {
    return {};
  },
  toAmino(_: EmptyStruct): EmptyStructAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: EmptyStructAminoMsg): EmptyStruct {
    return EmptyStruct.fromAmino(object.value);
  },
  toAminoMsg(message: EmptyStruct): EmptyStructAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/empty-struct",
      value: EmptyStruct.toAmino(message),
    };
  },
  fromProtoMsg(message: EmptyStructProtoMsg): EmptyStruct {
    return EmptyStruct.decode(message.value);
  },
  toProto(message: EmptyStruct): Uint8Array {
    return EmptyStruct.encode(message).finish();
  },
  toProtoMsg(message: EmptyStruct): EmptyStructProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.EmptyStruct",
      value: EmptyStruct.encode(message).finish(),
    };
  },
};
function createBaseGetTotalPoolLiquidityQueryMsg(): GetTotalPoolLiquidityQueryMsg {
  return {
    getTotalPoolLiquidity: EmptyStruct.fromPartial({}),
  };
}
export const GetTotalPoolLiquidityQueryMsg = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.GetTotalPoolLiquidityQueryMsg",
  encode(
    message: GetTotalPoolLiquidityQueryMsg,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.getTotalPoolLiquidity !== undefined) {
      EmptyStruct.encode(
        message.getTotalPoolLiquidity,
        writer.uint32(10).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): GetTotalPoolLiquidityQueryMsg {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetTotalPoolLiquidityQueryMsg();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.getTotalPoolLiquidity = EmptyStruct.decode(
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
    object: Partial<GetTotalPoolLiquidityQueryMsg>
  ): GetTotalPoolLiquidityQueryMsg {
    const message = createBaseGetTotalPoolLiquidityQueryMsg();
    message.getTotalPoolLiquidity =
      object.getTotalPoolLiquidity !== undefined &&
      object.getTotalPoolLiquidity !== null
        ? EmptyStruct.fromPartial(object.getTotalPoolLiquidity)
        : undefined;
    return message;
  },
  fromAmino(
    object: GetTotalPoolLiquidityQueryMsgAmino
  ): GetTotalPoolLiquidityQueryMsg {
    return {
      getTotalPoolLiquidity: object?.get_total_pool_liquidity
        ? EmptyStruct.fromAmino(object.get_total_pool_liquidity)
        : undefined,
    };
  },
  toAmino(
    message: GetTotalPoolLiquidityQueryMsg
  ): GetTotalPoolLiquidityQueryMsgAmino {
    const obj: any = {};
    obj.get_total_pool_liquidity = message.getTotalPoolLiquidity
      ? EmptyStruct.toAmino(message.getTotalPoolLiquidity)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: GetTotalPoolLiquidityQueryMsgAminoMsg
  ): GetTotalPoolLiquidityQueryMsg {
    return GetTotalPoolLiquidityQueryMsg.fromAmino(object.value);
  },
  toAminoMsg(
    message: GetTotalPoolLiquidityQueryMsg
  ): GetTotalPoolLiquidityQueryMsgAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/get-total-pool-liquidity-query-msg",
      value: GetTotalPoolLiquidityQueryMsg.toAmino(message),
    };
  },
  fromProtoMsg(
    message: GetTotalPoolLiquidityQueryMsgProtoMsg
  ): GetTotalPoolLiquidityQueryMsg {
    return GetTotalPoolLiquidityQueryMsg.decode(message.value);
  },
  toProto(message: GetTotalPoolLiquidityQueryMsg): Uint8Array {
    return GetTotalPoolLiquidityQueryMsg.encode(message).finish();
  },
  toProtoMsg(
    message: GetTotalPoolLiquidityQueryMsg
  ): GetTotalPoolLiquidityQueryMsgProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.GetTotalPoolLiquidityQueryMsg",
      value: GetTotalPoolLiquidityQueryMsg.encode(message).finish(),
    };
  },
};
function createBaseGetTotalPoolLiquidityQueryMsgResponse(): GetTotalPoolLiquidityQueryMsgResponse {
  return {
    totalPoolLiquidity: [],
  };
}
export const GetTotalPoolLiquidityQueryMsgResponse = {
  typeUrl:
    "/osmosis.cosmwasmpool.v1beta1.GetTotalPoolLiquidityQueryMsgResponse",
  encode(
    message: GetTotalPoolLiquidityQueryMsgResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    for (const v of message.totalPoolLiquidity) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): GetTotalPoolLiquidityQueryMsgResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetTotalPoolLiquidityQueryMsgResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.totalPoolLiquidity.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<GetTotalPoolLiquidityQueryMsgResponse>
  ): GetTotalPoolLiquidityQueryMsgResponse {
    const message = createBaseGetTotalPoolLiquidityQueryMsgResponse();
    message.totalPoolLiquidity =
      object.totalPoolLiquidity?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: GetTotalPoolLiquidityQueryMsgResponseAmino
  ): GetTotalPoolLiquidityQueryMsgResponse {
    return {
      totalPoolLiquidity: Array.isArray(object?.total_pool_liquidity)
        ? object.total_pool_liquidity.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: GetTotalPoolLiquidityQueryMsgResponse
  ): GetTotalPoolLiquidityQueryMsgResponseAmino {
    const obj: any = {};
    if (message.totalPoolLiquidity) {
      obj.total_pool_liquidity = message.totalPoolLiquidity.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.total_pool_liquidity = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: GetTotalPoolLiquidityQueryMsgResponseAminoMsg
  ): GetTotalPoolLiquidityQueryMsgResponse {
    return GetTotalPoolLiquidityQueryMsgResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: GetTotalPoolLiquidityQueryMsgResponse
  ): GetTotalPoolLiquidityQueryMsgResponseAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/get-total-pool-liquidity-query-msg-response",
      value: GetTotalPoolLiquidityQueryMsgResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: GetTotalPoolLiquidityQueryMsgResponseProtoMsg
  ): GetTotalPoolLiquidityQueryMsgResponse {
    return GetTotalPoolLiquidityQueryMsgResponse.decode(message.value);
  },
  toProto(message: GetTotalPoolLiquidityQueryMsgResponse): Uint8Array {
    return GetTotalPoolLiquidityQueryMsgResponse.encode(message).finish();
  },
  toProtoMsg(
    message: GetTotalPoolLiquidityQueryMsgResponse
  ): GetTotalPoolLiquidityQueryMsgResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.cosmwasmpool.v1beta1.GetTotalPoolLiquidityQueryMsgResponse",
      value: GetTotalPoolLiquidityQueryMsgResponse.encode(message).finish(),
    };
  },
};
function createBaseGetTotalSharesQueryMsg(): GetTotalSharesQueryMsg {
  return {
    getTotalShares: EmptyStruct.fromPartial({}),
  };
}
export const GetTotalSharesQueryMsg = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.GetTotalSharesQueryMsg",
  encode(
    message: GetTotalSharesQueryMsg,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.getTotalShares !== undefined) {
      EmptyStruct.encode(
        message.getTotalShares,
        writer.uint32(10).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): GetTotalSharesQueryMsg {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetTotalSharesQueryMsg();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.getTotalShares = EmptyStruct.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<GetTotalSharesQueryMsg>): GetTotalSharesQueryMsg {
    const message = createBaseGetTotalSharesQueryMsg();
    message.getTotalShares =
      object.getTotalShares !== undefined && object.getTotalShares !== null
        ? EmptyStruct.fromPartial(object.getTotalShares)
        : undefined;
    return message;
  },
  fromAmino(object: GetTotalSharesQueryMsgAmino): GetTotalSharesQueryMsg {
    return {
      getTotalShares: object?.get_total_shares
        ? EmptyStruct.fromAmino(object.get_total_shares)
        : undefined,
    };
  },
  toAmino(message: GetTotalSharesQueryMsg): GetTotalSharesQueryMsgAmino {
    const obj: any = {};
    obj.get_total_shares = message.getTotalShares
      ? EmptyStruct.toAmino(message.getTotalShares)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: GetTotalSharesQueryMsgAminoMsg): GetTotalSharesQueryMsg {
    return GetTotalSharesQueryMsg.fromAmino(object.value);
  },
  toAminoMsg(message: GetTotalSharesQueryMsg): GetTotalSharesQueryMsgAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/get-total-shares-query-msg",
      value: GetTotalSharesQueryMsg.toAmino(message),
    };
  },
  fromProtoMsg(
    message: GetTotalSharesQueryMsgProtoMsg
  ): GetTotalSharesQueryMsg {
    return GetTotalSharesQueryMsg.decode(message.value);
  },
  toProto(message: GetTotalSharesQueryMsg): Uint8Array {
    return GetTotalSharesQueryMsg.encode(message).finish();
  },
  toProtoMsg(message: GetTotalSharesQueryMsg): GetTotalSharesQueryMsgProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.GetTotalSharesQueryMsg",
      value: GetTotalSharesQueryMsg.encode(message).finish(),
    };
  },
};
function createBaseGetTotalSharesQueryMsgResponse(): GetTotalSharesQueryMsgResponse {
  return {
    totalShares: "",
  };
}
export const GetTotalSharesQueryMsgResponse = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.GetTotalSharesQueryMsgResponse",
  encode(
    message: GetTotalSharesQueryMsgResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.totalShares !== "") {
      writer.uint32(10).string(message.totalShares);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): GetTotalSharesQueryMsgResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetTotalSharesQueryMsgResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.totalShares = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<GetTotalSharesQueryMsgResponse>
  ): GetTotalSharesQueryMsgResponse {
    const message = createBaseGetTotalSharesQueryMsgResponse();
    message.totalShares = object.totalShares ?? "";
    return message;
  },
  fromAmino(
    object: GetTotalSharesQueryMsgResponseAmino
  ): GetTotalSharesQueryMsgResponse {
    return {
      totalShares: object.total_shares,
    };
  },
  toAmino(
    message: GetTotalSharesQueryMsgResponse
  ): GetTotalSharesQueryMsgResponseAmino {
    const obj: any = {};
    obj.total_shares = message.totalShares;
    return obj;
  },
  fromAminoMsg(
    object: GetTotalSharesQueryMsgResponseAminoMsg
  ): GetTotalSharesQueryMsgResponse {
    return GetTotalSharesQueryMsgResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: GetTotalSharesQueryMsgResponse
  ): GetTotalSharesQueryMsgResponseAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/get-total-shares-query-msg-response",
      value: GetTotalSharesQueryMsgResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: GetTotalSharesQueryMsgResponseProtoMsg
  ): GetTotalSharesQueryMsgResponse {
    return GetTotalSharesQueryMsgResponse.decode(message.value);
  },
  toProto(message: GetTotalSharesQueryMsgResponse): Uint8Array {
    return GetTotalSharesQueryMsgResponse.encode(message).finish();
  },
  toProtoMsg(
    message: GetTotalSharesQueryMsgResponse
  ): GetTotalSharesQueryMsgResponseProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.GetTotalSharesQueryMsgResponse",
      value: GetTotalSharesQueryMsgResponse.encode(message).finish(),
    };
  },
};
