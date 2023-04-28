import * as _m0 from "protobufjs/minimal";
/** Params defines the parameters for the ibc-rate-limit module. */
export interface Params {
  contractAddress: string;
}
export interface ParamsProtoMsg {
  typeUrl: "/osmosis.ibcratelimit.v1beta1.Params";
  value: Uint8Array;
}
/** Params defines the parameters for the ibc-rate-limit module. */
export interface ParamsAmino {
  contract_address: string;
}
export interface ParamsAminoMsg {
  type: "osmosis/ibcratelimit/params";
  value: ParamsAmino;
}
/** Params defines the parameters for the ibc-rate-limit module. */
export interface ParamsSDKType {
  contract_address: string;
}
function createBaseParams(): Params {
  return {
    contractAddress: "",
  };
}
export const Params = {
  typeUrl: "/osmosis.ibcratelimit.v1beta1.Params",
  encode(
    message: Params,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.contractAddress !== "") {
      writer.uint32(10).string(message.contractAddress);
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
          message.contractAddress = reader.string();
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
    message.contractAddress = object.contractAddress ?? "";
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    return {
      contractAddress: object.contract_address,
    };
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    obj.contract_address = message.contractAddress;
    return obj;
  },
  fromAminoMsg(object: ParamsAminoMsg): Params {
    return Params.fromAmino(object.value);
  },
  toAminoMsg(message: Params): ParamsAminoMsg {
    return {
      type: "osmosis/ibcratelimit/params",
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
      typeUrl: "/osmosis.ibcratelimit.v1beta1.Params",
      value: Params.encode(message).finish(),
    };
  },
};
