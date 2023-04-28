//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import {
  Coin,
  CoinAmino,
  CoinSDKType,
} from "../../../cosmos/base/v1beta1/coin";
import { Long } from "../../../helpers";
import { Params, ParamsAmino, ParamsSDKType } from "./params";
import {
  BaseDenom,
  BaseDenomAmino,
  BaseDenomSDKType,
  PoolWeights,
  PoolWeightsAmino,
  PoolWeightsSDKType,
  RouteStatistics,
  RouteStatisticsAmino,
  RouteStatisticsSDKType,
  TokenPairArbRoutes,
  TokenPairArbRoutesAmino,
  TokenPairArbRoutesSDKType,
} from "./protorev";
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequest {}
export interface QueryParamsRequestProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryParamsRequest";
  value: Uint8Array;
}
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequestAmino {}
export interface QueryParamsRequestAminoMsg {
  type: "osmosis/protorev/query-params-request";
  value: QueryParamsRequestAmino;
}
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequestSDKType {}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponse {
  /** params holds all the parameters of this module. */
  params?: Params;
}
export interface QueryParamsResponseProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryParamsResponse";
  value: Uint8Array;
}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponseAmino {
  /** params holds all the parameters of this module. */
  params?: ParamsAmino;
}
export interface QueryParamsResponseAminoMsg {
  type: "osmosis/protorev/query-params-response";
  value: QueryParamsResponseAmino;
}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
  params?: ParamsSDKType;
}
/**
 * QueryGetProtoRevNumberOfTradesRequest is request type for the
 * Query/GetProtoRevNumberOfTrades RPC method.
 */
export interface QueryGetProtoRevNumberOfTradesRequest {}
export interface QueryGetProtoRevNumberOfTradesRequestProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevNumberOfTradesRequest";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevNumberOfTradesRequest is request type for the
 * Query/GetProtoRevNumberOfTrades RPC method.
 */
export interface QueryGetProtoRevNumberOfTradesRequestAmino {}
export interface QueryGetProtoRevNumberOfTradesRequestAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-number-of-trades-request";
  value: QueryGetProtoRevNumberOfTradesRequestAmino;
}
/**
 * QueryGetProtoRevNumberOfTradesRequest is request type for the
 * Query/GetProtoRevNumberOfTrades RPC method.
 */
export interface QueryGetProtoRevNumberOfTradesRequestSDKType {}
/**
 * QueryGetProtoRevNumberOfTradesResponse is response type for the
 * Query/GetProtoRevNumberOfTrades RPC method.
 */
export interface QueryGetProtoRevNumberOfTradesResponse {
  /** number_of_trades is the number of trades the module has executed */
  numberOfTrades: string;
}
export interface QueryGetProtoRevNumberOfTradesResponseProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevNumberOfTradesResponse";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevNumberOfTradesResponse is response type for the
 * Query/GetProtoRevNumberOfTrades RPC method.
 */
export interface QueryGetProtoRevNumberOfTradesResponseAmino {
  /** number_of_trades is the number of trades the module has executed */
  number_of_trades: string;
}
export interface QueryGetProtoRevNumberOfTradesResponseAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-number-of-trades-response";
  value: QueryGetProtoRevNumberOfTradesResponseAmino;
}
/**
 * QueryGetProtoRevNumberOfTradesResponse is response type for the
 * Query/GetProtoRevNumberOfTrades RPC method.
 */
export interface QueryGetProtoRevNumberOfTradesResponseSDKType {
  number_of_trades: string;
}
/**
 * QueryGetProtoRevProfitsByDenomRequest is request type for the
 * Query/GetProtoRevProfitsByDenom RPC method.
 */
export interface QueryGetProtoRevProfitsByDenomRequest {
  /** denom is the denom to query profits by */
  denom: string;
}
export interface QueryGetProtoRevProfitsByDenomRequestProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevProfitsByDenomRequest";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevProfitsByDenomRequest is request type for the
 * Query/GetProtoRevProfitsByDenom RPC method.
 */
export interface QueryGetProtoRevProfitsByDenomRequestAmino {
  /** denom is the denom to query profits by */
  denom: string;
}
export interface QueryGetProtoRevProfitsByDenomRequestAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-profits-by-denom-request";
  value: QueryGetProtoRevProfitsByDenomRequestAmino;
}
/**
 * QueryGetProtoRevProfitsByDenomRequest is request type for the
 * Query/GetProtoRevProfitsByDenom RPC method.
 */
export interface QueryGetProtoRevProfitsByDenomRequestSDKType {
  denom: string;
}
/**
 * QueryGetProtoRevProfitsByDenomResponse is response type for the
 * Query/GetProtoRevProfitsByDenom RPC method.
 */
export interface QueryGetProtoRevProfitsByDenomResponse {
  /** profit is the profits of the module by the selected denom */
  profit?: Coin;
}
export interface QueryGetProtoRevProfitsByDenomResponseProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevProfitsByDenomResponse";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevProfitsByDenomResponse is response type for the
 * Query/GetProtoRevProfitsByDenom RPC method.
 */
export interface QueryGetProtoRevProfitsByDenomResponseAmino {
  /** profit is the profits of the module by the selected denom */
  profit?: CoinAmino;
}
export interface QueryGetProtoRevProfitsByDenomResponseAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-profits-by-denom-response";
  value: QueryGetProtoRevProfitsByDenomResponseAmino;
}
/**
 * QueryGetProtoRevProfitsByDenomResponse is response type for the
 * Query/GetProtoRevProfitsByDenom RPC method.
 */
export interface QueryGetProtoRevProfitsByDenomResponseSDKType {
  profit?: CoinSDKType;
}
/**
 * QueryGetProtoRevAllProfitsRequest is request type for the
 * Query/GetProtoRevAllProfits RPC method.
 */
export interface QueryGetProtoRevAllProfitsRequest {}
export interface QueryGetProtoRevAllProfitsRequestProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevAllProfitsRequest";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevAllProfitsRequest is request type for the
 * Query/GetProtoRevAllProfits RPC method.
 */
export interface QueryGetProtoRevAllProfitsRequestAmino {}
export interface QueryGetProtoRevAllProfitsRequestAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-all-profits-request";
  value: QueryGetProtoRevAllProfitsRequestAmino;
}
/**
 * QueryGetProtoRevAllProfitsRequest is request type for the
 * Query/GetProtoRevAllProfits RPC method.
 */
export interface QueryGetProtoRevAllProfitsRequestSDKType {}
/**
 * QueryGetProtoRevAllProfitsResponse is response type for the
 * Query/GetProtoRevAllProfits RPC method.
 */
export interface QueryGetProtoRevAllProfitsResponse {
  /** profits is a list of all of the profits from the module */
  profits: Coin[];
}
export interface QueryGetProtoRevAllProfitsResponseProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevAllProfitsResponse";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevAllProfitsResponse is response type for the
 * Query/GetProtoRevAllProfits RPC method.
 */
export interface QueryGetProtoRevAllProfitsResponseAmino {
  /** profits is a list of all of the profits from the module */
  profits: CoinAmino[];
}
export interface QueryGetProtoRevAllProfitsResponseAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-all-profits-response";
  value: QueryGetProtoRevAllProfitsResponseAmino;
}
/**
 * QueryGetProtoRevAllProfitsResponse is response type for the
 * Query/GetProtoRevAllProfits RPC method.
 */
export interface QueryGetProtoRevAllProfitsResponseSDKType {
  profits: CoinSDKType[];
}
/**
 * QueryGetProtoRevStatisticsByPoolRequest is request type for the
 * Query/GetProtoRevStatisticsByRoute RPC method.
 */
export interface QueryGetProtoRevStatisticsByRouteRequest {
  /** route is the set of pool ids to query statistics by i.e. 1,2,3 */
  route: Long[];
}
export interface QueryGetProtoRevStatisticsByRouteRequestProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevStatisticsByRouteRequest";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevStatisticsByPoolRequest is request type for the
 * Query/GetProtoRevStatisticsByRoute RPC method.
 */
export interface QueryGetProtoRevStatisticsByRouteRequestAmino {
  /** route is the set of pool ids to query statistics by i.e. 1,2,3 */
  route: string[];
}
export interface QueryGetProtoRevStatisticsByRouteRequestAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-statistics-by-route-request";
  value: QueryGetProtoRevStatisticsByRouteRequestAmino;
}
/**
 * QueryGetProtoRevStatisticsByPoolRequest is request type for the
 * Query/GetProtoRevStatisticsByRoute RPC method.
 */
export interface QueryGetProtoRevStatisticsByRouteRequestSDKType {
  route: Long[];
}
/**
 * QueryGetProtoRevStatisticsByRouteResponse is response type for the
 * Query/GetProtoRevStatisticsByRoute RPC method.
 */
export interface QueryGetProtoRevStatisticsByRouteResponse {
  /**
   * statistics contains the number of trades the module has executed after a
   * swap on a given pool and the profits from the trades
   */
  statistics?: RouteStatistics;
}
export interface QueryGetProtoRevStatisticsByRouteResponseProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevStatisticsByRouteResponse";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevStatisticsByRouteResponse is response type for the
 * Query/GetProtoRevStatisticsByRoute RPC method.
 */
export interface QueryGetProtoRevStatisticsByRouteResponseAmino {
  /**
   * statistics contains the number of trades the module has executed after a
   * swap on a given pool and the profits from the trades
   */
  statistics?: RouteStatisticsAmino;
}
export interface QueryGetProtoRevStatisticsByRouteResponseAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-statistics-by-route-response";
  value: QueryGetProtoRevStatisticsByRouteResponseAmino;
}
/**
 * QueryGetProtoRevStatisticsByRouteResponse is response type for the
 * Query/GetProtoRevStatisticsByRoute RPC method.
 */
export interface QueryGetProtoRevStatisticsByRouteResponseSDKType {
  statistics?: RouteStatisticsSDKType;
}
/**
 * QueryGetProtoRevAllRouteStatisticsRequest is request type for the
 * Query/GetProtoRevAllRouteStatistics RPC method.
 */
export interface QueryGetProtoRevAllRouteStatisticsRequest {}
export interface QueryGetProtoRevAllRouteStatisticsRequestProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevAllRouteStatisticsRequest";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevAllRouteStatisticsRequest is request type for the
 * Query/GetProtoRevAllRouteStatistics RPC method.
 */
export interface QueryGetProtoRevAllRouteStatisticsRequestAmino {}
export interface QueryGetProtoRevAllRouteStatisticsRequestAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-all-route-statistics-request";
  value: QueryGetProtoRevAllRouteStatisticsRequestAmino;
}
/**
 * QueryGetProtoRevAllRouteStatisticsRequest is request type for the
 * Query/GetProtoRevAllRouteStatistics RPC method.
 */
export interface QueryGetProtoRevAllRouteStatisticsRequestSDKType {}
/**
 * QueryGetProtoRevAllRouteStatisticsResponse is response type for the
 * Query/GetProtoRevAllRouteStatistics RPC method.
 */
