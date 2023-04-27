//@ts-nocheck
/* eslint-disable */
import { Long } from "../../helpers";
import * as _m0 from "protobufjs/minimal";
/**
 * Capability defines an implementation of an object capability. The index
 * provided to a Capability must be globally unique.
 */
export interface Capability {
  index: Long;
}
export interface CapabilityProtoMsg {
  typeUrl: "/capability.v1.Capability";
  value: Uint8Array;
}
/**
 * Capability defines an implementation of an object capability. The index
 * provided to a Capability must be globally unique.
 */
export interface CapabilityAmino {
  index: string;
}
export interface CapabilityAminoMsg {
  type: "/capability.v1.Capability";
  value: CapabilityAmino;
}
/**
 * Capability defines an implementation of an object capability. The index
 * provided to a Capability must be globally unique.
 */
export interface CapabilitySDKType {
  index: Long;
}
/**
 * Owner defines a single capability owner. An owner is defined by the name of
 * capability and the module name.
 */
export interface Owner {
  module: string;
  name: string;
}
export interface OwnerProtoMsg {
  typeUrl: "/capability.v1.Owner";
  value: Uint8Array;
}
/**
 * Owner defines a single capability owner. An owner is defined by the name of
 * capability and the module name.
 */
export interface OwnerAmino {
  module: string;
  name: string;
}
export interface OwnerAminoMsg {
  type: "/capability.v1.Owner";
  value: OwnerAmino;
}
/**
 * Owner defines a single capability owner. An owner is defined by the name of
 * capability and the module name.
 */
export interface OwnerSDKType {
  module: string;
  name: string;
}
/**
 * CapabilityOwners defines a set of owners of a single Capability. The set of
 * owners must be unique.
 */
export interface CapabilityOwners {
  owners: Owner[];
}
export interface CapabilityOwnersProtoMsg {
  typeUrl: "/capability.v1.CapabilityOwners";
  value: Uint8Array;
}
/**
 * CapabilityOwners defines a set of owners of a single Capability. The set of
 * owners must be unique.
 */
export interface CapabilityOwnersAmino {
  owners: OwnerAmino[];
}
export interface CapabilityOwnersAminoMsg {
  type: "/capability.v1.CapabilityOwners";
  value: CapabilityOwnersAmino;
}
/**
 * CapabilityOwners defines a set of owners of a single Capability. The set of
 * owners must be unique.
 */
export interface CapabilityOwnersSDKType {
  owners: OwnerSDKType[];
}
function createBaseCapability(): Capability {
  return {
    index: Long.UZERO,
  };
}
export const Capability = {
  typeUrl: "/capability.v1.Capability",
  encode(
    message: Capability,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.index.isZero()) {
      writer.uint32(8).uint64(message.index);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Capability {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCapability();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.index = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Capability>): Capability {
    const message = createBaseCapability();
    message.index =
      object.index !== undefined && object.index !== null
        ? Long.fromValue(object.index)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: CapabilityAmino): Capability {
    return {
      index: Long.fromString(object.index),
    };
  },
  toAmino(message: Capability): CapabilityAmino {
    const obj: any = {};
    obj.index = message.index ? message.index.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: CapabilityAminoMsg): Capability {
    return Capability.fromAmino(object.value);
  },
  fromProtoMsg(message: CapabilityProtoMsg): Capability {
    return Capability.decode(message.value);
  },
  toProto(message: Capability): Uint8Array {
    return Capability.encode(message).finish();
  },
  toProtoMsg(message: Capability): CapabilityProtoMsg {
    return {
      typeUrl: "/capability.v1.Capability",
      value: Capability.encode(message).finish(),
    };
  },
};
function createBaseOwner(): Owner {
  return {
    module: "",
    name: "",
  };
}
export const Owner = {
  typeUrl: "/capability.v1.Owner",
  encode(message: Owner, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.module !== "") {
      writer.uint32(10).string(message.module);
    }
    if (message.name !== "") {
      writer.uint32(18).string(message.name);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Owner {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOwner();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.module = reader.string();
          break;
        case 2:
          message.name = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Owner>): Owner {
    const message = createBaseOwner();
    message.module = object.module ?? "";
    message.name = object.name ?? "";
    return message;
  },
  fromAmino(object: OwnerAmino): Owner {
    return {
      module: object.module,
      name: object.name,
    };
  },
  toAmino(message: Owner): OwnerAmino {
    const obj: any = {};
    obj.module = message.module;
    obj.name = message.name;
    return obj;
  },
  fromAminoMsg(object: OwnerAminoMsg): Owner {
    return Owner.fromAmino(object.value);
  },
  fromProtoMsg(message: OwnerProtoMsg): Owner {
    return Owner.decode(message.value);
  },
  toProto(message: Owner): Uint8Array {
    return Owner.encode(message).finish();
  },
  toProtoMsg(message: Owner): OwnerProtoMsg {
    return {
      typeUrl: "/capability.v1.Owner",
      value: Owner.encode(message).finish(),
    };
  },
};
function createBaseCapabilityOwners(): CapabilityOwners {
  return {
    owners: [],
  };
}
export const CapabilityOwners = {
  typeUrl: "/capability.v1.CapabilityOwners",
  encode(
    message: CapabilityOwners,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.owners) {
      Owner.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): CapabilityOwners {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCapabilityOwners();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.owners.push(Owner.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<CapabilityOwners>): CapabilityOwners {
    const message = createBaseCapabilityOwners();
    message.owners = object.owners?.map((e) => Owner.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: CapabilityOwnersAmino): CapabilityOwners {
    return {
      owners: Array.isArray(object?.owners)
        ? object.owners.map((e: any) => Owner.fromAmino(e))
        : [],
    };
  },
  toAmino(message: CapabilityOwners): CapabilityOwnersAmino {
    const obj: any = {};
    if (message.owners) {
      obj.owners = message.owners.map((e) =>
        e ? Owner.toAmino(e) : undefined
      );
    } else {
      obj.owners = [];
    }
    return obj;
  },
  fromAminoMsg(object: CapabilityOwnersAminoMsg): CapabilityOwners {
    return CapabilityOwners.fromAmino(object.value);
  },
  fromProtoMsg(message: CapabilityOwnersProtoMsg): CapabilityOwners {
    return CapabilityOwners.decode(message.value);
  },
  toProto(message: CapabilityOwners): Uint8Array {
    return CapabilityOwners.encode(message).finish();
  },
  toProtoMsg(message: CapabilityOwners): CapabilityOwnersProtoMsg {
    return {
      typeUrl: "/capability.v1.CapabilityOwners",
      value: CapabilityOwners.encode(message).finish(),
    };
  },
};
