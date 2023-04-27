//@ts-nocheck
/* eslint-disable */
import {
  PageRequest,
  PageRequestAmino,
  PageRequestSDKType,
  PageResponse,
  PageResponseAmino,
  PageResponseSDKType,
} from "../../../../cosmos/base/query/v1beta1/pagination";
import {
  ConnectionEnd,
  ConnectionEndAmino,
  ConnectionEndSDKType,
  IdentifiedConnection,
  IdentifiedConnectionAmino,
  IdentifiedConnectionSDKType,
} from "./connection";
import {
  Height,
  HeightAmino,
  HeightSDKType,
  IdentifiedClientState,
  IdentifiedClientStateAmino,
  IdentifiedClientStateSDKType,
  Params,
  ParamsAmino,
  ParamsSDKType,
} from "../../client/v1/client";
import { Any, AnyAmino, AnySDKType } from "../../../../google/protobuf/any";
import { Long } from "../../../../helpers";
import * as _m0 from "protobufjs/minimal";
/**
 * QueryConnectionRequest is the request type for the Query/Connection RPC
 * method
 */
export interface QueryConnectionRequest {
  /** connection unique identifier */
  connectionId: string;
}
export interface QueryConnectionRequestProtoMsg {
  typeUrl: "/ibc.core.connection.v1.QueryConnectionRequest";
  value: Uint8Array;
}
/**
 * QueryConnectionRequest is the request type for the Query/Connection RPC
 * method
 */
export interface QueryConnectionRequestAmino {
  /** connection unique identifier */
  connection_id: string;
}
export interface QueryConnectionRequestAminoMsg {
  type: "cosmos-sdk/QueryConnectionRequest";
  value: QueryConnectionRequestAmino;
}
/**
 * QueryConnectionRequest is the request type for the Query/Connection RPC
 * method
 */
export interface QueryConnectionRequestSDKType {
  connection_id: string;
}
/**
 * QueryConnectionResponse is the response type for the Query/Connection RPC
 * method. Besides the connection end, it includes a proof and the height from
 * which the proof was retrieved.
 */
export interface QueryConnectionResponse {
  /** connection associated with the request identifier */
  connection?: ConnectionEnd;
  /** merkle proof of existence */
  proof: Uint8Array;
  /** height at which the proof was retrieved */
  proofHeight?: Height;
}
export interface QueryConnectionResponseProtoMsg {
  typeUrl: "/ibc.core.connection.v1.QueryConnectionResponse";
  value: Uint8Array;
}
/**
 * QueryConnectionResponse is the response type for the Query/Connection RPC
 * method. Besides the connection end, it includes a proof and the height from
 * which the proof was retrieved.
 */
export interface QueryConnectionResponseAmino {
  /** connection associated with the request identifier */
  connection?: ConnectionEndAmino;
  /** merkle proof of existence */
  proof: Uint8Array;
  /** height at which the proof was retrieved */
  proof_height?: HeightAmino;
}
export interface QueryConnectionResponseAminoMsg {
  type: "cosmos-sdk/QueryConnectionResponse";
  value: QueryConnectionResponseAmino;
}
/**
 * QueryConnectionResponse is the response type for the Query/Connection RPC
 * method. Besides the connection end, it includes a proof and the height from
 * which the proof was retrieved.
 */
export interface QueryConnectionResponseSDKType {
  connection?: ConnectionEndSDKType;
  proof: Uint8Array;
  proof_height?: HeightSDKType;
}
/**
 * QueryConnectionsRequest is the request type for the Query/Connections RPC
 * method
 */
export interface QueryConnectionsRequest {
  pagination?: PageRequest;
}
export interface QueryConnectionsRequestProtoMsg {
  typeUrl: "/ibc.core.connection.v1.QueryConnectionsRequest";
  value: Uint8Array;
}
/**
 * QueryConnectionsRequest is the request type for the Query/Connections RPC
 * method
 */
export interface QueryConnectionsRequestAmino {
  pagination?: PageRequestAmino;
}
export interface QueryConnectionsRequestAminoMsg {
  type: "cosmos-sdk/QueryConnectionsRequest";
  value: QueryConnectionsRequestAmino;
}
/**
 * QueryConnectionsRequest is the request type for the Query/Connections RPC
 * method
 */
export interface QueryConnectionsRequestSDKType {
  pagination?: PageRequestSDKType;
}
/**
 * QueryConnectionsResponse is the response type for the Query/Connections RPC
 * method.
 */
export interface QueryConnectionsResponse {
  /** list of stored connections of the chain. */
  connections: IdentifiedConnection[];
  /** pagination response */
  pagination?: PageResponse;
  /** query block height */
  height?: Height;
}
export interface QueryConnectionsResponseProtoMsg {
  typeUrl: "/ibc.core.connection.v1.QueryConnectionsResponse";
  value: Uint8Array;
}
/**
 * QueryConnectionsResponse is the response type for the Query/Connections RPC
 * method.
 */
export interface QueryConnectionsResponseAmino {
  /** list of stored connections of the chain. */
  connections: IdentifiedConnectionAmino[];
  /** pagination response */
  pagination?: PageResponseAmino;
  /** query block height */
  height?: HeightAmino;
}
export interface QueryConnectionsResponseAminoMsg {
  type: "cosmos-sdk/QueryConnectionsResponse";
  value: QueryConnectionsResponseAmino;
}
/**
 * QueryConnectionsResponse is the response type for the Query/Connections RPC
 * method.
 */
