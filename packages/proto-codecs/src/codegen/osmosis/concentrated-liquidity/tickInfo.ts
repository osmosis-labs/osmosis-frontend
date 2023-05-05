//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import {
  DecCoin,
  DecCoinAmino,
  DecCoinSDKType,
} from "../../cosmos/base/v1beta1/coin";
export interface TickInfo {
  liquidityGross: string;
  liquidityNet: string;
  feeGrowthOutside: DecCoin[];
  uptimeTrackers: UptimeTracker[];
}
export interface TickInfoProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.TickInfo";
  value: Uint8Array;
}
export interface TickInfoAmino {
  liquidity_gross: string;
  liquidity_net: string;
  fee_growth_outside: DecCoinAmino[];
  uptime_trackers: UptimeTrackerAmino[];
}
export interface TickInfoAminoMsg {
  type: "osmosis/concentratedliquidity/tick-info";
  value: TickInfoAmino;
}
export interface TickInfoSDKType {
  liquidity_gross: string;
  liquidity_net: string;
  fee_growth_outside: DecCoinSDKType[];
  uptime_trackers: UptimeTrackerSDKType[];
}
export interface UptimeTracker {
  uptimeGrowthOutside: DecCoin[];
}
export interface UptimeTrackerProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.UptimeTracker";
  value: Uint8Array;
}
export interface UptimeTrackerAmino {
  uptime_growth_outside: DecCoinAmino[];
}
export interface UptimeTrackerAminoMsg {
  type: "osmosis/concentratedliquidity/uptime-tracker";
  value: UptimeTrackerAmino;
}
export interface UptimeTrackerSDKType {
  uptime_growth_outside: DecCoinSDKType[];
}
function createBaseTickInfo(): TickInfo {
  return {
    liquidityGross: "",
    liquidityNet: "",
    feeGrowthOutside: [],
    uptimeTrackers: [],
  };
}
export const TickInfo = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.TickInfo",
  encode(
    message: TickInfo,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.liquidityGross !== "") {
      writer.uint32(10).string(message.liquidityGross);
    }
    if (message.liquidityNet !== "") {
      writer.uint32(18).string(message.liquidityNet);
    }
    for (const v of message.feeGrowthOutside) {
      DecCoin.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    for (const v of message.uptimeTrackers) {
      UptimeTracker.encode(v!, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): TickInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTickInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.liquidityGross = reader.string();
          break;
        case 2:
          message.liquidityNet = reader.string();
          break;
        case 3:
          message.feeGrowthOutside.push(
            DecCoin.decode(reader, reader.uint32())
          );
          break;
        case 4:
          message.uptimeTrackers.push(
            UptimeTracker.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<TickInfo>): TickInfo {
    const message = createBaseTickInfo();
    message.liquidityGross = object.liquidityGross ?? "";
    message.liquidityNet = object.liquidityNet ?? "";
    message.feeGrowthOutside =
      object.feeGrowthOutside?.map((e) => DecCoin.fromPartial(e)) || [];
    message.uptimeTrackers =
      object.uptimeTrackers?.map((e) => UptimeTracker.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: TickInfoAmino): TickInfo {
    return {
      liquidityGross: object.liquidity_gross,
      liquidityNet: object.liquidity_net,
      feeGrowthOutside: Array.isArray(object?.fee_growth_outside)
        ? object.fee_growth_outside.map((e: any) => DecCoin.fromAmino(e))
        : [],
      uptimeTrackers: Array.isArray(object?.uptime_trackers)
        ? object.uptime_trackers.map((e: any) => UptimeTracker.fromAmino(e))
        : [],
    };
  },
  toAmino(message: TickInfo): TickInfoAmino {
    const obj: any = {};
    obj.liquidity_gross = message.liquidityGross;
    obj.liquidity_net = message.liquidityNet;
    if (message.feeGrowthOutside) {
      obj.fee_growth_outside = message.feeGrowthOutside.map((e) =>
        e ? DecCoin.toAmino(e) : undefined
      );
    } else {
      obj.fee_growth_outside = [];
    }
    if (message.uptimeTrackers) {
      obj.uptime_trackers = message.uptimeTrackers.map((e) =>
        e ? UptimeTracker.toAmino(e) : undefined
      );
    } else {
      obj.uptime_trackers = [];
    }
    return obj;
  },
  fromAminoMsg(object: TickInfoAminoMsg): TickInfo {
    return TickInfo.fromAmino(object.value);
  },
  toAminoMsg(message: TickInfo): TickInfoAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/tick-info",
      value: TickInfo.toAmino(message),
    };
  },
  fromProtoMsg(message: TickInfoProtoMsg): TickInfo {
    return TickInfo.decode(message.value);
  },
  toProto(message: TickInfo): Uint8Array {
    return TickInfo.encode(message).finish();
  },
  toProtoMsg(message: TickInfo): TickInfoProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.TickInfo",
      value: TickInfo.encode(message).finish(),
    };
  },
};
function createBaseUptimeTracker(): UptimeTracker {
  return {
    uptimeGrowthOutside: [],
  };
}
export const UptimeTracker = {
  typeUrl: "/osmosis.concentratedliquidity.v1beta1.UptimeTracker",
  encode(
    message: UptimeTracker,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.uptimeGrowthOutside) {
      DecCoin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): UptimeTracker {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseUptimeTracker();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.uptimeGrowthOutside.push(
            DecCoin.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<UptimeTracker>): UptimeTracker {
    const message = createBaseUptimeTracker();
    message.uptimeGrowthOutside =
      object.uptimeGrowthOutside?.map((e) => DecCoin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: UptimeTrackerAmino): UptimeTracker {
    return {
      uptimeGrowthOutside: Array.isArray(object?.uptime_growth_outside)
        ? object.uptime_growth_outside.map((e: any) => DecCoin.fromAmino(e))
        : [],
    };
  },
  toAmino(message: UptimeTracker): UptimeTrackerAmino {
    const obj: any = {};
    if (message.uptimeGrowthOutside) {
      obj.uptime_growth_outside = message.uptimeGrowthOutside.map((e) =>
        e ? DecCoin.toAmino(e) : undefined
      );
    } else {
      obj.uptime_growth_outside = [];
    }
    return obj;
  },
  fromAminoMsg(object: UptimeTrackerAminoMsg): UptimeTracker {
    return UptimeTracker.fromAmino(object.value);
  },
  toAminoMsg(message: UptimeTracker): UptimeTrackerAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/uptime-tracker",
      value: UptimeTracker.toAmino(message),
    };
  },
  fromProtoMsg(message: UptimeTrackerProtoMsg): UptimeTracker {
    return UptimeTracker.decode(message.value);
  },
  toProto(message: UptimeTracker): Uint8Array {
    return UptimeTracker.encode(message).finish();
  },
  toProtoMsg(message: UptimeTracker): UptimeTrackerProtoMsg {
    return {
      typeUrl: "/osmosis.concentratedliquidity.v1beta1.UptimeTracker",
      value: UptimeTracker.encode(message).finish(),
    };
  },
};
