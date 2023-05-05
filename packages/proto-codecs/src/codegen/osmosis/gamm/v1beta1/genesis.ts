//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import {
  Coin,
  CoinAmino,
  CoinSDKType,
} from "../../../cosmos/base/v1beta1/coin";
import {
  Any,
  AnyAmino,
  AnyProtoMsg,
  AnySDKType,
} from "../../../google/protobuf/any";
import { Long } from "../../../helpers";
import { Pool as Pool1 } from "../../concentrated-liquidity/pool";
import { PoolProtoMsg as Pool1ProtoMsg } from "../../concentrated-liquidity/pool";
import { PoolSDKType as Pool1SDKType } from "../../concentrated-liquidity/pool";
import {
  CosmWasmPool,
  CosmWasmPoolProtoMsg,
  CosmWasmPoolSDKType,
} from "../../cosmwasmpool/v1beta1/model/pool";
import { Pool as Pool2 } from "../pool-models/balancer/balancerPool";
import { PoolProtoMsg as Pool2ProtoMsg } from "../pool-models/balancer/balancerPool";
import { PoolSDKType as Pool2SDKType } from "../pool-models/balancer/balancerPool";
import { Pool as Pool3 } from "../pool-models/stableswap/stableswap_pool";
import { PoolProtoMsg as Pool3ProtoMsg } from "../pool-models/stableswap/stableswap_pool";
import { PoolSDKType as Pool3SDKType } from "../pool-models/stableswap/stableswap_pool";
/** Params holds parameters for the incentives module */
export interface Params {
  poolCreationFee: Coin[];
}
export interface ParamsProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.Params";
  value: Uint8Array;
}
/** Params holds parameters for the incentives module */
export interface ParamsAmino {
  pool_creation_fee: CoinAmino[];
}
export interface ParamsAminoMsg {
  type: "osmosis/gamm/params";
  value: ParamsAmino;
}
/** Params holds parameters for the incentives module */
export interface ParamsSDKType {
  pool_creation_fee: CoinSDKType[];
}
/** GenesisState defines the gamm module's genesis state. */
export interface GenesisState {
  pools: (Pool1 & CosmWasmPool & Pool2 & Pool3 & Any)[] | Any[];
  /** will be renamed to next_pool_id in an upcoming version */
  nextPoolNumber: Long;
  params?: Params;
  migrationRecords?: MigrationRecords;
}
export interface GenesisStateProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.GenesisState";
  value: Uint8Array;
}
export type GenesisStateEncoded = Omit<GenesisState, "pools"> & {
  pools: (
    | Pool1ProtoMsg
    | CosmWasmPoolProtoMsg
    | Pool2ProtoMsg
    | Pool3ProtoMsg
    | AnyProtoMsg
  )[];
};
/** GenesisState defines the gamm module's genesis state. */
export interface GenesisStateAmino {
  pools: AnyAmino[];
  /** will be renamed to next_pool_id in an upcoming version */
  next_pool_number: string;
  params?: ParamsAmino;
  migration_records?: MigrationRecordsAmino;
}
export interface GenesisStateAminoMsg {
  type: "osmosis/gamm/genesis-state";
  value: GenesisStateAmino;
}
/** GenesisState defines the gamm module's genesis state. */
export interface GenesisStateSDKType {
  pools: (
    | Pool1SDKType
    | CosmWasmPoolSDKType
    | Pool2SDKType
    | Pool3SDKType
    | AnySDKType
  )[];
  next_pool_number: Long;
  params?: ParamsSDKType;
  migration_records?: MigrationRecordsSDKType;
}
/**
 * MigrationRecords contains all the links between balancer and concentrated
 * pools
 */
export interface MigrationRecords {
  balancerToConcentratedPoolLinks: BalancerToConcentratedPoolLink[];
}
export interface MigrationRecordsProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.MigrationRecords";
  value: Uint8Array;
}
/**
 * MigrationRecords contains all the links between balancer and concentrated
 * pools
 */