export interface QueryConnectionsResponseSDKType {
  connections: IdentifiedConnectionSDKType[];
  pagination?: PageResponseSDKType;
  height?: HeightSDKType;
}
/**
 * QueryClientConnectionsRequest is the request type for the
 * Query/ClientConnections RPC method
 */
export interface QueryClientConnectionsRequest {
  /** client identifier associated with a connection */
  clientId: string;
}
export interface QueryClientConnectionsRequestProtoMsg {
  typeUrl: "/ibc.core.connection.v1.QueryClientConnectionsRequest";
  value: Uint8Array;
}
/**
 * QueryClientConnectionsRequest is the request type for the
 * Query/ClientConnections RPC method
 */
export interface QueryClientConnectionsRequestAmino {
  /** client identifier associated with a connection */
  client_id: string;
}
export interface QueryClientConnectionsRequestAminoMsg {
  type: "cosmos-sdk/QueryClientConnectionsRequest";
  value: QueryClientConnectionsRequestAmino;
}
/**
 * QueryClientConnectionsRequest is the request type for the
 * Query/ClientConnections RPC method
 */
export interface QueryClientConnectionsRequestSDKType {
  client_id: string;
}
/**
 * QueryClientConnectionsResponse is the response type for the
 * Query/ClientConnections RPC method
 */
export interface QueryClientConnectionsResponse {
  /** slice of all the connection paths associated with a client. */
  connectionPaths: string[];
  /** merkle proof of existence */
  proof: Uint8Array;
  /** height at which the proof was generated */
  proofHeight?: Height;
}
export interface QueryClientConnectionsResponseProtoMsg {
  typeUrl: "/ibc.core.connection.v1.QueryClientConnectionsResponse";
  value: Uint8Array;
}
/**
 * QueryClientConnectionsResponse is the response type for the
 * Query/ClientConnections RPC method
 */
export interface QueryClientConnectionsResponseAmino {
  /** slice of all the connection paths associated with a client. */
  connection_paths: string[];
  /** merkle proof of existence */
  proof: Uint8Array;
  /** height at which the proof was generated */
  proof_height?: HeightAmino;
}
export interface QueryClientConnectionsResponseAminoMsg {
  type: "cosmos-sdk/QueryClientConnectionsResponse";
  value: QueryClientConnectionsResponseAmino;
}
/**
 * QueryClientConnectionsResponse is the response type for the
 * Query/ClientConnections RPC method
 */
export interface QueryClientConnectionsResponseSDKType {
  connection_paths: string[];
  proof: Uint8Array;
  proof_height?: HeightSDKType;
}
/**
 * QueryConnectionClientStateRequest is the request type for the
 * Query/ConnectionClientState RPC method
 */
export interface QueryConnectionClientStateRequest {
  /** connection identifier */
  connectionId: string;
}
export interface QueryConnectionClientStateRequestProtoMsg {
  typeUrl: "/ibc.core.connection.v1.QueryConnectionClientStateRequest";
  value: Uint8Array;
}
/**
 * QueryConnectionClientStateRequest is the request type for the
 * Query/ConnectionClientState RPC method
 */
export interface QueryConnectionClientStateRequestAmino {
  /** connection identifier */
  connection_id: string;
}
export interface QueryConnectionClientStateRequestAminoMsg {
  type: "cosmos-sdk/QueryConnectionClientStateRequest";
  value: QueryConnectionClientStateRequestAmino;
}
/**
 * QueryConnectionClientStateRequest is the request type for the
 * Query/ConnectionClientState RPC method
 */
export interface QueryConnectionClientStateRequestSDKType {
  connection_id: string;
}
/**
 * QueryConnectionClientStateResponse is the response type for the
 * Query/ConnectionClientState RPC method
 */
export interface QueryConnectionClientStateResponse {
  /** client state associated with the channel */
  identifiedClientState?: IdentifiedClientState;
  /** merkle proof of existence */
  proof: Uint8Array;
  /** height at which the proof was retrieved */
  proofHeight?: Height;
}
export interface QueryConnectionClientStateResponseProtoMsg {
  typeUrl: "/ibc.core.connection.v1.QueryConnectionClientStateResponse";
  value: Uint8Array;
}
/**
 * QueryConnectionClientStateResponse is the response type for the
 * Query/ConnectionClientState RPC method
 */
export interface QueryConnectionClientStateResponseAmino {
  /** client state associated with the channel */
  identified_client_state?: IdentifiedClientStateAmino;
  /** merkle proof of existence */
  proof: Uint8Array;
  /** height at which the proof was retrieved */
  proof_height?: HeightAmino;
}
export interface QueryConnectionClientStateResponseAminoMsg {
  type: "cosmos-sdk/QueryConnectionClientStateResponse";
  value: QueryConnectionClientStateResponseAmino;
}
/**
 * QueryConnectionClientStateResponse is the response type for the
 * Query/ConnectionClientState RPC method
 */
export interface QueryConnectionClientStateResponseSDKType {
  identified_client_state?: IdentifiedClientStateSDKType;
  proof: Uint8Array;
  proof_height?: HeightSDKType;
}
/**
 * QueryConnectionConsensusStateRequest is the request type for the
 * Query/ConnectionConsensusState RPC method
 */
export interface QueryConnectionConsensusStateRequest {
  /** connection identifier */
  connectionId: string;
  revisionNumber: Long;
  revisionHeight: Long;
}
export interface QueryConnectionConsensusStateRequestProtoMsg {
  typeUrl: "/ibc.core.connection.v1.QueryConnectionConsensusStateRequest";
  value: Uint8Array;
}
/**
 * QueryConnectionConsensusStateRequest is the request type for the
 * Query/ConnectionConsensusState RPC method
 */
