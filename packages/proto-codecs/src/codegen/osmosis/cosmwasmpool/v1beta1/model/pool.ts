//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../../../binary";
export interface CosmWasmPool {
  $typeUrl?: string;
  contractAddress: string;
  poolId: bigint;
  codeId: bigint;
  instantiateMsg: Uint8Array;
}
export interface CosmWasmPoolProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool";
  value: Uint8Array;
}
export interface CosmWasmPoolAmino {
  contract_address: string;
  pool_id: string;
  code_id: string;
  instantiate_msg: Uint8Array;
}
export interface CosmWasmPoolAminoMsg {
  type: "osmosis/cosmwasmpool/cosm-wasm-pool";
  value: CosmWasmPoolAmino;
}
export interface CosmWasmPoolSDKType {
  $typeUrl?: string;
  contract_address: string;
  pool_id: bigint;
  code_id: bigint;
  instantiate_msg: Uint8Array;
}
function createBaseCosmWasmPool(): CosmWasmPool {
  return {
    $typeUrl: "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool",
    contractAddress: "",
    poolId: BigInt(0),
    codeId: BigInt(0),
    instantiateMsg: new Uint8Array(),
  };
}
export const CosmWasmPool = {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool",
  encode(
    message: CosmWasmPool,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.contractAddress !== "") {
      writer.uint32(10).string(message.contractAddress);
    }
    if (message.poolId !== BigInt(0)) {
      writer.uint32(16).uint64(message.poolId);
    }
    if (message.codeId !== BigInt(0)) {
      writer.uint32(24).uint64(message.codeId);
    }
    if (message.instantiateMsg.length !== 0) {
      writer.uint32(34).bytes(message.instantiateMsg);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): CosmWasmPool {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCosmWasmPool();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.contractAddress = reader.string();
          break;
        case 2:
          message.poolId = reader.uint64();
          break;
        case 3:
          message.codeId = reader.uint64();
          break;
        case 4:
          message.instantiateMsg = reader.bytes();
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
    message.contractAddress = object.contractAddress ?? "";
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? BigInt(object.poolId.toString())
        : BigInt(0);
    message.codeId =
      object.codeId !== undefined && object.codeId !== null
        ? BigInt(object.codeId.toString())
        : BigInt(0);
    message.instantiateMsg = object.instantiateMsg ?? new Uint8Array();
    return message;
  },
  fromAmino(object: CosmWasmPoolAmino): CosmWasmPool {
    return {
      contractAddress: object.contract_address,
      poolId: BigInt(object.pool_id),
      codeId: BigInt(object.code_id),
      instantiateMsg: object.instantiate_msg,
    };
  },
  toAmino(message: CosmWasmPool): CosmWasmPoolAmino {
    const obj: any = {};
    obj.contract_address = message.contractAddress;
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    obj.code_id = message.codeId ? message.codeId.toString() : undefined;
    obj.instantiate_msg = message.instantiateMsg;
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
