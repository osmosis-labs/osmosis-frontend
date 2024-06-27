//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../../binary";
/** Params defines the parameters for the module. */
export interface Params {
  /**
   * MaximumUnauthenticatedGas defines the maximum amount of gas that can be
   * used to authenticate a transaction in ante handler without having fee payer
   * authenticated.
   */
  maximumUnauthenticatedGas: bigint;
  /**
   * IsSmartAccountActive defines the state of the authenticator.
   * If set to false, the authenticator module will not be used
   * and the classic cosmos sdk authentication will be used instead.
   */
  isSmartAccountActive: boolean;
  /**
   * CircuitBreakerControllers defines list of addresses that are allowed to
   * set is_smart_account_active without going through governance.
   */
  circuitBreakerControllers: string[];
}
export interface ParamsProtoMsg {
  typeUrl: "/osmosis.smartaccount.v1beta1.Params";
  value: Uint8Array;
}
/** Params defines the parameters for the module. */
export interface ParamsAmino {
  /**
   * MaximumUnauthenticatedGas defines the maximum amount of gas that can be
   * used to authenticate a transaction in ante handler without having fee payer
   * authenticated.
   */
  maximum_unauthenticated_gas?: string;
  /**
   * IsSmartAccountActive defines the state of the authenticator.
   * If set to false, the authenticator module will not be used
   * and the classic cosmos sdk authentication will be used instead.
   */
  is_smart_account_active?: boolean;
  /**
   * CircuitBreakerControllers defines list of addresses that are allowed to
   * set is_smart_account_active without going through governance.
   */
  circuit_breaker_controllers?: string[];
}
export interface ParamsAminoMsg {
  type: "osmosis/smartaccount/params";
  value: ParamsAmino;
}
/** Params defines the parameters for the module. */
export interface ParamsSDKType {
  maximum_unauthenticated_gas: bigint;
  is_smart_account_active: boolean;
  circuit_breaker_controllers: string[];
}
function createBaseParams(): Params {
  return {
    maximumUnauthenticatedGas: BigInt(0),
    isSmartAccountActive: false,
    circuitBreakerControllers: [],
  };
}
export const Params = {
  typeUrl: "/osmosis.smartaccount.v1beta1.Params",
  encode(
    message: Params,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.maximumUnauthenticatedGas !== BigInt(0)) {
      writer.uint32(8).uint64(message.maximumUnauthenticatedGas);
    }
    if (message.isSmartAccountActive === true) {
      writer.uint32(16).bool(message.isSmartAccountActive);
    }
    for (const v of message.circuitBreakerControllers) {
      writer.uint32(26).string(v!);
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
          message.isSmartAccountActive = reader.bool();
          break;
        case 3:
          message.circuitBreakerControllers.push(reader.string());
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
    message.isSmartAccountActive = object.isSmartAccountActive ?? false;
    message.circuitBreakerControllers =
      object.circuitBreakerControllers?.map((e) => e) || [];
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
      object.is_smart_account_active !== undefined &&
      object.is_smart_account_active !== null
    ) {
      message.isSmartAccountActive = object.is_smart_account_active;
    }
    message.circuitBreakerControllers =
      object.circuit_breaker_controllers?.map((e) => e) || [];
    return message;
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    obj.maximum_unauthenticated_gas =
      message.maximumUnauthenticatedGas !== BigInt(0)
        ? message.maximumUnauthenticatedGas.toString()
        : undefined;
    obj.is_smart_account_active =
      message.isSmartAccountActive === false
        ? undefined
        : message.isSmartAccountActive;
    if (message.circuitBreakerControllers) {
      obj.circuit_breaker_controllers = message.circuitBreakerControllers.map(
        (e) => e
      );
    } else {
      obj.circuit_breaker_controllers = message.circuitBreakerControllers;
    }
    return obj;
  },
  fromAminoMsg(object: ParamsAminoMsg): Params {
    return Params.fromAmino(object.value);
  },
  toAminoMsg(message: Params): ParamsAminoMsg {
    return {
      type: "osmosis/smartaccount/params",
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
      typeUrl: "/osmosis.smartaccount.v1beta1.Params",
      value: Params.encode(message).finish(),
    };
  },
};
