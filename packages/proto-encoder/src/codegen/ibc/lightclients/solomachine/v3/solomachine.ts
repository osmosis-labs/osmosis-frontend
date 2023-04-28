import { Any, AnyAmino, AnySDKType } from "../../../../google/protobuf/any";
import { Long } from "../../../../helpers";
import * as _m0 from "protobufjs/minimal";
/**
 * ClientState defines a solo machine client that tracks the current consensus
 * state and if the client is frozen.
 */
export interface ClientState {
  /** latest sequence of the client state */
  sequence: Long;
  /** frozen sequence of the solo machine */
  isFrozen: boolean;
  consensusState?: ConsensusState;
}
export interface ClientStateProtoMsg {
  typeUrl: "/ibc.lightclients.solomachine.v3.ClientState";
  value: Uint8Array;
}
/**
 * ClientState defines a solo machine client that tracks the current consensus
 * state and if the client is frozen.
 */
export interface ClientStateAmino {
  /** latest sequence of the client state */
  sequence: string;
  /** frozen sequence of the solo machine */
  is_frozen: boolean;
  consensus_state?: ConsensusStateAmino;
}
export interface ClientStateAminoMsg {
  type: "cosmos-sdk/ClientState";
  value: ClientStateAmino;
}
/**
 * ClientState defines a solo machine client that tracks the current consensus
 * state and if the client is frozen.
 */
export interface ClientStateSDKType {
  sequence: Long;
  is_frozen: boolean;
  consensus_state?: ConsensusStateSDKType;
}
/**
 * ConsensusState defines a solo machine consensus state. The sequence of a
 * consensus state is contained in the "height" key used in storing the
 * consensus state.
 */
export interface ConsensusState {
  /** public key of the solo machine */
  publicKey?: Any;
  /**
   * diversifier allows the same public key to be re-used across different solo
   * machine clients (potentially on different chains) without being considered
   * misbehaviour.
   */
  diversifier: string;
  timestamp: Long;
}
export interface ConsensusStateProtoMsg {
  typeUrl: "/ibc.lightclients.solomachine.v3.ConsensusState";
  value: Uint8Array;
}
/**
 * ConsensusState defines a solo machine consensus state. The sequence of a
 * consensus state is contained in the "height" key used in storing the
 * consensus state.
 */
export interface ConsensusStateAmino {
  /** public key of the solo machine */
  public_key?: AnyAmino;
  /**
   * diversifier allows the same public key to be re-used across different solo
   * machine clients (potentially on different chains) without being considered
   * misbehaviour.
   */
  diversifier: string;
  timestamp: string;
}
export interface ConsensusStateAminoMsg {
  type: "cosmos-sdk/ConsensusState";
  value: ConsensusStateAmino;
}
/**
 * ConsensusState defines a solo machine consensus state. The sequence of a
 * consensus state is contained in the "height" key used in storing the
 * consensus state.
 */
export interface ConsensusStateSDKType {
  public_key?: AnySDKType;
  diversifier: string;
  timestamp: Long;
}
/** Header defines a solo machine consensus header */
export interface Header {
  timestamp: Long;
  signature: Uint8Array;
  newPublicKey?: Any;
  newDiversifier: string;
}
export interface HeaderProtoMsg {
  typeUrl: "/ibc.lightclients.solomachine.v3.Header";
  value: Uint8Array;
}
/** Header defines a solo machine consensus header */
export interface HeaderAmino {
  timestamp: string;
  signature: Uint8Array;
  new_public_key?: AnyAmino;
  new_diversifier: string;
}
export interface HeaderAminoMsg {
  type: "cosmos-sdk/Header";
  value: HeaderAmino;
}
/** Header defines a solo machine consensus header */
export interface HeaderSDKType {
  timestamp: Long;
  signature: Uint8Array;
  new_public_key?: AnySDKType;
  new_diversifier: string;
}
/**
 * Misbehaviour defines misbehaviour for a solo machine which consists
 * of a sequence and two signatures over different messages at that sequence.
 */