export interface MigrationRecordsAmino {
  balancer_to_concentrated_pool_links: BalancerToConcentratedPoolLinkAmino[];
}
export interface MigrationRecordsAminoMsg {
  type: "osmosis/gamm/migration-records";
  value: MigrationRecordsAmino;
}
/**
 * MigrationRecords contains all the links between balancer and concentrated
 * pools
 */
export interface MigrationRecordsSDKType {
  balancer_to_concentrated_pool_links: BalancerToConcentratedPoolLinkSDKType[];
}
/**
 * BalancerToConcentratedPoolLink defines a single link between a single
 * balancer pool and a single concentrated liquidity pool. This link is used to
 * allow a balancer pool to migrate to a single canonical full range
 * concentrated liquidity pool position
 * A balancer pool can be linked to a maximum of one cl pool, and a cl pool can
 * be linked to a maximum of one balancer pool.
 */
export interface BalancerToConcentratedPoolLink {
  balancerPoolId: Long;
  clPoolId: Long;
}
export interface BalancerToConcentratedPoolLinkProtoMsg {
  typeUrl: "/osmosis.gamm.v1beta1.BalancerToConcentratedPoolLink";
  value: Uint8Array;
}
/**
 * BalancerToConcentratedPoolLink defines a single link between a single
 * balancer pool and a single concentrated liquidity pool. This link is used to
 * allow a balancer pool to migrate to a single canonical full range
 * concentrated liquidity pool position
 * A balancer pool can be linked to a maximum of one cl pool, and a cl pool can
 * be linked to a maximum of one balancer pool.
 */
export interface BalancerToConcentratedPoolLinkAmino {
  balancer_pool_id: string;
  cl_pool_id: string;
}
export interface BalancerToConcentratedPoolLinkAminoMsg {
  type: "osmosis/gamm/balancer-to-concentrated-pool-link";
  value: BalancerToConcentratedPoolLinkAmino;
}
/**
 * BalancerToConcentratedPoolLink defines a single link between a single
 * balancer pool and a single concentrated liquidity pool. This link is used to
 * allow a balancer pool to migrate to a single canonical full range
 * concentrated liquidity pool position
 * A balancer pool can be linked to a maximum of one cl pool, and a cl pool can
 * be linked to a maximum of one balancer pool.
 */
