import { Params, ParamsAmino, ParamsSDKType } from "./params";
import { Gauge, GaugeAmino, GaugeSDKType } from "./gauge";
import {
  Duration,
  DurationAmino,
  DurationSDKType,
} from "../../google/protobuf/duration";
import { Long } from "../../helpers";
import * as _m0 from "protobufjs/minimal";
/**
 * GenesisState defines the incentives module's various parameters when first
 * initialized
 */
export interface GenesisState {
  /** params are all the parameters of the module */
  params?: Params;
  /** gauges are all gauges that should exist at genesis */
  gauges: Gauge[];
  /**
   * lockable_durations are all lockup durations that gauges can be locked for
   * in order to recieve incentives
   */
  lockableDurations: Duration[];
  /**
   * last_gauge_id is what the gauge number will increment from when creating
   * the next gauge after genesis
   */
  lastGaugeId: Long;
}
export interface GenesisStateProtoMsg {
  typeUrl: "/osmosis.incentives.GenesisState";
  value: Uint8Array;
}
/**
 * GenesisState defines the incentives module's various parameters when first
 * initialized
 */
export interface GenesisStateAmino {
  /** params are all the parameters of the module */
  params?: ParamsAmino;
  /** gauges are all gauges that should exist at genesis */
  gauges: GaugeAmino[];
  /**
   * lockable_durations are all lockup durations that gauges can be locked for
   * in order to recieve incentives
   */
  lockable_durations: DurationAmino[];
  /**
   * last_gauge_id is what the gauge number will increment from when creating
   * the next gauge after genesis
   */
  last_gauge_id: string;
}
export interface GenesisStateAminoMsg {
  type: "osmosis/incentives/genesis-state";
  value: GenesisStateAmino;
}
/**
 * GenesisState defines the incentives module's various parameters when first
 * initialized
 */
export interface GenesisStateSDKType {
  params?: ParamsSDKType;
  gauges: GaugeSDKType[];
  lockable_durations: DurationSDKType[];
  last_gauge_id: Long;
}
function createBaseGenesisState(): GenesisState {
  return {
    params: undefined,
    gauges: [],
    lockableDurations: [],
    lastGaugeId: Long.UZERO,
  };
}
export const GenesisState = {
  typeUrl: "/osmosis.incentives.GenesisState",
  encode(
    message: GenesisState,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.gauges) {
      Gauge.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.lockableDurations) {
      Duration.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (!message.lastGaugeId.isZero()) {
      writer.uint32(32).uint64(message.lastGaugeId);
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
          message.params = Params.decode(reader, reader.uint32());
          break;
        case 2:
          message.gauges.push(Gauge.decode(reader, reader.uint32()));
          break;
        case 3:
          message.lockableDurations.push(
            Duration.decode(reader, reader.uint32())
          );
          break;
        case 4:
          message.lastGaugeId = reader.uint64() as Long;
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
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    message.gauges = object.gauges?.map((e) => Gauge.fromPartial(e)) || [];
    message.lockableDurations =
      object.lockableDurations?.map((e) => Duration.fromPartial(e)) || [];
    message.lastGaugeId =
      object.lastGaugeId !== undefined && object.lastGaugeId !== null
        ? Long.fromValue(object.lastGaugeId)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: GenesisStateAmino): GenesisState {
    return {
      params: object?.params ? Params.fromAmino(object.params) : undefined,
      gauges: Array.isArray(object?.gauges)
        ? object.gauges.map((e: any) => Gauge.fromAmino(e))
        : [],
      lockableDurations: Array.isArray(object?.lockable_durations)
        ? object.lockable_durations.map((e: any) => Duration.fromAmino(e))
        : [],
      lastGaugeId: Long.fromString(object.last_gauge_id),
    };
  },
  toAmino(message: GenesisState): GenesisStateAmino {
    const obj: any = {};
    obj.params = message.params ? Params.toAmino(message.params) : undefined;
    if (message.gauges) {
      obj.gauges = message.gauges.map((e) =>
        e ? Gauge.toAmino(e) : undefined
      );
    } else {
      obj.gauges = [];
    }
    if (message.lockableDurations) {
      obj.lockable_durations = message.lockableDurations.map((e) =>
        e ? Duration.toAmino(e) : undefined
      );
    } else {
      obj.lockable_durations = [];
    }
    obj.last_gauge_id = message.lastGaugeId
      ? message.lastGaugeId.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(object: GenesisStateAminoMsg): GenesisState {
    return GenesisState.fromAmino(object.value);
  },
  toAminoMsg(message: GenesisState): GenesisStateAminoMsg {
    return {
      type: "osmosis/incentives/genesis-state",
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
      typeUrl: "/osmosis.incentives.GenesisState",
      value: GenesisState.encode(message).finish(),
    };
  },
};
