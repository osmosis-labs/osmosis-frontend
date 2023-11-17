//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../../../binary";
import {
  Coin,
  CoinAmino,
  CoinSDKType,
} from "../../../../cosmos/base/v1beta1/coin";
import {
  PoolParams,
  PoolParamsAmino,
  PoolParamsSDKType,
} from "./stableswap_pool";
/** ===================== MsgCreatePool */
export interface MsgCreateStableswapPool {
  sender: string;
  poolParams: PoolParams;
  initialPoolLiquidity: Coin[];
  scalingFactors: bigint[];
  futurePoolGovernor: string;
  scalingFactorController: string;
}
export interface MsgCreateStableswapPoolProtoMsg {
  typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool";
  value: Uint8Array;
}
/** ===================== MsgCreatePool */
export interface MsgCreateStableswapPoolAmino {
  sender: string;
  pool_params?: PoolParamsAmino;
  initial_pool_liquidity: CoinAmino[];
  scaling_factors: string[];
  future_pool_governor: string;
  scaling_factor_controller: string;
}
export interface MsgCreateStableswapPoolAminoMsg {
  type: "osmosis/gamm/create-stableswap-pool";
  value: MsgCreateStableswapPoolAmino;
}
/** ===================== MsgCreatePool */
export interface MsgCreateStableswapPoolSDKType {
  sender: string;
  pool_params: PoolParamsSDKType;
  initial_pool_liquidity: CoinSDKType[];
  scaling_factors: bigint[];
  future_pool_governor: string;
  scaling_factor_controller: string;
}
/** Returns a poolID with custom poolName. */
export interface MsgCreateStableswapPoolResponse {
  poolId: bigint;
}
export interface MsgCreateStableswapPoolResponseProtoMsg {
  typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPoolResponse";
  value: Uint8Array;
}
/** Returns a poolID with custom poolName. */
export interface MsgCreateStableswapPoolResponseAmino {
  pool_id: string;
}
export interface MsgCreateStableswapPoolResponseAminoMsg {
  type: "osmosis/gamm/create-stableswap-pool-response";
  value: MsgCreateStableswapPoolResponseAmino;
}
/** Returns a poolID with custom poolName. */
export interface MsgCreateStableswapPoolResponseSDKType {
  pool_id: bigint;
}
/**
 * Sender must be the pool's scaling_factor_governor in order for the tx to
 * succeed. Adjusts stableswap scaling factors.
 */
export interface MsgStableSwapAdjustScalingFactors {
  sender: string;
  poolId: bigint;
  scalingFactors: bigint[];
}
export interface MsgStableSwapAdjustScalingFactorsProtoMsg {
  typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactors";
  value: Uint8Array;
}
/**
 * Sender must be the pool's scaling_factor_governor in order for the tx to
 * succeed. Adjusts stableswap scaling factors.
 */
export interface MsgStableSwapAdjustScalingFactorsAmino {
  sender: string;
  pool_id: string;
  scaling_factors: string[];
}
export interface MsgStableSwapAdjustScalingFactorsAminoMsg {
  type: "osmosis/gamm/stableswap-adjust-scaling-factors";
  value: MsgStableSwapAdjustScalingFactorsAmino;
}
/**
 * Sender must be the pool's scaling_factor_governor in order for the tx to
 * succeed. Adjusts stableswap scaling factors.
 */
