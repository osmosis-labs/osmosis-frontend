import { Downtime, downtimeFromJSON } from "./downtime_duration";
import { Timestamp } from "../../../google/protobuf/timestamp";
import * as _m0 from "protobufjs/minimal";
import { toTimestamp, fromTimestamp, isSet } from "../../../helpers";
export interface GenesisDowntimeEntry {
  duration: Downtime;
  lastDowntime?: Date;
}
export interface GenesisDowntimeEntryProtoMsg {
  typeUrl: "/osmosis.downtimedetector.v1beta1.GenesisDowntimeEntry";
  value: Uint8Array;
}
export interface GenesisDowntimeEntryAmino {
  duration: Downtime;
  last_downtime?: Date;
}
export interface GenesisDowntimeEntryAminoMsg {
  type: "osmosis/downtimedetector/genesis-downtime-entry";
  value: GenesisDowntimeEntryAmino;
}
export interface GenesisDowntimeEntrySDKType {
  duration: Downtime;
  last_downtime?: Date;
}
/** GenesisState defines the twap module's genesis state. */
export interface GenesisState {
  downtimes: GenesisDowntimeEntry[];
  lastBlockTime?: Date;
}
export interface GenesisStateProtoMsg {
  typeUrl: "/osmosis.downtimedetector.v1beta1.GenesisState";
  value: Uint8Array;
}
/** GenesisState defines the twap module's genesis state. */
export interface GenesisStateAmino {
  downtimes: GenesisDowntimeEntryAmino[];
  last_block_time?: Date;
}
export interface GenesisStateAminoMsg {
  type: "osmosis/downtimedetector/genesis-state";
  value: GenesisStateAmino;
}
/** GenesisState defines the twap module's genesis state. */
export interface GenesisStateSDKType {
  downtimes: GenesisDowntimeEntrySDKType[];
  last_block_time?: Date;
}
function createBaseGenesisDowntimeEntry(): GenesisDowntimeEntry {
  return {
    duration: 0,
    lastDowntime: undefined,
  };
}
export const GenesisDowntimeEntry = {
  typeUrl: "/osmosis.downtimedetector.v1beta1.GenesisDowntimeEntry",
  encode(
    message: GenesisDowntimeEntry,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.duration !== 0) {
      writer.uint32(8).int32(message.duration);
    }
    if (message.lastDowntime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.lastDowntime),
        writer.uint32(18).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): GenesisDowntimeEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisDowntimeEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.duration = reader.int32() as any;
          break;
        case 2:
          message.lastDowntime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<GenesisDowntimeEntry>): GenesisDowntimeEntry {
    const message = createBaseGenesisDowntimeEntry();
    message.duration = object.duration ?? 0;
    message.lastDowntime = object.lastDowntime ?? undefined;
    return message;
  },
  fromAmino(object: GenesisDowntimeEntryAmino): GenesisDowntimeEntry {
    return {
      duration: isSet(object.duration) ? downtimeFromJSON(object.duration) : 0,
      lastDowntime: object?.last_downtime
        ? Timestamp.fromAmino(object.last_downtime)
        : undefined,
    };
  },
  toAmino(message: GenesisDowntimeEntry): GenesisDowntimeEntryAmino {
    const obj: any = {};
    obj.duration = message.duration;
    obj.last_downtime = message.lastDowntime
      ? Timestamp.toAmino(message.lastDowntime)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: GenesisDowntimeEntryAminoMsg): GenesisDowntimeEntry {
    return GenesisDowntimeEntry.fromAmino(object.value);
  },
  toAminoMsg(message: GenesisDowntimeEntry): GenesisDowntimeEntryAminoMsg {
    return {
      type: "osmosis/downtimedetector/genesis-downtime-entry",
      value: GenesisDowntimeEntry.toAmino(message),
    };
  },
  fromProtoMsg(message: GenesisDowntimeEntryProtoMsg): GenesisDowntimeEntry {
    return GenesisDowntimeEntry.decode(message.value);
  },
  toProto(message: GenesisDowntimeEntry): Uint8Array {
    return GenesisDowntimeEntry.encode(message).finish();
  },
  toProtoMsg(message: GenesisDowntimeEntry): GenesisDowntimeEntryProtoMsg {
    return {
      typeUrl: "/osmosis.downtimedetector.v1beta1.GenesisDowntimeEntry",
      value: GenesisDowntimeEntry.encode(message).finish(),
    };
  },
};
function createBaseGenesisState(): GenesisState {
  return {
    downtimes: [],
    lastBlockTime: undefined,
  };
}
export const GenesisState = {
  typeUrl: "/osmosis.downtimedetector.v1beta1.GenesisState",
  encode(
    message: GenesisState,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.downtimes) {
      GenesisDowntimeEntry.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.lastBlockTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.lastBlockTime),
        writer.uint32(18).fork()
      ).ldelim();
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
          message.downtimes.push(
            GenesisDowntimeEntry.decode(reader, reader.uint32())
          );
          break;
        case 2:
          message.lastBlockTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
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
    message.downtimes =
      object.downtimes?.map((e) => GenesisDowntimeEntry.fromPartial(e)) || [];
    message.lastBlockTime = object.lastBlockTime ?? undefined;
    return message;
  },
  fromAmino(object: GenesisStateAmino): GenesisState {
    return {
      downtimes: Array.isArray(object?.downtimes)
        ? object.downtimes.map((e: any) => GenesisDowntimeEntry.fromAmino(e))
        : [],
      lastBlockTime: object?.last_block_time
        ? Timestamp.fromAmino(object.last_block_time)
        : undefined,
    };
  },
  toAmino(message: GenesisState): GenesisStateAmino {
    const obj: any = {};
    if (message.downtimes) {
      obj.downtimes = message.downtimes.map((e) =>
        e ? GenesisDowntimeEntry.toAmino(e) : undefined
      );
    } else {
      obj.downtimes = [];
    }
    obj.last_block_time = message.lastBlockTime
      ? Timestamp.toAmino(message.lastBlockTime)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: GenesisStateAminoMsg): GenesisState {
    return GenesisState.fromAmino(object.value);
  },
  toAminoMsg(message: GenesisState): GenesisStateAminoMsg {
    return {
      type: "osmosis/downtimedetector/genesis-state",
      value: GenesisState.toAmino(message),
    };
  },
  fromProtoMsg(message: GenesisStateProtoMsg): GenesisState {
    return GenesisState.decode(message.value);
  },
  toProto(message: GenesisState): Uint8Array {
    return GenesisState.encode(message).finish();
  },
  toProtoMsg(message: GenesisState): GenesisStateProtoMsg {
    return {
      typeUrl: "/osmosis.downtimedetector.v1beta1.GenesisState",
      value: GenesisState.encode(message).finish(),
    };
  },
};
