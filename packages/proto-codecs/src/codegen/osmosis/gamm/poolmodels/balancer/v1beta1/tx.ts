//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../../../../binary";
import {
  PoolAsset,
  PoolAssetAmino,
  PoolAssetSDKType,
  PoolParams,
  PoolParamsAmino,
  PoolParamsSDKType,
} from "../../../v1beta1/balancerPool";
/** ===================== MsgCreatePool */
export interface MsgCreateBalancerPool {
  sender: string;
  poolParams?: PoolParams;
  poolAssets: PoolAsset[];
  futurePoolGovernor: string;
}
export interface MsgCreateBalancerPoolProtoMsg {
  typeUrl: "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool";
  value: Uint8Array;
}
/** ===================== MsgCreatePool */
export interface MsgCreateBalancerPoolAmino {
  sender?: string;
  pool_params?: PoolParamsAmino;
  pool_assets?: PoolAssetAmino[];
  future_pool_governor?: string;
}
export interface MsgCreateBalancerPoolAminoMsg {
  type: "osmosis/gamm/create-balancer-pool";
  value: MsgCreateBalancerPoolAmino;
}
/** ===================== MsgCreatePool */
export interface MsgCreateBalancerPoolSDKType {
  sender: string;
  pool_params?: PoolParamsSDKType;
  pool_assets: PoolAssetSDKType[];
  future_pool_governor: string;
}
/** Returns the poolID */
export interface MsgCreateBalancerPoolResponse {
  poolId: bigint;
}
export interface MsgCreateBalancerPoolResponseProtoMsg {
  typeUrl: "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPoolResponse";
  value: Uint8Array;
}
/** Returns the poolID */
export interface MsgCreateBalancerPoolResponseAmino {
  pool_id?: string;
}
export interface MsgCreateBalancerPoolResponseAminoMsg {
  type: "osmosis/gamm/poolmodels/balancer/create-balancer-pool-response";
  value: MsgCreateBalancerPoolResponseAmino;
}
/** Returns the poolID */
export interface MsgCreateBalancerPoolResponseSDKType {
  pool_id: bigint;
}
function createBaseMsgCreateBalancerPool(): MsgCreateBalancerPool {
  return {
    sender: "",
    poolParams: undefined,
    poolAssets: [],
    futurePoolGovernor: "",
  };
}
export const MsgCreateBalancerPool = {
  typeUrl: "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool",
  encode(
    message: MsgCreateBalancerPool,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (message.poolParams !== undefined) {
      PoolParams.encode(message.poolParams, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.poolAssets) {
      PoolAsset.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.futurePoolGovernor !== "") {
      writer.uint32(34).string(message.futurePoolGovernor);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgCreateBalancerPool {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateBalancerPool();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.poolParams = PoolParams.decode(reader, reader.uint32());
          break;
        case 3:
          message.poolAssets.push(PoolAsset.decode(reader, reader.uint32()));
          break;
        case 4:
          message.futurePoolGovernor = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MsgCreateBalancerPool>): MsgCreateBalancerPool {
    const message = createBaseMsgCreateBalancerPool();
    message.sender = object.sender ?? "";
    message.poolParams =
      object.poolParams !== undefined && object.poolParams !== null
        ? PoolParams.fromPartial(object.poolParams)
        : undefined;
    message.poolAssets =
      object.poolAssets?.map((e) => PoolAsset.fromPartial(e)) || [];
    message.futurePoolGovernor = object.futurePoolGovernor ?? "";
    return message;
  },
  fromAmino(object: MsgCreateBalancerPoolAmino): MsgCreateBalancerPool {
    const message = createBaseMsgCreateBalancerPool();
    if (object.sender !== undefined && object.sender !== null) {
      message.sender = object.sender;
    }
    if (object.pool_params !== undefined && object.pool_params !== null) {
      message.poolParams = PoolParams.fromAmino(object.pool_params);
    }
    message.poolAssets =
      object.pool_assets?.map((e) => PoolAsset.fromAmino(e)) || [];
    if (
      object.future_pool_governor !== undefined &&
      object.future_pool_governor !== null
    ) {
      message.futurePoolGovernor = object.future_pool_governor;
    }
    return message;
  },
  toAmino(message: MsgCreateBalancerPool): MsgCreateBalancerPoolAmino {
    const obj: any = {};
    obj.sender = message.sender === "" ? undefined : message.sender;
    obj.pool_params = message.poolParams
      ? PoolParams.toAmino(message.poolParams)
      : undefined;
    if (message.poolAssets) {
      obj.pool_assets = message.poolAssets.map((e) =>
        e ? PoolAsset.toAmino(e) : undefined
      );
    } else {
      obj.pool_assets = message.poolAssets;
    }
    obj.future_pool_governor =
      message.futurePoolGovernor === ""
        ? undefined
        : message.futurePoolGovernor;
    return obj;
  },
  fromAminoMsg(object: MsgCreateBalancerPoolAminoMsg): MsgCreateBalancerPool {
    return MsgCreateBalancerPool.fromAmino(object.value);
  },
  toAminoMsg(message: MsgCreateBalancerPool): MsgCreateBalancerPoolAminoMsg {
    return {
      type: "osmosis/gamm/create-balancer-pool",
      value: MsgCreateBalancerPool.toAmino(message),
    };
  },
  fromProtoMsg(message: MsgCreateBalancerPoolProtoMsg): MsgCreateBalancerPool {
    return MsgCreateBalancerPool.decode(message.value);
  },
  toProto(message: MsgCreateBalancerPool): Uint8Array {
    return MsgCreateBalancerPool.encode(message).finish();
  },
  toProtoMsg(message: MsgCreateBalancerPool): MsgCreateBalancerPoolProtoMsg {
    return {
      typeUrl:
        "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPool",
      value: MsgCreateBalancerPool.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateBalancerPoolResponse(): MsgCreateBalancerPoolResponse {
  return {
    poolId: BigInt(0),
  };
}
export const MsgCreateBalancerPoolResponse = {
  typeUrl:
    "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPoolResponse",
  encode(
    message: MsgCreateBalancerPoolResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.poolId !== BigInt(0)) {
      writer.uint32(8).uint64(message.poolId);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgCreateBalancerPoolResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateBalancerPoolResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgCreateBalancerPoolResponse>
  ): MsgCreateBalancerPoolResponse {
    const message = createBaseMsgCreateBalancerPoolResponse();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? BigInt(object.poolId.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(
    object: MsgCreateBalancerPoolResponseAmino
  ): MsgCreateBalancerPoolResponse {
    const message = createBaseMsgCreateBalancerPoolResponse();
    if (object.pool_id !== undefined && object.pool_id !== null) {
      message.poolId = BigInt(object.pool_id);
    }
    return message;
  },
  toAmino(
    message: MsgCreateBalancerPoolResponse
  ): MsgCreateBalancerPoolResponseAmino {
    const obj: any = {};
    obj.pool_id =
      message.poolId !== BigInt(0) ? message.poolId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgCreateBalancerPoolResponseAminoMsg
  ): MsgCreateBalancerPoolResponse {
    return MsgCreateBalancerPoolResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgCreateBalancerPoolResponse
  ): MsgCreateBalancerPoolResponseAminoMsg {
    return {
      type: "osmosis/gamm/poolmodels/balancer/create-balancer-pool-response",
      value: MsgCreateBalancerPoolResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgCreateBalancerPoolResponseProtoMsg
  ): MsgCreateBalancerPoolResponse {
    return MsgCreateBalancerPoolResponse.decode(message.value);
  },
  toProto(message: MsgCreateBalancerPoolResponse): Uint8Array {
    return MsgCreateBalancerPoolResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCreateBalancerPoolResponse
  ): MsgCreateBalancerPoolResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPoolResponse",
      value: MsgCreateBalancerPoolResponse.encode(message).finish(),
    };
  },
};
