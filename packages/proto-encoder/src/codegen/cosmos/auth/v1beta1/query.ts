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
import {
  Any,
  AnyProtoMsg,
  AnyAmino,
  AnySDKType,
} from "../../../google/protobuf/any";
import {
  Params,
  ParamsAmino,
  ParamsSDKType,
  BaseAccount,
  BaseAccountProtoMsg,
  BaseAccountSDKType,
  ModuleAccount,
  ModuleAccountProtoMsg,
  ModuleAccountSDKType,
} from "./auth";
import * as _m0 from "protobufjs/minimal";
/**
 * QueryAccountsRequest is the request type for the Query/Accounts RPC method.
 *
 * Since: cosmos-sdk 0.43
 */
export interface QueryAccountsRequest {
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequest;
}
export interface QueryAccountsRequestProtoMsg {
  typeUrl: "/cosmos.auth.v1beta1.QueryAccountsRequest";
  value: Uint8Array;
}
/**
 * QueryAccountsRequest is the request type for the Query/Accounts RPC method.
 *
 * Since: cosmos-sdk 0.43
 */
export interface QueryAccountsRequestAmino {
  /** pagination defines an optional pagination for the request. */
  pagination?: PageRequestAmino;
}
export interface QueryAccountsRequestAminoMsg {
  type: "cosmos-sdk/QueryAccountsRequest";
  value: QueryAccountsRequestAmino;
}
/**
 * QueryAccountsRequest is the request type for the Query/Accounts RPC method.
 *
 * Since: cosmos-sdk 0.43
 */
export interface QueryAccountsRequestSDKType {
  pagination?: PageRequestSDKType;
}
/**
 * QueryAccountsResponse is the response type for the Query/Accounts RPC method.
 *
 * Since: cosmos-sdk 0.43
 */
