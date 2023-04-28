import * as _m0 from "protobufjs/minimal";

import {
  PageRequest,
  PageRequestAmino,
  PageRequestSDKType,
  PageResponse,
  PageResponseAmino,
  PageResponseSDKType,
} from "../../../cosmos/base/query/v1beta1/pagination";
import {
  Coin,
  CoinAmino,
  CoinSDKType,
} from "../../../cosmos/base/v1beta1/coin";
import {
  Any,
  AnyAmino,
  AnyProtoMsg,
  AnySDKType,
} from "../../../google/protobuf/any";
import { Long } from "../../../helpers";
import { Pool as Pool1 } from "../../concentrated-liquidity/pool";
import { PoolProtoMsg as Pool1ProtoMsg } from "../../concentrated-liquidity/pool";
import { PoolSDKType as Pool1SDKType } from "../../concentrated-liquidity/pool";
import {
  CosmWasmPool,
  CosmWasmPoolProtoMsg,
  CosmWasmPoolSDKType,
} from "../../cosmwasmpool/v1beta1/model/pool";
import {
  SwapAmountInRoute,
  SwapAmountInRouteAmino,
  SwapAmountInRouteSDKType,
  SwapAmountOutRoute,
  SwapAmountOutRouteAmino,
  SwapAmountOutRouteSDKType,
} from "../../poolmanager/v1beta1/swap_route";
import { Pool as Pool2 } from "../pool-models/balancer/balancerPool";
import { PoolProtoMsg as Pool2ProtoMsg } from "../pool-models/balancer/balancerPool";
import { PoolSDKType as Pool2SDKType } from "../pool-models/balancer/balancerPool";
import { Pool as Pool3 } from "../pool-models/stableswap/stableswap_pool";
import { PoolProtoMsg as Pool3ProtoMsg } from "../pool-models/stableswap/stableswap_pool";
import { PoolSDKType as Pool3SDKType } from "../pool-models/stableswap/stableswap_pool";
/**
 * =============================== Pool
 * Deprecated: please use the alternative in x/poolmanager
 */
/** @deprecated */
export interface QueryPoolRequest {
  poolId: Long;
}
export interface QueryPoolRequestProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryPoolRequest";
  value: Uint8Array;
}
/**
 * =============================== Pool
 * Deprecated: please use the alternative in x/poolmanager
 */
/** @deprecated */
export interface QueryPoolRequestAmino {
  pool_id: string;
}
export interface QueryPoolRequestAminoMsg {
  type: "osmosis/gamm/query-pool-request";
  value: QueryPoolRequestAmino;
}
/**
 * =============================== Pool
 * Deprecated: please use the alternative in x/poolmanager
 */
/** @deprecated */
export interface QueryPoolRequestSDKType {
  pool_id: Long;
}
/** Deprecated: please use the alternative in x/poolmanager */
/** @deprecated */
export interface QueryPoolResponse {
  pool?: (Pool1 & CosmWasmPool & Pool2 & Pool3 & Any) | undefined;
}
export interface QueryPoolResponseProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryPoolResponse";
  value: Uint8Array;
}
export type QueryPoolResponseEncoded = Omit<QueryPoolResponse, "pool"> & {
  pool?:
    | Pool1ProtoMsg
    | CosmWasmPoolProtoMsg
    | Pool2ProtoMsg
    | Pool3ProtoMsg
    | AnyProtoMsg
    | undefined;
};
/** Deprecated: please use the alternative in x/poolmanager */
/** @deprecated */
export interface QueryPoolResponseAmino {
  pool?: AnyAmino;
}
export interface QueryPoolResponseAminoMsg {
  type: "osmosis/gamm/query-pool-response";
  value: QueryPoolResponseAmino;
}
/** Deprecated: please use the alternative in x/poolmanager */
/** @deprecated */
export interface QueryPoolResponseSDKType {
  pool?:
    | Pool1SDKType
    | CosmWasmPoolSDKType
    | Pool2SDKType
    | Pool3SDKType
    | AnySDKType
    | undefined;
}
/** =============================== Pools */
export interface QueryPoolsRequest {
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequest;
}
export interface QueryPoolsRequestProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryPoolsRequest";
  value: Uint8Array;
}
/** =============================== Pools */
export interface QueryPoolsRequestAmino {
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequestAmino;
}
export interface QueryPoolsRequestAminoMsg {
  type: "osmosis/gamm/query-pools-request";
  value: QueryPoolsRequestAmino;
}
/** =============================== Pools */
export interface QueryPoolsRequestSDKType {
  pagination?: PageRequestSDKType;
}
export interface QueryPoolsResponse {
  pools: (Pool1 & CosmWasmPool & Pool2 & Pool3 & Any)[] | Any[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}
export interface QueryPoolsResponseProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryPoolsResponse";
  value: Uint8Array;
}
export type QueryPoolsResponseEncoded = Omit<QueryPoolsResponse, "pools"> & {
  pools: (
    | Pool1ProtoMsg
    | CosmWasmPoolProtoMsg
    | Pool2ProtoMsg
    | Pool3ProtoMsg
    | AnyProtoMsg
  )[];
};
export interface QueryPoolsResponseAmino {
  pools: AnyAmino[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponseAmino;
}
export interface QueryPoolsResponseAminoMsg {
  type: "osmosis/gamm/query-pools-response";
  value: QueryPoolsResponseAmino;
}
export interface QueryPoolsResponseSDKType {
  pools: (
    | Pool1SDKType
    | CosmWasmPoolSDKType
    | Pool2SDKType
    | Pool3SDKType
    | AnySDKType
  )[];
  pagination?: PageResponseSDKType;
}
/** =============================== NumPools */
/** @deprecated */
export interface QueryNumPoolsRequest {}
export interface QueryNumPoolsRequestProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryNumPoolsRequest";
  value: Uint8Array;
}
/** =============================== NumPools */
/** @deprecated */
export interface QueryNumPoolsRequestAmino {}
export interface QueryNumPoolsRequestAminoMsg {
  type: "osmosis/gamm/query-num-pools-request";
  value: QueryNumPoolsRequestAmino;
}
/** =============================== NumPools */
/** @deprecated */
export interface QueryNumPoolsRequestSDKType {}
/** @deprecated */
export interface QueryNumPoolsResponse {
  numPools: Long;
}
export interface QueryNumPoolsResponseProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryNumPoolsResponse";
  value: Uint8Array;
}
/** @deprecated */
export interface QueryNumPoolsResponseAmino {
  num_pools: string;
}
export interface QueryNumPoolsResponseAminoMsg {
  type: "osmosis/gamm/query-num-pools-response";
  value: QueryNumPoolsResponseAmino;
}
/** @deprecated */
export interface QueryNumPoolsResponseSDKType {
  num_pools: Long;
}
/** =============================== PoolType */
export interface QueryPoolTypeRequest {
  poolId: Long;
}
export interface QueryPoolTypeRequestProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryPoolTypeRequest";
  value: Uint8Array;
}
/** =============================== PoolType */
export interface QueryPoolTypeRequestAmino {
  pool_id: string;
}
export interface QueryPoolTypeRequestAminoMsg {
  type: "osmosis/gamm/query-pool-type-request";
  value: QueryPoolTypeRequestAmino;
}
/** =============================== PoolType */
export interface QueryPoolTypeRequestSDKType {
  pool_id: Long;
}
export interface QueryPoolTypeResponse {
  poolType: string;
}
export interface QueryPoolTypeResponseProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryPoolTypeResponse";
  value: Uint8Array;
}
export interface QueryPoolTypeResponseAmino {
  pool_type: string;
}
export interface QueryPoolTypeResponseAminoMsg {
  type: "osmosis/gamm/query-pool-type-response";
  value: QueryPoolTypeResponseAmino;
}
export interface QueryPoolTypeResponseSDKType {
  pool_type: string;
}
/** =============================== CalcJoinPoolShares */
export interface QueryCalcJoinPoolSharesRequest {
  poolId: Long;
  tokensIn: Coin[];
}
export interface QueryCalcJoinPoolSharesRequestProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryCalcJoinPoolSharesRequest";
  value: Uint8Array;
}
/** =============================== CalcJoinPoolShares */
export interface QueryCalcJoinPoolSharesRequestAmino {
  pool_id: string;
  tokens_in: CoinAmino[];
}
export interface QueryCalcJoinPoolSharesRequestAminoMsg {
  type: "osmosis/gamm/query-calc-join-pool-shares-request";
  value: QueryCalcJoinPoolSharesRequestAmino;
}
/** =============================== CalcJoinPoolShares */
export interface QueryCalcJoinPoolSharesRequestSDKType {
  pool_id: Long;
  tokens_in: CoinSDKType[];
}
export interface QueryCalcJoinPoolSharesResponse {
  shareOutAmount: string;
  tokensOut: Coin[];
}
export interface QueryCalcJoinPoolSharesResponseProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryCalcJoinPoolSharesResponse";
  value: Uint8Array;
}
export interface QueryCalcJoinPoolSharesResponseAmino {
  share_out_amount: string;
  tokens_out: CoinAmino[];
}
export interface QueryCalcJoinPoolSharesResponseAminoMsg {
  type: "osmosis/gamm/query-calc-join-pool-shares-response";
  value: QueryCalcJoinPoolSharesResponseAmino;
}
export interface QueryCalcJoinPoolSharesResponseSDKType {
  share_out_amount: string;
  tokens_out: CoinSDKType[];
}
/** =============================== CalcExitPoolCoinsFromShares */
export interface QueryCalcExitPoolCoinsFromSharesRequest {
  poolId: Long;
  shareInAmount: string;
}
export interface QueryCalcExitPoolCoinsFromSharesRequestProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryCalcExitPoolCoinsFromSharesRequest";
  value: Uint8Array;
}
/** =============================== CalcExitPoolCoinsFromShares */
export interface QueryCalcExitPoolCoinsFromSharesRequestAmino {
  pool_id: string;
  share_in_amount: string;
}
export interface QueryCalcExitPoolCoinsFromSharesRequestAminoMsg {
  type: "osmosis/gamm/query-calc-exit-pool-coins-from-shares-request";
  value: QueryCalcExitPoolCoinsFromSharesRequestAmino;
}
/** =============================== CalcExitPoolCoinsFromShares */
export interface QueryCalcExitPoolCoinsFromSharesRequestSDKType {
  pool_id: Long;
  share_in_amount: string;
}
export interface QueryCalcExitPoolCoinsFromSharesResponse {
  tokensOut: Coin[];
}
export interface QueryCalcExitPoolCoinsFromSharesResponseProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryCalcExitPoolCoinsFromSharesResponse";
  value: Uint8Array;
}
export interface QueryCalcExitPoolCoinsFromSharesResponseAmino {
  tokens_out: CoinAmino[];
}
export interface QueryCalcExitPoolCoinsFromSharesResponseAminoMsg {
  type: "osmosis/gamm/query-calc-exit-pool-coins-from-shares-response";
  value: QueryCalcExitPoolCoinsFromSharesResponseAmino;
}
export interface QueryCalcExitPoolCoinsFromSharesResponseSDKType {
  tokens_out: CoinSDKType[];
}
/** =============================== PoolParams */
export interface QueryPoolParamsRequest {
  poolId: Long;
}
export interface QueryPoolParamsRequestProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryPoolParamsRequest";
  value: Uint8Array;
}
/** =============================== PoolParams */
export interface QueryPoolParamsRequestAmino {
  pool_id: string;
}
export interface QueryPoolParamsRequestAminoMsg {
  type: "osmosis/gamm/query-pool-params-request";
  value: QueryPoolParamsRequestAmino;
}
/** =============================== PoolParams */
export interface QueryPoolParamsRequestSDKType {
  pool_id: Long;
}
export interface QueryPoolParamsResponse {
  params?: Any;
}
export interface QueryPoolParamsResponseProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryPoolParamsResponse";
  value: Uint8Array;
}
export interface QueryPoolParamsResponseAmino {
  params?: AnyAmino;
}
export interface QueryPoolParamsResponseAminoMsg {
  type: "osmosis/gamm/query-pool-params-response";
  value: QueryPoolParamsResponseAmino;
}
export interface QueryPoolParamsResponseSDKType {
  params?: AnySDKType;
}
/** =============================== PoolLiquidity */
export interface QueryTotalPoolLiquidityRequest {
  poolId: Long;
}
export interface QueryTotalPoolLiquidityRequestProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryTotalPoolLiquidityRequest";
  value: Uint8Array;
}
/** =============================== PoolLiquidity */
export interface QueryTotalPoolLiquidityRequestAmino {
  pool_id: string;
}
export interface QueryTotalPoolLiquidityRequestAminoMsg {
  type: "osmosis/gamm/query-total-pool-liquidity-request";
  value: QueryTotalPoolLiquidityRequestAmino;
}
/** =============================== PoolLiquidity */
export interface QueryTotalPoolLiquidityRequestSDKType {
  pool_id: Long;
}
export interface QueryTotalPoolLiquidityResponse {
  liquidity: Coin[];
}
export interface QueryTotalPoolLiquidityResponseProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryTotalPoolLiquidityResponse";
  value: Uint8Array;
}
export interface QueryTotalPoolLiquidityResponseAmino {
  liquidity: CoinAmino[];
}
export interface QueryTotalPoolLiquidityResponseAminoMsg {
  type: "osmosis/gamm/query-total-pool-liquidity-response";
  value: QueryTotalPoolLiquidityResponseAmino;
}
export interface QueryTotalPoolLiquidityResponseSDKType {
  liquidity: CoinSDKType[];
}
/** =============================== TotalShares */
export interface QueryTotalSharesRequest {
  poolId: Long;
}
export interface QueryTotalSharesRequestProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryTotalSharesRequest";
  value: Uint8Array;
}
/** =============================== TotalShares */
export interface QueryTotalSharesRequestAmino {
  pool_id: string;
}
export interface QueryTotalSharesRequestAminoMsg {
  type: "osmosis/gamm/query-total-shares-request";
  value: QueryTotalSharesRequestAmino;
}
/** =============================== TotalShares */
export interface QueryTotalSharesRequestSDKType {
  pool_id: Long;
}
export interface QueryTotalSharesResponse {
  totalShares?: Coin;
}
export interface QueryTotalSharesResponseProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryTotalSharesResponse";
  value: Uint8Array;
}
export interface QueryTotalSharesResponseAmino {
  total_shares?: CoinAmino;
}
export interface QueryTotalSharesResponseAminoMsg {
  type: "osmosis/gamm/query-total-shares-response";
  value: QueryTotalSharesResponseAmino;
}
export interface QueryTotalSharesResponseSDKType {
  total_shares?: CoinSDKType;
}
/** =============================== CalcJoinPoolNoSwapShares */
export interface QueryCalcJoinPoolNoSwapSharesRequest {
  poolId: Long;
  tokensIn: Coin[];
}
export interface QueryCalcJoinPoolNoSwapSharesRequestProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryCalcJoinPoolNoSwapSharesRequest";
  value: Uint8Array;
}
/** =============================== CalcJoinPoolNoSwapShares */
export interface QueryCalcJoinPoolNoSwapSharesRequestAmino {
  pool_id: string;
  tokens_in: CoinAmino[];
}
export interface QueryCalcJoinPoolNoSwapSharesRequestAminoMsg {
  type: "osmosis/gamm/query-calc-join-pool-no-swap-shares-request";
  value: QueryCalcJoinPoolNoSwapSharesRequestAmino;
}
/** =============================== CalcJoinPoolNoSwapShares */
export interface QueryCalcJoinPoolNoSwapSharesRequestSDKType {
  pool_id: Long;
  tokens_in: CoinSDKType[];
}
export interface QueryCalcJoinPoolNoSwapSharesResponse {
  tokensOut: Coin[];
  sharesOut: string;
}
export interface QueryCalcJoinPoolNoSwapSharesResponseProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryCalcJoinPoolNoSwapSharesResponse";
  value: Uint8Array;
}
export interface QueryCalcJoinPoolNoSwapSharesResponseAmino {
  tokens_out: CoinAmino[];
  shares_out: string;
}
export interface QueryCalcJoinPoolNoSwapSharesResponseAminoMsg {
  type: "osmosis/gamm/query-calc-join-pool-no-swap-shares-response";
  value: QueryCalcJoinPoolNoSwapSharesResponseAmino;
}
export interface QueryCalcJoinPoolNoSwapSharesResponseSDKType {
  tokens_out: CoinSDKType[];
  shares_out: string;
}
/**
 * QuerySpotPriceRequest defines the gRPC request structure for a SpotPrice
 * query.
 */
