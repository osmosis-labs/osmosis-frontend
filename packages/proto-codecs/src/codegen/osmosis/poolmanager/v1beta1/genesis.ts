//@ts-nocheck
import { Decimal } from "@cosmjs/math";

import { BinaryReader, BinaryWriter } from "../../../binary";
import {
  Coin,
  CoinAmino,
  CoinSDKType,
} from "../../../cosmos/base/v1beta1/coin";
import {
  ModuleRoute,
  ModuleRouteAmino,
  ModuleRouteSDKType,
} from "./module_route";
import {
  DenomPairTakerFee,
  DenomPairTakerFeeAmino,
  DenomPairTakerFeeSDKType,
} from "./tx";
/** Params holds parameters for the poolmanager module */
export interface Params {
  poolCreationFee: Coin[];
  /** taker_fee_params is the container of taker fee parameters. */
  takerFeeParams: TakerFeeParams;
  /**
   * authorized_quote_denoms is a list of quote denoms that can be used as
   * token1 when creating a concentrated pool. We limit the quote assets to a
   * small set for the purposes of having convinient price increments stemming
   * from tick to price conversion. These increments are in a human readable
   * magnitude only for token1 as a quote. For limit orders in the future, this
   * will be a desirable property in terms of UX as to allow users to set limit
   * orders at prices in terms of token1 (quote asset) that are easy to reason
   * about.
   */
  authorizedQuoteDenoms: string[];
}
export interface ParamsProtoMsg {
  typeUrl: "/osmosis.poolmanager.v1beta1.Params";
  value: Uint8Array;
}
/** Params holds parameters for the poolmanager module */
export interface ParamsAmino {
  pool_creation_fee?: CoinAmino[];
  /** taker_fee_params is the container of taker fee parameters. */
  taker_fee_params?: TakerFeeParamsAmino;
  /**
   * authorized_quote_denoms is a list of quote denoms that can be used as
   * token1 when creating a concentrated pool. We limit the quote assets to a
   * small set for the purposes of having convinient price increments stemming
   * from tick to price conversion. These increments are in a human readable
   * magnitude only for token1 as a quote. For limit orders in the future, this
   * will be a desirable property in terms of UX as to allow users to set limit
   * orders at prices in terms of token1 (quote asset) that are easy to reason
   * about.
   */
  authorized_quote_denoms?: string[];
}
export interface ParamsAminoMsg {
  type: "osmosis/poolmanager/params";
  value: ParamsAmino;
}
/** Params holds parameters for the poolmanager module */
export interface ParamsSDKType {
  pool_creation_fee: CoinSDKType[];
  taker_fee_params: TakerFeeParamsSDKType;
  authorized_quote_denoms: string[];
}
/** GenesisState defines the poolmanager module's genesis state. */
export interface GenesisState {
  /** the next_pool_id */
  nextPoolId: bigint;
  /** params is the container of poolmanager parameters. */
  params: Params;
  /** pool_routes is the container of the mappings from pool id to pool type. */
  poolRoutes: ModuleRoute[];
  /** KVStore state */
  takerFeesTracker?: TakerFeesTracker;
  poolVolumes: PoolVolume[];
  denomPairTakerFeeStore: DenomPairTakerFee[];
}
export interface GenesisStateProtoMsg {
  typeUrl: "/osmosis.poolmanager.v1beta1.GenesisState";
  value: Uint8Array;
}
/** GenesisState defines the poolmanager module's genesis state. */
export interface GenesisStateAmino {
  /** the next_pool_id */
  next_pool_id?: string;
  /** params is the container of poolmanager parameters. */
  params?: ParamsAmino;
  /** pool_routes is the container of the mappings from pool id to pool type. */
  pool_routes?: ModuleRouteAmino[];
  /** KVStore state */
  taker_fees_tracker?: TakerFeesTrackerAmino;
  pool_volumes?: PoolVolumeAmino[];
  denom_pair_taker_fee_store?: DenomPairTakerFeeAmino[];
}
export interface GenesisStateAminoMsg {
  type: "osmosis/poolmanager/genesis-state";
  value: GenesisStateAmino;
}
/** GenesisState defines the poolmanager module's genesis state. */
export interface GenesisStateSDKType {
  next_pool_id: bigint;
  params: ParamsSDKType;
  pool_routes: ModuleRouteSDKType[];
  taker_fees_tracker?: TakerFeesTrackerSDKType;
  pool_volumes: PoolVolumeSDKType[];
  denom_pair_taker_fee_store: DenomPairTakerFeeSDKType[];
}
/** TakerFeeParams consolidates the taker fee parameters for the poolmanager. */
export interface TakerFeeParams {
  /**
   * default_taker_fee is the fee used when creating a new pool that doesn't
   * fall under a custom pool taker fee or stableswap taker fee category.
   */
  defaultTakerFee: string;
  /**
   * osmo_taker_fee_distribution defines the distribution of taker fees
   * generated in OSMO. As of this writing, it has two catagories:
   * - staking_rewards: the percent of the taker fee that gets distributed to
   *   stakers.
   * - community_pool: the percent of the taker fee that gets sent to the
   *   community pool.
   */
  osmoTakerFeeDistribution: TakerFeeDistributionPercentage;
  /**
   * non_osmo_taker_fee_distribution defines the distribution of taker fees
   * generated in non-OSMO. As of this writing, it has two categories:
   * - staking_rewards: the percent of the taker fee that gets swapped to OSMO
   *   and then distirbuted to stakers.
   * - community_pool: the percent of the taker fee that gets sent to the
   *   community pool. Note: If the non-OSMO asset is an authorized_quote_denom,
   *   that denom is sent directly to the community pool. Otherwise, it is
   *   swapped to the community_pool_denom_to_swap_non_whitelisted_assets_to and
   *   then sent to the community pool as that denom.
   */
  nonOsmoTakerFeeDistribution: TakerFeeDistributionPercentage;
  /**
   * admin_addresses is a list of addresses that are allowed to set and remove
   * custom taker fees for denom pairs. Governance also has the ability to set
   * and remove custom taker fees for denom pairs, but with the normal
   * governance delay.
   */
  adminAddresses: string[];
  /**
   * community_pool_denom_to_swap_non_whitelisted_assets_to is the denom that
   * non-whitelisted taker fees will be swapped to before being sent to
   * the community pool.
   */
  communityPoolDenomToSwapNonWhitelistedAssetsTo: string;
  /**
   * reduced_fee_whitelist is a list of addresses that are
   * allowed to pay a reduce taker fee when performing a swap
   * (i.e. swap without paying the taker fee).
   * It is intended to be used for integrators who meet qualifying factors
   * that are approved by governance.
   * Initially, the taker fee is allowed to be bypassed completely. However
   * In the future, we will charge a reduced taker fee instead of no fee at all.
   */
  reducedFeeWhitelist: string[];
}
export interface TakerFeeParamsProtoMsg {
  typeUrl: "/osmosis.poolmanager.v1beta1.TakerFeeParams";
  value: Uint8Array;
}
/** TakerFeeParams consolidates the taker fee parameters for the poolmanager. */
export interface TakerFeeParamsAmino {
  /**
   * default_taker_fee is the fee used when creating a new pool that doesn't
   * fall under a custom pool taker fee or stableswap taker fee category.
   */
  default_taker_fee?: string;
  /**
   * osmo_taker_fee_distribution defines the distribution of taker fees
   * generated in OSMO. As of this writing, it has two catagories:
   * - staking_rewards: the percent of the taker fee that gets distributed to
   *   stakers.
   * - community_pool: the percent of the taker fee that gets sent to the
   *   community pool.
   */
  osmo_taker_fee_distribution?: TakerFeeDistributionPercentageAmino;
  /**
   * non_osmo_taker_fee_distribution defines the distribution of taker fees
   * generated in non-OSMO. As of this writing, it has two categories:
   * - staking_rewards: the percent of the taker fee that gets swapped to OSMO
   *   and then distirbuted to stakers.
   * - community_pool: the percent of the taker fee that gets sent to the
   *   community pool. Note: If the non-OSMO asset is an authorized_quote_denom,
   *   that denom is sent directly to the community pool. Otherwise, it is
   *   swapped to the community_pool_denom_to_swap_non_whitelisted_assets_to and
   *   then sent to the community pool as that denom.
   */
  non_osmo_taker_fee_distribution?: TakerFeeDistributionPercentageAmino;
  /**
   * admin_addresses is a list of addresses that are allowed to set and remove
   * custom taker fees for denom pairs. Governance also has the ability to set
   * and remove custom taker fees for denom pairs, but with the normal
   * governance delay.
   */
  admin_addresses?: string[];
  /**
   * community_pool_denom_to_swap_non_whitelisted_assets_to is the denom that
   * non-whitelisted taker fees will be swapped to before being sent to
   * the community pool.
   */
  community_pool_denom_to_swap_non_whitelisted_assets_to?: string;
  /**
   * reduced_fee_whitelist is a list of addresses that are
   * allowed to pay a reduce taker fee when performing a swap
   * (i.e. swap without paying the taker fee).
   * It is intended to be used for integrators who meet qualifying factors
   * that are approved by governance.
   * Initially, the taker fee is allowed to be bypassed completely. However
   * In the future, we will charge a reduced taker fee instead of no fee at all.
   */
  reduced_fee_whitelist?: string[];
}
export interface TakerFeeParamsAminoMsg {
  type: "osmosis/poolmanager/taker-fee-params";
  value: TakerFeeParamsAmino;
}
/** TakerFeeParams consolidates the taker fee parameters for the poolmanager. */
export interface TakerFeeParamsSDKType {
  default_taker_fee: string;
  osmo_taker_fee_distribution: TakerFeeDistributionPercentageSDKType;
  non_osmo_taker_fee_distribution: TakerFeeDistributionPercentageSDKType;
  admin_addresses: string[];
  community_pool_denom_to_swap_non_whitelisted_assets_to: string;
  reduced_fee_whitelist: string[];
}
/**
 * TakerFeeDistributionPercentage defines what percent of the taker fee category
 * gets distributed to the available categories.
 */
