import {
  ValidatorPreference,
  ValidatorPreferenceAmino,
  ValidatorPreferenceSDKType,
} from "./state";
import * as _m0 from "protobufjs/minimal";
/** Request type for UserValidatorPreferences. */
export interface UserValidatorPreferencesRequest {
  /** user account address */
  address: string;
}
export interface UserValidatorPreferencesRequestProtoMsg {
  typeUrl: "/osmosis.valsetpref.v1beta1.UserValidatorPreferencesRequest";
  value: Uint8Array;
}
/** Request type for UserValidatorPreferences. */
export interface UserValidatorPreferencesRequestAmino {
  /** user account address */
  address: string;
}
export interface UserValidatorPreferencesRequestAminoMsg {
  type: "osmosis/valsetpref/user-validator-preferences-request";
  value: UserValidatorPreferencesRequestAmino;
}
/** Request type for UserValidatorPreferences. */
export interface UserValidatorPreferencesRequestSDKType {
  address: string;
}
/** Response type the QueryUserValidatorPreferences query request */
export interface UserValidatorPreferencesResponse {
  preferences: ValidatorPreference[];
}
export interface UserValidatorPreferencesResponseProtoMsg {
  typeUrl: "/osmosis.valsetpref.v1beta1.UserValidatorPreferencesResponse";
  value: Uint8Array;
}
/** Response type the QueryUserValidatorPreferences query request */
export interface UserValidatorPreferencesResponseAmino {
  preferences: ValidatorPreferenceAmino[];
}
export interface UserValidatorPreferencesResponseAminoMsg {
  type: "osmosis/valsetpref/user-validator-preferences-response";
  value: UserValidatorPreferencesResponseAmino;
}
/** Response type the QueryUserValidatorPreferences query request */
export interface UserValidatorPreferencesResponseSDKType {
  preferences: ValidatorPreferenceSDKType[];
}
function createBaseUserValidatorPreferencesRequest(): UserValidatorPreferencesRequest {
  return {
    address: "",
  };
}
export const UserValidatorPreferencesRequest = {
  typeUrl: "/osmosis.valsetpref.v1beta1.UserValidatorPreferencesRequest",
  encode(
    message: UserValidatorPreferencesRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): UserValidatorPreferencesRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserValidatorPreferencesRequest();
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
  fromPartial(
    object: Partial<UserValidatorPreferencesRequest>
  ): UserValidatorPreferencesRequest {
    const message = createBaseUserValidatorPreferencesRequest();
    message.address = object.address ?? "";
    return message;
  },
  fromAmino(
    object: UserValidatorPreferencesRequestAmino
  ): UserValidatorPreferencesRequest {
    return {
      address: object.address,
    };
  },
  toAmino(
    message: UserValidatorPreferencesRequest
  ): UserValidatorPreferencesRequestAmino {
    const obj: any = {};
    obj.address = message.address;
    return obj;
  },
  fromAminoMsg(
    object: UserValidatorPreferencesRequestAminoMsg
  ): UserValidatorPreferencesRequest {
    return UserValidatorPreferencesRequest.fromAmino(object.value);
  },
  toAminoMsg(
    message: UserValidatorPreferencesRequest
  ): UserValidatorPreferencesRequestAminoMsg {
    return {
      type: "osmosis/valsetpref/user-validator-preferences-request",
      value: UserValidatorPreferencesRequest.toAmino(message),
    };
  },
  fromProtoMsg(
    message: UserValidatorPreferencesRequestProtoMsg
  ): UserValidatorPreferencesRequest {
    return UserValidatorPreferencesRequest.decode(message.value);
  },
  toProto(message: UserValidatorPreferencesRequest): Uint8Array {
    return UserValidatorPreferencesRequest.encode(message).finish();
  },
  toProtoMsg(
    message: UserValidatorPreferencesRequest
  ): UserValidatorPreferencesRequestProtoMsg {
    return {
      typeUrl: "/osmosis.valsetpref.v1beta1.UserValidatorPreferencesRequest",
      value: UserValidatorPreferencesRequest.encode(message).finish(),
    };
  },
};
function createBaseUserValidatorPreferencesResponse(): UserValidatorPreferencesResponse {
  return {
    preferences: [],
  };
}
export const UserValidatorPreferencesResponse = {
  typeUrl: "/osmosis.valsetpref.v1beta1.UserValidatorPreferencesResponse",
  encode(
    message: UserValidatorPreferencesResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.preferences) {
      ValidatorPreference.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): UserValidatorPreferencesResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUserValidatorPreferencesResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.preferences.push(
            ValidatorPreference.decode(reader, reader.uint32())
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
    object: Partial<UserValidatorPreferencesResponse>
  ): UserValidatorPreferencesResponse {
    const message = createBaseUserValidatorPreferencesResponse();
    message.preferences =
      object.preferences?.map((e) => ValidatorPreference.fromPartial(e)) || [];
    return message;
  },
  fromAmino(
    object: UserValidatorPreferencesResponseAmino
  ): UserValidatorPreferencesResponse {
    return {
      preferences: Array.isArray(object?.preferences)
        ? object.preferences.map((e: any) => ValidatorPreference.fromAmino(e))
        : [],
    };
  },
  toAmino(
    message: UserValidatorPreferencesResponse
  ): UserValidatorPreferencesResponseAmino {
    const obj: any = {};
    if (message.preferences) {
      obj.preferences = message.preferences.map((e) =>
        e ? ValidatorPreference.toAmino(e) : undefined
      );
    } else {
      obj.preferences = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: UserValidatorPreferencesResponseAminoMsg
  ): UserValidatorPreferencesResponse {
    return UserValidatorPreferencesResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: UserValidatorPreferencesResponse
  ): UserValidatorPreferencesResponseAminoMsg {
    return {
      type: "osmosis/valsetpref/user-validator-preferences-response",
      value: UserValidatorPreferencesResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: UserValidatorPreferencesResponseProtoMsg
  ): UserValidatorPreferencesResponse {
    return UserValidatorPreferencesResponse.decode(message.value);
  },
  toProto(message: UserValidatorPreferencesResponse): Uint8Array {
    return UserValidatorPreferencesResponse.encode(message).finish();
  },
  toProtoMsg(
    message: UserValidatorPreferencesResponse
  ): UserValidatorPreferencesResponseProtoMsg {
    return {
      typeUrl: "/osmosis.valsetpref.v1beta1.UserValidatorPreferencesResponse",
      value: UserValidatorPreferencesResponse.encode(message).finish(),
    };
  },
};
