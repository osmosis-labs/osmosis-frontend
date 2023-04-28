import {
  Vote,
  VoteAmino,
  VoteSDKType,
  LightBlock,
  LightBlockAmino,
  LightBlockSDKType,
} from "./types";
import { Timestamp } from "../../google/protobuf/timestamp";
import { Validator, ValidatorAmino, ValidatorSDKType } from "./validator";
import { Long, toTimestamp, fromTimestamp } from "../../helpers";
import * as _m0 from "protobufjs/minimal";
export interface Evidence {
  duplicateVoteEvidence?: DuplicateVoteEvidence;
  lightClientAttackEvidence?: LightClientAttackEvidence;
}
export interface EvidenceProtoMsg {
  typeUrl: "/tendermint.types.Evidence";
  value: Uint8Array;
}
export interface EvidenceAmino {
  duplicate_vote_evidence?: DuplicateVoteEvidenceAmino;
  light_client_attack_evidence?: LightClientAttackEvidenceAmino;
}
export interface EvidenceAminoMsg {
  type: "/tendermint.types.Evidence";
  value: EvidenceAmino;
}
export interface EvidenceSDKType {
  duplicate_vote_evidence?: DuplicateVoteEvidenceSDKType;
  light_client_attack_evidence?: LightClientAttackEvidenceSDKType;
}
/** DuplicateVoteEvidence contains evidence of a validator signed two conflicting votes. */
export interface DuplicateVoteEvidence {
  voteA?: Vote;
  voteB?: Vote;
  totalVotingPower: Long;
  validatorPower: Long;
  timestamp?: Date;
}
export interface DuplicateVoteEvidenceProtoMsg {
  typeUrl: "/tendermint.types.DuplicateVoteEvidence";
  value: Uint8Array;
}
/** DuplicateVoteEvidence contains evidence of a validator signed two conflicting votes. */
export interface DuplicateVoteEvidenceAmino {
  vote_a?: VoteAmino;
  vote_b?: VoteAmino;
  total_voting_power: string;
  validator_power: string;
  timestamp?: Date;
}
export interface DuplicateVoteEvidenceAminoMsg {
  type: "/tendermint.types.DuplicateVoteEvidence";
  value: DuplicateVoteEvidenceAmino;
}
/** DuplicateVoteEvidence contains evidence of a validator signed two conflicting votes. */
export interface DuplicateVoteEvidenceSDKType {
  vote_a?: VoteSDKType;
  vote_b?: VoteSDKType;
  total_voting_power: Long;
  validator_power: Long;
  timestamp?: Date;
}
/** LightClientAttackEvidence contains evidence of a set of validators attempting to mislead a light client. */
export interface LightClientAttackEvidence {
  conflictingBlock?: LightBlock;
  commonHeight: Long;
  byzantineValidators: Validator[];
  totalVotingPower: Long;
  timestamp?: Date;
}
export interface LightClientAttackEvidenceProtoMsg {
  typeUrl: "/tendermint.types.LightClientAttackEvidence";
  value: Uint8Array;
}
/** LightClientAttackEvidence contains evidence of a set of validators attempting to mislead a light client. */
export interface LightClientAttackEvidenceAmino {
  conflicting_block?: LightBlockAmino;
  common_height: string;
  byzantine_validators: ValidatorAmino[];
  total_voting_power: string;
  timestamp?: Date;
}
export interface LightClientAttackEvidenceAminoMsg {
  type: "/tendermint.types.LightClientAttackEvidence";
  value: LightClientAttackEvidenceAmino;
}
/** LightClientAttackEvidence contains evidence of a set of validators attempting to mislead a light client. */
export interface LightClientAttackEvidenceSDKType {
  conflicting_block?: LightBlockSDKType;
  common_height: Long;
  byzantine_validators: ValidatorSDKType[];
  total_voting_power: Long;
  timestamp?: Date;
}
export interface EvidenceList {
  evidence: Evidence[];
}
export interface EvidenceListProtoMsg {
  typeUrl: "/tendermint.types.EvidenceList";
  value: Uint8Array;
}
export interface EvidenceListAmino {
  evidence: EvidenceAmino[];
}
export interface EvidenceListAminoMsg {
  type: "/tendermint.types.EvidenceList";
  value: EvidenceListAmino;
}
export interface EvidenceListSDKType {
  evidence: EvidenceSDKType[];
}
function createBaseEvidence(): Evidence {
  return {
    duplicateVoteEvidence: undefined,
    lightClientAttackEvidence: undefined,
  };
}
export const Evidence = {
  typeUrl: "/tendermint.types.Evidence",
  encode(
    message: Evidence,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.duplicateVoteEvidence !== undefined) {
      DuplicateVoteEvidence.encode(
        message.duplicateVoteEvidence,
        writer.uint32(10).fork()
      ).ldelim();
    }
    if (message.lightClientAttackEvidence !== undefined) {
      LightClientAttackEvidence.encode(
        message.lightClientAttackEvidence,
        writer.uint32(18).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Evidence {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEvidence();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.duplicateVoteEvidence = DuplicateVoteEvidence.decode(
            reader,
            reader.uint32()
          );
          break;
        case 2:
          message.lightClientAttackEvidence = LightClientAttackEvidence.decode(
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
  fromPartial(object: Partial<Evidence>): Evidence {
    const message = createBaseEvidence();
    message.duplicateVoteEvidence =
      object.duplicateVoteEvidence !== undefined &&
      object.duplicateVoteEvidence !== null
        ? DuplicateVoteEvidence.fromPartial(object.duplicateVoteEvidence)
        : undefined;
    message.lightClientAttackEvidence =
      object.lightClientAttackEvidence !== undefined &&
      object.lightClientAttackEvidence !== null
        ? LightClientAttackEvidence.fromPartial(
            object.lightClientAttackEvidence
          )
        : undefined;
    return message;
  },
  fromAmino(object: EvidenceAmino): Evidence {
    return {
      duplicateVoteEvidence: object?.duplicate_vote_evidence
        ? DuplicateVoteEvidence.fromAmino(object.duplicate_vote_evidence)
        : undefined,
      lightClientAttackEvidence: object?.light_client_attack_evidence
        ? LightClientAttackEvidence.fromAmino(
            object.light_client_attack_evidence
          )
        : undefined,
    };
  },
  toAmino(message: Evidence): EvidenceAmino {
    const obj: any = {};
    obj.duplicate_vote_evidence = message.duplicateVoteEvidence
      ? DuplicateVoteEvidence.toAmino(message.duplicateVoteEvidence)
      : undefined;
    obj.light_client_attack_evidence = message.lightClientAttackEvidence
      ? LightClientAttackEvidence.toAmino(message.lightClientAttackEvidence)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: EvidenceAminoMsg): Evidence {
    return Evidence.fromAmino(object.value);
  },
  fromProtoMsg(message: EvidenceProtoMsg): Evidence {
    return Evidence.decode(message.value);
  },
  toProto(message: Evidence): Uint8Array {
    return Evidence.encode(message).finish();
  },
  toProtoMsg(message: Evidence): EvidenceProtoMsg {
    return {
      typeUrl: "/tendermint.types.Evidence",
      value: Evidence.encode(message).finish(),
    };
  },
};
function createBaseDuplicateVoteEvidence(): DuplicateVoteEvidence {
  return {
    voteA: undefined,
    voteB: undefined,
    totalVotingPower: Long.ZERO,
    validatorPower: Long.ZERO,
    timestamp: undefined,
  };
}
export const DuplicateVoteEvidence = {
  typeUrl: "/tendermint.types.DuplicateVoteEvidence",
  encode(
    message: DuplicateVoteEvidence,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.voteA !== undefined) {
      Vote.encode(message.voteA, writer.uint32(10).fork()).ldelim();
    }
    if (message.voteB !== undefined) {
      Vote.encode(message.voteB, writer.uint32(18).fork()).ldelim();
    }
    if (!message.totalVotingPower.isZero()) {
      writer.uint32(24).int64(message.totalVotingPower);
    }
    if (!message.validatorPower.isZero()) {
      writer.uint32(32).int64(message.validatorPower);
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(
        toTimestamp(message.timestamp),
        writer.uint32(42).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): DuplicateVoteEvidence {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDuplicateVoteEvidence();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.voteA = Vote.decode(reader, reader.uint32());
          break;
        case 2:
          message.voteB = Vote.decode(reader, reader.uint32());
          break;
        case 3:
          message.totalVotingPower = reader.int64() as Long;
          break;
        case 4:
          message.validatorPower = reader.int64() as Long;
          break;
        case 5:
          message.timestamp = fromTimestamp(
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
  fromPartial(object: Partial<DuplicateVoteEvidence>): DuplicateVoteEvidence {
    const message = createBaseDuplicateVoteEvidence();
    message.voteA =
      object.voteA !== undefined && object.voteA !== null
        ? Vote.fromPartial(object.voteA)
        : undefined;
    message.voteB =
      object.voteB !== undefined && object.voteB !== null
        ? Vote.fromPartial(object.voteB)
        : undefined;
    message.totalVotingPower =
      object.totalVotingPower !== undefined && object.totalVotingPower !== null
        ? Long.fromValue(object.totalVotingPower)
        : Long.ZERO;
    message.validatorPower =
      object.validatorPower !== undefined && object.validatorPower !== null
        ? Long.fromValue(object.validatorPower)
        : Long.ZERO;
    message.timestamp = object.timestamp ?? undefined;
    return message;
  },
  fromAmino(object: DuplicateVoteEvidenceAmino): DuplicateVoteEvidence {
    return {
      voteA: object?.vote_a ? Vote.fromAmino(object.vote_a) : undefined,
      voteB: object?.vote_b ? Vote.fromAmino(object.vote_b) : undefined,
      totalVotingPower: Long.fromString(object.total_voting_power),
      validatorPower: Long.fromString(object.validator_power),
      timestamp: object?.timestamp
        ? Timestamp.fromAmino(object.timestamp)
        : undefined,
    };
  },
  toAmino(message: DuplicateVoteEvidence): DuplicateVoteEvidenceAmino {
    const obj: any = {};
    obj.vote_a = message.voteA ? Vote.toAmino(message.voteA) : undefined;
    obj.vote_b = message.voteB ? Vote.toAmino(message.voteB) : undefined;
    obj.total_voting_power = message.totalVotingPower
      ? message.totalVotingPower.toString()
      : undefined;
    obj.validator_power = message.validatorPower
      ? message.validatorPower.toString()
      : undefined;
    obj.timestamp = message.timestamp
      ? Timestamp.toAmino(message.timestamp)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: DuplicateVoteEvidenceAminoMsg): DuplicateVoteEvidence {
    return DuplicateVoteEvidence.fromAmino(object.value);
  },
  fromProtoMsg(message: DuplicateVoteEvidenceProtoMsg): DuplicateVoteEvidence {
    return DuplicateVoteEvidence.decode(message.value);
  },
  toProto(message: DuplicateVoteEvidence): Uint8Array {
    return DuplicateVoteEvidence.encode(message).finish();
  },
  toProtoMsg(message: DuplicateVoteEvidence): DuplicateVoteEvidenceProtoMsg {
    return {
      typeUrl: "/tendermint.types.DuplicateVoteEvidence",
      value: DuplicateVoteEvidence.encode(message).finish(),
    };
  },
};
function createBaseLightClientAttackEvidence(): LightClientAttackEvidence {
  return {
    conflictingBlock: undefined,
    commonHeight: Long.ZERO,
    byzantineValidators: [],
    totalVotingPower: Long.ZERO,
    timestamp: undefined,
  };
}
export const LightClientAttackEvidence = {
  typeUrl: "/tendermint.types.LightClientAttackEvidence",
  encode(
    message: LightClientAttackEvidence,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.conflictingBlock !== undefined) {
      LightBlock.encode(
        message.conflictingBlock,
        writer.uint32(10).fork()
      ).ldelim();
    }
    if (!message.commonHeight.isZero()) {
      writer.uint32(16).int64(message.commonHeight);
    }
    for (const v of message.byzantineValidators) {
      Validator.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (!message.totalVotingPower.isZero()) {
      writer.uint32(32).int64(message.totalVotingPower);
    }
    if (message.timestamp !== undefined) {
      Timestamp.encode(
        toTimestamp(message.timestamp),
        writer.uint32(42).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): LightClientAttackEvidence {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLightClientAttackEvidence();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.conflictingBlock = LightBlock.decode(reader, reader.uint32());
          break;
        case 2:
          message.commonHeight = reader.int64() as Long;
          break;
        case 3:
          message.byzantineValidators.push(
            Validator.decode(reader, reader.uint32())
          );
          break;
        case 4:
          message.totalVotingPower = reader.int64() as Long;
          break;
        case 5:
          message.timestamp = fromTimestamp(
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
    object: Partial<LightClientAttackEvidence>
  ): LightClientAttackEvidence {
    const message = createBaseLightClientAttackEvidence();
    message.conflictingBlock =
      object.conflictingBlock !== undefined && object.conflictingBlock !== null
        ? LightBlock.fromPartial(object.conflictingBlock)
        : undefined;
    message.commonHeight =
      object.commonHeight !== undefined && object.commonHeight !== null
        ? Long.fromValue(object.commonHeight)
        : Long.ZERO;
    message.byzantineValidators =
      object.byzantineValidators?.map((e) => Validator.fromPartial(e)) || [];
    message.totalVotingPower =
      object.totalVotingPower !== undefined && object.totalVotingPower !== null
        ? Long.fromValue(object.totalVotingPower)
        : Long.ZERO;
    message.timestamp = object.timestamp ?? undefined;
    return message;
  },
  fromAmino(object: LightClientAttackEvidenceAmino): LightClientAttackEvidence {
    return {
      conflictingBlock: object?.conflicting_block
        ? LightBlock.fromAmino(object.conflicting_block)
        : undefined,
      commonHeight: Long.fromString(object.common_height),
      byzantineValidators: Array.isArray(object?.byzantine_validators)
        ? object.byzantine_validators.map((e: any) => Validator.fromAmino(e))
        : [],
      totalVotingPower: Long.fromString(object.total_voting_power),
      timestamp: object?.timestamp
        ? Timestamp.fromAmino(object.timestamp)
        : undefined,
    };
  },
  toAmino(message: LightClientAttackEvidence): LightClientAttackEvidenceAmino {
    const obj: any = {};
    obj.conflicting_block = message.conflictingBlock
      ? LightBlock.toAmino(message.conflictingBlock)
      : undefined;
    obj.common_height = message.commonHeight
      ? message.commonHeight.toString()
      : undefined;
    if (message.byzantineValidators) {
      obj.byzantine_validators = message.byzantineValidators.map((e) =>
        e ? Validator.toAmino(e) : undefined
      );
    } else {
      obj.byzantine_validators = [];
    }
    obj.total_voting_power = message.totalVotingPower
      ? message.totalVotingPower.toString()
      : undefined;
    obj.timestamp = message.timestamp
      ? Timestamp.toAmino(message.timestamp)
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: LightClientAttackEvidenceAminoMsg
  ): LightClientAttackEvidence {
    return LightClientAttackEvidence.fromAmino(object.value);
  },
  fromProtoMsg(
    message: LightClientAttackEvidenceProtoMsg
  ): LightClientAttackEvidence {
    return LightClientAttackEvidence.decode(message.value);
  },
  toProto(message: LightClientAttackEvidence): Uint8Array {
    return LightClientAttackEvidence.encode(message).finish();
  },
  toProtoMsg(
    message: LightClientAttackEvidence
  ): LightClientAttackEvidenceProtoMsg {
    return {
      typeUrl: "/tendermint.types.LightClientAttackEvidence",
      value: LightClientAttackEvidence.encode(message).finish(),
    };
  },
};
function createBaseEvidenceList(): EvidenceList {
  return {
    evidence: [],
  };
}
export const EvidenceList = {
  typeUrl: "/tendermint.types.EvidenceList",
  encode(
    message: EvidenceList,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.evidence) {
      Evidence.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): EvidenceList {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEvidenceList();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.evidence.push(Evidence.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<EvidenceList>): EvidenceList {
    const message = createBaseEvidenceList();
    message.evidence =
      object.evidence?.map((e) => Evidence.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: EvidenceListAmino): EvidenceList {
    return {
      evidence: Array.isArray(object?.evidence)
        ? object.evidence.map((e: any) => Evidence.fromAmino(e))
        : [],
    };
  },
  toAmino(message: EvidenceList): EvidenceListAmino {
    const obj: any = {};
    if (message.evidence) {
      obj.evidence = message.evidence.map((e) =>
        e ? Evidence.toAmino(e) : undefined
      );
    } else {
      obj.evidence = [];
    }
    return obj;
  },
  fromAminoMsg(object: EvidenceListAminoMsg): EvidenceList {
    return EvidenceList.fromAmino(object.value);
  },
  fromProtoMsg(message: EvidenceListProtoMsg): EvidenceList {
    return EvidenceList.decode(message.value);
  },
  toProto(message: EvidenceList): Uint8Array {
    return EvidenceList.encode(message).finish();
  },
  toProtoMsg(message: EvidenceList): EvidenceListProtoMsg {
    return {
      typeUrl: "/tendermint.types.EvidenceList",
      value: EvidenceList.encode(message).finish(),
    };
  },
};
