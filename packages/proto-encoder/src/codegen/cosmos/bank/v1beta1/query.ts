//@ts-nocheck
/* eslint-disable */
import {
  PageRequest,
  PageRequestAmino,
  PageRequestSDKType,
  PageResponse,
  PageResponseAmino,
  PageResponseSDKType,
} from "../../base/query/v1beta1/pagination";
import { Coin, CoinAmino, CoinSDKType } from "../../base/v1beta1/coin";
import {
  Params,
  ParamsAmino,
  ParamsSDKType,
  Metadata,
  MetadataAmino,
  MetadataSDKType,
} from "./bank";
import * as _m0 from "protobufjs/minimal";
/** QueryBalanceRequest is the request type for the Query/Balance RPC method. */
export interface QueryBalanceRequest {
  /** address is the address to query balances for. */
  address: string;
  /** denom is the coin denom to query balances for. */
  denom: string;
}
export interface QueryBalanceRequestProtoMsg {
  typeUrl: "/cosmos.bank.v1beta1.QueryBalanceRequest";
  value: Uint8Array;
}
/** QueryBalanceRequest is the request type for the Query/Balance RPC method. */
export interface QueryBalanceRequestAmino {
  /** address is the address to query balances for. */
  address: string;
  /** denom is the coin denom to query balances for. */
  denom: string;
}
export interface QueryBalanceRequestAminoMsg {
  type: "cosmos-sdk/QueryBalanceRequest";
  value: QueryBalanceRequestAmino;
}
/** QueryBalanceRequest is the request type for the Query/Balance RPC method. */
export interface QueryBalanceRequestSDKType {
  address: string;
  denom: string;
}
/** QueryBalanceResponse is the response type for the Query/Balance RPC method. */
export interface QueryBalanceResponse {
  /** balance is the balance of the coin. */
  balance?: Coin;
}
export interface QueryBalanceResponseProtoMsg {
  typeUrl: "/cosmos.bank.v1beta1.QueryBalanceResponse";
  value: Uint8Array;
}
/** QueryBalanceResponse is the response type for the Query/Balance RPC method. */
export interface QueryBalanceResponseAmino {
  /** balance is the balance of the coin. */
  balance?: CoinAmino;
}
export interface QueryBalanceResponseAminoMsg {
  type: "cosmos-sdk/QueryBalanceResponse";
  value: QueryBalanceResponseAmino;
}
/** QueryBalanceResponse is the response type for the Query/Balance RPC method. */
export interface QueryBalanceResponseSDKType {
  balance?: CoinSDKType;
}
/** QueryBalanceRequest is the request type for the Query/AllBalances RPC method. */
export interface QueryAllBalancesRequest {
  /** address is the address to query balances for. */
  address: string;
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequest;
}
export interface QueryAllBalancesRequestProtoMsg {
  typeUrl: "/cosmos.bank.v1beta1.QueryAllBalancesRequest";
  value: Uint8Array;
}
/** QueryBalanceRequest is the request type for the Query/AllBalances RPC method. */
export interface QueryAllBalancesRequestAmino {
  /** address is the address to query balances for. */
  address: string;
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequestAmino;
}
export interface QueryAllBalancesRequestAminoMsg {
  type: "cosmos-sdk/QueryAllBalancesRequest";
  value: QueryAllBalancesRequestAmino;
}
/** QueryBalanceRequest is the request type for the Query/AllBalances RPC method. */
export interface QueryAllBalancesRequestSDKType {
  address: string;
  pagination?: PageRequestSDKType;
}
/**
 * QueryAllBalancesResponse is the response type for the Query/AllBalances RPC
 * method.
 */
