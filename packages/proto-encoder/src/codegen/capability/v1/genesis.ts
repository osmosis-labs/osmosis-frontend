import {
  CapabilityOwners,
  CapabilityOwnersAmino,
  CapabilityOwnersSDKType,
} from "./capability";
import { Long } from "../../helpers";
import * as _m0 from "protobufjs/minimal";
/** GenesisOwners defines the capability owners with their corresponding index. */
export interface GenesisOwners {
  /** index is the index of the capability owner. */
  index: Long;
  /** index_owners are the owners at the given index. */
  indexOwners?: CapabilityOwners;
}
export interface GenesisOwnersProtoMsg {
  typeUrl: "/capability.v1.GenesisOwners";
  value: Uint8Array;
}
/** GenesisOwners defines the capability owners with their corresponding index. */
export interface GenesisOwnersAmino {
  /** index is the index of the capability owner. */
  index: string;
  /** index_owners are the owners at the given index. */
  index_owners?: CapabilityOwnersAmino;
}
export interface GenesisOwnersAminoMsg {
  type: "/capability.v1.GenesisOwners";
  value: GenesisOwnersAmino;
}
/** GenesisOwners defines the capability owners with their corresponding index. */
export interface GenesisOwnersSDKType {
  index: Long;
  index_owners?: CapabilityOwnersSDKType;
}
/** GenesisState defines the capability module's genesis state. */
export interface GenesisState {
  /** index is the capability global index. */
  index: Long;
  /**
   * owners represents a map from index to owners of the capability index
   * index key is string to allow amino marshalling.
   */
  owners: GenesisOwners[];
}
export interface GenesisStateProtoMsg {
  typeUrl: "/capability.v1.GenesisState";
  value: Uint8Array;
}
/** GenesisState defines the capability module's genesis state. */
export interface GenesisStateAmino {
  /** index is the capability global index. */
  index: string;
  /**
   * owners represents a map from index to owners of the capability index
   * index key is string to allow amino marshalling.
   */
  owners: GenesisOwnersAmino[];
}
export interface GenesisStateAminoMsg {
  type: "/capability.v1.GenesisState";
  value: GenesisStateAmino;
}
/** GenesisState defines the capability module's genesis state. */
export interface GenesisStateSDKType {
  index: Long;
  owners: GenesisOwnersSDKType[];
}
function createBaseGenesisOwners(): GenesisOwners {
  return {
    index: Long.UZERO,
    indexOwners: undefined,
  };
}
export const GenesisOwners = {
  typeUrl: "/capability.v1.GenesisOwners",
  encode(
    message: GenesisOwners,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.index.isZero()) {
      writer.uint32(8).uint64(message.index);
    }
    if (message.indexOwners !== undefined) {
      CapabilityOwners.encode(
        message.indexOwners,
        writer.uint32(18).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): GenesisOwners {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisOwners();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.index = reader.uint64() as Long;
          break;
        case 2:
          message.indexOwners = CapabilityOwners.decode(
            reader,
            reader.uint32()
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<GenesisOwners>): GenesisOwners {
    const message = createBaseGenesisOwners();
    message.index =
      object.index !== undefined && object.index !== null
        ? Long.fromValue(object.index)
        : Long.UZERO;
    message.indexOwners =
      object.indexOwners !== undefined && object.indexOwners !== null
        ? CapabilityOwners.fromPartial(object.indexOwners)
        : undefined;
    return message;
  },
  fromAmino(object: GenesisOwnersAmino): GenesisOwners {
    return {
      index: Long.fromString(object.index),
      indexOwners: object?.index_owners
        ? CapabilityOwners.fromAmino(object.index_owners)
        : undefined,
    };
  },
  toAmino(message: GenesisOwners): GenesisOwnersAmino {
    const obj: any = {};
    obj.index = message.index ? message.index.toString() : undefined;
    obj.index_owners = message.indexOwners
      ? CapabilityOwners.toAmino(message.indexOwners)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: GenesisOwnersAminoMsg): GenesisOwners {
    return GenesisOwners.fromAmino(object.value);
  },
  fromProtoMsg(message: GenesisOwnersProtoMsg): GenesisOwners {
    return GenesisOwners.decode(message.value);
  },
  toProto(message: GenesisOwners): Uint8Array {
    return GenesisOwners.encode(message).finish();
  },
  toProtoMsg(message: GenesisOwners): GenesisOwnersProtoMsg {
    return {
      typeUrl: "/capability.v1.GenesisOwners",
      value: GenesisOwners.encode(message).finish(),
    };
  },
};
function createBaseGenesisState(): GenesisState {
  return {
    index: Long.UZERO,
    owners: [],
  };
}
export const GenesisState = {
  typeUrl: "/capability.v1.GenesisState",
  encode(
    message: GenesisState,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.index.isZero()) {
      writer.uint32(8).uint64(message.index);
    }
    for (const v of message.owners) {
      GenesisOwners.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): GenesisState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.index = reader.uint64() as Long;
          break;
        case 2:
          message.owners.push(GenesisOwners.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<GenesisState>): GenesisState {
    const message = createBaseGenesisState();
    message.index =
      object.index !== undefined && object.index !== null
        ? Long.fromValue(object.index)
        : Long.UZERO;
    message.owners =
      object.owners?.map((e) => GenesisOwners.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: GenesisStateAmino): GenesisState {
    return {
      index: Long.fromString(object.index),
      owners: Array.isArray(object?.owners)
        ? object.owners.map((e: any) => GenesisOwners.fromAmino(e))
        : [],
    };
  },
  toAmino(message: GenesisState): GenesisStateAmino {
    const obj: any = {};
    obj.index = message.index ? message.index.toString() : undefined;
    if (message.owners) {
      obj.owners = message.owners.map((e) =>
        e ? GenesisOwners.toAmino(e) : undefined
      );
    } else {
      obj.owners = [];
    }
    return obj;
  },
  fromAminoMsg(object: GenesisStateAminoMsg): GenesisState {
    return GenesisState.fromAmino(object.value);
  },
  fromProtoMsg(message: GenesisStateProtoMsg): GenesisState {
    return GenesisState.decode(message.value);
  },
  toProto(message: GenesisState): Uint8Array {
    return GenesisState.encode(message).finish();
  },
  toProtoMsg(message: GenesisState): GenesisStateProtoMsg {
    return {
      typeUrl: "/capability.v1.GenesisState",
      value: GenesisState.encode(message).finish(),
    };
  },
};