export interface QueryAccountsResponse {
  /** accounts are the existing accounts */
  accounts: (BaseAccount & Any)[] | Any[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponse;
}
export interface QueryAccountsResponseProtoMsg {
  typeUrl: "/cosmos.auth.v1beta1.QueryAccountsResponse";
  value: Uint8Array;
}
export type QueryAccountsResponseEncoded = Omit<
  QueryAccountsResponse,
  "accounts"
> & {
  /** accounts are the existing accounts */ accounts: (
    | BaseAccountProtoMsg
    | AnyProtoMsg
  )[];
};
/**
 * QueryAccountsResponse is the response type for the Query/Accounts RPC method.
 *
 * Since: cosmos-sdk 0.43
 */
export interface QueryAccountsResponseAmino {
  /** accounts are the existing accounts */
  accounts: AnyAmino[];
  /** pagination defines the pagination in the response. */
  pagination?: PageResponseAmino;
}
export interface QueryAccountsResponseAminoMsg {
  type: "cosmos-sdk/QueryAccountsResponse";
  value: QueryAccountsResponseAmino;
}
/**
 * QueryAccountsResponse is the response type for the Query/Accounts RPC method.
 *
 * Since: cosmos-sdk 0.43
 */
export interface QueryAccountsResponseSDKType {
  accounts: (BaseAccountSDKType | AnySDKType)[];
  pagination?: PageResponseSDKType;
}
/** QueryAccountRequest is the request type for the Query/Account RPC method. */
export interface QueryAccountRequest {
  /** address defines the address to query for. */
  address: string;
}
export interface QueryAccountRequestProtoMsg {
  typeUrl: "/cosmos.auth.v1beta1.QueryAccountRequest";
  value: Uint8Array;
}
/** QueryAccountRequest is the request type for the Query/Account RPC method. */
export interface QueryAccountRequestAmino {
  /** address defines the address to query for. */
  address: string;
}
export interface QueryAccountRequestAminoMsg {
  type: "cosmos-sdk/QueryAccountRequest";
  value: QueryAccountRequestAmino;
}
/** QueryAccountRequest is the request type for the Query/Account RPC method. */
export interface QueryAccountRequestSDKType {
  address: string;
}
/** QueryAccountResponse is the response type for the Query/Account RPC method. */
export interface QueryAccountResponse {
  /** account defines the account of the corresponding address. */
  account?: (BaseAccount & Any) | undefined;
}
export interface QueryAccountResponseProtoMsg {
  typeUrl: "/cosmos.auth.v1beta1.QueryAccountResponse";
  value: Uint8Array;
}
export type QueryAccountResponseEncoded = Omit<
  QueryAccountResponse,
  "account"
> & {
  /** account defines the account of the corresponding address. */ account?:
    | BaseAccountProtoMsg
    | AnyProtoMsg
    | undefined;
};
/** QueryAccountResponse is the response type for the Query/Account RPC method. */
export interface QueryAccountResponseAmino {
  /** account defines the account of the corresponding address. */
  account?: AnyAmino;
}
export interface QueryAccountResponseAminoMsg {
  type: "cosmos-sdk/QueryAccountResponse";
  value: QueryAccountResponseAmino;
}
/** QueryAccountResponse is the response type for the Query/Account RPC method. */
export interface QueryAccountResponseSDKType {
  account?: BaseAccountSDKType | AnySDKType | undefined;
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequest {}
export interface QueryParamsRequestProtoMsg {
  typeUrl: "/cosmos.auth.v1beta1.QueryParamsRequest";
  value: Uint8Array;
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequestAmino {}
export interface QueryParamsRequestAminoMsg {
  type: "cosmos-sdk/QueryParamsRequest";
  value: QueryParamsRequestAmino;
}
/** QueryParamsRequest is the request type for the Query/Params RPC method. */
export interface QueryParamsRequestSDKType {}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponse {
  /** params defines the parameters of the module. */
  params?: Params;
}
export interface QueryParamsResponseProtoMsg {
  typeUrl: "/cosmos.auth.v1beta1.QueryParamsResponse";
  value: Uint8Array;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponseAmino {
  /** params defines the parameters of the module. */
  params?: ParamsAmino;
}
export interface QueryParamsResponseAminoMsg {
  type: "cosmos-sdk/QueryParamsResponse";
  value: QueryParamsResponseAmino;
}
/** QueryParamsResponse is the response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
  params?: ParamsSDKType;
}
/** QueryModuleAccountsRequest is the request type for the Query/ModuleAccounts RPC method. */
export interface QueryModuleAccountsRequest {}
export interface QueryModuleAccountsRequestProtoMsg {
  typeUrl: "/cosmos.auth.v1beta1.QueryModuleAccountsRequest";
  value: Uint8Array;
}
/** QueryModuleAccountsRequest is the request type for the Query/ModuleAccounts RPC method. */
export interface QueryModuleAccountsRequestAmino {}
export interface QueryModuleAccountsRequestAminoMsg {
  type: "cosmos-sdk/QueryModuleAccountsRequest";
  value: QueryModuleAccountsRequestAmino;
}
/** QueryModuleAccountsRequest is the request type for the Query/ModuleAccounts RPC method. */
export interface QueryModuleAccountsRequestSDKType {}
/** QueryModuleAccountsResponse is the response type for the Query/ModuleAccounts RPC method. */
export interface QueryModuleAccountsResponse {
  accounts: (ModuleAccount & Any)[] | Any[];
}
export interface QueryModuleAccountsResponseProtoMsg {
  typeUrl: "/cosmos.auth.v1beta1.QueryModuleAccountsResponse";
  value: Uint8Array;
}
export type QueryModuleAccountsResponseEncoded = Omit<
  QueryModuleAccountsResponse,
  "accounts"
> & {
  accounts: (ModuleAccountProtoMsg | AnyProtoMsg)[];
};
/** QueryModuleAccountsResponse is the response type for the Query/ModuleAccounts RPC method. */
export interface QueryModuleAccountsResponseAmino {
  accounts: AnyAmino[];
}
export interface QueryModuleAccountsResponseAminoMsg {
  type: "cosmos-sdk/QueryModuleAccountsResponse";
  value: QueryModuleAccountsResponseAmino;
}
/** QueryModuleAccountsResponse is the response type for the Query/ModuleAccounts RPC method. */
export interface QueryModuleAccountsResponseSDKType {
  accounts: (ModuleAccountSDKType | AnySDKType)[];
}
function createBaseQueryAccountsRequest(): QueryAccountsRequest {
  return {
    pagination: undefined,
  };
}
export const QueryAccountsRequest = {
  typeUrl: "/cosmos.auth.v1beta1.QueryAccountsRequest",
  encode(
    message: QueryAccountsRequest,
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
  ): QueryAccountsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAccountsRequest();
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
  fromPartial(object: Partial<QueryAccountsRequest>): QueryAccountsRequest {
    const message = createBaseQueryAccountsRequest();
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageRequest.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryAccountsRequestAmino): QueryAccountsRequest {
    return {
      pagination: object?.pagination
        ? PageRequest.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(message: QueryAccountsRequest): QueryAccountsRequestAmino {
    const obj: any = {};
    obj.pagination = message.pagination
      ? PageRequest.toAmino(message.pagination)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryAccountsRequestAminoMsg): QueryAccountsRequest {
    return QueryAccountsRequest.fromAmino(object.value);
  },
  toAminoMsg(message: QueryAccountsRequest): QueryAccountsRequestAminoMsg {
    return {
      type: "cosmos-sdk/QueryAccountsRequest",
      value: QueryAccountsRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryAccountsRequestProtoMsg): QueryAccountsRequest {
    return QueryAccountsRequest.decode(message.value);
  },
  toProto(message: QueryAccountsRequest): Uint8Array {
    return QueryAccountsRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryAccountsRequest): QueryAccountsRequestProtoMsg {
    return {
      typeUrl: "/cosmos.auth.v1beta1.QueryAccountsRequest",
      value: QueryAccountsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryAccountsResponse(): QueryAccountsResponse {
  return {
    accounts: [],
    pagination: undefined,
  };
}
export const QueryAccountsResponse = {
  typeUrl: "/cosmos.auth.v1beta1.QueryAccountsResponse",
  encode(
    message: QueryAccountsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.accounts) {
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
  ): QueryAccountsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAccountsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.accounts.push(AccountI_InterfaceDecoder(reader) as Any);
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
  fromPartial(object: Partial<QueryAccountsResponse>): QueryAccountsResponse {
    const message = createBaseQueryAccountsResponse();
    message.accounts = object.accounts?.map((e) => Any.fromPartial(e)) || [];
    message.pagination =
      object.pagination !== undefined && object.pagination !== null
        ? PageResponse.fromPartial(object.pagination)
        : undefined;
    return message;
  },
  fromAmino(object: QueryAccountsResponseAmino): QueryAccountsResponse {
    return {
      accounts: Array.isArray(object?.accounts)
        ? object.accounts.map((e: any) => AccountI_FromAmino(e))
        : [],
      pagination: object?.pagination
        ? PageResponse.fromAmino(object.pagination)
        : undefined,
    };
  },
  toAmino(message: QueryAccountsResponse): QueryAccountsResponseAmino {
    const obj: any = {};
    if (message.accounts) {
      obj.accounts = message.accounts.map((e) =>
        e ? AccountI_ToAmino(e as Any) : undefined
      );
    } else {
      obj.accounts = [];
    }
    obj.pagination = message.pagination
      ? PageResponse.toAmino(message.pagination)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryAccountsResponseAminoMsg): QueryAccountsResponse {
    return QueryAccountsResponse.fromAmino(object.value);
  },
  toAminoMsg(message: QueryAccountsResponse): QueryAccountsResponseAminoMsg {
    return {
      type: "cosmos-sdk/QueryAccountsResponse",
      value: QueryAccountsResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryAccountsResponseProtoMsg): QueryAccountsResponse {
    return QueryAccountsResponse.decode(message.value);
  },
  toProto(message: QueryAccountsResponse): Uint8Array {
    return QueryAccountsResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryAccountsResponse): QueryAccountsResponseProtoMsg {
    return {
      typeUrl: "/cosmos.auth.v1beta1.QueryAccountsResponse",
      value: QueryAccountsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryAccountRequest(): QueryAccountRequest {
  return {
    address: "",
  };
}
export const QueryAccountRequest = {
  typeUrl: "/cosmos.auth.v1beta1.QueryAccountRequest",
  encode(
    message: QueryAccountRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): QueryAccountRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAccountRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryAccountRequest>): QueryAccountRequest {
    const message = createBaseQueryAccountRequest();
    message.address = object.address ?? "";
    return message;
  },
  fromAmino(object: QueryAccountRequestAmino): QueryAccountRequest {
    return {
      address: object.address,
    };
  },
  toAmino(message: QueryAccountRequest): QueryAccountRequestAmino {
    const obj: any = {};
    obj.address = message.address;
    return obj;
  },
  fromAminoMsg(object: QueryAccountRequestAminoMsg): QueryAccountRequest {
    return QueryAccountRequest.fromAmino(object.value);
  },
  toAminoMsg(message: QueryAccountRequest): QueryAccountRequestAminoMsg {
    return {
      type: "cosmos-sdk/QueryAccountRequest",
      value: QueryAccountRequest.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryAccountRequestProtoMsg): QueryAccountRequest {
    return QueryAccountRequest.decode(message.value);
  },
  toProto(message: QueryAccountRequest): Uint8Array {
    return QueryAccountRequest.encode(message).finish();
  },
  toProtoMsg(message: QueryAccountRequest): QueryAccountRequestProtoMsg {
    return {
      typeUrl: "/cosmos.auth.v1beta1.QueryAccountRequest",
      value: QueryAccountRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryAccountResponse(): QueryAccountResponse {
  return {
    account: undefined,
  };
}
export const QueryAccountResponse = {
  typeUrl: "/cosmos.auth.v1beta1.QueryAccountResponse",
  encode(
    message: QueryAccountResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.account !== undefined) {
      Any.encode(message.account as Any, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryAccountResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryAccountResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.account = AccountI_InterfaceDecoder(reader) as Any;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<QueryAccountResponse>): QueryAccountResponse {
    const message = createBaseQueryAccountResponse();
    message.account =
      object.account !== undefined && object.account !== null
        ? Any.fromPartial(object.account)
        : undefined;
    return message;
  },
  fromAmino(object: QueryAccountResponseAmino): QueryAccountResponse {
    return {
      account: object?.account ? AccountI_FromAmino(object.account) : undefined,
    };
  },
  toAmino(message: QueryAccountResponse): QueryAccountResponseAmino {
    const obj: any = {};
    obj.account = message.account
      ? AccountI_ToAmino(message.account as Any)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: QueryAccountResponseAminoMsg): QueryAccountResponse {
    return QueryAccountResponse.fromAmino(object.value);
  },
  toAminoMsg(message: QueryAccountResponse): QueryAccountResponseAminoMsg {
    return {
      type: "cosmos-sdk/QueryAccountResponse",
      value: QueryAccountResponse.toAmino(message),
    };
  },
  fromProtoMsg(message: QueryAccountResponseProtoMsg): QueryAccountResponse {
    return QueryAccountResponse.decode(message.value);
  },
  toProto(message: QueryAccountResponse): Uint8Array {
    return QueryAccountResponse.encode(message).finish();
  },
  toProtoMsg(message: QueryAccountResponse): QueryAccountResponseProtoMsg {
    return {
      typeUrl: "/cosmos.auth.v1beta1.QueryAccountResponse",
      value: QueryAccountResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryParamsRequest(): QueryParamsRequest {
  return {};
}
export const QueryParamsRequest = {
  typeUrl: "/cosmos.auth.v1beta1.QueryParamsRequest",
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
      typeUrl: "/cosmos.auth.v1beta1.QueryParamsRequest",
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
  typeUrl: "/cosmos.auth.v1beta1.QueryParamsResponse",
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
      typeUrl: "/cosmos.auth.v1beta1.QueryParamsResponse",
      value: QueryParamsResponse.encode(message).finish(),
    };
  },
};
function createBaseQueryModuleAccountsRequest(): QueryModuleAccountsRequest {
  return {};
}
export const QueryModuleAccountsRequest = {
  typeUrl: "/cosmos.auth.v1beta1.QueryModuleAccountsRequest",
  encode(
    _: QueryModuleAccountsRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryModuleAccountsRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryModuleAccountsRequest();
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
    _: Partial<QueryModuleAccountsRequest>
  ): QueryModuleAccountsRequest {
    const message = createBaseQueryModuleAccountsRequest();
    return message;
  },
  fromAmino(_: QueryModuleAccountsRequestAmino): QueryModuleAccountsRequest {
    return {};
  },
  toAmino(_: QueryModuleAccountsRequest): QueryModuleAccountsRequestAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: QueryModuleAccountsRequestAminoMsg
  ): QueryModuleAccountsRequest {
    return QueryModuleAccountsRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryModuleAccountsRequest
  ): QueryModuleAccountsRequestAminoMsg {
    return {
      type: "cosmos-sdk/QueryModuleAccountsRequest",
      value: QueryModuleAccountsRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryModuleAccountsRequestProtoMsg
  ): QueryModuleAccountsRequest {
    return QueryModuleAccountsRequest.decode(message.value);
  },
  toProto(message: QueryModuleAccountsRequest): Uint8Array {
    return QueryModuleAccountsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: QueryModuleAccountsRequest
  ): QueryModuleAccountsRequestProtoMsg {
    return {
      typeUrl: "/cosmos.auth.v1beta1.QueryModuleAccountsRequest",
      value: QueryModuleAccountsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryModuleAccountsResponse(): QueryModuleAccountsResponse {
  return {
    accounts: [],
  };
}
export const QueryModuleAccountsResponse = {
  typeUrl: "/cosmos.auth.v1beta1.QueryModuleAccountsResponse",
  encode(
    message: QueryModuleAccountsResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.accounts) {
      Any.encode(v! as Any, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): QueryModuleAccountsResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseQueryModuleAccountsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.accounts.push(ModuleAccountI_InterfaceDecoder(reader) as Any);
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<QueryModuleAccountsResponse>
  ): QueryModuleAccountsResponse {
    const message = createBaseQueryModuleAccountsResponse();
    message.accounts = object.accounts?.map((e) => Any.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: QueryModuleAccountsResponseAmino
  ): QueryModuleAccountsResponse {
    return {
      accounts: Array.isArray(object?.accounts)
        ? object.accounts.map((e: any) => ModuleAccountI_FromAmino(e))
        : [],
    };
  },
  toAmino(
    message: QueryModuleAccountsResponse
  ): QueryModuleAccountsResponseAmino {
    const obj: any = {};
    if (message.accounts) {
      obj.accounts = message.accounts.map((e) =>
        e ? ModuleAccountI_ToAmino(e as Any) : undefined
      );
    } else {
      obj.accounts = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: QueryModuleAccountsResponseAminoMsg
  ): QueryModuleAccountsResponse {
    return QueryModuleAccountsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: QueryModuleAccountsResponse
  ): QueryModuleAccountsResponseAminoMsg {
    return {
      type: "cosmos-sdk/QueryModuleAccountsResponse",
      value: QueryModuleAccountsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: QueryModuleAccountsResponseProtoMsg
  ): QueryModuleAccountsResponse {
    return QueryModuleAccountsResponse.decode(message.value);
  },
  toProto(message: QueryModuleAccountsResponse): Uint8Array {
    return QueryModuleAccountsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: QueryModuleAccountsResponse
  ): QueryModuleAccountsResponseProtoMsg {
    return {
      typeUrl: "/cosmos.auth.v1beta1.QueryModuleAccountsResponse",
      value: QueryModuleAccountsResponse.encode(message).finish(),
    };
  },
};
export const AccountI_InterfaceDecoder = (
  input: _m0.Reader | Uint8Array
): BaseAccount | Any => {
  const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
  const data = Any.decode(reader, reader.uint32());
  switch (data.typeUrl) {
    case "/cosmos.auth.v1beta1.BaseAccount":
      return BaseAccount.decode(data.value);
    default:
      return data;
  }
};
export const AccountI_FromAmino = (content: AnyAmino) => {
  switch (content.type) {
    case "cosmos-sdk/BaseAccount":
      return Any.fromPartial({
        typeUrl: "/cosmos.auth.v1beta1.BaseAccount",
        value: BaseAccount.encode(
          BaseAccount.fromPartial(BaseAccount.fromAmino(content.value))
        ).finish(),
      });
    default:
      return Any.fromAmino(content);
  }
};
export const AccountI_ToAmino = (content: Any) => {
  switch (content.typeUrl) {
    case "/cosmos.auth.v1beta1.BaseAccount":
      return {
        type: "cosmos-sdk/BaseAccount",
        value: BaseAccount.toAmino(BaseAccount.decode(content.value)),
      };
    default:
      return Any.toAmino(content);
  }
};
export const ModuleAccountI_InterfaceDecoder = (
  input: _m0.Reader | Uint8Array
): ModuleAccount | Any => {
  const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
  const data = Any.decode(reader, reader.uint32());
  switch (data.typeUrl) {
    case "/cosmos.auth.v1beta1.ModuleAccount":
      return ModuleAccount.decode(data.value);
    default:
      return data;
  }
};
export const ModuleAccountI_FromAmino = (content: AnyAmino) => {
  switch (content.type) {
    case "cosmos-sdk/ModuleAccount":
      return Any.fromPartial({
        typeUrl: "/cosmos.auth.v1beta1.ModuleAccount",
        value: ModuleAccount.encode(
          ModuleAccount.fromPartial(ModuleAccount.fromAmino(content.value))
        ).finish(),
      });
    default:
      return Any.fromAmino(content);
  }
};
export const ModuleAccountI_ToAmino = (content: Any) => {
  switch (content.typeUrl) {
    case "/cosmos.auth.v1beta1.ModuleAccount":
      return {
        type: "cosmos-sdk/ModuleAccount",
        value: ModuleAccount.toAmino(ModuleAccount.decode(content.value)),
      };
    default:
      return Any.toAmino(content);
  }
};
