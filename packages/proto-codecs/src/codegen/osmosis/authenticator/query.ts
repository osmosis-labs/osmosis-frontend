//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../binary";
import {
  AccountAuthenticator,
  AccountAuthenticatorAmino,
  AccountAuthenticatorSDKType,
} from "./models";
import { Params, ParamsAmino, ParamsSDKType } from "./params";
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequest {}
export interface QueryParamsRequestProtoMsg {
  typeUrl: "/osmosis.authenticator.QueryParamsRequest";
  value: Uint8Array;
}
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequestAmino {}
export interface QueryParamsRequestAminoMsg {
  type: "osmosis/authenticator/query-params-request";
  value: QueryParamsRequestAmino;
}
/** QueryParamsRequest is request type for the Query/Params RPC method. */
export interface QueryParamsRequestSDKType {}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponse {
  /** params holds all the parameters of this module. */
  params: Params;
}
export interface QueryParamsResponseProtoMsg {
  typeUrl: "/osmosis.authenticator.QueryParamsResponse";
  value: Uint8Array;
}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponseAmino {
  /** params holds all the parameters of this module. */
  params?: ParamsAmino;
}
export interface QueryParamsResponseAminoMsg {
  type: "osmosis/authenticator/query-params-response";
  value: QueryParamsResponseAmino;
}
/** QueryParamsResponse is response type for the Query/Params RPC method. */
export interface QueryParamsResponseSDKType {
  params: ParamsSDKType;
}
/** MsgGetAuthenticatorsRequest defines the Msg/GetAuthenticators request type. */
export interface GetAuthenticatorsRequest {
  /** MsgGetAuthenticatorsRequest defines the Msg/GetAuthenticators request type. */
  account: string;
}
export interface GetAuthenticatorsRequestProtoMsg {
  typeUrl: "/osmosis.authenticator.GetAuthenticatorsRequest";
  value: Uint8Array;
}
/** MsgGetAuthenticatorsRequest defines the Msg/GetAuthenticators request type. */
export interface GetAuthenticatorsRequestAmino {
  /** MsgGetAuthenticatorsRequest defines the Msg/GetAuthenticators request type. */
  account: string;
}
export interface GetAuthenticatorsRequestAminoMsg {
  type: "osmosis/authenticator/get-authenticators-request";
  value: GetAuthenticatorsRequestAmino;
}
/** MsgGetAuthenticatorsRequest defines the Msg/GetAuthenticators request type. */
export interface GetAuthenticatorsRequestSDKType {
  account: string;
}
/** MsgGetAuthenticatorsResponse defines the Msg/GetAuthenticators response type. */
export interface GetAuthenticatorsResponse {
  accountAuthenticators: AccountAuthenticator[];
}
export interface GetAuthenticatorsResponseProtoMsg {
  typeUrl: "/osmosis.authenticator.GetAuthenticatorsResponse";
  value: Uint8Array;
}
/** MsgGetAuthenticatorsResponse defines the Msg/GetAuthenticators response type. */
export interface GetAuthenticatorsResponseAmino {
  account_authenticators: AccountAuthenticatorAmino[];
}
export interface GetAuthenticatorsResponseAminoMsg {
  type: "osmosis/authenticator/get-authenticators-response";
  value: GetAuthenticatorsResponseAmino;
}
/** MsgGetAuthenticatorsResponse defines the Msg/GetAuthenticators response type. */
export interface GetAuthenticatorsResponseSDKType {
  account_authenticators: AccountAuthenticatorSDKType[];
}
function createBaseQueryParamsRequest(): QueryParamsRequest {
  return {};
}
export const QueryParamsRequest = {
  typeUrl: "/osmosis.authenticator.QueryParamsRequest",
  encode(
    _: QueryParamsRequest,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): QueryParamsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
      type: "osmosis/authenticator/query-params-request",
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
      typeUrl: "/osmosis.authenticator.QueryParamsRequest",
      value: QueryParamsRequest.encode(message).finish(),
    };
  },
};
function createBaseQueryParamsResponse(): QueryParamsResponse {
  return {
    params: Params.fromPartial({}),
  };
}
export const QueryParamsResponse = {
  typeUrl: "/osmosis.authenticator.QueryParamsResponse",
  encode(
    message: QueryParamsResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): QueryParamsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
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
      type: "osmosis/authenticator/query-params-response",
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
      typeUrl: "/osmosis.authenticator.QueryParamsResponse",
      value: QueryParamsResponse.encode(message).finish(),
    };
  },
};
function createBaseGetAuthenticatorsRequest(): GetAuthenticatorsRequest {
  return {
    account: "",
  };
}
export const GetAuthenticatorsRequest = {
  typeUrl: "/osmosis.authenticator.GetAuthenticatorsRequest",
  encode(
    message: GetAuthenticatorsRequest,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.account !== "") {
      writer.uint32(10).string(message.account);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): GetAuthenticatorsRequest {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetAuthenticatorsRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.account = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<GetAuthenticatorsRequest>
  ): GetAuthenticatorsRequest {
    const message = createBaseGetAuthenticatorsRequest();
    message.account = object.account ?? "";
    return message;
  },
  fromAmino(object: GetAuthenticatorsRequestAmino): GetAuthenticatorsRequest {
    return {
      account: object.account,
    };
  },
  toAmino(message: GetAuthenticatorsRequest): GetAuthenticatorsRequestAmino {
    const obj: any = {};
    obj.account = message.account;
    return obj;
  },
  fromAminoMsg(
    object: GetAuthenticatorsRequestAminoMsg
  ): GetAuthenticatorsRequest {
    return GetAuthenticatorsRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: GetAuthenticatorsRequest
  ): GetAuthenticatorsRequestAminoMsg {
    return {
      type: "osmosis/authenticator/get-authenticators-request",
      value: GetAuthenticatorsRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: GetAuthenticatorsRequestProtoMsg
  ): GetAuthenticatorsRequest {
    return GetAuthenticatorsRequest.decode(message.value);
  },
  toProto(message: GetAuthenticatorsRequest): Uint8Array {
    return GetAuthenticatorsRequest.encode(message).finish();
  },
  toProtoMsg(
    message: GetAuthenticatorsRequest
  ): GetAuthenticatorsRequestProtoMsg {
    return {
      typeUrl: "/osmosis.authenticator.GetAuthenticatorsRequest",
      value: GetAuthenticatorsRequest.encode(message).finish(),
    };
  },
};
function createBaseGetAuthenticatorsResponse(): GetAuthenticatorsResponse {
  return {
    accountAuthenticators: [],
  };
}
export const GetAuthenticatorsResponse = {
  typeUrl: "/osmosis.authenticator.GetAuthenticatorsResponse",
  encode(
    message: GetAuthenticatorsResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    for (const v of message.accountAuthenticators) {
      AccountAuthenticator.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): GetAuthenticatorsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetAuthenticatorsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.accountAuthenticators.push(
            AccountAuthenticator.decode(reader, reader.uint32())
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
    object: Partial<GetAuthenticatorsResponse>
  ): GetAuthenticatorsResponse {
    const message = createBaseGetAuthenticatorsResponse();
    message.accountAuthenticators =
      object.accountAuthenticators?.map((e) =>
        AccountAuthenticator.fromPartial(e)
      ) || [];
    return message;
  },
  fromAmino(object: GetAuthenticatorsResponseAmino): GetAuthenticatorsResponse {
    return {
      accountAuthenticators: Array.isArray(object?.account_authenticators)
        ? object.account_authenticators.map((e: any) =>
            AccountAuthenticator.fromAmino(e)
          )
        : [],
    };
  },
  toAmino(message: GetAuthenticatorsResponse): GetAuthenticatorsResponseAmino {
    const obj: any = {};
    if (message.accountAuthenticators) {
      obj.account_authenticators = message.accountAuthenticators.map((e) =>
        e ? AccountAuthenticator.toAmino(e) : undefined
      );
    } else {
      obj.account_authenticators = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: GetAuthenticatorsResponseAminoMsg
  ): GetAuthenticatorsResponse {
    return GetAuthenticatorsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: GetAuthenticatorsResponse
  ): GetAuthenticatorsResponseAminoMsg {
    return {
      type: "osmosis/authenticator/get-authenticators-response",
      value: GetAuthenticatorsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: GetAuthenticatorsResponseProtoMsg
  ): GetAuthenticatorsResponse {
    return GetAuthenticatorsResponse.decode(message.value);
  },
  toProto(message: GetAuthenticatorsResponse): Uint8Array {
    return GetAuthenticatorsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: GetAuthenticatorsResponse
  ): GetAuthenticatorsResponseProtoMsg {
    return {
      typeUrl: "/osmosis.authenticator.GetAuthenticatorsResponse",
      value: GetAuthenticatorsResponse.encode(message).finish(),
    };
  },
};
