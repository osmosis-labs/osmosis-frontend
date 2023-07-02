//@ts-nocheck
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
  Any,
  AnyAmino,
  AnyProtoMsg,
  AnySDKType,
} from "../../../google/protobuf/any";
import { Long } from "../../../helpers";
import { Pool as Pool1 } from "../../concentrated-liquidity/pool";
import { PoolProtoMsg as Pool1ProtoMsg } from "../../concentrated-liquidity/pool";
import { PoolSDKType as Pool1SDKType } from "../../concentrated-liquidity/pool";
import { Pool as Pool2 } from "../../gamm/pool-models/balancer/balancerPool";
import { PoolProtoMsg as Pool2ProtoMsg } from "../../gamm/pool-models/balancer/balancerPool";
import { PoolSDKType as Pool2SDKType } from "../../gamm/pool-models/balancer/balancerPool";
import { Pool as Pool3 } from "../../gamm/pool-models/stableswap/stableswap_pool";
import { PoolProtoMsg as Pool3ProtoMsg } from "../../gamm/pool-models/stableswap/stableswap_pool";
import { PoolSDKType as Pool3SDKType } from "../../gamm/pool-models/stableswap/stableswap_pool";
import {
  CosmWasmPool,
  CosmWasmPoolProtoMsg,
  CosmWasmPoolSDKType,
} from "./model/pool";
import { Params, ParamsAmino, ParamsSDKType } from "./params";
/** =============================== ContractInfoByPoolId */
export interface ParamsRequest {}
export interface ParamsRequestProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.ParamsRequest";
  value: Uint8Array;
}
/** =============================== ContractInfoByPoolId */
export interface ParamsRequestAmino {}
export interface ParamsRequestAminoMsg {
  type: "osmosis/cosmwasmpool/params-request";
  value: ParamsRequestAmino;
}
/** =============================== ContractInfoByPoolId */
export interface ParamsRequestSDKType {}
export interface ParamsResponse {
  params?: Params;
}
export interface ParamsResponseProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.ParamsResponse";
  value: Uint8Array;
}
export interface ParamsResponseAmino {
  params?: ParamsAmino;
}
export interface ParamsResponseAminoMsg {
  type: "osmosis/cosmwasmpool/params-response";
  value: ParamsResponseAmino;
}
export interface ParamsResponseSDKType {
  params?: ParamsSDKType;
}
/** =============================== Pools */
export interface PoolsRequest {
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequest;
}
export interface PoolsRequestProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.PoolsRequest";
  value: Uint8Array;
}
/** =============================== Pools */
export interface PoolsRequestAmino {
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequestAmino;
}
export interface PoolsRequestAminoMsg {
  type: "osmosis/cosmwasmpool/pools-request";
  value: PoolsRequestAmino;
}
/** =============================== Pools */
export interface PoolsRequestSDKType {
  pagination?: PageRequestSDKType;
}
export interface PoolsResponse {
  pools: (Pool1 & CosmWasmPool & Pool2 & Pool3 & Any)[] | Any[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}
export interface PoolsResponseProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.PoolsResponse";
  value: Uint8Array;
}
export type PoolsResponseEncoded = Omit<PoolsResponse, "pools"> & {
  pools: (
    | Pool1ProtoMsg
    | CosmWasmPoolProtoMsg
    | Pool2ProtoMsg
    | Pool3ProtoMsg
    | AnyProtoMsg
  )[];
};
export interface PoolsResponseAmino {
  pools: AnyAmino[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponseAmino;
}
export interface PoolsResponseAminoMsg {
  type: "osmosis/cosmwasmpool/pools-response";
  value: PoolsResponseAmino;
}
export interface PoolsResponseSDKType {
  pools: (
    | Pool1SDKType
    | CosmWasmPoolSDKType
    | Pool2SDKType
    | Pool3SDKType
    | AnySDKType
  )[];
  pagination?: PageResponseSDKType;
}
/** =============================== ContractInfoByPoolId */
export interface ContractInfoByPoolIdRequest {
  /** pool_id is the pool id of the requested pool. */
  poolId: Long;
}
export interface ContractInfoByPoolIdRequestProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.ContractInfoByPoolIdRequest";
  value: Uint8Array;
}
/** =============================== ContractInfoByPoolId */
export interface ContractInfoByPoolIdRequestAmino {
  /** pool_id is the pool id of the requested pool. */
  pool_id: string;
}
export interface ContractInfoByPoolIdRequestAminoMsg {
  type: "osmosis/cosmwasmpool/contract-info-by-pool-id-request";
  value: ContractInfoByPoolIdRequestAmino;
}
/** =============================== ContractInfoByPoolId */
export interface ContractInfoByPoolIdRequestSDKType {
  pool_id: Long;
}
export interface ContractInfoByPoolIdResponse {
  /**
   * contract_address is the pool address and contract address
   * of the requested pool id.
   */
  contractAddress: string;
  /** code_id is the code id of the requested pool id. */
  codeId: Long;
}
export interface ContractInfoByPoolIdResponseProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.ContractInfoByPoolIdResponse";
  value: Uint8Array;
}
export interface ContractInfoByPoolIdResponseAmino {
  /**
   * contract_address is the pool address and contract address
   * of the requested pool id.
   */
  contract_address: string;
  /** code_id is the code id of the requested pool id. */
  code_id: string;
}
export interface ContractInfoByPoolIdResponseAminoMsg {
  type: "osmosis/cosmwasmpool/contract-info-by-pool-id-response";
  value: ContractInfoByPoolIdResponseAmino;
}
export interface ContractInfoByPoolIdResponseSDKType {
  contract_address: string;
  code_id: Long;
}
function createBaseParamsRequest(): ParamsRequest {
  return {};
}
export const ParamsRequest = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.ParamsRequest",
  encode(
    _: ParamsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): ParamsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParamsRequest();
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
  fromPartial(_: Partial<ParamsRequest>): ParamsRequest {
    const message = createBaseParamsRequest();
    return message;
  },
  fromAmino(_: ParamsRequestAmino): ParamsRequest {
    return {};
  },
  toAmino(_: ParamsRequest): ParamsRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: ParamsRequestAminoMsg): ParamsRequest {
    return ParamsRequest.fromAmino(object.value);
  },
  toAminoMsg(message: ParamsRequest): ParamsRequestAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/params-request",
      value: ParamsRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: ParamsRequestProtoMsg): ParamsRequest {
    return ParamsRequest.decode(message.value);
  },
  toProto(message: ParamsRequest): Uint8Array {
    return ParamsRequest.encode(message).finish();
  },
  toProtoMsg(message: ParamsRequest): ParamsRequestProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.ParamsRequest",
      value: ParamsRequest.encode(message).finish(),
    };
  },
};
function createBaseParamsResponse(): ParamsResponse {
  return {
    params: undefined,
  };
}
export const ParamsResponse = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.ParamsResponse",
  encode(
    message: ParamsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): ParamsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParamsResponse();
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
  fromPartial(object: Partial<ParamsResponse>): ParamsResponse {
    const message = createBaseParamsResponse();
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    return message;
  },
  fromAmino(object: ParamsResponseAmino): ParamsResponse {
    return {
      params: object?.params ? Params.fromAmino(object.params) : undefined,
    };
  },
  toAmino(message: ParamsResponse): ParamsResponseAmino {
    const obj: any = {};
    obj.params = message.params ? Params.toAmino(message.params) : undefined;
    return obj;
  },
  fromAminoMsg(object: ParamsResponseAminoMsg): ParamsResponse {
    return ParamsResponse.fromAmino(object.value);
  },
  toAminoMsg(message: ParamsResponse): ParamsResponseAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/params-response",
      value: ParamsResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: ParamsResponseProtoMsg): ParamsResponse {
    return ParamsResponse.decode(message.value);
  },
  toProto(message: ParamsResponse): Uint8Array {
    return ParamsResponse.encode(message).finish();
  },
  toProtoMsg(message: ParamsResponse): ParamsResponseProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.ParamsResponse",
      value: ParamsResponse.encode(message).finish(),
    };
  },
};
function createBasePoolsRequest(): PoolsRequest {
  return {
    pagination: undefined,
  };
}
export const PoolsRequest = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.PoolsRequest",
  encode(
    message: PoolsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.pagination !== undefined) {
      PageRequest.encode(message.pagination, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): PoolsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoolsRequest();
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
  fromPartial(object: Partial<PoolsRequest>): PoolsRequest {
    const message = createBasePoolsRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: PoolsRequestAmino): PoolsRequest {
    return {
      pagination: object?.pagination
        ? PageRequest.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(message: PoolsRequest): PoolsRequestAmino {
    const obj: any = {};
    obj.pagination = message.pagination
      ? PageRequest.toAmino(message.pagination)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: PoolsRequestAminoMsg): PoolsRequest {
    return PoolsRequest.fromAmino(object.value);
  },
  toAminoMsg(message: PoolsRequest): PoolsRequestAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/pools-request",
      value: PoolsRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: PoolsRequestProtoMsg): PoolsRequest {
    return PoolsRequest.decode(message.value);
  },
  toProto(message: PoolsRequest): Uint8Array {
    return PoolsRequest.encode(message).finish();
  },
  toProtoMsg(message: PoolsRequest): PoolsRequestProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.PoolsRequest",
      value: PoolsRequest.encode(message).finish(),
    };
  },
};
function createBasePoolsResponse(): PoolsResponse {
  return {
    pools: [],
    pagination: undefined,
  };
}
export const PoolsResponse = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.PoolsResponse",
  encode(
    message: PoolsResponse,
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
  decode(input: _m0.Reader | Uint8Array, length?: number): PoolsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoolsResponse();
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
  fromPartial(object: Partial<PoolsResponse>): PoolsResponse {
    const message = createBasePoolsResponse();
    message.pools = object.pools?.map((e) => Any.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: PoolsResponseAmino): PoolsResponse {
    return {
      pools: Array.isArray(object?.pools)
        ? object.pools.map((e: any) => PoolI_FromAmino(e))
        : [],
      pagination: object?.pagination
        ? PageResponse.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(message: PoolsResponse): PoolsResponseAmino {
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
  fromAminoMsg(object: PoolsResponseAminoMsg): PoolsResponse {
    return PoolsResponse.fromAmino(object.value);
  },
  toAminoMsg(message: PoolsResponse): PoolsResponseAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/pools-response",
      value: PoolsResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: PoolsResponseProtoMsg): PoolsResponse {
    return PoolsResponse.decode(message.value);
  },
  toProto(message: PoolsResponse): Uint8Array {
    return PoolsResponse.encode(message).finish();
  },
  toProtoMsg(message: PoolsResponse): PoolsResponseProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.PoolsResponse",
      value: PoolsResponse.encode(message).finish(),
    };
  },
};
function createBaseContractInfoByPoolIdRequest(): ContractInfoByPoolIdRequest {
  return {
    poolId: Long.UZERO,
  };
}
export const ContractInfoByPoolIdRequest = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.ContractInfoByPoolIdRequest",
  encode(
    message: ContractInfoByPoolIdRequest,
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
  ): ContractInfoByPoolIdRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseContractInfoByPoolIdRequest();
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
    object: Partial<ContractInfoByPoolIdRequest>
  ): ContractInfoByPoolIdRequest {
    const message = createBaseContractInfoByPoolIdRequest();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: ContractInfoByPoolIdRequestAmino
  ): ContractInfoByPoolIdRequest {
    return {
      poolId: Long.fromString(object.pool_id),
    };
  },
  toAmino(
    message: ContractInfoByPoolIdRequest
  ): ContractInfoByPoolIdRequestAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(
    object: ContractInfoByPoolIdRequestAminoMsg
  ): ContractInfoByPoolIdRequest {
    return ContractInfoByPoolIdRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: ContractInfoByPoolIdRequest
  ): ContractInfoByPoolIdRequestAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/contract-info-by-pool-id-request",
      value: ContractInfoByPoolIdRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: ContractInfoByPoolIdRequestProtoMsg
  ): ContractInfoByPoolIdRequest {
    return ContractInfoByPoolIdRequest.decode(message.value);
  },
  toProto(message: ContractInfoByPoolIdRequest): Uint8Array {
    return ContractInfoByPoolIdRequest.encode(message).finish();
  },
  toProtoMsg(
    message: ContractInfoByPoolIdRequest
  ): ContractInfoByPoolIdRequestProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.ContractInfoByPoolIdRequest",
      value: ContractInfoByPoolIdRequest.encode(message).finish(),
    };
  },
};
function createBaseContractInfoByPoolIdResponse(): ContractInfoByPoolIdResponse {
  return {
    contractAddress: "",
    codeId: Long.UZERO,
  };
}
export const ContractInfoByPoolIdResponse = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.ContractInfoByPoolIdResponse",
  encode(
    message: ContractInfoByPoolIdResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.contractAddress !== "") {
      writer.uint32(10).string(message.contractAddress);
    }
    if (!message.codeId.isZero()) {
      writer.uint32(16).uint64(message.codeId);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): ContractInfoByPoolIdResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseContractInfoByPoolIdResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.contractAddress = reader.string();
          break;
        case 2:
          message.codeId = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<ContractInfoByPoolIdResponse>
  ): ContractInfoByPoolIdResponse {
    const message = createBaseContractInfoByPoolIdResponse();
    message.contractAddress = object.contractAddress ?? "";
    message.codeId =
      object.codeId !== undefined && object.codeId !== null
        ? Long.fromValue(object.codeId)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: ContractInfoByPoolIdResponseAmino
  ): ContractInfoByPoolIdResponse {
    return {
      contractAddress: object.contract_address,
      codeId: Long.fromString(object.code_id),
    };
  },
  toAmino(
    message: ContractInfoByPoolIdResponse
  ): ContractInfoByPoolIdResponseAmino {
    const obj: any = {};
    obj.contract_address = message.contractAddress;
    obj.code_id = message.codeId ? message.codeId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(
    object: ContractInfoByPoolIdResponseAminoMsg
  ): ContractInfoByPoolIdResponse {
    return ContractInfoByPoolIdResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: ContractInfoByPoolIdResponse
  ): ContractInfoByPoolIdResponseAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/contract-info-by-pool-id-response",
      value: ContractInfoByPoolIdResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: ContractInfoByPoolIdResponseProtoMsg
  ): ContractInfoByPoolIdResponse {
    return ContractInfoByPoolIdResponse.decode(message.value);
  },
  toProto(message: ContractInfoByPoolIdResponse): Uint8Array {
    return ContractInfoByPoolIdResponse.encode(message).finish();
  },
  toProtoMsg(
    message: ContractInfoByPoolIdResponse
  ): ContractInfoByPoolIdResponseProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.ContractInfoByPoolIdResponse",
      value: ContractInfoByPoolIdResponse.encode(message).finish(),
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