export interface QueryConnectionConsensusStateRequestAmino {
  /** connection identifier */
  connection_id: string;
  revision_number: string;
  revision_height: string;
}
export interface QueryConnectionConsensusStateRequestAminoMsg {
  type: "cosmos-sdk/QueryConnectionConsensusStateRequest";
  value: QueryConnectionConsensusStateRequestAmino;
}
/**
 * QueryConnectionConsensusStateRequest is the request type for the
 * Query/ConnectionConsensusState RPC method
 */
export interface QueryConnectionConsensusStateRequestSDKType {
  connection_id: string;
  revision_number: Long;
  revision_height: Long;
}
/**
 * QueryConnectionConsensusStateResponse is the response type for the
 * Query/ConnectionConsensusState RPC method
 */
export interface QueryConnectionConsensusStateResponse {
  /** consensus state associated with the channel */
  consensusState?: Any;
  /** client ID associated with the consensus state */
  clientId: string;
  /** merkle proof of existence */
  proof: Uint8Array;
  /** height at which the proof was retrieved */
  proofHeight?: Height;
}
export interface QueryConnectionConsensusStateResponseProtoMsg {
  typeUrl: "/ibc.core.connection.v1.QueryConnectionConsensusStateResponse";
  value: Uint8Array;
}
/**
 * QueryConnectionConsensusStateResponse is the response type for the
 * Query/ConnectionConsensusState RPC method
 */
export interface QueryConnectionConsensusStateResponseAmino {
  /** consensus state associated with the channel */
  consensus_state?: AnyAmino;
  /** client ID associated with the consensus state */
  client_id: string;
  /** merkle proof of existence */
  proof: Uint8Array;
  /** height at which the proof was retrieved */
  proof_height?: HeightAmino;
}
export interface QueryConnectionConsensusStateResponseAminoMsg {
  type: "cosmos-sdk/QueryConnectionConsensusStateResponse";
  value: QueryConnectionConsensusStateResponseAmino;
}
/**
 * QueryConnectionConsensusStateResponse is the response type for the
 * Query/ConnectionConsensusState RPC method
 */
