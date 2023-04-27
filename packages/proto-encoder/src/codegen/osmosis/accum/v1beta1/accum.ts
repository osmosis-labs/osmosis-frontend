//@ts-nocheck
/* eslint-disable */
import {
  DecCoin,
  DecCoinAmino,
  DecCoinSDKType,
} from "../../../cosmos/base/v1beta1/coin";
import * as _m0 from "protobufjs/minimal";
export interface AccumulatorContent {
  accumValue: DecCoin[];
  totalShares: string;
}
export interface AccumulatorContentProtoMsg {
  typeUrl: "/osmosis.accum.v1beta1.AccumulatorContent";
  value: Uint8Array;
}
export interface AccumulatorContentAmino {
  accum_value: DecCoinAmino[];
  total_shares: string;
}
export interface AccumulatorContentAminoMsg {
  type: "osmosis/accum/accumulator-content";
  value: AccumulatorContentAmino;
}
export interface AccumulatorContentSDKType {
  accum_value: DecCoinSDKType[];
  total_shares: string;
}
export interface Options {}
export interface OptionsProtoMsg {
  typeUrl: "/osmosis.accum.v1beta1.Options";
  value: Uint8Array;
}
export interface OptionsAmino {}
export interface OptionsAminoMsg {
  type: "osmosis/accum/options";
  value: OptionsAmino;
}
export interface OptionsSDKType {}
export interface Record {
  numShares: string;
  initAccumValue: DecCoin[];
  unclaimedRewards: DecCoin[];
  options?: Options;
}
export interface RecordProtoMsg {
  typeUrl: "/osmosis.accum.v1beta1.Record";
  value: Uint8Array;
}
export interface RecordAmino {
  num_shares: string;
  init_accum_value: DecCoinAmino[];
  unclaimed_rewards: DecCoinAmino[];
  options?: OptionsAmino;
}
export interface RecordAminoMsg {
  type: "osmosis/accum/record";
  value: RecordAmino;
}
export interface RecordSDKType {
  num_shares: string;
  init_accum_value: DecCoinSDKType[];
  unclaimed_rewards: DecCoinSDKType[];
  options?: OptionsSDKType;
}
function createBaseAccumulatorContent(): AccumulatorContent {
  return {
    accumValue: [],
    totalShares: "",
  };
}
export const AccumulatorContent = {
  typeUrl: "/osmosis.accum.v1beta1.AccumulatorContent",
  encode(
    message: AccumulatorContent,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.accumValue) {
      DecCoin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.totalShares !== "") {
      writer.uint32(18).string(message.totalShares);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): AccumulatorContent {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAccumulatorContent();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.accumValue.push(DecCoin.decode(reader, reader.uint32()));
          break;
        case 2:
          message.totalShares = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<AccumulatorContent>): AccumulatorContent {
    const message = createBaseAccumulatorContent();
    message.accumValue =
      object.accumValue?.map((e) => DecCoin.fromPartial(e)) || [];
    message.totalShares = object.totalShares ?? "";
    return message;
  },
  fromAmino(object: AccumulatorContentAmino): AccumulatorContent {
    return {
      accumValue: Array.isArray(object?.accum_value)
        ? object.accum_value.map((e: any) => DecCoin.fromAmino(e))
        : [],
      totalShares: object.total_shares,
    };
  },
  toAmino(message: AccumulatorContent): AccumulatorContentAmino {
    const obj: any = {};
    if (message.accumValue) {
      obj.accum_value = message.accumValue.map((e) =>
        e ? DecCoin.toAmino(e) : undefined
      );
    } else {
      obj.accum_value = [];
    }
    obj.total_shares = message.totalShares;
    return obj;
  },
  fromAminoMsg(object: AccumulatorContentAminoMsg): AccumulatorContent {
    return AccumulatorContent.fromAmino(object.value);
  },
  toAminoMsg(message: AccumulatorContent): AccumulatorContentAminoMsg {
    return {
      type: "osmosis/accum/accumulator-content",
      value: AccumulatorContent.toAmino(message),
    };
  },
  fromProtoMsg(message: AccumulatorContentProtoMsg): AccumulatorContent {
    return AccumulatorContent.decode(message.value);
  },
  toProto(message: AccumulatorContent): Uint8Array {
    return AccumulatorContent.encode(message).finish();
  },
  toProtoMsg(message: AccumulatorContent): AccumulatorContentProtoMsg {
    return {
      typeUrl: "/osmosis.accum.v1beta1.AccumulatorContent",
      value: AccumulatorContent.encode(message).finish(),
    };
  },
};
function createBaseOptions(): Options {
  return {};
}
export const Options = {
  typeUrl: "/osmosis.accum.v1beta1.Options",
  encode(_: Options, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Options {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseOptions();
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
  fromPartial(_: Partial<Options>): Options {
    const message = createBaseOptions();
    return message;
  },
  fromAmino(_: OptionsAmino): Options {
    return {};
  },
  toAmino(_: Options): OptionsAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(object: OptionsAminoMsg): Options {
    return Options.fromAmino(object.value);
  },
  toAminoMsg(message: Options): OptionsAminoMsg {
    return {
      type: "osmosis/accum/options",
      value: Options.toAmino(message),
    };
  },
  fromProtoMsg(message: OptionsProtoMsg): Options {
    return Options.decode(message.value);
  },
  toProto(message: Options): Uint8Array {
    return Options.encode(message).finish();
  },
  toProtoMsg(message: Options): OptionsProtoMsg {
    return {
      typeUrl: "/osmosis.accum.v1beta1.Options",
      value: Options.encode(message).finish(),
    };
  },
};
function createBaseRecord(): Record {
  return {
    numShares: "",
    initAccumValue: [],
    unclaimedRewards: [],
    options: undefined,
  };
}
export const Record = {
  typeUrl: "/osmosis.accum.v1beta1.Record",
  encode(
    message: Record,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.numShares !== "") {
      writer.uint32(10).string(message.numShares);
    }
    for (const v of message.initAccumValue) {
      DecCoin.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.unclaimedRewards) {
      DecCoin.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.options !== undefined) {
      Options.encode(message.options, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Record {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRecord();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.numShares = reader.string();
          break;
        case 2:
          message.initAccumValue.push(DecCoin.decode(reader, reader.uint32()));
          break;
        case 3:
          message.unclaimedRewards.push(
            DecCoin.decode(reader, reader.uint32())
          );
          break;
        case 4:
          message.options = Options.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Record>): Record {
    const message = createBaseRecord();
    message.numShares = object.numShares ?? "";
    message.initAccumValue =
      object.initAccumValue?.map((e) => DecCoin.fromPartial(e)) || [];
    message.unclaimedRewards =
      object.unclaimedRewards?.map((e) => DecCoin.fromPartial(e)) || [];
    message.options =
      object.options !== undefined && object.options !== null
        ? Options.fromPartial(object.options)
        : undefined;
    return message;
  },
  fromAmino(object: RecordAmino): Record {
    return {
      numShares: object.num_shares,
      initAccumValue: Array.isArray(object?.init_accum_value)
        ? object.init_accum_value.map((e: any) => DecCoin.fromAmino(e))
        : [],
      unclaimedRewards: Array.isArray(object?.unclaimed_rewards)
        ? object.unclaimed_rewards.map((e: any) => DecCoin.fromAmino(e))
        : [],
      options: object?.options ? Options.fromAmino(object.options) : undefined,
    };
  },
  toAmino(message: Record): RecordAmino {
    const obj: any = {};
    obj.num_shares = message.numShares;
    if (message.initAccumValue) {
      obj.init_accum_value = message.initAccumValue.map((e) =>
        e ? DecCoin.toAmino(e) : undefined
      );
    } else {
      obj.init_accum_value = [];
    }
    if (message.unclaimedRewards) {
      obj.unclaimed_rewards = message.unclaimedRewards.map((e) =>
        e ? DecCoin.toAmino(e) : undefined
      );
    } else {
      obj.unclaimed_rewards = [];
    }
    obj.options = message.options
      ? Options.toAmino(message.options)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: RecordAminoMsg): Record {
    return Record.fromAmino(object.value);
  },
  toAminoMsg(message: Record): RecordAminoMsg {
    return {
      type: "osmosis/accum/record",
      value: Record.toAmino(message),
    };
  },
  fromProtoMsg(message: RecordProtoMsg): Record {
    return Record.decode(message.value);
  },
  toProto(message: Record): Uint8Array {
    return Record.encode(message).finish();
  },
  toProtoMsg(message: Record): RecordProtoMsg {
    return {
      typeUrl: "/osmosis.accum.v1beta1.Record",
      value: Record.encode(message).finish(),
    };
  },
};
