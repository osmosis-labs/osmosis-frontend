import * as _m0 from "protobufjs/minimal";
/** Params holds parameters for the incentives module */
export interface Params {
  /**
   * distr_epoch_identifier is what epoch type distribution will be triggered by
   * (day, week, etc.)
   */
  distrEpochIdentifier: string;
}
export interface ParamsProtoMsg {
  typeUrl: "/osmosis.incentives.Params";
  value: Uint8Array;
}
/** Params holds parameters for the incentives module */
export interface ParamsAmino {
  /**
   * distr_epoch_identifier is what epoch type distribution will be triggered by
   * (day, week, etc.)
   */
  distr_epoch_identifier: string;
}
export interface ParamsAminoMsg {
  type: "osmosis/incentives/params";
  value: ParamsAmino;
}
/** Params holds parameters for the incentives module */
export interface ParamsSDKType {
  distr_epoch_identifier: string;
}
function createBaseParams(): Params {
  return {
    distrEpochIdentifier: "",
  };
}
export const Params = {
  typeUrl: "/osmosis.incentives.Params",
  encode(
    message: Params,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.distrEpochIdentifier !== "") {
      writer.uint32(10).string(message.distrEpochIdentifier);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Params {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.distrEpochIdentifier = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Params>): Params {
    const message = createBaseParams();
    message.distrEpochIdentifier = object.distrEpochIdentifier ?? "";
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    return {
      distrEpochIdentifier: object.distr_epoch_identifier,
    };
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    obj.distr_epoch_identifier = message.distrEpochIdentifier;
    return obj;
  },
  fromAminoMsg(object: ParamsAminoMsg): Params {
    return Params.fromAmino(object.value);
  },
  toAminoMsg(message: Params): ParamsAminoMsg {
    return {
      type: "osmosis/incentives/params",
      value: Params.toAmino(message),
    };
  },
  fromProtoMsg(message: ParamsProtoMsg): Params {
    return Params.decode(message.value);
  },
  toProto(message: Params): Uint8Array {
    return Params.encode(message).finish();
  },
  toProtoMsg(message: Params): ParamsProtoMsg {
    return {
      typeUrl: "/osmosis.incentives.Params",
      value: Params.encode(message).finish(),
    };
  },
};
