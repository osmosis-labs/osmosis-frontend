//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../../binary";
import {
  Coin,
  CoinAmino,
  CoinSDKType,
} from "../../../cosmos/base/v1beta1/coin";
export interface TrackedVolume {
  amount: Coin[];
}
export interface TrackedVolumeProtoMsg {
  typeUrl: "/osmosis.poolmanager.v1beta1.TrackedVolume";
  value: Uint8Array;
}
export interface TrackedVolumeAmino {
  amount: CoinAmino[];
}
export interface TrackedVolumeAminoMsg {
  type: "osmosis/poolmanager/tracked-volume";
  value: TrackedVolumeAmino;
}
export interface TrackedVolumeSDKType {
  amount: CoinSDKType[];
}
function createBaseTrackedVolume(): TrackedVolume {
  return {
    amount: [],
  };
}
export const TrackedVolume = {
  typeUrl: "/osmosis.poolmanager.v1beta1.TrackedVolume",
  encode(
    message: TrackedVolume,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    for (const v of message.amount) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): TrackedVolume {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTrackedVolume();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.amount.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<TrackedVolume>): TrackedVolume {
    const message = createBaseTrackedVolume();
    message.amount = object.amount?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: TrackedVolumeAmino): TrackedVolume {
    return {
      amount: Array.isArray(object?.amount)
        ? object.amount.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(message: TrackedVolume): TrackedVolumeAmino {
    const obj: any = {};
    if (message.amount) {
      obj.amount = message.amount.map((e) => (e ? Coin.toAmino(e) : undefined));
    } else {
      obj.amount = [];
    }
    return obj;
  },
  fromAminoMsg(object: TrackedVolumeAminoMsg): TrackedVolume {
    return TrackedVolume.fromAmino(object.value);
  },
  toAminoMsg(message: TrackedVolume): TrackedVolumeAminoMsg {
    return {
      type: "osmosis/poolmanager/tracked-volume",
      value: TrackedVolume.toAmino(message),
    };
  },
  fromProtoMsg(message: TrackedVolumeProtoMsg): TrackedVolume {
    return TrackedVolume.decode(message.value);
  },
  toProto(message: TrackedVolume): Uint8Array {
    return TrackedVolume.encode(message).finish();
  },
  toProtoMsg(message: TrackedVolume): TrackedVolumeProtoMsg {
    return {
      typeUrl: "/osmosis.poolmanager.v1beta1.TrackedVolume",
      value: TrackedVolume.encode(message).finish(),
    };
  },
};