export interface TakerFeeDistributionPercentage {
  stakingRewards: string;
  communityPool: string;
}
export interface TakerFeeDistributionPercentageProtoMsg {
  typeUrl: "/osmosis.poolmanager.v1beta1.TakerFeeDistributionPercentage";
  value: Uint8Array;
}
/**
 * TakerFeeDistributionPercentage defines what percent of the taker fee category
 * gets distributed to the available categories.
 */
export interface TakerFeeDistributionPercentageAmino {
  staking_rewards?: string;
  community_pool?: string;
}
export interface TakerFeeDistributionPercentageAminoMsg {
  type: "osmosis/poolmanager/taker-fee-distribution-percentage";
  value: TakerFeeDistributionPercentageAmino;
}
/**
 * TakerFeeDistributionPercentage defines what percent of the taker fee category
 * gets distributed to the available categories.
 */
export interface TakerFeeDistributionPercentageSDKType {
  staking_rewards: string;
  community_pool: string;
}
export interface TakerFeesTracker {
  takerFeesToStakers: Coin[];
  takerFeesToCommunityPool: Coin[];
  heightAccountingStartsFrom: bigint;
}
export interface TakerFeesTrackerProtoMsg {
  typeUrl: "/osmosis.poolmanager.v1beta1.TakerFeesTracker";
  value: Uint8Array;
}
export interface TakerFeesTrackerAmino {
  taker_fees_to_stakers?: CoinAmino[];
  taker_fees_to_community_pool?: CoinAmino[];
  height_accounting_starts_from?: string;
}
export interface TakerFeesTrackerAminoMsg {
  type: "osmosis/poolmanager/taker-fees-tracker";
  value: TakerFeesTrackerAmino;
}
export interface TakerFeesTrackerSDKType {
  taker_fees_to_stakers: CoinSDKType[];
  taker_fees_to_community_pool: CoinSDKType[];
  height_accounting_starts_from: bigint;
}
/**
 * PoolVolume stores the KVStore entries for each pool's volume, which
 * is used in export/import genesis.
 */
