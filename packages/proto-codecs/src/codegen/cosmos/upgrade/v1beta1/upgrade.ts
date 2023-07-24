//@ts-nocheck
import { BinaryReader, BinaryWriter } from "../../../binary";
import { Any, AnyAmino, AnySDKType } from "../../../google/protobuf/any";
import { Timestamp } from "../../../google/protobuf/timestamp";
import { fromTimestamp, toTimestamp } from "../../../helpers";
/** Plan specifies information about a planned upgrade and when it should occur. */
export interface Plan {
  /**
   * Sets the name for the upgrade. This name will be used by the upgraded
   * version of the software to apply any special "on-upgrade" commands during
   * the first BeginBlock method after the upgrade is applied. It is also used
   * to detect whether a software version can handle a given upgrade. If no
   * upgrade handler with this name has been set in the software, it will be
   * assumed that the software is out-of-date when the upgrade Time or Height is
   * reached and the software will exit.
   */
  name: string;
  /**
   * Deprecated: Time based upgrades have been deprecated. Time based upgrade logic
   * has been removed from the SDK.
   * If this field is not empty, an error will be thrown.
   */
  /** @deprecated */
  time: Date;
  /**
   * The height at which the upgrade must be performed.
   * Only used if Time is not set.
   */
  height: bigint;
  /**
   * Any application specific upgrade info to be included on-chain
   * such as a git commit that validators could automatically upgrade to
   */
  info: string;
  /**
   * Deprecated: UpgradedClientState field has been deprecated. IBC upgrade logic has been
   * moved to the IBC module in the sub module 02-client.
   * If this field is not empty, an error will be thrown.
   */
  /** @deprecated */
  upgradedClientState: Any;
}
export interface PlanProtoMsg {
  typeUrl: "/cosmos.upgrade.v1beta1.Plan";
  value: Uint8Array;
}
/** Plan specifies information about a planned upgrade and when it should occur. */
export interface PlanAmino {
  /**
   * Sets the name for the upgrade. This name will be used by the upgraded
   * version of the software to apply any special "on-upgrade" commands during
   * the first BeginBlock method after the upgrade is applied. It is also used
   * to detect whether a software version can handle a given upgrade. If no
   * upgrade handler with this name has been set in the software, it will be
   * assumed that the software is out-of-date when the upgrade Time or Height is
   * reached and the software will exit.
   */
  name: string;
  /**
   * Deprecated: Time based upgrades have been deprecated. Time based upgrade logic
   * has been removed from the SDK.
   * If this field is not empty, an error will be thrown.
   */
  /** @deprecated */
  time?: Date;
  /**
   * The height at which the upgrade must be performed.
   * Only used if Time is not set.
   */
  height: string;
  /**
   * Any application specific upgrade info to be included on-chain
   * such as a git commit that validators could automatically upgrade to
   */
  info: string;
  /**
   * Deprecated: UpgradedClientState field has been deprecated. IBC upgrade logic has been
   * moved to the IBC module in the sub module 02-client.
   * If this field is not empty, an error will be thrown.
   */
  /** @deprecated */
  upgraded_client_state?: AnyAmino;
}
export interface PlanAminoMsg {
  type: "cosmos-sdk/Plan";
  value: PlanAmino;
}
/** Plan specifies information about a planned upgrade and when it should occur. */
export interface PlanSDKType {
  name: string;
  /** @deprecated */
  time: Date;
  height: bigint;
  info: string;
  /** @deprecated */
  upgraded_client_state: AnySDKType;
}
/**
 * SoftwareUpgradeProposal is a gov Content type for initiating a software
 * upgrade.
 * Deprecated: This legacy proposal is deprecated in favor of Msg-based gov
 * proposals, see MsgSoftwareUpgrade.
 */
/** @deprecated */
export interface SoftwareUpgradeProposal {
  $typeUrl?: string;
  title: string;
  description: string;
  plan: Plan;
}
export interface SoftwareUpgradeProposalProtoMsg {
  typeUrl: "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal";
  value: Uint8Array;
}
/**
 * SoftwareUpgradeProposal is a gov Content type for initiating a software
 * upgrade.
 * Deprecated: This legacy proposal is deprecated in favor of Msg-based gov
 * proposals, see MsgSoftwareUpgrade.
 */
