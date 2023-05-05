//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import { Long } from "../../../../helpers";
export interface CosmWasmPool {
  $typeUrl?: string;
  poolAddress: string;
  contractAddress: string;
  poolId: Long;
  codeId: Long;
}
export interface CosmWasmPoolProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool";
  value: Uint8Array;
}
export interface CosmWasmPoolAmino {
  pool_address: string;
  contract_address: string;
  pool_id: string;
  code_id: string;
}
export interface CosmWasmPoolAminoMsg {
  type: "osmosis/cosmwasmpool/cosm-wasm-pool";
  value: CosmWasmPoolAmino;
}
export interface CosmWasmPoolSDKType {
  $typeUrl?: string;
  pool_address: string;
  contract_address: string;
  pool_id: Long;
  code_id: Long;
}
function createBaseCosmWasmPool(): CosmWasmPool {
  return {
    $typeUrl: "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool",
    poolAddress: "",
    contractAddress: "",
    poolId: Long.UZERO,
    codeId: Long.UZERO,
  };
}
export const CosmWasmPool = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool",
  encode(
    message: CosmWasmPool,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.poolAddress !== "") {
      writer.uint32(10).string(message.poolAddress);
    }
    if (message.contractAddress !== "") {
      writer.uint32(18).string(message.contractAddress);
    }
    if (!message.poolId.isZero()) {
      writer.uint32(24).uint64(message.poolId);
    }
    if (!message.codeId.isZero()) {
      writer.uint32(32).uint64(message.codeId);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): CosmWasmPool {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCosmWasmPool();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolAddress = reader.string();
          break;
        case 2:
          message.contractAddress = reader.string();
          break;
        case 3:
          message.poolId = reader.uint64() as Long;
          break;
        case 4:
          message.codeId = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<CosmWasmPool>): CosmWasmPool {
    const message = createBaseCosmWasmPool();
    message.poolAddress = object.poolAddress ?? "";
    message.contractAddress = object.contractAddress ?? "";
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    message.codeId =
      object.codeId !== undefined && object.codeId !== null
        ? Long.fromValue(object.codeId)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: CosmWasmPoolAmino): CosmWasmPool {
    return {
      poolAddress: object.pool_address,
      contractAddress: object.contract_address,
      poolId: Long.fromString(object.pool_id),
      codeId: Long.fromString(object.code_id),
    };
  },
  toAmino(message: CosmWasmPool): CosmWasmPoolAmino {
    const obj: any = {};
    obj.pool_address = message.poolAddress;
    obj.contract_address = message.contractAddress;
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.code_id = message.codeId ? message.codeId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: CosmWasmPoolAminoMsg): CosmWasmPool {
    return CosmWasmPool.fromAmino(object.value);
  },
  toAminoMsg(message: CosmWasmPool): CosmWasmPoolAminoMsg {
    return {
      type: "osmosis/cosmwasmpool/cosm-wasm-pool",
      value: CosmWasmPool.toAmino(message),
    };
  },
  fromProtoMsg(message: CosmWasmPoolProtoMsg): CosmWasmPool {
    return CosmWasmPool.decode(message.value);
  },
  toProto(message: CosmWasmPool): Uint8Array {
    return CosmWasmPool.encode(message).finish();
  },
  toProtoMsg(message: CosmWasmPool): CosmWasmPoolProtoMsg {
    return {
      typeUrl: "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool",
      value: CosmWasmPool.encode(message).finish(),
    };
  },
};
