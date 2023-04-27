//@ts-nocheck
/* eslint-disable */
import { Long } from "../../../helpers";
import * as _m0 from "protobufjs/minimal";
/** Minter represents the minting state. */
export interface Minter {
  /** epoch_provisions represent rewards for the current epoch. */
  epochProvisions: string;
}
export interface MinterProtoMsg {
  typeUrl: "/osmosis.mint.v1beta1.Minter";
  value: Uint8Array;
}
/** Minter represents the minting state. */
export interface MinterAmino {
  /** epoch_provisions represent rewards for the current epoch. */
  epoch_provisions: string;
}
export interface MinterAminoMsg {
  type: "osmosis/mint/minter";
  value: MinterAmino;
}
/** Minter represents the minting state. */
export interface MinterSDKType {
  epoch_provisions: string;
}
/**
 * WeightedAddress represents an address with a weight assigned to it.
 * The weight is used to determine the proportion of the total minted
 * tokens to be minted to the address.
 */
export interface WeightedAddress {
  address: string;
  weight: string;
}
export interface WeightedAddressProtoMsg {
  typeUrl: "/osmosis.mint.v1beta1.WeightedAddress";
  value: Uint8Array;
}
/**
 * WeightedAddress represents an address with a weight assigned to it.
 * The weight is used to determine the proportion of the total minted
 * tokens to be minted to the address.
 */
export interface WeightedAddressAmino {
  address: string;
  weight: string;
}
export interface WeightedAddressAminoMsg {
  type: "osmosis/mint/weighted-address";
  value: WeightedAddressAmino;
}
/**
 * WeightedAddress represents an address with a weight assigned to it.
 * The weight is used to determine the proportion of the total minted
 * tokens to be minted to the address.
 */
export interface WeightedAddressSDKType {
  address: string;
  weight: string;
}
/**
 * DistributionProportions defines the distribution proportions of the minted
 * denom. In other words, defines which stakeholders will receive the minted
 * denoms and how much.
 */
export interface DistributionProportions {
  /**
   * staking defines the proportion of the minted mint_denom that is to be
   * allocated as staking rewards.
   */
  staking: string;
  /**
   * pool_incentives defines the proportion of the minted mint_denom that is
   * to be allocated as pool incentives.
   */
  poolIncentives: string;
  /**
   * developer_rewards defines the proportion of the minted mint_denom that is
   * to be allocated to developer rewards address.
   */
  developerRewards: string;
  /**
   * community_pool defines the proportion of the minted mint_denom that is
   * to be allocated to the community pool.
   */
  communityPool: string;
}
export interface DistributionProportionsProtoMsg {
  typeUrl: "/osmosis.mint.v1beta1.DistributionProportions";
  value: Uint8Array;
}
/**
 * DistributionProportions defines the distribution proportions of the minted
 * denom. In other words, defines which stakeholders will receive the minted
 * denoms and how much.
 */
export interface DistributionProportionsAmino {
  /**
   * staking defines the proportion of the minted mint_denom that is to be
   * allocated as staking rewards.
   */
  staking: string;
  /**
   * pool_incentives defines the proportion of the minted mint_denom that is
   * to be allocated as pool incentives.
   */
  pool_incentives: string;
  /**
   * developer_rewards defines the proportion of the minted mint_denom that is
   * to be allocated to developer rewards address.
   */
  developer_rewards: string;
  /**
   * community_pool defines the proportion of the minted mint_denom that is
   * to be allocated to the community pool.
   */
  community_pool: string;
}
export interface DistributionProportionsAminoMsg {
  type: "osmosis/mint/distribution-proportions";
  value: DistributionProportionsAmino;
}
/**
 * DistributionProportions defines the distribution proportions of the minted
 * denom. In other words, defines which stakeholders will receive the minted
 * denoms and how much.
 */
