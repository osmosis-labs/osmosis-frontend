import { Duration } from "../../google/protobuf/duration";
import * as _m0 from "protobufjs/minimal";
import { isSet, DeepPartial, Long } from "@osmonauts/helpers";

/**
 * ConsensusParams contains consensus critical parameters that determine the
 * validity of blocks.
 */
export interface ConsensusParams {
  block: BlockParams;
  evidence: EvidenceParams;
  validator: ValidatorParams;
  version: VersionParams;
}

/** BlockParams contains limits on the block size. */
export interface BlockParams {
  /**
   * Max block size, in bytes.
   * Note: must be greater than 0
   */
  maxBytes: Long;

  /**
   * Max gas per block.
   * Note: must be greater or equal to -1
   */
  maxGas: Long;

  /**
   * Minimum time increment between consecutive blocks (in milliseconds) If the
   * block header timestamp is ahead of the system clock, decrease this value.
   * 
   * Not exposed to the application.
   */
  timeIotaMs: Long;
}

/** EvidenceParams determine how we handle evidence of malfeasance. */
export interface EvidenceParams {
  /**
   * Max age of evidence, in blocks.
   * 
   * The basic formula for calculating this is: MaxAgeDuration / {average block
   * time}.
   */
  maxAgeNumBlocks: Long;

  /**
   * Max age of evidence, in time.
   * 
   * It should correspond with an app's "unbonding period" or other similar
   * mechanism for handling [Nothing-At-Stake
   * attacks](https://github.com/ethereum/wiki/wiki/Proof-of-Stake-FAQ#what-is-the-nothing-at-stake-problem-and-how-can-it-be-fixed).
   */
  maxAgeDuration: Duration;

  /**
   * This sets the maximum size of total evidence in bytes that can be committed in a single block.
   * and should fall comfortably under the max block bytes.
   * Default is 1048576 or 1MB
   */
  maxBytes: Long;
}

/**
 * ValidatorParams restrict the public key types validators can use.
 * NOTE: uses ABCI pubkey naming, not Amino names.
 */
export interface ValidatorParams {
  pubKeyTypes: string[];
}

/** VersionParams contains the ABCI application version. */
export interface VersionParams {
  appVersion: Long;
}

/**
 * HashedParams is a subset of ConsensusParams.
 * 
 * It is hashed into the Header.ConsensusHash.
 */
export interface HashedParams {
  blockMaxBytes: Long;
  blockMaxGas: Long;
}

function createBaseConsensusParams(): ConsensusParams {
  return {
    block: undefined,
    evidence: undefined,
    validator: undefined,
    version: undefined
  };
}

