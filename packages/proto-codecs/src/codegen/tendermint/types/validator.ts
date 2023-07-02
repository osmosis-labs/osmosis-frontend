//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import { Long } from "../../helpers";
import { PublicKey, PublicKeyAmino, PublicKeySDKType } from "../crypto/keys";
export interface ValidatorSet {
  validators: Validator[];
  proposer?: Validator;
  totalVotingPower: Long;
}
export interface ValidatorSetProtoMsg {
  typeUrl: "/tendermint.types.ValidatorSet";
  value: Uint8Array;
}
export interface ValidatorSetAmino {
  validators: ValidatorAmino[];
  proposer?: ValidatorAmino;
  total_voting_power: string;
}
export interface ValidatorSetAminoMsg {
  type: "/tendermint.types.ValidatorSet";
  value: ValidatorSetAmino;
}
export interface ValidatorSetSDKType {
  validators: ValidatorSDKType[];
  proposer?: ValidatorSDKType;
  total_voting_power: Long;
}
export interface Validator {
  address: Uint8Array;
  pubKey?: PublicKey;
  votingPower: Long;
  proposerPriority: Long;
}
export interface ValidatorProtoMsg {
  typeUrl: "/tendermint.types.Validator";
  value: Uint8Array;
}
export interface ValidatorAmino {
  address: Uint8Array;
  pub_key?: PublicKeyAmino;
  voting_power: string;
  proposer_priority: string;
}
export interface ValidatorAminoMsg {
  type: "/tendermint.types.Validator";
  value: ValidatorAmino;
}
export interface ValidatorSDKType {
  address: Uint8Array;
  pub_key?: PublicKeySDKType;
  voting_power: Long;
  proposer_priority: Long;
}
export interface SimpleValidator {
  pubKey?: PublicKey;
  votingPower: Long;
}
export interface SimpleValidatorProtoMsg {
  typeUrl: "/tendermint.types.SimpleValidator";
  value: Uint8Array;
}
export interface SimpleValidatorAmino {
  pub_key?: PublicKeyAmino;
  voting_power: string;
}
export interface SimpleValidatorAminoMsg {
  type: "/tendermint.types.SimpleValidator";
  value: SimpleValidatorAmino;
}
export interface SimpleValidatorSDKType {
  pub_key?: PublicKeySDKType;
  voting_power: Long;
}
function createBaseValidatorSet(): ValidatorSet {
  return {
    validators: [],
    proposer: undefined,
    totalVotingPower: Long.ZERO,
  };
}
export const ValidatorSet = {
  typeUrl: "/tendermint.types.ValidatorSet",
  encode(
    message: ValidatorSet,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.validators) {
      Validator.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    if (message.proposer !== undefined) {
      Validator.encode(message.proposer, writer.uint32(18).fork()).ldelim();
    }
    if (!message.totalVotingPower.isZero()) {
      writer.uint32(24).int64(message.totalVotingPower);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): ValidatorSet {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseValidatorSet();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.validators.push(Validator.decode(reader, reader.uint32()));
          break;
        case 2:
          message.proposer = Validator.decode(reader, reader.uint32());
          break;
        case 3:
          message.totalVotingPower = reader.int64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ValidatorSet>): ValidatorSet {
    const message = createBaseValidatorSet();
    message.validators =
      object.validators?.map((e) => Validator.fromPartial(e)) || [];
    message.proposer =
      object.proposer !== undefined && object.proposer !== null
        ? Validator.fromPartial(object.proposer)
        : undefined;
    message.totalVotingPower =
      object.totalVotingPower !== undefined && object.totalVotingPower !== null
        ? Long.fromValue(object.totalVotingPower)
        : Long.ZERO;
    return message;
  },
  fromAmino(object: ValidatorSetAmino): ValidatorSet {
    return {
      validators: Array.isArray(object?.validators)
        ? object.validators.map((e: any) => Validator.fromAmino(e))
        : [],
      proposer: object?.proposer
        ? Validator.fromAmino(object.proposer)
        : undefined,
      totalVotingPower: Long.fromString(object.total_voting_power),
    };
  },
  toAmino(message: ValidatorSet): ValidatorSetAmino {
    const obj: any = {};
    if (message.validators) {
      obj.validators = message.validators.map((e) =>
        e ? Validator.toAmino(e) : undefined
      );
    } else {
      obj.validators = [];
    }
    obj.proposer = message.proposer
      ? Validator.toAmino(message.proposer)
      : undefined;
    obj.total_voting_power = message.totalVotingPower
      ? message.totalVotingPower.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(object: ValidatorSetAminoMsg): ValidatorSet {
    return ValidatorSet.fromAmino(object.value);
  },
  fromProtoMsg(message: ValidatorSetProtoMsg): ValidatorSet {
    return ValidatorSet.decode(message.value);
  },
  toProto(message: ValidatorSet): Uint8Array {
    return ValidatorSet.encode(message).finish();
  },
  toProtoMsg(message: ValidatorSet): ValidatorSetProtoMsg {
    return {
      typeUrl: "/tendermint.types.ValidatorSet",
      value: ValidatorSet.encode(message).finish(),
    };
  },
};
function createBaseValidator(): Validator {
  return {
    address: new Uint8Array(),
    pubKey: undefined,
    votingPower: Long.ZERO,
    proposerPriority: Long.ZERO,
  };
}
export const Validator = {
  typeUrl: "/tendermint.types.Validator",
  encode(
    message: Validator,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.address.length !== 0) {
      writer.uint32(10).bytes(message.address);
    }
    if (message.pubKey !== undefined) {
      PublicKey.encode(message.pubKey, writer.uint32(18).fork()).ldelim();
    }
    if (!message.votingPower.isZero()) {
      writer.uint32(24).int64(message.votingPower);
    }
    if (!message.proposerPriority.isZero()) {
      writer.uint32(32).int64(message.proposerPriority);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Validator {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseValidator();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.bytes();
          break;
        case 2:
          message.pubKey = PublicKey.decode(reader, reader.uint32());
          break;
        case 3:
          message.votingPower = reader.int64() as Long;
          break;
        case 4:
          message.proposerPriority = reader.int64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Validator>): Validator {
    const message = createBaseValidator();
    message.address = object.address ?? new Uint8Array();
    message.pubKey =
      object.pubKey !== undefined && object.pubKey !== null
        ? PublicKey.fromPartial(object.pubKey)
        : undefined;
    message.votingPower =
      object.votingPower !== undefined && object.votingPower !== null
        ? Long.fromValue(object.votingPower)
        : Long.ZERO;
    message.proposerPriority =
      object.proposerPriority !== undefined && object.proposerPriority !== null
        ? Long.fromValue(object.proposerPriority)
        : Long.ZERO;
    return message;
  },
  fromAmino(object: ValidatorAmino): Validator {
    return {
      address: object.address,
      pubKey: object?.pub_key ? PublicKey.fromAmino(object.pub_key) : undefined,
      votingPower: Long.fromString(object.voting_power),
      proposerPriority: Long.fromString(object.proposer_priority),
    };
  },
  toAmino(message: Validator): ValidatorAmino {
    const obj: any = {};
    obj.address = message.address;
    obj.pub_key = message.pubKey
      ? PublicKey.toAmino(message.pubKey)
      : undefined;
    obj.voting_power = message.votingPower
      ? message.votingPower.toString()
      : undefined;
    obj.proposer_priority = message.proposerPriority
      ? message.proposerPriority.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(object: ValidatorAminoMsg): Validator {
    return Validator.fromAmino(object.value);
  },
  fromProtoMsg(message: ValidatorProtoMsg): Validator {
    return Validator.decode(message.value);
  },
  toProto(message: Validator): Uint8Array {
    return Validator.encode(message).finish();
  },
  toProtoMsg(message: Validator): ValidatorProtoMsg {
    return {
      typeUrl: "/tendermint.types.Validator",
      value: Validator.encode(message).finish(),
    };
  },
};
function createBaseSimpleValidator(): SimpleValidator {
  return {
    pubKey: undefined,
    votingPower: Long.ZERO,
  };
}
export const SimpleValidator = {
  typeUrl: "/tendermint.types.SimpleValidator",
  encode(
    message: SimpleValidator,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.pubKey !== undefined) {
      PublicKey.encode(message.pubKey, writer.uint32(10).fork()).ldelim();
    }
    if (!message.votingPower.isZero()) {
      writer.uint32(16).int64(message.votingPower);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): SimpleValidator {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSimpleValidator();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.pubKey = PublicKey.decode(reader, reader.uint32());
          break;
        case 2:
          message.votingPower = reader.int64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<SimpleValidator>): SimpleValidator {
    const message = createBaseSimpleValidator();
    message.pubKey =
      object.pubKey !== undefined && object.pubKey !== null
        ? PublicKey.fromPartial(object.pubKey)
        : undefined;
    message.votingPower =
      object.votingPower !== undefined && object.votingPower !== null
        ? Long.fromValue(object.votingPower)
        : Long.ZERO;
    return message;
  },
  fromAmino(object: SimpleValidatorAmino): SimpleValidator {
    return {
      pubKey: object?.pub_key ? PublicKey.fromAmino(object.pub_key) : undefined,
      votingPower: Long.fromString(object.voting_power),
    };
  },
  toAmino(message: SimpleValidator): SimpleValidatorAmino {
    const obj: any = {};
    obj.pub_key = message.pubKey
      ? PublicKey.toAmino(message.pubKey)
      : undefined;
    obj.voting_power = message.votingPower
      ? message.votingPower.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(object: SimpleValidatorAminoMsg): SimpleValidator {
    return SimpleValidator.fromAmino(object.value);
  },
  fromProtoMsg(message: SimpleValidatorProtoMsg): SimpleValidator {
    return SimpleValidator.decode(message.value);
  },
  toProto(message: SimpleValidator): Uint8Array {
    return SimpleValidator.encode(message).finish();
  },
  toProtoMsg(message: SimpleValidator): SimpleValidatorProtoMsg {
    return {
      typeUrl: "/tendermint.types.SimpleValidator",
      value: SimpleValidator.encode(message).finish(),
    };
  },
};