export interface DistributionProportionsSDKType {
  staking: string;
  pool_incentives: string;
  developer_rewards: string;
  community_pool: string;
}
/** Params holds parameters for the x/mint module. */
export interface Params {
  /** mint_denom is the denom of the coin to mint. */
  mintDenom: string;
  /** genesis_epoch_provisions epoch provisions from the first epoch. */
  genesisEpochProvisions: string;
  /** epoch_identifier mint epoch identifier e.g. (day, week). */
  epochIdentifier: string;
  /**
   * reduction_period_in_epochs the number of epochs it takes
   * to reduce the rewards.
   */
  reductionPeriodInEpochs: Long;
  /**
   * reduction_factor is the reduction multiplier to execute
   * at the end of each period set by reduction_period_in_epochs.
   */
  reductionFactor: string;
  /**
   * distribution_proportions defines the distribution proportions of the minted
   * denom. In other words, defines which stakeholders will receive the minted
   * denoms and how much.
   */
  distributionProportions?: DistributionProportions;
  /**
   * weighted_developer_rewards_receivers is the address to receive developer
   * rewards with weights assignedt to each address. The final amount that each
   * address receives is: epoch_provisions *
   * distribution_proportions.developer_rewards * Address's Weight.
   */
  weightedDeveloperRewardsReceivers: WeightedAddress[];
  /**
   * minting_rewards_distribution_start_epoch start epoch to distribute minting
   * rewards
   */
  mintingRewardsDistributionStartEpoch: Long;
}
export interface ParamsProtoMsg {
  typeUrl: "/osmosis.mint.v1beta1.Params";
  value: Uint8Array;
}
/** Params holds parameters for the x/mint module. */
export interface ParamsAmino {
  /** mint_denom is the denom of the coin to mint. */
  mint_denom: string;
  /** genesis_epoch_provisions epoch provisions from the first epoch. */
  genesis_epoch_provisions: string;
  /** epoch_identifier mint epoch identifier e.g. (day, week). */
  epoch_identifier: string;
  /**
   * reduction_period_in_epochs the number of epochs it takes
   * to reduce the rewards.
   */
  reduction_period_in_epochs: string;
  /**
   * reduction_factor is the reduction multiplier to execute
   * at the end of each period set by reduction_period_in_epochs.
   */
  reduction_factor: string;
  /**
   * distribution_proportions defines the distribution proportions of the minted
   * denom. In other words, defines which stakeholders will receive the minted
   * denoms and how much.
   */
  distribution_proportions?: DistributionProportionsAmino;
  /**
   * weighted_developer_rewards_receivers is the address to receive developer
   * rewards with weights assignedt to each address. The final amount that each
   * address receives is: epoch_provisions *
   * distribution_proportions.developer_rewards * Address's Weight.
   */
  weighted_developer_rewards_receivers: WeightedAddressAmino[];
  /**
   * minting_rewards_distribution_start_epoch start epoch to distribute minting
   * rewards
   */
  minting_rewards_distribution_start_epoch: string;
}
export interface ParamsAminoMsg {
  type: "osmosis/mint/params";
  value: ParamsAmino;
}
/** Params holds parameters for the x/mint module. */
export interface ParamsSDKType {
  mint_denom: string;
  genesis_epoch_provisions: string;
  epoch_identifier: string;
  reduction_period_in_epochs: Long;
  reduction_factor: string;
  distribution_proportions?: DistributionProportionsSDKType;
  weighted_developer_rewards_receivers: WeightedAddressSDKType[];
  minting_rewards_distribution_start_epoch: Long;
}
function createBaseMinter(): Minter {
  return {
    epochProvisions: "",
  };
}
export const Minter = {
  typeUrl: "/osmosis.mint.v1beta1.Minter",
  encode(
    message: Minter,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.epochProvisions !== "") {
      writer.uint32(10).string(message.epochProvisions);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Minter {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMinter();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.epochProvisions = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Minter>): Minter {
    const message = createBaseMinter();
    message.epochProvisions = object.epochProvisions ?? "";
    return message;
  },
  fromAmino(object: MinterAmino): Minter {
    return {
      epochProvisions: object.epoch_provisions,
    };
  },
  toAmino(message: Minter): MinterAmino {
    const obj: any = {};
    obj.epoch_provisions = message.epochProvisions;
    return obj;
  },
  fromAminoMsg(object: MinterAminoMsg): Minter {
    return Minter.fromAmino(object.value);
  },
  toAminoMsg(message: Minter): MinterAminoMsg {
    return {
      type: "osmosis/mint/minter",
      value: Minter.toAmino(message),
    };
  },
  fromProtoMsg(message: MinterProtoMsg): Minter {
    return Minter.decode(message.value);
  },
  toProto(message: Minter): Uint8Array {
    return Minter.encode(message).finish();
  },
  toProtoMsg(message: Minter): MinterProtoMsg {
    return {
      typeUrl: "/osmosis.mint.v1beta1.Minter",
      value: Minter.encode(message).finish(),
    };
  },
};
function createBaseWeightedAddress(): WeightedAddress {
  return {
    address: "",
    weight: "",
  };
}
export const WeightedAddress = {
  typeUrl: "/osmosis.mint.v1beta1.WeightedAddress",
  encode(
    message: WeightedAddress,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    if (message.weight !== "") {
      writer.uint32(18).string(message.weight);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): WeightedAddress {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseWeightedAddress();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.weight = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<WeightedAddress>): WeightedAddress {
    const message = createBaseWeightedAddress();
    message.address = object.address ?? "";
    message.weight = object.weight ?? "";
    return message;
  },
  fromAmino(object: WeightedAddressAmino): WeightedAddress {
    return {
      address: object.address,
      weight: object.weight,
    };
  },
  toAmino(message: WeightedAddress): WeightedAddressAmino {
    const obj: any = {};
    obj.address = message.address;
    obj.weight = message.weight;
    return obj;
  },
  fromAminoMsg(object: WeightedAddressAminoMsg): WeightedAddress {
    return WeightedAddress.fromAmino(object.value);
  },
  toAminoMsg(message: WeightedAddress): WeightedAddressAminoMsg {
    return {
      type: "osmosis/mint/weighted-address",
      value: WeightedAddress.toAmino(message),
    };
  },
  fromProtoMsg(message: WeightedAddressProtoMsg): WeightedAddress {
    return WeightedAddress.decode(message.value);
  },
  toProto(message: WeightedAddress): Uint8Array {
    return WeightedAddress.encode(message).finish();
  },
  toProtoMsg(message: WeightedAddress): WeightedAddressProtoMsg {
    return {
      typeUrl: "/osmosis.mint.v1beta1.WeightedAddress",
      value: WeightedAddress.encode(message).finish(),
    };
  },
};
function createBaseDistributionProportions(): DistributionProportions {
  return {
    staking: "",
    poolIncentives: "",
    developerRewards: "",
    communityPool: "",
  };
}
export const DistributionProportions = {
  typeUrl: "/osmosis.mint.v1beta1.DistributionProportions",
  encode(
    message: DistributionProportions,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.staking !== "") {
      writer.uint32(10).string(message.staking);
    }
    if (message.poolIncentives !== "") {
      writer.uint32(18).string(message.poolIncentives);
    }
    if (message.developerRewards !== "") {
      writer.uint32(26).string(message.developerRewards);
    }
    if (message.communityPool !== "") {
      writer.uint32(34).string(message.communityPool);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): DistributionProportions {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDistributionProportions();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.staking = reader.string();
          break;
        case 2:
          message.poolIncentives = reader.string();
          break;
        case 3:
          message.developerRewards = reader.string();
          break;
        case 4:
          message.communityPool = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<DistributionProportions>
  ): DistributionProportions {
    const message = createBaseDistributionProportions();
    message.staking = object.staking ?? "";
    message.poolIncentives = object.poolIncentives ?? "";
    message.developerRewards = object.developerRewards ?? "";
    message.communityPool = object.communityPool ?? "";
    return message;
  },
  fromAmino(object: DistributionProportionsAmino): DistributionProportions {
    return {
      staking: object.staking,
      poolIncentives: object.pool_incentives,
      developerRewards: object.developer_rewards,
      communityPool: object.community_pool,
    };
  },
  toAmino(message: DistributionProportions): DistributionProportionsAmino {
    const obj: any = {};
    obj.staking = message.staking;
    obj.pool_incentives = message.poolIncentives;
    obj.developer_rewards = message.developerRewards;
    obj.community_pool = message.communityPool;
    return obj;
  },
  fromAminoMsg(
    object: DistributionProportionsAminoMsg
  ): DistributionProportions {
    return DistributionProportions.fromAmino(object.value);
  },
  toAminoMsg(
    message: DistributionProportions
  ): DistributionProportionsAminoMsg {
    return {
      type: "osmosis/mint/distribution-proportions",
      value: DistributionProportions.toAmino(message),
    };
  },
  fromProtoMsg(
    message: DistributionProportionsProtoMsg
  ): DistributionProportions {
    return DistributionProportions.decode(message.value);
  },
  toProto(message: DistributionProportions): Uint8Array {
    return DistributionProportions.encode(message).finish();
  },
  toProtoMsg(
    message: DistributionProportions
  ): DistributionProportionsProtoMsg {
    return {
      typeUrl: "/osmosis.mint.v1beta1.DistributionProportions",
      value: DistributionProportions.encode(message).finish(),
    };
  },
};
function createBaseParams(): Params {
  return {
    mintDenom: "",
    genesisEpochProvisions: "",
    epochIdentifier: "",
    reductionPeriodInEpochs: Long.ZERO,
    reductionFactor: "",
    distributionProportions: undefined,
    weightedDeveloperRewardsReceivers: [],
    mintingRewardsDistributionStartEpoch: Long.ZERO,
  };
}
export const Params = {
  typeUrl: "/osmosis.mint.v1beta1.Params",
  encode(
    message: Params,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.mintDenom !== "") {
      writer.uint32(10).string(message.mintDenom);
    }
    if (message.genesisEpochProvisions !== "") {
      writer.uint32(18).string(message.genesisEpochProvisions);
    }
    if (message.epochIdentifier !== "") {
      writer.uint32(26).string(message.epochIdentifier);
    }
    if (!message.reductionPeriodInEpochs.isZero()) {
      writer.uint32(32).int64(message.reductionPeriodInEpochs);
    }
    if (message.reductionFactor !== "") {
      writer.uint32(42).string(message.reductionFactor);
    }
    if (message.distributionProportions !== undefined) {
      DistributionProportions.encode(
        message.distributionProportions,
        writer.uint32(50).fork()
      ).ldelim();
    }
    for (const v of message.weightedDeveloperRewardsReceivers) {
      WeightedAddress.encode(v!, writer.uint32(58).fork()).ldelim();
    }
    if (!message.mintingRewardsDistributionStartEpoch.isZero()) {
      writer.uint32(64).int64(message.mintingRewardsDistributionStartEpoch);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Params {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseParams();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.mintDenom = reader.string();
          break;
        case 2:
          message.genesisEpochProvisions = reader.string();
          break;
        case 3:
          message.epochIdentifier = reader.string();
          break;
        case 4:
          message.reductionPeriodInEpochs = reader.int64() as Long;
          break;
        case 5:
          message.reductionFactor = reader.string();
          break;
        case 6:
          message.distributionProportions = DistributionProportions.decode(
            reader,
            reader.uint32()
          );
          break;
        case 7:
          message.weightedDeveloperRewardsReceivers.push(
            WeightedAddress.decode(reader, reader.uint32())
          );
          break;
        case 8:
          message.mintingRewardsDistributionStartEpoch = reader.int64() as Long;
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
    message.mintDenom = object.mintDenom ?? "";
    message.genesisEpochProvisions = object.genesisEpochProvisions ?? "";
    message.epochIdentifier = object.epochIdentifier ?? "";
    message.reductionPeriodInEpochs =
      object.reductionPeriodInEpochs !== undefined &&
      object.reductionPeriodInEpochs !== null
        ? Long.fromValue(object.reductionPeriodInEpochs)
        : Long.ZERO;
    message.reductionFactor = object.reductionFactor ?? "";
    message.distributionProportions =
      object.distributionProportions !== undefined &&
      object.distributionProportions !== null
        ? DistributionProportions.fromPartial(object.distributionProportions)
        : undefined;
    message.weightedDeveloperRewardsReceivers =
      object.weightedDeveloperRewardsReceivers?.map((e) =>
        WeightedAddress.fromPartial(e)
      ) || [];
    message.mintingRewardsDistributionStartEpoch =
      object.mintingRewardsDistributionStartEpoch !== undefined &&
      object.mintingRewardsDistributionStartEpoch !== null
        ? Long.fromValue(object.mintingRewardsDistributionStartEpoch)
        : Long.ZERO;
    return message;
  },
  fromAmino(object: ParamsAmino): Params {
    return {
      mintDenom: object.mint_denom,
      genesisEpochProvisions: object.genesis_epoch_provisions,
      epochIdentifier: object.epoch_identifier,
      reductionPeriodInEpochs: Long.fromString(
        object.reduction_period_in_epochs
      ),
      reductionFactor: object.reduction_factor,
      distributionProportions: object?.distribution_proportions
        ? DistributionProportions.fromAmino(object.distribution_proportions)
        : undefined,
      weightedDeveloperRewardsReceivers: Array.isArray(
        object?.weighted_developer_rewards_receivers
      )
        ? object.weighted_developer_rewards_receivers.map((e: any) =>
            WeightedAddress.fromAmino(e)
          )
        : [],
      mintingRewardsDistributionStartEpoch: Long.fromString(
        object.minting_rewards_distribution_start_epoch
      ),
    };
  },
  toAmino(message: Params): ParamsAmino {
    const obj: any = {};
    obj.mint_denom = message.mintDenom;
    obj.genesis_epoch_provisions = message.genesisEpochProvisions;
    obj.epoch_identifier = message.epochIdentifier;
    obj.reduction_period_in_epochs = message.reductionPeriodInEpochs
      ? message.reductionPeriodInEpochs.toString()
      : undefined;
    obj.reduction_factor = message.reductionFactor;
    obj.distribution_proportions = message.distributionProportions
      ? DistributionProportions.toAmino(message.distributionProportions)
      : undefined;
    if (message.weightedDeveloperRewardsReceivers) {
      obj.weighted_developer_rewards_receivers =
        message.weightedDeveloperRewardsReceivers.map((e) =>
          e ? WeightedAddress.toAmino(e) : undefined
        );
    } else {
      obj.weighted_developer_rewards_receivers = [];
    }
    obj.minting_rewards_distribution_start_epoch =
      message.mintingRewardsDistributionStartEpoch
        ? message.mintingRewardsDistributionStartEpoch.toString()
        : undefined;
    return obj;
  },
  fromAminoMsg(object: ParamsAminoMsg): Params {
    return Params.fromAmino(object.value);
  },
  toAminoMsg(message: Params): ParamsAminoMsg {
    return {
      type: "osmosis/mint/params",
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
      typeUrl: "/osmosis.mint.v1beta1.Params",
      value: Params.encode(message).finish(),
    };
  },
};