/** @deprecated */
export interface QuerySpotPriceRequest {
  poolId: Long;
  baseAssetDenom: string;
  quoteAssetDenom: string;
}
export interface QuerySpotPriceRequestProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QuerySpotPriceRequest";
  value: Uint8Array;
}
/**
 * QuerySpotPriceRequest defines the gRPC request structure for a SpotPrice
 * query.
 */
/** @deprecated */
export interface QuerySpotPriceRequestAmino {
  pool_id: string;
  base_asset_denom: string;
  quote_asset_denom: string;
}
export interface QuerySpotPriceRequestAminoMsg {
  type: "osmosis/gamm/query-spot-price-request";
  value: QuerySpotPriceRequestAmino;
}
/**
 * QuerySpotPriceRequest defines the gRPC request structure for a SpotPrice
 * query.
 */
/** @deprecated */
export interface QuerySpotPriceRequestSDKType {
  pool_id: Long;
  base_asset_denom: string;
  quote_asset_denom: string;
}
export interface QueryPoolsWithFilterRequest {
  /**
   * String of the coins in single string seperated by comma. Ex)
   * 10uatom,100uosmo
   */
  minLiquidity: string;
  poolType: string;
  pagination?: PageRequest;
}
export interface QueryPoolsWithFilterRequestProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryPoolsWithFilterRequest";
  value: Uint8Array;
}
export interface QueryPoolsWithFilterRequestAmino {
  /**
   * String of the coins in single string seperated by comma. Ex)
   * 10uatom,100uosmo
   */
  min_liquidity: string;
  pool_type: string;
  pagination?: PageRequestAmino;
}
export interface QueryPoolsWithFilterRequestAminoMsg {
  type: "osmosis/gamm/query-pools-with-filter-request";
  value: QueryPoolsWithFilterRequestAmino;
}
export interface QueryPoolsWithFilterRequestSDKType {
  min_liquidity: string;
  pool_type: string;
  pagination?: PageRequestSDKType;
}
export interface QueryPoolsWithFilterResponse {
  pools: (Pool1 & CosmWasmPool & Pool2 & Pool3 & Any)[] | Any[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}
export interface QueryPoolsWithFilterResponseProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryPoolsWithFilterResponse";
  value: Uint8Array;
}
export type QueryPoolsWithFilterResponseEncoded = Omit<
  QueryPoolsWithFilterResponse,
  "pools"
> & {
  pools: (
    | Pool1ProtoMsg
    | CosmWasmPoolProtoMsg
    | Pool2ProtoMsg
    | Pool3ProtoMsg
    | AnyProtoMsg
  )[];
};
export interface QueryPoolsWithFilterResponseAmino {
  pools: AnyAmino[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponseAmino;
}
export interface QueryPoolsWithFilterResponseAminoMsg {
  type: "osmosis/gamm/query-pools-with-filter-response";
  value: QueryPoolsWithFilterResponseAmino;
}
export interface QueryPoolsWithFilterResponseSDKType {
  pools: (
    | Pool1SDKType
    | CosmWasmPoolSDKType
    | Pool2SDKType
    | Pool3SDKType
    | AnySDKType
  )[];
  pagination?: PageResponseSDKType;
}
/**
 * QuerySpotPriceResponse defines the gRPC response structure for a SpotPrice
 * query.
 */
/** @deprecated */
export interface QuerySpotPriceResponse {
  /** String of the Dec. Ex) 10.203uatom */
  spotPrice: string;
}
export interface QuerySpotPriceResponseProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QuerySpotPriceResponse";
  value: Uint8Array;
}
/**
 * QuerySpotPriceResponse defines the gRPC response structure for a SpotPrice
 * query.
 */
/** @deprecated */
export interface QuerySpotPriceResponseAmino {
  /** String of the Dec. Ex) 10.203uatom */
  spot_price: string;
}
export interface QuerySpotPriceResponseAminoMsg {
  type: "osmosis/gamm/query-spot-price-response";
  value: QuerySpotPriceResponseAmino;
}
/**
 * QuerySpotPriceResponse defines the gRPC response structure for a SpotPrice
 * query.
 */