/** @deprecated */
export interface SoftwareUpgradeProposalAmino {
  title: string;
  description: string;
  plan?: PlanAmino;
}
export interface SoftwareUpgradeProposalAminoMsg {
  type: "cosmos-sdk/SoftwareUpgradeProposal";
  value: SoftwareUpgradeProposalAmino;
}
/**
 * SoftwareUpgradeProposal is a gov Content type for initiating a software
 * upgrade.
 * Deprecated: This legacy proposal is deprecated in favor of Msg-based gov
 * proposals, see MsgSoftwareUpgrade.
 */
/** @deprecated */
export interface SoftwareUpgradeProposalSDKType {
  $typeUrl?: string;
  title: string;
  description: string;
  plan: PlanSDKType;
}
/**
 * CancelSoftwareUpgradeProposal is a gov Content type for cancelling a software
 * upgrade.
 * Deprecated: This legacy proposal is deprecated in favor of Msg-based gov
 * proposals, see MsgCancelUpgrade.
 */
/** @deprecated */
export interface CancelSoftwareUpgradeProposal {
  $typeUrl?: string;
  title: string;
  description: string;
}
export interface CancelSoftwareUpgradeProposalProtoMsg {
  typeUrl: "/cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal";
  value: Uint8Array;
}
/**
 * CancelSoftwareUpgradeProposal is a gov Content type for cancelling a software
 * upgrade.
 * Deprecated: This legacy proposal is deprecated in favor of Msg-based gov
 * proposals, see MsgCancelUpgrade.
 */
/** @deprecated */
export interface CancelSoftwareUpgradeProposalAmino {
  title: string;
  description: string;
}
export interface CancelSoftwareUpgradeProposalAminoMsg {
  type: "cosmos-sdk/CancelSoftwareUpgradeProposal";
  value: CancelSoftwareUpgradeProposalAmino;
}
/**
 * CancelSoftwareUpgradeProposal is a gov Content type for cancelling a software
 * upgrade.
 * Deprecated: This legacy proposal is deprecated in favor of Msg-based gov
 * proposals, see MsgCancelUpgrade.
 */
/** @deprecated */
export interface CancelSoftwareUpgradeProposalSDKType {
  $typeUrl?: string;
  title: string;
  description: string;
}
/**
 * ModuleVersion specifies a module and its consensus version.
 *
 * Since: cosmos-sdk 0.43
 */
export interface ModuleVersion {
  /** name of the app module */
  name: string;
  /** consensus version of the app module */
  version: bigint;
}
export interface ModuleVersionProtoMsg {
  typeUrl: "/cosmos.upgrade.v1beta1.ModuleVersion";
  value: Uint8Array;
}
/**
 * ModuleVersion specifies a module and its consensus version.
 *
 * Since: cosmos-sdk 0.43
 */
export interface ModuleVersionAmino {
  /** name of the app module */
  name: string;
  /** consensus version of the app module */
  version: string;
}
export interface ModuleVersionAminoMsg {
  type: "cosmos-sdk/ModuleVersion";
  value: ModuleVersionAmino;
}
/**
 * ModuleVersion specifies a module and its consensus version.
 *
 * Since: cosmos-sdk 0.43
 */