export interface Misbehaviour {
  sequence: Long;
  signatureOne?: SignatureAndData;
  signatureTwo?: SignatureAndData;
}
export interface MisbehaviourProtoMsg {
  typeUrl: "/ibc.lightclients.solomachine.v3.Misbehaviour";
  value: Uint8Array;
}
/**
 * Misbehaviour defines misbehaviour for a solo machine which consists
 * of a sequence and two signatures over different messages at that sequence.
 */
export interface MisbehaviourAmino {
  sequence: string;
  signature_one?: SignatureAndDataAmino;
  signature_two?: SignatureAndDataAmino;
}
export interface MisbehaviourAminoMsg {
  type: "cosmos-sdk/Misbehaviour";
  value: MisbehaviourAmino;
}
/**
 * Misbehaviour defines misbehaviour for a solo machine which consists
 * of a sequence and two signatures over different messages at that sequence.
 */
export interface MisbehaviourSDKType {
  sequence: Long;
  signature_one?: SignatureAndDataSDKType;
  signature_two?: SignatureAndDataSDKType;
}
/**
 * SignatureAndData contains a signature and the data signed over to create that
 * signature.
 */
export interface SignatureAndData {
  signature: Uint8Array;
  path: Uint8Array;
  data: Uint8Array;
  timestamp: Long;
}
export interface SignatureAndDataProtoMsg {
  typeUrl: "/ibc.lightclients.solomachine.v3.SignatureAndData";
  value: Uint8Array;
}
/**
 * SignatureAndData contains a signature and the data signed over to create that
 * signature.
 */
export interface SignatureAndDataAmino {
  signature: Uint8Array;
  path: Uint8Array;
  data: Uint8Array;
  timestamp: string;
}
export interface SignatureAndDataAminoMsg {
  type: "cosmos-sdk/SignatureAndData";
  value: SignatureAndDataAmino;
}
/**
 * SignatureAndData contains a signature and the data signed over to create that
 * signature.
 */
export interface SignatureAndDataSDKType {
  signature: Uint8Array;
  path: Uint8Array;
  data: Uint8Array;
  timestamp: Long;
}
/**
 * TimestampedSignatureData contains the signature data and the timestamp of the
 * signature.
 */
export interface TimestampedSignatureData {
  signatureData: Uint8Array;
  timestamp: Long;
}
export interface TimestampedSignatureDataProtoMsg {
  typeUrl: "/ibc.lightclients.solomachine.v3.TimestampedSignatureData";
  value: Uint8Array;
}
/**
 * TimestampedSignatureData contains the signature data and the timestamp of the
 * signature.
 */
export interface TimestampedSignatureDataAmino {
  signature_data: Uint8Array;
  timestamp: string;
}
export interface TimestampedSignatureDataAminoMsg {
  type: "cosmos-sdk/TimestampedSignatureData";
  value: TimestampedSignatureDataAmino;
}
/**
 * TimestampedSignatureData contains the signature data and the timestamp of the
 * signature.
 */
