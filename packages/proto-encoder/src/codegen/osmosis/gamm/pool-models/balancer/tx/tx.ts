import * as _m0 from "protobufjs/minimal";

import {
  Coin,
  CoinAmino,
  CoinSDKType,
} from "../../../../../cosmos/base/v1beta1/coin";
import { Timestamp } from "../../../../../google/protobuf/timestamp";
import { fromTimestamp, Long, toTimestamp } from "../../../../../helpers";
import {
  PoolAsset,
  PoolAssetAmino,
  PoolAssetSDKType,
  PoolParams,
  PoolParamsAmino,
  PoolParamsSDKType,
} from "../balancerPool";
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
  sender: string;
  pool_params?: PoolParamsAmino;
  pool_assets: PoolAssetAmino[];
  future_pool_governor: string;
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
  poolId: Long;
}
export interface MsgCreateBalancerPoolResponseProtoMsg {
  typeUrl: "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPoolResponse";
  value: Uint8Array;
}
/** Returns the poolID */
export interface MsgCreateBalancerPoolResponseAmino {
  pool_id: string;
}
export interface MsgCreateBalancerPoolResponseAminoMsg {
  type: "osmosis/gamm/poolmodels/balancer/create-balancer-pool-response";
  value: MsgCreateBalancerPoolResponseAmino;
}
/** Returns the poolID */
export interface MsgCreateBalancerPoolResponseSDKType {
  pool_id: Long;
}
/** ===================== MsgMigrateSharesToFullRangeConcentratedPosition */
export interface MsgMigrateSharesToFullRangeConcentratedPosition {
  sender: string;
  sharesToMigrate?: Coin;
}
export interface MsgMigrateSharesToFullRangeConcentratedPositionProtoMsg {
  typeUrl: "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgMigrateSharesToFullRangeConcentratedPosition";
  value: Uint8Array;
}
/** ===================== MsgMigrateSharesToFullRangeConcentratedPosition */
export interface MsgMigrateSharesToFullRangeConcentratedPositionAmino {
  sender: string;
  shares_to_migrate?: CoinAmino;
}
export interface MsgMigrateSharesToFullRangeConcentratedPositionAminoMsg {
  type: "osmosis/gamm/poolmodels/balancer/migrate-shares-to-full-range-concentrated-position";
  value: MsgMigrateSharesToFullRangeConcentratedPositionAmino;
}
/** ===================== MsgMigrateSharesToFullRangeConcentratedPosition */
export interface MsgMigrateSharesToFullRangeConcentratedPositionSDKType {
  sender: string;
  shares_to_migrate?: CoinSDKType;
}
export interface MsgMigrateSharesToFullRangeConcentratedPositionResponse {
  amount0: string;
  amount1: string;
  liquidityCreated: string;
  joinTime?: Date;
}
export interface MsgMigrateSharesToFullRangeConcentratedPositionResponseProtoMsg {
  typeUrl: "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgMigrateSharesToFullRangeConcentratedPositionResponse";
  value: Uint8Array;
}
export interface MsgMigrateSharesToFullRangeConcentratedPositionResponseAmino {
  amount0: string;
  amount1: string;
  liquidity_created: string;
  join_time?: Date;
}
export interface MsgMigrateSharesToFullRangeConcentratedPositionResponseAminoMsg {
  type: "osmosis/gamm/poolmodels/balancer/migrate-shares-to-full-range-concentrated-position-response";
  value: MsgMigrateSharesToFullRangeConcentratedPositionResponseAmino;
}
export interface MsgMigrateSharesToFullRangeConcentratedPositionResponseSDKType {
  amount0: string;
  amount1: string;
  liquidity_created: string;
  join_time?: Date;
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
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
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
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgCreateBalancerPool {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
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
    return {
      sender: object.sender,
      poolParams: object?.pool_params
        ? PoolParams.fromAmino(object.pool_params)
        : undefined,
      poolAssets: Array.isArray(object?.pool_assets)
        ? object.pool_assets.map((e: any) => PoolAsset.fromAmino(e))
        : [],
      futurePoolGovernor: object.future_pool_governor,
    };
  },
  toAmino(message: MsgCreateBalancerPool): MsgCreateBalancerPoolAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.pool_params = message.poolParams
      ? PoolParams.toAmino(message.poolParams)
      : undefined;
    if (message.poolAssets) {
      obj.pool_assets = message.poolAssets.map((e) =>
        e ? PoolAsset.toAmino(e) : undefined
      );
    } else {
      obj.pool_assets = [];
    }
    obj.future_pool_governor = message.futurePoolGovernor;
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
    poolId: Long.UZERO,
  };
}
export const MsgCreateBalancerPoolResponse = {
  typeUrl:
    "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgCreateBalancerPoolResponse",
  encode(
    message: MsgCreateBalancerPoolResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.poolId.isZero()) {
      writer.uint32(8).uint64(message.poolId);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgCreateBalancerPoolResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgCreateBalancerPoolResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64() as Long;
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
        ? Long.fromValue(object.poolId)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: MsgCreateBalancerPoolResponseAmino
  ): MsgCreateBalancerPoolResponse {
    return {
      poolId: Long.fromString(object.pool_id),
    };
  },
  toAmino(
    message: MsgCreateBalancerPoolResponse
  ): MsgCreateBalancerPoolResponseAmino {
    const obj: any = {};
    obj.pool_id = message.poolId ? message.poolId.toString() : undefined;
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
function createBaseMsgMigrateSharesToFullRangeConcentratedPosition(): MsgMigrateSharesToFullRangeConcentratedPosition {
  return {
    sender: "",
    sharesToMigrate: undefined,
  };
}
export const MsgMigrateSharesToFullRangeConcentratedPosition = {
  typeUrl:
    "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgMigrateSharesToFullRangeConcentratedPosition",
  encode(
    message: MsgMigrateSharesToFullRangeConcentratedPosition,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.sender !== "") {
      writer.uint32(10).string(message.sender);
    }
    if (message.sharesToMigrate !== undefined) {
      Coin.encode(message.sharesToMigrate, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgMigrateSharesToFullRangeConcentratedPosition {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMsgMigrateSharesToFullRangeConcentratedPosition();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sender = reader.string();
          break;
        case 2:
          message.sharesToMigrate = Coin.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgMigrateSharesToFullRangeConcentratedPosition>
  ): MsgMigrateSharesToFullRangeConcentratedPosition {
    const message = createBaseMsgMigrateSharesToFullRangeConcentratedPosition();
    message.sender = object.sender ?? "";
    message.sharesToMigrate =
      object.sharesToMigrate !== undefined && object.sharesToMigrate !== null
        ? Coin.fromPartial(object.sharesToMigrate)
        : undefined;
    return message;
  },
  fromAmino(
    object: MsgMigrateSharesToFullRangeConcentratedPositionAmino
  ): MsgMigrateSharesToFullRangeConcentratedPosition {
    return {
      sender: object.sender,
      sharesToMigrate: object?.shares_to_migrate
        ? Coin.fromAmino(object.shares_to_migrate)
        : undefined,
    };
  },
  toAmino(
    message: MsgMigrateSharesToFullRangeConcentratedPosition
  ): MsgMigrateSharesToFullRangeConcentratedPositionAmino {
    const obj: any = {};
    obj.sender = message.sender;
    obj.shares_to_migrate = message.sharesToMigrate
      ? Coin.toAmino(message.sharesToMigrate)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgMigrateSharesToFullRangeConcentratedPositionAminoMsg
  ): MsgMigrateSharesToFullRangeConcentratedPosition {
    return MsgMigrateSharesToFullRangeConcentratedPosition.fromAmino(
      object.value
    );
  },
  toAminoMsg(
    message: MsgMigrateSharesToFullRangeConcentratedPosition
  ): MsgMigrateSharesToFullRangeConcentratedPositionAminoMsg {
    return {
      type: "osmosis/gamm/poolmodels/balancer/migrate-shares-to-full-range-concentrated-position",
      value: MsgMigrateSharesToFullRangeConcentratedPosition.toAmino(message),
    };
  },
  fromProtoMsg(
    message: MsgMigrateSharesToFullRangeConcentratedPositionProtoMsg
  ): MsgMigrateSharesToFullRangeConcentratedPosition {
    return MsgMigrateSharesToFullRangeConcentratedPosition.decode(
      message.value
    );
  },
  toProto(
    message: MsgMigrateSharesToFullRangeConcentratedPosition
  ): Uint8Array {
    return MsgMigrateSharesToFullRangeConcentratedPosition.encode(
      message
    ).finish();
  },
  toProtoMsg(
    message: MsgMigrateSharesToFullRangeConcentratedPosition
  ): MsgMigrateSharesToFullRangeConcentratedPositionProtoMsg {
    return {
      typeUrl:
        "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgMigrateSharesToFullRangeConcentratedPosition",
      value:
        MsgMigrateSharesToFullRangeConcentratedPosition.encode(
          message
        ).finish(),
    };
  },
};
function createBaseMsgMigrateSharesToFullRangeConcentratedPositionResponse(): MsgMigrateSharesToFullRangeConcentratedPositionResponse {
  return {
    amount0: "",
    amount1: "",
    liquidityCreated: "",
    joinTime: undefined,
  };
}
export const MsgMigrateSharesToFullRangeConcentratedPositionResponse = {
  typeUrl:
    "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgMigrateSharesToFullRangeConcentratedPositionResponse",
  encode(
    message: MsgMigrateSharesToFullRangeConcentratedPositionResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.amount0 !== "") {
      writer.uint32(10).string(message.amount0);
    }
    if (message.amount1 !== "") {
      writer.uint32(18).string(message.amount1);
    }
    if (message.liquidityCreated !== "") {
      writer.uint32(26).string(message.liquidityCreated);
    }
    if (message.joinTime !== undefined) {
      Timestamp.encode(
        toTimestamp(message.joinTime),
        writer.uint32(34).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): MsgMigrateSharesToFullRangeConcentratedPositionResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message =
      createBaseMsgMigrateSharesToFullRangeConcentratedPositionResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.amount0 = reader.string();
          break;
        case 2:
          message.amount1 = reader.string();
          break;
        case 3:
          message.liquidityCreated = reader.string();
          break;
        case 4:
          message.joinTime = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<MsgMigrateSharesToFullRangeConcentratedPositionResponse>
  ): MsgMigrateSharesToFullRangeConcentratedPositionResponse {
    const message =
      createBaseMsgMigrateSharesToFullRangeConcentratedPositionResponse();
    message.amount0 = object.amount0 ?? "";
    message.amount1 = object.amount1 ?? "";
    message.liquidityCreated = object.liquidityCreated ?? "";
    message.joinTime = object.joinTime ?? undefined;
    return message;
  },
  fromAmino(
    object: MsgMigrateSharesToFullRangeConcentratedPositionResponseAmino
  ): MsgMigrateSharesToFullRangeConcentratedPositionResponse {
    return {
      amount0: object.amount0,
      amount1: object.amount1,
      liquidityCreated: object.liquidity_created,
      joinTime: object?.join_time
        ? Timestamp.fromAmino(object.join_time)
        : undefined,
    };
  },
  toAmino(
    message: MsgMigrateSharesToFullRangeConcentratedPositionResponse
  ): MsgMigrateSharesToFullRangeConcentratedPositionResponseAmino {
    const obj: any = {};
    obj.amount0 = message.amount0;
    obj.amount1 = message.amount1;
    obj.liquidity_created = message.liquidityCreated;
    obj.join_time = message.joinTime
      ? Timestamp.toAmino(message.joinTime)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: MsgMigrateSharesToFullRangeConcentratedPositionResponseAminoMsg
  ): MsgMigrateSharesToFullRangeConcentratedPositionResponse {
    return MsgMigrateSharesToFullRangeConcentratedPositionResponse.fromAmino(
      object.value
    );
  },
  toAminoMsg(
    message: MsgMigrateSharesToFullRangeConcentratedPositionResponse
  ): MsgMigrateSharesToFullRangeConcentratedPositionResponseAminoMsg {
    return {
      type: "osmosis/gamm/poolmodels/balancer/migrate-shares-to-full-range-concentrated-position-response",
      value:
        MsgMigrateSharesToFullRangeConcentratedPositionResponse.toAmino(
          message
        ),
    };
  },
  fromProtoMsg(
    message: MsgMigrateSharesToFullRangeConcentratedPositionResponseProtoMsg
  ): MsgMigrateSharesToFullRangeConcentratedPositionResponse {
    return MsgMigrateSharesToFullRangeConcentratedPositionResponse.decode(
      message.value
    );
  },
  toProto(
    message: MsgMigrateSharesToFullRangeConcentratedPositionResponse
  ): Uint8Array {
    return MsgMigrateSharesToFullRangeConcentratedPositionResponse.encode(
      message
    ).finish();
  },
  toProtoMsg(
    message: MsgMigrateSharesToFullRangeConcentratedPositionResponse
  ): MsgMigrateSharesToFullRangeConcentratedPositionResponseProtoMsg {
    return {
      typeUrl:
        "/osmosis.gamm.poolmodels.balancer.v1beta1.MsgMigrateSharesToFullRangeConcentratedPositionResponse",
      value:
        MsgMigrateSharesToFullRangeConcentratedPositionResponse.encode(
          message
        ).finish(),
    };
  },
};
