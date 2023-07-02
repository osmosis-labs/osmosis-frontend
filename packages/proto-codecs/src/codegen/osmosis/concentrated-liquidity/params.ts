//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import {
  Duration,
  DurationAmino,
  DurationSDKType,
} from "../../google/protobuf/duration";
import { Long } from "../../helpers";
export interface Params {
  /**
   * authorized_tick_spacing is an array of uint64s that represents the tick
   * spacing values concentrated-liquidity pools can be created with. For
   * example, an authorized_tick_spacing of [1, 10, 30] allows for pools
   * to be created with tick spacing of 1, 10, or 30.
   */
  authorizedTickSpacing: Long[];
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
  authorized_tick_spacing: string[];
  authorized_spread_factors: string[];
  /**
   * balancer_shares_reward_discount is the rate by which incentives flowing
   * from CL to Balancer pools will be discounted to encourage LPs to migrate.
   * e.g. a rate of 0.05 means Balancer LPs get 5% less incentives than full
   * range CL LPs.
   * This field can range from (0,1]. If set to 1, it indicates that all
   * incentives stay at cl pool.
   */
  balancer_shares_reward_discount: string;
  /**
   * authorized_quote_denoms is a list of quote denoms that can be used as
   * token1 when creating a pool. We limit the quote assets to a small set for
   * the purposes of having convinient price increments stemming from tick to
   * price conversion. These increments are in a human readable magnitude only
   * for token1 as a quote. For limit orders in the future, this will be a
   * desirable property in terms of UX as to allow users to set limit orders at
   * prices in terms of token1 (quote asset) that are easy to reason about.
   */
  authorized_quote_denoms: string[];
  authorized_uptimes: DurationAmino[];
  /**
   * is_permissionless_pool_creation_enabled is a boolean that determines if
   * concentrated liquidity pools can be created via message. At launch,
   * we consider allowing only governance to create pools, and then later
   * allowing permissionless pool creation by switching this flag to true
   * with a governance proposal.
   */
  is_permissionless_pool_creation_enabled: boolean;
}
export interface ParamsAminoMsg {
  type: "osmosis/concentratedliquidity/params";
  value: ParamsAmino;
}
export interface ParamsSDKType {
  authorized_tick_spacing: Long[];
  authorized_spread_factors: string[];
  balancer_shares_reward_discount: string;
  authorized_quote_denoms: string[];
  authorized_uptimes: DurationSDKType[];
  is_permissionless_pool_creation_enabled: boolean;
}
function createBaseParams(): Params {
  return {
    authorizedTickSpacing: [],
    authorizedSpreadFactors: [],
    balancerSharesRewardDiscount: "",
    authorizedQuoteDenoms: [],
    authorizedUptimes: [],
    isPermissionlessPoolCreationEnabled: false,
  };
}
export const Params = {
  typeUrl: "/osmosis.concentratedliquidity.Params",
  encode(
    message: Params,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    writer.uint32(10).fork();
    for (const v of message.authorizedTickSpacing) {
      writer.uint64(v);
    }
    writer.ldelim();
    for (const v of message.authorizedSpreadFactors) {
      writer.uint32(18).string(v!);
    }
    if (message.balancerSharesRewardDiscount !== "") {
      writer.uint32(26).string(message.balancerSharesRewardDiscount);
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
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.authorizedTickSpacing.push(reader.uint64() as Long);
            }
          } else {
            message.authorizedTickSpacing.push(reader.uint64() as Long);
          }
          break;
        case 2:
          message.authorizedSpreadFactors.push(reader.string());
          break;
        case 3:
          message.balancerSharesRewardDiscount = reader.string();
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
      object.authorizedTickSpacing?.map((e) => Long.fromValue(e)) || [];
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
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    return {
      authorizedTickSpacing: Array.isArray(object?.authorized_tick_spacing)
        ? object.authorized_tick_spacing.map((e: any) => e)
        : [],
      authorizedSpreadFactors: Array.isArray(object?.authorized_spread_factors)
        ? object.authorized_spread_factors.map((e: any) => e)
        : [],
      balancerSharesRewardDiscount: object.balancer_shares_reward_discount,
      authorizedQuoteDenoms: Array.isArray(object?.authorized_quote_denoms)
        ? object.authorized_quote_denoms.map((e: any) => e)
        : [],
      authorizedUptimes: Array.isArray(object?.authorized_uptimes)
        ? object.authorized_uptimes.map((e: any) => Duration.fromAmino(e))
        : [],
      isPermissionlessPoolCreationEnabled:
        object.is_permissionless_pool_creation_enabled,
    };
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    if (message.authorizedTickSpacing) {
      obj.authorized_tick_spacing = message.authorizedTickSpacing.map((e) => e);
    } else {
      obj.authorized_tick_spacing = [];
    }
    if (message.authorizedSpreadFactors) {
      obj.authorized_spread_factors = message.authorizedSpreadFactors.map(
        (e) => e
      );
    } else {
      obj.authorized_spread_factors = [];
    }
    obj.balancer_shares_reward_discount = message.balancerSharesRewardDiscount;
    if (message.authorizedQuoteDenoms) {
      obj.authorized_quote_denoms = message.authorizedQuoteDenoms.map((e) => e);
    } else {
      obj.authorized_quote_denoms = [];
    }
    if (message.authorizedUptimes) {
      obj.authorized_uptimes = message.authorizedUptimes.map((e) =>
        e ? Duration.toAmino(e) : undefined
      );
    } else {
      obj.authorized_uptimes = [];
    }
    obj.is_permissionless_pool_creation_enabled =
      message.isPermissionlessPoolCreationEnabled;
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
