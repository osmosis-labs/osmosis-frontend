import { CommitmentProof } from "../../../../confio/proofs";
import * as _m0 from "protobufjs/minimal";
import { isSet, bytesFromBase64, base64FromBytes, DeepPartial } from "@osmonauts/helpers";

/**
 * MerkleRoot defines a merkle root hash.
 * In the Cosmos SDK, the AppHash of a block header becomes the root.
 */
export interface MerkleRoot {
  hash: Uint8Array;
}

/**
 * MerklePrefix is merkle path prefixed to the key.
 * The constructed key from the Path and the key will be append(Path.KeyPath,
 * append(Path.KeyPrefix, key...))
 */
export interface MerklePrefix {
  keyPrefix: Uint8Array;
}

/**
 * MerklePath is the path used to verify commitment proofs, which can be an
 * arbitrary structured object (defined by a commitment type).
 * MerklePath is represented from root-to-leaf
 */
export interface MerklePath {
  keyPath: string[];
}

/**
 * MerkleProof is a wrapper type over a chain of CommitmentProofs.
 * It demonstrates membership or non-membership for an element or set of
 * elements, verifiable in conjunction with a known commitment root. Proofs
 * should be succinct.
 * MerkleProofs are ordered from leaf-to-root
 */
export interface MerkleProof {
  proofs: CommitmentProof[];
}

function createBaseMerkleRoot(): MerkleRoot {
  return {
    hash: new Uint8Array()
  };
}

export const MerkleRoot = {
  encode(message: MerkleRoot, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.hash.length !== 0) {
      writer.uint32(10).bytes(message.hash);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MerkleRoot {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMerkleRoot();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.hash = reader.bytes();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): MerkleRoot {
    return {
      hash: isSet(object.hash) ? bytesFromBase64(object.hash) : new Uint8Array()
    };
  },

  toJSON(message: MerkleRoot): unknown {
    const obj: any = {};
    message.hash !== undefined && (obj.hash = base64FromBytes(message.hash !== undefined ? message.hash : new Uint8Array()));
    return obj;
  },

  fromPartial(object: DeepPartial<MerkleRoot>): MerkleRoot {
    const message = createBaseMerkleRoot();
    message.hash = object.hash ?? new Uint8Array();
    return message;
  }

};

function createBaseMerklePrefix(): MerklePrefix {
  return {
    keyPrefix: new Uint8Array()
  };
}

export const MerklePrefix = {
  encode(message: MerklePrefix, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.keyPrefix.length !== 0) {
      writer.uint32(10).bytes(message.keyPrefix);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MerklePrefix {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMerklePrefix();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.keyPrefix = reader.bytes();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): MerklePrefix {
    return {
      keyPrefix: isSet(object.keyPrefix) ? bytesFromBase64(object.keyPrefix) : new Uint8Array()
    };
  },

  toJSON(message: MerklePrefix): unknown {
    const obj: any = {};
    message.keyPrefix !== undefined && (obj.keyPrefix = base64FromBytes(message.keyPrefix !== undefined ? message.keyPrefix : new Uint8Array()));
    return obj;
  },

  fromPartial(object: DeepPartial<MerklePrefix>): MerklePrefix {
    const message = createBaseMerklePrefix();
    message.keyPrefix = object.keyPrefix ?? new Uint8Array();
    return message;
  }

};

function createBaseMerklePath(): MerklePath {
  return {
    keyPath: []
  };
}

export const MerklePath = {
  encode(message: MerklePath, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.keyPath) {
      writer.uint32(10).string(v!);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MerklePath {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMerklePath();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.keyPath.push(reader.string());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): MerklePath {
    return {
      keyPath: Array.isArray(object?.keyPath) ? object.keyPath.map((e: any) => String(e)) : []
    };
  },

  toJSON(message: MerklePath): unknown {
    const obj: any = {};

    if (message.keyPath) {
      obj.keyPath = message.keyPath.map(e => e);
    } else {
      obj.keyPath = [];
    }

    return obj;
  },

  fromPartial(object: DeepPartial<MerklePath>): MerklePath {
    const message = createBaseMerklePath();
    message.keyPath = object.keyPath?.map(e => e) || [];
    return message;
  }

};

function createBaseMerkleProof(): MerkleProof {
  return {
    proofs: []
  };
}

export const MerkleProof = {
  encode(message: MerkleProof, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.proofs) {
      CommitmentProof.encode(v!, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): MerkleProof {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMerkleProof();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.proofs.push(CommitmentProof.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): MerkleProof {
    return {
      proofs: Array.isArray(object?.proofs) ? object.proofs.map((e: any) => CommitmentProof.fromJSON(e)) : []
    };
  },

  toJSON(message: MerkleProof): unknown {
    const obj: any = {};

    if (message.proofs) {
      obj.proofs = message.proofs.map(e => e ? CommitmentProof.toJSON(e) : undefined);
    } else {
      obj.proofs = [];
    }

    return obj;
  },

  fromPartial(object: DeepPartial<MerkleProof>): MerkleProof {
    const message = createBaseMerkleProof();
    message.proofs = object.proofs?.map(e => CommitmentProof.fromPartial(e)) || [];
    return message;
  }

};