export interface ModuleVersionSDKType {
  name: string;
  version: bigint;
}
function createBasePlan(): Plan {
  return {
    name: "",
    time: undefined,
    height: BigInt(0),
    info: "",
    upgradedClientState: undefined,
  };
}
export const Plan = {
  typeUrl: "/cosmos.upgrade.v1beta1.Plan",
  encode(
    message: Plan,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.time !== undefined) {
      Timestamp.encode(
        toTimestamp(message.time),
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.height !== BigInt(0)) {
      writer.uint32(24).int64(message.height);
    }
    if (message.info !== "") {
      writer.uint32(34).string(message.info);
    }
    if (message.upgradedClientState !== undefined) {
      Any.encode(
        message.upgradedClientState,
        writer.uint32(42).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): Plan {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePlan();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.time = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        case 3:
          message.height = reader.int64();
          break;
        case 4:
          message.info = reader.string();
          break;
        case 5:
          message.upgradedClientState = Any.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Plan>): Plan {
    const message = createBasePlan();
    message.name = object.name ?? "";
    message.time = object.time ?? undefined;
    message.height =
      object.height !== undefined && object.height !== null
        ? BigInt(object.height.toString())
        : BigInt(0);
    message.info = object.info ?? "";
    message.upgradedClientState =
      object.upgradedClientState !== undefined &&
      object.upgradedClientState !== null
        ? Any.fromPartial(object.upgradedClientState)
        : undefined;
    return message;
  },
  fromAmino(object: PlanAmino): Plan {
    return {
      name: object.name,
      time: object.time,
      height: BigInt(object.height),
      info: object.info,
      upgradedClientState: object?.upgraded_client_state
        ? Any.fromAmino(object.upgraded_client_state)
        : undefined,
    };
  },
  toAmino(message: Plan): PlanAmino {
    const obj: any = {};
    obj.name = message.name;
    obj.time = message.time;
    obj.height = message.height ? message.height.toString() : undefined;
    obj.info = message.info;
    obj.upgraded_client_state = message.upgradedClientState
      ? Any.toAmino(message.upgradedClientState)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: PlanAminoMsg): Plan {
    return Plan.fromAmino(object.value);
  },
  toAminoMsg(message: Plan): PlanAminoMsg {
    return {
      type: "cosmos-sdk/Plan",
      value: Plan.toAmino(message),
    };
  },
  fromProtoMsg(message: PlanProtoMsg): Plan {
    return Plan.decode(message.value);
  },
  toProto(message: Plan): Uint8Array {
    return Plan.encode(message).finish();
  },
  toProtoMsg(message: Plan): PlanProtoMsg {
    return {
      typeUrl: "/cosmos.upgrade.v1beta1.Plan",
      value: Plan.encode(message).finish(),
    };
  },
};
function createBaseSoftwareUpgradeProposal(): SoftwareUpgradeProposal {
  return {
    $typeUrl: "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal",
    title: "",
    description: "",
    plan: Plan.fromPartial({}),
  };
}
export const SoftwareUpgradeProposal = {
  typeUrl: "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal",
  encode(
    message: SoftwareUpgradeProposal,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    if (message.plan !== undefined) {
      Plan.encode(message.plan, writer.uint32(26).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): SoftwareUpgradeProposal {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSoftwareUpgradeProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.title = reader.string();
          break;
        case 2:
          message.description = reader.string();
          break;
        case 3:
          message.plan = Plan.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<SoftwareUpgradeProposal>
  ): SoftwareUpgradeProposal {
    const message = createBaseSoftwareUpgradeProposal();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    message.plan =
      object.plan !== undefined && object.plan !== null
        ? Plan.fromPartial(object.plan)
        : undefined;
    return message;
  },
  fromAmino(object: SoftwareUpgradeProposalAmino): SoftwareUpgradeProposal {
    return {
      title: object.title,
      description: object.description,
      plan: object?.plan ? Plan.fromAmino(object.plan) : undefined,
    };
  },
  toAmino(message: SoftwareUpgradeProposal): SoftwareUpgradeProposalAmino {
    const obj: any = {};
    obj.title = message.title;
    obj.description = message.description;
    obj.plan = message.plan ? Plan.toAmino(message.plan) : undefined;
    return obj;
  },
  fromAminoMsg(
    object: SoftwareUpgradeProposalAminoMsg
  ): SoftwareUpgradeProposal {
    return SoftwareUpgradeProposal.fromAmino(object.value);
  },
  toAminoMsg(
    message: SoftwareUpgradeProposal
  ): SoftwareUpgradeProposalAminoMsg {
    return {
      type: "cosmos-sdk/SoftwareUpgradeProposal",
      value: SoftwareUpgradeProposal.toAmino(message),
    };
  },
  fromProtoMsg(
    message: SoftwareUpgradeProposalProtoMsg
  ): SoftwareUpgradeProposal {
    return SoftwareUpgradeProposal.decode(message.value);
  },
  toProto(message: SoftwareUpgradeProposal): Uint8Array {
    return SoftwareUpgradeProposal.encode(message).finish();
  },
  toProtoMsg(
    message: SoftwareUpgradeProposal
  ): SoftwareUpgradeProposalProtoMsg {
    return {
      typeUrl: "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal",
      value: SoftwareUpgradeProposal.encode(message).finish(),
    };
  },
};
function createBaseCancelSoftwareUpgradeProposal(): CancelSoftwareUpgradeProposal {
  return {
    $typeUrl: "/cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal",
    title: "",
    description: "",
  };
}
export const CancelSoftwareUpgradeProposal = {
  typeUrl: "/cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal",
  encode(
    message: CancelSoftwareUpgradeProposal,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.title !== "") {
      writer.uint32(10).string(message.title);
    }
    if (message.description !== "") {
      writer.uint32(18).string(message.description);
    }
    return writer;
  },
  decode(
    input: BinaryReader | Uint8Array,
    length?: number
  ): CancelSoftwareUpgradeProposal {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseCancelSoftwareUpgradeProposal();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.title = reader.string();
          break;
        case 2:
          message.description = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<CancelSoftwareUpgradeProposal>
  ): CancelSoftwareUpgradeProposal {
    const message = createBaseCancelSoftwareUpgradeProposal();
    message.title = object.title ?? "";
    message.description = object.description ?? "";
    return message;
  },
  fromAmino(
    object: CancelSoftwareUpgradeProposalAmino
  ): CancelSoftwareUpgradeProposal {
    return {
      title: object.title,
      description: object.description,
    };
  },
  toAmino(
    message: CancelSoftwareUpgradeProposal
  ): CancelSoftwareUpgradeProposalAmino {
    const obj: any = {};
    obj.title = message.title;
    obj.description = message.description;
    return obj;
  },
  fromAminoMsg(
    object: CancelSoftwareUpgradeProposalAminoMsg
  ): CancelSoftwareUpgradeProposal {
    return CancelSoftwareUpgradeProposal.fromAmino(object.value);
  },
  toAminoMsg(
    message: CancelSoftwareUpgradeProposal
  ): CancelSoftwareUpgradeProposalAminoMsg {
    return {
      type: "cosmos-sdk/CancelSoftwareUpgradeProposal",
      value: CancelSoftwareUpgradeProposal.toAmino(message),
    };
  },
  fromProtoMsg(
    message: CancelSoftwareUpgradeProposalProtoMsg
  ): CancelSoftwareUpgradeProposal {
    return CancelSoftwareUpgradeProposal.decode(message.value);
  },
  toProto(message: CancelSoftwareUpgradeProposal): Uint8Array {
    return CancelSoftwareUpgradeProposal.encode(message).finish();
  },
  toProtoMsg(
    message: CancelSoftwareUpgradeProposal
  ): CancelSoftwareUpgradeProposalProtoMsg {
    return {
      typeUrl: "/cosmos.upgrade.v1beta1.CancelSoftwareUpgradeProposal",
      value: CancelSoftwareUpgradeProposal.encode(message).finish(),
    };
  },
};
function createBaseModuleVersion(): ModuleVersion {
  return {
    name: "",
    version: BigInt(0),
  };
}
export const ModuleVersion = {
  typeUrl: "/cosmos.upgrade.v1beta1.ModuleVersion",
  encode(
    message: ModuleVersion,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    if (message.version !== BigInt(0)) {
      writer.uint32(16).uint64(message.version);
    }
    return writer;
  },
  decode(input: BinaryReader | Uint8Array, length?: number): ModuleVersion {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseModuleVersion();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.name = reader.string();
          break;
        case 2:
          message.version = reader.uint64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ModuleVersion>): ModuleVersion {
    const message = createBaseModuleVersion();
    message.name = object.name ?? "";
    message.version =
      object.version !== undefined && object.version !== null
        ? BigInt(object.version.toString())
        : BigInt(0);
    return message;
  },
  fromAmino(object: ModuleVersionAmino): ModuleVersion {
    return {
      name: object.name,
      version: BigInt(object.version),
    };
  },
  toAmino(message: ModuleVersion): ModuleVersionAmino {
    const obj: any = {};
    obj.name = message.name;
    obj.version = message.version ? message.version.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: ModuleVersionAminoMsg): ModuleVersion {
    return ModuleVersion.fromAmino(object.value);
  },
  toAminoMsg(message: ModuleVersion): ModuleVersionAminoMsg {
    return {
      type: "cosmos-sdk/ModuleVersion",
      value: ModuleVersion.toAmino(message),
    };
  },
  fromProtoMsg(message: ModuleVersionProtoMsg): ModuleVersion {
    return ModuleVersion.decode(message.value);
  },
  toProto(message: ModuleVersion): Uint8Array {
    return ModuleVersion.encode(message).finish();
  },
  toProtoMsg(message: ModuleVersion): ModuleVersionProtoMsg {
    return {
      typeUrl: "/cosmos.upgrade.v1beta1.ModuleVersion",
      value: ModuleVersion.encode(message).finish(),
    };
  },
};