export interface QueryConnectionConsensusStateResponseSDKType {
  consensus_state?: AnySDKType;
  client_id: string;
  proof: Uint8Array;
  proof_height?: HeightSDKType;
}
/** QueryConnectionParamsRequest is the request type for the Query/ConnectionParams RPC method. */
export interface QueryConnectionParamsRequest {}
export interface QueryConnectionParamsRequestProtoMsg {
  typeUrl: "/ibc.core.connection.v1.QueryConnectionParamsRequest";
  value: Uint8Array;
}
/** QueryConnectionParamsRequest is the request type for the Query/ConnectionParams RPC method. */
export interface QueryConnectionParamsRequestAmino {}
export interface QueryConnectionParamsRequestAminoMsg {
  type: "cosmos-sdk/QueryConnectionParamsRequest";
  value: QueryConnectionParamsRequestAmino;
}
/** QueryConnectionParamsRequest is the request type for the Query/ConnectionParams RPC method. */
export interface QueryConnectionParamsRequestSDKType {}
/** QueryConnectionParamsResponse is the response type for the Query/ConnectionParams RPC method. */
export interface QueryConnectionParamsResponse {
  /** params defines the parameters of the module. */
  params?: Params;
}
export interface QueryConnectionParamsResponseProtoMsg {
  typeUrl: "/ibc.core.connection.v1.QueryConnectionParamsResponse";
  value: Uint8Array;
}
/** QueryConnectionParamsResponse is the response type for the Query/ConnectionParams RPC method. */
export interface QueryConnectionParamsResponseAmino {
  /** params defines the parameters of the module. */
  params?: ParamsAmino;
}
export interface QueryConnectionParamsResponseAminoMsg {
  type: "cosmos-sdk/QueryConnectionParamsResponse";
  value: QueryConnectionParamsResponseAmino;
}
/** QueryConnectionParamsResponse is the response type for the Query/ConnectionParams RPC method. */
export interface QueryConnectionParamsResponseSDKType {
  params?: ParamsSDKType;
}
function createBaseQueryConnectionRequest(): QueryConnectionRequest {
  return {
    connectionId: "",
  };
}
export const QueryConnectionRequest = {
  typeUrl: "/ibc.core.connection.v1.QueryConnectionRequest",
  encode(
    message: QueryConnectionRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.connectionId !== "") {
      writer.uint32(10).string(message.connectionId);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryConnectionRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryConnectionRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.connectionId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryConnectionRequest>): QueryConnectionRequest {
    const message = createBaseQueryConnectionRequest();
    message.connectionId = object.connectionId ?? "";
    return message;
  },
  fromAmino(object: QueryConnectionRequestAmino): QueryConnectionRequest {
    return {
      connectionId: object.connection_id,
    };
  },
  toAmino(message: QueryConnectionRequest): QueryConnectionRequestAmino {
    const obj: any = {};
    obj.connection_id = message.connectionId;
    return obj;
  },
  fromAminoMsg(object: QueryConnectionRequestAminoMsg): QueryConnectionRequest {
    return QueryConnectionRequest.fromAmino(object.value);
  },
  toAminoMsg(message: QueryConnectionRequest): QueryConnectionRequestAminoMsg {
    return {
      type: "cosmos-sdk/QueryConnectionRequest",
      value: QueryConnectionRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryConnectionRequestProtoMsg
  ): QueryConnectionRequest {
    return QueryConnectionRequest.decode(message.value);
  },
  toProto(message: QueryConnectionRequest): Uint8Array {
    return QueryConnectionRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryConnectionRequest): QueryConnectionRequestProtoMsg {
    return {
      typeUrl: "/ibc.core.connection.v1.QueryConnectionRequest",
      value: QueryConnectionRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryConnectionResponse(): QueryConnectionResponse {
  return {
    connection: undefined,
    proof: new Uint8Array(),
    proofHeight: undefined,
  };
}
export const QueryConnectionResponse = {
  typeUrl: "/ibc.core.connection.v1.QueryConnectionResponse",
  encode(
    message: QueryConnectionResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.connection !== undefined) {
      ConnectionEnd.encode(
        message.connection,
        writer.uint32(10).fork()
      ).ldelim();
    }
    if (message.proof.length !== 0) {
      writer.uint32(18).bytes(message.proof);
    }
    if (message.proofHeight !== undefined) {
      Height.encode(message.proofHeight, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryConnectionResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryConnectionResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.connection = ConnectionEnd.decode(reader, reader.uint32());
          break;
        case 2:
          message.proof = reader.bytes();
          break;
        case 3:
          message.proofHeight = Height.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryConnectionResponse>
  ): QueryConnectionResponse {
    const message = createBaseQueryConnectionResponse();
    message.connection =
      object.connection !== undefined && object.connection !== null
        ? ConnectionEnd.fromPartial(object.connection)
        : undefined;
    message.proof = object.proof ?? new Uint8Array();
    message.proofHeight =
      object.proofHeight !== undefined && object.proofHeight !== null
        ? Height.fromPartial(object.proofHeight)
        : undefined;
    return message;
  },
  fromAmino(object: QueryConnectionResponseAmino): QueryConnectionResponse {
    return {
      connection: object?.connection
        ? ConnectionEnd.fromAmino(object.connection)
        : undefined,
      proof: object.proof,
      proofHeight: object?.proof_height
        ? Height.fromAmino(object.proof_height)
        : undefined,
    };
  },
  toAmino(message: QueryConnectionResponse): QueryConnectionResponseAmino {
    const obj: any = {};
    obj.connection = message.connection
      ? ConnectionEnd.toAmino(message.connection)
      : undefined;
    obj.proof = message.proof;
    obj.proof_height = message.proofHeight
      ? Height.toAmino(message.proofHeight)
      : {};
    return obj;
  },
  fromAminoMsg(
    object: QueryConnectionResponseAminoMsg
  ): QueryConnectionResponse {
    return QueryConnectionResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryConnectionResponse
  ): QueryConnectionResponseAminoMsg {
    return {
      type: "cosmos-sdk/QueryConnectionResponse",
      value: QueryConnectionResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryConnectionResponseProtoMsg
  ): QueryConnectionResponse {
    return QueryConnectionResponse.decode(message.value);
  },
  toProto(message: QueryConnectionResponse): Uint8Array {
    return QueryConnectionResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryConnectionResponse
  ): QueryConnectionResponseProtoMsg {
    return {
      typeUrl: "/ibc.core.connection.v1.QueryConnectionResponse",
      value: QueryConnectionResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryConnectionsRequest(): QueryConnectionsRequest {
  return {
    pagination: undefined,
  };
}
export const QueryConnectionsRequest = {
  typeUrl: "/ibc.core.connection.v1.QueryConnectionsRequest",
  encode(
    message: QueryConnectionsRequest,
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
  ): QueryConnectionsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryConnectionsRequest();
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
    object: Partial<QueryConnectionsRequest>
  ): QueryConnectionsRequest {
    const message = createBaseQueryConnectionsRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryConnectionsRequestAmino): QueryConnectionsRequest {
    return {
      pagination: object?.pagination
        ? PageRequest.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(message: QueryConnectionsRequest): QueryConnectionsRequestAmino {
    const obj: any = {};
    obj.pagination = message.pagination
      ? PageRequest.toAmino(message.pagination)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryConnectionsRequestAminoMsg
  ): QueryConnectionsRequest {
    return QueryConnectionsRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryConnectionsRequest
  ): QueryConnectionsRequestAminoMsg {
    return {
      type: "cosmos-sdk/QueryConnectionsRequest",
      value: QueryConnectionsRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryConnectionsRequestProtoMsg
  ): QueryConnectionsRequest {
    return QueryConnectionsRequest.decode(message.value);
  },
  toProto(message: QueryConnectionsRequest): Uint8Array {
    return QueryConnectionsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryConnectionsRequest
  ): QueryConnectionsRequestProtoMsg {
    return {
      typeUrl: "/ibc.core.connection.v1.QueryConnectionsRequest",
      value: QueryConnectionsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryConnectionsResponse(): QueryConnectionsResponse {
  return {
    connections: [],
    pagination: undefined,
    height: undefined,
  };
}
export const QueryConnectionsResponse = {
  typeUrl: "/ibc.core.connection.v1.QueryConnectionsResponse",
  encode(
    message: QueryConnectionsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.connections) {
      IdentifiedConnection.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.pagination !== undefined) {
      PageResponse.encode(
        message.pagination,
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.height !== undefined) {
      Height.encode(message.height, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryConnectionsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryConnectionsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.connections.push(
            IdentifiedConnection.decode(reader, reader.uint32())
          );
          break;
        case 2:
          message.pagination = PageResponse.decode(reader, reader.uint32());
          break;
        case 3:
          message.height = Height.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryConnectionsResponse>
  ): QueryConnectionsResponse {
    const message = createBaseQueryConnectionsResponse();
    message.connections =
      object.connections?.map((e) => IdentifiedConnection.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    message.height =
      object.height !== undefined && object.height !== null
        ? Height.fromPartial(object.height)
        : undefined;
    return message;
  },
  fromAmino(object: QueryConnectionsResponseAmino): QueryConnectionsResponse {
    return {
      connections: Array.isArray(object?.connections)
        ? object.connections.map((e: any) => IdentifiedConnection.fromAmino(e))
        : [],
      pagination: object?.pagination
        ? PageResponse.fromAmino(object.pagination)
        : undefined,
      height: object?.height ? Height.fromAmino(object.height) : undefined,
    };
  },
  toAmino(message: QueryConnectionsResponse): QueryConnectionsResponseAmino {
    const obj: any = {};
    if (message.connections) {
      obj.connections = message.connections.map((e) =>
        e ? IdentifiedConnection.toAmino(e) : undefined
      );
    } else {
      obj.connections = [];
    }
    obj.pagination = message.pagination
      ? PageResponse.toAmino(message.pagination)
      : undefined;
    obj.height = message.height ? Height.toAmino(message.height) : {};
    return obj;
  },
  fromAminoMsg(
    object: QueryConnectionsResponseAminoMsg
  ): QueryConnectionsResponse {
    return QueryConnectionsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryConnectionsResponse
  ): QueryConnectionsResponseAminoMsg {
    return {
      type: "cosmos-sdk/QueryConnectionsResponse",
      value: QueryConnectionsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryConnectionsResponseProtoMsg
  ): QueryConnectionsResponse {
    return QueryConnectionsResponse.decode(message.value);
  },
  toProto(message: QueryConnectionsResponse): Uint8Array {
    return QueryConnectionsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryConnectionsResponse
  ): QueryConnectionsResponseProtoMsg {
    return {
      typeUrl: "/ibc.core.connection.v1.QueryConnectionsResponse",
      value: QueryConnectionsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryClientConnectionsRequest(): QueryClientConnectionsRequest {
  return {
    clientId: "",
  };
}
export const QueryClientConnectionsRequest = {
  typeUrl: "/ibc.core.connection.v1.QueryClientConnectionsRequest",
  encode(
    message: QueryClientConnectionsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.clientId !== "") {
      writer.uint32(10).string(message.clientId);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryClientConnectionsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClientConnectionsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.clientId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryClientConnectionsRequest>
  ): QueryClientConnectionsRequest {
    const message = createBaseQueryClientConnectionsRequest();
    message.clientId = object.clientId ?? "";
    return message;
  },
  fromAmino(
    object: QueryClientConnectionsRequestAmino
  ): QueryClientConnectionsRequest {
    return {
      clientId: object.client_id,
    };
  },
  toAmino(
    message: QueryClientConnectionsRequest
  ): QueryClientConnectionsRequestAmino {
    const obj: any = {};
    obj.client_id = message.clientId;
    return obj;
  },
  fromAminoMsg(
    object: QueryClientConnectionsRequestAminoMsg
  ): QueryClientConnectionsRequest {
    return QueryClientConnectionsRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryClientConnectionsRequest
  ): QueryClientConnectionsRequestAminoMsg {
    return {
      type: "cosmos-sdk/QueryClientConnectionsRequest",
      value: QueryClientConnectionsRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryClientConnectionsRequestProtoMsg
  ): QueryClientConnectionsRequest {
    return QueryClientConnectionsRequest.decode(message.value);
  },
  toProto(message: QueryClientConnectionsRequest): Uint8Array {
    return QueryClientConnectionsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryClientConnectionsRequest
  ): QueryClientConnectionsRequestProtoMsg {
    return {
      typeUrl: "/ibc.core.connection.v1.QueryClientConnectionsRequest",
      value: QueryClientConnectionsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryClientConnectionsResponse(): QueryClientConnectionsResponse {
  return {
    connectionPaths: [],
    proof: new Uint8Array(),
    proofHeight: undefined,
  };
}
export const QueryClientConnectionsResponse = {
  typeUrl: "/ibc.core.connection.v1.QueryClientConnectionsResponse",
  encode(
    message: QueryClientConnectionsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.connectionPaths) {
      writer.uint32(10).string(v!);
    }
    if (message.proof.length !== 0) {
      writer.uint32(18).bytes(message.proof);
    }
    if (message.proofHeight !== undefined) {
      Height.encode(message.proofHeight, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryClientConnectionsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryClientConnectionsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.connectionPaths.push(reader.string());
          break;
        case 2:
          message.proof = reader.bytes();
          break;
        case 3:
          message.proofHeight = Height.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryClientConnectionsResponse>
  ): QueryClientConnectionsResponse {
    const message = createBaseQueryClientConnectionsResponse();
    message.connectionPaths = object.connectionPaths?.map((e) => e) || [];
    message.proof = object.proof ?? new Uint8Array();
    message.proofHeight =
      object.proofHeight !== undefined && object.proofHeight !== null
        ? Height.fromPartial(object.proofHeight)
        : undefined;
    return message;
  },
  fromAmino(
    object: QueryClientConnectionsResponseAmino
  ): QueryClientConnectionsResponse {
    return {
      connectionPaths: Array.isArray(object?.connection_paths)
        ? object.connection_paths.map((e: any) => e)
        : [],
      proof: object.proof,
      proofHeight: object?.proof_height
        ? Height.fromAmino(object.proof_height)
        : undefined,
    };
  },
  toAmino(
    message: QueryClientConnectionsResponse
  ): QueryClientConnectionsResponseAmino {
    const obj: any = {};
    if (message.connectionPaths) {
      obj.connection_paths = message.connectionPaths.map((e) => e);
    } else {
      obj.connection_paths = [];
    }
    obj.proof = message.proof;
    obj.proof_height = message.proofHeight
      ? Height.toAmino(message.proofHeight)
      : {};
    return obj;
  },
  fromAminoMsg(
    object: QueryClientConnectionsResponseAminoMsg
  ): QueryClientConnectionsResponse {
    return QueryClientConnectionsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryClientConnectionsResponse
  ): QueryClientConnectionsResponseAminoMsg {
    return {
      type: "cosmos-sdk/QueryClientConnectionsResponse",
      value: QueryClientConnectionsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryClientConnectionsResponseProtoMsg
  ): QueryClientConnectionsResponse {
    return QueryClientConnectionsResponse.decode(message.value);
  },
  toProto(message: QueryClientConnectionsResponse): Uint8Array {
    return QueryClientConnectionsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryClientConnectionsResponse
  ): QueryClientConnectionsResponseProtoMsg {
    return {
      typeUrl: "/ibc.core.connection.v1.QueryClientConnectionsResponse",
      value: QueryClientConnectionsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryConnectionClientStateRequest(): QueryConnectionClientStateRequest {
  return {
    connectionId: "",
  };
}
export const QueryConnectionClientStateRequest = {
  typeUrl: "/ibc.core.connection.v1.QueryConnectionClientStateRequest",
  encode(
    message: QueryConnectionClientStateRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.connectionId !== "") {
      writer.uint32(10).string(message.connectionId);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryConnectionClientStateRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryConnectionClientStateRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.connectionId = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryConnectionClientStateRequest>
  ): QueryConnectionClientStateRequest {
    const message = createBaseQueryConnectionClientStateRequest();
    message.connectionId = object.connectionId ?? "";
    return message;
  },
  fromAmino(
    object: QueryConnectionClientStateRequestAmino
  ): QueryConnectionClientStateRequest {
    return {
      connectionId: object.connection_id,
    };
  },
  toAmino(
    message: QueryConnectionClientStateRequest
  ): QueryConnectionClientStateRequestAmino {
    const obj: any = {};
    obj.connection_id = message.connectionId;
    return obj;
  },
  fromAminoMsg(
    object: QueryConnectionClientStateRequestAminoMsg
  ): QueryConnectionClientStateRequest {
    return QueryConnectionClientStateRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryConnectionClientStateRequest
  ): QueryConnectionClientStateRequestAminoMsg {
    return {
      type: "cosmos-sdk/QueryConnectionClientStateRequest",
      value: QueryConnectionClientStateRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryConnectionClientStateRequestProtoMsg
  ): QueryConnectionClientStateRequest {
    return QueryConnectionClientStateRequest.decode(message.value);
  },
  toProto(message: QueryConnectionClientStateRequest): Uint8Array {
    return QueryConnectionClientStateRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryConnectionClientStateRequest
  ): QueryConnectionClientStateRequestProtoMsg {
    return {
      typeUrl: "/ibc.core.connection.v1.QueryConnectionClientStateRequest",
      value: QueryConnectionClientStateRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryConnectionClientStateResponse(): QueryConnectionClientStateResponse {
  return {
    identifiedClientState: undefined,
    proof: new Uint8Array(),
    proofHeight: undefined,
  };
}
export const QueryConnectionClientStateResponse = {
  typeUrl: "/ibc.core.connection.v1.QueryConnectionClientStateResponse",
  encode(
    message: QueryConnectionClientStateResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.identifiedClientState !== undefined) {
      IdentifiedClientState.encode(
        message.identifiedClientState,
        writer.uint32(10).fork()
      ).ldelim();
    }
    if (message.proof.length !== 0) {
      writer.uint32(18).bytes(message.proof);
    }
    if (message.proofHeight !== undefined) {
      Height.encode(message.proofHeight, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryConnectionClientStateResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryConnectionClientStateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.identifiedClientState = IdentifiedClientState.decode(
            reader,
            reader.uint32()
          );
          break;
        case 2:
          message.proof = reader.bytes();
          break;
        case 3:
          message.proofHeight = Height.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryConnectionClientStateResponse>
  ): QueryConnectionClientStateResponse {
    const message = createBaseQueryConnectionClientStateResponse();
    message.identifiedClientState =
      object.identifiedClientState !== undefined &&
      object.identifiedClientState !== null
        ? IdentifiedClientState.fromPartial(object.identifiedClientState)
        : undefined;
    message.proof = object.proof ?? new Uint8Array();
    message.proofHeight =
      object.proofHeight !== undefined && object.proofHeight !== null
        ? Height.fromPartial(object.proofHeight)
        : undefined;
    return message;
  },
  fromAmino(
    object: QueryConnectionClientStateResponseAmino
  ): QueryConnectionClientStateResponse {
    return {
      identifiedClientState: object?.identified_client_state
        ? IdentifiedClientState.fromAmino(object.identified_client_state)
        : undefined,
      proof: object.proof,
      proofHeight: object?.proof_height
        ? Height.fromAmino(object.proof_height)
        : undefined,
    };
  },
  toAmino(
    message: QueryConnectionClientStateResponse
  ): QueryConnectionClientStateResponseAmino {
    const obj: any = {};
    obj.identified_client_state = message.identifiedClientState
      ? IdentifiedClientState.toAmino(message.identifiedClientState)
      : undefined;
    obj.proof = message.proof;
    obj.proof_height = message.proofHeight
      ? Height.toAmino(message.proofHeight)
      : {};
    return obj;
  },
  fromAminoMsg(
    object: QueryConnectionClientStateResponseAminoMsg
  ): QueryConnectionClientStateResponse {
    return QueryConnectionClientStateResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryConnectionClientStateResponse
  ): QueryConnectionClientStateResponseAminoMsg {
    return {
      type: "cosmos-sdk/QueryConnectionClientStateResponse",
      value: QueryConnectionClientStateResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryConnectionClientStateResponseProtoMsg
  ): QueryConnectionClientStateResponse {
    return QueryConnectionClientStateResponse.decode(message.value);
  },
  toProto(message: QueryConnectionClientStateResponse): Uint8Array {
    return QueryConnectionClientStateResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryConnectionClientStateResponse
  ): QueryConnectionClientStateResponseProtoMsg {
    return {
      typeUrl: "/ibc.core.connection.v1.QueryConnectionClientStateResponse",
      value: QueryConnectionClientStateResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryConnectionConsensusStateRequest(): QueryConnectionConsensusStateRequest {
  return {
    connectionId: "",
    revisionNumber: Long.UZERO,
    revisionHeight: Long.UZERO,
  };
}
export const QueryConnectionConsensusStateRequest = {
  typeUrl: "/ibc.core.connection.v1.QueryConnectionConsensusStateRequest",
  encode(
    message: QueryConnectionConsensusStateRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.connectionId !== "") {
      writer.uint32(10).string(message.connectionId);
    }
    if (!message.revisionNumber.isZero()) {
      writer.uint32(16).uint64(message.revisionNumber);
    }
    if (!message.revisionHeight.isZero()) {
      writer.uint32(24).uint64(message.revisionHeight);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryConnectionConsensusStateRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryConnectionConsensusStateRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.connectionId = reader.string();
          break;
        case 2:
          message.revisionNumber = reader.uint64() as Long;
          break;
        case 3:
          message.revisionHeight = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryConnectionConsensusStateRequest>
  ): QueryConnectionConsensusStateRequest {
    const message = createBaseQueryConnectionConsensusStateRequest();
    message.connectionId = object.connectionId ?? "";
    message.revisionNumber =
      object.revisionNumber !== undefined && object.revisionNumber !== null
        ? Long.fromValue(object.revisionNumber)
        : Long.UZERO;
    message.revisionHeight =
      object.revisionHeight !== undefined && object.revisionHeight !== null
        ? Long.fromValue(object.revisionHeight)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: QueryConnectionConsensusStateRequestAmino
  ): QueryConnectionConsensusStateRequest {
    return {
      connectionId: object.connection_id,
      revisionNumber: Long.fromString(object.revision_number),
      revisionHeight: Long.fromString(object.revision_height),
    };
  },
  toAmino(
    message: QueryConnectionConsensusStateRequest
  ): QueryConnectionConsensusStateRequestAmino {
    const obj: any = {};
    obj.connection_id = message.connectionId;
    obj.revision_number = message.revisionNumber
      ? message.revisionNumber.toString()
      : undefined;
    obj.revision_height = message.revisionHeight
      ? message.revisionHeight.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryConnectionConsensusStateRequestAminoMsg
  ): QueryConnectionConsensusStateRequest {
    return QueryConnectionConsensusStateRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryConnectionConsensusStateRequest
  ): QueryConnectionConsensusStateRequestAminoMsg {
    return {
      type: "cosmos-sdk/QueryConnectionConsensusStateRequest",
      value: QueryConnectionConsensusStateRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryConnectionConsensusStateRequestProtoMsg
  ): QueryConnectionConsensusStateRequest {
    return QueryConnectionConsensusStateRequest.decode(message.value);
  },
  toProto(message: QueryConnectionConsensusStateRequest): Uint8Array {
    return QueryConnectionConsensusStateRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryConnectionConsensusStateRequest
  ): QueryConnectionConsensusStateRequestProtoMsg {
    return {
      typeUrl: "/ibc.core.connection.v1.QueryConnectionConsensusStateRequest",
      value: QueryConnectionConsensusStateRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryConnectionConsensusStateResponse(): QueryConnectionConsensusStateResponse {
  return {
    consensusState: undefined,
    clientId: "",
    proof: new Uint8Array(),
    proofHeight: undefined,
  };
}
export const QueryConnectionConsensusStateResponse = {
  typeUrl: "/ibc.core.connection.v1.QueryConnectionConsensusStateResponse",
  encode(
    message: QueryConnectionConsensusStateResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.consensusState !== undefined) {
      Any.encode(message.consensusState, writer.uint32(10).fork()).ldelim();
    }
    if (message.clientId !== "") {
      writer.uint32(18).string(message.clientId);
    }
    if (message.proof.length !== 0) {
      writer.uint32(26).bytes(message.proof);
    }
    if (message.proofHeight !== undefined) {
      Height.encode(message.proofHeight, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryConnectionConsensusStateResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryConnectionConsensusStateResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.consensusState = Any.decode(reader, reader.uint32());
          break;
        case 2:
          message.clientId = reader.string();
          break;
        case 3:
          message.proof = reader.bytes();
          break;
        case 4:
          message.proofHeight = Height.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryConnectionConsensusStateResponse>
  ): QueryConnectionConsensusStateResponse {
    const message = createBaseQueryConnectionConsensusStateResponse();
    message.consensusState =
      object.consensusState !== undefined && object.consensusState !== null
        ? Any.fromPartial(object.consensusState)
        : undefined;
    message.clientId = object.clientId ?? "";
    message.proof = object.proof ?? new Uint8Array();
    message.proofHeight =
      object.proofHeight !== undefined && object.proofHeight !== null
        ? Height.fromPartial(object.proofHeight)
        : undefined;
    return message;
  },
  fromAmino(
    object: QueryConnectionConsensusStateResponseAmino
  ): QueryConnectionConsensusStateResponse {
    return {
      consensusState: object?.consensus_state
        ? Any.fromAmino(object.consensus_state)
        : undefined,
      clientId: object.client_id,
      proof: object.proof,
      proofHeight: object?.proof_height
        ? Height.fromAmino(object.proof_height)
        : undefined,
    };
  },
  toAmino(
    message: QueryConnectionConsensusStateResponse
  ): QueryConnectionConsensusStateResponseAmino {
    const obj: any = {};
    obj.consensus_state = message.consensusState
      ? Any.toAmino(message.consensusState)
      : undefined;
    obj.client_id = message.clientId;
    obj.proof = message.proof;
    obj.proof_height = message.proofHeight
      ? Height.toAmino(message.proofHeight)
      : {};
    return obj;
  },
  fromAminoMsg(
    object: QueryConnectionConsensusStateResponseAminoMsg
  ): QueryConnectionConsensusStateResponse {
    return QueryConnectionConsensusStateResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryConnectionConsensusStateResponse
  ): QueryConnectionConsensusStateResponseAminoMsg {
    return {
      type: "cosmos-sdk/QueryConnectionConsensusStateResponse",
      value: QueryConnectionConsensusStateResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryConnectionConsensusStateResponseProtoMsg
  ): QueryConnectionConsensusStateResponse {
    return QueryConnectionConsensusStateResponse.decode(message.value);
  },
  toProto(message: QueryConnectionConsensusStateResponse): Uint8Array {
    return QueryConnectionConsensusStateResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryConnectionConsensusStateResponse
  ): QueryConnectionConsensusStateResponseProtoMsg {
    return {
      typeUrl: "/ibc.core.connection.v1.QueryConnectionConsensusStateResponse",
      value: QueryConnectionConsensusStateResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryConnectionParamsRequest(): QueryConnectionParamsRequest {
  return {};
}
export const QueryConnectionParamsRequest = {
  typeUrl: "/ibc.core.connection.v1.QueryConnectionParamsRequest",
  encode(
    _: QueryConnectionParamsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryConnectionParamsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryConnectionParamsRequest();
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
    _: Partial<QueryConnectionParamsRequest>
  ): QueryConnectionParamsRequest {
    const message = createBaseQueryConnectionParamsRequest();
    return message;
  },
  fromAmino(
    _: QueryConnectionParamsRequestAmino
  ): QueryConnectionParamsRequest {
    return {};
  },
  toAmino(_: QueryConnectionParamsRequest): QueryConnectionParamsRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: QueryConnectionParamsRequestAminoMsg
  ): QueryConnectionParamsRequest {
    return QueryConnectionParamsRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryConnectionParamsRequest
  ): QueryConnectionParamsRequestAminoMsg {
    return {
      type: "cosmos-sdk/QueryConnectionParamsRequest",
      value: QueryConnectionParamsRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryConnectionParamsRequestProtoMsg
  ): QueryConnectionParamsRequest {
    return QueryConnectionParamsRequest.decode(message.value);
  },
  toProto(message: QueryConnectionParamsRequest): Uint8Array {
    return QueryConnectionParamsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryConnectionParamsRequest
  ): QueryConnectionParamsRequestProtoMsg {
    return {
      typeUrl: "/ibc.core.connection.v1.QueryConnectionParamsRequest",
      value: QueryConnectionParamsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryConnectionParamsResponse(): QueryConnectionParamsResponse {
  return {
    params: undefined,
  };
}
export const QueryConnectionParamsResponse = {
  typeUrl: "/ibc.core.connection.v1.QueryConnectionParamsResponse",
  encode(
    message: QueryConnectionParamsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryConnectionParamsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryConnectionParamsResponse();
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
  fromPartial(
    object: Partial<QueryConnectionParamsResponse>
  ): QueryConnectionParamsResponse {
    const message = createBaseQueryConnectionParamsResponse();
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    return message;
  },
  fromAmino(
    object: QueryConnectionParamsResponseAmino
  ): QueryConnectionParamsResponse {
    return {
      params: object?.params ? Params.fromAmino(object.params) : undefined,
    };
  },
  toAmino(
    message: QueryConnectionParamsResponse
  ): QueryConnectionParamsResponseAmino {
    const obj: any = {};
    obj.params = message.params ? Params.toAmino(message.params) : undefined;
    return obj;
  },
  fromAminoMsg(
    object: QueryConnectionParamsResponseAminoMsg
  ): QueryConnectionParamsResponse {
    return QueryConnectionParamsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryConnectionParamsResponse
  ): QueryConnectionParamsResponseAminoMsg {
    return {
      type: "cosmos-sdk/QueryConnectionParamsResponse",
      value: QueryConnectionParamsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryConnectionParamsResponseProtoMsg
  ): QueryConnectionParamsResponse {
    return QueryConnectionParamsResponse.decode(message.value);
  },
  toProto(message: QueryConnectionParamsResponse): Uint8Array {
    return QueryConnectionParamsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryConnectionParamsResponse
  ): QueryConnectionParamsResponseProtoMsg {
    return {
      typeUrl: "/ibc.core.connection.v1.QueryConnectionParamsResponse",
      value: QueryConnectionParamsResponse.encode(message).finish(),
    };
  },
};
