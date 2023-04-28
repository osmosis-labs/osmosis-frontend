import {
  Minter,
  MinterAmino,
  MinterSDKType,
  Params,
  ParamsAmino,
  ParamsSDKType,
} from "./mint";
import { Long } from "../../../helpers";
import * as _m0 from "protobufjs/minimal";
/** GenesisState defines the mint module's genesis state. */
export interface GenesisState {
  /** minter is an abstraction for holding current rewards information. */
  minter?: Minter;
  /** params defines all the paramaters of the mint module. */
  params?: Params;
  /**
   * reduction_started_epoch is the first epoch in which the reduction of mint
   * begins.
   */
  reductionStartedEpoch: Long;
}
export interface GenesisStateProtoMsg {
  typeUrl: "/osmosis.mint.v1beta1.GenesisState";
  value: Uint8Array;
}
/** GenesisState defines the mint module's genesis state. */
export interface GenesisStateAmino {
  /** minter is an abstraction for holding current rewards information. */
  minter?: MinterAmino;
  /** params defines all the paramaters of the mint module. */
  params?: ParamsAmino;
  /**
   * reduction_started_epoch is the first epoch in which the reduction of mint
   * begins.
   */
  reduction_started_epoch: string;
}
export interface GenesisStateAminoMsg {
  type: "osmosis/mint/genesis-state";
  value: GenesisStateAmino;
}
/** GenesisState defines the mint module's genesis state. */
export interface GenesisStateSDKType {
  minter?: MinterSDKType;
  params?: ParamsSDKType;
  reduction_started_epoch: Long;
}
function createBaseGenesisState(): GenesisState {
  return {
    minter: undefined,
    params: undefined,
    reductionStartedEpoch: Long.ZERO,
  };
}
export const GenesisState = {
  typeUrl: "/osmosis.mint.v1beta1.GenesisState",
  encode(
    message: GenesisState,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.minter !== undefined) {
      Minter.encode(message.minter, writer.uint32(10).fork()).ldelim();
    }
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(18).fork()).ldelim();
    }
    if (!message.reductionStartedEpoch.isZero()) {
      writer.uint32(24).int64(message.reductionStartedEpoch);
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
          message.minter = Minter.decode(reader, reader.uint32());
          break;
        case 2:
          message.params = Params.decode(reader, reader.uint32());
          break;
        case 3:
          message.reductionStartedEpoch = reader.int64() as Long;
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
    message.minter =
      object.minter !== undefined && object.minter !== null
        ? Minter.fromPartial(object.minter)
        : undefined;
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    message.reductionStartedEpoch =
      object.reductionStartedEpoch !== undefined &&
      object.reductionStartedEpoch !== null
        ? Long.fromValue(object.reductionStartedEpoch)
        : Long.ZERO;
    return message;
  },
  fromAmino(object: GenesisStateAmino): GenesisState {
    return {
      minter: object?.minter ? Minter.fromAmino(object.minter) : undefined,
      params: object?.params ? Params.fromAmino(object.params) : undefined,
      reductionStartedEpoch: Long.fromString(object.reduction_started_epoch),
    };
  },
  toAmino(message: GenesisState): GenesisStateAmino {
    const obj: any = {};
    obj.minter = message.minter ? Minter.toAmino(message.minter) : undefined;
    obj.params = message.params ? Params.toAmino(message.params) : undefined;
    obj.reduction_started_epoch = message.reductionStartedEpoch
      ? message.reductionStartedEpoch.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(object: GenesisStateAminoMsg): GenesisState {
    return GenesisState.fromAmino(object.value);
  },
  toAminoMsg(message: GenesisState): GenesisStateAminoMsg {
    return {
      type: "osmosis/mint/genesis-state",
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
      typeUrl: "/osmosis.mint.v1beta1.GenesisState",
      value: GenesisState.encode(message).finish(),
    };
  },
};