/** @deprecated */
export interface QuerySpotPriceResponseSDKType {
  spot_price: string;
}
/** =============================== EstimateSwapExactAmountIn */
/** @deprecated */
export interface QuerySwapExactAmountInRequest {
  sender: string;
  poolId: Long;
  tokenIn: string;
  routes: SwapAmountInRoute[];
}
export interface QuerySwapExactAmountInRequestProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QuerySwapExactAmountInRequest";
  value: Uint8Array;
}
/** =============================== EstimateSwapExactAmountIn */
/** @deprecated */
export interface QuerySwapExactAmountInRequestAmino {
  sender: string;
  pool_id: string;
  token_in: string;
  routes: SwapAmountInRouteAmino[];
}
export interface QuerySwapExactAmountInRequestAminoMsg {
  type: "osmosis/gamm/query-swap-exact-amount-in-request";
  value: QuerySwapExactAmountInRequestAmino;
}
/** =============================== EstimateSwapExactAmountIn */
/** @deprecated */
export interface QuerySwapExactAmountInRequestSDKType {
  sender: string;
  pool_id: Long;
  token_in: string;
  routes: SwapAmountInRouteSDKType[];
}
/** @deprecated */
export interface QuerySwapExactAmountInResponse {
  tokenOutAmount: string;
}
export interface QuerySwapExactAmountInResponseProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QuerySwapExactAmountInResponse";
  value: Uint8Array;
}
/** @deprecated */
export interface QuerySwapExactAmountInResponseAmino {
  token_out_amount: string;
}
export interface QuerySwapExactAmountInResponseAminoMsg {
  type: "osmosis/gamm/query-swap-exact-amount-in-response";
  value: QuerySwapExactAmountInResponseAmino;
}
/** @deprecated */
export interface QuerySwapExactAmountInResponseSDKType {
  token_out_amount: string;
}
/** =============================== EstimateSwapExactAmountOut */
/** @deprecated */
export interface QuerySwapExactAmountOutRequest {
  sender: string;
  poolId: Long;
  routes: SwapAmountOutRoute[];
  tokenOut: string;
}
export interface QuerySwapExactAmountOutRequestProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QuerySwapExactAmountOutRequest";
  value: Uint8Array;
}
/** =============================== EstimateSwapExactAmountOut */
/** @deprecated */
export interface QuerySwapExactAmountOutRequestAmino {
  sender: string;
  pool_id: string;
  routes: SwapAmountOutRouteAmino[];
  token_out: string;
}
export interface QuerySwapExactAmountOutRequestAminoMsg {
  type: "osmosis/gamm/query-swap-exact-amount-out-request";
  value: QuerySwapExactAmountOutRequestAmino;
}
/** =============================== EstimateSwapExactAmountOut */
/** @deprecated */
export interface QuerySwapExactAmountOutRequestSDKType {
  sender: string;
  pool_id: Long;
  routes: SwapAmountOutRouteSDKType[];
  token_out: string;
}
/** @deprecated */
export interface QuerySwapExactAmountOutResponse {
  tokenInAmount: string;
}
export interface QuerySwapExactAmountOutResponseProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QuerySwapExactAmountOutResponse";
  value: Uint8Array;
}
/** @deprecated */
export interface QuerySwapExactAmountOutResponseAmino {
  token_in_amount: string;
}
export interface QuerySwapExactAmountOutResponseAminoMsg {
  type: "osmosis/gamm/query-swap-exact-amount-out-response";
  value: QuerySwapExactAmountOutResponseAmino;
}
/** @deprecated */
export interface QuerySwapExactAmountOutResponseSDKType {
  token_in_amount: string;
}
export interface QueryTotalLiquidityRequest {}
export interface QueryTotalLiquidityRequestProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryTotalLiquidityRequest";
  value: Uint8Array;
}
export interface QueryTotalLiquidityRequestAmino {}
export interface QueryTotalLiquidityRequestAminoMsg {
  type: "osmosis/gamm/query-total-liquidity-request";
  value: QueryTotalLiquidityRequestAmino;
}
export interface QueryTotalLiquidityRequestSDKType {}
export interface QueryTotalLiquidityResponse {
  liquidity: Coin[];
}
export interface QueryTotalLiquidityResponseProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.QueryTotalLiquidityResponse";
  value: Uint8Array;
}
export interface QueryTotalLiquidityResponseAmino {
  liquidity: CoinAmino[];
}
export interface QueryTotalLiquidityResponseAminoMsg {
  type: "osmosis/gamm/query-total-liquidity-response";
  value: QueryTotalLiquidityResponseAmino;
}
export interface QueryTotalLiquidityResponseSDKType {
  liquidity: CoinSDKType[];
}
function createBaseQueryPoolRequest(): QueryPoolRequest {
  return {
    poolId: Long.UZERO,
  };
}
export const QueryPoolRequest = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryPoolRequest",
  encode(
    message: QueryPoolRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.poolId.isZero()) {
      writer.uint32(8).uint64(message.poolId);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): QueryPoolRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryPoolRequest();
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
  fromPartial(object: Partial<QueryPoolRequest>): QueryPoolRequest {
    const message = createBaseQueryPoolRequest();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: QueryPoolRequestAmino): QueryPoolRequest {
    return {
      poolId: Long.fromString(object.pool_id),
    };
  },
  toAmino(message: QueryPoolRequest): QueryPoolRequestAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryPoolRequestAminoMsg): QueryPoolRequest {
    return QueryPoolRequest.fromAmino(object.value);
  },
  toAminoMsg(message: QueryPoolRequest): QueryPoolRequestAminoMsg {
    return {
      type: "osmosis/gamm/query-pool-request",
      value: QueryPoolRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryPoolRequestProtoMsg): QueryPoolRequest {
    return QueryPoolRequest.decode(message.value);
  },
  toProto(message: QueryPoolRequest): Uint8Array {
    return QueryPoolRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryPoolRequest): QueryPoolRequestProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryPoolRequest",
      value: QueryPoolRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryPoolResponse(): QueryPoolResponse {
  return {
    pool: undefined,
  };
}
export const QueryPoolResponse = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryPoolResponse",
  encode(
    message: QueryPoolResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.pool !== undefined) {
      Any.encode(message.pool as Any, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): QueryPoolResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryPoolResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pool = PoolI_InterfaceDecoder(reader) as Any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryPoolResponse>): QueryPoolResponse {
    const message = createBaseQueryPoolResponse();
    message.pool =
      object.pool !== undefined && object.pool !== null
        ? Any.fromPartial(object.pool)
        : undefined;
    return message;
  },
  fromAmino(object: QueryPoolResponseAmino): QueryPoolResponse {
    return {
      pool: object?.pool ? PoolI_FromAmino(object.pool) : undefined,
    };
  },
  toAmino(message: QueryPoolResponse): QueryPoolResponseAmino {
    const obj: any = {};
    obj.pool = message.pool ? PoolI_ToAmino(message.pool as Any) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryPoolResponseAminoMsg): QueryPoolResponse {
    return QueryPoolResponse.fromAmino(object.value);
  },
  toAminoMsg(message: QueryPoolResponse): QueryPoolResponseAminoMsg {
    return {
      type: "osmosis/gamm/query-pool-response",
      value: QueryPoolResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryPoolResponseProtoMsg): QueryPoolResponse {
    return QueryPoolResponse.decode(message.value);
  },
  toProto(message: QueryPoolResponse): Uint8Array {
    return QueryPoolResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryPoolResponse): QueryPoolResponseProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryPoolResponse",
      value: QueryPoolResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryPoolsRequest(): QueryPoolsRequest {
  return {
    pagination: undefined,
  };
}
export const QueryPoolsRequest = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryPoolsRequest",
  encode(
    message: QueryPoolsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): QueryPoolsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryPoolsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 2:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryPoolsRequest>): QueryPoolsRequest {
    const message = createBaseQueryPoolsRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryPoolsRequestAmino): QueryPoolsRequest {
    return {
      pagination: object?.pagination
        ? PageRequest.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(message: QueryPoolsRequest): QueryPoolsRequestAmino {
    const obj: any = {};
    obj.pagination = message.pagination
      ? PageRequest.toAmino(message.pagination)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryPoolsRequestAminoMsg): QueryPoolsRequest {
    return QueryPoolsRequest.fromAmino(object.value);
  },
  toAminoMsg(message: QueryPoolsRequest): QueryPoolsRequestAminoMsg {
    return {
      type: "osmosis/gamm/query-pools-request",
      value: QueryPoolsRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryPoolsRequestProtoMsg): QueryPoolsRequest {
    return QueryPoolsRequest.decode(message.value);
  },
  toProto(message: QueryPoolsRequest): Uint8Array {
    return QueryPoolsRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryPoolsRequest): QueryPoolsRequestProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryPoolsRequest",
      value: QueryPoolsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryPoolsResponse(): QueryPoolsResponse {
  return {
    pools: [],
    pagination: undefined,
  };
}
export const QueryPoolsResponse = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryPoolsResponse",
  encode(
    message: QueryPoolsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.pools) {
      Any.encode(v! as Any, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(
        message.pagination,
        writer.uint32(18).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): QueryPoolsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryPoolsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pools.push(PoolI_InterfaceDecoder(reader) as Any);
          break;
        case 2:
          message.pagination = PageResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryPoolsResponse>): QueryPoolsResponse {
    const message = createBaseQueryPoolsResponse();
    message.pools = object.pools?.map((e) => Any.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryPoolsResponseAmino): QueryPoolsResponse {
    return {
      pools: Array.isArray(object?.pools)
        ? object.pools.map((e: any) => PoolI_FromAmino(e))
        : [],
      pagination: object?.pagination
        ? PageResponse.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(message: QueryPoolsResponse): QueryPoolsResponseAmino {
    const obj: any = {};
    if (message.pools) {
      obj.pools = message.pools.map((e) =>
        e ? PoolI_ToAmino(e as Any) : undefined
      );
    } else {
      obj.pools = [];
    }
    obj.pagination = message.pagination
      ? PageResponse.toAmino(message.pagination)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryPoolsResponseAminoMsg): QueryPoolsResponse {
    return QueryPoolsResponse.fromAmino(object.value);
  },
  toAminoMsg(message: QueryPoolsResponse): QueryPoolsResponseAminoMsg {
    return {
      type: "osmosis/gamm/query-pools-response",
      value: QueryPoolsResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryPoolsResponseProtoMsg): QueryPoolsResponse {
    return QueryPoolsResponse.decode(message.value);
  },
  toProto(message: QueryPoolsResponse): Uint8Array {
    return QueryPoolsResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryPoolsResponse): QueryPoolsResponseProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryPoolsResponse",
      value: QueryPoolsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryNumPoolsRequest(): QueryNumPoolsRequest {
  return {};
}
export const QueryNumPoolsRequest = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryNumPoolsRequest",
  encode(
    _: QueryNumPoolsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryNumPoolsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryNumPoolsRequest();
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
  fromPartial(_: Partial<QueryNumPoolsRequest>): QueryNumPoolsRequest {
    const message = createBaseQueryNumPoolsRequest();
    return message;
  },
  fromAmino(_: QueryNumPoolsRequestAmino): QueryNumPoolsRequest {
    return {};
  },
  toAmino(_: QueryNumPoolsRequest): QueryNumPoolsRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: QueryNumPoolsRequestAminoMsg): QueryNumPoolsRequest {
    return QueryNumPoolsRequest.fromAmino(object.value);
  },
  toAminoMsg(message: QueryNumPoolsRequest): QueryNumPoolsRequestAminoMsg {
    return {
      type: "osmosis/gamm/query-num-pools-request",
      value: QueryNumPoolsRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryNumPoolsRequestProtoMsg): QueryNumPoolsRequest {
    return QueryNumPoolsRequest.decode(message.value);
  },
  toProto(message: QueryNumPoolsRequest): Uint8Array {
    return QueryNumPoolsRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryNumPoolsRequest): QueryNumPoolsRequestProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryNumPoolsRequest",
      value: QueryNumPoolsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryNumPoolsResponse(): QueryNumPoolsResponse {
  return {
    numPools: Long.UZERO,
  };
}
export const QueryNumPoolsResponse = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryNumPoolsResponse",
  encode(
    message: QueryNumPoolsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.numPools.isZero()) {
      writer.uint32(8).uint64(message.numPools);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryNumPoolsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryNumPoolsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.numPools = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryNumPoolsResponse>): QueryNumPoolsResponse {
    const message = createBaseQueryNumPoolsResponse();
    message.numPools =
      object.numPools !== undefined && object.numPools !== null
        ? Long.fromValue(object.numPools)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: QueryNumPoolsResponseAmino): QueryNumPoolsResponse {
    return {
      numPools: Long.fromString(object.num_pools),
    };
  },
  toAmino(message: QueryNumPoolsResponse): QueryNumPoolsResponseAmino {
    const obj: any = {};
    obj.num_pools = message.numPools ? message.numPools.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryNumPoolsResponseAminoMsg): QueryNumPoolsResponse {
    return QueryNumPoolsResponse.fromAmino(object.value);
  },
  toAminoMsg(message: QueryNumPoolsResponse): QueryNumPoolsResponseAminoMsg {
    return {
      type: "osmosis/gamm/query-num-pools-response",
      value: QueryNumPoolsResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryNumPoolsResponseProtoMsg): QueryNumPoolsResponse {
    return QueryNumPoolsResponse.decode(message.value);
  },
  toProto(message: QueryNumPoolsResponse): Uint8Array {
    return QueryNumPoolsResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryNumPoolsResponse): QueryNumPoolsResponseProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryNumPoolsResponse",
      value: QueryNumPoolsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryPoolTypeRequest(): QueryPoolTypeRequest {
  return {
    poolId: Long.UZERO,
  };
}
export const QueryPoolTypeRequest = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryPoolTypeRequest",
  encode(
    message: QueryPoolTypeRequest,
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
  ): QueryPoolTypeRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryPoolTypeRequest();
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
  fromPartial(object: Partial<QueryPoolTypeRequest>): QueryPoolTypeRequest {
    const message = createBaseQueryPoolTypeRequest();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: QueryPoolTypeRequestAmino): QueryPoolTypeRequest {
    return {
      poolId: Long.fromString(object.pool_id),
    };
  },
  toAmino(message: QueryPoolTypeRequest): QueryPoolTypeRequestAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryPoolTypeRequestAminoMsg): QueryPoolTypeRequest {
    return QueryPoolTypeRequest.fromAmino(object.value);
  },
  toAminoMsg(message: QueryPoolTypeRequest): QueryPoolTypeRequestAminoMsg {
    return {
      type: "osmosis/gamm/query-pool-type-request",
      value: QueryPoolTypeRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryPoolTypeRequestProtoMsg): QueryPoolTypeRequest {
    return QueryPoolTypeRequest.decode(message.value);
  },
  toProto(message: QueryPoolTypeRequest): Uint8Array {
    return QueryPoolTypeRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryPoolTypeRequest): QueryPoolTypeRequestProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryPoolTypeRequest",
      value: QueryPoolTypeRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryPoolTypeResponse(): QueryPoolTypeResponse {
  return {
    poolType: "",
  };
}
export const QueryPoolTypeResponse = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryPoolTypeResponse",
  encode(
    message: QueryPoolTypeResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.poolType !== "") {
      writer.uint32(10).string(message.poolType);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryPoolTypeResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryPoolTypeResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolType = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryPoolTypeResponse>): QueryPoolTypeResponse {
    const message = createBaseQueryPoolTypeResponse();
    message.poolType = object.poolType ?? "";
    return message;
  },
  fromAmino(object: QueryPoolTypeResponseAmino): QueryPoolTypeResponse {
    return {
      poolType: object.pool_type,
    };
  },
  toAmino(message: QueryPoolTypeResponse): QueryPoolTypeResponseAmino {
    const obj: any = {};
    obj.pool_type = message.poolType;
    return obj;
  },
  fromAminoMsg(object: QueryPoolTypeResponseAminoMsg): QueryPoolTypeResponse {
    return QueryPoolTypeResponse.fromAmino(object.value);
  },
  toAminoMsg(message: QueryPoolTypeResponse): QueryPoolTypeResponseAminoMsg {
    return {
      type: "osmosis/gamm/query-pool-type-response",
      value: QueryPoolTypeResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryPoolTypeResponseProtoMsg): QueryPoolTypeResponse {
    return QueryPoolTypeResponse.decode(message.value);
  },
  toProto(message: QueryPoolTypeResponse): Uint8Array {
    return QueryPoolTypeResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryPoolTypeResponse): QueryPoolTypeResponseProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryPoolTypeResponse",
      value: QueryPoolTypeResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryCalcJoinPoolSharesRequest(): QueryCalcJoinPoolSharesRequest {
  return {
    poolId: Long.UZERO,
    tokensIn: [],
  };
}
export const QueryCalcJoinPoolSharesRequest = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryCalcJoinPoolSharesRequest",
  encode(
    message: QueryCalcJoinPoolSharesRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.poolId.isZero()) {
      writer.uint32(8).uint64(message.poolId);
    }
    for (const v of message.tokensIn) {
      Coin.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryCalcJoinPoolSharesRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryCalcJoinPoolSharesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64() as Long;
          break;
        case 2:
          message.tokensIn.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryCalcJoinPoolSharesRequest>
  ): QueryCalcJoinPoolSharesRequest {
    const message = createBaseQueryCalcJoinPoolSharesRequest();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.tokensIn = object.tokensIn?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: QueryCalcJoinPoolSharesRequestAmino
  ): QueryCalcJoinPoolSharesRequest {
    return {
      poolId: Long.fromString(object.pool_id),
      tokensIn: Array.isArray(object?.tokens_in)
        ? object.tokens_in.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: QueryCalcJoinPoolSharesRequest
  ): QueryCalcJoinPoolSharesRequestAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    if (message.tokensIn) {
      obj.tokens_in = message.tokensIn.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.tokens_in = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: QueryCalcJoinPoolSharesRequestAminoMsg
  ): QueryCalcJoinPoolSharesRequest {
    return QueryCalcJoinPoolSharesRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryCalcJoinPoolSharesRequest
  ): QueryCalcJoinPoolSharesRequestAminoMsg {
    return {
      type: "osmosis/gamm/query-calc-join-pool-shares-request",
      value: QueryCalcJoinPoolSharesRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryCalcJoinPoolSharesRequestProtoMsg
  ): QueryCalcJoinPoolSharesRequest {
    return QueryCalcJoinPoolSharesRequest.decode(message.value);
  },
  toProto(message: QueryCalcJoinPoolSharesRequest): Uint8Array {
    return QueryCalcJoinPoolSharesRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryCalcJoinPoolSharesRequest
  ): QueryCalcJoinPoolSharesRequestProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryCalcJoinPoolSharesRequest",
      value: QueryCalcJoinPoolSharesRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryCalcJoinPoolSharesResponse(): QueryCalcJoinPoolSharesResponse {
  return {
    shareOutAmount: "",
    tokensOut: [],
  };
}
export const QueryCalcJoinPoolSharesResponse = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryCalcJoinPoolSharesResponse",
  encode(
    message: QueryCalcJoinPoolSharesResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.shareOutAmount !== "") {
      writer.uint32(10).string(message.shareOutAmount);
    }
    for (const v of message.tokensOut) {
      Coin.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryCalcJoinPoolSharesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryCalcJoinPoolSharesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.shareOutAmount = reader.string();
          break;
        case 2:
          message.tokensOut.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryCalcJoinPoolSharesResponse>
  ): QueryCalcJoinPoolSharesResponse {
    const message = createBaseQueryCalcJoinPoolSharesResponse();
    message.shareOutAmount = object.shareOutAmount ?? "";
    message.tokensOut = object.tokensOut?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: QueryCalcJoinPoolSharesResponseAmino
  ): QueryCalcJoinPoolSharesResponse {
    return {
      shareOutAmount: object.share_out_amount,
      tokensOut: Array.isArray(object?.tokens_out)
        ? object.tokens_out.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: QueryCalcJoinPoolSharesResponse
  ): QueryCalcJoinPoolSharesResponseAmino {
    const obj: any = {};
    obj.share_out_amount = message.shareOutAmount;
    if (message.tokensOut) {
      obj.tokens_out = message.tokensOut.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.tokens_out = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: QueryCalcJoinPoolSharesResponseAminoMsg
  ): QueryCalcJoinPoolSharesResponse {
    return QueryCalcJoinPoolSharesResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryCalcJoinPoolSharesResponse
  ): QueryCalcJoinPoolSharesResponseAminoMsg {
    return {
      type: "osmosis/gamm/query-calc-join-pool-shares-response",
      value: QueryCalcJoinPoolSharesResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryCalcJoinPoolSharesResponseProtoMsg
  ): QueryCalcJoinPoolSharesResponse {
    return QueryCalcJoinPoolSharesResponse.decode(message.value);
  },
  toProto(message: QueryCalcJoinPoolSharesResponse): Uint8Array {
    return QueryCalcJoinPoolSharesResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryCalcJoinPoolSharesResponse
  ): QueryCalcJoinPoolSharesResponseProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryCalcJoinPoolSharesResponse",
      value: QueryCalcJoinPoolSharesResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryCalcExitPoolCoinsFromSharesRequest(): QueryCalcExitPoolCoinsFromSharesRequest {
  return {
    poolId: Long.UZERO,
    shareInAmount: "",
  };
}
export const QueryCalcExitPoolCoinsFromSharesRequest = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryCalcExitPoolCoinsFromSharesRequest",
  encode(
    message: QueryCalcExitPoolCoinsFromSharesRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.poolId.isZero()) {
      writer.uint32(8).uint64(message.poolId);
    }
    if (message.shareInAmount !== "") {
      writer.uint32(18).string(message.shareInAmount);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryCalcExitPoolCoinsFromSharesRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryCalcExitPoolCoinsFromSharesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64() as Long;
          break;
        case 2:
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
    object: Partial<QueryCalcExitPoolCoinsFromSharesRequest>
  ): QueryCalcExitPoolCoinsFromSharesRequest {
    const message = createBaseQueryCalcExitPoolCoinsFromSharesRequest();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.shareInAmount = object.shareInAmount ?? "";
    return message;
  },
  fromAmino(
    object: QueryCalcExitPoolCoinsFromSharesRequestAmino
  ): QueryCalcExitPoolCoinsFromSharesRequest {
    return {
      poolId: Long.fromString(object.pool_id),
      shareInAmount: object.share_in_amount,
    };
  },
  toAmino(
    message: QueryCalcExitPoolCoinsFromSharesRequest
  ): QueryCalcExitPoolCoinsFromSharesRequestAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.share_in_amount = message.shareInAmount;
    return obj;
  },
  fromAminoMsg(
    object: QueryCalcExitPoolCoinsFromSharesRequestAminoMsg
  ): QueryCalcExitPoolCoinsFromSharesRequest {
    return QueryCalcExitPoolCoinsFromSharesRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryCalcExitPoolCoinsFromSharesRequest
  ): QueryCalcExitPoolCoinsFromSharesRequestAminoMsg {
    return {
      type: "osmosis/gamm/query-calc-exit-pool-coins-from-shares-request",
      value: QueryCalcExitPoolCoinsFromSharesRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryCalcExitPoolCoinsFromSharesRequestProtoMsg
  ): QueryCalcExitPoolCoinsFromSharesRequest {
    return QueryCalcExitPoolCoinsFromSharesRequest.decode(message.value);
  },
  toProto(message: QueryCalcExitPoolCoinsFromSharesRequest): Uint8Array {
    return QueryCalcExitPoolCoinsFromSharesRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryCalcExitPoolCoinsFromSharesRequest
  ): QueryCalcExitPoolCoinsFromSharesRequestProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryCalcExitPoolCoinsFromSharesRequest",
      value: QueryCalcExitPoolCoinsFromSharesRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryCalcExitPoolCoinsFromSharesResponse(): QueryCalcExitPoolCoinsFromSharesResponse {
  return {
    tokensOut: [],
  };
}
export const QueryCalcExitPoolCoinsFromSharesResponse = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryCalcExitPoolCoinsFromSharesResponse",
  encode(
    message: QueryCalcExitPoolCoinsFromSharesResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.tokensOut) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryCalcExitPoolCoinsFromSharesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryCalcExitPoolCoinsFromSharesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.tokensOut.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryCalcExitPoolCoinsFromSharesResponse>
  ): QueryCalcExitPoolCoinsFromSharesResponse {
    const message = createBaseQueryCalcExitPoolCoinsFromSharesResponse();
    message.tokensOut = object.tokensOut?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: QueryCalcExitPoolCoinsFromSharesResponseAmino
  ): QueryCalcExitPoolCoinsFromSharesResponse {
    return {
      tokensOut: Array.isArray(object?.tokens_out)
        ? object.tokens_out.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: QueryCalcExitPoolCoinsFromSharesResponse
  ): QueryCalcExitPoolCoinsFromSharesResponseAmino {
    const obj: any = {};
    if (message.tokensOut) {
      obj.tokens_out = message.tokensOut.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.tokens_out = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: QueryCalcExitPoolCoinsFromSharesResponseAminoMsg
  ): QueryCalcExitPoolCoinsFromSharesResponse {
    return QueryCalcExitPoolCoinsFromSharesResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryCalcExitPoolCoinsFromSharesResponse
  ): QueryCalcExitPoolCoinsFromSharesResponseAminoMsg {
    return {
      type: "osmosis/gamm/query-calc-exit-pool-coins-from-shares-response",
      value: QueryCalcExitPoolCoinsFromSharesResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryCalcExitPoolCoinsFromSharesResponseProtoMsg
  ): QueryCalcExitPoolCoinsFromSharesResponse {
    return QueryCalcExitPoolCoinsFromSharesResponse.decode(message.value);
  },
  toProto(message: QueryCalcExitPoolCoinsFromSharesResponse): Uint8Array {
    return QueryCalcExitPoolCoinsFromSharesResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryCalcExitPoolCoinsFromSharesResponse
  ): QueryCalcExitPoolCoinsFromSharesResponseProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryCalcExitPoolCoinsFromSharesResponse",
      value: QueryCalcExitPoolCoinsFromSharesResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryPoolParamsRequest(): QueryPoolParamsRequest {
  return {
    poolId: Long.UZERO,
  };
}
export const QueryPoolParamsRequest = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryPoolParamsRequest",
  encode(
    message: QueryPoolParamsRequest,
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
  ): QueryPoolParamsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryPoolParamsRequest();
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
  fromPartial(object: Partial<QueryPoolParamsRequest>): QueryPoolParamsRequest {
    const message = createBaseQueryPoolParamsRequest();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: QueryPoolParamsRequestAmino): QueryPoolParamsRequest {
    return {
      poolId: Long.fromString(object.pool_id),
    };
  },
  toAmino(message: QueryPoolParamsRequest): QueryPoolParamsRequestAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryPoolParamsRequestAminoMsg): QueryPoolParamsRequest {
    return QueryPoolParamsRequest.fromAmino(object.value);
  },
  toAminoMsg(message: QueryPoolParamsRequest): QueryPoolParamsRequestAminoMsg {
    return {
      type: "osmosis/gamm/query-pool-params-request",
      value: QueryPoolParamsRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryPoolParamsRequestProtoMsg
  ): QueryPoolParamsRequest {
    return QueryPoolParamsRequest.decode(message.value);
  },
  toProto(message: QueryPoolParamsRequest): Uint8Array {
    return QueryPoolParamsRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryPoolParamsRequest): QueryPoolParamsRequestProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryPoolParamsRequest",
      value: QueryPoolParamsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryPoolParamsResponse(): QueryPoolParamsResponse {
  return {
    params: undefined,
  };
}
export const QueryPoolParamsResponse = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryPoolParamsResponse",
  encode(
    message: QueryPoolParamsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.params !== undefined) {
      Any.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryPoolParamsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryPoolParamsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = Any.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryPoolParamsResponse>
  ): QueryPoolParamsResponse {
    const message = createBaseQueryPoolParamsResponse();
    message.params =
      object.params !== undefined && object.params !== null
        ? Any.fromPartial(object.params)
        : undefined;
    return message;
  },
  fromAmino(object: QueryPoolParamsResponseAmino): QueryPoolParamsResponse {
    return {
      params: object?.params ? Any.fromAmino(object.params) : undefined,
    };
  },
  toAmino(message: QueryPoolParamsResponse): QueryPoolParamsResponseAmino {
    const obj: any = {};
    obj.params = message.params ? Any.toAmino(message.params) : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryPoolParamsResponseAminoMsg
  ): QueryPoolParamsResponse {
    return QueryPoolParamsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryPoolParamsResponse
  ): QueryPoolParamsResponseAminoMsg {
    return {
      type: "osmosis/gamm/query-pool-params-response",
      value: QueryPoolParamsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryPoolParamsResponseProtoMsg
  ): QueryPoolParamsResponse {
    return QueryPoolParamsResponse.decode(message.value);
  },
  toProto(message: QueryPoolParamsResponse): Uint8Array {
    return QueryPoolParamsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryPoolParamsResponse
  ): QueryPoolParamsResponseProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryPoolParamsResponse",
      value: QueryPoolParamsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryTotalPoolLiquidityRequest(): QueryTotalPoolLiquidityRequest {
  return {
    poolId: Long.UZERO,
  };
}
export const QueryTotalPoolLiquidityRequest = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryTotalPoolLiquidityRequest",
  encode(
    message: QueryTotalPoolLiquidityRequest,
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
  ): QueryTotalPoolLiquidityRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryTotalPoolLiquidityRequest();
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
    object: Partial<QueryTotalPoolLiquidityRequest>
  ): QueryTotalPoolLiquidityRequest {
    const message = createBaseQueryTotalPoolLiquidityRequest();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: QueryTotalPoolLiquidityRequestAmino
  ): QueryTotalPoolLiquidityRequest {
    return {
      poolId: Long.fromString(object.pool_id),
    };
  },
  toAmino(
    message: QueryTotalPoolLiquidityRequest
  ): QueryTotalPoolLiquidityRequestAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryTotalPoolLiquidityRequestAminoMsg
  ): QueryTotalPoolLiquidityRequest {
    return QueryTotalPoolLiquidityRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryTotalPoolLiquidityRequest
  ): QueryTotalPoolLiquidityRequestAminoMsg {
    return {
      type: "osmosis/gamm/query-total-pool-liquidity-request",
      value: QueryTotalPoolLiquidityRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryTotalPoolLiquidityRequestProtoMsg
  ): QueryTotalPoolLiquidityRequest {
    return QueryTotalPoolLiquidityRequest.decode(message.value);
  },
  toProto(message: QueryTotalPoolLiquidityRequest): Uint8Array {
    return QueryTotalPoolLiquidityRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryTotalPoolLiquidityRequest
  ): QueryTotalPoolLiquidityRequestProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryTotalPoolLiquidityRequest",
      value: QueryTotalPoolLiquidityRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryTotalPoolLiquidityResponse(): QueryTotalPoolLiquidityResponse {
  return {
    liquidity: [],
  };
}
export const QueryTotalPoolLiquidityResponse = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryTotalPoolLiquidityResponse",
  encode(
    message: QueryTotalPoolLiquidityResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.liquidity) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryTotalPoolLiquidityResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryTotalPoolLiquidityResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.liquidity.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryTotalPoolLiquidityResponse>
  ): QueryTotalPoolLiquidityResponse {
    const message = createBaseQueryTotalPoolLiquidityResponse();
    message.liquidity = object.liquidity?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: QueryTotalPoolLiquidityResponseAmino
  ): QueryTotalPoolLiquidityResponse {
    return {
      liquidity: Array.isArray(object?.liquidity)
        ? object.liquidity.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: QueryTotalPoolLiquidityResponse
  ): QueryTotalPoolLiquidityResponseAmino {
    const obj: any = {};
    if (message.liquidity) {
      obj.liquidity = message.liquidity.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.liquidity = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: QueryTotalPoolLiquidityResponseAminoMsg
  ): QueryTotalPoolLiquidityResponse {
    return QueryTotalPoolLiquidityResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryTotalPoolLiquidityResponse
  ): QueryTotalPoolLiquidityResponseAminoMsg {
    return {
      type: "osmosis/gamm/query-total-pool-liquidity-response",
      value: QueryTotalPoolLiquidityResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryTotalPoolLiquidityResponseProtoMsg
  ): QueryTotalPoolLiquidityResponse {
    return QueryTotalPoolLiquidityResponse.decode(message.value);
  },
  toProto(message: QueryTotalPoolLiquidityResponse): Uint8Array {
    return QueryTotalPoolLiquidityResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryTotalPoolLiquidityResponse
  ): QueryTotalPoolLiquidityResponseProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryTotalPoolLiquidityResponse",
      value: QueryTotalPoolLiquidityResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryTotalSharesRequest(): QueryTotalSharesRequest {
  return {
    poolId: Long.UZERO,
  };
}
export const QueryTotalSharesRequest = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryTotalSharesRequest",
  encode(
    message: QueryTotalSharesRequest,
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
  ): QueryTotalSharesRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryTotalSharesRequest();
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
    object: Partial<QueryTotalSharesRequest>
  ): QueryTotalSharesRequest {
    const message = createBaseQueryTotalSharesRequest();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: QueryTotalSharesRequestAmino): QueryTotalSharesRequest {
    return {
      poolId: Long.fromString(object.pool_id),
    };
  },
  toAmino(message: QueryTotalSharesRequest): QueryTotalSharesRequestAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryTotalSharesRequestAminoMsg
  ): QueryTotalSharesRequest {
    return QueryTotalSharesRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryTotalSharesRequest
  ): QueryTotalSharesRequestAminoMsg {
    return {
      type: "osmosis/gamm/query-total-shares-request",
      value: QueryTotalSharesRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryTotalSharesRequestProtoMsg
  ): QueryTotalSharesRequest {
    return QueryTotalSharesRequest.decode(message.value);
  },
  toProto(message: QueryTotalSharesRequest): Uint8Array {
    return QueryTotalSharesRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryTotalSharesRequest
  ): QueryTotalSharesRequestProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryTotalSharesRequest",
      value: QueryTotalSharesRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryTotalSharesResponse(): QueryTotalSharesResponse {
  return {
    totalShares: undefined,
  };
}
export const QueryTotalSharesResponse = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryTotalSharesResponse",
  encode(
    message: QueryTotalSharesResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.totalShares !== undefined) {
      Coin.encode(message.totalShares, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryTotalSharesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryTotalSharesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.totalShares = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryTotalSharesResponse>
  ): QueryTotalSharesResponse {
    const message = createBaseQueryTotalSharesResponse();
    message.totalShares =
      object.totalShares !== undefined && object.totalShares !== null
        ? Coin.fromPartial(object.totalShares)
        : undefined;
    return message;
  },
  fromAmino(object: QueryTotalSharesResponseAmino): QueryTotalSharesResponse {
    return {
      totalShares: object?.total_shares
        ? Coin.fromAmino(object.total_shares)
        : undefined,
    };
  },
  toAmino(message: QueryTotalSharesResponse): QueryTotalSharesResponseAmino {
    const obj: any = {};
    obj.total_shares = message.totalShares
      ? Coin.toAmino(message.totalShares)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryTotalSharesResponseAminoMsg
  ): QueryTotalSharesResponse {
    return QueryTotalSharesResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryTotalSharesResponse
  ): QueryTotalSharesResponseAminoMsg {
    return {
      type: "osmosis/gamm/query-total-shares-response",
      value: QueryTotalSharesResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryTotalSharesResponseProtoMsg
  ): QueryTotalSharesResponse {
    return QueryTotalSharesResponse.decode(message.value);
  },
  toProto(message: QueryTotalSharesResponse): Uint8Array {
    return QueryTotalSharesResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryTotalSharesResponse
  ): QueryTotalSharesResponseProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryTotalSharesResponse",
      value: QueryTotalSharesResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryCalcJoinPoolNoSwapSharesRequest(): QueryCalcJoinPoolNoSwapSharesRequest {
  return {
    poolId: Long.UZERO,
    tokensIn: [],
  };
}
export const QueryCalcJoinPoolNoSwapSharesRequest = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryCalcJoinPoolNoSwapSharesRequest",
  encode(
    message: QueryCalcJoinPoolNoSwapSharesRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.poolId.isZero()) {
      writer.uint32(8).uint64(message.poolId);
    }
    for (const v of message.tokensIn) {
      Coin.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryCalcJoinPoolNoSwapSharesRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryCalcJoinPoolNoSwapSharesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64() as Long;
          break;
        case 2:
          message.tokensIn.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryCalcJoinPoolNoSwapSharesRequest>
  ): QueryCalcJoinPoolNoSwapSharesRequest {
    const message = createBaseQueryCalcJoinPoolNoSwapSharesRequest();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.tokensIn = object.tokensIn?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: QueryCalcJoinPoolNoSwapSharesRequestAmino
  ): QueryCalcJoinPoolNoSwapSharesRequest {
    return {
      poolId: Long.fromString(object.pool_id),
      tokensIn: Array.isArray(object?.tokens_in)
        ? object.tokens_in.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: QueryCalcJoinPoolNoSwapSharesRequest
  ): QueryCalcJoinPoolNoSwapSharesRequestAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    if (message.tokensIn) {
      obj.tokens_in = message.tokensIn.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.tokens_in = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: QueryCalcJoinPoolNoSwapSharesRequestAminoMsg
  ): QueryCalcJoinPoolNoSwapSharesRequest {
    return QueryCalcJoinPoolNoSwapSharesRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryCalcJoinPoolNoSwapSharesRequest
  ): QueryCalcJoinPoolNoSwapSharesRequestAminoMsg {
    return {
      type: "osmosis/gamm/query-calc-join-pool-no-swap-shares-request",
      value: QueryCalcJoinPoolNoSwapSharesRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryCalcJoinPoolNoSwapSharesRequestProtoMsg
  ): QueryCalcJoinPoolNoSwapSharesRequest {
    return QueryCalcJoinPoolNoSwapSharesRequest.decode(message.value);
  },
  toProto(message: QueryCalcJoinPoolNoSwapSharesRequest): Uint8Array {
    return QueryCalcJoinPoolNoSwapSharesRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryCalcJoinPoolNoSwapSharesRequest
  ): QueryCalcJoinPoolNoSwapSharesRequestProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryCalcJoinPoolNoSwapSharesRequest",
      value: QueryCalcJoinPoolNoSwapSharesRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryCalcJoinPoolNoSwapSharesResponse(): QueryCalcJoinPoolNoSwapSharesResponse {
  return {
    tokensOut: [],
    sharesOut: "",
  };
}
export const QueryCalcJoinPoolNoSwapSharesResponse = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryCalcJoinPoolNoSwapSharesResponse",
  encode(
    message: QueryCalcJoinPoolNoSwapSharesResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.tokensOut) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.sharesOut !== "") {
      writer.uint32(18).string(message.sharesOut);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryCalcJoinPoolNoSwapSharesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryCalcJoinPoolNoSwapSharesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.tokensOut.push(Coin.decode(reader, reader.uint32()));
          break;
        case 2:
          message.sharesOut = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryCalcJoinPoolNoSwapSharesResponse>
  ): QueryCalcJoinPoolNoSwapSharesResponse {
    const message = createBaseQueryCalcJoinPoolNoSwapSharesResponse();
    message.tokensOut = object.tokensOut?.map((e) => Coin.fromPartial(e)) || [];
    message.sharesOut = object.sharesOut ?? "";
    return message;
  },
  fromAmino(
    object: QueryCalcJoinPoolNoSwapSharesResponseAmino
  ): QueryCalcJoinPoolNoSwapSharesResponse {
    return {
      tokensOut: Array.isArray(object?.tokens_out)
        ? object.tokens_out.map((e: any) => Coin.fromAmino(e))
        : [],
      sharesOut: object.shares_out,
    };
  },
  toAmino(
    message: QueryCalcJoinPoolNoSwapSharesResponse
  ): QueryCalcJoinPoolNoSwapSharesResponseAmino {
    const obj: any = {};
    if (message.tokensOut) {
      obj.tokens_out = message.tokensOut.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.tokens_out = [];
    }
    obj.shares_out = message.sharesOut;
    return obj;
  },
  fromAminoMsg(
    object: QueryCalcJoinPoolNoSwapSharesResponseAminoMsg
  ): QueryCalcJoinPoolNoSwapSharesResponse {
    return QueryCalcJoinPoolNoSwapSharesResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryCalcJoinPoolNoSwapSharesResponse
  ): QueryCalcJoinPoolNoSwapSharesResponseAminoMsg {
    return {
      type: "osmosis/gamm/query-calc-join-pool-no-swap-shares-response",
      value: QueryCalcJoinPoolNoSwapSharesResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryCalcJoinPoolNoSwapSharesResponseProtoMsg
  ): QueryCalcJoinPoolNoSwapSharesResponse {
    return QueryCalcJoinPoolNoSwapSharesResponse.decode(message.value);
  },
  toProto(message: QueryCalcJoinPoolNoSwapSharesResponse): Uint8Array {
    return QueryCalcJoinPoolNoSwapSharesResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryCalcJoinPoolNoSwapSharesResponse
  ): QueryCalcJoinPoolNoSwapSharesResponseProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryCalcJoinPoolNoSwapSharesResponse",
      value: QueryCalcJoinPoolNoSwapSharesResponse.encode(message).finish(),
    };
  },
};
function createBaseQuerySpotPriceRequest(): QuerySpotPriceRequest {
  return {
    poolId: Long.UZERO,
    baseAssetDenom: "",
    quoteAssetDenom: "",
  };
}
export const QuerySpotPriceRequest = {
  typeUrl: "/osmosis.gamm.v1beta1.QuerySpotPriceRequest",
  encode(
    message: QuerySpotPriceRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.poolId.isZero()) {
      writer.uint32(8).uint64(message.poolId);
    }
    if (message.baseAssetDenom !== "") {
      writer.uint32(18).string(message.baseAssetDenom);
    }
    if (message.quoteAssetDenom !== "") {
      writer.uint32(26).string(message.quoteAssetDenom);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QuerySpotPriceRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQuerySpotPriceRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64() as Long;
          break;
        case 2:
          message.baseAssetDenom = reader.string();
          break;
        case 3:
          message.quoteAssetDenom = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QuerySpotPriceRequest>): QuerySpotPriceRequest {
    const message = createBaseQuerySpotPriceRequest();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.baseAssetDenom = object.baseAssetDenom ?? "";
    message.quoteAssetDenom = object.quoteAssetDenom ?? "";
    return message;
  },
  fromAmino(object: QuerySpotPriceRequestAmino): QuerySpotPriceRequest {
    return {
      poolId: Long.fromString(object.pool_id),
      baseAssetDenom: object.base_asset_denom,
      quoteAssetDenom: object.quote_asset_denom,
    };
  },
  toAmino(message: QuerySpotPriceRequest): QuerySpotPriceRequestAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.base_asset_denom = message.baseAssetDenom;
    obj.quote_asset_denom = message.quoteAssetDenom;
    return obj;
  },
  fromAminoMsg(object: QuerySpotPriceRequestAminoMsg): QuerySpotPriceRequest {
    return QuerySpotPriceRequest.fromAmino(object.value);
  },
  toAminoMsg(message: QuerySpotPriceRequest): QuerySpotPriceRequestAminoMsg {
    return {
      type: "osmosis/gamm/query-spot-price-request",
      value: QuerySpotPriceRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: QuerySpotPriceRequestProtoMsg): QuerySpotPriceRequest {
    return QuerySpotPriceRequest.decode(message.value);
  },
  toProto(message: QuerySpotPriceRequest): Uint8Array {
    return QuerySpotPriceRequest.encode(message).finish();
  },
  toProtoMsg(message: QuerySpotPriceRequest): QuerySpotPriceRequestProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QuerySpotPriceRequest",
      value: QuerySpotPriceRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryPoolsWithFilterRequest(): QueryPoolsWithFilterRequest {
  return {
    minLiquidity: "",
    poolType: "",
    pagination: undefined,
  };
}
export const QueryPoolsWithFilterRequest = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryPoolsWithFilterRequest",
  encode(
    message: QueryPoolsWithFilterRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.minLiquidity !== "") {
      writer.uint32(10).string(message.minLiquidity);
    }
    if (message.poolType !== "") {
      writer.uint32(18).string(message.poolType);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryPoolsWithFilterRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryPoolsWithFilterRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.minLiquidity = reader.string();
          break;
        case 2:
          message.poolType = reader.string();
          break;
        case 3:
          message.pagination = PageRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryPoolsWithFilterRequest>
  ): QueryPoolsWithFilterRequest {
    const message = createBaseQueryPoolsWithFilterRequest();
    message.minLiquidity = object.minLiquidity ?? "";
    message.poolType = object.poolType ?? "";
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(
    object: QueryPoolsWithFilterRequestAmino
  ): QueryPoolsWithFilterRequest {
    return {
      minLiquidity: object.min_liquidity,
      poolType: object.pool_type,
      pagination: object?.pagination
        ? PageRequest.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(
    message: QueryPoolsWithFilterRequest
  ): QueryPoolsWithFilterRequestAmino {
    const obj: any = {};
    obj.min_liquidity = message.minLiquidity;
    obj.pool_type = message.poolType;
    obj.pagination = message.pagination
      ? PageRequest.toAmino(message.pagination)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryPoolsWithFilterRequestAminoMsg
  ): QueryPoolsWithFilterRequest {
    return QueryPoolsWithFilterRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryPoolsWithFilterRequest
  ): QueryPoolsWithFilterRequestAminoMsg {
    return {
      type: "osmosis/gamm/query-pools-with-filter-request",
      value: QueryPoolsWithFilterRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryPoolsWithFilterRequestProtoMsg
  ): QueryPoolsWithFilterRequest {
    return QueryPoolsWithFilterRequest.decode(message.value);
  },
  toProto(message: QueryPoolsWithFilterRequest): Uint8Array {
    return QueryPoolsWithFilterRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryPoolsWithFilterRequest
  ): QueryPoolsWithFilterRequestProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryPoolsWithFilterRequest",
      value: QueryPoolsWithFilterRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryPoolsWithFilterResponse(): QueryPoolsWithFilterResponse {
  return {
    pools: [],
    pagination: undefined,
  };
}
export const QueryPoolsWithFilterResponse = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryPoolsWithFilterResponse",
  encode(
    message: QueryPoolsWithFilterResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.pools) {
      Any.encode(v! as Any, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(
        message.pagination,
        writer.uint32(18).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryPoolsWithFilterResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryPoolsWithFilterResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pools.push(PoolI_InterfaceDecoder(reader) as Any);
          break;
        case 2:
          message.pagination = PageResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryPoolsWithFilterResponse>
  ): QueryPoolsWithFilterResponse {
    const message = createBaseQueryPoolsWithFilterResponse();
    message.pools = object.pools?.map((e) => Any.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(
    object: QueryPoolsWithFilterResponseAmino
  ): QueryPoolsWithFilterResponse {
    return {
      pools: Array.isArray(object?.pools)
        ? object.pools.map((e: any) => PoolI_FromAmino(e))
        : [],
      pagination: object?.pagination
        ? PageResponse.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(
    message: QueryPoolsWithFilterResponse
  ): QueryPoolsWithFilterResponseAmino {
    const obj: any = {};
    if (message.pools) {
      obj.pools = message.pools.map((e) =>
        e ? PoolI_ToAmino(e as Any) : undefined
      );
    } else {
      obj.pools = [];
    }
    obj.pagination = message.pagination
      ? PageResponse.toAmino(message.pagination)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryPoolsWithFilterResponseAminoMsg
  ): QueryPoolsWithFilterResponse {
    return QueryPoolsWithFilterResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryPoolsWithFilterResponse
  ): QueryPoolsWithFilterResponseAminoMsg {
    return {
      type: "osmosis/gamm/query-pools-with-filter-response",
      value: QueryPoolsWithFilterResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryPoolsWithFilterResponseProtoMsg
  ): QueryPoolsWithFilterResponse {
    return QueryPoolsWithFilterResponse.decode(message.value);
  },
  toProto(message: QueryPoolsWithFilterResponse): Uint8Array {
    return QueryPoolsWithFilterResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryPoolsWithFilterResponse
  ): QueryPoolsWithFilterResponseProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryPoolsWithFilterResponse",
      value: QueryPoolsWithFilterResponse.encode(message).finish(),
    };
  },
};
function createBaseQuerySpotPriceResponse(): QuerySpotPriceResponse {
  return {
    spotPrice: "",
  };
}
export const QuerySpotPriceResponse = {
  typeUrl: "/osmosis.gamm.v1beta1.QuerySpotPriceResponse",
  encode(
    message: QuerySpotPriceResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.spotPrice !== "") {
      writer.uint32(10).string(message.spotPrice);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QuerySpotPriceResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQuerySpotPriceResponse();
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
  fromPartial(object: Partial<QuerySpotPriceResponse>): QuerySpotPriceResponse {
    const message = createBaseQuerySpotPriceResponse();
    message.spotPrice = object.spotPrice ?? "";
    return message;
  },
  fromAmino(object: QuerySpotPriceResponseAmino): QuerySpotPriceResponse {
    return {
      spotPrice: object.spot_price,
    };
  },
  toAmino(message: QuerySpotPriceResponse): QuerySpotPriceResponseAmino {
    const obj: any = {};
    obj.spot_price = message.spotPrice;
    return obj;
  },
  fromAminoMsg(object: QuerySpotPriceResponseAminoMsg): QuerySpotPriceResponse {
    return QuerySpotPriceResponse.fromAmino(object.value);
  },
  toAminoMsg(message: QuerySpotPriceResponse): QuerySpotPriceResponseAminoMsg {
    return {
      type: "osmosis/gamm/query-spot-price-response",
      value: QuerySpotPriceResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QuerySpotPriceResponseProtoMsg
  ): QuerySpotPriceResponse {
    return QuerySpotPriceResponse.decode(message.value);
  },
  toProto(message: QuerySpotPriceResponse): Uint8Array {
    return QuerySpotPriceResponse.encode(message).finish();
  },
  toProtoMsg(message: QuerySpotPriceResponse): QuerySpotPriceResponseProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QuerySpotPriceResponse",
      value: QuerySpotPriceResponse.encode(message).finish(),
    };
  },
};
function createBaseQuerySwapExactAmountInRequest(): QuerySwapExactAmountInRequest {
  return {
    sender: "",
    poolId: Long.UZERO,
    tokenIn: "",
    routes: [],
  };
}
export const QuerySwapExactAmountInRequest = {
  typeUrl: "/osmosis.gamm.v1beta1.QuerySwapExactAmountInRequest",
  encode(
    message: QuerySwapExactAmountInRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (!message.poolId.isZero()) {
      writer.uint32(16).uint64(message.poolId);
    }
    if (message.tokenIn !== "") {
      writer.uint32(26).string(message.tokenIn);
    }
    for (const v of message.routes) {
      SwapAmountInRoute.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QuerySwapExactAmountInRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQuerySwapExactAmountInRequest();
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
          message.tokenIn = reader.string();
          break;
        case 4:
          message.routes.push(
            SwapAmountInRoute.decode(reader, reader.uint32())
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
    object: Partial<QuerySwapExactAmountInRequest>
  ): QuerySwapExactAmountInRequest {
    const message = createBaseQuerySwapExactAmountInRequest();
    message.sender = object.sender ?? "";
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.tokenIn = object.tokenIn ?? "";
    message.routes =
      object.routes?.map((e) => SwapAmountInRoute.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: QuerySwapExactAmountInRequestAmino
  ): QuerySwapExactAmountInRequest {
    return {
      sender: object.sender,
      poolId: Long.fromString(object.pool_id),
      tokenIn: object.token_in,
      routes: Array.isArray(object?.routes)
        ? object.routes.map((e: any) => SwapAmountInRoute.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: QuerySwapExactAmountInRequest
  ): QuerySwapExactAmountInRequestAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.token_in = message.tokenIn;
    if (message.routes) {
      obj.routes = message.routes.map((e) =>
        e ? SwapAmountInRoute.toAmino(e) : undefined
      );
    } else {
      obj.routes = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: QuerySwapExactAmountInRequestAminoMsg
  ): QuerySwapExactAmountInRequest {
    return QuerySwapExactAmountInRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QuerySwapExactAmountInRequest
  ): QuerySwapExactAmountInRequestAminoMsg {
    return {
      type: "osmosis/gamm/query-swap-exact-amount-in-request",
      value: QuerySwapExactAmountInRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QuerySwapExactAmountInRequestProtoMsg
  ): QuerySwapExactAmountInRequest {
    return QuerySwapExactAmountInRequest.decode(message.value);
  },
  toProto(message: QuerySwapExactAmountInRequest): Uint8Array {
    return QuerySwapExactAmountInRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QuerySwapExactAmountInRequest
  ): QuerySwapExactAmountInRequestProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QuerySwapExactAmountInRequest",
      value: QuerySwapExactAmountInRequest.encode(message).finish(),
    };
  },
};
function createBaseQuerySwapExactAmountInResponse(): QuerySwapExactAmountInResponse {
  return {
    tokenOutAmount: "",
  };
}
export const QuerySwapExactAmountInResponse = {
  typeUrl: "/osmosis.gamm.v1beta1.QuerySwapExactAmountInResponse",
  encode(
    message: QuerySwapExactAmountInResponse,
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
  ): QuerySwapExactAmountInResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQuerySwapExactAmountInResponse();
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
    object: Partial<QuerySwapExactAmountInResponse>
  ): QuerySwapExactAmountInResponse {
    const message = createBaseQuerySwapExactAmountInResponse();
    message.tokenOutAmount = object.tokenOutAmount ?? "";
    return message;
  },
  fromAmino(
    object: QuerySwapExactAmountInResponseAmino
  ): QuerySwapExactAmountInResponse {
    return {
      tokenOutAmount: object.token_out_amount,
    };
  },
  toAmino(
    message: QuerySwapExactAmountInResponse
  ): QuerySwapExactAmountInResponseAmino {
    const obj: any = {};
    obj.token_out_amount = message.tokenOutAmount;
    return obj;
  },
  fromAminoMsg(
    object: QuerySwapExactAmountInResponseAminoMsg
  ): QuerySwapExactAmountInResponse {
    return QuerySwapExactAmountInResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QuerySwapExactAmountInResponse
  ): QuerySwapExactAmountInResponseAminoMsg {
    return {
      type: "osmosis/gamm/query-swap-exact-amount-in-response",
      value: QuerySwapExactAmountInResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QuerySwapExactAmountInResponseProtoMsg
  ): QuerySwapExactAmountInResponse {
    return QuerySwapExactAmountInResponse.decode(message.value);
  },
  toProto(message: QuerySwapExactAmountInResponse): Uint8Array {
    return QuerySwapExactAmountInResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QuerySwapExactAmountInResponse
  ): QuerySwapExactAmountInResponseProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QuerySwapExactAmountInResponse",
      value: QuerySwapExactAmountInResponse.encode(message).finish(),
    };
  },
};
function createBaseQuerySwapExactAmountOutRequest(): QuerySwapExactAmountOutRequest {
  return {
    sender: "",
    poolId: Long.UZERO,
    routes: [],
    tokenOut: "",
  };
}
export const QuerySwapExactAmountOutRequest = {
  typeUrl: "/osmosis.gamm.v1beta1.QuerySwapExactAmountOutRequest",
  encode(
    message: QuerySwapExactAmountOutRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (!message.poolId.isZero()) {
      writer.uint32(16).uint64(message.poolId);
    }
    for (const v of message.routes) {
      SwapAmountOutRoute.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.tokenOut !== "") {
      writer.uint32(34).string(message.tokenOut);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QuerySwapExactAmountOutRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQuerySwapExactAmountOutRequest();
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
          message.routes.push(
            SwapAmountOutRoute.decode(reader, reader.uint32())
          );
          break;
        case 4:
          message.tokenOut = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QuerySwapExactAmountOutRequest>
  ): QuerySwapExactAmountOutRequest {
    const message = createBaseQuerySwapExactAmountOutRequest();
    message.sender = object.sender ?? "";
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.routes =
      object.routes?.map((e) => SwapAmountOutRoute.fromPartial(e)) || [];
    message.tokenOut = object.tokenOut ?? "";
    return message;
  },
  fromAmino(
    object: QuerySwapExactAmountOutRequestAmino
  ): QuerySwapExactAmountOutRequest {
    return {
      sender: object.sender,
      poolId: Long.fromString(object.pool_id),
      routes: Array.isArray(object?.routes)
        ? object.routes.map((e: any) => SwapAmountOutRoute.fromAmino(e))
        : [],
      tokenOut: object.token_out,
    };
  },
  toAmino(
    message: QuerySwapExactAmountOutRequest
  ): QuerySwapExactAmountOutRequestAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    if (message.routes) {
      obj.routes = message.routes.map((e) =>
        e ? SwapAmountOutRoute.toAmino(e) : undefined
      );
    } else {
      obj.routes = [];
    }
    obj.token_out = message.tokenOut;
    return obj;
  },
  fromAminoMsg(
    object: QuerySwapExactAmountOutRequestAminoMsg
  ): QuerySwapExactAmountOutRequest {
    return QuerySwapExactAmountOutRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QuerySwapExactAmountOutRequest
  ): QuerySwapExactAmountOutRequestAminoMsg {
    return {
      type: "osmosis/gamm/query-swap-exact-amount-out-request",
      value: QuerySwapExactAmountOutRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QuerySwapExactAmountOutRequestProtoMsg
  ): QuerySwapExactAmountOutRequest {
    return QuerySwapExactAmountOutRequest.decode(message.value);
  },
  toProto(message: QuerySwapExactAmountOutRequest): Uint8Array {
    return QuerySwapExactAmountOutRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QuerySwapExactAmountOutRequest
  ): QuerySwapExactAmountOutRequestProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QuerySwapExactAmountOutRequest",
      value: QuerySwapExactAmountOutRequest.encode(message).finish(),
    };
  },
};
function createBaseQuerySwapExactAmountOutResponse(): QuerySwapExactAmountOutResponse {
  return {
    tokenInAmount: "",
  };
}
export const QuerySwapExactAmountOutResponse = {
  typeUrl: "/osmosis.gamm.v1beta1.QuerySwapExactAmountOutResponse",
  encode(
    message: QuerySwapExactAmountOutResponse,
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
  ): QuerySwapExactAmountOutResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQuerySwapExactAmountOutResponse();
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
    object: Partial<QuerySwapExactAmountOutResponse>
  ): QuerySwapExactAmountOutResponse {
    const message = createBaseQuerySwapExactAmountOutResponse();
    message.tokenInAmount = object.tokenInAmount ?? "";
    return message;
  },
  fromAmino(
    object: QuerySwapExactAmountOutResponseAmino
  ): QuerySwapExactAmountOutResponse {
    return {
      tokenInAmount: object.token_in_amount,
    };
  },
  toAmino(
    message: QuerySwapExactAmountOutResponse
  ): QuerySwapExactAmountOutResponseAmino {
    const obj: any = {};
    obj.token_in_amount = message.tokenInAmount;
    return obj;
  },
  fromAminoMsg(
    object: QuerySwapExactAmountOutResponseAminoMsg
  ): QuerySwapExactAmountOutResponse {
    return QuerySwapExactAmountOutResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QuerySwapExactAmountOutResponse
  ): QuerySwapExactAmountOutResponseAminoMsg {
    return {
      type: "osmosis/gamm/query-swap-exact-amount-out-response",
      value: QuerySwapExactAmountOutResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QuerySwapExactAmountOutResponseProtoMsg
  ): QuerySwapExactAmountOutResponse {
    return QuerySwapExactAmountOutResponse.decode(message.value);
  },
  toProto(message: QuerySwapExactAmountOutResponse): Uint8Array {
    return QuerySwapExactAmountOutResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QuerySwapExactAmountOutResponse
  ): QuerySwapExactAmountOutResponseProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QuerySwapExactAmountOutResponse",
      value: QuerySwapExactAmountOutResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryTotalLiquidityRequest(): QueryTotalLiquidityRequest {
  return {};
}
export const QueryTotalLiquidityRequest = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryTotalLiquidityRequest",
  encode(
    _: QueryTotalLiquidityRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryTotalLiquidityRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryTotalLiquidityRequest();
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
    _: Partial<QueryTotalLiquidityRequest>
  ): QueryTotalLiquidityRequest {
    const message = createBaseQueryTotalLiquidityRequest();
    return message;
  },
  fromAmino(_: QueryTotalLiquidityRequestAmino): QueryTotalLiquidityRequest {
    return {};
  },
  toAmino(_: QueryTotalLiquidityRequest): QueryTotalLiquidityRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: QueryTotalLiquidityRequestAminoMsg
  ): QueryTotalLiquidityRequest {
    return QueryTotalLiquidityRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryTotalLiquidityRequest
  ): QueryTotalLiquidityRequestAminoMsg {
    return {
      type: "osmosis/gamm/query-total-liquidity-request",
      value: QueryTotalLiquidityRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryTotalLiquidityRequestProtoMsg
  ): QueryTotalLiquidityRequest {
    return QueryTotalLiquidityRequest.decode(message.value);
  },
  toProto(message: QueryTotalLiquidityRequest): Uint8Array {
    return QueryTotalLiquidityRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryTotalLiquidityRequest
  ): QueryTotalLiquidityRequestProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryTotalLiquidityRequest",
      value: QueryTotalLiquidityRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryTotalLiquidityResponse(): QueryTotalLiquidityResponse {
  return {
    liquidity: [],
  };
}
export const QueryTotalLiquidityResponse = {
  typeUrl: "/osmosis.gamm.v1beta1.QueryTotalLiquidityResponse",
  encode(
    message: QueryTotalLiquidityResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.liquidity) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryTotalLiquidityResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryTotalLiquidityResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.liquidity.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryTotalLiquidityResponse>
  ): QueryTotalLiquidityResponse {
    const message = createBaseQueryTotalLiquidityResponse();
    message.liquidity = object.liquidity?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: QueryTotalLiquidityResponseAmino
  ): QueryTotalLiquidityResponse {
    return {
      liquidity: Array.isArray(object?.liquidity)
        ? object.liquidity.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: QueryTotalLiquidityResponse
  ): QueryTotalLiquidityResponseAmino {
    const obj: any = {};
    if (message.liquidity) {
      obj.liquidity = message.liquidity.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.liquidity = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: QueryTotalLiquidityResponseAminoMsg
  ): QueryTotalLiquidityResponse {
    return QueryTotalLiquidityResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryTotalLiquidityResponse
  ): QueryTotalLiquidityResponseAminoMsg {
    return {
      type: "osmosis/gamm/query-total-liquidity-response",
      value: QueryTotalLiquidityResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryTotalLiquidityResponseProtoMsg
  ): QueryTotalLiquidityResponse {
    return QueryTotalLiquidityResponse.decode(message.value);
  },
  toProto(message: QueryTotalLiquidityResponse): Uint8Array {
    return QueryTotalLiquidityResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryTotalLiquidityResponse
  ): QueryTotalLiquidityResponseProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.QueryTotalLiquidityResponse",
      value: QueryTotalLiquidityResponse.encode(message).finish(),
    };
  },
};
export const PoolI_InterfaceDecoder = (
  input: _m0.Reader | Uint8Array
): Pool1 | CosmWasmPool | Pool2 | Pool3 | Any => {
  const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
  const data = Any.decode(reader, reader.uint32());
  switch (data.typeUrl) {
    case "/osmosis.concentratedliquidity.v1beta1.Pool":
      return Pool1.decode(data.value);
    case "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool":
      return CosmWasmPool.decode(data.value);
    case "/osmosis.gamm.v1beta1.Pool":
      return Pool2.decode(data.value);
    case "/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool":
      return Pool3.decode(data.value);
    default:
      return data;
  }
};
export const PoolI_FromAmino = (content: AnyAmino) => {
  switch (content.type) {
    case "osmosis/concentratedliquidity/pool":
      return Any.fromPartial({
        typeUrl: "/osmosis.concentratedliquidity.v1beta1.Pool",
        value: Pool1.encode(
          Pool1.fromPartial(Pool1.fromAmino(content.value))
        ).finish(),
      });
    case "osmosis/cosmwasmpool/cosm-wasm-pool":
      return Any.fromPartial({
        typeUrl: "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool",
        value: CosmWasmPool.encode(
          CosmWasmPool.fromPartial(CosmWasmPool.fromAmino(content.value))
        ).finish(),
      });
    case "osmosis/gamm/BalancerPool":
      return Any.fromPartial({
        typeUrl: "/osmosis.gamm.v1beta1.Pool",
        value: Pool2.encode(
          Pool2.fromPartial(Pool2.fromAmino(content.value))
        ).finish(),
      });
    case "osmosis/gamm/StableswapPool":
      return Any.fromPartial({
        typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool",
        value: Pool3.encode(
          Pool3.fromPartial(Pool3.fromAmino(content.value))
        ).finish(),
      });
    default:
      return Any.fromAmino(content);
  }
};
export const PoolI_ToAmino = (content: Any) => {
  switch (content.typeUrl) {
    case "/osmosis.concentratedliquidity.v1beta1.Pool":
      return {
        type: "osmosis/concentratedliquidity/pool",
        value: Pool1.toAmino(Pool1.decode(content.value)),
      };
    case "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool":
      return {
        type: "osmosis/cosmwasmpool/cosm-wasm-pool",
        value: CosmWasmPool.toAmino(CosmWasmPool.decode(content.value)),
      };
    case "/osmosis.gamm.v1beta1.Pool":
      return {
        type: "osmosis/gamm/BalancerPool",
        value: Pool2.toAmino(Pool2.decode(content.value)),
      };
    case "/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool":
      return {
        type: "osmosis/gamm/StableswapPool",
        value: Pool3.toAmino(Pool3.decode(content.value)),
      };
    default:
      return Any.toAmino(content);
  }
};
