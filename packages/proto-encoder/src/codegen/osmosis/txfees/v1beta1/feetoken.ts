import { Long } from "../../../helpers";
import * as _m0 from "protobufjs/minimal";
/**
 * FeeToken is a struct that specifies a coin denom, and pool ID pair.
 * This marks the token as eligible for use as a tx fee asset in Osmosis.
 * Its price in osmo is derived through looking at the provided pool ID.
 * The pool ID must have osmo as one of its assets.
 */
export interface FeeToken {
  denom: string;
  poolID: Long;
}
export interface FeeTokenProtoMsg {
  typeUrl: "/osmosis.txfees.v1beta1.FeeToken";
  value: Uint8Array;
}
/**
 * FeeToken is a struct that specifies a coin denom, and pool ID pair.
 * This marks the token as eligible for use as a tx fee asset in Osmosis.
 * Its price in osmo is derived through looking at the provided pool ID.
 * The pool ID must have osmo as one of its assets.
 */
export interface FeeTokenAmino {
  denom: string;
  poolID: string;
}
export interface FeeTokenAminoMsg {
  type: "osmosis/txfees/fee-token";
  value: FeeTokenAmino;
}
/**
 * FeeToken is a struct that specifies a coin denom, and pool ID pair.
 * This marks the token as eligible for use as a tx fee asset in Osmosis.
 * Its price in osmo is derived through looking at the provided pool ID.
 * The pool ID must have osmo as one of its assets.
 */
export interface FeeTokenSDKType {
  denom: string;
  poolID: Long;
}
function createBaseFeeToken(): FeeToken {
  return {
    denom: "",
    poolID: Long.UZERO,
  };
}
export const FeeToken = {
  typeUrl: "/osmosis.txfees.v1beta1.FeeToken",
  encode(
    message: FeeToken,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.denom !== "") {
      writer.uint32(10).string(message.denom);
    }
    if (!message.poolID.isZero()) {
      writer.uint32(16).uint64(message.poolID);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): FeeToken {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFeeToken();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.denom = reader.string();
          break;
        case 2:
          message.poolID = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<FeeToken>): FeeToken {
    const message = createBaseFeeToken();
    message.denom = object.denom ?? "";
    message.poolID =
      object.poolID !== undefined && object.poolID !== null
        ? Long.fromValue(object.poolID)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: FeeTokenAmino): FeeToken {
    return {
      denom: object.denom,
      poolID: Long.fromString(object.poolID),
    };
  },
  toAmino(message: FeeToken): FeeTokenAmino {
    const obj: any = {};
    obj.denom = message.denom;
    obj.poolID = message.poolID ? message.poolID.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: FeeTokenAminoMsg): FeeToken {
    return FeeToken.fromAmino(object.value);
  },
  toAminoMsg(message: FeeToken): FeeTokenAminoMsg {
    return {
      type: "osmosis/txfees/fee-token",
      value: FeeToken.toAmino(message),
    };
  },
  fromProtoMsg(message: FeeTokenProtoMsg): FeeToken {
    return FeeToken.decode(message.value);
  },
  toProto(message: FeeToken): Uint8Array {
    return FeeToken.encode(message).finish();
  },
  toProtoMsg(message: FeeToken): FeeTokenProtoMsg {
    return {
      typeUrl: "/osmosis.txfees.v1beta1.FeeToken",
      value: FeeToken.encode(message).finish(),
    };
  },
};
