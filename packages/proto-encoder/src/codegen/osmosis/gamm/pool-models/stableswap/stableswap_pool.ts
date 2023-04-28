import * as _m0 from "protobufjs/minimal";

import {
  Coin,
  CoinAmino,
  CoinSDKType,
} from "../../../../cosmos/base/v1beta1/coin";
import { Long } from "../../../../helpers";
/**
 * PoolParams defined the parameters that will be managed by the pool
 * governance in the future. This params are not managed by the chain
 * governance. Instead they will be managed by the token holders of the pool.
 * The pool's token holders are specified in future_pool_governor.
 */
export interface PoolParams {
  swapFee: string;
  /**
   * N.B.: exit fee is disabled during pool creation in x/poolmanager. While old
   * pools can maintain a non-zero fee. No new pool can be created with non-zero
   * fee anymore
   */
  exitFee: string;
}
export interface PoolParamsProtoMsg {
  typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.PoolParams";
  value: Uint8Array;
}
/**
 * PoolParams defined the parameters that will be managed by the pool
 * governance in the future. This params are not managed by the chain
 * governance. Instead they will be managed by the token holders of the pool.
 * The pool's token holders are specified in future_pool_governor.
 */
export interface PoolParamsAmino {
  swap_fee: string;
  /**
   * N.B.: exit fee is disabled during pool creation in x/poolmanager. While old
   * pools can maintain a non-zero fee. No new pool can be created with non-zero
   * fee anymore
   */
  exit_fee: string;
}
export interface PoolParamsAminoMsg {
  type: "osmosis/gamm/StableswapPoolParams";
  value: PoolParamsAmino;
}
/**
 * PoolParams defined the parameters that will be managed by the pool
 * governance in the future. This params are not managed by the chain
 * governance. Instead they will be managed by the token holders of the pool.
 * The pool's token holders are specified in future_pool_governor.
 */