export interface QueryGetProtoRevAllRouteStatisticsResponse {
  /**
   * statistics contains the number of trades/profits the module has executed on
   * all routes it has successfully executed a trade on
   */
  statistics: RouteStatistics[];
}
export interface QueryGetProtoRevAllRouteStatisticsResponseProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevAllRouteStatisticsResponse";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevAllRouteStatisticsResponse is response type for the
 * Query/GetProtoRevAllRouteStatistics RPC method.
 */
export interface QueryGetProtoRevAllRouteStatisticsResponseAmino {
  /**
   * statistics contains the number of trades/profits the module has executed on
   * all routes it has successfully executed a trade on
   */
  statistics: RouteStatisticsAmino[];
}
export interface QueryGetProtoRevAllRouteStatisticsResponseAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-all-route-statistics-response";
  value: QueryGetProtoRevAllRouteStatisticsResponseAmino;
}
/**
 * QueryGetProtoRevAllRouteStatisticsResponse is response type for the
 * Query/GetProtoRevAllRouteStatistics RPC method.
 */
export interface QueryGetProtoRevAllRouteStatisticsResponseSDKType {
  statistics: RouteStatisticsSDKType[];
}
/**
 * QueryGetProtoRevTokenPairArbRoutesRequest is request type for the
 * Query/GetProtoRevTokenPairArbRoutes RPC method.
 */
export interface QueryGetProtoRevTokenPairArbRoutesRequest {}
export interface QueryGetProtoRevTokenPairArbRoutesRequestProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevTokenPairArbRoutesRequest";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevTokenPairArbRoutesRequest is request type for the
 * Query/GetProtoRevTokenPairArbRoutes RPC method.
 */
export interface QueryGetProtoRevTokenPairArbRoutesRequestAmino {}
export interface QueryGetProtoRevTokenPairArbRoutesRequestAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-token-pair-arb-routes-request";
  value: QueryGetProtoRevTokenPairArbRoutesRequestAmino;
}
/**
 * QueryGetProtoRevTokenPairArbRoutesRequest is request type for the
 * Query/GetProtoRevTokenPairArbRoutes RPC method.
 */
export interface QueryGetProtoRevTokenPairArbRoutesRequestSDKType {}
/**
 * QueryGetProtoRevTokenPairArbRoutesResponse is response type for the
 * Query/GetProtoRevTokenPairArbRoutes RPC method.
 */
export interface QueryGetProtoRevTokenPairArbRoutesResponse {
  /**
   * routes is a list of all of the hot routes that the module is currently
   * arbitraging
   */
  routes: TokenPairArbRoutes[];
}
export interface QueryGetProtoRevTokenPairArbRoutesResponseProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevTokenPairArbRoutesResponse";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevTokenPairArbRoutesResponse is response type for the
 * Query/GetProtoRevTokenPairArbRoutes RPC method.
 */
export interface QueryGetProtoRevTokenPairArbRoutesResponseAmino {
  /**
   * routes is a list of all of the hot routes that the module is currently
   * arbitraging
   */
  routes: TokenPairArbRoutesAmino[];
}
export interface QueryGetProtoRevTokenPairArbRoutesResponseAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-token-pair-arb-routes-response";
  value: QueryGetProtoRevTokenPairArbRoutesResponseAmino;
}
/**
 * QueryGetProtoRevTokenPairArbRoutesResponse is response type for the
 * Query/GetProtoRevTokenPairArbRoutes RPC method.
 */
export interface QueryGetProtoRevTokenPairArbRoutesResponseSDKType {
  routes: TokenPairArbRoutesSDKType[];
}
/**
 * QueryGetProtoRevAdminAccountRequest is request type for the
 * Query/GetProtoRevAdminAccount RPC method.
 */
export interface QueryGetProtoRevAdminAccountRequest {}
export interface QueryGetProtoRevAdminAccountRequestProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevAdminAccountRequest";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevAdminAccountRequest is request type for the
 * Query/GetProtoRevAdminAccount RPC method.
 */
export interface QueryGetProtoRevAdminAccountRequestAmino {}
export interface QueryGetProtoRevAdminAccountRequestAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-admin-account-request";
  value: QueryGetProtoRevAdminAccountRequestAmino;
}
/**
 * QueryGetProtoRevAdminAccountRequest is request type for the
 * Query/GetProtoRevAdminAccount RPC method.
 */
export interface QueryGetProtoRevAdminAccountRequestSDKType {}
/**
 * QueryGetProtoRevAdminAccountResponse is response type for the
 * Query/GetProtoRevAdminAccount RPC method.
 */
export interface QueryGetProtoRevAdminAccountResponse {
  /** admin_account is the admin account of the module */
  adminAccount: string;
}
export interface QueryGetProtoRevAdminAccountResponseProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevAdminAccountResponse";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevAdminAccountResponse is response type for the
 * Query/GetProtoRevAdminAccount RPC method.
 */
export interface QueryGetProtoRevAdminAccountResponseAmino {
  /** admin_account is the admin account of the module */
  admin_account: string;
}
export interface QueryGetProtoRevAdminAccountResponseAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-admin-account-response";
  value: QueryGetProtoRevAdminAccountResponseAmino;
}
/**
 * QueryGetProtoRevAdminAccountResponse is response type for the
 * Query/GetProtoRevAdminAccount RPC method.
 */
export interface QueryGetProtoRevAdminAccountResponseSDKType {
  admin_account: string;
}
/**
 * QueryGetProtoRevDeveloperAccountRequest is request type for the
 * Query/GetProtoRevDeveloperAccount RPC method.
 */
export interface QueryGetProtoRevDeveloperAccountRequest {}
export interface QueryGetProtoRevDeveloperAccountRequestProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevDeveloperAccountRequest";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevDeveloperAccountRequest is request type for the
 * Query/GetProtoRevDeveloperAccount RPC method.
 */
export interface QueryGetProtoRevDeveloperAccountRequestAmino {}
export interface QueryGetProtoRevDeveloperAccountRequestAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-developer-account-request";
  value: QueryGetProtoRevDeveloperAccountRequestAmino;
}
/**
 * QueryGetProtoRevDeveloperAccountRequest is request type for the
 * Query/GetProtoRevDeveloperAccount RPC method.
 */
export interface QueryGetProtoRevDeveloperAccountRequestSDKType {}
/**
 * QueryGetProtoRevDeveloperAccountResponse is response type for the
 * Query/GetProtoRevDeveloperAccount RPC method.
 */
export interface QueryGetProtoRevDeveloperAccountResponse {
  /** developer_account is the developer account of the module */
  developerAccount: string;
}
export interface QueryGetProtoRevDeveloperAccountResponseProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevDeveloperAccountResponse";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevDeveloperAccountResponse is response type for the
 * Query/GetProtoRevDeveloperAccount RPC method.
 */
export interface QueryGetProtoRevDeveloperAccountResponseAmino {
  /** developer_account is the developer account of the module */
  developer_account: string;
}
export interface QueryGetProtoRevDeveloperAccountResponseAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-developer-account-response";
  value: QueryGetProtoRevDeveloperAccountResponseAmino;
}
/**
 * QueryGetProtoRevDeveloperAccountResponse is response type for the
 * Query/GetProtoRevDeveloperAccount RPC method.
 */
export interface QueryGetProtoRevDeveloperAccountResponseSDKType {
  developer_account: string;
}
/**
 * QueryGetProtoRevPoolWeightsRequest is request type for the
 * Query/GetProtoRevPoolWeights RPC method.
 */
export interface QueryGetProtoRevPoolWeightsRequest {}
export interface QueryGetProtoRevPoolWeightsRequestProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevPoolWeightsRequest";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevPoolWeightsRequest is request type for the
 * Query/GetProtoRevPoolWeights RPC method.
 */
export interface QueryGetProtoRevPoolWeightsRequestAmino {}
export interface QueryGetProtoRevPoolWeightsRequestAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-pool-weights-request";
  value: QueryGetProtoRevPoolWeightsRequestAmino;
}
/**
 * QueryGetProtoRevPoolWeightsRequest is request type for the
 * Query/GetProtoRevPoolWeights RPC method.
 */
export interface QueryGetProtoRevPoolWeightsRequestSDKType {}
/**
 * QueryGetProtoRevPoolWeightsResponse is response type for the
 * Query/GetProtoRevPoolWeights RPC method.
 */
export interface QueryGetProtoRevPoolWeightsResponse {
  /** pool_weights is a list of all of the pool weights */
  poolWeights?: PoolWeights;
}
export interface QueryGetProtoRevPoolWeightsResponseProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevPoolWeightsResponse";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevPoolWeightsResponse is response type for the
 * Query/GetProtoRevPoolWeights RPC method.
 */
export interface QueryGetProtoRevPoolWeightsResponseAmino {
  /** pool_weights is a list of all of the pool weights */
  pool_weights?: PoolWeightsAmino;
}
export interface QueryGetProtoRevPoolWeightsResponseAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-pool-weights-response";
  value: QueryGetProtoRevPoolWeightsResponseAmino;
}
/**
 * QueryGetProtoRevPoolWeightsResponse is response type for the
 * Query/GetProtoRevPoolWeights RPC method.
 */
export interface QueryGetProtoRevPoolWeightsResponseSDKType {
  pool_weights?: PoolWeightsSDKType;
}
/**
 * QueryGetProtoRevMaxPoolPointsPerBlockRequest is request type for the
 * Query/GetProtoRevMaxPoolPointsPerBlock RPC method.
 */
export interface QueryGetProtoRevMaxPoolPointsPerBlockRequest {}
export interface QueryGetProtoRevMaxPoolPointsPerBlockRequestProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevMaxPoolPointsPerBlockRequest";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevMaxPoolPointsPerBlockRequest is request type for the
 * Query/GetProtoRevMaxPoolPointsPerBlock RPC method.
 */
export interface QueryGetProtoRevMaxPoolPointsPerBlockRequestAmino {}
export interface QueryGetProtoRevMaxPoolPointsPerBlockRequestAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-max-pool-points-per-block-request";
  value: QueryGetProtoRevMaxPoolPointsPerBlockRequestAmino;
}
/**
 * QueryGetProtoRevMaxPoolPointsPerBlockRequest is request type for the
 * Query/GetProtoRevMaxPoolPointsPerBlock RPC method.
 */
export interface QueryGetProtoRevMaxPoolPointsPerBlockRequestSDKType {}
/**
 * QueryGetProtoRevMaxPoolPointsPerBlockResponse is response type for the
 * Query/GetProtoRevMaxPoolPointsPerBlock RPC method.
 */
export interface QueryGetProtoRevMaxPoolPointsPerBlockResponse {
  /**
   * max_pool_points_per_block is the maximum number of pool points that can be
   * consumed per block
   */
  maxPoolPointsPerBlock: Long;
}
export interface QueryGetProtoRevMaxPoolPointsPerBlockResponseProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevMaxPoolPointsPerBlockResponse";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevMaxPoolPointsPerBlockResponse is response type for the
 * Query/GetProtoRevMaxPoolPointsPerBlock RPC method.
 */
