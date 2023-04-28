import { Long } from "../../helpers";
import * as _m0 from "protobufjs/minimal";
export interface Params {
  /**
   * authorized_tick_spacing is an array of uint64s that represents the tick
   * spacing values concentrated-liquidity pools can be created with. For
   * example, an authorized_tick_spacing of [1, 10, 30] allows for pools
   * to be created with tick spacing of 1, 10, or 30.
   */
  authorizedTickSpacing: Long[];
  authorizedSwapFees: string[];
}
export interface ParamsProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.Params";
  value: Uint8Array;
}
export interface ParamsAmino {
  /**
   * authorized_tick_spacing is an array of uint64s that represents the tick
   * spacing values concentrated-liquidity pools can be created with. For
   * example, an authorized_tick_spacing of [1, 10, 30] allows for pools
   * to be created with tick spacing of 1, 10, or 30.
   */
  authorized_tick_spacing: string[];
  authorized_swap_fees: string[];
}
export interface ParamsAminoMsg {
  type: "osmosis/concentratedliquidity/params";
  value: ParamsAmino;
}
export interface ParamsSDKType {
  authorized_tick_spacing: Long[];
  authorized_swap_fees: string[];
}
function createBaseParams(): Params {
  return {
    authorizedTickSpacing: [],
    authorizedSwapFees: [],
  };
}
export const Params = {
  typeUrl: "/osmosis.concentratedliquidity.Params",
  encode(
    message: Params,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.authorizedTickSpacing) {
      writer.uint64(v);
    }
    writer.ldelim();
    for (const v of message.authorizedSwapFees) {
      writer.uint32(18).string(v!);
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
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.authorizedTickSpacing.push(reader.uint64() as Long);
            }
          } else {
            message.authorizedTickSpacing.push(reader.uint64() as Long);
          }
          break;
        case 2:
          message.authorizedSwapFees.push(reader.string());
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
    message.authorizedTickSpacing =
      object.authorizedTickSpacing?.map((e) => Long.fromValue(e)) || [];
    message.authorizedSwapFees = object.authorizedSwapFees?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    return {
      authorizedTickSpacing: Array.isArray(object?.authorized_tick_spacing)
        ? object.authorized_tick_spacing.map((e: any) => e)
        : [],
      authorizedSwapFees: Array.isArray(object?.authorized_swap_fees)
        ? object.authorized_swap_fees.map((e: any) => e)
        : [],
    };
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    if (message.authorizedTickSpacing) {
      obj.authorized_tick_spacing = message.authorizedTickSpacing.map((e) => e);
    } else {
      obj.authorized_tick_spacing = [];
    }
    if (message.authorizedSwapFees) {
      obj.authorized_swap_fees = message.authorizedSwapFees.map((e) => e);
    } else {
      obj.authorized_swap_fees = [];
    }
    return obj;
  },
  fromAminoMsg(object: ParamsAminoMsg): Params {
    return Params.fromAmino(object.value);
  },
  toAminoMsg(message: Params): ParamsAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/params",
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
      typeUrl: "/osmosis.concentratedliquidity.Params",
      value: Params.encode(message).finish(),
    };
  },
};