export interface PoolVolume {
  /** pool_id is the id of the pool. */
  poolId: bigint;
  /** pool_volume is the cumulative volume of the pool. */
  poolVolume: Coin[];
}
export interface PoolVolumeProtoMsg {
  typeUrl: "/osmosis.poolmanager.v1beta1.PoolVolume";
  value: Uint8Array;
}
/**
 * PoolVolume stores the KVStore entries for each pool's volume, which
 * is used in export/import genesis.
 */
export interface PoolVolumeAmino {
  /** pool_id is the id of the pool. */
  pool_id?: string;
  /** pool_volume is the cumulative volume of the pool. */
  pool_volume?: CoinAmino[];
}
export interface PoolVolumeAminoMsg {
  type: "osmosis/poolmanager/pool-volume";
  value: PoolVolumeAmino;
}
/**
 * PoolVolume stores the KVStore entries for each pool's volume, which
 * is used in export/import genesis.
 */
export interface PoolVolumeSDKType {
  pool_id: bigint;
  pool_volume: CoinSDKType[];
}
function createBaseParams(): Params {
  return {
    poolCreationFee: [],
    takerFeeParams: TakerFeeParams.fromPartial({}),
    authorizedQuoteDenoms: [],
  };
}
export const Params = {
  typeUrl: "/osmosis.poolmanager.v1beta1.Params",
  encode(
    message: Params,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    for (const v of message.poolCreationFee) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.takerFeeParams !== undefined) {
      TakerFeeParams.encode(
        message.takerFeeParams,
        writer.uint32(18).fork()
      ).ldelim();
    }
    for (const v of message.authorizedQuoteDenoms) {
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
          message.poolCreationFee.push(Coin.decode(reader, reader.uint32()));
          break;
        case 2:
          message.takerFeeParams = TakerFeeParams.decode(
            reader,
            reader.uint32()
          );
          break;
        case 3:
          message.authorizedQuoteDenoms.push(reader.string());
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
    message.takerFeeParams =
      object.takerFeeParams !== undefined && object.takerFeeParams !== null
        ? TakerFeeParams.fromPartial(object.takerFeeParams)
        : undefined;
    message.authorizedQuoteDenoms =
      object.authorizedQuoteDenoms?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    const message = createBaseParams();
    message.poolCreationFee =
      object.pool_creation_fee?.map((e) => Coin.fromAmino(e)) || [];
    if (
      object.taker_fee_params !== undefined &&
      object.taker_fee_params !== null
    ) {
      message.takerFeeParams = TakerFeeParams.fromAmino(
        object.taker_fee_params
      );
    }
    message.authorizedQuoteDenoms =
      object.authorized_quote_denoms?.map((e) => e) || [];
    return message;
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    if (message.poolCreationFee) {
      obj.pool_creation_fee = message.poolCreationFee.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.pool_creation_fee = message.poolCreationFee;
    }
    obj.taker_fee_params = message.takerFeeParams
      ? TakerFeeParams.toAmino(message.takerFeeParams)
      : undefined;
    if (message.authorizedQuoteDenoms) {
      obj.authorized_quote_denoms = message.authorizedQuoteDenoms.map((e) => e);
    } else {
      obj.authorized_quote_denoms = message.authorizedQuoteDenoms;
    }
    return obj;
  },
  fromAminoMsg(object: ParamsAminoMsg): Params {
    return Params.fromAmino(object.value);
  },
  toAminoMsg(message: Params): ParamsAminoMsg {
    return {
      type: "osmosis/poolmanager/params",
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
      typeUrl: "/osmosis.poolmanager.v1beta1.Params",
      value: Params.encode(message).finish(),
    };
  },
};
function createBaseGenesisState(): GenesisState {
  return {
    nextPoolId: BigInt(0),
    params: Params.fromPartial({}),
    poolRoutes: [],
    takerFeesTracker: undefined,
    poolVolumes: [],
    denomPairTakerFeeStore: [],
  };
}
export const GenesisState = {
  typeUrl: "/osmosis.poolmanager.v1beta1.GenesisState",
  encode(
    message: GenesisState,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.nextPoolId !== BigInt(0)) {
      writer.uint32(8).uint64(message.nextPoolId);
    }
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.poolRoutes) {
      ModuleRoute.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.takerFeesTracker !== undefined) {
      TakerFeesTracker.encode(
        message.takerFeesTracker,
        writer.uint32(34).fork()
      ).ldelim();
    }
    for (const v of message.poolVolumes) {
      PoolVolume.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    for (const v of message.denomPairTakerFeeStore) {
      DenomPairTakerFee.encode(v!, writer.uint32(50).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): GenesisState {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.nextPoolId = reader.uint64();
          break;
        case 2:
          message.params = Params.decode(reader, reader.uint32());
          break;
        case 3:
          message.poolRoutes.push(ModuleRoute.decode(reader, reader.uint32()));
          break;
        case 4:
          message.takerFeesTracker = TakerFeesTracker.decode(
            reader,
            reader.uint32()
          );
          break;
        case 5:
          message.poolVolumes.push(PoolVolume.decode(reader, reader.uint32()));
          break;
        case 6:
          message.denomPairTakerFeeStore.push(
            DenomPairTakerFee.decode(reader, reader.uint32())
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
    message.nextPoolId =
      object.nextPoolId !== undefined && object.nextPoolId !== null
        ? BigInt(object.nextPoolId.toString())
        : BigInt(0);
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    message.poolRoutes =
      object.poolRoutes?.map((e) => ModuleRoute.fromPartial(e)) || [];
    message.takerFeesTracker =
      object.takerFeesTracker !== undefined && object.takerFeesTracker !== null
        ? TakerFeesTracker.fromPartial(object.takerFeesTracker)
        : undefined;
    message.poolVolumes =
      object.poolVolumes?.map((e) => PoolVolume.fromPartial(e)) || [];
    message.denomPairTakerFeeStore =
      object.denomPairTakerFeeStore?.map((e) =>
        DenomPairTakerFee.fromPartial(e)
      ) || [];
    return message;
  },
  fromAmino(object: GenesisStateAmino): GenesisState {
    const message = createBaseGenesisState();
    if (object.next_pool_id !== undefined && object.next_pool_id !== null) {
      message.nextPoolId = BigInt(object.next_pool_id);
    }
    if (object.params !== undefined && object.params !== null) {
      message.params = Params.fromAmino(object.params);
    }
    message.poolRoutes =
      object.pool_routes?.map((e) => ModuleRoute.fromAmino(e)) || [];
    if (
      object.taker_fees_tracker !== undefined &&
      object.taker_fees_tracker !== null
    ) {
      message.takerFeesTracker = TakerFeesTracker.fromAmino(
        object.taker_fees_tracker
      );
    }
    message.poolVolumes =
      object.pool_volumes?.map((e) => PoolVolume.fromAmino(e)) || [];
    message.denomPairTakerFeeStore =
      object.denom_pair_taker_fee_store?.map((e) =>
        DenomPairTakerFee.fromAmino(e)
      ) || [];
    return message;
  },
  toAmino(message: GenesisState): GenesisStateAmino {
    const obj: any = {};
    obj.next_pool_id =
      message.nextPoolId !== BigInt(0)
        ? message.nextPoolId.toString()
        : undefined;
    obj.params = message.params ? Params.toAmino(message.params) : undefined;
    if (message.poolRoutes) {
      obj.pool_routes = message.poolRoutes.map((e) =>
        e ? ModuleRoute.toAmino(e) : undefined
      );
    } else {
      obj.pool_routes = message.poolRoutes;
    }
    obj.taker_fees_tracker = message.takerFeesTracker
      ? TakerFeesTracker.toAmino(message.takerFeesTracker)
      : undefined;
    if (message.poolVolumes) {
      obj.pool_volumes = message.poolVolumes.map((e) =>
        e ? PoolVolume.toAmino(e) : undefined
      );
    } else {
      obj.pool_volumes = message.poolVolumes;
    }
    if (message.denomPairTakerFeeStore) {
      obj.denom_pair_taker_fee_store = message.denomPairTakerFeeStore.map((e) =>
        e ? DenomPairTakerFee.toAmino(e) : undefined
      );
    } else {
      obj.denom_pair_taker_fee_store = message.denomPairTakerFeeStore;
    }
    return obj;
  },
  fromAminoMsg(object: GenesisStateAminoMsg): GenesisState {
    return GenesisState.fromAmino(object.value);
  },
  toAminoMsg(message: GenesisState): GenesisStateAminoMsg {
    return {
      type: "osmosis/poolmanager/genesis-state",
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
      typeUrl: "/osmosis.poolmanager.v1beta1.GenesisState",
      value: GenesisState.encode(message).finish(),
    };
  },
};
function createBaseTakerFeeParams(): TakerFeeParams {
  return {
    defaultTakerFee: "",
    osmoTakerFeeDistribution: TakerFeeDistributionPercentage.fromPartial({}),
    nonOsmoTakerFeeDistribution: TakerFeeDistributionPercentage.fromPartial({}),
    adminAddresses: [],
    communityPoolDenomToSwapNonWhitelistedAssetsTo: "",
    reducedFeeWhitelist: [],
  };
}
export const TakerFeeParams = {
  typeUrl: "/osmosis.poolmanager.v1beta1.TakerFeeParams",
  encode(
    message: TakerFeeParams,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.defaultTakerFee !== "") {
      writer
        .uint32(10)
        .string(Decimal.fromUserInput(message.defaultTakerFee, 18).atomics);
    }
    if (message.osmoTakerFeeDistribution !== undefined) {
      TakerFeeDistributionPercentage.encode(
        message.osmoTakerFeeDistribution,
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.nonOsmoTakerFeeDistribution !== undefined) {
      TakerFeeDistributionPercentage.encode(
        message.nonOsmoTakerFeeDistribution,
        writer.uint32(26).fork()
      ).ldelim();
    }
    for (const v of message.adminAddresses) {
      writer.uint32(34).string(v!);
    }
    if (message.communityPoolDenomToSwapNonWhitelistedAssetsTo !== "") {
      writer
        .uint32(42)
        .string(message.communityPoolDenomToSwapNonWhitelistedAssetsTo);
    }
    for (const v of message.reducedFeeWhitelist) {
      writer.uint32(50).string(v!);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): TakerFeeParams {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTakerFeeParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.defaultTakerFee = Decimal.fromAtomics(
            reader.string(),
            18
          ).toString();
          break;
        case 2:
          message.osmoTakerFeeDistribution =
            TakerFeeDistributionPercentage.decode(reader, reader.uint32());
          break;
        case 3:
          message.nonOsmoTakerFeeDistribution =
            TakerFeeDistributionPercentage.decode(reader, reader.uint32());
          break;
        case 4:
          message.adminAddresses.push(reader.string());
          break;
        case 5:
          message.communityPoolDenomToSwapNonWhitelistedAssetsTo =
            reader.string();
          break;
        case 6:
          message.reducedFeeWhitelist.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<TakerFeeParams>): TakerFeeParams {
    const message = createBaseTakerFeeParams();
    message.defaultTakerFee = object.defaultTakerFee ?? "";
    message.osmoTakerFeeDistribution =
      object.osmoTakerFeeDistribution !== undefined &&
      object.osmoTakerFeeDistribution !== null
        ? TakerFeeDistributionPercentage.fromPartial(
            object.osmoTakerFeeDistribution
          )
        : undefined;
    message.nonOsmoTakerFeeDistribution =
      object.nonOsmoTakerFeeDistribution !== undefined &&
      object.nonOsmoTakerFeeDistribution !== null
        ? TakerFeeDistributionPercentage.fromPartial(
            object.nonOsmoTakerFeeDistribution
          )
        : undefined;
    message.adminAddresses = object.adminAddresses?.map((e) => e) || [];
    message.communityPoolDenomToSwapNonWhitelistedAssetsTo =
      object.communityPoolDenomToSwapNonWhitelistedAssetsTo ?? "";
    message.reducedFeeWhitelist =
      object.reducedFeeWhitelist?.map((e) => e) || [];
    return message;
  },
  fromAmino(object: TakerFeeParamsAmino): TakerFeeParams {
    const message = createBaseTakerFeeParams();
    if (
      object.default_taker_fee !== undefined &&
      object.default_taker_fee !== null
    ) {
      message.defaultTakerFee = object.default_taker_fee;
    }
    if (
      object.osmo_taker_fee_distribution !== undefined &&
      object.osmo_taker_fee_distribution !== null
    ) {
      message.osmoTakerFeeDistribution =
        TakerFeeDistributionPercentage.fromAmino(
          object.osmo_taker_fee_distribution
        );
    }
    if (
      object.non_osmo_taker_fee_distribution !== undefined &&
      object.non_osmo_taker_fee_distribution !== null
    ) {
      message.nonOsmoTakerFeeDistribution =
        TakerFeeDistributionPercentage.fromAmino(
          object.non_osmo_taker_fee_distribution
        );
    }
    message.adminAddresses = object.admin_addresses?.map((e) => e) || [];
    if (
      object.community_pool_denom_to_swap_non_whitelisted_assets_to !==
        undefined &&
      object.community_pool_denom_to_swap_non_whitelisted_assets_to !== null
    ) {
      message.communityPoolDenomToSwapNonWhitelistedAssetsTo =
        object.community_pool_denom_to_swap_non_whitelisted_assets_to;
    }
    message.reducedFeeWhitelist =
      object.reduced_fee_whitelist?.map((e) => e) || [];
    return message;
  },
  toAmino(message: TakerFeeParams): TakerFeeParamsAmino {
    const obj: any = {};
    obj.default_taker_fee =
      message.defaultTakerFee === "" ? undefined : message.defaultTakerFee;
    obj.osmo_taker_fee_distribution = message.osmoTakerFeeDistribution
      ? TakerFeeDistributionPercentage.toAmino(message.osmoTakerFeeDistribution)
      : undefined;
    obj.non_osmo_taker_fee_distribution = message.nonOsmoTakerFeeDistribution
      ? TakerFeeDistributionPercentage.toAmino(
          message.nonOsmoTakerFeeDistribution
        )
      : undefined;
    if (message.adminAddresses) {
      obj.admin_addresses = message.adminAddresses.map((e) => e);
    } else {
      obj.admin_addresses = message.adminAddresses;
    }
    obj.community_pool_denom_to_swap_non_whitelisted_assets_to =
      message.communityPoolDenomToSwapNonWhitelistedAssetsTo === ""
        ? undefined
        : message.communityPoolDenomToSwapNonWhitelistedAssetsTo;
    if (message.reducedFeeWhitelist) {
      obj.reduced_fee_whitelist = message.reducedFeeWhitelist.map((e) => e);
    } else {
      obj.reduced_fee_whitelist = message.reducedFeeWhitelist;
    }
    return obj;
  },
  fromAminoMsg(object: TakerFeeParamsAminoMsg): TakerFeeParams {
    return TakerFeeParams.fromAmino(object.value);
  },
  toAminoMsg(message: TakerFeeParams): TakerFeeParamsAminoMsg {
    return {
      type: "osmosis/poolmanager/taker-fee-params",
      value: TakerFeeParams.toAmino(message),
    };
  },
  fromProtoMsg(message: TakerFeeParamsProtoMsg): TakerFeeParams {
    return TakerFeeParams.decode(message.value);
  },
  toProto(message: TakerFeeParams): Uint8Array {
    return TakerFeeParams.encode(message).finish();
  },
  toProtoMsg(message: TakerFeeParams): TakerFeeParamsProtoMsg {
    return {
      typeUrl: "/osmosis.poolmanager.v1beta1.TakerFeeParams",
      value: TakerFeeParams.encode(message).finish(),
    };
  },
};
function createBaseTakerFeeDistributionPercentage(): TakerFeeDistributionPercentage {
  return {
    stakingRewards: "",
    communityPool: "",
  };
}
export const TakerFeeDistributionPercentage = {
  typeUrl: "/osmosis.poolmanager.v1beta1.TakerFeeDistributionPercentage",
  encode(
    message: TakerFeeDistributionPercentage,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.stakingRewards !== "") {
      writer
        .uint32(10)
        .string(Decimal.fromUserInput(message.stakingRewards, 18).atomics);
    }
    if (message.communityPool !== "") {
      writer
        .uint32(18)
        .string(Decimal.fromUserInput(message.communityPool, 18).atomics);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): TakerFeeDistributionPercentage {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTakerFeeDistributionPercentage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.stakingRewards = Decimal.fromAtomics(
            reader.string(),
            18
          ).toString();
          break;
        case 2:
          message.communityPool = Decimal.fromAtomics(
            reader.string(),
            18
          ).toString();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<TakerFeeDistributionPercentage>
  ): TakerFeeDistributionPercentage {
    const message = createBaseTakerFeeDistributionPercentage();
    message.stakingRewards = object.stakingRewards ?? "";
    message.communityPool = object.communityPool ?? "";
    return message;
  },
  fromAmino(
    object: TakerFeeDistributionPercentageAmino
  ): TakerFeeDistributionPercentage {
    const message = createBaseTakerFeeDistributionPercentage();
    if (
      object.staking_rewards !== undefined &&
      object.staking_rewards !== null
    ) {
      message.stakingRewards = object.staking_rewards;
    }
    if (object.community_pool !== undefined && object.community_pool !== null) {
      message.communityPool = object.community_pool;
    }
    return message;
  },
  toAmino(
    message: TakerFeeDistributionPercentage
  ): TakerFeeDistributionPercentageAmino {
    const obj: any = {};
    obj.staking_rewards =
      message.stakingRewards === "" ? undefined : message.stakingRewards;
    obj.community_pool =
      message.communityPool === "" ? undefined : message.communityPool;
    return obj;
  },
  fromAminoMsg(
    object: TakerFeeDistributionPercentageAminoMsg
  ): TakerFeeDistributionPercentage {
    return TakerFeeDistributionPercentage.fromAmino(object.value);
  },
  toAminoMsg(
    message: TakerFeeDistributionPercentage
  ): TakerFeeDistributionPercentageAminoMsg {
    return {
      type: "osmosis/poolmanager/taker-fee-distribution-percentage",
      value: TakerFeeDistributionPercentage.toAmino(message),
    };
  },
  fromProtoMsg(
    message: TakerFeeDistributionPercentageProtoMsg
  ): TakerFeeDistributionPercentage {
    return TakerFeeDistributionPercentage.decode(message.value);
  },
  toProto(message: TakerFeeDistributionPercentage): Uint8Array {
    return TakerFeeDistributionPercentage.encode(message).finish();
  },
  toProtoMsg(
    message: TakerFeeDistributionPercentage
  ): TakerFeeDistributionPercentageProtoMsg {
    return {
      typeUrl: "/osmosis.poolmanager.v1beta1.TakerFeeDistributionPercentage",
      value: TakerFeeDistributionPercentage.encode(message).finish(),
    };
  },
};
function createBaseTakerFeesTracker(): TakerFeesTracker {
  return {
    takerFeesToStakers: [],
    takerFeesToCommunityPool: [],
    heightAccountingStartsFrom: BigInt(0),
  };
}
export const TakerFeesTracker = {
  typeUrl: "/osmosis.poolmanager.v1beta1.TakerFeesTracker",
  encode(
    message: TakerFeesTracker,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    for (const v of message.takerFeesToStakers) {
      Coin.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.takerFeesToCommunityPool) {
      Coin.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.heightAccountingStartsFrom !== BigInt(0)) {
      writer.uint32(24).int64(message.heightAccountingStartsFrom);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): TakerFeesTracker {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTakerFeesTracker();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.takerFeesToStakers.push(Coin.decode(reader, reader.uint32()));
          break;
        case 2:
          message.takerFeesToCommunityPool.push(
            Coin.decode(reader, reader.uint32())
          );
          break;
        case 3:
          message.heightAccountingStartsFrom = reader.int64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<TakerFeesTracker>): TakerFeesTracker {
    const message = createBaseTakerFeesTracker();
    message.takerFeesToStakers =
      object.takerFeesToStakers?.map((e) => Coin.fromPartial(e)) || [];
    message.takerFeesToCommunityPool =
      object.takerFeesToCommunityPool?.map((e) => Coin.fromPartial(e)) || [];
    message.heightAccountingStartsFrom =
      object.heightAccountingStartsFrom !== undefined &&
      object.heightAccountingStartsFrom !== null
        ? BigInt(object.heightAccountingStartsFrom.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: TakerFeesTrackerAmino): TakerFeesTracker {
    const message = createBaseTakerFeesTracker();
    message.takerFeesToStakers =
      object.taker_fees_to_stakers?.map((e) => Coin.fromAmino(e)) || [];
    message.takerFeesToCommunityPool =
      object.taker_fees_to_community_pool?.map((e) => Coin.fromAmino(e)) || [];
    if (
      object.height_accounting_starts_from !== undefined &&
      object.height_accounting_starts_from !== null
    ) {
      message.heightAccountingStartsFrom = BigInt(
        object.height_accounting_starts_from
      );
    }
    return message;
  },
  toAmino(message: TakerFeesTracker): TakerFeesTrackerAmino {
    const obj: any = {};
    if (message.takerFeesToStakers) {
      obj.taker_fees_to_stakers = message.takerFeesToStakers.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.taker_fees_to_stakers = message.takerFeesToStakers;
    }
    if (message.takerFeesToCommunityPool) {
      obj.taker_fees_to_community_pool = message.takerFeesToCommunityPool.map(
        (e) => (e ? Coin.toAmino(e) : undefined)
      );
    } else {
      obj.taker_fees_to_community_pool = message.takerFeesToCommunityPool;
    }
    obj.height_accounting_starts_from =
      message.heightAccountingStartsFrom !== BigInt(0)
        ? message.heightAccountingStartsFrom.toString()
        : undefined;
    return obj;
  },
  fromAminoMsg(object: TakerFeesTrackerAminoMsg): TakerFeesTracker {
    return TakerFeesTracker.fromAmino(object.value);
  },
  toAminoMsg(message: TakerFeesTracker): TakerFeesTrackerAminoMsg {
    return {
      type: "osmosis/poolmanager/taker-fees-tracker",
      value: TakerFeesTracker.toAmino(message),
    };
  },
  fromProtoMsg(message: TakerFeesTrackerProtoMsg): TakerFeesTracker {
    return TakerFeesTracker.decode(message.value);
  },
  toProto(message: TakerFeesTracker): Uint8Array {
    return TakerFeesTracker.encode(message).finish();
  },
  toProtoMsg(message: TakerFeesTracker): TakerFeesTrackerProtoMsg {
    return {
      typeUrl: "/osmosis.poolmanager.v1beta1.TakerFeesTracker",
      value: TakerFeesTracker.encode(message).finish(),
    };
  },
};
function createBasePoolVolume(): PoolVolume {
  return {
    poolId: BigInt(0),
    poolVolume: [],
  };
}
export const PoolVolume = {
  typeUrl: "/osmosis.poolmanager.v1beta1.PoolVolume",
  encode(
    message: PoolVolume,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.poolId !== BigInt(0)) {
      writer.uint32(8).uint64(message.poolId);
    }
    for (const v of message.poolVolume) {
      Coin.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): PoolVolume {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePoolVolume();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.poolId = reader.uint64();
          break;
        case 2:
          message.poolVolume.push(Coin.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<PoolVolume>): PoolVolume {
    const message = createBasePoolVolume();
    message.poolId =
      object.poolId !== undefined && object.poolId !== null
        ? BigInt(object.poolId.toString())
        : BigInt(0);
    message.poolVolume =
      object.poolVolume?.map((e) => Coin.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: PoolVolumeAmino): PoolVolume {
    const message = createBasePoolVolume();
    if (object.pool_id !== undefined && object.pool_id !== null) {
      message.poolId = BigInt(object.pool_id);
    }
    message.poolVolume =
      object.pool_volume?.map((e) => Coin.fromAmino(e)) || [];
    return message;
  },
  toAmino(message: PoolVolume): PoolVolumeAmino {
    const obj: any = {};
    obj.pool_id =
      message.poolId !== BigInt(0) ? message.poolId.toString() : undefined;
    if (message.poolVolume) {
      obj.pool_volume = message.poolVolume.map((e) =>
        e ? Coin.toAmino(e) : undefined
      );
    } else {
      obj.pool_volume = message.poolVolume;
    }
    return obj;
  },
  fromAminoMsg(object: PoolVolumeAminoMsg): PoolVolume {
    return PoolVolume.fromAmino(object.value);
  },
  toAminoMsg(message: PoolVolume): PoolVolumeAminoMsg {
    return {
      type: "osmosis/poolmanager/pool-volume",
      value: PoolVolume.toAmino(message),
    };
  },
  fromProtoMsg(message: PoolVolumeProtoMsg): PoolVolume {
    return PoolVolume.decode(message.value);
  },
  toProto(message: PoolVolume): Uint8Array {
    return PoolVolume.encode(message).finish();
  },
  toProtoMsg(message: PoolVolume): PoolVolumeProtoMsg {
    return {
      typeUrl: "/osmosis.poolmanager.v1beta1.PoolVolume",
      value: PoolVolume.encode(message).finish(),
    };
  },
};