export interface QueryGetProtoRevMaxPoolPointsPerBlockResponseAmino {
  /**
   * max_pool_points_per_block is the maximum number of pool points that can be
   * consumed per block
   */
  max_pool_points_per_block: string;
}
export interface QueryGetProtoRevMaxPoolPointsPerBlockResponseAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-max-pool-points-per-block-response";
  value: QueryGetProtoRevMaxPoolPointsPerBlockResponseAmino;
}
/**
 * QueryGetProtoRevMaxPoolPointsPerBlockResponse is response type for the
 * Query/GetProtoRevMaxPoolPointsPerBlock RPC method.
 */
export interface QueryGetProtoRevMaxPoolPointsPerBlockResponseSDKType {
  max_pool_points_per_block: Long;
}
/**
 * QueryGetProtoRevMaxPoolPointsPerTxRequest is request type for the
 * Query/GetProtoRevMaxPoolPointsPerTx RPC method.
 */
export interface QueryGetProtoRevMaxPoolPointsPerTxRequest {}
export interface QueryGetProtoRevMaxPoolPointsPerTxRequestProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevMaxPoolPointsPerTxRequest";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevMaxPoolPointsPerTxRequest is request type for the
 * Query/GetProtoRevMaxPoolPointsPerTx RPC method.
 */
export interface QueryGetProtoRevMaxPoolPointsPerTxRequestAmino {}
export interface QueryGetProtoRevMaxPoolPointsPerTxRequestAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-max-pool-points-per-tx-request";
  value: QueryGetProtoRevMaxPoolPointsPerTxRequestAmino;
}
/**
 * QueryGetProtoRevMaxPoolPointsPerTxRequest is request type for the
 * Query/GetProtoRevMaxPoolPointsPerTx RPC method.
 */
export interface QueryGetProtoRevMaxPoolPointsPerTxRequestSDKType {}
/**
 * QueryGetProtoRevMaxPoolPointsPerTxResponse is response type for the
 * Query/GetProtoRevMaxPoolPointsPerTx RPC method.
 */
export interface QueryGetProtoRevMaxPoolPointsPerTxResponse {
  /**
   * max_pool_points_per_tx is the maximum number of pool points that can be
   * consumed per transaction
   */
  maxPoolPointsPerTx: Long;
}
export interface QueryGetProtoRevMaxPoolPointsPerTxResponseProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevMaxPoolPointsPerTxResponse";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevMaxPoolPointsPerTxResponse is response type for the
 * Query/GetProtoRevMaxPoolPointsPerTx RPC method.
 */
export interface QueryGetProtoRevMaxPoolPointsPerTxResponseAmino {
  /**
   * max_pool_points_per_tx is the maximum number of pool points that can be
   * consumed per transaction
   */
  max_pool_points_per_tx: string;
}
export interface QueryGetProtoRevMaxPoolPointsPerTxResponseAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-max-pool-points-per-tx-response";
  value: QueryGetProtoRevMaxPoolPointsPerTxResponseAmino;
}
/**
 * QueryGetProtoRevMaxPoolPointsPerTxResponse is response type for the
 * Query/GetProtoRevMaxPoolPointsPerTx RPC method.
 */
export interface QueryGetProtoRevMaxPoolPointsPerTxResponseSDKType {
  max_pool_points_per_tx: Long;
}
/**
 * QueryGetProtoRevBaseDenomsRequest is request type for the
 * Query/GetProtoRevBaseDenoms RPC method.
 */
export interface QueryGetProtoRevBaseDenomsRequest {}
export interface QueryGetProtoRevBaseDenomsRequestProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevBaseDenomsRequest";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevBaseDenomsRequest is request type for the
 * Query/GetProtoRevBaseDenoms RPC method.
 */
export interface QueryGetProtoRevBaseDenomsRequestAmino {}
export interface QueryGetProtoRevBaseDenomsRequestAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-base-denoms-request";
  value: QueryGetProtoRevBaseDenomsRequestAmino;
}
/**
 * QueryGetProtoRevBaseDenomsRequest is request type for the
 * Query/GetProtoRevBaseDenoms RPC method.
 */
export interface QueryGetProtoRevBaseDenomsRequestSDKType {}
/**
 * QueryGetProtoRevBaseDenomsResponse is response type for the
 * Query/GetProtoRevBaseDenoms RPC method.
 */
export interface QueryGetProtoRevBaseDenomsResponse {
  /** base_denoms is a list of all of the base denoms and step sizes */
  baseDenoms: BaseDenom[];
}
export interface QueryGetProtoRevBaseDenomsResponseProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevBaseDenomsResponse";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevBaseDenomsResponse is response type for the
 * Query/GetProtoRevBaseDenoms RPC method.
 */
export interface QueryGetProtoRevBaseDenomsResponseAmino {
  /** base_denoms is a list of all of the base denoms and step sizes */
  base_denoms: BaseDenomAmino[];
}
export interface QueryGetProtoRevBaseDenomsResponseAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-base-denoms-response";
  value: QueryGetProtoRevBaseDenomsResponseAmino;
}
/**
 * QueryGetProtoRevBaseDenomsResponse is response type for the
 * Query/GetProtoRevBaseDenoms RPC method.
 */
export interface QueryGetProtoRevBaseDenomsResponseSDKType {
  base_denoms: BaseDenomSDKType[];
}
/**
 * QueryGetProtoRevEnabledRequest is request type for the
 * Query/GetProtoRevEnabled RPC method.
 */
export interface QueryGetProtoRevEnabledRequest {}
export interface QueryGetProtoRevEnabledRequestProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevEnabledRequest";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevEnabledRequest is request type for the
 * Query/GetProtoRevEnabled RPC method.
 */
export interface QueryGetProtoRevEnabledRequestAmino {}
export interface QueryGetProtoRevEnabledRequestAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-enabled-request";
  value: QueryGetProtoRevEnabledRequestAmino;
}
/**
 * QueryGetProtoRevEnabledRequest is request type for the
 * Query/GetProtoRevEnabled RPC method.
 */
export interface QueryGetProtoRevEnabledRequestSDKType {}
/**
 * QueryGetProtoRevEnabledResponse is response type for the
 * Query/GetProtoRevEnabled RPC method.
 */
export interface QueryGetProtoRevEnabledResponse {
  /** enabled is whether the module is enabled */
  enabled: boolean;
}
export interface QueryGetProtoRevEnabledResponseProtoMsg {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevEnabledResponse";
  value: Uint8Array;
}
/**
 * QueryGetProtoRevEnabledResponse is response type for the
 * Query/GetProtoRevEnabled RPC method.
 */
export interface QueryGetProtoRevEnabledResponseAmino {
  /** enabled is whether the module is enabled */
  enabled: boolean;
}
export interface QueryGetProtoRevEnabledResponseAminoMsg {
  type: "osmosis/protorev/query-get-proto-rev-enabled-response";
  value: QueryGetProtoRevEnabledResponseAmino;
}
/**
 * QueryGetProtoRevEnabledResponse is response type for the
 * Query/GetProtoRevEnabled RPC method.
 */
