import { Plan } from "./upgrade";
import * as _m0 from "protobufjs/minimal";
import { isSet, DeepPartial } from "@osmonauts/helpers";

/**
 * MsgSoftwareUpgrade is the Msg/SoftwareUpgrade request type.
 * 
 * Since: cosmos-sdk 0.46
 */
export interface MsgSoftwareUpgrade {
  /** authority is the address of the governance account. */
  authority: string;

  /** plan is the upgrade plan. */
  plan: Plan;
}

/**
 * MsgSoftwareUpgradeResponse is the Msg/SoftwareUpgrade response type.
 * 
 * Since: cosmos-sdk 0.46
 */
export interface MsgSoftwareUpgradeResponse {}

/**
 * MsgCancelUpgrade is the Msg/CancelUpgrade request type.
 * 
 * Since: cosmos-sdk 0.46
 */
export interface MsgCancelUpgrade {
  /** authority is the address of the governance account. */
  authority: string;
}

/**
 * MsgCancelUpgradeResponse is the Msg/CancelUpgrade response type.
 * 
 * Since: cosmos-sdk 0.46
 */
export interface MsgCancelUpgradeResponse {}

function createBaseMsgSoftwareUpgrade(): MsgSoftwareUpgrade {
  return {
    authority: "",
    plan: undefined
  };
}

export const MsgSoftwareUpgrade = {
  encode(message: MsgSoftwareUpgrade, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.authority !== "") {
      writer.uint32(10).string(message.authority);
    }

    if (message.plan !== undefined) {
      Plan.encode(message.plan, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSoftwareUpgrade {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSoftwareUpgrade();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;

        case 2:
          message.plan = Plan.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): MsgSoftwareUpgrade {
    return {
      authority: isSet(object.authority) ? String(object.authority) : "",
      plan: isSet(object.plan) ? Plan.fromJSON(object.plan) : undefined
    };
  },

  toJSON(message: MsgSoftwareUpgrade): unknown {
    const obj: any = {};
    message.authority !== undefined && (obj.authority = message.authority);
    message.plan !== undefined && (obj.plan = message.plan ? Plan.toJSON(message.plan) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<MsgSoftwareUpgrade>): MsgSoftwareUpgrade {
    const message = createBaseMsgSoftwareUpgrade();
    message.authority = object.authority ?? "";
    message.plan = object.plan !== undefined && object.plan !== null ? Plan.fromPartial(object.plan) : undefined;
    return message;
  }

};

function createBaseMsgSoftwareUpgradeResponse(): MsgSoftwareUpgradeResponse {
  return {};
}

export const MsgSoftwareUpgradeResponse = {
  encode(_: MsgSoftwareUpgradeResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgSoftwareUpgradeResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgSoftwareUpgradeResponse();

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

  fromJSON(_: any): MsgSoftwareUpgradeResponse {
    return {};
  },

  toJSON(_: MsgSoftwareUpgradeResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<MsgSoftwareUpgradeResponse>): MsgSoftwareUpgradeResponse {
    const message = createBaseMsgSoftwareUpgradeResponse();
    return message;
  }

};

function createBaseMsgCancelUpgrade(): MsgCancelUpgrade {
  return {
    authority: ""
  };
}

export const MsgCancelUpgrade = {
  encode(message: MsgCancelUpgrade, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.authority !== "") {
      writer.uint32(10).string(message.authority);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCancelUpgrade {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCancelUpgrade();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.authority = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): MsgCancelUpgrade {
    return {
      authority: isSet(object.authority) ? String(object.authority) : ""
    };
  },

  toJSON(message: MsgCancelUpgrade): unknown {
    const obj: any = {};
    message.authority !== undefined && (obj.authority = message.authority);
    return obj;
  },

  fromPartial(object: DeepPartial<MsgCancelUpgrade>): MsgCancelUpgrade {
    const message = createBaseMsgCancelUpgrade();
    message.authority = object.authority ?? "";
    return message;
  }

};

function createBaseMsgCancelUpgradeResponse(): MsgCancelUpgradeResponse {
  return {};
}

export const MsgCancelUpgradeResponse = {
  encode(_: MsgCancelUpgradeResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MsgCancelUpgradeResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCancelUpgradeResponse();

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

  fromJSON(_: any): MsgCancelUpgradeResponse {
    return {};
  },

  toJSON(_: MsgCancelUpgradeResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<MsgCancelUpgradeResponse>): MsgCancelUpgradeResponse {
    const message = createBaseMsgCancelUpgradeResponse();
    return message;
  }

};