export interface TimestampedSignatureDataSDKType {
  signature_data: Uint8Array;
  timestamp: Long;
}
/** SignBytes defines the signed bytes used for signature verification. */
export interface SignBytes {
  /** the sequence number */
  sequence: Long;
  /** the proof timestamp */
  timestamp: Long;
  /** the public key diversifier */
  diversifier: string;
  /** the standardised path bytes */
  path: Uint8Array;
  /** the marshaled data bytes */
  data: Uint8Array;
}
export interface SignBytesProtoMsg {
  typeUrl: "/ibc.lightclients.solomachine.v3.SignBytes";
  value: Uint8Array;
}
/** SignBytes defines the signed bytes used for signature verification. */
export interface SignBytesAmino {
  /** the sequence number */
  sequence: string;
  /** the proof timestamp */
  timestamp: string;
  /** the public key diversifier */
  diversifier: string;
  /** the standardised path bytes */
  path: Uint8Array;
  /** the marshaled data bytes */
  data: Uint8Array;
}
export interface SignBytesAminoMsg {
  type: "cosmos-sdk/SignBytes";
  value: SignBytesAmino;
}
/** SignBytes defines the signed bytes used for signature verification. */
export interface SignBytesSDKType {
  sequence: Long;
  timestamp: Long;
  diversifier: string;
  path: Uint8Array;
  data: Uint8Array;
}
/** HeaderData returns the SignBytes data for update verification. */
export interface HeaderData {
  /** header public key */
  newPubKey?: Any;
  /** header diversifier */
  newDiversifier: string;
}
export interface HeaderDataProtoMsg {
  typeUrl: "/ibc.lightclients.solomachine.v3.HeaderData";
  value: Uint8Array;
}
/** HeaderData returns the SignBytes data for update verification. */
export interface HeaderDataAmino {
  /** header public key */
  new_pub_key?: AnyAmino;
  /** header diversifier */
  new_diversifier: string;
}
export interface HeaderDataAminoMsg {
  type: "cosmos-sdk/HeaderData";
  value: HeaderDataAmino;
}
/** HeaderData returns the SignBytes data for update verification. */
export interface HeaderDataSDKType {
  new_pub_key?: AnySDKType;
  new_diversifier: string;
}
function createBaseClientState(): ClientState {
  return {
    sequence: Long.UZERO,
    isFrozen: false,
    consensusState: undefined,
  };
}
export const ClientState = {
  typeUrl: "/ibc.lightclients.solomachine.v3.ClientState",
  encode(
    message: ClientState,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.sequence.isZero()) {
      writer.uint32(8).uint64(message.sequence);
    }
    if (message.isFrozen === true) {
      writer.uint32(16).bool(message.isFrozen);
    }
    if (message.consensusState !== undefined) {
      ConsensusState.encode(
        message.consensusState,
        writer.uint32(26).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): ClientState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseClientState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sequence = reader.uint64() as Long;
          break;
        case 2:
          message.isFrozen = reader.bool();
          break;
        case 3:
          message.consensusState = ConsensusState.decode(
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
  fromPartial(object: Partial<ClientState>): ClientState {
    const message = createBaseClientState();
    message.sequence =
      object.sequence !== undefined && object.sequence !== null
        ? Long.fromValue(object.sequence)
        : Long.UZERO;
    message.isFrozen = object.isFrozen ?? false;
    message.consensusState =
      object.consensusState !== undefined && object.consensusState !== null
        ? ConsensusState.fromPartial(object.consensusState)
        : undefined;
    return message;
  },
  fromAmino(object: ClientStateAmino): ClientState {
    return {
      sequence: Long.fromString(object.sequence),
      isFrozen: object.is_frozen,
      consensusState: object?.consensus_state
        ? ConsensusState.fromAmino(object.consensus_state)
        : undefined,
    };
  },
  toAmino(message: ClientState): ClientStateAmino {
    const obj: any = {};
    obj.sequence = message.sequence ? message.sequence.toString() : undefined;
    obj.is_frozen = message.isFrozen;
    obj.consensus_state = message.consensusState
      ? ConsensusState.toAmino(message.consensusState)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: ClientStateAminoMsg): ClientState {
    return ClientState.fromAmino(object.value);
  },
  toAminoMsg(message: ClientState): ClientStateAminoMsg {
    return {
      type: "cosmos-sdk/ClientState",
      value: ClientState.toAmino(message),
    };
  },
  fromProtoMsg(message: ClientStateProtoMsg): ClientState {
    return ClientState.decode(message.value);
  },
  toProto(message: ClientState): Uint8Array {
    return ClientState.encode(message).finish();
  },
  toProtoMsg(message: ClientState): ClientStateProtoMsg {
    return {
      typeUrl: "/ibc.lightclients.solomachine.v3.ClientState",
      value: ClientState.encode(message).finish(),
    };
  },
};
function createBaseConsensusState(): ConsensusState {
  return {
    publicKey: undefined,
    diversifier: "",
    timestamp: Long.UZERO,
  };
}
export const ConsensusState = {
  typeUrl: "/ibc.lightclients.solomachine.v3.ConsensusState",
  encode(
    message: ConsensusState,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.publicKey !== undefined) {
      Any.encode(message.publicKey, writer.uint32(10).fork()).ldelim();
    }
    if (message.diversifier !== "") {
      writer.uint32(18).string(message.diversifier);
    }
    if (!message.timestamp.isZero()) {
      writer.uint32(24).uint64(message.timestamp);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): ConsensusState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseConsensusState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.publicKey = Any.decode(reader, reader.uint32());
          break;
        case 2:
          message.diversifier = reader.string();
          break;
        case 3:
          message.timestamp = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ConsensusState>): ConsensusState {
    const message = createBaseConsensusState();
    message.publicKey =
      object.publicKey !== undefined && object.publicKey !== null
        ? Any.fromPartial(object.publicKey)
        : undefined;
    message.diversifier = object.diversifier ?? "";
    message.timestamp =
      object.timestamp !== undefined && object.timestamp !== null
        ? Long.fromValue(object.timestamp)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: ConsensusStateAmino): ConsensusState {
    return {
      publicKey: object?.public_key
        ? Any.fromAmino(object.public_key)
        : undefined,
      diversifier: object.diversifier,
      timestamp: Long.fromString(object.timestamp),
    };
  },
  toAmino(message: ConsensusState): ConsensusStateAmino {
    const obj: any = {};
    obj.public_key = message.publicKey
      ? Any.toAmino(message.publicKey)
      : undefined;
    obj.diversifier = message.diversifier;
    obj.timestamp = message.timestamp
      ? message.timestamp.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(object: ConsensusStateAminoMsg): ConsensusState {
    return ConsensusState.fromAmino(object.value);
  },
  toAminoMsg(message: ConsensusState): ConsensusStateAminoMsg {
    return {
      type: "cosmos-sdk/ConsensusState",
      value: ConsensusState.toAmino(message),
    };
  },
  fromProtoMsg(message: ConsensusStateProtoMsg): ConsensusState {
    return ConsensusState.decode(message.value);
  },
  toProto(message: ConsensusState): Uint8Array {
    return ConsensusState.encode(message).finish();
  },
  toProtoMsg(message: ConsensusState): ConsensusStateProtoMsg {
    return {
      typeUrl: "/ibc.lightclients.solomachine.v3.ConsensusState",
      value: ConsensusState.encode(message).finish(),
    };
  },
};
function createBaseHeader(): Header {
  return {
    timestamp: Long.UZERO,
    signature: new Uint8Array(),
    newPublicKey: undefined,
    newDiversifier: "",
  };
}
export const Header = {
  typeUrl: "/ibc.lightclients.solomachine.v3.Header",
  encode(
    message: Header,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.timestamp.isZero()) {
      writer.uint32(8).uint64(message.timestamp);
    }
    if (message.signature.length !== 0) {
      writer.uint32(18).bytes(message.signature);
    }
    if (message.newPublicKey !== undefined) {
      Any.encode(message.newPublicKey, writer.uint32(26).fork()).ldelim();
    }
    if (message.newDiversifier !== "") {
      writer.uint32(34).string(message.newDiversifier);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Header {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHeader();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.timestamp = reader.uint64() as Long;
          break;
        case 2:
          message.signature = reader.bytes();
          break;
        case 3:
          message.newPublicKey = Any.decode(reader, reader.uint32());
          break;
        case 4:
          message.newDiversifier = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Header>): Header {
    const message = createBaseHeader();
    message.timestamp =
      object.timestamp !== undefined && object.timestamp !== null
        ? Long.fromValue(object.timestamp)
        : Long.UZERO;
    message.signature = object.signature ?? new Uint8Array();
    message.newPublicKey =
      object.newPublicKey !== undefined && object.newPublicKey !== null
        ? Any.fromPartial(object.newPublicKey)
        : undefined;
    message.newDiversifier = object.newDiversifier ?? "";
    return message;
  },
  fromAmino(object: HeaderAmino): Header {
    return {
      timestamp: Long.fromString(object.timestamp),
      signature: object.signature,
      newPublicKey: object?.new_public_key
        ? Any.fromAmino(object.new_public_key)
        : undefined,
      newDiversifier: object.new_diversifier,
    };
  },
  toAmino(message: Header): HeaderAmino {
    const obj: any = {};
    obj.timestamp = message.timestamp
      ? message.timestamp.toString()
      : undefined;
    obj.signature = message.signature;
    obj.new_public_key = message.newPublicKey
      ? Any.toAmino(message.newPublicKey)
      : undefined;
    obj.new_diversifier = message.newDiversifier;
    return obj;
  },
  fromAminoMsg(object: HeaderAminoMsg): Header {
    return Header.fromAmino(object.value);
  },
  toAminoMsg(message: Header): HeaderAminoMsg {
    return {
      type: "cosmos-sdk/Header",
      value: Header.toAmino(message),
    };
  },
  fromProtoMsg(message: HeaderProtoMsg): Header {
    return Header.decode(message.value);
  },
  toProto(message: Header): Uint8Array {
    return Header.encode(message).finish();
  },
  toProtoMsg(message: Header): HeaderProtoMsg {
    return {
      typeUrl: "/ibc.lightclients.solomachine.v3.Header",
      value: Header.encode(message).finish(),
    };
  },
};
function createBaseMisbehaviour(): Misbehaviour {
  return {
    sequence: Long.UZERO,
    signatureOne: undefined,
    signatureTwo: undefined,
  };
}
export const Misbehaviour = {
  typeUrl: "/ibc.lightclients.solomachine.v3.Misbehaviour",
  encode(
    message: Misbehaviour,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.sequence.isZero()) {
      writer.uint32(8).uint64(message.sequence);
    }
    if (message.signatureOne !== undefined) {
      SignatureAndData.encode(
        message.signatureOne,
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.signatureTwo !== undefined) {
      SignatureAndData.encode(
        message.signatureTwo,
        writer.uint32(26).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Misbehaviour {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMisbehaviour();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sequence = reader.uint64() as Long;
          break;
        case 2:
          message.signatureOne = SignatureAndData.decode(
            reader,
            reader.uint32()
          );
          break;
        case 3:
          message.signatureTwo = SignatureAndData.decode(
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
  fromPartial(object: Partial<Misbehaviour>): Misbehaviour {
    const message = createBaseMisbehaviour();
    message.sequence =
      object.sequence !== undefined && object.sequence !== null
        ? Long.fromValue(object.sequence)
        : Long.UZERO;
    message.signatureOne =
      object.signatureOne !== undefined && object.signatureOne !== null
        ? SignatureAndData.fromPartial(object.signatureOne)
        : undefined;
    message.signatureTwo =
      object.signatureTwo !== undefined && object.signatureTwo !== null
        ? SignatureAndData.fromPartial(object.signatureTwo)
        : undefined;
    return message;
  },
  fromAmino(object: MisbehaviourAmino): Misbehaviour {
    return {
      sequence: Long.fromString(object.sequence),
      signatureOne: object?.signature_one
        ? SignatureAndData.fromAmino(object.signature_one)
        : undefined,
      signatureTwo: object?.signature_two
        ? SignatureAndData.fromAmino(object.signature_two)
        : undefined,
    };
  },
  toAmino(message: Misbehaviour): MisbehaviourAmino {
    const obj: any = {};
    obj.sequence = message.sequence ? message.sequence.toString() : undefined;
    obj.signature_one = message.signatureOne
      ? SignatureAndData.toAmino(message.signatureOne)
      : undefined;
    obj.signature_two = message.signatureTwo
      ? SignatureAndData.toAmino(message.signatureTwo)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: MisbehaviourAminoMsg): Misbehaviour {
    return Misbehaviour.fromAmino(object.value);
  },
  toAminoMsg(message: Misbehaviour): MisbehaviourAminoMsg {
    return {
      type: "cosmos-sdk/Misbehaviour",
      value: Misbehaviour.toAmino(message),
    };
  },
  fromProtoMsg(message: MisbehaviourProtoMsg): Misbehaviour {
    return Misbehaviour.decode(message.value);
  },
  toProto(message: Misbehaviour): Uint8Array {
    return Misbehaviour.encode(message).finish();
  },
  toProtoMsg(message: Misbehaviour): MisbehaviourProtoMsg {
    return {
      typeUrl: "/ibc.lightclients.solomachine.v3.Misbehaviour",
      value: Misbehaviour.encode(message).finish(),
    };
  },
};
function createBaseSignatureAndData(): SignatureAndData {
  return {
    signature: new Uint8Array(),
    path: new Uint8Array(),
    data: new Uint8Array(),
    timestamp: Long.UZERO,
  };
}
export const SignatureAndData = {
  typeUrl: "/ibc.lightclients.solomachine.v3.SignatureAndData",
  encode(
    message: SignatureAndData,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.signature.length !== 0) {
      writer.uint32(10).bytes(message.signature);
    }
    if (message.path.length !== 0) {
      writer.uint32(18).bytes(message.path);
    }
    if (message.data.length !== 0) {
      writer.uint32(26).bytes(message.data);
    }
    if (!message.timestamp.isZero()) {
      writer.uint32(32).uint64(message.timestamp);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): SignatureAndData {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSignatureAndData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signature = reader.bytes();
          break;
        case 2:
          message.path = reader.bytes();
          break;
        case 3:
          message.data = reader.bytes();
          break;
        case 4:
          message.timestamp = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<SignatureAndData>): SignatureAndData {
    const message = createBaseSignatureAndData();
    message.signature = object.signature ?? new Uint8Array();
    message.path = object.path ?? new Uint8Array();
    message.data = object.data ?? new Uint8Array();
    message.timestamp =
      object.timestamp !== undefined && object.timestamp !== null
        ? Long.fromValue(object.timestamp)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: SignatureAndDataAmino): SignatureAndData {
    return {
      signature: object.signature,
      path: object.path,
      data: object.data,
      timestamp: Long.fromString(object.timestamp),
    };
  },
  toAmino(message: SignatureAndData): SignatureAndDataAmino {
    const obj: any = {};
    obj.signature = message.signature;
    obj.path = message.path;
    obj.data = message.data;
    obj.timestamp = message.timestamp
      ? message.timestamp.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(object: SignatureAndDataAminoMsg): SignatureAndData {
    return SignatureAndData.fromAmino(object.value);
  },
  toAminoMsg(message: SignatureAndData): SignatureAndDataAminoMsg {
    return {
      type: "cosmos-sdk/SignatureAndData",
      value: SignatureAndData.toAmino(message),
    };
  },
  fromProtoMsg(message: SignatureAndDataProtoMsg): SignatureAndData {
    return SignatureAndData.decode(message.value);
  },
  toProto(message: SignatureAndData): Uint8Array {
    return SignatureAndData.encode(message).finish();
  },
  toProtoMsg(message: SignatureAndData): SignatureAndDataProtoMsg {
    return {
      typeUrl: "/ibc.lightclients.solomachine.v3.SignatureAndData",
      value: SignatureAndData.encode(message).finish(),
    };
  },
};
function createBaseTimestampedSignatureData(): TimestampedSignatureData {
  return {
    signatureData: new Uint8Array(),
    timestamp: Long.UZERO,
  };
}
export const TimestampedSignatureData = {
  typeUrl: "/ibc.lightclients.solomachine.v3.TimestampedSignatureData",
  encode(
    message: TimestampedSignatureData,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.signatureData.length !== 0) {
      writer.uint32(10).bytes(message.signatureData);
    }
    if (!message.timestamp.isZero()) {
      writer.uint32(16).uint64(message.timestamp);
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): TimestampedSignatureData {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTimestampedSignatureData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.signatureData = reader.bytes();
          break;
        case 2:
          message.timestamp = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(
    object: Partial<TimestampedSignatureData>
  ): TimestampedSignatureData {
    const message = createBaseTimestampedSignatureData();
    message.signatureData = object.signatureData ?? new Uint8Array();
    message.timestamp =
      object.timestamp !== undefined && object.timestamp !== null
        ? Long.fromValue(object.timestamp)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: TimestampedSignatureDataAmino): TimestampedSignatureData {
    return {
      signatureData: object.signature_data,
      timestamp: Long.fromString(object.timestamp),
    };
  },
  toAmino(message: TimestampedSignatureData): TimestampedSignatureDataAmino {
    const obj: any = {};
    obj.signature_data = message.signatureData;
    obj.timestamp = message.timestamp
      ? message.timestamp.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(
    object: TimestampedSignatureDataAminoMsg
  ): TimestampedSignatureData {
    return TimestampedSignatureData.fromAmino(object.value);
  },
  toAminoMsg(
    message: TimestampedSignatureData
  ): TimestampedSignatureDataAminoMsg {
    return {
      type: "cosmos-sdk/TimestampedSignatureData",
      value: TimestampedSignatureData.toAmino(message),
    };
  },
  fromProtoMsg(
    message: TimestampedSignatureDataProtoMsg
  ): TimestampedSignatureData {
    return TimestampedSignatureData.decode(message.value);
  },
  toProto(message: TimestampedSignatureData): Uint8Array {
    return TimestampedSignatureData.encode(message).finish();
  },
  toProtoMsg(
    message: TimestampedSignatureData
  ): TimestampedSignatureDataProtoMsg {
    return {
      typeUrl: "/ibc.lightclients.solomachine.v3.TimestampedSignatureData",
      value: TimestampedSignatureData.encode(message).finish(),
    };
  },
};
function createBaseSignBytes(): SignBytes {
  return {
    sequence: Long.UZERO,
    timestamp: Long.UZERO,
    diversifier: "",
    path: new Uint8Array(),
    data: new Uint8Array(),
  };
}
export const SignBytes = {
  typeUrl: "/ibc.lightclients.solomachine.v3.SignBytes",
  encode(
    message: SignBytes,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.sequence.isZero()) {
      writer.uint32(8).uint64(message.sequence);
    }
    if (!message.timestamp.isZero()) {
      writer.uint32(16).uint64(message.timestamp);
    }
    if (message.diversifier !== "") {
      writer.uint32(26).string(message.diversifier);
    }
    if (message.path.length !== 0) {
      writer.uint32(34).bytes(message.path);
    }
    if (message.data.length !== 0) {
      writer.uint32(42).bytes(message.data);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): SignBytes {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSignBytes();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.sequence = reader.uint64() as Long;
          break;
        case 2:
          message.timestamp = reader.uint64() as Long;
          break;
        case 3:
          message.diversifier = reader.string();
          break;
        case 4:
          message.path = reader.bytes();
          break;
        case 5:
          message.data = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<SignBytes>): SignBytes {
    const message = createBaseSignBytes();
    message.sequence =
      object.sequence !== undefined && object.sequence !== null
        ? Long.fromValue(object.sequence)
        : Long.UZERO;
    message.timestamp =
      object.timestamp !== undefined && object.timestamp !== null
        ? Long.fromValue(object.timestamp)
        : Long.UZERO;
    message.diversifier = object.diversifier ?? "";
    message.path = object.path ?? new Uint8Array();
    message.data = object.data ?? new Uint8Array();
    return message;
  },
  fromAmino(object: SignBytesAmino): SignBytes {
    return {
      sequence: Long.fromString(object.sequence),
      timestamp: Long.fromString(object.timestamp),
      diversifier: object.diversifier,
      path: object.path,
      data: object.data,
    };
  },
  toAmino(message: SignBytes): SignBytesAmino {
    const obj: any = {};
    obj.sequence = message.sequence ? message.sequence.toString() : undefined;
    obj.timestamp = message.timestamp
      ? message.timestamp.toString()
      : undefined;
    obj.diversifier = message.diversifier;
    obj.path = message.path;
    obj.data = message.data;
    return obj;
  },
  fromAminoMsg(object: SignBytesAminoMsg): SignBytes {
    return SignBytes.fromAmino(object.value);
  },
  toAminoMsg(message: SignBytes): SignBytesAminoMsg {
    return {
      type: "cosmos-sdk/SignBytes",
      value: SignBytes.toAmino(message),
    };
  },
  fromProtoMsg(message: SignBytesProtoMsg): SignBytes {
    return SignBytes.decode(message.value);
  },
  toProto(message: SignBytes): Uint8Array {
    return SignBytes.encode(message).finish();
  },
  toProtoMsg(message: SignBytes): SignBytesProtoMsg {
    return {
      typeUrl: "/ibc.lightclients.solomachine.v3.SignBytes",
      value: SignBytes.encode(message).finish(),
    };
  },
};
function createBaseHeaderData(): HeaderData {
  return {
    newPubKey: undefined,
    newDiversifier: "",
  };
}
export const HeaderData = {
  typeUrl: "/ibc.lightclients.solomachine.v3.HeaderData",
  encode(
    message: HeaderData,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.newPubKey !== undefined) {
      Any.encode(message.newPubKey, writer.uint32(10).fork()).ldelim();
    }
    if (message.newDiversifier !== "") {
      writer.uint32(18).string(message.newDiversifier);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): HeaderData {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHeaderData();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.newPubKey = Any.decode(reader, reader.uint32());
          break;
        case 2:
          message.newDiversifier = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<HeaderData>): HeaderData {
    const message = createBaseHeaderData();
    message.newPubKey =
      object.newPubKey !== undefined && object.newPubKey !== null
        ? Any.fromPartial(object.newPubKey)
        : undefined;
    message.newDiversifier = object.newDiversifier ?? "";
    return message;
  },
  fromAmino(object: HeaderDataAmino): HeaderData {
    return {
      newPubKey: object?.new_pub_key
        ? Any.fromAmino(object.new_pub_key)
        : undefined,
      newDiversifier: object.new_diversifier,
    };
  },
  toAmino(message: HeaderData): HeaderDataAmino {
    const obj: any = {};
    obj.new_pub_key = message.newPubKey
      ? Any.toAmino(message.newPubKey)
      : undefined;
    obj.new_diversifier = message.newDiversifier;
    return obj;
  },
  fromAminoMsg(object: HeaderDataAminoMsg): HeaderData {
    return HeaderData.fromAmino(object.value);
  },
  toAminoMsg(message: HeaderData): HeaderDataAminoMsg {
    return {
      type: "cosmos-sdk/HeaderData",
      value: HeaderData.toAmino(message),
    };
  },
  fromProtoMsg(message: HeaderDataProtoMsg): HeaderData {
    return HeaderData.decode(message.value);
  },
  toProto(message: HeaderData): Uint8Array {
    return HeaderData.encode(message).finish();
  },
  toProtoMsg(message: HeaderData): HeaderDataProtoMsg {
    return {
      typeUrl: "/ibc.lightclients.solomachine.v3.HeaderData",
      value: HeaderData.encode(message).finish(),
    };
  },
};
