import { Any } from "../../../google/protobuf/any";
import * as _m0 from "protobufjs/minimal";
import { isSet, DeepPartial } from "@osmonauts/helpers";

/**
 * MsgGrantAllowance adds permission for Grantee to spend up to Allowance
 * of fees from the account of Granter.
 */
export interface MsgGrantAllowance {
  /** granter is the address of the user granting an allowance of their funds. */
  granter: string;

  /** grantee is the address of the user being granted an allowance of another user's funds. */
  grantee: string;

  /** allowance can be any of basic, periodic, allowed fee allowance. */
  allowance: Any;
}

/** MsgGrantAllowanceResponse defines the Msg/GrantAllowanceResponse response type. */
export interface MsgGrantAllowanceResponse {}

/** MsgRevokeAllowance removes any existing Allowance from Granter to Grantee. */
export interface MsgRevokeAllowance {
  /** granter is the address of the user granting an allowance of their funds. */
  granter: string;

  /** grantee is the address of the user being granted an allowance of another user's funds. */
  grantee: string;
}

/** MsgRevokeAllowanceResponse defines the Msg/RevokeAllowanceResponse response type. */
export interface MsgRevokeAllowanceResponse {}

function createBaseMsgGrantAllowance(): MsgGrantAllowance {
  return {
    granter: "",
    grantee: "",
    allowance: undefined
  };
}

export const MsgGrantAllowance = {
  encode(message: MsgGrantAllowance, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.granter !== "") {
      writer.uint32(10).string(message.granter);
    }

    if (message.grantee !== "") {
      writer.uint32(18).string(message.grantee);
    }

    if (message.allowance !== undefined) {
      Any.encode(message.allowance, writer.uint32(26).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgGrantAllowance {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgGrantAllowance();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.granter = reader.string();
          break;

        case 2:
          message.grantee = reader.string();
          break;

        case 3:
          message.allowance = Any.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): MsgGrantAllowance {
    return {
      granter: isSet(object.granter) ? String(object.granter) : "",
      grantee: isSet(object.grantee) ? String(object.grantee) : "",
      allowance: isSet(object.allowance) ? Any.fromJSON(object.allowance) : undefined
    };
  },

  toJSON(message: MsgGrantAllowance): unknown {
    const obj: any = {};
    message.granter !== undefined && (obj.granter = message.granter);
    message.grantee !== undefined && (obj.grantee = message.grantee);
    message.allowance !== undefined && (obj.allowance = message.allowance ? Any.toJSON(message.allowance) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<MsgGrantAllowance>): MsgGrantAllowance {
    const message = createBaseMsgGrantAllowance();
    message.granter = object.granter ?? "";
    message.grantee = object.grantee ?? "";
    message.allowance = object.allowance !== undefined && object.allowance !== null ? Any.fromPartial(object.allowance) : undefined;
    return message;
  }

};

function createBaseMsgGrantAllowanceResponse(): MsgGrantAllowanceResponse {
  return {};
}

export const MsgGrantAllowanceResponse = {
  encode(_: MsgGrantAllowanceResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgGrantAllowanceResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgGrantAllowanceResponse();

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

  fromJSON(_: any): MsgGrantAllowanceResponse {
    return {};
  },

  toJSON(_: MsgGrantAllowanceResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<MsgGrantAllowanceResponse>): MsgGrantAllowanceResponse {
    const message = createBaseMsgGrantAllowanceResponse();
    return message;
  }

};

function createBaseMsgRevokeAllowance(): MsgRevokeAllowance {
  return {
    granter: "",
    grantee: ""
  };
}

export const MsgRevokeAllowance = {
  encode(message: MsgRevokeAllowance, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.granter !== "") {
      writer.uint32(10).string(message.granter);
    }

    if (message.grantee !== "") {
      writer.uint32(18).string(message.grantee);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRevokeAllowance {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRevokeAllowance();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.granter = reader.string();
          break;

        case 2:
          message.grantee = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): MsgRevokeAllowance {
    return {
      granter: isSet(object.granter) ? String(object.granter) : "",
      grantee: isSet(object.grantee) ? String(object.grantee) : ""
    };
  },

  toJSON(message: MsgRevokeAllowance): unknown {
    const obj: any = {};
    message.granter !== undefined && (obj.granter = message.granter);
    message.grantee !== undefined && (obj.grantee = message.grantee);
    return obj;
  },

  fromPartial(object: DeepPartial<MsgRevokeAllowance>): MsgRevokeAllowance {
    const message = createBaseMsgRevokeAllowance();
    message.granter = object.granter ?? "";
    message.grantee = object.grantee ?? "";
    return message;
  }

};

function createBaseMsgRevokeAllowanceResponse(): MsgRevokeAllowanceResponse {
  return {};
}

export const MsgRevokeAllowanceResponse = {
  encode(_: MsgRevokeAllowanceResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgRevokeAllowanceResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgRevokeAllowanceResponse();

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

  fromJSON(_: any): MsgRevokeAllowanceResponse {
    return {};
  },

  toJSON(_: MsgRevokeAllowanceResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<MsgRevokeAllowanceResponse>): MsgRevokeAllowanceResponse {
    const message = createBaseMsgRevokeAllowanceResponse();
    return message;
  }

};