export interface QueryGetProtoRevEnabledResponseSDKType {
  enabled: boolean;
}
function createBaseQueryParamsRequest(): QueryParamsRequest {
  return {};
}
export const QueryParamsRequest = {
  typeUrl: "/osmosis.protorev.v1beta1.QueryParamsRequest",
  encode(
    _: QueryParamsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): QueryParamsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryParamsRequest();
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
  fromPartial(_: Partial<QueryParamsRequest>): QueryParamsRequest {
    const message = createBaseQueryParamsRequest();
    return message;
  },
  fromAmino(_: QueryParamsRequestAmino): QueryParamsRequest {
    return {};
  },
  toAmino(_: QueryParamsRequest): QueryParamsRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: QueryParamsRequestAminoMsg): QueryParamsRequest {
    return QueryParamsRequest.fromAmino(object.value);
  },
  toAminoMsg(message: QueryParamsRequest): QueryParamsRequestAminoMsg {
    return {
      type: "osmosis/protorev/query-params-request",
      value: QueryParamsRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryParamsRequestProtoMsg): QueryParamsRequest {
    return QueryParamsRequest.decode(message.value);
  },
  toProto(message: QueryParamsRequest): Uint8Array {
    return QueryParamsRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryParamsRequest): QueryParamsRequestProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.QueryParamsRequest",
      value: QueryParamsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryParamsResponse(): QueryParamsResponse {
  return {
    params: undefined,
  };
}
export const QueryParamsResponse = {
  typeUrl: "/osmosis.protorev.v1beta1.QueryParamsResponse",
  encode(
    message: QueryParamsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): QueryParamsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryParamsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = Params.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryParamsResponse>): QueryParamsResponse {
    const message = createBaseQueryParamsResponse();
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    return message;
  },
  fromAmino(object: QueryParamsResponseAmino): QueryParamsResponse {
    return {
      params: object?.params ? Params.fromAmino(object.params) : undefined,
    };
  },
  toAmino(message: QueryParamsResponse): QueryParamsResponseAmino {
    const obj: any = {};
    obj.params = message.params ? Params.toAmino(message.params) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryParamsResponseAminoMsg): QueryParamsResponse {
    return QueryParamsResponse.fromAmino(object.value);
  },
  toAminoMsg(message: QueryParamsResponse): QueryParamsResponseAminoMsg {
    return {
      type: "osmosis/protorev/query-params-response",
      value: QueryParamsResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryParamsResponseProtoMsg): QueryParamsResponse {
    return QueryParamsResponse.decode(message.value);
  },
  toProto(message: QueryParamsResponse): Uint8Array {
    return QueryParamsResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryParamsResponse): QueryParamsResponseProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.QueryParamsResponse",
      value: QueryParamsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevNumberOfTradesRequest(): QueryGetProtoRevNumberOfTradesRequest {
  return {};
}
export const QueryGetProtoRevNumberOfTradesRequest = {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevNumberOfTradesRequest",
  encode(
    _: QueryGetProtoRevNumberOfTradesRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevNumberOfTradesRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevNumberOfTradesRequest();
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
    _: Partial<QueryGetProtoRevNumberOfTradesRequest>
  ): QueryGetProtoRevNumberOfTradesRequest {
    const message = createBaseQueryGetProtoRevNumberOfTradesRequest();
    return message;
  },
  fromAmino(
    _: QueryGetProtoRevNumberOfTradesRequestAmino
  ): QueryGetProtoRevNumberOfTradesRequest {
    return {};
  },
  toAmino(
    _: QueryGetProtoRevNumberOfTradesRequest
  ): QueryGetProtoRevNumberOfTradesRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevNumberOfTradesRequestAminoMsg
  ): QueryGetProtoRevNumberOfTradesRequest {
    return QueryGetProtoRevNumberOfTradesRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevNumberOfTradesRequest
  ): QueryGetProtoRevNumberOfTradesRequestAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-number-of-trades-request",
      value: QueryGetProtoRevNumberOfTradesRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevNumberOfTradesRequestProtoMsg
  ): QueryGetProtoRevNumberOfTradesRequest {
    return QueryGetProtoRevNumberOfTradesRequest.decode(message.value);
  },
  toProto(message: QueryGetProtoRevNumberOfTradesRequest): Uint8Array {
    return QueryGetProtoRevNumberOfTradesRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevNumberOfTradesRequest
  ): QueryGetProtoRevNumberOfTradesRequestProtoMsg {
    return {
      typeUrl:
        "/osmosis.protorev.v1beta1.QueryGetProtoRevNumberOfTradesRequest",
      value: QueryGetProtoRevNumberOfTradesRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevNumberOfTradesResponse(): QueryGetProtoRevNumberOfTradesResponse {
  return {
    numberOfTrades: "",
  };
}
export const QueryGetProtoRevNumberOfTradesResponse = {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevNumberOfTradesResponse",
  encode(
    message: QueryGetProtoRevNumberOfTradesResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.numberOfTrades !== "") {
      writer.uint32(10).string(message.numberOfTrades);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevNumberOfTradesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevNumberOfTradesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.numberOfTrades = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryGetProtoRevNumberOfTradesResponse>
  ): QueryGetProtoRevNumberOfTradesResponse {
    const message = createBaseQueryGetProtoRevNumberOfTradesResponse();
    message.numberOfTrades = object.numberOfTrades ?? "";
    return message;
  },
  fromAmino(
    object: QueryGetProtoRevNumberOfTradesResponseAmino
  ): QueryGetProtoRevNumberOfTradesResponse {
    return {
      numberOfTrades: object.number_of_trades,
    };
  },
  toAmino(
    message: QueryGetProtoRevNumberOfTradesResponse
  ): QueryGetProtoRevNumberOfTradesResponseAmino {
    const obj: any = {};
    obj.number_of_trades = message.numberOfTrades;
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevNumberOfTradesResponseAminoMsg
  ): QueryGetProtoRevNumberOfTradesResponse {
    return QueryGetProtoRevNumberOfTradesResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevNumberOfTradesResponse
  ): QueryGetProtoRevNumberOfTradesResponseAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-number-of-trades-response",
      value: QueryGetProtoRevNumberOfTradesResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevNumberOfTradesResponseProtoMsg
  ): QueryGetProtoRevNumberOfTradesResponse {
    return QueryGetProtoRevNumberOfTradesResponse.decode(message.value);
  },
  toProto(message: QueryGetProtoRevNumberOfTradesResponse): Uint8Array {
    return QueryGetProtoRevNumberOfTradesResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevNumberOfTradesResponse
  ): QueryGetProtoRevNumberOfTradesResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.protorev.v1beta1.QueryGetProtoRevNumberOfTradesResponse",
      value: QueryGetProtoRevNumberOfTradesResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevProfitsByDenomRequest(): QueryGetProtoRevProfitsByDenomRequest {
  return {
    denom: "",
  };
}
export const QueryGetProtoRevProfitsByDenomRequest = {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevProfitsByDenomRequest",
  encode(
    message: QueryGetProtoRevProfitsByDenomRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.denom !== "") {
      writer.uint32(10).string(message.denom);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevProfitsByDenomRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevProfitsByDenomRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.denom = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryGetProtoRevProfitsByDenomRequest>
  ): QueryGetProtoRevProfitsByDenomRequest {
    const message = createBaseQueryGetProtoRevProfitsByDenomRequest();
    message.denom = object.denom ?? "";
    return message;
  },
  fromAmino(
    object: QueryGetProtoRevProfitsByDenomRequestAmino
  ): QueryGetProtoRevProfitsByDenomRequest {
    return {
      denom: object.denom,
    };
  },
  toAmino(
    message: QueryGetProtoRevProfitsByDenomRequest
  ): QueryGetProtoRevProfitsByDenomRequestAmino {
    const obj: any = {};
    obj.denom = message.denom;
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevProfitsByDenomRequestAminoMsg
  ): QueryGetProtoRevProfitsByDenomRequest {
    return QueryGetProtoRevProfitsByDenomRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevProfitsByDenomRequest
  ): QueryGetProtoRevProfitsByDenomRequestAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-profits-by-denom-request",
      value: QueryGetProtoRevProfitsByDenomRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevProfitsByDenomRequestProtoMsg
  ): QueryGetProtoRevProfitsByDenomRequest {
    return QueryGetProtoRevProfitsByDenomRequest.decode(message.value);
  },
  toProto(message: QueryGetProtoRevProfitsByDenomRequest): Uint8Array {
    return QueryGetProtoRevProfitsByDenomRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevProfitsByDenomRequest
  ): QueryGetProtoRevProfitsByDenomRequestProtoMsg {
    return {
      typeUrl:
        "/osmosis.protorev.v1beta1.QueryGetProtoRevProfitsByDenomRequest",
      value: QueryGetProtoRevProfitsByDenomRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevProfitsByDenomResponse(): QueryGetProtoRevProfitsByDenomResponse {
  return {
    profit: undefined,
  };
}
export const QueryGetProtoRevProfitsByDenomResponse = {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevProfitsByDenomResponse",
  encode(
    message: QueryGetProtoRevProfitsByDenomResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.profit !== undefined) {
      Coin.encode(message.profit, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevProfitsByDenomResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevProfitsByDenomResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.profit = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryGetProtoRevProfitsByDenomResponse>
  ): QueryGetProtoRevProfitsByDenomResponse {
    const message = createBaseQueryGetProtoRevProfitsByDenomResponse();
    message.profit =
      object.profit !== undefined && object.profit !== null
        ? Coin.fromPartial(object.profit)
        : undefined;
    return message;
  },
  fromAmino(
    object: QueryGetProtoRevProfitsByDenomResponseAmino
  ): QueryGetProtoRevProfitsByDenomResponse {
    return {
      profit: object?.profit ? Coin.fromAmino(object.profit) : undefined,
    };
  },
  toAmino(
    message: QueryGetProtoRevProfitsByDenomResponse
  ): QueryGetProtoRevProfitsByDenomResponseAmino {
    const obj: any = {};
    obj.profit = message.profit ? Coin.toAmino(message.profit) : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevProfitsByDenomResponseAminoMsg
  ): QueryGetProtoRevProfitsByDenomResponse {
    return QueryGetProtoRevProfitsByDenomResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevProfitsByDenomResponse
  ): QueryGetProtoRevProfitsByDenomResponseAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-profits-by-denom-response",
      value: QueryGetProtoRevProfitsByDenomResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevProfitsByDenomResponseProtoMsg
  ): QueryGetProtoRevProfitsByDenomResponse {
    return QueryGetProtoRevProfitsByDenomResponse.decode(message.value);
  },
  toProto(message: QueryGetProtoRevProfitsByDenomResponse): Uint8Array {
    return QueryGetProtoRevProfitsByDenomResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevProfitsByDenomResponse
  ): QueryGetProtoRevProfitsByDenomResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.protorev.v1beta1.QueryGetProtoRevProfitsByDenomResponse",
      value: QueryGetProtoRevProfitsByDenomResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevAllProfitsRequest(): QueryGetProtoRevAllProfitsRequest {
  return {};
}
export const QueryGetProtoRevAllProfitsRequest = {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevAllProfitsRequest",
  encode(
    _: QueryGetProtoRevAllProfitsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevAllProfitsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevAllProfitsRequest();
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
    _: Partial<QueryGetProtoRevAllProfitsRequest>
  ): QueryGetProtoRevAllProfitsRequest {
    const message = createBaseQueryGetProtoRevAllProfitsRequest();
    return message;
  },
  fromAmino(
    _: QueryGetProtoRevAllProfitsRequestAmino
  ): QueryGetProtoRevAllProfitsRequest {
    return {};
  },
  toAmino(
    _: QueryGetProtoRevAllProfitsRequest
  ): QueryGetProtoRevAllProfitsRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevAllProfitsRequestAminoMsg
  ): QueryGetProtoRevAllProfitsRequest {
    return QueryGetProtoRevAllProfitsRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevAllProfitsRequest
  ): QueryGetProtoRevAllProfitsRequestAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-all-profits-request",
      value: QueryGetProtoRevAllProfitsRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevAllProfitsRequestProtoMsg
  ): QueryGetProtoRevAllProfitsRequest {
    return QueryGetProtoRevAllProfitsRequest.decode(message.value);
  },
  toProto(message: QueryGetProtoRevAllProfitsRequest): Uint8Array {
    return QueryGetProtoRevAllProfitsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevAllProfitsRequest
  ): QueryGetProtoRevAllProfitsRequestProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevAllProfitsRequest",
      value: QueryGetProtoRevAllProfitsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevAllProfitsResponse(): QueryGetProtoRevAllProfitsResponse {
  return {
    profits: [],
  };
}
export const QueryGetProtoRevAllProfitsResponse = {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevAllProfitsResponse",
  encode(
    message: QueryGetProtoRevAllProfitsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.profits) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevAllProfitsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevAllProfitsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.profits.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryGetProtoRevAllProfitsResponse>
  ): QueryGetProtoRevAllProfitsResponse {
    const message = createBaseQueryGetProtoRevAllProfitsResponse();
    message.profits = object.profits?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: QueryGetProtoRevAllProfitsResponseAmino
  ): QueryGetProtoRevAllProfitsResponse {
    return {
      profits: Array.isArray(object?.profits)
        ? object.profits.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: QueryGetProtoRevAllProfitsResponse
  ): QueryGetProtoRevAllProfitsResponseAmino {
    const obj: any = {};
    if (message.profits) {
      obj.profits = message.profits.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.profits = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevAllProfitsResponseAminoMsg
  ): QueryGetProtoRevAllProfitsResponse {
    return QueryGetProtoRevAllProfitsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevAllProfitsResponse
  ): QueryGetProtoRevAllProfitsResponseAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-all-profits-response",
      value: QueryGetProtoRevAllProfitsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevAllProfitsResponseProtoMsg
  ): QueryGetProtoRevAllProfitsResponse {
    return QueryGetProtoRevAllProfitsResponse.decode(message.value);
  },
  toProto(message: QueryGetProtoRevAllProfitsResponse): Uint8Array {
    return QueryGetProtoRevAllProfitsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevAllProfitsResponse
  ): QueryGetProtoRevAllProfitsResponseProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevAllProfitsResponse",
      value: QueryGetProtoRevAllProfitsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevStatisticsByRouteRequest(): QueryGetProtoRevStatisticsByRouteRequest {
  return {
    route: [],
  };
}
export const QueryGetProtoRevStatisticsByRouteRequest = {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevStatisticsByRouteRequest",
  encode(
    message: QueryGetProtoRevStatisticsByRouteRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.route) {
      writer.uint64(v);
    }
    writer.ldelim();
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevStatisticsByRouteRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevStatisticsByRouteRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.route.push(reader.uint64() as Long);
            }
          } else {
            message.route.push(reader.uint64() as Long);
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryGetProtoRevStatisticsByRouteRequest>
  ): QueryGetProtoRevStatisticsByRouteRequest {
    const message = createBaseQueryGetProtoRevStatisticsByRouteRequest();
    message.route = object.route?.map((e) => Long.fromValue(e)) || [];
    return message;
  },
  fromAmino(
    object: QueryGetProtoRevStatisticsByRouteRequestAmino
  ): QueryGetProtoRevStatisticsByRouteRequest {
    return {
      route: Array.isArray(object?.route)
        ? object.route.map((e: any) => e)
        : [],
    };
  },
  toAmino(
    message: QueryGetProtoRevStatisticsByRouteRequest
  ): QueryGetProtoRevStatisticsByRouteRequestAmino {
    const obj: any = {};
    if (message.route) {
      obj.route = message.route.map((e) => e);
    } else {
      obj.route = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevStatisticsByRouteRequestAminoMsg
  ): QueryGetProtoRevStatisticsByRouteRequest {
    return QueryGetProtoRevStatisticsByRouteRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevStatisticsByRouteRequest
  ): QueryGetProtoRevStatisticsByRouteRequestAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-statistics-by-route-request",
      value: QueryGetProtoRevStatisticsByRouteRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevStatisticsByRouteRequestProtoMsg
  ): QueryGetProtoRevStatisticsByRouteRequest {
    return QueryGetProtoRevStatisticsByRouteRequest.decode(message.value);
  },
  toProto(message: QueryGetProtoRevStatisticsByRouteRequest): Uint8Array {
    return QueryGetProtoRevStatisticsByRouteRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevStatisticsByRouteRequest
  ): QueryGetProtoRevStatisticsByRouteRequestProtoMsg {
    return {
      typeUrl:
        "/osmosis.protorev.v1beta1.QueryGetProtoRevStatisticsByRouteRequest",
      value: QueryGetProtoRevStatisticsByRouteRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevStatisticsByRouteResponse(): QueryGetProtoRevStatisticsByRouteResponse {
  return {
    statistics: undefined,
  };
}
export const QueryGetProtoRevStatisticsByRouteResponse = {
  typeUrl:
    "/osmosis.protorev.v1beta1.QueryGetProtoRevStatisticsByRouteResponse",
  encode(
    message: QueryGetProtoRevStatisticsByRouteResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.statistics !== undefined) {
      RouteStatistics.encode(
        message.statistics,
        writer.uint32(10).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevStatisticsByRouteResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevStatisticsByRouteResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.statistics = RouteStatistics.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryGetProtoRevStatisticsByRouteResponse>
  ): QueryGetProtoRevStatisticsByRouteResponse {
    const message = createBaseQueryGetProtoRevStatisticsByRouteResponse();
    message.statistics =
      object.statistics !== undefined && object.statistics !== null
        ? RouteStatistics.fromPartial(object.statistics)
        : undefined;
    return message;
  },
  fromAmino(
    object: QueryGetProtoRevStatisticsByRouteResponseAmino
  ): QueryGetProtoRevStatisticsByRouteResponse {
    return {
      statistics: object?.statistics
        ? RouteStatistics.fromAmino(object.statistics)
        : undefined,
    };
  },
  toAmino(
    message: QueryGetProtoRevStatisticsByRouteResponse
  ): QueryGetProtoRevStatisticsByRouteResponseAmino {
    const obj: any = {};
    obj.statistics = message.statistics
      ? RouteStatistics.toAmino(message.statistics)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevStatisticsByRouteResponseAminoMsg
  ): QueryGetProtoRevStatisticsByRouteResponse {
    return QueryGetProtoRevStatisticsByRouteResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevStatisticsByRouteResponse
  ): QueryGetProtoRevStatisticsByRouteResponseAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-statistics-by-route-response",
      value: QueryGetProtoRevStatisticsByRouteResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevStatisticsByRouteResponseProtoMsg
  ): QueryGetProtoRevStatisticsByRouteResponse {
    return QueryGetProtoRevStatisticsByRouteResponse.decode(message.value);
  },
  toProto(message: QueryGetProtoRevStatisticsByRouteResponse): Uint8Array {
    return QueryGetProtoRevStatisticsByRouteResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevStatisticsByRouteResponse
  ): QueryGetProtoRevStatisticsByRouteResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.protorev.v1beta1.QueryGetProtoRevStatisticsByRouteResponse",
      value: QueryGetProtoRevStatisticsByRouteResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevAllRouteStatisticsRequest(): QueryGetProtoRevAllRouteStatisticsRequest {
  return {};
}
export const QueryGetProtoRevAllRouteStatisticsRequest = {
  typeUrl:
    "/osmosis.protorev.v1beta1.QueryGetProtoRevAllRouteStatisticsRequest",
  encode(
    _: QueryGetProtoRevAllRouteStatisticsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevAllRouteStatisticsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevAllRouteStatisticsRequest();
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
    _: Partial<QueryGetProtoRevAllRouteStatisticsRequest>
  ): QueryGetProtoRevAllRouteStatisticsRequest {
    const message = createBaseQueryGetProtoRevAllRouteStatisticsRequest();
    return message;
  },
  fromAmino(
    _: QueryGetProtoRevAllRouteStatisticsRequestAmino
  ): QueryGetProtoRevAllRouteStatisticsRequest {
    return {};
  },
  toAmino(
    _: QueryGetProtoRevAllRouteStatisticsRequest
  ): QueryGetProtoRevAllRouteStatisticsRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevAllRouteStatisticsRequestAminoMsg
  ): QueryGetProtoRevAllRouteStatisticsRequest {
    return QueryGetProtoRevAllRouteStatisticsRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevAllRouteStatisticsRequest
  ): QueryGetProtoRevAllRouteStatisticsRequestAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-all-route-statistics-request",
      value: QueryGetProtoRevAllRouteStatisticsRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevAllRouteStatisticsRequestProtoMsg
  ): QueryGetProtoRevAllRouteStatisticsRequest {
    return QueryGetProtoRevAllRouteStatisticsRequest.decode(message.value);
  },
  toProto(message: QueryGetProtoRevAllRouteStatisticsRequest): Uint8Array {
    return QueryGetProtoRevAllRouteStatisticsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevAllRouteStatisticsRequest
  ): QueryGetProtoRevAllRouteStatisticsRequestProtoMsg {
    return {
      typeUrl:
        "/osmosis.protorev.v1beta1.QueryGetProtoRevAllRouteStatisticsRequest",
      value: QueryGetProtoRevAllRouteStatisticsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevAllRouteStatisticsResponse(): QueryGetProtoRevAllRouteStatisticsResponse {
  return {
    statistics: [],
  };
}
export const QueryGetProtoRevAllRouteStatisticsResponse = {
  typeUrl:
    "/osmosis.protorev.v1beta1.QueryGetProtoRevAllRouteStatisticsResponse",
  encode(
    message: QueryGetProtoRevAllRouteStatisticsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.statistics) {
      RouteStatistics.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevAllRouteStatisticsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevAllRouteStatisticsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.statistics.push(
            RouteStatistics.decode(reader, reader.uint32())
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
    object: Partial<QueryGetProtoRevAllRouteStatisticsResponse>
  ): QueryGetProtoRevAllRouteStatisticsResponse {
    const message = createBaseQueryGetProtoRevAllRouteStatisticsResponse();
    message.statistics =
      object.statistics?.map((e) => RouteStatistics.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: QueryGetProtoRevAllRouteStatisticsResponseAmino
  ): QueryGetProtoRevAllRouteStatisticsResponse {
    return {
      statistics: Array.isArray(object?.statistics)
        ? object.statistics.map((e: any) => RouteStatistics.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: QueryGetProtoRevAllRouteStatisticsResponse
  ): QueryGetProtoRevAllRouteStatisticsResponseAmino {
    const obj: any = {};
    if (message.statistics) {
      obj.statistics = message.statistics.map((e) =>
        e ? RouteStatistics.toAmino(e) : undefined
      );
    } else {
      obj.statistics = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevAllRouteStatisticsResponseAminoMsg
  ): QueryGetProtoRevAllRouteStatisticsResponse {
    return QueryGetProtoRevAllRouteStatisticsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevAllRouteStatisticsResponse
  ): QueryGetProtoRevAllRouteStatisticsResponseAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-all-route-statistics-response",
      value: QueryGetProtoRevAllRouteStatisticsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevAllRouteStatisticsResponseProtoMsg
  ): QueryGetProtoRevAllRouteStatisticsResponse {
    return QueryGetProtoRevAllRouteStatisticsResponse.decode(message.value);
  },
  toProto(message: QueryGetProtoRevAllRouteStatisticsResponse): Uint8Array {
    return QueryGetProtoRevAllRouteStatisticsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevAllRouteStatisticsResponse
  ): QueryGetProtoRevAllRouteStatisticsResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.protorev.v1beta1.QueryGetProtoRevAllRouteStatisticsResponse",
      value:
        QueryGetProtoRevAllRouteStatisticsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevTokenPairArbRoutesRequest(): QueryGetProtoRevTokenPairArbRoutesRequest {
  return {};
}
export const QueryGetProtoRevTokenPairArbRoutesRequest = {
  typeUrl:
    "/osmosis.protorev.v1beta1.QueryGetProtoRevTokenPairArbRoutesRequest",
  encode(
    _: QueryGetProtoRevTokenPairArbRoutesRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevTokenPairArbRoutesRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevTokenPairArbRoutesRequest();
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
    _: Partial<QueryGetProtoRevTokenPairArbRoutesRequest>
  ): QueryGetProtoRevTokenPairArbRoutesRequest {
    const message = createBaseQueryGetProtoRevTokenPairArbRoutesRequest();
    return message;
  },
  fromAmino(
    _: QueryGetProtoRevTokenPairArbRoutesRequestAmino
  ): QueryGetProtoRevTokenPairArbRoutesRequest {
    return {};
  },
  toAmino(
    _: QueryGetProtoRevTokenPairArbRoutesRequest
  ): QueryGetProtoRevTokenPairArbRoutesRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevTokenPairArbRoutesRequestAminoMsg
  ): QueryGetProtoRevTokenPairArbRoutesRequest {
    return QueryGetProtoRevTokenPairArbRoutesRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevTokenPairArbRoutesRequest
  ): QueryGetProtoRevTokenPairArbRoutesRequestAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-token-pair-arb-routes-request",
      value: QueryGetProtoRevTokenPairArbRoutesRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevTokenPairArbRoutesRequestProtoMsg
  ): QueryGetProtoRevTokenPairArbRoutesRequest {
    return QueryGetProtoRevTokenPairArbRoutesRequest.decode(message.value);
  },
  toProto(message: QueryGetProtoRevTokenPairArbRoutesRequest): Uint8Array {
    return QueryGetProtoRevTokenPairArbRoutesRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevTokenPairArbRoutesRequest
  ): QueryGetProtoRevTokenPairArbRoutesRequestProtoMsg {
    return {
      typeUrl:
        "/osmosis.protorev.v1beta1.QueryGetProtoRevTokenPairArbRoutesRequest",
      value: QueryGetProtoRevTokenPairArbRoutesRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevTokenPairArbRoutesResponse(): QueryGetProtoRevTokenPairArbRoutesResponse {
  return {
    routes: [],
  };
}
export const QueryGetProtoRevTokenPairArbRoutesResponse = {
  typeUrl:
    "/osmosis.protorev.v1beta1.QueryGetProtoRevTokenPairArbRoutesResponse",
  encode(
    message: QueryGetProtoRevTokenPairArbRoutesResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.routes) {
      TokenPairArbRoutes.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevTokenPairArbRoutesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevTokenPairArbRoutesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.routes.push(
            TokenPairArbRoutes.decode(reader, reader.uint32())
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
    object: Partial<QueryGetProtoRevTokenPairArbRoutesResponse>
  ): QueryGetProtoRevTokenPairArbRoutesResponse {
    const message = createBaseQueryGetProtoRevTokenPairArbRoutesResponse();
    message.routes =
      object.routes?.map((e) => TokenPairArbRoutes.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: QueryGetProtoRevTokenPairArbRoutesResponseAmino
  ): QueryGetProtoRevTokenPairArbRoutesResponse {
    return {
      routes: Array.isArray(object?.routes)
        ? object.routes.map((e: any) => TokenPairArbRoutes.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: QueryGetProtoRevTokenPairArbRoutesResponse
  ): QueryGetProtoRevTokenPairArbRoutesResponseAmino {
    const obj: any = {};
    if (message.routes) {
      obj.routes = message.routes.map((e) =>
        e ? TokenPairArbRoutes.toAmino(e) : undefined
      );
    } else {
      obj.routes = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevTokenPairArbRoutesResponseAminoMsg
  ): QueryGetProtoRevTokenPairArbRoutesResponse {
    return QueryGetProtoRevTokenPairArbRoutesResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevTokenPairArbRoutesResponse
  ): QueryGetProtoRevTokenPairArbRoutesResponseAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-token-pair-arb-routes-response",
      value: QueryGetProtoRevTokenPairArbRoutesResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevTokenPairArbRoutesResponseProtoMsg
  ): QueryGetProtoRevTokenPairArbRoutesResponse {
    return QueryGetProtoRevTokenPairArbRoutesResponse.decode(message.value);
  },
  toProto(message: QueryGetProtoRevTokenPairArbRoutesResponse): Uint8Array {
    return QueryGetProtoRevTokenPairArbRoutesResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevTokenPairArbRoutesResponse
  ): QueryGetProtoRevTokenPairArbRoutesResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.protorev.v1beta1.QueryGetProtoRevTokenPairArbRoutesResponse",
      value:
        QueryGetProtoRevTokenPairArbRoutesResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevAdminAccountRequest(): QueryGetProtoRevAdminAccountRequest {
  return {};
}
export const QueryGetProtoRevAdminAccountRequest = {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevAdminAccountRequest",
  encode(
    _: QueryGetProtoRevAdminAccountRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevAdminAccountRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevAdminAccountRequest();
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
    _: Partial<QueryGetProtoRevAdminAccountRequest>
  ): QueryGetProtoRevAdminAccountRequest {
    const message = createBaseQueryGetProtoRevAdminAccountRequest();
    return message;
  },
  fromAmino(
    _: QueryGetProtoRevAdminAccountRequestAmino
  ): QueryGetProtoRevAdminAccountRequest {
    return {};
  },
  toAmino(
    _: QueryGetProtoRevAdminAccountRequest
  ): QueryGetProtoRevAdminAccountRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevAdminAccountRequestAminoMsg
  ): QueryGetProtoRevAdminAccountRequest {
    return QueryGetProtoRevAdminAccountRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevAdminAccountRequest
  ): QueryGetProtoRevAdminAccountRequestAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-admin-account-request",
      value: QueryGetProtoRevAdminAccountRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevAdminAccountRequestProtoMsg
  ): QueryGetProtoRevAdminAccountRequest {
    return QueryGetProtoRevAdminAccountRequest.decode(message.value);
  },
  toProto(message: QueryGetProtoRevAdminAccountRequest): Uint8Array {
    return QueryGetProtoRevAdminAccountRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevAdminAccountRequest
  ): QueryGetProtoRevAdminAccountRequestProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevAdminAccountRequest",
      value: QueryGetProtoRevAdminAccountRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevAdminAccountResponse(): QueryGetProtoRevAdminAccountResponse {
  return {
    adminAccount: "",
  };
}
export const QueryGetProtoRevAdminAccountResponse = {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevAdminAccountResponse",
  encode(
    message: QueryGetProtoRevAdminAccountResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.adminAccount !== "") {
      writer.uint32(10).string(message.adminAccount);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevAdminAccountResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevAdminAccountResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.adminAccount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryGetProtoRevAdminAccountResponse>
  ): QueryGetProtoRevAdminAccountResponse {
    const message = createBaseQueryGetProtoRevAdminAccountResponse();
    message.adminAccount = object.adminAccount ?? "";
    return message;
  },
  fromAmino(
    object: QueryGetProtoRevAdminAccountResponseAmino
  ): QueryGetProtoRevAdminAccountResponse {
    return {
      adminAccount: object.admin_account,
    };
  },
  toAmino(
    message: QueryGetProtoRevAdminAccountResponse
  ): QueryGetProtoRevAdminAccountResponseAmino {
    const obj: any = {};
    obj.admin_account = message.adminAccount;
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevAdminAccountResponseAminoMsg
  ): QueryGetProtoRevAdminAccountResponse {
    return QueryGetProtoRevAdminAccountResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevAdminAccountResponse
  ): QueryGetProtoRevAdminAccountResponseAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-admin-account-response",
      value: QueryGetProtoRevAdminAccountResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevAdminAccountResponseProtoMsg
  ): QueryGetProtoRevAdminAccountResponse {
    return QueryGetProtoRevAdminAccountResponse.decode(message.value);
  },
  toProto(message: QueryGetProtoRevAdminAccountResponse): Uint8Array {
    return QueryGetProtoRevAdminAccountResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevAdminAccountResponse
  ): QueryGetProtoRevAdminAccountResponseProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevAdminAccountResponse",
      value: QueryGetProtoRevAdminAccountResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevDeveloperAccountRequest(): QueryGetProtoRevDeveloperAccountRequest {
  return {};
}
export const QueryGetProtoRevDeveloperAccountRequest = {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevDeveloperAccountRequest",
  encode(
    _: QueryGetProtoRevDeveloperAccountRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevDeveloperAccountRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevDeveloperAccountRequest();
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
    _: Partial<QueryGetProtoRevDeveloperAccountRequest>
  ): QueryGetProtoRevDeveloperAccountRequest {
    const message = createBaseQueryGetProtoRevDeveloperAccountRequest();
    return message;
  },
  fromAmino(
    _: QueryGetProtoRevDeveloperAccountRequestAmino
  ): QueryGetProtoRevDeveloperAccountRequest {
    return {};
  },
  toAmino(
    _: QueryGetProtoRevDeveloperAccountRequest
  ): QueryGetProtoRevDeveloperAccountRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevDeveloperAccountRequestAminoMsg
  ): QueryGetProtoRevDeveloperAccountRequest {
    return QueryGetProtoRevDeveloperAccountRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevDeveloperAccountRequest
  ): QueryGetProtoRevDeveloperAccountRequestAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-developer-account-request",
      value: QueryGetProtoRevDeveloperAccountRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevDeveloperAccountRequestProtoMsg
  ): QueryGetProtoRevDeveloperAccountRequest {
    return QueryGetProtoRevDeveloperAccountRequest.decode(message.value);
  },
  toProto(message: QueryGetProtoRevDeveloperAccountRequest): Uint8Array {
    return QueryGetProtoRevDeveloperAccountRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevDeveloperAccountRequest
  ): QueryGetProtoRevDeveloperAccountRequestProtoMsg {
    return {
      typeUrl:
        "/osmosis.protorev.v1beta1.QueryGetProtoRevDeveloperAccountRequest",
      value: QueryGetProtoRevDeveloperAccountRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevDeveloperAccountResponse(): QueryGetProtoRevDeveloperAccountResponse {
  return {
    developerAccount: "",
  };
}
export const QueryGetProtoRevDeveloperAccountResponse = {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevDeveloperAccountResponse",
  encode(
    message: QueryGetProtoRevDeveloperAccountResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.developerAccount !== "") {
      writer.uint32(10).string(message.developerAccount);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevDeveloperAccountResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevDeveloperAccountResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.developerAccount = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryGetProtoRevDeveloperAccountResponse>
  ): QueryGetProtoRevDeveloperAccountResponse {
    const message = createBaseQueryGetProtoRevDeveloperAccountResponse();
    message.developerAccount = object.developerAccount ?? "";
    return message;
  },
  fromAmino(
    object: QueryGetProtoRevDeveloperAccountResponseAmino
  ): QueryGetProtoRevDeveloperAccountResponse {
    return {
      developerAccount: object.developer_account,
    };
  },
  toAmino(
    message: QueryGetProtoRevDeveloperAccountResponse
  ): QueryGetProtoRevDeveloperAccountResponseAmino {
    const obj: any = {};
    obj.developer_account = message.developerAccount;
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevDeveloperAccountResponseAminoMsg
  ): QueryGetProtoRevDeveloperAccountResponse {
    return QueryGetProtoRevDeveloperAccountResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevDeveloperAccountResponse
  ): QueryGetProtoRevDeveloperAccountResponseAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-developer-account-response",
      value: QueryGetProtoRevDeveloperAccountResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevDeveloperAccountResponseProtoMsg
  ): QueryGetProtoRevDeveloperAccountResponse {
    return QueryGetProtoRevDeveloperAccountResponse.decode(message.value);
  },
  toProto(message: QueryGetProtoRevDeveloperAccountResponse): Uint8Array {
    return QueryGetProtoRevDeveloperAccountResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevDeveloperAccountResponse
  ): QueryGetProtoRevDeveloperAccountResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.protorev.v1beta1.QueryGetProtoRevDeveloperAccountResponse",
      value: QueryGetProtoRevDeveloperAccountResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevPoolWeightsRequest(): QueryGetProtoRevPoolWeightsRequest {
  return {};
}
export const QueryGetProtoRevPoolWeightsRequest = {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevPoolWeightsRequest",
  encode(
    _: QueryGetProtoRevPoolWeightsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevPoolWeightsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevPoolWeightsRequest();
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
    _: Partial<QueryGetProtoRevPoolWeightsRequest>
  ): QueryGetProtoRevPoolWeightsRequest {
    const message = createBaseQueryGetProtoRevPoolWeightsRequest();
    return message;
  },
  fromAmino(
    _: QueryGetProtoRevPoolWeightsRequestAmino
  ): QueryGetProtoRevPoolWeightsRequest {
    return {};
  },
  toAmino(
    _: QueryGetProtoRevPoolWeightsRequest
  ): QueryGetProtoRevPoolWeightsRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevPoolWeightsRequestAminoMsg
  ): QueryGetProtoRevPoolWeightsRequest {
    return QueryGetProtoRevPoolWeightsRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevPoolWeightsRequest
  ): QueryGetProtoRevPoolWeightsRequestAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-pool-weights-request",
      value: QueryGetProtoRevPoolWeightsRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevPoolWeightsRequestProtoMsg
  ): QueryGetProtoRevPoolWeightsRequest {
    return QueryGetProtoRevPoolWeightsRequest.decode(message.value);
  },
  toProto(message: QueryGetProtoRevPoolWeightsRequest): Uint8Array {
    return QueryGetProtoRevPoolWeightsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevPoolWeightsRequest
  ): QueryGetProtoRevPoolWeightsRequestProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevPoolWeightsRequest",
      value: QueryGetProtoRevPoolWeightsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevPoolWeightsResponse(): QueryGetProtoRevPoolWeightsResponse {
  return {
    poolWeights: undefined,
  };
}
export const QueryGetProtoRevPoolWeightsResponse = {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevPoolWeightsResponse",
  encode(
    message: QueryGetProtoRevPoolWeightsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.poolWeights !== undefined) {
      PoolWeights.encode(
        message.poolWeights,
        writer.uint32(10).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevPoolWeightsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevPoolWeightsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolWeights = PoolWeights.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryGetProtoRevPoolWeightsResponse>
  ): QueryGetProtoRevPoolWeightsResponse {
    const message = createBaseQueryGetProtoRevPoolWeightsResponse();
    message.poolWeights =
      object.poolWeights !== undefined && object.poolWeights !== null
        ? PoolWeights.fromPartial(object.poolWeights)
        : undefined;
    return message;
  },
  fromAmino(
    object: QueryGetProtoRevPoolWeightsResponseAmino
  ): QueryGetProtoRevPoolWeightsResponse {
    return {
      poolWeights: object?.pool_weights
        ? PoolWeights.fromAmino(object.pool_weights)
        : undefined,
    };
  },
  toAmino(
    message: QueryGetProtoRevPoolWeightsResponse
  ): QueryGetProtoRevPoolWeightsResponseAmino {
    const obj: any = {};
    obj.pool_weights = message.poolWeights
      ? PoolWeights.toAmino(message.poolWeights)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevPoolWeightsResponseAminoMsg
  ): QueryGetProtoRevPoolWeightsResponse {
    return QueryGetProtoRevPoolWeightsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevPoolWeightsResponse
  ): QueryGetProtoRevPoolWeightsResponseAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-pool-weights-response",
      value: QueryGetProtoRevPoolWeightsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevPoolWeightsResponseProtoMsg
  ): QueryGetProtoRevPoolWeightsResponse {
    return QueryGetProtoRevPoolWeightsResponse.decode(message.value);
  },
  toProto(message: QueryGetProtoRevPoolWeightsResponse): Uint8Array {
    return QueryGetProtoRevPoolWeightsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevPoolWeightsResponse
  ): QueryGetProtoRevPoolWeightsResponseProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevPoolWeightsResponse",
      value: QueryGetProtoRevPoolWeightsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevMaxPoolPointsPerBlockRequest(): QueryGetProtoRevMaxPoolPointsPerBlockRequest {
  return {};
}
export const QueryGetProtoRevMaxPoolPointsPerBlockRequest = {
  typeUrl:
    "/osmosis.protorev.v1beta1.QueryGetProtoRevMaxPoolPointsPerBlockRequest",
  encode(
    _: QueryGetProtoRevMaxPoolPointsPerBlockRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevMaxPoolPointsPerBlockRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevMaxPoolPointsPerBlockRequest();
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
    _: Partial<QueryGetProtoRevMaxPoolPointsPerBlockRequest>
  ): QueryGetProtoRevMaxPoolPointsPerBlockRequest {
    const message = createBaseQueryGetProtoRevMaxPoolPointsPerBlockRequest();
    return message;
  },
  fromAmino(
    _: QueryGetProtoRevMaxPoolPointsPerBlockRequestAmino
  ): QueryGetProtoRevMaxPoolPointsPerBlockRequest {
    return {};
  },
  toAmino(
    _: QueryGetProtoRevMaxPoolPointsPerBlockRequest
  ): QueryGetProtoRevMaxPoolPointsPerBlockRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevMaxPoolPointsPerBlockRequestAminoMsg
  ): QueryGetProtoRevMaxPoolPointsPerBlockRequest {
    return QueryGetProtoRevMaxPoolPointsPerBlockRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevMaxPoolPointsPerBlockRequest
  ): QueryGetProtoRevMaxPoolPointsPerBlockRequestAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-max-pool-points-per-block-request",
      value: QueryGetProtoRevMaxPoolPointsPerBlockRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevMaxPoolPointsPerBlockRequestProtoMsg
  ): QueryGetProtoRevMaxPoolPointsPerBlockRequest {
    return QueryGetProtoRevMaxPoolPointsPerBlockRequest.decode(message.value);
  },
  toProto(message: QueryGetProtoRevMaxPoolPointsPerBlockRequest): Uint8Array {
    return QueryGetProtoRevMaxPoolPointsPerBlockRequest.encode(
      message
    ).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevMaxPoolPointsPerBlockRequest
  ): QueryGetProtoRevMaxPoolPointsPerBlockRequestProtoMsg {
    return {
      typeUrl:
        "/osmosis.protorev.v1beta1.QueryGetProtoRevMaxPoolPointsPerBlockRequest",
      value:
        QueryGetProtoRevMaxPoolPointsPerBlockRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevMaxPoolPointsPerBlockResponse(): QueryGetProtoRevMaxPoolPointsPerBlockResponse {
  return {
    maxPoolPointsPerBlock: Long.UZERO,
  };
}
export const QueryGetProtoRevMaxPoolPointsPerBlockResponse = {
  typeUrl:
    "/osmosis.protorev.v1beta1.QueryGetProtoRevMaxPoolPointsPerBlockResponse",
  encode(
    message: QueryGetProtoRevMaxPoolPointsPerBlockResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.maxPoolPointsPerBlock.isZero()) {
      writer.uint32(8).uint64(message.maxPoolPointsPerBlock);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevMaxPoolPointsPerBlockResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevMaxPoolPointsPerBlockResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.maxPoolPointsPerBlock = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryGetProtoRevMaxPoolPointsPerBlockResponse>
  ): QueryGetProtoRevMaxPoolPointsPerBlockResponse {
    const message = createBaseQueryGetProtoRevMaxPoolPointsPerBlockResponse();
    message.maxPoolPointsPerBlock =
      object.maxPoolPointsPerBlock !== undefined &&
      object.maxPoolPointsPerBlock !== null
        ? Long.fromValue(object.maxPoolPointsPerBlock)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: QueryGetProtoRevMaxPoolPointsPerBlockResponseAmino
  ): QueryGetProtoRevMaxPoolPointsPerBlockResponse {
    return {
      maxPoolPointsPerBlock: Long.fromString(object.max_pool_points_per_block),
    };
  },
  toAmino(
    message: QueryGetProtoRevMaxPoolPointsPerBlockResponse
  ): QueryGetProtoRevMaxPoolPointsPerBlockResponseAmino {
    const obj: any = {};
    obj.max_pool_points_per_block = message.maxPoolPointsPerBlock
      ? message.maxPoolPointsPerBlock.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevMaxPoolPointsPerBlockResponseAminoMsg
  ): QueryGetProtoRevMaxPoolPointsPerBlockResponse {
    return QueryGetProtoRevMaxPoolPointsPerBlockResponse.fromAmino(
      object.value
    );
  },
  toAminoMsg(
    message: QueryGetProtoRevMaxPoolPointsPerBlockResponse
  ): QueryGetProtoRevMaxPoolPointsPerBlockResponseAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-max-pool-points-per-block-response",
      value: QueryGetProtoRevMaxPoolPointsPerBlockResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevMaxPoolPointsPerBlockResponseProtoMsg
  ): QueryGetProtoRevMaxPoolPointsPerBlockResponse {
    return QueryGetProtoRevMaxPoolPointsPerBlockResponse.decode(message.value);
  },
  toProto(message: QueryGetProtoRevMaxPoolPointsPerBlockResponse): Uint8Array {
    return QueryGetProtoRevMaxPoolPointsPerBlockResponse.encode(
      message
    ).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevMaxPoolPointsPerBlockResponse
  ): QueryGetProtoRevMaxPoolPointsPerBlockResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.protorev.v1beta1.QueryGetProtoRevMaxPoolPointsPerBlockResponse",
      value:
        QueryGetProtoRevMaxPoolPointsPerBlockResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevMaxPoolPointsPerTxRequest(): QueryGetProtoRevMaxPoolPointsPerTxRequest {
  return {};
}
export const QueryGetProtoRevMaxPoolPointsPerTxRequest = {
  typeUrl:
    "/osmosis.protorev.v1beta1.QueryGetProtoRevMaxPoolPointsPerTxRequest",
  encode(
    _: QueryGetProtoRevMaxPoolPointsPerTxRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevMaxPoolPointsPerTxRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevMaxPoolPointsPerTxRequest();
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
    _: Partial<QueryGetProtoRevMaxPoolPointsPerTxRequest>
  ): QueryGetProtoRevMaxPoolPointsPerTxRequest {
    const message = createBaseQueryGetProtoRevMaxPoolPointsPerTxRequest();
    return message;
  },
  fromAmino(
    _: QueryGetProtoRevMaxPoolPointsPerTxRequestAmino
  ): QueryGetProtoRevMaxPoolPointsPerTxRequest {
    return {};
  },
  toAmino(
    _: QueryGetProtoRevMaxPoolPointsPerTxRequest
  ): QueryGetProtoRevMaxPoolPointsPerTxRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevMaxPoolPointsPerTxRequestAminoMsg
  ): QueryGetProtoRevMaxPoolPointsPerTxRequest {
    return QueryGetProtoRevMaxPoolPointsPerTxRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevMaxPoolPointsPerTxRequest
  ): QueryGetProtoRevMaxPoolPointsPerTxRequestAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-max-pool-points-per-tx-request",
      value: QueryGetProtoRevMaxPoolPointsPerTxRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevMaxPoolPointsPerTxRequestProtoMsg
  ): QueryGetProtoRevMaxPoolPointsPerTxRequest {
    return QueryGetProtoRevMaxPoolPointsPerTxRequest.decode(message.value);
  },
  toProto(message: QueryGetProtoRevMaxPoolPointsPerTxRequest): Uint8Array {
    return QueryGetProtoRevMaxPoolPointsPerTxRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevMaxPoolPointsPerTxRequest
  ): QueryGetProtoRevMaxPoolPointsPerTxRequestProtoMsg {
    return {
      typeUrl:
        "/osmosis.protorev.v1beta1.QueryGetProtoRevMaxPoolPointsPerTxRequest",
      value: QueryGetProtoRevMaxPoolPointsPerTxRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevMaxPoolPointsPerTxResponse(): QueryGetProtoRevMaxPoolPointsPerTxResponse {
  return {
    maxPoolPointsPerTx: Long.UZERO,
  };
}
export const QueryGetProtoRevMaxPoolPointsPerTxResponse = {
  typeUrl:
    "/osmosis.protorev.v1beta1.QueryGetProtoRevMaxPoolPointsPerTxResponse",
  encode(
    message: QueryGetProtoRevMaxPoolPointsPerTxResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.maxPoolPointsPerTx.isZero()) {
      writer.uint32(8).uint64(message.maxPoolPointsPerTx);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevMaxPoolPointsPerTxResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevMaxPoolPointsPerTxResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.maxPoolPointsPerTx = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryGetProtoRevMaxPoolPointsPerTxResponse>
  ): QueryGetProtoRevMaxPoolPointsPerTxResponse {
    const message = createBaseQueryGetProtoRevMaxPoolPointsPerTxResponse();
    message.maxPoolPointsPerTx =
      object.maxPoolPointsPerTx !== undefined &&
      object.maxPoolPointsPerTx !== null
        ? Long.fromValue(object.maxPoolPointsPerTx)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: QueryGetProtoRevMaxPoolPointsPerTxResponseAmino
  ): QueryGetProtoRevMaxPoolPointsPerTxResponse {
    return {
      maxPoolPointsPerTx: Long.fromString(object.max_pool_points_per_tx),
    };
  },
  toAmino(
    message: QueryGetProtoRevMaxPoolPointsPerTxResponse
  ): QueryGetProtoRevMaxPoolPointsPerTxResponseAmino {
    const obj: any = {};
    obj.max_pool_points_per_tx = message.maxPoolPointsPerTx
      ? message.maxPoolPointsPerTx.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevMaxPoolPointsPerTxResponseAminoMsg
  ): QueryGetProtoRevMaxPoolPointsPerTxResponse {
    return QueryGetProtoRevMaxPoolPointsPerTxResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevMaxPoolPointsPerTxResponse
  ): QueryGetProtoRevMaxPoolPointsPerTxResponseAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-max-pool-points-per-tx-response",
      value: QueryGetProtoRevMaxPoolPointsPerTxResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevMaxPoolPointsPerTxResponseProtoMsg
  ): QueryGetProtoRevMaxPoolPointsPerTxResponse {
    return QueryGetProtoRevMaxPoolPointsPerTxResponse.decode(message.value);
  },
  toProto(message: QueryGetProtoRevMaxPoolPointsPerTxResponse): Uint8Array {
    return QueryGetProtoRevMaxPoolPointsPerTxResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevMaxPoolPointsPerTxResponse
  ): QueryGetProtoRevMaxPoolPointsPerTxResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.protorev.v1beta1.QueryGetProtoRevMaxPoolPointsPerTxResponse",
      value:
        QueryGetProtoRevMaxPoolPointsPerTxResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevBaseDenomsRequest(): QueryGetProtoRevBaseDenomsRequest {
  return {};
}
export const QueryGetProtoRevBaseDenomsRequest = {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevBaseDenomsRequest",
  encode(
    _: QueryGetProtoRevBaseDenomsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevBaseDenomsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevBaseDenomsRequest();
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
    _: Partial<QueryGetProtoRevBaseDenomsRequest>
  ): QueryGetProtoRevBaseDenomsRequest {
    const message = createBaseQueryGetProtoRevBaseDenomsRequest();
    return message;
  },
  fromAmino(
    _: QueryGetProtoRevBaseDenomsRequestAmino
  ): QueryGetProtoRevBaseDenomsRequest {
    return {};
  },
  toAmino(
    _: QueryGetProtoRevBaseDenomsRequest
  ): QueryGetProtoRevBaseDenomsRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevBaseDenomsRequestAminoMsg
  ): QueryGetProtoRevBaseDenomsRequest {
    return QueryGetProtoRevBaseDenomsRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevBaseDenomsRequest
  ): QueryGetProtoRevBaseDenomsRequestAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-base-denoms-request",
      value: QueryGetProtoRevBaseDenomsRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevBaseDenomsRequestProtoMsg
  ): QueryGetProtoRevBaseDenomsRequest {
    return QueryGetProtoRevBaseDenomsRequest.decode(message.value);
  },
  toProto(message: QueryGetProtoRevBaseDenomsRequest): Uint8Array {
    return QueryGetProtoRevBaseDenomsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevBaseDenomsRequest
  ): QueryGetProtoRevBaseDenomsRequestProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevBaseDenomsRequest",
      value: QueryGetProtoRevBaseDenomsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevBaseDenomsResponse(): QueryGetProtoRevBaseDenomsResponse {
  return {
    baseDenoms: [],
  };
}
export const QueryGetProtoRevBaseDenomsResponse = {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevBaseDenomsResponse",
  encode(
    message: QueryGetProtoRevBaseDenomsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.baseDenoms) {
      BaseDenom.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevBaseDenomsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevBaseDenomsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.baseDenoms.push(BaseDenom.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryGetProtoRevBaseDenomsResponse>
  ): QueryGetProtoRevBaseDenomsResponse {
    const message = createBaseQueryGetProtoRevBaseDenomsResponse();
    message.baseDenoms =
      object.baseDenoms?.map((e) => BaseDenom.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: QueryGetProtoRevBaseDenomsResponseAmino
  ): QueryGetProtoRevBaseDenomsResponse {
    return {
      baseDenoms: Array.isArray(object?.base_denoms)
        ? object.base_denoms.map((e: any) => BaseDenom.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: QueryGetProtoRevBaseDenomsResponse
  ): QueryGetProtoRevBaseDenomsResponseAmino {
    const obj: any = {};
    if (message.baseDenoms) {
      obj.base_denoms = message.baseDenoms.map((e) =>
        e ? BaseDenom.toAmino(e) : undefined
      );
    } else {
      obj.base_denoms = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevBaseDenomsResponseAminoMsg
  ): QueryGetProtoRevBaseDenomsResponse {
    return QueryGetProtoRevBaseDenomsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevBaseDenomsResponse
  ): QueryGetProtoRevBaseDenomsResponseAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-base-denoms-response",
      value: QueryGetProtoRevBaseDenomsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevBaseDenomsResponseProtoMsg
  ): QueryGetProtoRevBaseDenomsResponse {
    return QueryGetProtoRevBaseDenomsResponse.decode(message.value);
  },
  toProto(message: QueryGetProtoRevBaseDenomsResponse): Uint8Array {
    return QueryGetProtoRevBaseDenomsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevBaseDenomsResponse
  ): QueryGetProtoRevBaseDenomsResponseProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevBaseDenomsResponse",
      value: QueryGetProtoRevBaseDenomsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevEnabledRequest(): QueryGetProtoRevEnabledRequest {
  return {};
}
export const QueryGetProtoRevEnabledRequest = {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevEnabledRequest",
  encode(
    _: QueryGetProtoRevEnabledRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevEnabledRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevEnabledRequest();
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
    _: Partial<QueryGetProtoRevEnabledRequest>
  ): QueryGetProtoRevEnabledRequest {
    const message = createBaseQueryGetProtoRevEnabledRequest();
    return message;
  },
  fromAmino(
    _: QueryGetProtoRevEnabledRequestAmino
  ): QueryGetProtoRevEnabledRequest {
    return {};
  },
  toAmino(
    _: QueryGetProtoRevEnabledRequest
  ): QueryGetProtoRevEnabledRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevEnabledRequestAminoMsg
  ): QueryGetProtoRevEnabledRequest {
    return QueryGetProtoRevEnabledRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevEnabledRequest
  ): QueryGetProtoRevEnabledRequestAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-enabled-request",
      value: QueryGetProtoRevEnabledRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevEnabledRequestProtoMsg
  ): QueryGetProtoRevEnabledRequest {
    return QueryGetProtoRevEnabledRequest.decode(message.value);
  },
  toProto(message: QueryGetProtoRevEnabledRequest): Uint8Array {
    return QueryGetProtoRevEnabledRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevEnabledRequest
  ): QueryGetProtoRevEnabledRequestProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevEnabledRequest",
      value: QueryGetProtoRevEnabledRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryGetProtoRevEnabledResponse(): QueryGetProtoRevEnabledResponse {
  return {
    enabled: false,
  };
}
export const QueryGetProtoRevEnabledResponse = {
  typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevEnabledResponse",
  encode(
    message: QueryGetProtoRevEnabledResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.enabled === true) {
      writer.uint32(8).bool(message.enabled);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryGetProtoRevEnabledResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryGetProtoRevEnabledResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.enabled = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryGetProtoRevEnabledResponse>
  ): QueryGetProtoRevEnabledResponse {
    const message = createBaseQueryGetProtoRevEnabledResponse();
    message.enabled = object.enabled ?? false;
    return message;
  },
  fromAmino(
    object: QueryGetProtoRevEnabledResponseAmino
  ): QueryGetProtoRevEnabledResponse {
    return {
      enabled: object.enabled,
    };
  },
  toAmino(
    message: QueryGetProtoRevEnabledResponse
  ): QueryGetProtoRevEnabledResponseAmino {
    const obj: any = {};
    obj.enabled = message.enabled;
    return obj;
  },
  fromAminoMsg(
    object: QueryGetProtoRevEnabledResponseAminoMsg
  ): QueryGetProtoRevEnabledResponse {
    return QueryGetProtoRevEnabledResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryGetProtoRevEnabledResponse
  ): QueryGetProtoRevEnabledResponseAminoMsg {
    return {
      type: "osmosis/protorev/query-get-proto-rev-enabled-response",
      value: QueryGetProtoRevEnabledResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryGetProtoRevEnabledResponseProtoMsg
  ): QueryGetProtoRevEnabledResponse {
    return QueryGetProtoRevEnabledResponse.decode(message.value);
  },
  toProto(message: QueryGetProtoRevEnabledResponse): Uint8Array {
    return QueryGetProtoRevEnabledResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryGetProtoRevEnabledResponse
  ): QueryGetProtoRevEnabledResponseProtoMsg {
    return {
      typeUrl: "/osmosis.protorev.v1beta1.QueryGetProtoRevEnabledResponse",
      value: QueryGetProtoRevEnabledResponse.encode(message).finish(),
    };
  },
};