export interface MsgStableSwapAdjustScalingFactorsSDKType {
  sender: string;
  pool_id: bigint;
  scaling_factors: bigint[];
}
export interface MsgStableSwapAdjustScalingFactorsResponse {}
export interface MsgStableSwapAdjustScalingFactorsResponseProtoMsg {
  typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactorsResponse";
  value: Uint8Array;
}
export interface MsgStableSwapAdjustScalingFactorsResponseAmino {}
export interface MsgStableSwapAdjustScalingFactorsResponseAminoMsg {
  type: "osmosis/gamm/stable-swap-adjust-scaling-factors-response";
  value: MsgStableSwapAdjustScalingFactorsResponseAmino;
}
export interface MsgStableSwapAdjustScalingFactorsResponseSDKType {}
function createBaseMsgCreateStableswapPool(): MsgCreateStableswapPool {
  return {
    sender: "",
    poolParams: PoolParams.fromPartial({}),
    initialPoolLiquidity: [],
    scalingFactors: [],
    futurePoolGovernor: "",
    scalingFactorController: "",
  };
}
export const MsgCreateStableswapPool = {
  typeUrl:
    "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool",
  encode(
    message: MsgCreateStableswapPool,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (message.poolParams !== undefined) {
      PoolParams.encode(message.poolParams, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.initialPoolLiquidity) {
      Coin.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    writer.uint32(34).fork();
    for (const v of message.scalingFactors) {
      writer.uint64(v);
    }
    writer.ldelim();
    if (message.futurePoolGovernor !== "") {
      writer.uint32(42).string(message.futurePoolGovernor);
    }
    if (message.scalingFactorController !== "") {
      writer.uint32(50).string(message.scalingFactorController);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgCreateStableswapPool {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateStableswapPool();
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
          message.initialPoolLiquidity.push(
            Coin.decode(reader, reader.uint32())
          );
          break;
        case 4:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.scalingFactors.push(reader.uint64());
            }
          } else {
            message.scalingFactors.push(reader.uint64());
          }
          break;
        case 5:
          message.futurePoolGovernor = reader.string();
          break;
        case 6:
          message.scalingFactorController = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgCreateStableswapPool>
  ): MsgCreateStableswapPool {
    const message = createBaseMsgCreateStableswapPool();
    message.sender = object.sender ?? "";
    message.poolParams =
      object.poolParams !== undefined && object.poolParams !== null
        ? PoolParams.fromPartial(object.poolParams)
        : undefined;
    message.initialPoolLiquidity =
      object.initialPoolLiquidity?.map((e) => Coin.fromPartial(e)) || [];
    message.scalingFactors =
      object.scalingFactors?.map((e) => BigInt(e.toString())) || [];
    message.futurePoolGovernor = object.futurePoolGovernor ?? "";
    message.scalingFactorController = object.scalingFactorController ?? "";
    return message;
  },
  fromAmino(object: MsgCreateStableswapPoolAmino): MsgCreateStableswapPool {
    return {
      sender: object.sender,
      poolParams: object?.pool_params
        ? PoolParams.fromAmino(object.pool_params)
        : undefined,
      initialPoolLiquidity: Array.isArray(object?.initial_pool_liquidity)
        ? object.initial_pool_liquidity.map((e: any) => Coin.fromAmino(e))
        : [],
      scalingFactors: Array.isArray(object?.scaling_factors)
        ? object.scaling_factors.map((e: any) => BigInt(e))
        : [],
      futurePoolGovernor: object.future_pool_governor,
      scalingFactorController: object.scaling_factor_controller,
    };
  },
  toAmino(message: MsgCreateStableswapPool): MsgCreateStableswapPoolAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.pool_params = message.poolParams
      ? PoolParams.toAmino(message.poolParams)
      : undefined;
    if (message.initialPoolLiquidity) {
      obj.initial_pool_liquidity = message.initialPoolLiquidity.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.initial_pool_liquidity = [];
    }
    if (message.scalingFactors) {
      obj.scaling_factors = message.scalingFactors.map((e) => e.toString());
    } else {
      obj.scaling_factors = [];
    }
    obj.future_pool_governor = message.futurePoolGovernor;
    obj.scaling_factor_controller = message.scalingFactorController;
    return obj;
  },
  fromAminoMsg(
    object: MsgCreateStableswapPoolAminoMsg
  ): MsgCreateStableswapPool {
    return MsgCreateStableswapPool.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgCreateStableswapPool
  ): MsgCreateStableswapPoolAminoMsg {
    return {
      type: "osmosis/gamm/create-stableswap-pool",
      value: MsgCreateStableswapPool.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgCreateStableswapPoolProtoMsg
  ): MsgCreateStableswapPool {
    return MsgCreateStableswapPool.decode(message.value);
  },
  toProto(message: MsgCreateStableswapPool): Uint8Array {
    return MsgCreateStableswapPool.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCreateStableswapPool
  ): MsgCreateStableswapPoolProtoMsg {
    return {
      typeUrl:
        "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPool",
      value: MsgCreateStableswapPool.encode(message).finish(),
    };
  },
};
function createBaseMsgCreateStableswapPoolResponse(): MsgCreateStableswapPoolResponse {
  return {
    poolId: BigInt(0),
  };
}
export const MsgCreateStableswapPoolResponse = {
  typeUrl:
    "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPoolResponse",
  encode(
    message: MsgCreateStableswapPoolResponse,
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
  ): MsgCreateStableswapPoolResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateStableswapPoolResponse();
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
    object: Partial<MsgCreateStableswapPoolResponse>
  ): MsgCreateStableswapPoolResponse {
    const message = createBaseMsgCreateStableswapPoolResponse();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? BigInt(object.poolId.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(
    object: MsgCreateStableswapPoolResponseAmino
  ): MsgCreateStableswapPoolResponse {
    return {
      poolId: BigInt(object.pool_id),
    };
  },
  toAmino(
    message: MsgCreateStableswapPoolResponse
  ): MsgCreateStableswapPoolResponseAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgCreateStableswapPoolResponseAminoMsg
  ): MsgCreateStableswapPoolResponse {
    return MsgCreateStableswapPoolResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgCreateStableswapPoolResponse
  ): MsgCreateStableswapPoolResponseAminoMsg {
    return {
      type: "osmosis/gamm/create-stableswap-pool-response",
      value: MsgCreateStableswapPoolResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgCreateStableswapPoolResponseProtoMsg
  ): MsgCreateStableswapPoolResponse {
    return MsgCreateStableswapPoolResponse.decode(message.value);
  },
  toProto(message: MsgCreateStableswapPoolResponse): Uint8Array {
    return MsgCreateStableswapPoolResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgCreateStableswapPoolResponse
  ): MsgCreateStableswapPoolResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgCreateStableswapPoolResponse",
      value: MsgCreateStableswapPoolResponse.encode(message).finish(),
    };
  },
};
function createBaseMsgStableSwapAdjustScalingFactors(): MsgStableSwapAdjustScalingFactors {
  return {
    sender: "",
    poolId: BigInt(0),
    scalingFactors: [],
  };
}
export const MsgStableSwapAdjustScalingFactors = {
  typeUrl:
    "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactors",
  encode(
    message: MsgStableSwapAdjustScalingFactors,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (message.poolId !== BigInt(0)) {
      writer.uint32(16).uint64(message.poolId);
    }
    writer.uint32(26).fork();
    for (const v of message.scalingFactors) {
      writer.uint64(v);
    }
    writer.ldelim();
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgStableSwapAdjustScalingFactors {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgStableSwapAdjustScalingFactors();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.poolId = reader.uint64();
          break;
        case 3:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.scalingFactors.push(reader.uint64());
            }
          } else {
            message.scalingFactors.push(reader.uint64());
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgStableSwapAdjustScalingFactors>
  ): MsgStableSwapAdjustScalingFactors {
    const message = createBaseMsgStableSwapAdjustScalingFactors();
    message.sender = object.sender ?? "";
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? BigInt(object.poolId.toString())
        : BigInt(0);
    message.scalingFactors =
      object.scalingFactors?.map((e) => BigInt(e.toString())) || [];
    return message;
  },
  fromAmino(
    object: MsgStableSwapAdjustScalingFactorsAmino
  ): MsgStableSwapAdjustScalingFactors {
    return {
      sender: object.sender,
      poolId: BigInt(object.pool_id),
      scalingFactors: Array.isArray(object?.scaling_factors)
        ? object.scaling_factors.map((e: any) => BigInt(e))
        : [],
    };
  },
  toAmino(
    message: MsgStableSwapAdjustScalingFactors
  ): MsgStableSwapAdjustScalingFactorsAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
    if (message.scalingFactors) {
      obj.scaling_factors = message.scalingFactors.map((e) => e.toString());
    } else {
      obj.scaling_factors = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: MsgStableSwapAdjustScalingFactorsAminoMsg
  ): MsgStableSwapAdjustScalingFactors {
    return MsgStableSwapAdjustScalingFactors.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgStableSwapAdjustScalingFactors
  ): MsgStableSwapAdjustScalingFactorsAminoMsg {
    return {
      type: "osmosis/gamm/stableswap-adjust-scaling-factors",
      value: MsgStableSwapAdjustScalingFactors.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgStableSwapAdjustScalingFactorsProtoMsg
  ): MsgStableSwapAdjustScalingFactors {
    return MsgStableSwapAdjustScalingFactors.decode(message.value);
  },
  toProto(message: MsgStableSwapAdjustScalingFactors): Uint8Array {
    return MsgStableSwapAdjustScalingFactors.encode(message).finish();
  },
  toProtoMsg(
    message: MsgStableSwapAdjustScalingFactors
  ): MsgStableSwapAdjustScalingFactorsProtoMsg {
    return {
      typeUrl:
        "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactors",
      value: MsgStableSwapAdjustScalingFactors.encode(message).finish(),
    };
  },
};
function createBaseMsgStableSwapAdjustScalingFactorsResponse(): MsgStableSwapAdjustScalingFactorsResponse {
  return {};
}
export const MsgStableSwapAdjustScalingFactorsResponse = {
  typeUrl:
    "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactorsResponse",
  encode(
    _: MsgStableSwapAdjustScalingFactorsResponse,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): MsgStableSwapAdjustScalingFactorsResponse {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgStableSwapAdjustScalingFactorsResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    _: Partial<MsgStableSwapAdjustScalingFactorsResponse>
  ): MsgStableSwapAdjustScalingFactorsResponse {
    const message = createBaseMsgStableSwapAdjustScalingFactorsResponse();
    return message;
  },
  fromAmino(
    _: MsgStableSwapAdjustScalingFactorsResponseAmino
  ): MsgStableSwapAdjustScalingFactorsResponse {
    return {};
  },
  toAmino(
    _: MsgStableSwapAdjustScalingFactorsResponse
  ): MsgStableSwapAdjustScalingFactorsResponseAmino {
    const obj: any = {};
    return obj;
  },
  fromAminoMsg(
    object: MsgStableSwapAdjustScalingFactorsResponseAminoMsg
  ): MsgStableSwapAdjustScalingFactorsResponse {
    return MsgStableSwapAdjustScalingFactorsResponse.fromAmino(object.value);
  },
  toAminoMsg(
    message: MsgStableSwapAdjustScalingFactorsResponse
  ): MsgStableSwapAdjustScalingFactorsResponseAminoMsg {
    return {
      type: "osmosis/gamm/stable-swap-adjust-scaling-factors-response",
      value: MsgStableSwapAdjustScalingFactorsResponse.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgStableSwapAdjustScalingFactorsResponseProtoMsg
  ): MsgStableSwapAdjustScalingFactorsResponse {
    return MsgStableSwapAdjustScalingFactorsResponse.decode(message.value);
  },
  toProto(message: MsgStableSwapAdjustScalingFactorsResponse): Uint8Array {
    return MsgStableSwapAdjustScalingFactorsResponse.encode(message).finish();
  },
  toProtoMsg(
    message: MsgStableSwapAdjustScalingFactorsResponse
  ): MsgStableSwapAdjustScalingFactorsResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.gamm.poolmodels.stableswap.v1beta1.MsgStableSwapAdjustScalingFactorsResponse",
      value: MsgStableSwapAdjustScalingFactorsResponse.encode(message).finish(),
    };
  },
};