export interface BalancerToConcentratedPoolLinkSDKType {
  balancer_pool_id: Long;
  cl_pool_id: Long;
}
function createBaseParams(): Params {
  return {
    poolCreationFee: [],
  };
}
export const Params = {
  typeUrl: "/osmosis.gamm.v1beta1.Params",
  encode(
    message: Params,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.poolCreationFee) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Params {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolCreationFee.push(Coin.decode(reader, reader.uint32()));
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
    message.poolCreationFee =
      object.poolCreationFee?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    return {
      poolCreationFee: Array.isArray(object?.pool_creation_fee)
        ? object.pool_creation_fee.map((e: any) => Coin.fromAmino(e))
        : [],
    };
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    if (message.poolCreationFee) {
      obj.pool_creation_fee = message.poolCreationFee.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.pool_creation_fee = [];
    }
    return obj;
  },
  fromAminoMsg(object: ParamsAminoMsg): Params {
    return Params.fromAmino(object.value);
  },
  toAminoMsg(message: Params): ParamsAminoMsg {
    return {
      type: "osmosis/gamm/params",
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
      typeUrl: "/osmosis.gamm.v1beta1.Params",
      value: Params.encode(message).finish(),
    };
  },
};
function createBaseGenesisState(): GenesisState {
  return {
    pools: [],
    nextPoolNumber: Long.UZERO,
    params: undefined,
    migrationRecords: undefined,
  };
}
export const GenesisState = {
  typeUrl: "/osmosis.gamm.v1beta1.GenesisState",
  encode(
    message: GenesisState,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.pools) {
      Any.encode(v! as Any, writer.uint32(10).fork()).ldelim();
    }
    if (!message.nextPoolNumber.isZero()) {
      writer.uint32(16).uint64(message.nextPoolNumber);
    }
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(26).fork()).ldelim();
    }
    if (message.migrationRecords !== undefined) {
      MigrationRecords.encode(
        message.migrationRecords,
        writer.uint32(34).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): GenesisState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pools.push(PoolI_InterfaceDecoder(reader) as Any);
          break;
        case 2:
          message.nextPoolNumber = reader.uint64() as Long;
          break;
        case 3:
          message.params = Params.decode(reader, reader.uint32());
          break;
        case 4:
          message.migrationRecords = MigrationRecords.decode(
            reader,
            reader.uint32()
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<GenesisState>): GenesisState {
    const message = createBaseGenesisState();
    message.pools = object.pools?.map((e) => Any.fromPartial(e)) || [];
    message.nextPoolNumber =
      object.nextPoolNumber !== undefined && object.nextPoolNumber !== null
        ? Long.fromValue(object.nextPoolNumber)
        : Long.UZERO;
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    message.migrationRecords =
      object.migrationRecords !== undefined && object.migrationRecords !== null
        ? MigrationRecords.fromPartial(object.migrationRecords)
        : undefined;
    return message;
  },
  fromAmino(object: GenesisStateAmino): GenesisState {
    return {
      pools: Array.isArray(object?.pools)
        ? object.pools.map((e: any) => PoolI_FromAmino(e))
        : [],
      nextPoolNumber: Long.fromString(object.next_pool_number),
      params: object?.params ? Params.fromAmino(object.params) : undefined,
      migrationRecords: object?.migration_records
        ? MigrationRecords.fromAmino(object.migration_records)
        : undefined,
    };
  },
  toAmino(message: GenesisState): GenesisStateAmino {
    const obj: any = {};
    if (message.pools) {
      obj.pools = message.pools.map((e) =>
        e ? PoolI_ToAmino(e as Any) : undefined
      );
    } else {
      obj.pools = [];
    }
    obj.next_pool_number = message.nextPoolNumber
      ? message.nextPoolNumber.toString()
      : undefined;
    obj.params = message.params ? Params.toAmino(message.params) : undefined;
    obj.migration_records = message.migrationRecords
      ? MigrationRecords.toAmino(message.migrationRecords)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: GenesisStateAminoMsg): GenesisState {
    return GenesisState.fromAmino(object.value);
  },
  toAminoMsg(message: GenesisState): GenesisStateAminoMsg {
    return {
      type: "osmosis/gamm/genesis-state",
      value: GenesisState.toAmino(message),
    };
  },
  fromProtoMsg(message: GenesisStateProtoMsg): GenesisState {
    return GenesisState.decode(message.value);
  },
  toProto(message: GenesisState): Uint8Array {
    return GenesisState.encode(message).finish();
  },
  toProtoMsg(message: GenesisState): GenesisStateProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.GenesisState",
      value: GenesisState.encode(message).finish(),
    };
  },
};
function createBaseMigrationRecords(): MigrationRecords {
  return {
    balancerToConcentratedPoolLinks: [],
  };
}
export const MigrationRecords = {
  typeUrl: "/osmosis.gamm.v1beta1.MigrationRecords",
  encode(
    message: MigrationRecords,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.balancerToConcentratedPoolLinks) {
      BalancerToConcentratedPoolLink.encode(
        v!,
        writer.uint32(10).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MigrationRecords {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMigrationRecords();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.balancerToConcentratedPoolLinks.push(
            BalancerToConcentratedPoolLink.decode(reader, reader.uint32())
          );
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<MigrationRecords>): MigrationRecords {
    const message = createBaseMigrationRecords();
    message.balancerToConcentratedPoolLinks =
      object.balancerToConcentratedPoolLinks?.map((e) =>
        BalancerToConcentratedPoolLink.fromPartial(e)
      ) || [];
    return message;
  },
  fromAmino(object: MigrationRecordsAmino): MigrationRecords {
    return {
      balancerToConcentratedPoolLinks: Array.isArray(
        object?.balancer_to_concentrated_pool_links
      )
        ? object.balancer_to_concentrated_pool_links.map((e: any) =>
            BalancerToConcentratedPoolLink.fromAmino(e)
          )
        : [],
    };
  },
  toAmino(message: MigrationRecords): MigrationRecordsAmino {
    const obj: any = {};
    if (message.balancerToConcentratedPoolLinks) {
      obj.balancer_to_concentrated_pool_links =
        message.balancerToConcentratedPoolLinks.map((e) =>
          e ? BalancerToConcentratedPoolLink.toAmino(e) : undefined
        );
    } else {
      obj.balancer_to_concentrated_pool_links = [];
    }
    return obj;
  },
  fromAminoMsg(object: MigrationRecordsAminoMsg): MigrationRecords {
    return MigrationRecords.fromAmino(object.value);
  },
  toAminoMsg(message: MigrationRecords): MigrationRecordsAminoMsg {
    return {
      type: "osmosis/gamm/migration-records",
      value: MigrationRecords.toAmino(message),
    };
  },
  fromProtoMsg(message: MigrationRecordsProtoMsg): MigrationRecords {
    return MigrationRecords.decode(message.value);
  },
  toProto(message: MigrationRecords): Uint8Array {
    return MigrationRecords.encode(message).finish();
  },
  toProtoMsg(message: MigrationRecords): MigrationRecordsProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.MigrationRecords",
      value: MigrationRecords.encode(message).finish(),
    };
  },
};
function createBaseBalancerToConcentratedPoolLink(): BalancerToConcentratedPoolLink {
  return {
    balancerPoolId: Long.UZERO,
    clPoolId: Long.UZERO,
  };
}
export const BalancerToConcentratedPoolLink = {
  typeUrl: "/osmosis.gamm.v1beta1.BalancerToConcentratedPoolLink",
  encode(
    message: BalancerToConcentratedPoolLink,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.balancerPoolId.isZero()) {
      writer.uint32(8).uint64(message.balancerPoolId);
    }
    if (!message.clPoolId.isZero()) {
      writer.uint32(16).uint64(message.clPoolId);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): BalancerToConcentratedPoolLink {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBalancerToConcentratedPoolLink();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.balancerPoolId = reader.uint64() as Long;
          break;
        case 2:
          message.clPoolId = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<BalancerToConcentratedPoolLink>
  ): BalancerToConcentratedPoolLink {
    const message = createBaseBalancerToConcentratedPoolLink();
    message.balancerPoolId =
      object.balancerPoolId !== undefined && object.balancerPoolId !== null
        ? Long.fromValue(object.balancerPoolId)
        : Long.UZERO;
    message.clPoolId =
      object.clPoolId !== undefined && object.clPoolId !== null
        ? Long.fromValue(object.clPoolId)
        : Long.UZERO;
    return message;
  },
  fromAmino(
    object: BalancerToConcentratedPoolLinkAmino
  ): BalancerToConcentratedPoolLink {
    return {
      balancerPoolId: Long.fromString(object.balancer_pool_id),
      clPoolId: Long.fromString(object.cl_pool_id),
    };
  },
  toAmino(
    message: BalancerToConcentratedPoolLink
  ): BalancerToConcentratedPoolLinkAmino {
    const obj: any = {};
    obj.balancer_pool_id = message.balancerPoolId
      ? message.balancerPoolId.toString()
      : undefined;
    obj.cl_pool_id = message.clPoolId ? message.clPoolId.toString() : undefined;
    return obj;
  },
  fromAminoMsg(
    object: BalancerToConcentratedPoolLinkAminoMsg
  ): BalancerToConcentratedPoolLink {
    return BalancerToConcentratedPoolLink.fromAmino(object.value);
  },
  toAminoMsg(
    message: BalancerToConcentratedPoolLink
  ): BalancerToConcentratedPoolLinkAminoMsg {
    return {
      type: "osmosis/gamm/balancer-to-concentrated-pool-link",
      value: BalancerToConcentratedPoolLink.toAmino(message),
    };
  },
  fromProtoMsg(
    message: BalancerToConcentratedPoolLinkProtoMsg
  ): BalancerToConcentratedPoolLink {
    return BalancerToConcentratedPoolLink.decode(message.value);
  },
  toProto(message: BalancerToConcentratedPoolLink): Uint8Array {
    return BalancerToConcentratedPoolLink.encode(message).finish();
  },
  toProtoMsg(
    message: BalancerToConcentratedPoolLink
  ): BalancerToConcentratedPoolLinkProtoMsg {
    return {
      typeUrl: "/osmosis.gamm.v1beta1.BalancerToConcentratedPoolLink",
      value: BalancerToConcentratedPoolLink.encode(message).finish(),
    };
  },
};
export const PoolI_InterfaceDecoder = (
  input: _m0.Reader | Uint8Array
): Pool1 | CosmWasmPool | Pool2 | Pool3 | Any => {
  const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
  const data = Any.decode(reader, reader.uint32());
  switch (data.typeUrl) {
    case "/osmosis.concentratedliquidity.v1beta1.Pool":
      return Pool1.decode(data.value);
    case "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool":
      return CosmWasmPool.decode(data.value);
    case "/osmosis.gamm.v1beta1.Pool":
      return Pool2.decode(data.value);
    case "/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool":
      return Pool3.decode(data.value);
    default:
      return data;
  }
};
export const PoolI_FromAmino = (content: AnyAmino) => {
  switch (content.type) {
    case "osmosis/concentratedliquidity/pool":
      return Any.fromPartial({
        typeUrl: "/osmosis.concentratedliquidity.v1beta1.Pool",
        value: Pool1.encode(
          Pool1.fromPartial(Pool1.fromAmino(content.value))
        ).finish(),
      });
    case "osmosis/cosmwasmpool/cosm-wasm-pool":
      return Any.fromPartial({
        typeUrl: "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool",
        value: CosmWasmPool.encode(
          CosmWasmPool.fromPartial(CosmWasmPool.fromAmino(content.value))
        ).finish(),
      });
    case "osmosis/gamm/BalancerPool":
      return Any.fromPartial({
        typeUrl: "/osmosis.gamm.v1beta1.Pool",
        value: Pool2.encode(
          Pool2.fromPartial(Pool2.fromAmino(content.value))
        ).finish(),
      });
    case "osmosis/gamm/StableswapPool":
      return Any.fromPartial({
        typeUrl: "/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool",
        value: Pool3.encode(
          Pool3.fromPartial(Pool3.fromAmino(content.value))
        ).finish(),
      });
    default:
      return Any.fromAmino(content);
  }
};
export const PoolI_ToAmino = (content: Any) => {
  switch (content.typeUrl) {
    case "/osmosis.concentratedliquidity.v1beta1.Pool":
      return {
        type: "osmosis/concentratedliquidity/pool",
        value: Pool1.toAmino(Pool1.decode(content.value)),
      };
    case "/osmosis.cosmwasmpool.v1beta1.CosmWasmPool":
      return {
        type: "osmosis/cosmwasmpool/cosm-wasm-pool",
        value: CosmWasmPool.toAmino(CosmWasmPool.decode(content.value)),
      };
    case "/osmosis.gamm.v1beta1.Pool":
      return {
        type: "osmosis/gamm/BalancerPool",
        value: Pool2.toAmino(Pool2.decode(content.value)),
      };
    case "/osmosis.gamm.poolmodels.stableswap.v1beta1.Pool":
      return {
        type: "osmosis/gamm/StableswapPool",
        value: Pool3.toAmino(Pool3.decode(content.value)),
      };
    default:
      return Any.toAmino(content);
  }
};