export const ConsensusParams = {
  encode(message: ConsensusParams, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.block !== undefined) {
      BlockParams.encode(message.block, writer.uint32(10).fork()).ldelim();
    }

    if (message.evidence !== undefined) {
      EvidenceParams.encode(message.evidence, writer.uint32(18).fork()).ldelim();
    }

    if (message.validator !== undefined) {
      ValidatorParams.encode(message.validator, writer.uint32(26).fork()).ldelim();
    }

    if (message.version !== undefined) {
      VersionParams.encode(message.version, writer.uint32(34).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ConsensusParams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseConsensusParams();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.block = BlockParams.decode(reader, reader.uint32());
          break;

        case 2:
          message.evidence = EvidenceParams.decode(reader, reader.uint32());
          break;

        case 3:
          message.validator = ValidatorParams.decode(reader, reader.uint32());
          break;

        case 4:
          message.version = VersionParams.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): ConsensusParams {
    return {
      block: isSet(object.block) ? BlockParams.fromJSON(object.block) : undefined,
      evidence: isSet(object.evidence) ? EvidenceParams.fromJSON(object.evidence) : undefined,
      validator: isSet(object.validator) ? ValidatorParams.fromJSON(object.validator) : undefined,
      version: isSet(object.version) ? VersionParams.fromJSON(object.version) : undefined
    };
  },

  toJSON(message: ConsensusParams): unknown {
    const obj: any = {};
    message.block !== undefined && (obj.block = message.block ? BlockParams.toJSON(message.block) : undefined);
    message.evidence !== undefined && (obj.evidence = message.evidence ? EvidenceParams.toJSON(message.evidence) : undefined);
    message.validator !== undefined && (obj.validator = message.validator ? ValidatorParams.toJSON(message.validator) : undefined);
    message.version !== undefined && (obj.version = message.version ? VersionParams.toJSON(message.version) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<ConsensusParams>): ConsensusParams {
    const message = createBaseConsensusParams();
    message.block = object.block !== undefined && object.block !== null ? BlockParams.fromPartial(object.block) : undefined;
    message.evidence = object.evidence !== undefined && object.evidence !== null ? EvidenceParams.fromPartial(object.evidence) : undefined;
    message.validator = object.validator !== undefined && object.validator !== null ? ValidatorParams.fromPartial(object.validator) : undefined;
    message.version = object.version !== undefined && object.version !== null ? VersionParams.fromPartial(object.version) : undefined;
    return message;
  }

};

function createBaseBlockParams(): BlockParams {
  return {
    maxBytes: Long.ZERO,
    maxGas: Long.ZERO,
    timeIotaMs: Long.ZERO
  };
}

export const BlockParams = {
  encode(message: BlockParams, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.maxBytes.isZero()) {
      writer.uint32(8).int64(message.maxBytes);
    }

    if (!message.maxGas.isZero()) {
      writer.uint32(16).int64(message.maxGas);
    }

    if (!message.timeIotaMs.isZero()) {
      writer.uint32(24).int64(message.timeIotaMs);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): BlockParams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBlockParams();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.maxBytes = (reader.int64() as Long);
          break;

        case 2:
          message.maxGas = (reader.int64() as Long);
          break;

        case 3:
          message.timeIotaMs = (reader.int64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): BlockParams {
    return {
      maxBytes: isSet(object.maxBytes) ? Long.fromString(object.maxBytes) : Long.ZERO,
      maxGas: isSet(object.maxGas) ? Long.fromString(object.maxGas) : Long.ZERO,
      timeIotaMs: isSet(object.timeIotaMs) ? Long.fromString(object.timeIotaMs) : Long.ZERO
    };
  },

  toJSON(message: BlockParams): unknown {
    const obj: any = {};
    message.maxBytes !== undefined && (obj.maxBytes = (message.maxBytes || Long.ZERO).toString());
    message.maxGas !== undefined && (obj.maxGas = (message.maxGas || Long.ZERO).toString());
    message.timeIotaMs !== undefined && (obj.timeIotaMs = (message.timeIotaMs || Long.ZERO).toString());
    return obj;
  },

  fromPartial(object: DeepPartial<BlockParams>): BlockParams {
    const message = createBaseBlockParams();
    message.maxBytes = object.maxBytes !== undefined && object.maxBytes !== null ? Long.fromValue(object.maxBytes) : Long.ZERO;
    message.maxGas = object.maxGas !== undefined && object.maxGas !== null ? Long.fromValue(object.maxGas) : Long.ZERO;
    message.timeIotaMs = object.timeIotaMs !== undefined && object.timeIotaMs !== null ? Long.fromValue(object.timeIotaMs) : Long.ZERO;
    return message;
  }

};

function createBaseEvidenceParams(): EvidenceParams {
  return {
    maxAgeNumBlocks: Long.ZERO,
    maxAgeDuration: undefined,
    maxBytes: Long.ZERO
  };
}

export const EvidenceParams = {
  encode(message: EvidenceParams, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.maxAgeNumBlocks.isZero()) {
      writer.uint32(8).int64(message.maxAgeNumBlocks);
    }

    if (message.maxAgeDuration !== undefined) {
      Duration.encode(message.maxAgeDuration, writer.uint32(18).fork()).ldelim();
    }

    if (!message.maxBytes.isZero()) {
      writer.uint32(24).int64(message.maxBytes);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EvidenceParams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEvidenceParams();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.maxAgeNumBlocks = (reader.int64() as Long);
          break;

        case 2:
          message.maxAgeDuration = Duration.decode(reader, reader.uint32());
          break;

        case 3:
          message.maxBytes = (reader.int64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): EvidenceParams {
    return {
      maxAgeNumBlocks: isSet(object.maxAgeNumBlocks) ? Long.fromString(object.maxAgeNumBlocks) : Long.ZERO,
      maxAgeDuration: isSet(object.maxAgeDuration) ? Duration.fromJSON(object.maxAgeDuration) : undefined,
      maxBytes: isSet(object.maxBytes) ? Long.fromString(object.maxBytes) : Long.ZERO
    };
  },

  toJSON(message: EvidenceParams): unknown {
    const obj: any = {};
    message.maxAgeNumBlocks !== undefined && (obj.maxAgeNumBlocks = (message.maxAgeNumBlocks || Long.ZERO).toString());
    message.maxAgeDuration !== undefined && (obj.maxAgeDuration = message.maxAgeDuration);
    message.maxBytes !== undefined && (obj.maxBytes = (message.maxBytes || Long.ZERO).toString());
    return obj;
  },

  fromPartial(object: DeepPartial<EvidenceParams>): EvidenceParams {
    const message = createBaseEvidenceParams();
    message.maxAgeNumBlocks = object.maxAgeNumBlocks !== undefined && object.maxAgeNumBlocks !== null ? Long.fromValue(object.maxAgeNumBlocks) : Long.ZERO;
    message.maxAgeDuration = object.maxAgeDuration ?? undefined;
    message.maxBytes = object.maxBytes !== undefined && object.maxBytes !== null ? Long.fromValue(object.maxBytes) : Long.ZERO;
    return message;
  }

};

function createBaseValidatorParams(): ValidatorParams {
  return {
    pubKeyTypes: []
  };
}

export const ValidatorParams = {
  encode(message: ValidatorParams, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.pubKeyTypes) {
      writer.uint32(10).string(v!);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ValidatorParams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseValidatorParams();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.pubKeyTypes.push(reader.string());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): ValidatorParams {
    return {
      pubKeyTypes: Array.isArray(object?.pubKeyTypes) ? object.pubKeyTypes.map((e: any) => String(e)) : []
    };
  },

  toJSON(message: ValidatorParams): unknown {
    const obj: any = {};

    if (message.pubKeyTypes) {
      obj.pubKeyTypes = message.pubKeyTypes.map(e => e);
    } else {
      obj.pubKeyTypes = [];
    }

    return obj;
  },

  fromPartial(object: DeepPartial<ValidatorParams>): ValidatorParams {
    const message = createBaseValidatorParams();
    message.pubKeyTypes = object.pubKeyTypes?.map(e => e) || [];
    return message;
  }

};

function createBaseVersionParams(): VersionParams {
  return {
    appVersion: Long.UZERO
  };
}

export const VersionParams = {
  encode(message: VersionParams, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.appVersion.isZero()) {
      writer.uint32(8).uint64(message.appVersion);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): VersionParams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVersionParams();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.appVersion = (reader.uint64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): VersionParams {
    return {
      appVersion: isSet(object.appVersion) ? Long.fromString(object.appVersion) : Long.UZERO
    };
  },

  toJSON(message: VersionParams): unknown {
    const obj: any = {};
    message.appVersion !== undefined && (obj.appVersion = (message.appVersion || Long.UZERO).toString());
    return obj;
  },

  fromPartial(object: DeepPartial<VersionParams>): VersionParams {
    const message = createBaseVersionParams();
    message.appVersion = object.appVersion !== undefined && object.appVersion !== null ? Long.fromValue(object.appVersion) : Long.UZERO;
    return message;
  }

};

function createBaseHashedParams(): HashedParams {
  return {
    blockMaxBytes: Long.ZERO,
    blockMaxGas: Long.ZERO
  };
}

export const HashedParams = {
  encode(message: HashedParams, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.blockMaxBytes.isZero()) {
      writer.uint32(8).int64(message.blockMaxBytes);
    }

    if (!message.blockMaxGas.isZero()) {
      writer.uint32(16).int64(message.blockMaxGas);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HashedParams {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHashedParams();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.blockMaxBytes = (reader.int64() as Long);
          break;

        case 2:
          message.blockMaxGas = (reader.int64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): HashedParams {
    return {
      blockMaxBytes: isSet(object.blockMaxBytes) ? Long.fromString(object.blockMaxBytes) : Long.ZERO,
      blockMaxGas: isSet(object.blockMaxGas) ? Long.fromString(object.blockMaxGas) : Long.ZERO
    };
  },

  toJSON(message: HashedParams): unknown {
    const obj: any = {};
    message.blockMaxBytes !== undefined && (obj.blockMaxBytes = (message.blockMaxBytes || Long.ZERO).toString());
    message.blockMaxGas !== undefined && (obj.blockMaxGas = (message.blockMaxGas || Long.ZERO).toString());
    return obj;
  },

  fromPartial(object: DeepPartial<HashedParams>): HashedParams {
    const message = createBaseHashedParams();
    message.blockMaxBytes = object.blockMaxBytes !== undefined && object.blockMaxBytes !== null ? Long.fromValue(object.blockMaxBytes) : Long.ZERO;
    message.blockMaxGas = object.blockMaxGas !== undefined && object.blockMaxGas !== null ? Long.fromValue(object.blockMaxGas) : Long.ZERO;
    return message;
  }

};