//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../binary";
/** Params defines the parameters for the module. */
export interface Params {
  maximumUnauthenticatedGas: bigint;
  cosignerContract: string;
}
export interface ParamsProtoMsg {
  typeUrl: "/osmosis.authenticator.Params";
  value: Uint8Array;
}
/** Params defines the parameters for the module. */
export interface ParamsAmino {
  maximum_unauthenticated_gas: string;
  cosigner_contract: string;
}
export interface ParamsAminoMsg {
  type: "osmosis/authenticator/params";
  value: ParamsAmino;
}
/** Params defines the parameters for the module. */
export interface ParamsSDKType {
  maximum_unauthenticated_gas: bigint;
  cosigner_contract: string;
}
function createBaseParams(): Params {
  return {
    maximumUnauthenticatedGas: BigInt(0),
    cosignerContract: "",
  };
}
export const Params = {
  typeUrl: "/osmosis.authenticator.Params",
  encode(
    message: Params,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.maximumUnauthenticatedGas !== BigInt(0)) {
      writer.uint32(8).uint64(message.maximumUnauthenticatedGas);
    }
    if (message.cosignerContract !== "") {
      writer.uint32(18).string(message.cosignerContract);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Params {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.maximumUnauthenticatedGas = reader.uint64();
          break;
        case 2:
          message.cosignerContract = reader.string();
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
    message.maximumUnauthenticatedGas =
      object.maximumUnauthenticatedGas !== undefined &&
      object.maximumUnauthenticatedGas !== null
        ? BigInt(object.maximumUnauthenticatedGas.toString())
        : BigInt(0);
    message.cosignerContract = object.cosignerContract ?? "";
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    return {
      maximumUnauthenticatedGas: BigInt(object.maximum_unauthenticated_gas),
      cosignerContract: object.cosigner_contract,
    };
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    obj.maximum_unauthenticated_gas = message.maximumUnauthenticatedGas
      ? message.maximumUnauthenticatedGas.toString()
      : undefined;
    obj.cosigner_contract = message.cosignerContract;
    return obj;
  },
  fromAminoMsg(object: ParamsAminoMsg): Params {
    return Params.fromAmino(object.value);
  },
  toAminoMsg(message: Params): ParamsAminoMsg {
    return {
      type: "osmosis/authenticator/params",
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
      typeUrl: "/osmosis.authenticator.Params",
      value: Params.encode(message).finish(),
    };
  },
};
