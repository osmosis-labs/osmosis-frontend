//@ts-nocheck
import { Decimal } from "@cosmjs/math";

import { BinaryReader, BinaryWriter } from "../../binary";
import {
  Duration,
  DurationAmino,
  DurationSDKType,
} from "../../google/protobuf/duration";
export interface Params {
  /**
   * authorized_tick_spacing is an array of uint64s that represents the tick
   * spacing values concentrated-liquidity pools can be created with. For
   * example, an authorized_tick_spacing of [1, 10, 30] allows for pools
   * to be created with tick spacing of 1, 10, or 30.
   */
  authorizedTickSpacing: bigint[];
  authorizedSpreadFactors: string[];
  /**
   * balancer_shares_reward_discount is the rate by which incentives flowing
   * from CL to Balancer pools will be discounted to encourage LPs to migrate.
   * e.g. a rate of 0.05 means Balancer LPs get 5% less incentives than full
   * range CL LPs.
   * This field can range from (0,1]. If set to 1, it indicates that all
   * incentives stay at cl pool.
   */
  balancerSharesRewardDiscount: string;
  /**
   * authorized_quote_denoms is a list of quote denoms that can be used as
   * token1 when creating a pool. We limit the quote assets to a small set for
   * the purposes of having convinient price increments stemming from tick to
   * price conversion. These increments are in a human readable magnitude only
   * for token1 as a quote. For limit orders in the future, this will be a
   * desirable property in terms of UX as to allow users to set limit orders at
   * prices in terms of token1 (quote asset) that are easy to reason about.
   */
  authorizedQuoteDenoms: string[];
  authorizedUptimes: Duration[];
  /**
   * is_permissionless_pool_creation_enabled is a boolean that determines if
   * concentrated liquidity pools can be created via message. At launch,
   * we consider allowing only governance to create pools, and then later
   * allowing permissionless pool creation by switching this flag to true
   * with a governance proposal.
   */
  isPermissionlessPoolCreationEnabled: boolean;
  /**
   * unrestricted_pool_creator_whitelist is a list of addresses that are
   * allowed to bypass restrictions on permissionless supercharged pool
   * creation, like pool_creation_enabled, restricted quote assets, no
   * double creation of pools, etc.
   */
  unrestrictedPoolCreatorWhitelist: string[];
  hookGasLimit: bigint;
}
export interface ParamsProtoMsg {
  typeUrl: "/osmosis.concentratedliquidity.Params";
  value: Uint8Array;
}
export interface ParamsAmino {
  /**
   * authorized_tick_spacing is an array of uint64s that represents the tick
   * spacing values concentrated-liquidity pools can be created with. For
   * example, an authorized_tick_spacing of [1, 10, 30] allows for pools
   * to be created with tick spacing of 1, 10, or 30.
   */
  authorized_tick_spacing?: string[];
  authorized_spread_factors?: string[];
  /**
   * balancer_shares_reward_discount is the rate by which incentives flowing
   * from CL to Balancer pools will be discounted to encourage LPs to migrate.
   * e.g. a rate of 0.05 means Balancer LPs get 5% less incentives than full
   * range CL LPs.
   * This field can range from (0,1]. If set to 1, it indicates that all
   * incentives stay at cl pool.
   */
  balancer_shares_reward_discount?: string;
  /**
   * authorized_quote_denoms is a list of quote denoms that can be used as
   * token1 when creating a pool. We limit the quote assets to a small set for
   * the purposes of having convinient price increments stemming from tick to
   * price conversion. These increments are in a human readable magnitude only
   * for token1 as a quote. For limit orders in the future, this will be a
   * desirable property in terms of UX as to allow users to set limit orders at
   * prices in terms of token1 (quote asset) that are easy to reason about.
   */
  authorized_quote_denoms?: string[];
  authorized_uptimes?: DurationAmino[];
  /**
   * is_permissionless_pool_creation_enabled is a boolean that determines if
   * concentrated liquidity pools can be created via message. At launch,
   * we consider allowing only governance to create pools, and then later
   * allowing permissionless pool creation by switching this flag to true
   * with a governance proposal.
   */
  is_permissionless_pool_creation_enabled?: boolean;
  /**
   * unrestricted_pool_creator_whitelist is a list of addresses that are
   * allowed to bypass restrictions on permissionless supercharged pool
   * creation, like pool_creation_enabled, restricted quote assets, no
   * double creation of pools, etc.
   */
  unrestricted_pool_creator_whitelist?: string[];
  hook_gas_limit?: string;
}
export interface ParamsAminoMsg {
  type: "osmosis/concentratedliquidity/params";
  value: ParamsAmino;
}
export interface ParamsSDKType {
  authorized_tick_spacing: bigint[];
  authorized_spread_factors: string[];
  balancer_shares_reward_discount: string;
  authorized_quote_denoms: string[];
  authorized_uptimes: DurationSDKType[];
  is_permissionless_pool_creation_enabled: boolean;
  unrestricted_pool_creator_whitelist: string[];
  hook_gas_limit: bigint;
}
function createBaseParams(): Params {
  return {
    authorizedTickSpacing: [],
    authorizedSpreadFactors: [],
    balancerSharesRewardDiscount: "",
    authorizedQuoteDenoms: [],
    authorizedUptimes: [],
    isPermissionlessPoolCreationEnabled: false,
    unrestrictedPoolCreatorWhitelist: [],
    hookGasLimit: BigInt(0),
  };
}
export const Params = {
  typeUrl: "/osmosis.concentratedliquidity.Params",
  encode(
    message: Params,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    writer.uint32(10).fork();
    for (const v of message.authorizedTickSpacing) {
      writer.uint64(v);
    }
    writer.ldelim();
    for (const v of message.authorizedSpreadFactors) {
      writer.uint32(18).string(Decimal.fromUserInput(v!, 18).atomics);
    }
    if (message.balancerSharesRewardDiscount !== "") {
      writer
        .uint32(26)
        .string(
          Decimal.fromUserInput(message.balancerSharesRewardDiscount, 18)
            .atomics
        );
    }
    for (const v of message.authorizedQuoteDenoms) {
      writer.uint32(34).string(v!);
    }
    for (const v of message.authorizedUptimes) {
      Duration.encode(v!, writer.uint32(42).fork()).ldelim();
    }
    if (message.isPermissionlessPoolCreationEnabled === true) {
      writer.uint32(48).bool(message.isPermissionlessPoolCreationEnabled);
    }
    for (const v of message.unrestrictedPoolCreatorWhitelist) {
      writer.uint32(58).string(v!);
    }
    if (message.hookGasLimit !== BigInt(0)) {
      writer.uint32(64).uint64(message.hookGasLimit);
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
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.authorizedTickSpacing.push(reader.uint64());
            }
          } else {
            message.authorizedTickSpacing.push(reader.uint64());
          }
          break;
        case 2:
          message.authorizedSpreadFactors.push(
            Decimal.fromAtomics(reader.string(), 18).toString()
          );
          break;
        case 3:
          message.balancerSharesRewardDiscount = Decimal.fromAtomics(
            reader.string(),
            18
          ).toString();
          break;
        case 4:
          message.authorizedQuoteDenoms.push(reader.string());
          break;
        case 5:
          message.authorizedUptimes.push(
            Duration.decode(reader, reader.uint32())
          );
          break;
        case 6:
          message.isPermissionlessPoolCreationEnabled = reader.bool();
          break;
        case 7:
          message.unrestrictedPoolCreatorWhitelist.push(reader.string());
          break;
        case 8:
          message.hookGasLimit = reader.uint64();
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
    message.authorizedTickSpacing =
      object.authorizedTickSpacing?.map((e) => BigInt(e.toString())) || [];
    message.authorizedSpreadFactors =
      object.authorizedSpreadFactors?.map((e) => e) || [];
    message.balancerSharesRewardDiscount =
      object.balancerSharesRewardDiscount ?? "";
    message.authorizedQuoteDenoms =
      object.authorizedQuoteDenoms?.map((e) => e) || [];
    message.authorizedUptimes =
      object.authorizedUptimes?.map((e) => Duration.fromPartial(e)) || [];
    message.isPermissionlessPoolCreationEnabled =
      object.isPermissionlessPoolCreationEnabled ?? false;
    message.unrestrictedPoolCreatorWhitelist =
      object.unrestrictedPoolCreatorWhitelist?.map((e) => e) || [];
    message.hookGasLimit =
      object.hookGasLimit !== undefined && object.hookGasLimit !== null
        ? BigInt(object.hookGasLimit.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    const message = createBaseParams();
    message.authorizedTickSpacing =
      object.authorized_tick_spacing?.map((e) => BigInt(e)) || [];
    message.authorizedSpreadFactors =
      object.authorized_spread_factors?.map((e) => e) || [];
    if (
      object.balancer_shares_reward_discount !== undefined &&
      object.balancer_shares_reward_discount !== null
    ) {
      message.balancerSharesRewardDiscount =
        object.balancer_shares_reward_discount;
    }
    message.authorizedQuoteDenoms =
      object.authorized_quote_denoms?.map((e) => e) || [];
    message.authorizedUptimes =
      object.authorized_uptimes?.map((e) => Duration.fromAmino(e)) || [];
    if (
      object.is_permissionless_pool_creation_enabled !== undefined &&
      object.is_permissionless_pool_creation_enabled !== null
    ) {
      message.isPermissionlessPoolCreationEnabled =
        object.is_permissionless_pool_creation_enabled;
    }
    message.unrestrictedPoolCreatorWhitelist =
      object.unrestricted_pool_creator_whitelist?.map((e) => e) || [];
    if (object.hook_gas_limit !== undefined && object.hook_gas_limit !== null) {
      message.hookGasLimit = BigInt(object.hook_gas_limit);
    }
    return message;
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    if (message.authorizedTickSpacing) {
      obj.authorized_tick_spacing = message.authorizedTickSpacing.map((e) =>
        e.toString()
      );
    } else {
      obj.authorized_tick_spacing = message.authorizedTickSpacing;
    }
    if (message.authorizedSpreadFactors) {
      obj.authorized_spread_factors = message.authorizedSpreadFactors.map(
        (e) => e
      );
    } else {
      obj.authorized_spread_factors = message.authorizedSpreadFactors;
    }
    obj.balancer_shares_reward_discount =
      message.balancerSharesRewardDiscount === ""
        ? undefined
        : message.balancerSharesRewardDiscount;
    if (message.authorizedQuoteDenoms) {
      obj.authorized_quote_denoms = message.authorizedQuoteDenoms.map((e) => e);
    } else {
      obj.authorized_quote_denoms = message.authorizedQuoteDenoms;
    }
    if (message.authorizedUptimes) {
      obj.authorized_uptimes = message.authorizedUptimes.map((e) =>
        e ? Duration.toAmino(e) : undefined
      );
    } else {
      obj.authorized_uptimes = message.authorizedUptimes;
    }
    obj.is_permissionless_pool_creation_enabled =
      message.isPermissionlessPoolCreationEnabled === false
        ? undefined
        : message.isPermissionlessPoolCreationEnabled;
    if (message.unrestrictedPoolCreatorWhitelist) {
      obj.unrestricted_pool_creator_whitelist =
        message.unrestrictedPoolCreatorWhitelist.map((e) => e);
    } else {
      obj.unrestricted_pool_creator_whitelist =
        message.unrestrictedPoolCreatorWhitelist;
    }
    obj.hook_gas_limit =
      message.hookGasLimit !== BigInt(0)
        ? message.hookGasLimit.toString()
        : undefined;
    return obj;
  },
  fromAminoMsg(object: ParamsAminoMsg): Params {
    return Params.fromAmino(object.value);
  },
  toAminoMsg(message: Params): ParamsAminoMsg {
    return {
      type: "osmosis/concentratedliquidity/params",
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
      typeUrl: "/osmosis.concentratedliquidity.Params",
      value: Params.encode(message).finish(),
    };
  },
};
