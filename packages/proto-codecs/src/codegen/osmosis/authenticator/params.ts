//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../binary";
/** Params defines the parameters for the module. */
export interface Params {
  maximumUnauthenticatedGas: bigint;
  areSmartAccountsActive: boolean;
}
export interface ParamsProtoMsg {
  typeUrl: "/osmosis.authenticator.Params";
  value: Uint8Array;
}
/** Params defines the parameters for the module. */
export interface ParamsAmino {
  maximum_unauthenticated_gas?: string;
  are_smart_accounts_active?: boolean;
}
export interface ParamsAminoMsg {
  type: "osmosis/authenticator/params";
  value: ParamsAmino;
}
/** Params defines the parameters for the module. */
export interface ParamsSDKType {
  maximum_unauthenticated_gas: bigint;
  are_smart_accounts_active: boolean;
}
function createBaseParams(): Params {
  return {
    maximumUnauthenticatedGas: BigInt(0),
    areSmartAccountsActive: false,
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
    if (message.areSmartAccountsActive === true) {
      writer.uint32(16).bool(message.areSmartAccountsActive);
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
          message.areSmartAccountsActive = reader.bool();
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
    message.areSmartAccountsActive = object.areSmartAccountsActive ?? false;
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    const message = createBaseParams();
    if (
      object.maximum_unauthenticated_gas !== undefined &&
      object.maximum_unauthenticated_gas !== null
    ) {
      message.maximumUnauthenticatedGas = BigInt(
        object.maximum_unauthenticated_gas
      );
    }
    if (
      object.are_smart_accounts_active !== undefined &&
      object.are_smart_accounts_active !== null
    ) {
      message.areSmartAccountsActive = object.are_smart_accounts_active;
    }
    return message;
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    obj.maximum_unauthenticated_gas =
      message.maximumUnauthenticatedGas !== BigInt(0)
        ? message.maximumUnauthenticatedGas.toString()
        : undefined;
    obj.are_smart_accounts_active =
      message.areSmartAccountsActive === false
        ? undefined
        : message.areSmartAccountsActive;
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