export interface PoolParamsSDKType {
  swap_fee: string;
  exit_fee: string;
}
/** Pool is the stableswap Pool struct */
export interface Pool {
  $typeUrl?: string;
  address: string;
  id: Long;
  poolParams?: PoolParams;
  /**
   * This string specifies who will govern the pool in the future.
   * Valid forms of this are:
   * {token name},{duration}
   * {duration}
   * where {token name} if specified is the token which determines the
   * governor, and if not specified is the LP token for this pool.duration is
   * a time specified as 0w,1w,2w, etc. which specifies how long the token
   * would need to be locked up to count in governance. 0w means no lockup.
   */
  futurePoolGovernor: string;
  /** sum of all LP shares */
  totalShares?: Coin;
  /** assets in the pool */
  poolLiquidity: Coin[];
  /** for calculation amognst assets with different precisions */
  scalingFactors: Long[];
  /** scaling_factor_controller is the address can adjust pool scaling factors */
  scalingFactorController: string;
}
export interface PoolProtoMsg {
  typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool";
  value: Uint8Array;
}
/** Pool is the stableswap Pool struct */
export interface PoolAmino {
  address: string;
  id: string;
  pool_params?: PoolParamsAmino;
  /**
   * This string specifies who will govern the pool in the future.
   * Valid forms of this are:
   * {token name},{duration}
   * {duration}
   * where {token name} if specified is the token which determines the
   * governor, and if not specified is the LP token for this pool.duration is
   * a time specified as 0w,1w,2w, etc. which specifies how long the token
   * would need to be locked up to count in governance. 0w means no lockup.
   */
  future_pool_governor: string;
  /** sum of all LP shares */
  total_shares?: CoinAmino;
  /** assets in the pool */
  pool_liquidity: CoinAmino[];
  /** for calculation amognst assets with different precisions */
  scaling_factors: string[];
  /** scaling_factor_controller is the address can adjust pool scaling factors */
  scaling_factor_controller: string;
}
export interface PoolAminoMsg {
  type: "osmosis/gamm/StableswapPool";
  value: PoolAmino;
}
/** Pool is the stableswap Pool struct */
export interface PoolSDKType {
  $typeUrl?: string;
  address: string;
  id: Long;
  pool_params?: PoolParamsSDKType;
  future_pool_governor: string;
  total_shares?: CoinSDKType;
  pool_liquidity: CoinSDKType[];
  scaling_factors: Long[];
  scaling_factor_controller: string;
}
function createBasePoolParams(): PoolParams {
  return {
    swapFee: "",
    exitFee: "",
  };
}
export const PoolParams = {
  typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.PoolParams",
  encode(
    message: PoolParams,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.swapFee !== "") {
      writer.uint32(10).string(message.swapFee);
    }
    if (message.exitFee !== "") {
      writer.uint32(18).string(message.exitFee);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): PoolParams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoolParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.swapFee = reader.string();
          break;
        case 2:
          message.exitFee = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<PoolParams>): PoolParams {
    const message = createBasePoolParams();
    message.swapFee = object.swapFee ?? "";
    message.exitFee = object.exitFee ?? "";
    return message;
  },
  fromAmino(object: PoolParamsAmino): PoolParams {
    return {
      swapFee: object.swap_fee,
      exitFee: object.exit_fee,
    };
  },
  toAmino(message: PoolParams): PoolParamsAmino {
    const obj: any = {};
    obj.swap_fee = message.swapFee;
    obj.exit_fee = message.exitFee;
    return obj;
  },
  fromAminoMsg(object: PoolParamsAminoMsg): PoolParams {
    return PoolParams.fromAmino(object.value);
  },
  toAminoMsg(message: PoolParams): PoolParamsAminoMsg {
    return {
      type: "osmosis/gamm/StableswapPoolParams",
      value: PoolParams.toAmino(message),
    };
  },
  fromProtoMsg(message: PoolParamsProtoMsg): PoolParams {
    return PoolParams.decode(message.value);
  },
  toProto(message: PoolParams): Uint8Array {
    return PoolParams.encode(message).finish();
  },
  toProtoMsg(message: PoolParams): PoolParamsProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.PoolParams",
      value: PoolParams.encode(message).finish(),
    };
  },
};
function createBasePool(): Pool {
  return {
    $typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool",
    address: "",
    id: Long.UZERO,
    poolParams: undefined,
    futurePoolGovernor: "",
    totalShares: undefined,
    poolLiquidity: [],
    scalingFactors: [],
    scalingFactorController: "",
  };
}
export const Pool = {
  typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool",
  encode(message: Pool, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    if (!message.id.isZero()) {
      writer.uint32(16).uint64(message.id);
    }
    if (message.poolParams !== undefined) {
      PoolParams.encode(message.poolParams, writer.uint32(26).fork()).ldelim();
    }
    if (message.futurePoolGovernor !== "") {
      writer.uint32(34).string(message.futurePoolGovernor);
    }
    if (message.totalShares !== undefined) {
      Coin.encode(message.totalShares, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.poolLiquidity) {
      Coin.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    writer.uint32(58).fork();
    for (const v of message.scalingFactors) {
      writer.uint64(v);
    }
    writer.ldelim();
    if (message.scalingFactorController !== "") {
      writer.uint32(66).string(message.scalingFactorController);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Pool {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePool();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.id = reader.uint64() as Long;
          break;
        case 3:
          message.poolParams = PoolParams.decode(reader, reader.uint32());
          break;
        case 4:
          message.futurePoolGovernor = reader.string();
          break;
        case 5:
          message.totalShares = Coin.decode(reader, reader.uint32());
          break;
        case 6:
          message.poolLiquidity.push(Coin.decode(reader, reader.uint32()));
          break;
        case 7:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.scalingFactors.push(reader.uint64() as Long);
            }
          } else {
            message.scalingFactors.push(reader.uint64() as Long);
          }
          break;
        case 8:
          message.scalingFactorController = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Pool>): Pool {
    const message = createBasePool();
    message.address = object.address ?? "";
    message.id =
      object.id !== undefined && object.id !== null
        ? Long.fromValue(object.id)
        : Long.UZERO;
    message.poolParams =
      object.poolParams !== undefined && object.poolParams !== null
        ? PoolParams.fromPartial(object.poolParams)
        : undefined;
    message.futurePoolGovernor = object.futurePoolGovernor ?? "";
    message.totalShares =
      object.totalShares !== undefined && object.totalShares !== null
        ? Coin.fromPartial(object.totalShares)
        : undefined;
    message.poolLiquidity =
      object.poolLiquidity?.map((e) => Coin.fromPartial(e)) || [];
    message.scalingFactors =
      object.scalingFactors?.map((e) => Long.fromValue(e)) || [];
    message.scalingFactorController = object.scalingFactorController ?? "";
    return message;
  },
  fromAmino(object: PoolAmino): Pool {
    return {
      address: object.address,
      id: Long.fromString(object.id),
      poolParams: object?.pool_params
        ? PoolParams.fromAmino(object.pool_params)
        : undefined,
      futurePoolGovernor: object.future_pool_governor,
      totalShares: object?.total_shares
        ? Coin.fromAmino(object.total_shares)
        : undefined,
      poolLiquidity: Array.isArray(object?.pool_liquidity)
        ? object.pool_liquidity.map((e: any) => Coin.fromAmino(e))
        : [],
      scalingFactors: Array.isArray(object?.scaling_factors)
        ? object.scaling_factors.map((e: any) => e)
        : [],
      scalingFactorController: object.scaling_factor_controller,
    };
  },
  toAmino(message: Pool): PoolAmino {
    const obj: any = {};
    obj.address = message.address;
    obj.id = message.id ? message.id.toString() : undefined;
    obj.pool_params = message.poolParams
      ? PoolParams.toAmino(message.poolParams)
      : undefined;
    obj.future_pool_governor = message.futurePoolGovernor;
    obj.total_shares = message.totalShares
      ? Coin.toAmino(message.totalShares)
      : undefined;
    if (message.poolLiquidity) {
      obj.pool_liquidity = message.poolLiquidity.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.pool_liquidity = [];
    }
    if (message.scalingFactors) {
      obj.scaling_factors = message.scalingFactors.map((e) => e);
    } else {
      obj.scaling_factors = [];
    }
    obj.scaling_factor_controller = message.scalingFactorController;
    return obj;
  },
  fromAminoMsg(object: PoolAminoMsg): Pool {
    return Pool.fromAmino(object.value);
  },
  toAminoMsg(message: Pool): PoolAminoMsg {
    return {
      type: "osmosis/gamm/StableswapPool",
      value: Pool.toAmino(message),
    };
  },
  fromProtoMsg(message: PoolProtoMsg): Pool {
    return Pool.decode(message.value);
  },
  toProto(message: Pool): Uint8Array {
    return Pool.encode(message).finish();
  },
  toProtoMsg(message: Pool): PoolProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool",
      value: Pool.encode(message).finish(),
    };
  },
};