export interface QueryAllBalancesResponse {
  /** balances is the balances of all the coins. */
  balances: Coin[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}
export interface QueryAllBalancesResponseProtoMsg {
  typeUrl: "/cosmos.bank.v1beta1.QueryAllBalancesResponse";
  value: Uint8Array;
}
/**
 * QueryAllBalancesResponse is the response type for the Query/AllBalances RPC
 * method.
 */
export interface QueryAllBalancesResponseAmino {
  /** balances is the balances of all the coins. */
  balances: CoinAmino[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponseAmino;
}
export interface QueryAllBalancesResponseAminoMsg {
  type: "cosmos-sdk/QueryAllBalancesResponse";
  value: QueryAllBalancesResponseAmino;
}
/**
 * QueryAllBalancesResponse is the response type for the Query/AllBalances RPC
 * method.
 */
export interface QueryAllBalancesResponseSDKType {
  balances: CoinSDKType[];
  pagination?: PageResponseSDKType;
}
/**
 * QueryTotalSupplyRequest is the request type for the Query/TotalSupply RPC
 * method.
 */
export interface QueryTotalSupplyRequest {
  /**
   * pagination defines an optional pagination for the request.
   *
   * Since: cosmos-sdk 0.43
   */
  pagination?: PageRequest;
}
export interface QueryTotalSupplyRequestProtoMsg {
  typeUrl: "/cosmos.bank.v1beta1.QueryTotalSupplyRequest";
  value: Uint8Array;
}
/**
 * QueryTotalSupplyRequest is the request type for the Query/TotalSupply RPC
 * method.
 */
export interface QueryTotalSupplyRequestAmino {
  /**
   * pagination defines an optional pagination for the request.
   *
   * Since: cosmos-sdk 0.43
   */
  pagination?: PageRequestAmino;
}
export interface QueryTotalSupplyRequestAminoMsg {
  type: "cosmos-sdk/QueryTotalSupplyRequest";
  value: QueryTotalSupplyRequestAmino;
}
/**
 * QueryTotalSupplyRequest is the request type for the Query/TotalSupply RPC
 * method.
 */
export interface QueryTotalSupplyRequestSDKType {
  pagination?: PageRequestSDKType;
}
/**
 * QueryTotalSupplyResponse is the response type for the Query/TotalSupply RPC
 * method
 */
export interface QueryTotalSupplyResponse {
  /** supply is the supply of the coins */
  supply: Coin[];
  /**
   * pagination defines the pagination in the response.
   *
   * Since: cosmos-sdk 0.43
   */
  pagination?: PageResponse;
}
export interface QueryTotalSupplyResponseProtoMsg {
  typeUrl: "/cosmos.bank.v1beta1.QueryTotalSupplyResponse";
  value: Uint8Array;
}
/**
 * QueryTotalSupplyResponse is the response type for the Query/TotalSupply RPC
 * method
 */
export interface QueryTotalSupplyResponseAmino {
  /** supply is the supply of the coins */
  supply: CoinAmino[];
  /**
   * pagination defines the pagination in the response.
   *
   * Since: cosmos-sdk 0.43
   */
  pagination?: PageResponseAmino;
}
export interface QueryTotalSupplyResponseAminoMsg {
  type: "cosmos-sdk/QueryTotalSupplyResponse";
  value: QueryTotalSupplyResponseAmino;
}
/**
 * QueryTotalSupplyResponse is the response type for the Query/TotalSupply RPC
 * method
 */
export interface QueryTotalSupplyResponseSDKType {
  supply: CoinSDKType[];
  pagination?: PageResponseSDKType;
}
/** QuerySupplyOfRequest is the request type for the Query/SupplyOf RPC method. */
export interface QuerySupplyOfRequest {
  /** denom is the coin denom to query balances for. */
  denom: string;
}
export interface QuerySupplyOfRequestProtoMsg {
  typeUrl: "/cosmos.bank.v1beta1.QuerySupplyOfRequest";
  value: Uint8Array;
}
/** QuerySupplyOfRequest is the request type for the Query/SupplyOf RPC method. */
export interface QuerySupplyOfRequestAmino {
  /** denom is the coin denom to query balances for. */
  denom: string;
}
export interface QuerySupplyOfRequestAminoMsg {
  type: "cosmos-sdk/QuerySupplyOfRequest";
  value: QuerySupplyOfRequestAmino;
}
/** QuerySupplyOfRequest is the request type for the Query/SupplyOf RPC method. */
export interface QuerySupplyOfRequestSDKType {
  denom: string;
}
/** QuerySupplyOfResponse is the response type for the Query/SupplyOf RPC method. */
export interface QuerySupplyOfResponse {
  /** amount is the supply of the coin. */
  amount?: Coin;
}
export interface QuerySupplyOfResponseProtoMsg {
  typeUrl: "/cosmos.bank.v1beta1.QuerySupplyOfResponse";
  value: Uint8Array;
}
/** QuerySupplyOfResponse is the response type for the Query/SupplyOf RPC method. */
export interface QuerySupplyOfResponseAmino {
  /** amount is the supply of the coin. */
  amount?: CoinAmino;
}
export interface QuerySupplyOfResponseAminoMsg {
  type: "cosmos-sdk/QuerySupplyOfResponse";
  value: QuerySupplyOfResponseAmino;
}
/** QuerySupplyOfResponse is the response type for the Query/SupplyOf RPC method. */
export interface QuerySupplyOfResponseSDKType {
  amount?: CoinSDKType;
}
/**
 * QueryTotalSupplyWithoutOffsetRequest is the request type for the Query/TotalSupplyWithoutOffset RPC
 * method.
 */
export interface QueryTotalSupplyWithoutOffsetRequest {
  /**
   * pagination defines an optional pagination for the request.
   *
   * Since: cosmos-sdk 0.43
   */
  pagination?: PageRequest;
}
export interface QueryTotalSupplyWithoutOffsetRequestProtoMsg {
  typeUrl: "/cosmos.bank.v1beta1.QueryTotalSupplyWithoutOffsetRequest";
  value: Uint8Array;
}
/**
 * QueryTotalSupplyWithoutOffsetRequest is the request type for the Query/TotalSupplyWithoutOffset RPC
 * method.
 */
export interface QueryTotalSupplyWithoutOffsetRequestAmino {
  /**
   * pagination defines an optional pagination for the request.
   *
   * Since: cosmos-sdk 0.43
   */
  pagination?: PageRequestAmino;
}
export interface QueryTotalSupplyWithoutOffsetRequestAminoMsg {
  type: "cosmos-sdk/QueryTotalSupplyWithoutOffsetRequest";
  value: QueryTotalSupplyWithoutOffsetRequestAmino;
}
/**
 * QueryTotalSupplyWithoutOffsetRequest is the request type for the Query/TotalSupplyWithoutOffset RPC
 * method.
 */
export interface QueryTotalSupplyWithoutOffsetRequestSDKType {
  pagination?: PageRequestSDKType;
}
/**
 * QueryTotalSupplyWithoutOffsetResponse is the response type for the Query/TotalSupplyWithoutOffset RPC
 * method
 */
export interface QueryTotalSupplyWithoutOffsetResponse {
  /** supply is the supply of the coins */
  supply: Coin[];
  /**
   * pagination defines the pagination in the response.
   *
   * Since: cosmos-sdk 0.43
   */
  pagination?: PageResponse;
}
export interface QueryTotalSupplyWithoutOffsetResponseProtoMsg {
  typeUrl: "/cosmos.bank.v1beta1.QueryTotalSupplyWithoutOffsetResponse";
  value: Uint8Array;
}
/**
 * QueryTotalSupplyWithoutOffsetResponse is the response type for the Query/TotalSupplyWithoutOffset RPC
 * method
 */
export interface QueryTotalSupplyWithoutOffsetResponseAmino {
  /** supply is the supply of the coins */
  supply: CoinAmino[];
  /**
   * pagination defines the pagination in the response.
   *
   * Since: cosmos-sdk 0.43
   */
  pagination?: PageResponseAmino;
}
export interface QueryTotalSupplyWithoutOffsetResponseAminoMsg {
  type: "cosmos-sdk/QueryTotalSupplyWithoutOffsetResponse";
  value: QueryTotalSupplyWithoutOffsetResponseAmino;
}
/**
 * QueryTotalSupplyWithoutOffsetResponse is the response type for the Query/TotalSupplyWithoutOffset RPC
 * method
 */
export interface QueryTotalSupplyWithoutOffsetResponseSDKType {
  supply: CoinSDKType[];
  pagination?: PageResponseSDKType;
}
/** QuerySupplyOfWithoutOffsetRequest is the request type for the Query/SupplyOfWithoutOffset RPC method. */
export interface QuerySupplyOfWithoutOffsetRequest {
  /** denom is the coin denom to query balances for. */
  denom: string;
}
export interface QuerySupplyOfWithoutOffsetRequestProtoMsg {
  typeUrl: "/cosmos.bank.v1beta1.QuerySupplyOfWithoutOffsetRequest";
  value: Uint8Array;
}
/** QuerySupplyOfWithoutOffsetRequest is the request type for the Query/SupplyOfWithoutOffset RPC method. */
export interface QuerySupplyOfWithoutOffsetRequestAmino {
  /** denom is the coin denom to query balances for. */
  denom: string;
}
export interface QuerySupplyOfWithoutOffsetRequestAminoMsg {
  type: "cosmos-sdk/QuerySupplyOfWithoutOffsetRequest";
  value: QuerySupplyOfWithoutOffsetRequestAmino;
}
/** QuerySupplyOfWithoutOffsetRequest is the request type for the Query/SupplyOfWithoutOffset RPC method. */
export interface QuerySupplyOfWithoutOffsetRequestSDKType {
  denom: string;
}
/** QuerySupplyOfWithoutOffsetResponse is the response type for the Query/SupplyOfWithoutOffset RPC method. */
export interface QuerySupplyOfWithoutOffsetResponse {
  /** amount is the supply of the coin. */
  amount?: Coin;
}
export interface QuerySupplyOfWithoutOffsetResponseProtoMsg {
  typeUrl: "/cosmos.bank.v1beta1.QuerySupplyOfWithoutOffsetResponse";
  value: Uint8Array;
}
/** QuerySupplyOfWithoutOffsetResponse is the response type for the Query/SupplyOfWithoutOffset RPC method. */
export interface QuerySupplyOfWithoutOffsetResponseAmino {
  /** amount is the supply of the coin. */
  amount?: CoinAmino;
}
export interface QuerySupplyOfWithoutOffsetResponseAminoMsg {
  type: "cosmos-sdk/QuerySupplyOfWithoutOffsetResponse";
  value: QuerySupplyOfWithoutOffsetResponseAmino;
}
/** QuerySupplyOfWithoutOffsetResponse is the response type for the Query/SupplyOfWithoutOffset RPC method. */
export interface QuerySupplyOfWithoutOffsetResponseSDKType {
  amount?: CoinSDKType;
}
/** QueryParamsRequest defines the request type for querying x/bank parameters. */
export interface QueryParamsRequest {}
export interface QueryParamsRequestProtoMsg {
  typeUrl: "/cosmos.bank.v1beta1.QueryParamsRequest";
  value: Uint8Array;
}
/** QueryParamsRequest defines the request type for querying x/bank parameters. */
export interface QueryParamsRequestAmino {}
export interface QueryParamsRequestAminoMsg {
  type: "cosmos-sdk/QueryParamsRequest";
  value: QueryParamsRequestAmino;
}
/** QueryParamsRequest defines the request type for querying x/bank parameters. */
export interface QueryParamsRequestSDKType {}
/** QueryParamsResponse defines the response type for querying x/bank parameters. */
export interface QueryParamsResponse {
  params?: Params;
}
export interface QueryParamsResponseProtoMsg {
  typeUrl: "/cosmos.bank.v1beta1.QueryParamsResponse";
  value: Uint8Array;
}
/** QueryParamsResponse defines the response type for querying x/bank parameters. */
export interface QueryParamsResponseAmino {
  params?: ParamsAmino;
}
export interface QueryParamsResponseAminoMsg {
  type: "cosmos-sdk/QueryParamsResponse";
  value: QueryParamsResponseAmino;
}
/** QueryParamsResponse defines the response type for querying x/bank parameters. */
export interface QueryParamsResponseSDKType {
  params?: ParamsSDKType;
}
/** QueryDenomsMetadataRequest is the request type for the Query/DenomsMetadata RPC method. */
export interface QueryDenomsMetadataRequest {
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequest;
}
export interface QueryDenomsMetadataRequestProtoMsg {
  typeUrl: "/cosmos.bank.v1beta1.QueryDenomsMetadataRequest";
  value: Uint8Array;
}
/** QueryDenomsMetadataRequest is the request type for the Query/DenomsMetadata RPC method. */
export interface QueryDenomsMetadataRequestAmino {
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequestAmino;
}
export interface QueryDenomsMetadataRequestAminoMsg {
  type: "cosmos-sdk/QueryDenomsMetadataRequest";
  value: QueryDenomsMetadataRequestAmino;
}
/** QueryDenomsMetadataRequest is the request type for the Query/DenomsMetadata RPC method. */
export interface QueryDenomsMetadataRequestSDKType {
  pagination?: PageRequestSDKType;
}
/**
 * QueryDenomsMetadataResponse is the response type for the Query/DenomsMetadata RPC
 * method.
 */
export interface QueryDenomsMetadataResponse {
  /** metadata provides the client information for all the registered tokens. */
  metadatas: Metadata[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}
export interface QueryDenomsMetadataResponseProtoMsg {
  typeUrl: "/cosmos.bank.v1beta1.QueryDenomsMetadataResponse";
  value: Uint8Array;
}
/**
 * QueryDenomsMetadataResponse is the response type for the Query/DenomsMetadata RPC
 * method.
 */
export interface QueryDenomsMetadataResponseAmino {
  /** metadata provides the client information for all the registered tokens. */
  metadatas: MetadataAmino[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponseAmino;
}
export interface QueryDenomsMetadataResponseAminoMsg {
  type: "cosmos-sdk/QueryDenomsMetadataResponse";
  value: QueryDenomsMetadataResponseAmino;
}
/**
 * QueryDenomsMetadataResponse is the response type for the Query/DenomsMetadata RPC
 * method.
 */
export interface QueryDenomsMetadataResponseSDKType {
  metadatas: MetadataSDKType[];
  pagination?: PageResponseSDKType;
}
/** QueryDenomMetadataRequest is the request type for the Query/DenomMetadata RPC method. */
export interface QueryDenomMetadataRequest {
  /** denom is the coin denom to query the metadata for. */
  denom: string;
}
export interface QueryDenomMetadataRequestProtoMsg {
  typeUrl: "/cosmos.bank.v1beta1.QueryDenomMetadataRequest";
  value: Uint8Array;
}
/** QueryDenomMetadataRequest is the request type for the Query/DenomMetadata RPC method. */
export interface QueryDenomMetadataRequestAmino {
  /** denom is the coin denom to query the metadata for. */
  denom: string;
}
export interface QueryDenomMetadataRequestAminoMsg {
  type: "cosmos-sdk/QueryDenomMetadataRequest";
  value: QueryDenomMetadataRequestAmino;
}
/** QueryDenomMetadataRequest is the request type for the Query/DenomMetadata RPC method. */
export interface QueryDenomMetadataRequestSDKType {
  denom: string;
}
/**
 * QueryDenomMetadataResponse is the response type for the Query/DenomMetadata RPC
 * method.
 */
export interface QueryDenomMetadataResponse {
  /** metadata describes and provides all the client information for the requested token. */
  metadata?: Metadata;
}
export interface QueryDenomMetadataResponseProtoMsg {
  typeUrl: "/cosmos.bank.v1beta1.QueryDenomMetadataResponse";
  value: Uint8Array;
}
/**
 * QueryDenomMetadataResponse is the response type for the Query/DenomMetadata RPC
 * method.
 */
export interface QueryDenomMetadataResponseAmino {
  /** metadata describes and provides all the client information for the requested token. */
  metadata?: MetadataAmino;
}
export interface QueryDenomMetadataResponseAminoMsg {
  type: "cosmos-sdk/QueryDenomMetadataResponse";
  value: QueryDenomMetadataResponseAmino;
}
/**
 * QueryDenomMetadataResponse is the response type for the Query/DenomMetadata RPC
 * method.
 */
export interface QueryDenomMetadataResponseSDKType {
  metadata?: MetadataSDKType;
}
/** QueryBaseDenomRequest defines the request type for the BaseDenom gRPC method. */
export interface QueryBaseDenomRequest {
  denom: string;
}
export interface QueryBaseDenomRequestProtoMsg {
  typeUrl: "/cosmos.bank.v1beta1.QueryBaseDenomRequest";
  value: Uint8Array;
}
/** QueryBaseDenomRequest defines the request type for the BaseDenom gRPC method. */
export interface QueryBaseDenomRequestAmino {
  denom: string;
}
export interface QueryBaseDenomRequestAminoMsg {
  type: "cosmos-sdk/QueryBaseDenomRequest";
  value: QueryBaseDenomRequestAmino;
}
/** QueryBaseDenomRequest defines the request type for the BaseDenom gRPC method. */
export interface QueryBaseDenomRequestSDKType {
  denom: string;
}
/** QueryBaseDenomResponse defines the response type for the BaseDenom gRPC method. */
export interface QueryBaseDenomResponse {
  baseDenom: string;
}
export interface QueryBaseDenomResponseProtoMsg {
  typeUrl: "/cosmos.bank.v1beta1.QueryBaseDenomResponse";
  value: Uint8Array;
}
/** QueryBaseDenomResponse defines the response type for the BaseDenom gRPC method. */
export interface QueryBaseDenomResponseAmino {
  base_denom: string;
}
export interface QueryBaseDenomResponseAminoMsg {
  type: "cosmos-sdk/QueryBaseDenomResponse";
  value: QueryBaseDenomResponseAmino;
}
/** QueryBaseDenomResponse defines the response type for the BaseDenom gRPC method. */
export interface QueryBaseDenomResponseSDKType {
  base_denom: string;
}
function createBaseQueryBalanceRequest(): QueryBalanceRequest {
  return {
    address: "",
    denom: "",
  };
}
export const QueryBalanceRequest = {
  typeUrl: "/cosmos.bank.v1beta1.QueryBalanceRequest",
  encode(
    message: QueryBalanceRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    if (message.denom !== "") {
      writer.uint32(18).string(message.denom);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): QueryBalanceRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryBalanceRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.denom = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryBalanceRequest>): QueryBalanceRequest {
    const message = createBaseQueryBalanceRequest();
    message.address = object.address ?? "";
    message.denom = object.denom ?? "";
    return message;
  },
  fromAmino(object: QueryBalanceRequestAmino): QueryBalanceRequest {
    return {
      address: object.address,
      denom: object.denom,
    };
  },
  toAmino(message: QueryBalanceRequest): QueryBalanceRequestAmino {
    const obj: any = {};
    obj.address = message.address;
    obj.denom = message.denom;
    return obj;
  },
  fromAminoMsg(object: QueryBalanceRequestAminoMsg): QueryBalanceRequest {
    return QueryBalanceRequest.fromAmino(object.value);
  },
  toAminoMsg(message: QueryBalanceRequest): QueryBalanceRequestAminoMsg {
    return {
      type: "cosmos-sdk/QueryBalanceRequest",
      value: QueryBalanceRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryBalanceRequestProtoMsg): QueryBalanceRequest {
    return QueryBalanceRequest.decode(message.value);
  },
  toProto(message: QueryBalanceRequest): Uint8Array {
    return QueryBalanceRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryBalanceRequest): QueryBalanceRequestProtoMsg {
    return {
      typeUrl: "/cosmos.bank.v1beta1.QueryBalanceRequest",
      value: QueryBalanceRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryBalanceResponse(): QueryBalanceResponse {
  return {
    balance: undefined,
  };
}
export const QueryBalanceResponse = {
  typeUrl: "/cosmos.bank.v1beta1.QueryBalanceResponse",
  encode(
    message: QueryBalanceResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.balance !== undefined) {
      Coin.encode(message.balance, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryBalanceResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryBalanceResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.balance = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryBalanceResponse>): QueryBalanceResponse {
    const message = createBaseQueryBalanceResponse();
    message.balance =
      object.balance !== undefined && object.balance !== null
        ? Coin.fromPartial(object.balance)
        : undefined;
    return message;
  },
  fromAmino(object: QueryBalanceResponseAmino): QueryBalanceResponse {
    return {
      balance: object?.balance ? Coin.fromAmino(object.balance) : undefined,
    };
  },
  toAmino(message: QueryBalanceResponse): QueryBalanceResponseAmino {
    const obj: any = {};
    obj.balance = message.balance ? Coin.toAmino(message.balance) : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryBalanceResponseAminoMsg): QueryBalanceResponse {
    return QueryBalanceResponse.fromAmino(object.value);
  },
  toAminoMsg(message: QueryBalanceResponse): QueryBalanceResponseAminoMsg {
    return {
      type: "cosmos-sdk/QueryBalanceResponse",
      value: QueryBalanceResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryBalanceResponseProtoMsg): QueryBalanceResponse {
    return QueryBalanceResponse.decode(message.value);
  },
  toProto(message: QueryBalanceResponse): Uint8Array {
    return QueryBalanceResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryBalanceResponse): QueryBalanceResponseProtoMsg {
    return {
      typeUrl: "/cosmos.bank.v1beta1.QueryBalanceResponse",
      value: QueryBalanceResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryAllBalancesRequest(): QueryAllBalancesRequest {
  return {
    address: "",
    pagination: undefined,
  };
}
export const QueryAllBalancesRequest = {
  typeUrl: "/cosmos.bank.v1beta1.QueryAllBalancesRequest",
  encode(
    message: QueryAllBalancesRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryAllBalancesRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllBalancesRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
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
  fromPartial(
    object: Partial<QueryAllBalancesRequest>
  ): QueryAllBalancesRequest {
    const message = createBaseQueryAllBalancesRequest();
    message.address = object.address ?? "";
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryAllBalancesRequestAmino): QueryAllBalancesRequest {
    return {
      address: object.address,
      pagination: object?.pagination
        ? PageRequest.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(message: QueryAllBalancesRequest): QueryAllBalancesRequestAmino {
    const obj: any = {};
    obj.address = message.address;
    obj.pagination = message.pagination
      ? PageRequest.toAmino(message.pagination)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryAllBalancesRequestAminoMsg
  ): QueryAllBalancesRequest {
    return QueryAllBalancesRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryAllBalancesRequest
  ): QueryAllBalancesRequestAminoMsg {
    return {
      type: "cosmos-sdk/QueryAllBalancesRequest",
      value: QueryAllBalancesRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryAllBalancesRequestProtoMsg
  ): QueryAllBalancesRequest {
    return QueryAllBalancesRequest.decode(message.value);
  },
  toProto(message: QueryAllBalancesRequest): Uint8Array {
    return QueryAllBalancesRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryAllBalancesRequest
  ): QueryAllBalancesRequestProtoMsg {
    return {
      typeUrl: "/cosmos.bank.v1beta1.QueryAllBalancesRequest",
      value: QueryAllBalancesRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryAllBalancesResponse(): QueryAllBalancesResponse {
  return {
    balances: [],
    pagination: undefined,
  };
}
export const QueryAllBalancesResponse = {
  typeUrl: "/cosmos.bank.v1beta1.QueryAllBalancesResponse",
  encode(
    message: QueryAllBalancesResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.balances) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
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
  ): QueryAllBalancesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAllBalancesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.balances.push(Coin.decode(reader, reader.uint32()));
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
    object: Partial<QueryAllBalancesResponse>
  ): QueryAllBalancesResponse {
    const message = createBaseQueryAllBalancesResponse();
    message.balances = object.balances?.map((e) => Coin.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryAllBalancesResponseAmino): QueryAllBalancesResponse {
    return {
      balances: Array.isArray(object?.balances)
        ? object.balances.map((e: any) => Coin.fromAmino(e))
        : [],
      pagination: object?.pagination
        ? PageResponse.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(message: QueryAllBalancesResponse): QueryAllBalancesResponseAmino {
    const obj: any = {};
    if (message.balances) {
      obj.balances = message.balances.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.balances = [];
    }
    obj.pagination = message.pagination
      ? PageResponse.toAmino(message.pagination)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryAllBalancesResponseAminoMsg
  ): QueryAllBalancesResponse {
    return QueryAllBalancesResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryAllBalancesResponse
  ): QueryAllBalancesResponseAminoMsg {
    return {
      type: "cosmos-sdk/QueryAllBalancesResponse",
      value: QueryAllBalancesResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryAllBalancesResponseProtoMsg
  ): QueryAllBalancesResponse {
    return QueryAllBalancesResponse.decode(message.value);
  },
  toProto(message: QueryAllBalancesResponse): Uint8Array {
    return QueryAllBalancesResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryAllBalancesResponse
  ): QueryAllBalancesResponseProtoMsg {
    return {
      typeUrl: "/cosmos.bank.v1beta1.QueryAllBalancesResponse",
      value: QueryAllBalancesResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryTotalSupplyRequest(): QueryTotalSupplyRequest {
  return {
    pagination: undefined,
  };
}
export const QueryTotalSupplyRequest = {
  typeUrl: "/cosmos.bank.v1beta1.QueryTotalSupplyRequest",
  encode(
    message: QueryTotalSupplyRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryTotalSupplyRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryTotalSupplyRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
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
    object: Partial<QueryTotalSupplyRequest>
  ): QueryTotalSupplyRequest {
    const message = createBaseQueryTotalSupplyRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryTotalSupplyRequestAmino): QueryTotalSupplyRequest {
    return {
      pagination: object?.pagination
        ? PageRequest.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(message: QueryTotalSupplyRequest): QueryTotalSupplyRequestAmino {
    const obj: any = {};
    obj.pagination = message.pagination
      ? PageRequest.toAmino(message.pagination)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryTotalSupplyRequestAminoMsg
  ): QueryTotalSupplyRequest {
    return QueryTotalSupplyRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryTotalSupplyRequest
  ): QueryTotalSupplyRequestAminoMsg {
    return {
      type: "cosmos-sdk/QueryTotalSupplyRequest",
      value: QueryTotalSupplyRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryTotalSupplyRequestProtoMsg
  ): QueryTotalSupplyRequest {
    return QueryTotalSupplyRequest.decode(message.value);
  },
  toProto(message: QueryTotalSupplyRequest): Uint8Array {
    return QueryTotalSupplyRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryTotalSupplyRequest
  ): QueryTotalSupplyRequestProtoMsg {
    return {
      typeUrl: "/cosmos.bank.v1beta1.QueryTotalSupplyRequest",
      value: QueryTotalSupplyRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryTotalSupplyResponse(): QueryTotalSupplyResponse {
  return {
    supply: [],
    pagination: undefined,
  };
}
export const QueryTotalSupplyResponse = {
  typeUrl: "/cosmos.bank.v1beta1.QueryTotalSupplyResponse",
  encode(
    message: QueryTotalSupplyResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.supply) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
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
  ): QueryTotalSupplyResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryTotalSupplyResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.supply.push(Coin.decode(reader, reader.uint32()));
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
    object: Partial<QueryTotalSupplyResponse>
  ): QueryTotalSupplyResponse {
    const message = createBaseQueryTotalSupplyResponse();
    message.supply = object.supply?.map((e) => Coin.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryTotalSupplyResponseAmino): QueryTotalSupplyResponse {
    return {
      supply: Array.isArray(object?.supply)
        ? object.supply.map((e: any) => Coin.fromAmino(e))
        : [],
      pagination: object?.pagination
        ? PageResponse.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(message: QueryTotalSupplyResponse): QueryTotalSupplyResponseAmino {
    const obj: any = {};
    if (message.supply) {
      obj.supply = message.supply.map((e) => (e ? Coin.toAmino(e) : undefined));
    } else {
      obj.supply = [];
    }
    obj.pagination = message.pagination
      ? PageResponse.toAmino(message.pagination)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryTotalSupplyResponseAminoMsg
  ): QueryTotalSupplyResponse {
    return QueryTotalSupplyResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryTotalSupplyResponse
  ): QueryTotalSupplyResponseAminoMsg {
    return {
      type: "cosmos-sdk/QueryTotalSupplyResponse",
      value: QueryTotalSupplyResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryTotalSupplyResponseProtoMsg
  ): QueryTotalSupplyResponse {
    return QueryTotalSupplyResponse.decode(message.value);
  },
  toProto(message: QueryTotalSupplyResponse): Uint8Array {
    return QueryTotalSupplyResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryTotalSupplyResponse
  ): QueryTotalSupplyResponseProtoMsg {
    return {
      typeUrl: "/cosmos.bank.v1beta1.QueryTotalSupplyResponse",
      value: QueryTotalSupplyResponse.encode(message).finish(),
    };
  },
};
function createBaseQuerySupplyOfRequest(): QuerySupplyOfRequest {
  return {
    denom: "",
  };
}
export const QuerySupplyOfRequest = {
  typeUrl: "/cosmos.bank.v1beta1.QuerySupplyOfRequest",
  encode(
    message: QuerySupplyOfRequest,
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
  ): QuerySupplyOfRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQuerySupplyOfRequest();
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
  fromPartial(object: Partial<QuerySupplyOfRequest>): QuerySupplyOfRequest {
    const message = createBaseQuerySupplyOfRequest();
    message.denom = object.denom ?? "";
    return message;
  },
  fromAmino(object: QuerySupplyOfRequestAmino): QuerySupplyOfRequest {
    return {
      denom: object.denom,
    };
  },
  toAmino(message: QuerySupplyOfRequest): QuerySupplyOfRequestAmino {
    const obj: any = {};
    obj.denom = message.denom;
    return obj;
  },
  fromAminoMsg(object: QuerySupplyOfRequestAminoMsg): QuerySupplyOfRequest {
    return QuerySupplyOfRequest.fromAmino(object.value);
  },
  toAminoMsg(message: QuerySupplyOfRequest): QuerySupplyOfRequestAminoMsg {
    return {
      type: "cosmos-sdk/QuerySupplyOfRequest",
      value: QuerySupplyOfRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: QuerySupplyOfRequestProtoMsg): QuerySupplyOfRequest {
    return QuerySupplyOfRequest.decode(message.value);
  },
  toProto(message: QuerySupplyOfRequest): Uint8Array {
    return QuerySupplyOfRequest.encode(message).finish();
  },
  toProtoMsg(message: QuerySupplyOfRequest): QuerySupplyOfRequestProtoMsg {
    return {
      typeUrl: "/cosmos.bank.v1beta1.QuerySupplyOfRequest",
      value: QuerySupplyOfRequest.encode(message).finish(),
    };
  },
};
function createBaseQuerySupplyOfResponse(): QuerySupplyOfResponse {
  return {
    amount: undefined,
  };
}
export const QuerySupplyOfResponse = {
  typeUrl: "/cosmos.bank.v1beta1.QuerySupplyOfResponse",
  encode(
    message: QuerySupplyOfResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QuerySupplyOfResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQuerySupplyOfResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QuerySupplyOfResponse>): QuerySupplyOfResponse {
    const message = createBaseQuerySupplyOfResponse();
    message.amount =
      object.amount !== undefined && object.amount !== null
        ? Coin.fromPartial(object.amount)
        : undefined;
    return message;
  },
  fromAmino(object: QuerySupplyOfResponseAmino): QuerySupplyOfResponse {
    return {
      amount: object?.amount ? Coin.fromAmino(object.amount) : undefined,
    };
  },
  toAmino(message: QuerySupplyOfResponse): QuerySupplyOfResponseAmino {
    const obj: any = {};
    obj.amount = message.amount ? Coin.toAmino(message.amount) : undefined;
    return obj;
  },
  fromAminoMsg(object: QuerySupplyOfResponseAminoMsg): QuerySupplyOfResponse {
    return QuerySupplyOfResponse.fromAmino(object.value);
  },
  toAminoMsg(message: QuerySupplyOfResponse): QuerySupplyOfResponseAminoMsg {
    return {
      type: "cosmos-sdk/QuerySupplyOfResponse",
      value: QuerySupplyOfResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: QuerySupplyOfResponseProtoMsg): QuerySupplyOfResponse {
    return QuerySupplyOfResponse.decode(message.value);
  },
  toProto(message: QuerySupplyOfResponse): Uint8Array {
    return QuerySupplyOfResponse.encode(message).finish();
  },
  toProtoMsg(message: QuerySupplyOfResponse): QuerySupplyOfResponseProtoMsg {
    return {
      typeUrl: "/cosmos.bank.v1beta1.QuerySupplyOfResponse",
      value: QuerySupplyOfResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryTotalSupplyWithoutOffsetRequest(): QueryTotalSupplyWithoutOffsetRequest {
  return {
    pagination: undefined,
  };
}
export const QueryTotalSupplyWithoutOffsetRequest = {
  typeUrl: "/cosmos.bank.v1beta1.QueryTotalSupplyWithoutOffsetRequest",
  encode(
    message: QueryTotalSupplyWithoutOffsetRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryTotalSupplyWithoutOffsetRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryTotalSupplyWithoutOffsetRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
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
    object: Partial<QueryTotalSupplyWithoutOffsetRequest>
  ): QueryTotalSupplyWithoutOffsetRequest {
    const message = createBaseQueryTotalSupplyWithoutOffsetRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(
    object: QueryTotalSupplyWithoutOffsetRequestAmino
  ): QueryTotalSupplyWithoutOffsetRequest {
    return {
      pagination: object?.pagination
        ? PageRequest.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(
    message: QueryTotalSupplyWithoutOffsetRequest
  ): QueryTotalSupplyWithoutOffsetRequestAmino {
    const obj: any = {};
    obj.pagination = message.pagination
      ? PageRequest.toAmino(message.pagination)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryTotalSupplyWithoutOffsetRequestAminoMsg
  ): QueryTotalSupplyWithoutOffsetRequest {
    return QueryTotalSupplyWithoutOffsetRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryTotalSupplyWithoutOffsetRequest
  ): QueryTotalSupplyWithoutOffsetRequestAminoMsg {
    return {
      type: "cosmos-sdk/QueryTotalSupplyWithoutOffsetRequest",
      value: QueryTotalSupplyWithoutOffsetRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryTotalSupplyWithoutOffsetRequestProtoMsg
  ): QueryTotalSupplyWithoutOffsetRequest {
    return QueryTotalSupplyWithoutOffsetRequest.decode(message.value);
  },
  toProto(message: QueryTotalSupplyWithoutOffsetRequest): Uint8Array {
    return QueryTotalSupplyWithoutOffsetRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryTotalSupplyWithoutOffsetRequest
  ): QueryTotalSupplyWithoutOffsetRequestProtoMsg {
    return {
      typeUrl: "/cosmos.bank.v1beta1.QueryTotalSupplyWithoutOffsetRequest",
      value: QueryTotalSupplyWithoutOffsetRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryTotalSupplyWithoutOffsetResponse(): QueryTotalSupplyWithoutOffsetResponse {
  return {
    supply: [],
    pagination: undefined,
  };
}
export const QueryTotalSupplyWithoutOffsetResponse = {
  typeUrl: "/cosmos.bank.v1beta1.QueryTotalSupplyWithoutOffsetResponse",
  encode(
    message: QueryTotalSupplyWithoutOffsetResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.supply) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
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
  ): QueryTotalSupplyWithoutOffsetResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryTotalSupplyWithoutOffsetResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.supply.push(Coin.decode(reader, reader.uint32()));
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
    object: Partial<QueryTotalSupplyWithoutOffsetResponse>
  ): QueryTotalSupplyWithoutOffsetResponse {
    const message = createBaseQueryTotalSupplyWithoutOffsetResponse();
    message.supply = object.supply?.map((e) => Coin.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(
    object: QueryTotalSupplyWithoutOffsetResponseAmino
  ): QueryTotalSupplyWithoutOffsetResponse {
    return {
      supply: Array.isArray(object?.supply)
        ? object.supply.map((e: any) => Coin.fromAmino(e))
        : [],
      pagination: object?.pagination
        ? PageResponse.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(
    message: QueryTotalSupplyWithoutOffsetResponse
  ): QueryTotalSupplyWithoutOffsetResponseAmino {
    const obj: any = {};
    if (message.supply) {
      obj.supply = message.supply.map((e) => (e ? Coin.toAmino(e) : undefined));
    } else {
      obj.supply = [];
    }
    obj.pagination = message.pagination
      ? PageResponse.toAmino(message.pagination)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryTotalSupplyWithoutOffsetResponseAminoMsg
  ): QueryTotalSupplyWithoutOffsetResponse {
    return QueryTotalSupplyWithoutOffsetResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryTotalSupplyWithoutOffsetResponse
  ): QueryTotalSupplyWithoutOffsetResponseAminoMsg {
    return {
      type: "cosmos-sdk/QueryTotalSupplyWithoutOffsetResponse",
      value: QueryTotalSupplyWithoutOffsetResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryTotalSupplyWithoutOffsetResponseProtoMsg
  ): QueryTotalSupplyWithoutOffsetResponse {
    return QueryTotalSupplyWithoutOffsetResponse.decode(message.value);
  },
  toProto(message: QueryTotalSupplyWithoutOffsetResponse): Uint8Array {
    return QueryTotalSupplyWithoutOffsetResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryTotalSupplyWithoutOffsetResponse
  ): QueryTotalSupplyWithoutOffsetResponseProtoMsg {
    return {
      typeUrl: "/cosmos.bank.v1beta1.QueryTotalSupplyWithoutOffsetResponse",
      value: QueryTotalSupplyWithoutOffsetResponse.encode(message).finish(),
    };
  },
};
function createBaseQuerySupplyOfWithoutOffsetRequest(): QuerySupplyOfWithoutOffsetRequest {
  return {
    denom: "",
  };
}
export const QuerySupplyOfWithoutOffsetRequest = {
  typeUrl: "/cosmos.bank.v1beta1.QuerySupplyOfWithoutOffsetRequest",
  encode(
    message: QuerySupplyOfWithoutOffsetRequest,
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
  ): QuerySupplyOfWithoutOffsetRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQuerySupplyOfWithoutOffsetRequest();
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
    object: Partial<QuerySupplyOfWithoutOffsetRequest>
  ): QuerySupplyOfWithoutOffsetRequest {
    const message = createBaseQuerySupplyOfWithoutOffsetRequest();
    message.denom = object.denom ?? "";
    return message;
  },
  fromAmino(
    object: QuerySupplyOfWithoutOffsetRequestAmino
  ): QuerySupplyOfWithoutOffsetRequest {
    return {
      denom: object.denom,
    };
  },
  toAmino(
    message: QuerySupplyOfWithoutOffsetRequest
  ): QuerySupplyOfWithoutOffsetRequestAmino {
    const obj: any = {};
    obj.denom = message.denom;
    return obj;
  },
  fromAminoMsg(
    object: QuerySupplyOfWithoutOffsetRequestAminoMsg
  ): QuerySupplyOfWithoutOffsetRequest {
    return QuerySupplyOfWithoutOffsetRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QuerySupplyOfWithoutOffsetRequest
  ): QuerySupplyOfWithoutOffsetRequestAminoMsg {
    return {
      type: "cosmos-sdk/QuerySupplyOfWithoutOffsetRequest",
      value: QuerySupplyOfWithoutOffsetRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QuerySupplyOfWithoutOffsetRequestProtoMsg
  ): QuerySupplyOfWithoutOffsetRequest {
    return QuerySupplyOfWithoutOffsetRequest.decode(message.value);
  },
  toProto(message: QuerySupplyOfWithoutOffsetRequest): Uint8Array {
    return QuerySupplyOfWithoutOffsetRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QuerySupplyOfWithoutOffsetRequest
  ): QuerySupplyOfWithoutOffsetRequestProtoMsg {
    return {
      typeUrl: "/cosmos.bank.v1beta1.QuerySupplyOfWithoutOffsetRequest",
      value: QuerySupplyOfWithoutOffsetRequest.encode(message).finish(),
    };
  },
};
function createBaseQuerySupplyOfWithoutOffsetResponse(): QuerySupplyOfWithoutOffsetResponse {
  return {
    amount: undefined,
  };
}
export const QuerySupplyOfWithoutOffsetResponse = {
  typeUrl: "/cosmos.bank.v1beta1.QuerySupplyOfWithoutOffsetResponse",
  encode(
    message: QuerySupplyOfWithoutOffsetResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.amount !== undefined) {
      Coin.encode(message.amount, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QuerySupplyOfWithoutOffsetResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQuerySupplyOfWithoutOffsetResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.amount = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QuerySupplyOfWithoutOffsetResponse>
  ): QuerySupplyOfWithoutOffsetResponse {
    const message = createBaseQuerySupplyOfWithoutOffsetResponse();
    message.amount =
      object.amount !== undefined && object.amount !== null
        ? Coin.fromPartial(object.amount)
        : undefined;
    return message;
  },
  fromAmino(
    object: QuerySupplyOfWithoutOffsetResponseAmino
  ): QuerySupplyOfWithoutOffsetResponse {
    return {
      amount: object?.amount ? Coin.fromAmino(object.amount) : undefined,
    };
  },
  toAmino(
    message: QuerySupplyOfWithoutOffsetResponse
  ): QuerySupplyOfWithoutOffsetResponseAmino {
    const obj: any = {};
    obj.amount = message.amount ? Coin.toAmino(message.amount) : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QuerySupplyOfWithoutOffsetResponseAminoMsg
  ): QuerySupplyOfWithoutOffsetResponse {
    return QuerySupplyOfWithoutOffsetResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QuerySupplyOfWithoutOffsetResponse
  ): QuerySupplyOfWithoutOffsetResponseAminoMsg {
    return {
      type: "cosmos-sdk/QuerySupplyOfWithoutOffsetResponse",
      value: QuerySupplyOfWithoutOffsetResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QuerySupplyOfWithoutOffsetResponseProtoMsg
  ): QuerySupplyOfWithoutOffsetResponse {
    return QuerySupplyOfWithoutOffsetResponse.decode(message.value);
  },
  toProto(message: QuerySupplyOfWithoutOffsetResponse): Uint8Array {
    return QuerySupplyOfWithoutOffsetResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QuerySupplyOfWithoutOffsetResponse
  ): QuerySupplyOfWithoutOffsetResponseProtoMsg {
    return {
      typeUrl: "/cosmos.bank.v1beta1.QuerySupplyOfWithoutOffsetResponse",
      value: QuerySupplyOfWithoutOffsetResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryParamsRequest(): QueryParamsRequest {
  return {};
}
export const QueryParamsRequest = {
  typeUrl: "/cosmos.bank.v1beta1.QueryParamsRequest",
  encode(
    _: QueryParamsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): QueryParamsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
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
      type: "cosmos-sdk/QueryParamsRequest",
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
      typeUrl: "/cosmos.bank.v1beta1.QueryParamsRequest",
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
  typeUrl: "/cosmos.bank.v1beta1.QueryParamsResponse",
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
    let end = length === undefined ? reader.len : reader.pos + length;
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
      type: "cosmos-sdk/QueryParamsResponse",
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
      typeUrl: "/cosmos.bank.v1beta1.QueryParamsResponse",
      value: QueryParamsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryDenomsMetadataRequest(): QueryDenomsMetadataRequest {
  return {
    pagination: undefined,
  };
}
export const QueryDenomsMetadataRequest = {
  typeUrl: "/cosmos.bank.v1beta1.QueryDenomsMetadataRequest",
  encode(
    message: QueryDenomsMetadataRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryDenomsMetadataRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDenomsMetadataRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
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
    object: Partial<QueryDenomsMetadataRequest>
  ): QueryDenomsMetadataRequest {
    const message = createBaseQueryDenomsMetadataRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(
    object: QueryDenomsMetadataRequestAmino
  ): QueryDenomsMetadataRequest {
    return {
      pagination: object?.pagination
        ? PageRequest.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(
    message: QueryDenomsMetadataRequest
  ): QueryDenomsMetadataRequestAmino {
    const obj: any = {};
    obj.pagination = message.pagination
      ? PageRequest.toAmino(message.pagination)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryDenomsMetadataRequestAminoMsg
  ): QueryDenomsMetadataRequest {
    return QueryDenomsMetadataRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryDenomsMetadataRequest
  ): QueryDenomsMetadataRequestAminoMsg {
    return {
      type: "cosmos-sdk/QueryDenomsMetadataRequest",
      value: QueryDenomsMetadataRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryDenomsMetadataRequestProtoMsg
  ): QueryDenomsMetadataRequest {
    return QueryDenomsMetadataRequest.decode(message.value);
  },
  toProto(message: QueryDenomsMetadataRequest): Uint8Array {
    return QueryDenomsMetadataRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryDenomsMetadataRequest
  ): QueryDenomsMetadataRequestProtoMsg {
    return {
      typeUrl: "/cosmos.bank.v1beta1.QueryDenomsMetadataRequest",
      value: QueryDenomsMetadataRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryDenomsMetadataResponse(): QueryDenomsMetadataResponse {
  return {
    metadatas: [],
    pagination: undefined,
  };
}
export const QueryDenomsMetadataResponse = {
  typeUrl: "/cosmos.bank.v1beta1.QueryDenomsMetadataResponse",
  encode(
    message: QueryDenomsMetadataResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.metadatas) {
      Metadata.encode(v!, writer.uint32(10).fork()).ldelim();
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
  ): QueryDenomsMetadataResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDenomsMetadataResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.metadatas.push(Metadata.decode(reader, reader.uint32()));
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
    object: Partial<QueryDenomsMetadataResponse>
  ): QueryDenomsMetadataResponse {
    const message = createBaseQueryDenomsMetadataResponse();
    message.metadatas =
      object.metadatas?.map((e) => Metadata.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(
    object: QueryDenomsMetadataResponseAmino
  ): QueryDenomsMetadataResponse {
    return {
      metadatas: Array.isArray(object?.metadatas)
        ? object.metadatas.map((e: any) => Metadata.fromAmino(e))
        : [],
      pagination: object?.pagination
        ? PageResponse.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(
    message: QueryDenomsMetadataResponse
  ): QueryDenomsMetadataResponseAmino {
    const obj: any = {};
    if (message.metadatas) {
      obj.metadatas = message.metadatas.map((e) =>
        e ? Metadata.toAmino(e) : undefined
      );
    } else {
      obj.metadatas = [];
    }
    obj.pagination = message.pagination
      ? PageResponse.toAmino(message.pagination)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryDenomsMetadataResponseAminoMsg
  ): QueryDenomsMetadataResponse {
    return QueryDenomsMetadataResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryDenomsMetadataResponse
  ): QueryDenomsMetadataResponseAminoMsg {
    return {
      type: "cosmos-sdk/QueryDenomsMetadataResponse",
      value: QueryDenomsMetadataResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryDenomsMetadataResponseProtoMsg
  ): QueryDenomsMetadataResponse {
    return QueryDenomsMetadataResponse.decode(message.value);
  },
  toProto(message: QueryDenomsMetadataResponse): Uint8Array {
    return QueryDenomsMetadataResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryDenomsMetadataResponse
  ): QueryDenomsMetadataResponseProtoMsg {
    return {
      typeUrl: "/cosmos.bank.v1beta1.QueryDenomsMetadataResponse",
      value: QueryDenomsMetadataResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryDenomMetadataRequest(): QueryDenomMetadataRequest {
  return {
    denom: "",
  };
}
export const QueryDenomMetadataRequest = {
  typeUrl: "/cosmos.bank.v1beta1.QueryDenomMetadataRequest",
  encode(
    message: QueryDenomMetadataRequest,
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
  ): QueryDenomMetadataRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDenomMetadataRequest();
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
    object: Partial<QueryDenomMetadataRequest>
  ): QueryDenomMetadataRequest {
    const message = createBaseQueryDenomMetadataRequest();
    message.denom = object.denom ?? "";
    return message;
  },
  fromAmino(object: QueryDenomMetadataRequestAmino): QueryDenomMetadataRequest {
    return {
      denom: object.denom,
    };
  },
  toAmino(message: QueryDenomMetadataRequest): QueryDenomMetadataRequestAmino {
    const obj: any = {};
    obj.denom = message.denom;
    return obj;
  },
  fromAminoMsg(
    object: QueryDenomMetadataRequestAminoMsg
  ): QueryDenomMetadataRequest {
    return QueryDenomMetadataRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryDenomMetadataRequest
  ): QueryDenomMetadataRequestAminoMsg {
    return {
      type: "cosmos-sdk/QueryDenomMetadataRequest",
      value: QueryDenomMetadataRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryDenomMetadataRequestProtoMsg
  ): QueryDenomMetadataRequest {
    return QueryDenomMetadataRequest.decode(message.value);
  },
  toProto(message: QueryDenomMetadataRequest): Uint8Array {
    return QueryDenomMetadataRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryDenomMetadataRequest
  ): QueryDenomMetadataRequestProtoMsg {
    return {
      typeUrl: "/cosmos.bank.v1beta1.QueryDenomMetadataRequest",
      value: QueryDenomMetadataRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryDenomMetadataResponse(): QueryDenomMetadataResponse {
  return {
    metadata: undefined,
  };
}
export const QueryDenomMetadataResponse = {
  typeUrl: "/cosmos.bank.v1beta1.QueryDenomMetadataResponse",
  encode(
    message: QueryDenomMetadataResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.metadata !== undefined) {
      Metadata.encode(message.metadata, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryDenomMetadataResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryDenomMetadataResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.metadata = Metadata.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryDenomMetadataResponse>
  ): QueryDenomMetadataResponse {
    const message = createBaseQueryDenomMetadataResponse();
    message.metadata =
      object.metadata !== undefined && object.metadata !== null
        ? Metadata.fromPartial(object.metadata)
        : undefined;
    return message;
  },
  fromAmino(
    object: QueryDenomMetadataResponseAmino
  ): QueryDenomMetadataResponse {
    return {
      metadata: object?.metadata
        ? Metadata.fromAmino(object.metadata)
        : undefined,
    };
  },
  toAmino(
    message: QueryDenomMetadataResponse
  ): QueryDenomMetadataResponseAmino {
    const obj: any = {};
    obj.metadata = message.metadata
      ? Metadata.toAmino(message.metadata)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryDenomMetadataResponseAminoMsg
  ): QueryDenomMetadataResponse {
    return QueryDenomMetadataResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryDenomMetadataResponse
  ): QueryDenomMetadataResponseAminoMsg {
    return {
      type: "cosmos-sdk/QueryDenomMetadataResponse",
      value: QueryDenomMetadataResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryDenomMetadataResponseProtoMsg
  ): QueryDenomMetadataResponse {
    return QueryDenomMetadataResponse.decode(message.value);
  },
  toProto(message: QueryDenomMetadataResponse): Uint8Array {
    return QueryDenomMetadataResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryDenomMetadataResponse
  ): QueryDenomMetadataResponseProtoMsg {
    return {
      typeUrl: "/cosmos.bank.v1beta1.QueryDenomMetadataResponse",
      value: QueryDenomMetadataResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryBaseDenomRequest(): QueryBaseDenomRequest {
  return {
    denom: "",
  };
}
export const QueryBaseDenomRequest = {
  typeUrl: "/cosmos.bank.v1beta1.QueryBaseDenomRequest",
  encode(
    message: QueryBaseDenomRequest,
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
  ): QueryBaseDenomRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryBaseDenomRequest();
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
  fromPartial(object: Partial<QueryBaseDenomRequest>): QueryBaseDenomRequest {
    const message = createBaseQueryBaseDenomRequest();
    message.denom = object.denom ?? "";
    return message;
  },
  fromAmino(object: QueryBaseDenomRequestAmino): QueryBaseDenomRequest {
    return {
      denom: object.denom,
    };
  },
  toAmino(message: QueryBaseDenomRequest): QueryBaseDenomRequestAmino {
    const obj: any = {};
    obj.denom = message.denom;
    return obj;
  },
  fromAminoMsg(object: QueryBaseDenomRequestAminoMsg): QueryBaseDenomRequest {
    return QueryBaseDenomRequest.fromAmino(object.value);
  },
  toAminoMsg(message: QueryBaseDenomRequest): QueryBaseDenomRequestAminoMsg {
    return {
      type: "cosmos-sdk/QueryBaseDenomRequest",
      value: QueryBaseDenomRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryBaseDenomRequestProtoMsg): QueryBaseDenomRequest {
    return QueryBaseDenomRequest.decode(message.value);
  },
  toProto(message: QueryBaseDenomRequest): Uint8Array {
    return QueryBaseDenomRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryBaseDenomRequest): QueryBaseDenomRequestProtoMsg {
    return {
      typeUrl: "/cosmos.bank.v1beta1.QueryBaseDenomRequest",
      value: QueryBaseDenomRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryBaseDenomResponse(): QueryBaseDenomResponse {
  return {
    baseDenom: "",
  };
}
export const QueryBaseDenomResponse = {
  typeUrl: "/cosmos.bank.v1beta1.QueryBaseDenomResponse",
  encode(
    message: QueryBaseDenomResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.baseDenom !== "") {
      writer.uint32(10).string(message.baseDenom);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryBaseDenomResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryBaseDenomResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.baseDenom = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryBaseDenomResponse>): QueryBaseDenomResponse {
    const message = createBaseQueryBaseDenomResponse();
    message.baseDenom = object.baseDenom ?? "";
    return message;
  },
  fromAmino(object: QueryBaseDenomResponseAmino): QueryBaseDenomResponse {
    return {
      baseDenom: object.base_denom,
    };
  },
  toAmino(message: QueryBaseDenomResponse): QueryBaseDenomResponseAmino {
    const obj: any = {};
    obj.base_denom = message.baseDenom;
    return obj;
  },
  fromAminoMsg(object: QueryBaseDenomResponseAminoMsg): QueryBaseDenomResponse {
    return QueryBaseDenomResponse.fromAmino(object.value);
  },
  toAminoMsg(message: QueryBaseDenomResponse): QueryBaseDenomResponseAminoMsg {
    return {
      type: "cosmos-sdk/QueryBaseDenomResponse",
      value: QueryBaseDenomResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryBaseDenomResponseProtoMsg
  ): QueryBaseDenomResponse {
    return QueryBaseDenomResponse.decode(message.value);
  },
  toProto(message: QueryBaseDenomResponse): Uint8Array {
    return QueryBaseDenomResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryBaseDenomResponse): QueryBaseDenomResponseProtoMsg {
    return {
      typeUrl: "/cosmos.bank.v1beta1.QueryBaseDenomResponse",
      value: QueryBaseDenomResponse.encode(message).finish(),
    };
  },
};
