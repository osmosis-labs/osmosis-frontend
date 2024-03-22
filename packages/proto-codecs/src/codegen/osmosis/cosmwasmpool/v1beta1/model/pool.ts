//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../../../binary";
import { base64FromBytes, bytesFromBase64 } from "../../../../helpers";
/**
 * CosmWasmPool represents the data serialized into state for each CW pool.
 *
 * Note: CW Pool has 2 pool models:
 * - CosmWasmPool which is a proto-generated store model used for serialization
 * into state.
 * - Pool struct that encapsulates the CosmWasmPool and wasmKeeper for calling
 * the contract.
 *
 * CosmWasmPool implements the poolmanager.PoolI interface but it panics on all
 * methods. The reason is that access to wasmKeeper is required to call the
 * contract.
 *
 * Instead, all interactions and poolmanager.PoolI methods are to be performed
 * on the Pool struct. The reason why we cannot have a Pool struct only is
 * because it cannot be serialized into state due to having a non-serializable
 * wasmKeeper field.
 */
export interface CosmWasmPool {
  $typeUrl?: "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool";
  contractAddress: string;
  poolId: bigint;
  codeId: bigint;
  instantiateMsg: Uint8Array;
}
export interface CosmWasmPoolProtoMsg {
  typeUrl: "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool";
  value: Uint8Array;
}
/**
 * CosmWasmPool represents the data serialized into state for each CW pool.
 *
 * Note: CW Pool has 2 pool models:
 * - CosmWasmPool which is a proto-generated store model used for serialization
 * into state.
 * - Pool struct that encapsulates the CosmWasmPool and wasmKeeper for calling
 * the contract.
 *
 * CosmWasmPool implements the poolmanager.PoolI interface but it panics on all
 * methods. The reason is that access to wasmKeeper is required to call the
 * contract.
 *
 * Instead, all interactions and poolmanager.PoolI methods are to be performed
 * on the Pool struct. The reason why we cannot have a Pool struct only is
 * because it cannot be serialized into state due to having a non-serializable
 * wasmKeeper field.
 */
export interface CosmWasmPoolAmino {
  contract_address?: string;
  pool_id?: string;
  code_id?: string;
  instantiate_msg?: string;
}
export interface CosmWasmPoolAminoMsg {
  type: "osmosis/cosmwasmpool/cosm-wasm-pool";
  value: CosmWasmPoolAmino;
}
/**
 * CosmWasmPool represents the data serialized into state for each CW pool.
 *
 * Note: CW Pool has 2 pool models:
 * - CosmWasmPool which is a proto-generated store model used for serialization
 * into state.
 * - Pool struct that encapsulates the CosmWasmPool and wasmKeeper for calling
 * the contract.
 *
 * CosmWasmPool implements the poolmanager.PoolI interface but it panics on all
 * methods. The reason is that access to wasmKeeper is required to call the
 * contract.
 *
 * Instead, all interactions and poolmanager.PoolI methods are to be performed
 * on the Pool struct. The reason why we cannot have a Pool struct only is
 * because it cannot be serialized into state due to having a non-serializable
 * wasmKeeper field.
 */
export interface CosmWasmPoolSDKType {
  $typeUrl?: "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool";
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
    const message = createBaseCosmWasmPool();
    if (
      object.contract_address !== undefined &&
      object.contract_address !== null
    ) {
      message.contractAddress = object.contract_address;
    }
    if (object.pool_id !== undefined && object.pool_id !== null) {
      message.poolId = BigInt(object.pool_id);
    }
    if (object.code_id !== undefined && object.code_id !== null) {
      message.codeId = BigInt(object.code_id);
    }
    if (
      object.instantiate_msg !== undefined &&
      object.instantiate_msg !== null
    ) {
      message.instantiateMsg = bytesFromBase64(object.instantiate_msg);
    }
    return message;
  },
  toAmino(message: CosmWasmPool): CosmWasmPoolAmino {
    const obj: any = {};
    obj.contract_address =
      message.contractAddress === "" ? undefined : message.contractAddress;
    obj.pool_id =
      message.poolId !== BigInt(0) ? message.poolId.toString() : undefined;
    obj.code_id =
      message.codeId !== BigInt(0) ? message.codeId.toString() : undefined;
    obj.instantiate_msg = message.instantiateMsg
      ? base64FromBytes(message.instantiateMsg)
      : undefined;
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
