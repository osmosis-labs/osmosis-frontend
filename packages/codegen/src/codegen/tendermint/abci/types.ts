import { Timestamp } from "../../google/protobuf/timestamp";
import { Header } from "../types/types";
import { ProofOps } from "../crypto/proof";
import { EvidenceParams, ValidatorParams, VersionParams } from "../types/params";
import { PublicKey } from "../crypto/keys";
import * as _m0 from "protobufjs/minimal";
import { isSet, DeepPartial, Long, toTimestamp, fromTimestamp, fromJsonTimestamp, bytesFromBase64, base64FromBytes } from "@osmonauts/helpers";
export enum CheckTxType {
  NEW = 0,
  RECHECK = 1,
  UNRECOGNIZED = -1,
}
export function checkTxTypeFromJSON(object: any): CheckTxType {
  switch (object) {
    case 0:
    case "NEW":
      return CheckTxType.NEW;

    case 1:
    case "RECHECK":
      return CheckTxType.RECHECK;

    case -1:
    case "UNRECOGNIZED":
    default:
      return CheckTxType.UNRECOGNIZED;
  }
}
export function checkTxTypeToJSON(object: CheckTxType): string {
  switch (object) {
    case CheckTxType.NEW:
      return "NEW";

    case CheckTxType.RECHECK:
      return "RECHECK";

    default:
      return "UNKNOWN";
  }
}
export enum ResponseOfferSnapshot_Result {
  /** UNKNOWN - Unknown result, abort all snapshot restoration */
  UNKNOWN = 0,

  /** ACCEPT - Snapshot accepted, apply chunks */
  ACCEPT = 1,

  /** ABORT - Abort all snapshot restoration */
  ABORT = 2,

  /** REJECT - Reject this specific snapshot, try others */
  REJECT = 3,

  /** REJECT_FORMAT - Reject all snapshots of this format, try others */
  REJECT_FORMAT = 4,

  /** REJECT_SENDER - Reject all snapshots from the sender(s), try others */
  REJECT_SENDER = 5,
  UNRECOGNIZED = -1,
}
export function responseOfferSnapshot_ResultFromJSON(object: any): ResponseOfferSnapshot_Result {
  switch (object) {
    case 0:
    case "UNKNOWN":
      return ResponseOfferSnapshot_Result.UNKNOWN;

    case 1:
    case "ACCEPT":
      return ResponseOfferSnapshot_Result.ACCEPT;

    case 2:
    case "ABORT":
      return ResponseOfferSnapshot_Result.ABORT;

    case 3:
    case "REJECT":
      return ResponseOfferSnapshot_Result.REJECT;

    case 4:
    case "REJECT_FORMAT":
      return ResponseOfferSnapshot_Result.REJECT_FORMAT;

    case 5:
    case "REJECT_SENDER":
      return ResponseOfferSnapshot_Result.REJECT_SENDER;

    case -1:
    case "UNRECOGNIZED":
    default:
      return ResponseOfferSnapshot_Result.UNRECOGNIZED;
  }
}
export function responseOfferSnapshot_ResultToJSON(object: ResponseOfferSnapshot_Result): string {
  switch (object) {
    case ResponseOfferSnapshot_Result.UNKNOWN:
      return "UNKNOWN";

    case ResponseOfferSnapshot_Result.ACCEPT:
      return "ACCEPT";

    case ResponseOfferSnapshot_Result.ABORT:
      return "ABORT";

    case ResponseOfferSnapshot_Result.REJECT:
      return "REJECT";

    case ResponseOfferSnapshot_Result.REJECT_FORMAT:
      return "REJECT_FORMAT";

    case ResponseOfferSnapshot_Result.REJECT_SENDER:
      return "REJECT_SENDER";

    default:
      return "UNKNOWN";
  }
}
export enum ResponseApplySnapshotChunk_Result {
  /** UNKNOWN - Unknown result, abort all snapshot restoration */
  UNKNOWN = 0,

  /** ACCEPT - Chunk successfully accepted */
  ACCEPT = 1,

  /** ABORT - Abort all snapshot restoration */
  ABORT = 2,

  /** RETRY - Retry chunk (combine with refetch and reject) */
  RETRY = 3,

  /** RETRY_SNAPSHOT - Retry snapshot (combine with refetch and reject) */
  RETRY_SNAPSHOT = 4,

  /** REJECT_SNAPSHOT - Reject this snapshot, try others */
  REJECT_SNAPSHOT = 5,
  UNRECOGNIZED = -1,
}
export function responseApplySnapshotChunk_ResultFromJSON(object: any): ResponseApplySnapshotChunk_Result {
  switch (object) {
    case 0:
    case "UNKNOWN":
      return ResponseApplySnapshotChunk_Result.UNKNOWN;

    case 1:
    case "ACCEPT":
      return ResponseApplySnapshotChunk_Result.ACCEPT;

    case 2:
    case "ABORT":
      return ResponseApplySnapshotChunk_Result.ABORT;

    case 3:
    case "RETRY":
      return ResponseApplySnapshotChunk_Result.RETRY;

    case 4:
    case "RETRY_SNAPSHOT":
      return ResponseApplySnapshotChunk_Result.RETRY_SNAPSHOT;

    case 5:
    case "REJECT_SNAPSHOT":
      return ResponseApplySnapshotChunk_Result.REJECT_SNAPSHOT;

    case -1:
    case "UNRECOGNIZED":
    default:
      return ResponseApplySnapshotChunk_Result.UNRECOGNIZED;
  }
}
export function responseApplySnapshotChunk_ResultToJSON(object: ResponseApplySnapshotChunk_Result): string {
  switch (object) {
    case ResponseApplySnapshotChunk_Result.UNKNOWN:
      return "UNKNOWN";

    case ResponseApplySnapshotChunk_Result.ACCEPT:
      return "ACCEPT";

    case ResponseApplySnapshotChunk_Result.ABORT:
      return "ABORT";

    case ResponseApplySnapshotChunk_Result.RETRY:
      return "RETRY";

    case ResponseApplySnapshotChunk_Result.RETRY_SNAPSHOT:
      return "RETRY_SNAPSHOT";

    case ResponseApplySnapshotChunk_Result.REJECT_SNAPSHOT:
      return "REJECT_SNAPSHOT";

    default:
      return "UNKNOWN";
  }
}
export enum EvidenceType {
  UNKNOWN = 0,
  DUPLICATE_VOTE = 1,
  LIGHT_CLIENT_ATTACK = 2,
  UNRECOGNIZED = -1,
}
export function evidenceTypeFromJSON(object: any): EvidenceType {
  switch (object) {
    case 0:
    case "UNKNOWN":
      return EvidenceType.UNKNOWN;

    case 1:
    case "DUPLICATE_VOTE":
      return EvidenceType.DUPLICATE_VOTE;

    case 2:
    case "LIGHT_CLIENT_ATTACK":
      return EvidenceType.LIGHT_CLIENT_ATTACK;

    case -1:
    case "UNRECOGNIZED":
    default:
      return EvidenceType.UNRECOGNIZED;
  }
}
export function evidenceTypeToJSON(object: EvidenceType): string {
  switch (object) {
    case EvidenceType.UNKNOWN:
      return "UNKNOWN";

    case EvidenceType.DUPLICATE_VOTE:
      return "DUPLICATE_VOTE";

    case EvidenceType.LIGHT_CLIENT_ATTACK:
      return "LIGHT_CLIENT_ATTACK";

    default:
      return "UNKNOWN";
  }
}
export interface Request {
  echo?: RequestEcho;
  flush?: RequestFlush;
  info?: RequestInfo;
  setOption?: RequestSetOption;
  initChain?: RequestInitChain;
  query?: RequestQuery;
  beginBlock?: RequestBeginBlock;
  checkTx?: RequestCheckTx;
  deliverTx?: RequestDeliverTx;
  endBlock?: RequestEndBlock;
  commit?: RequestCommit;
  listSnapshots?: RequestListSnapshots;
  offerSnapshot?: RequestOfferSnapshot;
  loadSnapshotChunk?: RequestLoadSnapshotChunk;
  applySnapshotChunk?: RequestApplySnapshotChunk;
}
export interface RequestEcho {
  message: string;
}
export interface RequestFlush {}
export interface RequestInfo {
  version: string;
  blockVersion: Long;
  p2pVersion: Long;
}

/** nondeterministic */
export interface RequestSetOption {
  key: string;
  value: string;
}
export interface RequestInitChain {
  time: Date;
  chainId: string;
  consensusParams: ConsensusParams;
  validators: ValidatorUpdate[];
  appStateBytes: Uint8Array;
  initialHeight: Long;
}
export interface RequestQuery {
  data: Uint8Array;
  path: string;
  height: Long;
  prove: boolean;
}
export interface RequestBeginBlock {
  hash: Uint8Array;
  header: Header;
  lastCommitInfo: LastCommitInfo;
  byzantineValidators: Evidence[];
}
export interface RequestCheckTx {
  tx: Uint8Array;
  type: CheckTxType;
}
export interface RequestDeliverTx {
  tx: Uint8Array;
}
export interface RequestEndBlock {
  height: Long;
}
export interface RequestCommit {}

/** lists available snapshots */
export interface RequestListSnapshots {}

/** offers a snapshot to the application */
export interface RequestOfferSnapshot {
  /** snapshot offered by peers */
  snapshot: Snapshot;

  /** light client-verified app hash for snapshot height */
  appHash: Uint8Array;
}

/** loads a snapshot chunk */
export interface RequestLoadSnapshotChunk {
  height: Long;
  format: number;
  chunk: number;
}

/** Applies a snapshot chunk */
export interface RequestApplySnapshotChunk {
  index: number;
  chunk: Uint8Array;
  sender: string;
}
export interface Response {
  exception?: ResponseException;
  echo?: ResponseEcho;
  flush?: ResponseFlush;
  info?: ResponseInfo;
  setOption?: ResponseSetOption;
  initChain?: ResponseInitChain;
  query?: ResponseQuery;
  beginBlock?: ResponseBeginBlock;
  checkTx?: ResponseCheckTx;
  deliverTx?: ResponseDeliverTx;
  endBlock?: ResponseEndBlock;
  commit?: ResponseCommit;
  listSnapshots?: ResponseListSnapshots;
  offerSnapshot?: ResponseOfferSnapshot;
  loadSnapshotChunk?: ResponseLoadSnapshotChunk;
  applySnapshotChunk?: ResponseApplySnapshotChunk;
}

/** nondeterministic */
export interface ResponseException {
  error: string;
}
export interface ResponseEcho {
  message: string;
}
export interface ResponseFlush {}
export interface ResponseInfo {
  data: string;
  version: string;
  appVersion: Long;
  lastBlockHeight: Long;
  lastBlockAppHash: Uint8Array;
}

/** nondeterministic */
export interface ResponseSetOption {
  code: number;

  /** bytes data = 2; */
  log: string;
  info: string;
}
export interface ResponseInitChain {
  consensusParams: ConsensusParams;
  validators: ValidatorUpdate[];
  appHash: Uint8Array;
}
export interface ResponseQuery {
  code: number;

  /** bytes data = 2; // use "value" instead. */
  log: string;

  /** nondeterministic */
  info: string;
  index: Long;
  key: Uint8Array;
  value: Uint8Array;
  proofOps: ProofOps;
  height: Long;
  codespace: string;
}
export interface ResponseBeginBlock {
  events: Event[];
}
export interface ResponseCheckTx {
  code: number;
  data: Uint8Array;

  /** nondeterministic */
  log: string;

  /** nondeterministic */
  info: string;
  gasWanted: Long;
  gasUsed: Long;
  events: Event[];
  codespace: string;
}
export interface ResponseDeliverTx {
  code: number;
  data: Uint8Array;

  /** nondeterministic */
  log: string;

  /** nondeterministic */
  info: string;
  gasWanted: Long;
  gasUsed: Long;
  events: Event[];
  codespace: string;
}
export interface ResponseEndBlock {
  validatorUpdates: ValidatorUpdate[];
  consensusParamUpdates: ConsensusParams;
  events: Event[];
}
export interface ResponseCommit {
  /** reserve 1 */
  data: Uint8Array;
  retainHeight: Long;
}
export interface ResponseListSnapshots {
  snapshots: Snapshot[];
}
export interface ResponseOfferSnapshot {
  result: ResponseOfferSnapshot_Result;
}
export interface ResponseLoadSnapshotChunk {
  chunk: Uint8Array;
}
export interface ResponseApplySnapshotChunk {
  result: ResponseApplySnapshotChunk_Result;

  /** Chunks to refetch and reapply */
  refetchChunks: number[];

  /** Chunk senders to reject and ban */
  rejectSenders: string[];
}

/**
 * ConsensusParams contains all consensus-relevant parameters
 * that can be adjusted by the abci app
 */
export interface ConsensusParams {
  block: BlockParams;
  evidence: EvidenceParams;
  validator: ValidatorParams;
  version: VersionParams;
}

/** BlockParams contains limits on the block size. */
export interface BlockParams {
  /** Note: must be greater than 0 */
  maxBytes: Long;

  /** Note: must be greater or equal to -1 */
  maxGas: Long;
}
export interface LastCommitInfo {
  round: number;
  votes: VoteInfo[];
}

/**
 * Event allows application developers to attach additional information to
 * ResponseBeginBlock, ResponseEndBlock, ResponseCheckTx and ResponseDeliverTx.
 * Later, transactions may be queried using these events.
 */
export interface Event {
  type: string;
  attributes: EventAttribute[];
}

/** EventAttribute is a single key-value pair, associated with an event. */
export interface EventAttribute {
  key: Uint8Array;
  value: Uint8Array;

  /** nondeterministic */
  index: boolean;
}

/**
 * TxResult contains results of executing the transaction.
 * 
 * One usage is indexing transaction results.
 */
export interface TxResult {
  height: Long;
  index: number;
  tx: Uint8Array;
  result: ResponseDeliverTx;
}

/** Validator */
export interface Validator {
  /**
   * The first 20 bytes of SHA256(public key)
   * PubKey pub_key = 2 [(gogoproto.nullable)=false];
   */
  address: Uint8Array;

  /** The voting power */
  power: Long;
}

/** ValidatorUpdate */
export interface ValidatorUpdate {
  pubKey: PublicKey;
  power: Long;
}

/** VoteInfo */
export interface VoteInfo {
  validator: Validator;
  signedLastBlock: boolean;
}
export interface Evidence {
  type: EvidenceType;

  /** The offending validator */
  validator: Validator;

  /** The height when the offense occurred */
  height: Long;

  /** The corresponding time where the offense occurred */
  time: Date;

  /**
   * Total voting power of the validator set in case the ABCI application does
   * not store historical validators.
   * https://github.com/tendermint/tendermint/issues/4581
   */
  totalVotingPower: Long;
}
export interface Snapshot {
  /** The height at which the snapshot was taken */
  height: Long;

  /** The application-specific snapshot format */
  format: number;

  /** Number of chunks in the snapshot */
  chunks: number;

  /** Arbitrary snapshot hash, equal only if identical */
  hash: Uint8Array;

  /** Arbitrary application metadata */
  metadata: Uint8Array;
}

function createBaseRequest(): Request {
  return {
    echo: undefined,
    flush: undefined,
    info: undefined,
    setOption: undefined,
    initChain: undefined,
    query: undefined,
    beginBlock: undefined,
    checkTx: undefined,
    deliverTx: undefined,
    endBlock: undefined,
    commit: undefined,
    listSnapshots: undefined,
    offerSnapshot: undefined,
    loadSnapshotChunk: undefined,
    applySnapshotChunk: undefined
  };
}

export const Request = {
  encode(message: Request, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.echo !== undefined) {
      RequestEcho.encode(message.echo, writer.uint32(10).fork()).ldelim();
    }

    if (message.flush !== undefined) {
      RequestFlush.encode(message.flush, writer.uint32(18).fork()).ldelim();
    }

    if (message.info !== undefined) {
      RequestInfo.encode(message.info, writer.uint32(26).fork()).ldelim();
    }

    if (message.setOption !== undefined) {
      RequestSetOption.encode(message.setOption, writer.uint32(34).fork()).ldelim();
    }

    if (message.initChain !== undefined) {
      RequestInitChain.encode(message.initChain, writer.uint32(42).fork()).ldelim();
    }

    if (message.query !== undefined) {
      RequestQuery.encode(message.query, writer.uint32(50).fork()).ldelim();
    }

    if (message.beginBlock !== undefined) {
      RequestBeginBlock.encode(message.beginBlock, writer.uint32(58).fork()).ldelim();
    }

    if (message.checkTx !== undefined) {
      RequestCheckTx.encode(message.checkTx, writer.uint32(66).fork()).ldelim();
    }

    if (message.deliverTx !== undefined) {
      RequestDeliverTx.encode(message.deliverTx, writer.uint32(74).fork()).ldelim();
    }

    if (message.endBlock !== undefined) {
      RequestEndBlock.encode(message.endBlock, writer.uint32(82).fork()).ldelim();
    }

    if (message.commit !== undefined) {
      RequestCommit.encode(message.commit, writer.uint32(90).fork()).ldelim();
    }

    if (message.listSnapshots !== undefined) {
      RequestListSnapshots.encode(message.listSnapshots, writer.uint32(98).fork()).ldelim();
    }

    if (message.offerSnapshot !== undefined) {
      RequestOfferSnapshot.encode(message.offerSnapshot, writer.uint32(106).fork()).ldelim();
    }

    if (message.loadSnapshotChunk !== undefined) {
      RequestLoadSnapshotChunk.encode(message.loadSnapshotChunk, writer.uint32(114).fork()).ldelim();
    }

    if (message.applySnapshotChunk !== undefined) {
      RequestApplySnapshotChunk.encode(message.applySnapshotChunk, writer.uint32(122).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Request {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRequest();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.echo = RequestEcho.decode(reader, reader.uint32());
          break;

        case 2:
          message.flush = RequestFlush.decode(reader, reader.uint32());
          break;

        case 3:
          message.info = RequestInfo.decode(reader, reader.uint32());
          break;

        case 4:
          message.setOption = RequestSetOption.decode(reader, reader.uint32());
          break;

        case 5:
          message.initChain = RequestInitChain.decode(reader, reader.uint32());
          break;

        case 6:
          message.query = RequestQuery.decode(reader, reader.uint32());
          break;

        case 7:
          message.beginBlock = RequestBeginBlock.decode(reader, reader.uint32());
          break;

        case 8:
          message.checkTx = RequestCheckTx.decode(reader, reader.uint32());
          break;

        case 9:
          message.deliverTx = RequestDeliverTx.decode(reader, reader.uint32());
          break;

        case 10:
          message.endBlock = RequestEndBlock.decode(reader, reader.uint32());
          break;

        case 11:
          message.commit = RequestCommit.decode(reader, reader.uint32());
          break;

        case 12:
          message.listSnapshots = RequestListSnapshots.decode(reader, reader.uint32());
          break;

        case 13:
          message.offerSnapshot = RequestOfferSnapshot.decode(reader, reader.uint32());
          break;

        case 14:
          message.loadSnapshotChunk = RequestLoadSnapshotChunk.decode(reader, reader.uint32());
          break;

        case 15:
          message.applySnapshotChunk = RequestApplySnapshotChunk.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): Request {
    return {
      echo: isSet(object.echo) ? RequestEcho.fromJSON(object.echo) : undefined,
      flush: isSet(object.flush) ? RequestFlush.fromJSON(object.flush) : undefined,
      info: isSet(object.info) ? RequestInfo.fromJSON(object.info) : undefined,
      setOption: isSet(object.setOption) ? RequestSetOption.fromJSON(object.setOption) : undefined,
      initChain: isSet(object.initChain) ? RequestInitChain.fromJSON(object.initChain) : undefined,
      query: isSet(object.query) ? RequestQuery.fromJSON(object.query) : undefined,
      beginBlock: isSet(object.beginBlock) ? RequestBeginBlock.fromJSON(object.beginBlock) : undefined,
      checkTx: isSet(object.checkTx) ? RequestCheckTx.fromJSON(object.checkTx) : undefined,
      deliverTx: isSet(object.deliverTx) ? RequestDeliverTx.fromJSON(object.deliverTx) : undefined,
      endBlock: isSet(object.endBlock) ? RequestEndBlock.fromJSON(object.endBlock) : undefined,
      commit: isSet(object.commit) ? RequestCommit.fromJSON(object.commit) : undefined,
      listSnapshots: isSet(object.listSnapshots) ? RequestListSnapshots.fromJSON(object.listSnapshots) : undefined,
      offerSnapshot: isSet(object.offerSnapshot) ? RequestOfferSnapshot.fromJSON(object.offerSnapshot) : undefined,
      loadSnapshotChunk: isSet(object.loadSnapshotChunk) ? RequestLoadSnapshotChunk.fromJSON(object.loadSnapshotChunk) : undefined,
      applySnapshotChunk: isSet(object.applySnapshotChunk) ? RequestApplySnapshotChunk.fromJSON(object.applySnapshotChunk) : undefined
    };
  },

  toJSON(message: Request): unknown {
    const obj: any = {};
    message.echo !== undefined && (obj.echo = message.echo ? RequestEcho.toJSON(message.echo) : undefined);
    message.flush !== undefined && (obj.flush = message.flush ? RequestFlush.toJSON(message.flush) : undefined);
    message.info !== undefined && (obj.info = message.info ? RequestInfo.toJSON(message.info) : undefined);
    message.setOption !== undefined && (obj.setOption = message.setOption ? RequestSetOption.toJSON(message.setOption) : undefined);
    message.initChain !== undefined && (obj.initChain = message.initChain ? RequestInitChain.toJSON(message.initChain) : undefined);
    message.query !== undefined && (obj.query = message.query ? RequestQuery.toJSON(message.query) : undefined);
    message.beginBlock !== undefined && (obj.beginBlock = message.beginBlock ? RequestBeginBlock.toJSON(message.beginBlock) : undefined);
    message.checkTx !== undefined && (obj.checkTx = message.checkTx ? RequestCheckTx.toJSON(message.checkTx) : undefined);
    message.deliverTx !== undefined && (obj.deliverTx = message.deliverTx ? RequestDeliverTx.toJSON(message.deliverTx) : undefined);
    message.endBlock !== undefined && (obj.endBlock = message.endBlock ? RequestEndBlock.toJSON(message.endBlock) : undefined);
    message.commit !== undefined && (obj.commit = message.commit ? RequestCommit.toJSON(message.commit) : undefined);
    message.listSnapshots !== undefined && (obj.listSnapshots = message.listSnapshots ? RequestListSnapshots.toJSON(message.listSnapshots) : undefined);
    message.offerSnapshot !== undefined && (obj.offerSnapshot = message.offerSnapshot ? RequestOfferSnapshot.toJSON(message.offerSnapshot) : undefined);
    message.loadSnapshotChunk !== undefined && (obj.loadSnapshotChunk = message.loadSnapshotChunk ? RequestLoadSnapshotChunk.toJSON(message.loadSnapshotChunk) : undefined);
    message.applySnapshotChunk !== undefined && (obj.applySnapshotChunk = message.applySnapshotChunk ? RequestApplySnapshotChunk.toJSON(message.applySnapshotChunk) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<Request>): Request {
    const message = createBaseRequest();
    message.echo = object.echo !== undefined && object.echo !== null ? RequestEcho.fromPartial(object.echo) : undefined;
    message.flush = object.flush !== undefined && object.flush !== null ? RequestFlush.fromPartial(object.flush) : undefined;
    message.info = object.info !== undefined && object.info !== null ? RequestInfo.fromPartial(object.info) : undefined;
    message.setOption = object.setOption !== undefined && object.setOption !== null ? RequestSetOption.fromPartial(object.setOption) : undefined;
    message.initChain = object.initChain !== undefined && object.initChain !== null ? RequestInitChain.fromPartial(object.initChain) : undefined;
    message.query = object.query !== undefined && object.query !== null ? RequestQuery.fromPartial(object.query) : undefined;
    message.beginBlock = object.beginBlock !== undefined && object.beginBlock !== null ? RequestBeginBlock.fromPartial(object.beginBlock) : undefined;
    message.checkTx = object.checkTx !== undefined && object.checkTx !== null ? RequestCheckTx.fromPartial(object.checkTx) : undefined;
    message.deliverTx = object.deliverTx !== undefined && object.deliverTx !== null ? RequestDeliverTx.fromPartial(object.deliverTx) : undefined;
    message.endBlock = object.endBlock !== undefined && object.endBlock !== null ? RequestEndBlock.fromPartial(object.endBlock) : undefined;
    message.commit = object.commit !== undefined && object.commit !== null ? RequestCommit.fromPartial(object.commit) : undefined;
    message.listSnapshots = object.listSnapshots !== undefined && object.listSnapshots !== null ? RequestListSnapshots.fromPartial(object.listSnapshots) : undefined;
    message.offerSnapshot = object.offerSnapshot !== undefined && object.offerSnapshot !== null ? RequestOfferSnapshot.fromPartial(object.offerSnapshot) : undefined;
    message.loadSnapshotChunk = object.loadSnapshotChunk !== undefined && object.loadSnapshotChunk !== null ? RequestLoadSnapshotChunk.fromPartial(object.loadSnapshotChunk) : undefined;
    message.applySnapshotChunk = object.applySnapshotChunk !== undefined && object.applySnapshotChunk !== null ? RequestApplySnapshotChunk.fromPartial(object.applySnapshotChunk) : undefined;
    return message;
  }

};

function createBaseRequestEcho(): RequestEcho {
  return {
    message: ""
  };
}

export const RequestEcho = {
  encode(message: RequestEcho, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.message !== "") {
      writer.uint32(10).string(message.message);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RequestEcho {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRequestEcho();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.message = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): RequestEcho {
    return {
      message: isSet(object.message) ? String(object.message) : ""
    };
  },

  toJSON(message: RequestEcho): unknown {
    const obj: any = {};
    message.message !== undefined && (obj.message = message.message);
    return obj;
  },

  fromPartial(object: DeepPartial<RequestEcho>): RequestEcho {
    const message = createBaseRequestEcho();
    message.message = object.message ?? "";
    return message;
  }

};

function createBaseRequestFlush(): RequestFlush {
  return {};
}

export const RequestFlush = {
  encode(_: RequestFlush, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RequestFlush {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRequestFlush();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(_: any): RequestFlush {
    return {};
  },

  toJSON(_: RequestFlush): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<RequestFlush>): RequestFlush {
    const message = createBaseRequestFlush();
    return message;
  }

};

function createBaseRequestInfo(): RequestInfo {
  return {
    version: "",
    blockVersion: Long.UZERO,
    p2pVersion: Long.UZERO
  };
}

export const RequestInfo = {
  encode(message: RequestInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.version !== "") {
      writer.uint32(10).string(message.version);
    }

    if (!message.blockVersion.isZero()) {
      writer.uint32(16).uint64(message.blockVersion);
    }

    if (!message.p2pVersion.isZero()) {
      writer.uint32(24).uint64(message.p2pVersion);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RequestInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRequestInfo();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.version = reader.string();
          break;

        case 2:
          message.blockVersion = (reader.uint64() as Long);
          break;

        case 3:
          message.p2pVersion = (reader.uint64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): RequestInfo {
    return {
      version: isSet(object.version) ? String(object.version) : "",
      blockVersion: isSet(object.blockVersion) ? Long.fromString(object.blockVersion) : Long.UZERO,
      p2pVersion: isSet(object.p2pVersion) ? Long.fromString(object.p2pVersion) : Long.UZERO
    };
  },

  toJSON(message: RequestInfo): unknown {
    const obj: any = {};
    message.version !== undefined && (obj.version = message.version);
    message.blockVersion !== undefined && (obj.blockVersion = (message.blockVersion || Long.UZERO).toString());
    message.p2pVersion !== undefined && (obj.p2pVersion = (message.p2pVersion || Long.UZERO).toString());
    return obj;
  },

  fromPartial(object: DeepPartial<RequestInfo>): RequestInfo {
    const message = createBaseRequestInfo();
    message.version = object.version ?? "";
    message.blockVersion = object.blockVersion !== undefined && object.blockVersion !== null ? Long.fromValue(object.blockVersion) : Long.UZERO;
    message.p2pVersion = object.p2pVersion !== undefined && object.p2pVersion !== null ? Long.fromValue(object.p2pVersion) : Long.UZERO;
    return message;
  }

};

function createBaseRequestSetOption(): RequestSetOption {
  return {
    key: "",
    value: ""
  };
}

export const RequestSetOption = {
  encode(message: RequestSetOption, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }

    if (message.value !== "") {
      writer.uint32(18).string(message.value);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RequestSetOption {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRequestSetOption();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;

        case 2:
          message.value = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): RequestSetOption {
    return {
      key: isSet(object.key) ? String(object.key) : "",
      value: isSet(object.value) ? String(object.value) : ""
    };
  },

  toJSON(message: RequestSetOption): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = message.key);
    message.value !== undefined && (obj.value = message.value);
    return obj;
  },

  fromPartial(object: DeepPartial<RequestSetOption>): RequestSetOption {
    const message = createBaseRequestSetOption();
    message.key = object.key ?? "";
    message.value = object.value ?? "";
    return message;
  }

};

function createBaseRequestInitChain(): RequestInitChain {
  return {
    time: undefined,
    chainId: "",
    consensusParams: undefined,
    validators: [],
    appStateBytes: new Uint8Array(),
    initialHeight: Long.ZERO
  };
}

export const RequestInitChain = {
  encode(message: RequestInitChain, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.time !== undefined) {
      Timestamp.encode(toTimestamp(message.time), writer.uint32(10).fork()).ldelim();
    }

    if (message.chainId !== "") {
      writer.uint32(18).string(message.chainId);
    }

    if (message.consensusParams !== undefined) {
      ConsensusParams.encode(message.consensusParams, writer.uint32(26).fork()).ldelim();
    }

    for (const v of message.validators) {
      ValidatorUpdate.encode(v!, writer.uint32(34).fork()).ldelim();
    }

    if (message.appStateBytes.length !== 0) {
      writer.uint32(42).bytes(message.appStateBytes);
    }

    if (!message.initialHeight.isZero()) {
      writer.uint32(48).int64(message.initialHeight);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RequestInitChain {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRequestInitChain();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.time = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;

        case 2:
          message.chainId = reader.string();
          break;

        case 3:
          message.consensusParams = ConsensusParams.decode(reader, reader.uint32());
          break;

        case 4:
          message.validators.push(ValidatorUpdate.decode(reader, reader.uint32()));
          break;

        case 5:
          message.appStateBytes = reader.bytes();
          break;

        case 6:
          message.initialHeight = (reader.int64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): RequestInitChain {
    return {
      time: isSet(object.time) ? fromJsonTimestamp(object.time) : undefined,
      chainId: isSet(object.chainId) ? String(object.chainId) : "",
      consensusParams: isSet(object.consensusParams) ? ConsensusParams.fromJSON(object.consensusParams) : undefined,
      validators: Array.isArray(object?.validators) ? object.validators.map((e: any) => ValidatorUpdate.fromJSON(e)) : [],
      appStateBytes: isSet(object.appStateBytes) ? bytesFromBase64(object.appStateBytes) : new Uint8Array(),
      initialHeight: isSet(object.initialHeight) ? Long.fromString(object.initialHeight) : Long.ZERO
    };
  },

  toJSON(message: RequestInitChain): unknown {
    const obj: any = {};
    message.time !== undefined && (obj.time = message.time.toISOString());
    message.chainId !== undefined && (obj.chainId = message.chainId);
    message.consensusParams !== undefined && (obj.consensusParams = message.consensusParams ? ConsensusParams.toJSON(message.consensusParams) : undefined);

    if (message.validators) {
      obj.validators = message.validators.map(e => e ? ValidatorUpdate.toJSON(e) : undefined);
    } else {
      obj.validators = [];
    }

    message.appStateBytes !== undefined && (obj.appStateBytes = base64FromBytes(message.appStateBytes !== undefined ? message.appStateBytes : new Uint8Array()));
    message.initialHeight !== undefined && (obj.initialHeight = (message.initialHeight || Long.ZERO).toString());
    return obj;
  },

  fromPartial(object: DeepPartial<RequestInitChain>): RequestInitChain {
    const message = createBaseRequestInitChain();
    message.time = object.time ?? undefined;
    message.chainId = object.chainId ?? "";
    message.consensusParams = object.consensusParams !== undefined && object.consensusParams !== null ? ConsensusParams.fromPartial(object.consensusParams) : undefined;
    message.validators = object.validators?.map(e => ValidatorUpdate.fromPartial(e)) || [];
    message.appStateBytes = object.appStateBytes ?? new Uint8Array();
    message.initialHeight = object.initialHeight !== undefined && object.initialHeight !== null ? Long.fromValue(object.initialHeight) : Long.ZERO;
    return message;
  }

};

function createBaseRequestQuery(): RequestQuery {
  return {
    data: new Uint8Array(),
    path: "",
    height: Long.ZERO,
    prove: false
  };
}

export const RequestQuery = {
  encode(message: RequestQuery, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.data.length !== 0) {
      writer.uint32(10).bytes(message.data);
    }

    if (message.path !== "") {
      writer.uint32(18).string(message.path);
    }

    if (!message.height.isZero()) {
      writer.uint32(24).int64(message.height);
    }

    if (message.prove === true) {
      writer.uint32(32).bool(message.prove);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RequestQuery {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRequestQuery();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.data = reader.bytes();
          break;

        case 2:
          message.path = reader.string();
          break;

        case 3:
          message.height = (reader.int64() as Long);
          break;

        case 4:
          message.prove = reader.bool();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): RequestQuery {
    return {
      data: isSet(object.data) ? bytesFromBase64(object.data) : new Uint8Array(),
      path: isSet(object.path) ? String(object.path) : "",
      height: isSet(object.height) ? Long.fromString(object.height) : Long.ZERO,
      prove: isSet(object.prove) ? Boolean(object.prove) : false
    };
  },

  toJSON(message: RequestQuery): unknown {
    const obj: any = {};
    message.data !== undefined && (obj.data = base64FromBytes(message.data !== undefined ? message.data : new Uint8Array()));
    message.path !== undefined && (obj.path = message.path);
    message.height !== undefined && (obj.height = (message.height || Long.ZERO).toString());
    message.prove !== undefined && (obj.prove = message.prove);
    return obj;
  },

  fromPartial(object: DeepPartial<RequestQuery>): RequestQuery {
    const message = createBaseRequestQuery();
    message.data = object.data ?? new Uint8Array();
    message.path = object.path ?? "";
    message.height = object.height !== undefined && object.height !== null ? Long.fromValue(object.height) : Long.ZERO;
    message.prove = object.prove ?? false;
    return message;
  }

};

function createBaseRequestBeginBlock(): RequestBeginBlock {
  return {
    hash: new Uint8Array(),
    header: undefined,
    lastCommitInfo: undefined,
    byzantineValidators: []
  };
}

export const RequestBeginBlock = {
  encode(message: RequestBeginBlock, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.hash.length !== 0) {
      writer.uint32(10).bytes(message.hash);
    }

    if (message.header !== undefined) {
      Header.encode(message.header, writer.uint32(18).fork()).ldelim();
    }

    if (message.lastCommitInfo !== undefined) {
      LastCommitInfo.encode(message.lastCommitInfo, writer.uint32(26).fork()).ldelim();
    }

    for (const v of message.byzantineValidators) {
      Evidence.encode(v!, writer.uint32(34).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RequestBeginBlock {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRequestBeginBlock();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.hash = reader.bytes();
          break;

        case 2:
          message.header = Header.decode(reader, reader.uint32());
          break;

        case 3:
          message.lastCommitInfo = LastCommitInfo.decode(reader, reader.uint32());
          break;

        case 4:
          message.byzantineValidators.push(Evidence.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): RequestBeginBlock {
    return {
      hash: isSet(object.hash) ? bytesFromBase64(object.hash) : new Uint8Array(),
      header: isSet(object.header) ? Header.fromJSON(object.header) : undefined,
      lastCommitInfo: isSet(object.lastCommitInfo) ? LastCommitInfo.fromJSON(object.lastCommitInfo) : undefined,
      byzantineValidators: Array.isArray(object?.byzantineValidators) ? object.byzantineValidators.map((e: any) => Evidence.fromJSON(e)) : []
    };
  },

  toJSON(message: RequestBeginBlock): unknown {
    const obj: any = {};
    message.hash !== undefined && (obj.hash = base64FromBytes(message.hash !== undefined ? message.hash : new Uint8Array()));
    message.header !== undefined && (obj.header = message.header ? Header.toJSON(message.header) : undefined);
    message.lastCommitInfo !== undefined && (obj.lastCommitInfo = message.lastCommitInfo ? LastCommitInfo.toJSON(message.lastCommitInfo) : undefined);

    if (message.byzantineValidators) {
      obj.byzantineValidators = message.byzantineValidators.map(e => e ? Evidence.toJSON(e) : undefined);
    } else {
      obj.byzantineValidators = [];
    }

    return obj;
  },

  fromPartial(object: DeepPartial<RequestBeginBlock>): RequestBeginBlock {
    const message = createBaseRequestBeginBlock();
    message.hash = object.hash ?? new Uint8Array();
    message.header = object.header !== undefined && object.header !== null ? Header.fromPartial(object.header) : undefined;
    message.lastCommitInfo = object.lastCommitInfo !== undefined && object.lastCommitInfo !== null ? LastCommitInfo.fromPartial(object.lastCommitInfo) : undefined;
    message.byzantineValidators = object.byzantineValidators?.map(e => Evidence.fromPartial(e)) || [];
    return message;
  }

};

function createBaseRequestCheckTx(): RequestCheckTx {
  return {
    tx: new Uint8Array(),
    type: 0
  };
}

export const RequestCheckTx = {
  encode(message: RequestCheckTx, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.tx.length !== 0) {
      writer.uint32(10).bytes(message.tx);
    }

    if (message.type !== 0) {
      writer.uint32(16).int32(message.type);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RequestCheckTx {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRequestCheckTx();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.tx = reader.bytes();
          break;

        case 2:
          message.type = (reader.int32() as any);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): RequestCheckTx {
    return {
      tx: isSet(object.tx) ? bytesFromBase64(object.tx) : new Uint8Array(),
      type: isSet(object.type) ? checkTxTypeFromJSON(object.type) : 0
    };
  },

  toJSON(message: RequestCheckTx): unknown {
    const obj: any = {};
    message.tx !== undefined && (obj.tx = base64FromBytes(message.tx !== undefined ? message.tx : new Uint8Array()));
    message.type !== undefined && (obj.type = checkTxTypeToJSON(message.type));
    return obj;
  },

  fromPartial(object: DeepPartial<RequestCheckTx>): RequestCheckTx {
    const message = createBaseRequestCheckTx();
    message.tx = object.tx ?? new Uint8Array();
    message.type = object.type ?? 0;
    return message;
  }

};

function createBaseRequestDeliverTx(): RequestDeliverTx {
  return {
    tx: new Uint8Array()
  };
}

export const RequestDeliverTx = {
  encode(message: RequestDeliverTx, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.tx.length !== 0) {
      writer.uint32(10).bytes(message.tx);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RequestDeliverTx {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRequestDeliverTx();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.tx = reader.bytes();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): RequestDeliverTx {
    return {
      tx: isSet(object.tx) ? bytesFromBase64(object.tx) : new Uint8Array()
    };
  },

  toJSON(message: RequestDeliverTx): unknown {
    const obj: any = {};
    message.tx !== undefined && (obj.tx = base64FromBytes(message.tx !== undefined ? message.tx : new Uint8Array()));
    return obj;
  },

  fromPartial(object: DeepPartial<RequestDeliverTx>): RequestDeliverTx {
    const message = createBaseRequestDeliverTx();
    message.tx = object.tx ?? new Uint8Array();
    return message;
  }

};

function createBaseRequestEndBlock(): RequestEndBlock {
  return {
    height: Long.ZERO
  };
}

export const RequestEndBlock = {
  encode(message: RequestEndBlock, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.height.isZero()) {
      writer.uint32(8).int64(message.height);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RequestEndBlock {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRequestEndBlock();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.height = (reader.int64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): RequestEndBlock {
    return {
      height: isSet(object.height) ? Long.fromString(object.height) : Long.ZERO
    };
  },

  toJSON(message: RequestEndBlock): unknown {
    const obj: any = {};
    message.height !== undefined && (obj.height = (message.height || Long.ZERO).toString());
    return obj;
  },

  fromPartial(object: DeepPartial<RequestEndBlock>): RequestEndBlock {
    const message = createBaseRequestEndBlock();
    message.height = object.height !== undefined && object.height !== null ? Long.fromValue(object.height) : Long.ZERO;
    return message;
  }

};

function createBaseRequestCommit(): RequestCommit {
  return {};
}

export const RequestCommit = {
  encode(_: RequestCommit, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RequestCommit {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRequestCommit();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(_: any): RequestCommit {
    return {};
  },

  toJSON(_: RequestCommit): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<RequestCommit>): RequestCommit {
    const message = createBaseRequestCommit();
    return message;
  }

};

function createBaseRequestListSnapshots(): RequestListSnapshots {
  return {};
}

export const RequestListSnapshots = {
  encode(_: RequestListSnapshots, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RequestListSnapshots {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRequestListSnapshots();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(_: any): RequestListSnapshots {
    return {};
  },

  toJSON(_: RequestListSnapshots): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<RequestListSnapshots>): RequestListSnapshots {
    const message = createBaseRequestListSnapshots();
    return message;
  }

};

function createBaseRequestOfferSnapshot(): RequestOfferSnapshot {
  return {
    snapshot: undefined,
    appHash: new Uint8Array()
  };
}

export const RequestOfferSnapshot = {
  encode(message: RequestOfferSnapshot, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.snapshot !== undefined) {
      Snapshot.encode(message.snapshot, writer.uint32(10).fork()).ldelim();
    }

    if (message.appHash.length !== 0) {
      writer.uint32(18).bytes(message.appHash);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RequestOfferSnapshot {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRequestOfferSnapshot();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.snapshot = Snapshot.decode(reader, reader.uint32());
          break;

        case 2:
          message.appHash = reader.bytes();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): RequestOfferSnapshot {
    return {
      snapshot: isSet(object.snapshot) ? Snapshot.fromJSON(object.snapshot) : undefined,
      appHash: isSet(object.appHash) ? bytesFromBase64(object.appHash) : new Uint8Array()
    };
  },

  toJSON(message: RequestOfferSnapshot): unknown {
    const obj: any = {};
    message.snapshot !== undefined && (obj.snapshot = message.snapshot ? Snapshot.toJSON(message.snapshot) : undefined);
    message.appHash !== undefined && (obj.appHash = base64FromBytes(message.appHash !== undefined ? message.appHash : new Uint8Array()));
    return obj;
  },

  fromPartial(object: DeepPartial<RequestOfferSnapshot>): RequestOfferSnapshot {
    const message = createBaseRequestOfferSnapshot();
    message.snapshot = object.snapshot !== undefined && object.snapshot !== null ? Snapshot.fromPartial(object.snapshot) : undefined;
    message.appHash = object.appHash ?? new Uint8Array();
    return message;
  }

};

function createBaseRequestLoadSnapshotChunk(): RequestLoadSnapshotChunk {
  return {
    height: Long.UZERO,
    format: 0,
    chunk: 0
  };
}

export const RequestLoadSnapshotChunk = {
  encode(message: RequestLoadSnapshotChunk, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.height.isZero()) {
      writer.uint32(8).uint64(message.height);
    }

    if (message.format !== 0) {
      writer.uint32(16).uint32(message.format);
    }

    if (message.chunk !== 0) {
      writer.uint32(24).uint32(message.chunk);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RequestLoadSnapshotChunk {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRequestLoadSnapshotChunk();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.height = (reader.uint64() as Long);
          break;

        case 2:
          message.format = reader.uint32();
          break;

        case 3:
          message.chunk = reader.uint32();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): RequestLoadSnapshotChunk {
    return {
      height: isSet(object.height) ? Long.fromString(object.height) : Long.UZERO,
      format: isSet(object.format) ? Number(object.format) : 0,
      chunk: isSet(object.chunk) ? Number(object.chunk) : 0
    };
  },

  toJSON(message: RequestLoadSnapshotChunk): unknown {
    const obj: any = {};
    message.height !== undefined && (obj.height = (message.height || Long.UZERO).toString());
    message.format !== undefined && (obj.format = Math.round(message.format));
    message.chunk !== undefined && (obj.chunk = Math.round(message.chunk));
    return obj;
  },

  fromPartial(object: DeepPartial<RequestLoadSnapshotChunk>): RequestLoadSnapshotChunk {
    const message = createBaseRequestLoadSnapshotChunk();
    message.height = object.height !== undefined && object.height !== null ? Long.fromValue(object.height) : Long.UZERO;
    message.format = object.format ?? 0;
    message.chunk = object.chunk ?? 0;
    return message;
  }

};

function createBaseRequestApplySnapshotChunk(): RequestApplySnapshotChunk {
  return {
    index: 0,
    chunk: new Uint8Array(),
    sender: ""
  };
}

export const RequestApplySnapshotChunk = {
  encode(message: RequestApplySnapshotChunk, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.index !== 0) {
      writer.uint32(8).uint32(message.index);
    }

    if (message.chunk.length !== 0) {
      writer.uint32(18).bytes(message.chunk);
    }

    if (message.sender !== "") {
      writer.uint32(26).string(message.sender);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): RequestApplySnapshotChunk {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRequestApplySnapshotChunk();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.index = reader.uint32();
          break;

        case 2:
          message.chunk = reader.bytes();
          break;

        case 3:
          message.sender = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): RequestApplySnapshotChunk {
    return {
      index: isSet(object.index) ? Number(object.index) : 0,
      chunk: isSet(object.chunk) ? bytesFromBase64(object.chunk) : new Uint8Array(),
      sender: isSet(object.sender) ? String(object.sender) : ""
    };
  },

  toJSON(message: RequestApplySnapshotChunk): unknown {
    const obj: any = {};
    message.index !== undefined && (obj.index = Math.round(message.index));
    message.chunk !== undefined && (obj.chunk = base64FromBytes(message.chunk !== undefined ? message.chunk : new Uint8Array()));
    message.sender !== undefined && (obj.sender = message.sender);
    return obj;
  },

  fromPartial(object: DeepPartial<RequestApplySnapshotChunk>): RequestApplySnapshotChunk {
    const message = createBaseRequestApplySnapshotChunk();
    message.index = object.index ?? 0;
    message.chunk = object.chunk ?? new Uint8Array();
    message.sender = object.sender ?? "";
    return message;
  }

};

function createBaseResponse(): Response {
  return {
    exception: undefined,
    echo: undefined,
    flush: undefined,
    info: undefined,
    setOption: undefined,
    initChain: undefined,
    query: undefined,
    beginBlock: undefined,
    checkTx: undefined,
    deliverTx: undefined,
    endBlock: undefined,
    commit: undefined,
    listSnapshots: undefined,
    offerSnapshot: undefined,
    loadSnapshotChunk: undefined,
    applySnapshotChunk: undefined
  };
}

export const Response = {
  encode(message: Response, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.exception !== undefined) {
      ResponseException.encode(message.exception, writer.uint32(10).fork()).ldelim();
    }

    if (message.echo !== undefined) {
      ResponseEcho.encode(message.echo, writer.uint32(18).fork()).ldelim();
    }

    if (message.flush !== undefined) {
      ResponseFlush.encode(message.flush, writer.uint32(26).fork()).ldelim();
    }

    if (message.info !== undefined) {
      ResponseInfo.encode(message.info, writer.uint32(34).fork()).ldelim();
    }

    if (message.setOption !== undefined) {
      ResponseSetOption.encode(message.setOption, writer.uint32(42).fork()).ldelim();
    }

    if (message.initChain !== undefined) {
      ResponseInitChain.encode(message.initChain, writer.uint32(50).fork()).ldelim();
    }

    if (message.query !== undefined) {
      ResponseQuery.encode(message.query, writer.uint32(58).fork()).ldelim();
    }

    if (message.beginBlock !== undefined) {
      ResponseBeginBlock.encode(message.beginBlock, writer.uint32(66).fork()).ldelim();
    }

    if (message.checkTx !== undefined) {
      ResponseCheckTx.encode(message.checkTx, writer.uint32(74).fork()).ldelim();
    }

    if (message.deliverTx !== undefined) {
      ResponseDeliverTx.encode(message.deliverTx, writer.uint32(82).fork()).ldelim();
    }

    if (message.endBlock !== undefined) {
      ResponseEndBlock.encode(message.endBlock, writer.uint32(90).fork()).ldelim();
    }

    if (message.commit !== undefined) {
      ResponseCommit.encode(message.commit, writer.uint32(98).fork()).ldelim();
    }

    if (message.listSnapshots !== undefined) {
      ResponseListSnapshots.encode(message.listSnapshots, writer.uint32(106).fork()).ldelim();
    }

    if (message.offerSnapshot !== undefined) {
      ResponseOfferSnapshot.encode(message.offerSnapshot, writer.uint32(114).fork()).ldelim();
    }

    if (message.loadSnapshotChunk !== undefined) {
      ResponseLoadSnapshotChunk.encode(message.loadSnapshotChunk, writer.uint32(122).fork()).ldelim();
    }

    if (message.applySnapshotChunk !== undefined) {
      ResponseApplySnapshotChunk.encode(message.applySnapshotChunk, writer.uint32(130).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Response {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponse();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.exception = ResponseException.decode(reader, reader.uint32());
          break;

        case 2:
          message.echo = ResponseEcho.decode(reader, reader.uint32());
          break;

        case 3:
          message.flush = ResponseFlush.decode(reader, reader.uint32());
          break;

        case 4:
          message.info = ResponseInfo.decode(reader, reader.uint32());
          break;

        case 5:
          message.setOption = ResponseSetOption.decode(reader, reader.uint32());
          break;

        case 6:
          message.initChain = ResponseInitChain.decode(reader, reader.uint32());
          break;

        case 7:
          message.query = ResponseQuery.decode(reader, reader.uint32());
          break;

        case 8:
          message.beginBlock = ResponseBeginBlock.decode(reader, reader.uint32());
          break;

        case 9:
          message.checkTx = ResponseCheckTx.decode(reader, reader.uint32());
          break;

        case 10:
          message.deliverTx = ResponseDeliverTx.decode(reader, reader.uint32());
          break;

        case 11:
          message.endBlock = ResponseEndBlock.decode(reader, reader.uint32());
          break;

        case 12:
          message.commit = ResponseCommit.decode(reader, reader.uint32());
          break;

        case 13:
          message.listSnapshots = ResponseListSnapshots.decode(reader, reader.uint32());
          break;

        case 14:
          message.offerSnapshot = ResponseOfferSnapshot.decode(reader, reader.uint32());
          break;

        case 15:
          message.loadSnapshotChunk = ResponseLoadSnapshotChunk.decode(reader, reader.uint32());
          break;

        case 16:
          message.applySnapshotChunk = ResponseApplySnapshotChunk.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): Response {
    return {
      exception: isSet(object.exception) ? ResponseException.fromJSON(object.exception) : undefined,
      echo: isSet(object.echo) ? ResponseEcho.fromJSON(object.echo) : undefined,
      flush: isSet(object.flush) ? ResponseFlush.fromJSON(object.flush) : undefined,
      info: isSet(object.info) ? ResponseInfo.fromJSON(object.info) : undefined,
      setOption: isSet(object.setOption) ? ResponseSetOption.fromJSON(object.setOption) : undefined,
      initChain: isSet(object.initChain) ? ResponseInitChain.fromJSON(object.initChain) : undefined,
      query: isSet(object.query) ? ResponseQuery.fromJSON(object.query) : undefined,
      beginBlock: isSet(object.beginBlock) ? ResponseBeginBlock.fromJSON(object.beginBlock) : undefined,
      checkTx: isSet(object.checkTx) ? ResponseCheckTx.fromJSON(object.checkTx) : undefined,
      deliverTx: isSet(object.deliverTx) ? ResponseDeliverTx.fromJSON(object.deliverTx) : undefined,
      endBlock: isSet(object.endBlock) ? ResponseEndBlock.fromJSON(object.endBlock) : undefined,
      commit: isSet(object.commit) ? ResponseCommit.fromJSON(object.commit) : undefined,
      listSnapshots: isSet(object.listSnapshots) ? ResponseListSnapshots.fromJSON(object.listSnapshots) : undefined,
      offerSnapshot: isSet(object.offerSnapshot) ? ResponseOfferSnapshot.fromJSON(object.offerSnapshot) : undefined,
      loadSnapshotChunk: isSet(object.loadSnapshotChunk) ? ResponseLoadSnapshotChunk.fromJSON(object.loadSnapshotChunk) : undefined,
      applySnapshotChunk: isSet(object.applySnapshotChunk) ? ResponseApplySnapshotChunk.fromJSON(object.applySnapshotChunk) : undefined
    };
  },

  toJSON(message: Response): unknown {
    const obj: any = {};
    message.exception !== undefined && (obj.exception = message.exception ? ResponseException.toJSON(message.exception) : undefined);
    message.echo !== undefined && (obj.echo = message.echo ? ResponseEcho.toJSON(message.echo) : undefined);
    message.flush !== undefined && (obj.flush = message.flush ? ResponseFlush.toJSON(message.flush) : undefined);
    message.info !== undefined && (obj.info = message.info ? ResponseInfo.toJSON(message.info) : undefined);
    message.setOption !== undefined && (obj.setOption = message.setOption ? ResponseSetOption.toJSON(message.setOption) : undefined);
    message.initChain !== undefined && (obj.initChain = message.initChain ? ResponseInitChain.toJSON(message.initChain) : undefined);
    message.query !== undefined && (obj.query = message.query ? ResponseQuery.toJSON(message.query) : undefined);
    message.beginBlock !== undefined && (obj.beginBlock = message.beginBlock ? ResponseBeginBlock.toJSON(message.beginBlock) : undefined);
    message.checkTx !== undefined && (obj.checkTx = message.checkTx ? ResponseCheckTx.toJSON(message.checkTx) : undefined);
    message.deliverTx !== undefined && (obj.deliverTx = message.deliverTx ? ResponseDeliverTx.toJSON(message.deliverTx) : undefined);
    message.endBlock !== undefined && (obj.endBlock = message.endBlock ? ResponseEndBlock.toJSON(message.endBlock) : undefined);
    message.commit !== undefined && (obj.commit = message.commit ? ResponseCommit.toJSON(message.commit) : undefined);
    message.listSnapshots !== undefined && (obj.listSnapshots = message.listSnapshots ? ResponseListSnapshots.toJSON(message.listSnapshots) : undefined);
    message.offerSnapshot !== undefined && (obj.offerSnapshot = message.offerSnapshot ? ResponseOfferSnapshot.toJSON(message.offerSnapshot) : undefined);
    message.loadSnapshotChunk !== undefined && (obj.loadSnapshotChunk = message.loadSnapshotChunk ? ResponseLoadSnapshotChunk.toJSON(message.loadSnapshotChunk) : undefined);
    message.applySnapshotChunk !== undefined && (obj.applySnapshotChunk = message.applySnapshotChunk ? ResponseApplySnapshotChunk.toJSON(message.applySnapshotChunk) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<Response>): Response {
    const message = createBaseResponse();
    message.exception = object.exception !== undefined && object.exception !== null ? ResponseException.fromPartial(object.exception) : undefined;
    message.echo = object.echo !== undefined && object.echo !== null ? ResponseEcho.fromPartial(object.echo) : undefined;
    message.flush = object.flush !== undefined && object.flush !== null ? ResponseFlush.fromPartial(object.flush) : undefined;
    message.info = object.info !== undefined && object.info !== null ? ResponseInfo.fromPartial(object.info) : undefined;
    message.setOption = object.setOption !== undefined && object.setOption !== null ? ResponseSetOption.fromPartial(object.setOption) : undefined;
    message.initChain = object.initChain !== undefined && object.initChain !== null ? ResponseInitChain.fromPartial(object.initChain) : undefined;
    message.query = object.query !== undefined && object.query !== null ? ResponseQuery.fromPartial(object.query) : undefined;
    message.beginBlock = object.beginBlock !== undefined && object.beginBlock !== null ? ResponseBeginBlock.fromPartial(object.beginBlock) : undefined;
    message.checkTx = object.checkTx !== undefined && object.checkTx !== null ? ResponseCheckTx.fromPartial(object.checkTx) : undefined;
    message.deliverTx = object.deliverTx !== undefined && object.deliverTx !== null ? ResponseDeliverTx.fromPartial(object.deliverTx) : undefined;
    message.endBlock = object.endBlock !== undefined && object.endBlock !== null ? ResponseEndBlock.fromPartial(object.endBlock) : undefined;
    message.commit = object.commit !== undefined && object.commit !== null ? ResponseCommit.fromPartial(object.commit) : undefined;
    message.listSnapshots = object.listSnapshots !== undefined && object.listSnapshots !== null ? ResponseListSnapshots.fromPartial(object.listSnapshots) : undefined;
    message.offerSnapshot = object.offerSnapshot !== undefined && object.offerSnapshot !== null ? ResponseOfferSnapshot.fromPartial(object.offerSnapshot) : undefined;
    message.loadSnapshotChunk = object.loadSnapshotChunk !== undefined && object.loadSnapshotChunk !== null ? ResponseLoadSnapshotChunk.fromPartial(object.loadSnapshotChunk) : undefined;
    message.applySnapshotChunk = object.applySnapshotChunk !== undefined && object.applySnapshotChunk !== null ? ResponseApplySnapshotChunk.fromPartial(object.applySnapshotChunk) : undefined;
    return message;
  }

};

function createBaseResponseException(): ResponseException {
  return {
    error: ""
  };
}

export const ResponseException = {
  encode(message: ResponseException, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.error !== "") {
      writer.uint32(10).string(message.error);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResponseException {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponseException();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.error = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): ResponseException {
    return {
      error: isSet(object.error) ? String(object.error) : ""
    };
  },

  toJSON(message: ResponseException): unknown {
    const obj: any = {};
    message.error !== undefined && (obj.error = message.error);
    return obj;
  },

  fromPartial(object: DeepPartial<ResponseException>): ResponseException {
    const message = createBaseResponseException();
    message.error = object.error ?? "";
    return message;
  }

};

function createBaseResponseEcho(): ResponseEcho {
  return {
    message: ""
  };
}

export const ResponseEcho = {
  encode(message: ResponseEcho, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.message !== "") {
      writer.uint32(10).string(message.message);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResponseEcho {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponseEcho();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.message = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): ResponseEcho {
    return {
      message: isSet(object.message) ? String(object.message) : ""
    };
  },

  toJSON(message: ResponseEcho): unknown {
    const obj: any = {};
    message.message !== undefined && (obj.message = message.message);
    return obj;
  },

  fromPartial(object: DeepPartial<ResponseEcho>): ResponseEcho {
    const message = createBaseResponseEcho();
    message.message = object.message ?? "";
    return message;
  }

};

function createBaseResponseFlush(): ResponseFlush {
  return {};
}

export const ResponseFlush = {
  encode(_: ResponseFlush, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResponseFlush {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponseFlush();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(_: any): ResponseFlush {
    return {};
  },

  toJSON(_: ResponseFlush): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial(_: DeepPartial<ResponseFlush>): ResponseFlush {
    const message = createBaseResponseFlush();
    return message;
  }

};

function createBaseResponseInfo(): ResponseInfo {
  return {
    data: "",
    version: "",
    appVersion: Long.UZERO,
    lastBlockHeight: Long.ZERO,
    lastBlockAppHash: new Uint8Array()
  };
}

export const ResponseInfo = {
  encode(message: ResponseInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.data !== "") {
      writer.uint32(10).string(message.data);
    }

    if (message.version !== "") {
      writer.uint32(18).string(message.version);
    }

    if (!message.appVersion.isZero()) {
      writer.uint32(24).uint64(message.appVersion);
    }

    if (!message.lastBlockHeight.isZero()) {
      writer.uint32(32).int64(message.lastBlockHeight);
    }

    if (message.lastBlockAppHash.length !== 0) {
      writer.uint32(42).bytes(message.lastBlockAppHash);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResponseInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponseInfo();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.data = reader.string();
          break;

        case 2:
          message.version = reader.string();
          break;

        case 3:
          message.appVersion = (reader.uint64() as Long);
          break;

        case 4:
          message.lastBlockHeight = (reader.int64() as Long);
          break;

        case 5:
          message.lastBlockAppHash = reader.bytes();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): ResponseInfo {
    return {
      data: isSet(object.data) ? String(object.data) : "",
      version: isSet(object.version) ? String(object.version) : "",
      appVersion: isSet(object.appVersion) ? Long.fromString(object.appVersion) : Long.UZERO,
      lastBlockHeight: isSet(object.lastBlockHeight) ? Long.fromString(object.lastBlockHeight) : Long.ZERO,
      lastBlockAppHash: isSet(object.lastBlockAppHash) ? bytesFromBase64(object.lastBlockAppHash) : new Uint8Array()
    };
  },

  toJSON(message: ResponseInfo): unknown {
    const obj: any = {};
    message.data !== undefined && (obj.data = message.data);
    message.version !== undefined && (obj.version = message.version);
    message.appVersion !== undefined && (obj.appVersion = (message.appVersion || Long.UZERO).toString());
    message.lastBlockHeight !== undefined && (obj.lastBlockHeight = (message.lastBlockHeight || Long.ZERO).toString());
    message.lastBlockAppHash !== undefined && (obj.lastBlockAppHash = base64FromBytes(message.lastBlockAppHash !== undefined ? message.lastBlockAppHash : new Uint8Array()));
    return obj;
  },

  fromPartial(object: DeepPartial<ResponseInfo>): ResponseInfo {
    const message = createBaseResponseInfo();
    message.data = object.data ?? "";
    message.version = object.version ?? "";
    message.appVersion = object.appVersion !== undefined && object.appVersion !== null ? Long.fromValue(object.appVersion) : Long.UZERO;
    message.lastBlockHeight = object.lastBlockHeight !== undefined && object.lastBlockHeight !== null ? Long.fromValue(object.lastBlockHeight) : Long.ZERO;
    message.lastBlockAppHash = object.lastBlockAppHash ?? new Uint8Array();
    return message;
  }

};

function createBaseResponseSetOption(): ResponseSetOption {
  return {
    code: 0,
    log: "",
    info: ""
  };
}

export const ResponseSetOption = {
  encode(message: ResponseSetOption, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.code !== 0) {
      writer.uint32(8).uint32(message.code);
    }

    if (message.log !== "") {
      writer.uint32(26).string(message.log);
    }

    if (message.info !== "") {
      writer.uint32(34).string(message.info);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResponseSetOption {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponseSetOption();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.code = reader.uint32();
          break;

        case 3:
          message.log = reader.string();
          break;

        case 4:
          message.info = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): ResponseSetOption {
    return {
      code: isSet(object.code) ? Number(object.code) : 0,
      log: isSet(object.log) ? String(object.log) : "",
      info: isSet(object.info) ? String(object.info) : ""
    };
  },

  toJSON(message: ResponseSetOption): unknown {
    const obj: any = {};
    message.code !== undefined && (obj.code = Math.round(message.code));
    message.log !== undefined && (obj.log = message.log);
    message.info !== undefined && (obj.info = message.info);
    return obj;
  },

  fromPartial(object: DeepPartial<ResponseSetOption>): ResponseSetOption {
    const message = createBaseResponseSetOption();
    message.code = object.code ?? 0;
    message.log = object.log ?? "";
    message.info = object.info ?? "";
    return message;
  }

};

function createBaseResponseInitChain(): ResponseInitChain {
  return {
    consensusParams: undefined,
    validators: [],
    appHash: new Uint8Array()
  };
}

export const ResponseInitChain = {
  encode(message: ResponseInitChain, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.consensusParams !== undefined) {
      ConsensusParams.encode(message.consensusParams, writer.uint32(10).fork()).ldelim();
    }

    for (const v of message.validators) {
      ValidatorUpdate.encode(v!, writer.uint32(18).fork()).ldelim();
    }

    if (message.appHash.length !== 0) {
      writer.uint32(26).bytes(message.appHash);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResponseInitChain {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponseInitChain();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.consensusParams = ConsensusParams.decode(reader, reader.uint32());
          break;

        case 2:
          message.validators.push(ValidatorUpdate.decode(reader, reader.uint32()));
          break;

        case 3:
          message.appHash = reader.bytes();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): ResponseInitChain {
    return {
      consensusParams: isSet(object.consensusParams) ? ConsensusParams.fromJSON(object.consensusParams) : undefined,
      validators: Array.isArray(object?.validators) ? object.validators.map((e: any) => ValidatorUpdate.fromJSON(e)) : [],
      appHash: isSet(object.appHash) ? bytesFromBase64(object.appHash) : new Uint8Array()
    };
  },

  toJSON(message: ResponseInitChain): unknown {
    const obj: any = {};
    message.consensusParams !== undefined && (obj.consensusParams = message.consensusParams ? ConsensusParams.toJSON(message.consensusParams) : undefined);

    if (message.validators) {
      obj.validators = message.validators.map(e => e ? ValidatorUpdate.toJSON(e) : undefined);
    } else {
      obj.validators = [];
    }

    message.appHash !== undefined && (obj.appHash = base64FromBytes(message.appHash !== undefined ? message.appHash : new Uint8Array()));
    return obj;
  },

  fromPartial(object: DeepPartial<ResponseInitChain>): ResponseInitChain {
    const message = createBaseResponseInitChain();
    message.consensusParams = object.consensusParams !== undefined && object.consensusParams !== null ? ConsensusParams.fromPartial(object.consensusParams) : undefined;
    message.validators = object.validators?.map(e => ValidatorUpdate.fromPartial(e)) || [];
    message.appHash = object.appHash ?? new Uint8Array();
    return message;
  }

};

function createBaseResponseQuery(): ResponseQuery {
  return {
    code: 0,
    log: "",
    info: "",
    index: Long.ZERO,
    key: new Uint8Array(),
    value: new Uint8Array(),
    proofOps: undefined,
    height: Long.ZERO,
    codespace: ""
  };
}

export const ResponseQuery = {
  encode(message: ResponseQuery, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.code !== 0) {
      writer.uint32(8).uint32(message.code);
    }

    if (message.log !== "") {
      writer.uint32(26).string(message.log);
    }

    if (message.info !== "") {
      writer.uint32(34).string(message.info);
    }

    if (!message.index.isZero()) {
      writer.uint32(40).int64(message.index);
    }

    if (message.key.length !== 0) {
      writer.uint32(50).bytes(message.key);
    }

    if (message.value.length !== 0) {
      writer.uint32(58).bytes(message.value);
    }

    if (message.proofOps !== undefined) {
      ProofOps.encode(message.proofOps, writer.uint32(66).fork()).ldelim();
    }

    if (!message.height.isZero()) {
      writer.uint32(72).int64(message.height);
    }

    if (message.codespace !== "") {
      writer.uint32(82).string(message.codespace);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResponseQuery {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponseQuery();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.code = reader.uint32();
          break;

        case 3:
          message.log = reader.string();
          break;

        case 4:
          message.info = reader.string();
          break;

        case 5:
          message.index = (reader.int64() as Long);
          break;

        case 6:
          message.key = reader.bytes();
          break;

        case 7:
          message.value = reader.bytes();
          break;

        case 8:
          message.proofOps = ProofOps.decode(reader, reader.uint32());
          break;

        case 9:
          message.height = (reader.int64() as Long);
          break;

        case 10:
          message.codespace = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): ResponseQuery {
    return {
      code: isSet(object.code) ? Number(object.code) : 0,
      log: isSet(object.log) ? String(object.log) : "",
      info: isSet(object.info) ? String(object.info) : "",
      index: isSet(object.index) ? Long.fromString(object.index) : Long.ZERO,
      key: isSet(object.key) ? bytesFromBase64(object.key) : new Uint8Array(),
      value: isSet(object.value) ? bytesFromBase64(object.value) : new Uint8Array(),
      proofOps: isSet(object.proofOps) ? ProofOps.fromJSON(object.proofOps) : undefined,
      height: isSet(object.height) ? Long.fromString(object.height) : Long.ZERO,
      codespace: isSet(object.codespace) ? String(object.codespace) : ""
    };
  },

  toJSON(message: ResponseQuery): unknown {
    const obj: any = {};
    message.code !== undefined && (obj.code = Math.round(message.code));
    message.log !== undefined && (obj.log = message.log);
    message.info !== undefined && (obj.info = message.info);
    message.index !== undefined && (obj.index = (message.index || Long.ZERO).toString());
    message.key !== undefined && (obj.key = base64FromBytes(message.key !== undefined ? message.key : new Uint8Array()));
    message.value !== undefined && (obj.value = base64FromBytes(message.value !== undefined ? message.value : new Uint8Array()));
    message.proofOps !== undefined && (obj.proofOps = message.proofOps ? ProofOps.toJSON(message.proofOps) : undefined);
    message.height !== undefined && (obj.height = (message.height || Long.ZERO).toString());
    message.codespace !== undefined && (obj.codespace = message.codespace);
    return obj;
  },

  fromPartial(object: DeepPartial<ResponseQuery>): ResponseQuery {
    const message = createBaseResponseQuery();
    message.code = object.code ?? 0;
    message.log = object.log ?? "";
    message.info = object.info ?? "";
    message.index = object.index !== undefined && object.index !== null ? Long.fromValue(object.index) : Long.ZERO;
    message.key = object.key ?? new Uint8Array();
    message.value = object.value ?? new Uint8Array();
    message.proofOps = object.proofOps !== undefined && object.proofOps !== null ? ProofOps.fromPartial(object.proofOps) : undefined;
    message.height = object.height !== undefined && object.height !== null ? Long.fromValue(object.height) : Long.ZERO;
    message.codespace = object.codespace ?? "";
    return message;
  }

};

function createBaseResponseBeginBlock(): ResponseBeginBlock {
  return {
    events: []
  };
}

export const ResponseBeginBlock = {
  encode(message: ResponseBeginBlock, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.events) {
      Event.encode(v!, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResponseBeginBlock {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponseBeginBlock();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.events.push(Event.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): ResponseBeginBlock {
    return {
      events: Array.isArray(object?.events) ? object.events.map((e: any) => Event.fromJSON(e)) : []
    };
  },

  toJSON(message: ResponseBeginBlock): unknown {
    const obj: any = {};

    if (message.events) {
      obj.events = message.events.map(e => e ? Event.toJSON(e) : undefined);
    } else {
      obj.events = [];
    }

    return obj;
  },

  fromPartial(object: DeepPartial<ResponseBeginBlock>): ResponseBeginBlock {
    const message = createBaseResponseBeginBlock();
    message.events = object.events?.map(e => Event.fromPartial(e)) || [];
    return message;
  }

};

function createBaseResponseCheckTx(): ResponseCheckTx {
  return {
    code: 0,
    data: new Uint8Array(),
    log: "",
    info: "",
    gasWanted: Long.ZERO,
    gasUsed: Long.ZERO,
    events: [],
    codespace: ""
  };
}

export const ResponseCheckTx = {
  encode(message: ResponseCheckTx, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.code !== 0) {
      writer.uint32(8).uint32(message.code);
    }

    if (message.data.length !== 0) {
      writer.uint32(18).bytes(message.data);
    }

    if (message.log !== "") {
      writer.uint32(26).string(message.log);
    }

    if (message.info !== "") {
      writer.uint32(34).string(message.info);
    }

    if (!message.gasWanted.isZero()) {
      writer.uint32(40).int64(message.gasWanted);
    }

    if (!message.gasUsed.isZero()) {
      writer.uint32(48).int64(message.gasUsed);
    }

    for (const v of message.events) {
      Event.encode(v!, writer.uint32(58).fork()).ldelim();
    }

    if (message.codespace !== "") {
      writer.uint32(66).string(message.codespace);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResponseCheckTx {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponseCheckTx();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.code = reader.uint32();
          break;

        case 2:
          message.data = reader.bytes();
          break;

        case 3:
          message.log = reader.string();
          break;

        case 4:
          message.info = reader.string();
          break;

        case 5:
          message.gasWanted = (reader.int64() as Long);
          break;

        case 6:
          message.gasUsed = (reader.int64() as Long);
          break;

        case 7:
          message.events.push(Event.decode(reader, reader.uint32()));
          break;

        case 8:
          message.codespace = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): ResponseCheckTx {
    return {
      code: isSet(object.code) ? Number(object.code) : 0,
      data: isSet(object.data) ? bytesFromBase64(object.data) : new Uint8Array(),
      log: isSet(object.log) ? String(object.log) : "",
      info: isSet(object.info) ? String(object.info) : "",
      gasWanted: isSet(object.gasWanted) ? Long.fromString(object.gasWanted) : Long.ZERO,
      gasUsed: isSet(object.gasUsed) ? Long.fromString(object.gasUsed) : Long.ZERO,
      events: Array.isArray(object?.events) ? object.events.map((e: any) => Event.fromJSON(e)) : [],
      codespace: isSet(object.codespace) ? String(object.codespace) : ""
    };
  },

  toJSON(message: ResponseCheckTx): unknown {
    const obj: any = {};
    message.code !== undefined && (obj.code = Math.round(message.code));
    message.data !== undefined && (obj.data = base64FromBytes(message.data !== undefined ? message.data : new Uint8Array()));
    message.log !== undefined && (obj.log = message.log);
    message.info !== undefined && (obj.info = message.info);
    message.gasWanted !== undefined && (obj.gasWanted = (message.gasWanted || Long.ZERO).toString());
    message.gasUsed !== undefined && (obj.gasUsed = (message.gasUsed || Long.ZERO).toString());

    if (message.events) {
      obj.events = message.events.map(e => e ? Event.toJSON(e) : undefined);
    } else {
      obj.events = [];
    }

    message.codespace !== undefined && (obj.codespace = message.codespace);
    return obj;
  },

  fromPartial(object: DeepPartial<ResponseCheckTx>): ResponseCheckTx {
    const message = createBaseResponseCheckTx();
    message.code = object.code ?? 0;
    message.data = object.data ?? new Uint8Array();
    message.log = object.log ?? "";
    message.info = object.info ?? "";
    message.gasWanted = object.gasWanted !== undefined && object.gasWanted !== null ? Long.fromValue(object.gasWanted) : Long.ZERO;
    message.gasUsed = object.gasUsed !== undefined && object.gasUsed !== null ? Long.fromValue(object.gasUsed) : Long.ZERO;
    message.events = object.events?.map(e => Event.fromPartial(e)) || [];
    message.codespace = object.codespace ?? "";
    return message;
  }

};

function createBaseResponseDeliverTx(): ResponseDeliverTx {
  return {
    code: 0,
    data: new Uint8Array(),
    log: "",
    info: "",
    gasWanted: Long.ZERO,
    gasUsed: Long.ZERO,
    events: [],
    codespace: ""
  };
}

export const ResponseDeliverTx = {
  encode(message: ResponseDeliverTx, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.code !== 0) {
      writer.uint32(8).uint32(message.code);
    }

    if (message.data.length !== 0) {
      writer.uint32(18).bytes(message.data);
    }

    if (message.log !== "") {
      writer.uint32(26).string(message.log);
    }

    if (message.info !== "") {
      writer.uint32(34).string(message.info);
    }

    if (!message.gasWanted.isZero()) {
      writer.uint32(40).int64(message.gasWanted);
    }

    if (!message.gasUsed.isZero()) {
      writer.uint32(48).int64(message.gasUsed);
    }

    for (const v of message.events) {
      Event.encode(v!, writer.uint32(58).fork()).ldelim();
    }

    if (message.codespace !== "") {
      writer.uint32(66).string(message.codespace);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResponseDeliverTx {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponseDeliverTx();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.code = reader.uint32();
          break;

        case 2:
          message.data = reader.bytes();
          break;

        case 3:
          message.log = reader.string();
          break;

        case 4:
          message.info = reader.string();
          break;

        case 5:
          message.gasWanted = (reader.int64() as Long);
          break;

        case 6:
          message.gasUsed = (reader.int64() as Long);
          break;

        case 7:
          message.events.push(Event.decode(reader, reader.uint32()));
          break;

        case 8:
          message.codespace = reader.string();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): ResponseDeliverTx {
    return {
      code: isSet(object.code) ? Number(object.code) : 0,
      data: isSet(object.data) ? bytesFromBase64(object.data) : new Uint8Array(),
      log: isSet(object.log) ? String(object.log) : "",
      info: isSet(object.info) ? String(object.info) : "",
      gasWanted: isSet(object.gasWanted) ? Long.fromString(object.gasWanted) : Long.ZERO,
      gasUsed: isSet(object.gasUsed) ? Long.fromString(object.gasUsed) : Long.ZERO,
      events: Array.isArray(object?.events) ? object.events.map((e: any) => Event.fromJSON(e)) : [],
      codespace: isSet(object.codespace) ? String(object.codespace) : ""
    };
  },

  toJSON(message: ResponseDeliverTx): unknown {
    const obj: any = {};
    message.code !== undefined && (obj.code = Math.round(message.code));
    message.data !== undefined && (obj.data = base64FromBytes(message.data !== undefined ? message.data : new Uint8Array()));
    message.log !== undefined && (obj.log = message.log);
    message.info !== undefined && (obj.info = message.info);
    message.gasWanted !== undefined && (obj.gasWanted = (message.gasWanted || Long.ZERO).toString());
    message.gasUsed !== undefined && (obj.gasUsed = (message.gasUsed || Long.ZERO).toString());

    if (message.events) {
      obj.events = message.events.map(e => e ? Event.toJSON(e) : undefined);
    } else {
      obj.events = [];
    }

    message.codespace !== undefined && (obj.codespace = message.codespace);
    return obj;
  },

  fromPartial(object: DeepPartial<ResponseDeliverTx>): ResponseDeliverTx {
    const message = createBaseResponseDeliverTx();
    message.code = object.code ?? 0;
    message.data = object.data ?? new Uint8Array();
    message.log = object.log ?? "";
    message.info = object.info ?? "";
    message.gasWanted = object.gasWanted !== undefined && object.gasWanted !== null ? Long.fromValue(object.gasWanted) : Long.ZERO;
    message.gasUsed = object.gasUsed !== undefined && object.gasUsed !== null ? Long.fromValue(object.gasUsed) : Long.ZERO;
    message.events = object.events?.map(e => Event.fromPartial(e)) || [];
    message.codespace = object.codespace ?? "";
    return message;
  }

};

function createBaseResponseEndBlock(): ResponseEndBlock {
  return {
    validatorUpdates: [],
    consensusParamUpdates: undefined,
    events: []
  };
}

export const ResponseEndBlock = {
  encode(message: ResponseEndBlock, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.validatorUpdates) {
      ValidatorUpdate.encode(v!, writer.uint32(10).fork()).ldelim();
    }

    if (message.consensusParamUpdates !== undefined) {
      ConsensusParams.encode(message.consensusParamUpdates, writer.uint32(18).fork()).ldelim();
    }

    for (const v of message.events) {
      Event.encode(v!, writer.uint32(26).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResponseEndBlock {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponseEndBlock();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.validatorUpdates.push(ValidatorUpdate.decode(reader, reader.uint32()));
          break;

        case 2:
          message.consensusParamUpdates = ConsensusParams.decode(reader, reader.uint32());
          break;

        case 3:
          message.events.push(Event.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): ResponseEndBlock {
    return {
      validatorUpdates: Array.isArray(object?.validatorUpdates) ? object.validatorUpdates.map((e: any) => ValidatorUpdate.fromJSON(e)) : [],
      consensusParamUpdates: isSet(object.consensusParamUpdates) ? ConsensusParams.fromJSON(object.consensusParamUpdates) : undefined,
      events: Array.isArray(object?.events) ? object.events.map((e: any) => Event.fromJSON(e)) : []
    };
  },

  toJSON(message: ResponseEndBlock): unknown {
    const obj: any = {};

    if (message.validatorUpdates) {
      obj.validatorUpdates = message.validatorUpdates.map(e => e ? ValidatorUpdate.toJSON(e) : undefined);
    } else {
      obj.validatorUpdates = [];
    }

    message.consensusParamUpdates !== undefined && (obj.consensusParamUpdates = message.consensusParamUpdates ? ConsensusParams.toJSON(message.consensusParamUpdates) : undefined);

    if (message.events) {
      obj.events = message.events.map(e => e ? Event.toJSON(e) : undefined);
    } else {
      obj.events = [];
    }

    return obj;
  },

  fromPartial(object: DeepPartial<ResponseEndBlock>): ResponseEndBlock {
    const message = createBaseResponseEndBlock();
    message.validatorUpdates = object.validatorUpdates?.map(e => ValidatorUpdate.fromPartial(e)) || [];
    message.consensusParamUpdates = object.consensusParamUpdates !== undefined && object.consensusParamUpdates !== null ? ConsensusParams.fromPartial(object.consensusParamUpdates) : undefined;
    message.events = object.events?.map(e => Event.fromPartial(e)) || [];
    return message;
  }

};

function createBaseResponseCommit(): ResponseCommit {
  return {
    data: new Uint8Array(),
    retainHeight: Long.ZERO
  };
}

export const ResponseCommit = {
  encode(message: ResponseCommit, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.data.length !== 0) {
      writer.uint32(18).bytes(message.data);
    }

    if (!message.retainHeight.isZero()) {
      writer.uint32(24).int64(message.retainHeight);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResponseCommit {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponseCommit();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 2:
          message.data = reader.bytes();
          break;

        case 3:
          message.retainHeight = (reader.int64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): ResponseCommit {
    return {
      data: isSet(object.data) ? bytesFromBase64(object.data) : new Uint8Array(),
      retainHeight: isSet(object.retainHeight) ? Long.fromString(object.retainHeight) : Long.ZERO
    };
  },

  toJSON(message: ResponseCommit): unknown {
    const obj: any = {};
    message.data !== undefined && (obj.data = base64FromBytes(message.data !== undefined ? message.data : new Uint8Array()));
    message.retainHeight !== undefined && (obj.retainHeight = (message.retainHeight || Long.ZERO).toString());
    return obj;
  },

  fromPartial(object: DeepPartial<ResponseCommit>): ResponseCommit {
    const message = createBaseResponseCommit();
    message.data = object.data ?? new Uint8Array();
    message.retainHeight = object.retainHeight !== undefined && object.retainHeight !== null ? Long.fromValue(object.retainHeight) : Long.ZERO;
    return message;
  }

};

function createBaseResponseListSnapshots(): ResponseListSnapshots {
  return {
    snapshots: []
  };
}

export const ResponseListSnapshots = {
  encode(message: ResponseListSnapshots, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.snapshots) {
      Snapshot.encode(v!, writer.uint32(10).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResponseListSnapshots {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponseListSnapshots();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.snapshots.push(Snapshot.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): ResponseListSnapshots {
    return {
      snapshots: Array.isArray(object?.snapshots) ? object.snapshots.map((e: any) => Snapshot.fromJSON(e)) : []
    };
  },

  toJSON(message: ResponseListSnapshots): unknown {
    const obj: any = {};

    if (message.snapshots) {
      obj.snapshots = message.snapshots.map(e => e ? Snapshot.toJSON(e) : undefined);
    } else {
      obj.snapshots = [];
    }

    return obj;
  },

  fromPartial(object: DeepPartial<ResponseListSnapshots>): ResponseListSnapshots {
    const message = createBaseResponseListSnapshots();
    message.snapshots = object.snapshots?.map(e => Snapshot.fromPartial(e)) || [];
    return message;
  }

};

function createBaseResponseOfferSnapshot(): ResponseOfferSnapshot {
  return {
    result: 0
  };
}

export const ResponseOfferSnapshot = {
  encode(message: ResponseOfferSnapshot, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.result !== 0) {
      writer.uint32(8).int32(message.result);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResponseOfferSnapshot {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponseOfferSnapshot();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.result = (reader.int32() as any);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): ResponseOfferSnapshot {
    return {
      result: isSet(object.result) ? responseOfferSnapshot_ResultFromJSON(object.result) : 0
    };
  },

  toJSON(message: ResponseOfferSnapshot): unknown {
    const obj: any = {};
    message.result !== undefined && (obj.result = responseOfferSnapshot_ResultToJSON(message.result));
    return obj;
  },

  fromPartial(object: DeepPartial<ResponseOfferSnapshot>): ResponseOfferSnapshot {
    const message = createBaseResponseOfferSnapshot();
    message.result = object.result ?? 0;
    return message;
  }

};

function createBaseResponseLoadSnapshotChunk(): ResponseLoadSnapshotChunk {
  return {
    chunk: new Uint8Array()
  };
}

export const ResponseLoadSnapshotChunk = {
  encode(message: ResponseLoadSnapshotChunk, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.chunk.length !== 0) {
      writer.uint32(10).bytes(message.chunk);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResponseLoadSnapshotChunk {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponseLoadSnapshotChunk();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.chunk = reader.bytes();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): ResponseLoadSnapshotChunk {
    return {
      chunk: isSet(object.chunk) ? bytesFromBase64(object.chunk) : new Uint8Array()
    };
  },

  toJSON(message: ResponseLoadSnapshotChunk): unknown {
    const obj: any = {};
    message.chunk !== undefined && (obj.chunk = base64FromBytes(message.chunk !== undefined ? message.chunk : new Uint8Array()));
    return obj;
  },

  fromPartial(object: DeepPartial<ResponseLoadSnapshotChunk>): ResponseLoadSnapshotChunk {
    const message = createBaseResponseLoadSnapshotChunk();
    message.chunk = object.chunk ?? new Uint8Array();
    return message;
  }

};

function createBaseResponseApplySnapshotChunk(): ResponseApplySnapshotChunk {
  return {
    result: 0,
    refetchChunks: [],
    rejectSenders: []
  };
}

export const ResponseApplySnapshotChunk = {
  encode(message: ResponseApplySnapshotChunk, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.result !== 0) {
      writer.uint32(8).int32(message.result);
    }

    writer.uint32(18).fork();

    for (const v of message.refetchChunks) {
      writer.uint32(v);
    }

    writer.ldelim();

    for (const v of message.rejectSenders) {
      writer.uint32(26).string(v!);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ResponseApplySnapshotChunk {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponseApplySnapshotChunk();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.result = (reader.int32() as any);
          break;

        case 2:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;

            while (reader.pos < end2) {
              message.refetchChunks.push(reader.uint32());
            }
          } else {
            message.refetchChunks.push(reader.uint32());
          }

          break;

        case 3:
          message.rejectSenders.push(reader.string());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): ResponseApplySnapshotChunk {
    return {
      result: isSet(object.result) ? responseApplySnapshotChunk_ResultFromJSON(object.result) : 0,
      refetchChunks: Array.isArray(object?.refetchChunks) ? object.refetchChunks.map((e: any) => Number(e)) : [],
      rejectSenders: Array.isArray(object?.rejectSenders) ? object.rejectSenders.map((e: any) => String(e)) : []
    };
  },

  toJSON(message: ResponseApplySnapshotChunk): unknown {
    const obj: any = {};
    message.result !== undefined && (obj.result = responseApplySnapshotChunk_ResultToJSON(message.result));

    if (message.refetchChunks) {
      obj.refetchChunks = message.refetchChunks.map(e => Math.round(e));
    } else {
      obj.refetchChunks = [];
    }

    if (message.rejectSenders) {
      obj.rejectSenders = message.rejectSenders.map(e => e);
    } else {
      obj.rejectSenders = [];
    }

    return obj;
  },

  fromPartial(object: DeepPartial<ResponseApplySnapshotChunk>): ResponseApplySnapshotChunk {
    const message = createBaseResponseApplySnapshotChunk();
    message.result = object.result ?? 0;
    message.refetchChunks = object.refetchChunks?.map(e => e) || [];
    message.rejectSenders = object.rejectSenders?.map(e => e) || [];
    return message;
  }

};

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
    maxGas: Long.ZERO
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
      maxGas: isSet(object.maxGas) ? Long.fromString(object.maxGas) : Long.ZERO
    };
  },

  toJSON(message: BlockParams): unknown {
    const obj: any = {};
    message.maxBytes !== undefined && (obj.maxBytes = (message.maxBytes || Long.ZERO).toString());
    message.maxGas !== undefined && (obj.maxGas = (message.maxGas || Long.ZERO).toString());
    return obj;
  },

  fromPartial(object: DeepPartial<BlockParams>): BlockParams {
    const message = createBaseBlockParams();
    message.maxBytes = object.maxBytes !== undefined && object.maxBytes !== null ? Long.fromValue(object.maxBytes) : Long.ZERO;
    message.maxGas = object.maxGas !== undefined && object.maxGas !== null ? Long.fromValue(object.maxGas) : Long.ZERO;
    return message;
  }

};

function createBaseLastCommitInfo(): LastCommitInfo {
  return {
    round: 0,
    votes: []
  };
}

export const LastCommitInfo = {
  encode(message: LastCommitInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.round !== 0) {
      writer.uint32(8).int32(message.round);
    }

    for (const v of message.votes) {
      VoteInfo.encode(v!, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): LastCommitInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseLastCommitInfo();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.round = reader.int32();
          break;

        case 2:
          message.votes.push(VoteInfo.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): LastCommitInfo {
    return {
      round: isSet(object.round) ? Number(object.round) : 0,
      votes: Array.isArray(object?.votes) ? object.votes.map((e: any) => VoteInfo.fromJSON(e)) : []
    };
  },

  toJSON(message: LastCommitInfo): unknown {
    const obj: any = {};
    message.round !== undefined && (obj.round = Math.round(message.round));

    if (message.votes) {
      obj.votes = message.votes.map(e => e ? VoteInfo.toJSON(e) : undefined);
    } else {
      obj.votes = [];
    }

    return obj;
  },

  fromPartial(object: DeepPartial<LastCommitInfo>): LastCommitInfo {
    const message = createBaseLastCommitInfo();
    message.round = object.round ?? 0;
    message.votes = object.votes?.map(e => VoteInfo.fromPartial(e)) || [];
    return message;
  }

};

function createBaseEvent(): Event {
  return {
    type: "",
    attributes: []
  };
}

export const Event = {
  encode(message: Event, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.type !== "") {
      writer.uint32(10).string(message.type);
    }

    for (const v of message.attributes) {
      EventAttribute.encode(v!, writer.uint32(18).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Event {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEvent();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.type = reader.string();
          break;

        case 2:
          message.attributes.push(EventAttribute.decode(reader, reader.uint32()));
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): Event {
    return {
      type: isSet(object.type) ? String(object.type) : "",
      attributes: Array.isArray(object?.attributes) ? object.attributes.map((e: any) => EventAttribute.fromJSON(e)) : []
    };
  },

  toJSON(message: Event): unknown {
    const obj: any = {};
    message.type !== undefined && (obj.type = message.type);

    if (message.attributes) {
      obj.attributes = message.attributes.map(e => e ? EventAttribute.toJSON(e) : undefined);
    } else {
      obj.attributes = [];
    }

    return obj;
  },

  fromPartial(object: DeepPartial<Event>): Event {
    const message = createBaseEvent();
    message.type = object.type ?? "";
    message.attributes = object.attributes?.map(e => EventAttribute.fromPartial(e)) || [];
    return message;
  }

};

function createBaseEventAttribute(): EventAttribute {
  return {
    key: new Uint8Array(),
    value: new Uint8Array(),
    index: false
  };
}

export const EventAttribute = {
  encode(message: EventAttribute, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.key.length !== 0) {
      writer.uint32(10).bytes(message.key);
    }

    if (message.value.length !== 0) {
      writer.uint32(18).bytes(message.value);
    }

    if (message.index === true) {
      writer.uint32(24).bool(message.index);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): EventAttribute {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseEventAttribute();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.key = reader.bytes();
          break;

        case 2:
          message.value = reader.bytes();
          break;

        case 3:
          message.index = reader.bool();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): EventAttribute {
    return {
      key: isSet(object.key) ? bytesFromBase64(object.key) : new Uint8Array(),
      value: isSet(object.value) ? bytesFromBase64(object.value) : new Uint8Array(),
      index: isSet(object.index) ? Boolean(object.index) : false
    };
  },

  toJSON(message: EventAttribute): unknown {
    const obj: any = {};
    message.key !== undefined && (obj.key = base64FromBytes(message.key !== undefined ? message.key : new Uint8Array()));
    message.value !== undefined && (obj.value = base64FromBytes(message.value !== undefined ? message.value : new Uint8Array()));
    message.index !== undefined && (obj.index = message.index);
    return obj;
  },

  fromPartial(object: DeepPartial<EventAttribute>): EventAttribute {
    const message = createBaseEventAttribute();
    message.key = object.key ?? new Uint8Array();
    message.value = object.value ?? new Uint8Array();
    message.index = object.index ?? false;
    return message;
  }

};

function createBaseTxResult(): TxResult {
  return {
    height: Long.ZERO,
    index: 0,
    tx: new Uint8Array(),
    result: undefined
  };
}

export const TxResult = {
  encode(message: TxResult, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.height.isZero()) {
      writer.uint32(8).int64(message.height);
    }

    if (message.index !== 0) {
      writer.uint32(16).uint32(message.index);
    }

    if (message.tx.length !== 0) {
      writer.uint32(26).bytes(message.tx);
    }

    if (message.result !== undefined) {
      ResponseDeliverTx.encode(message.result, writer.uint32(34).fork()).ldelim();
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): TxResult {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseTxResult();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.height = (reader.int64() as Long);
          break;

        case 2:
          message.index = reader.uint32();
          break;

        case 3:
          message.tx = reader.bytes();
          break;

        case 4:
          message.result = ResponseDeliverTx.decode(reader, reader.uint32());
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): TxResult {
    return {
      height: isSet(object.height) ? Long.fromString(object.height) : Long.ZERO,
      index: isSet(object.index) ? Number(object.index) : 0,
      tx: isSet(object.tx) ? bytesFromBase64(object.tx) : new Uint8Array(),
      result: isSet(object.result) ? ResponseDeliverTx.fromJSON(object.result) : undefined
    };
  },

  toJSON(message: TxResult): unknown {
    const obj: any = {};
    message.height !== undefined && (obj.height = (message.height || Long.ZERO).toString());
    message.index !== undefined && (obj.index = Math.round(message.index));
    message.tx !== undefined && (obj.tx = base64FromBytes(message.tx !== undefined ? message.tx : new Uint8Array()));
    message.result !== undefined && (obj.result = message.result ? ResponseDeliverTx.toJSON(message.result) : undefined);
    return obj;
  },

  fromPartial(object: DeepPartial<TxResult>): TxResult {
    const message = createBaseTxResult();
    message.height = object.height !== undefined && object.height !== null ? Long.fromValue(object.height) : Long.ZERO;
    message.index = object.index ?? 0;
    message.tx = object.tx ?? new Uint8Array();
    message.result = object.result !== undefined && object.result !== null ? ResponseDeliverTx.fromPartial(object.result) : undefined;
    return message;
  }

};

function createBaseValidator(): Validator {
  return {
    address: new Uint8Array(),
    power: Long.ZERO
  };
}

export const Validator = {
  encode(message: Validator, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.address.length !== 0) {
      writer.uint32(10).bytes(message.address);
    }

    if (!message.power.isZero()) {
      writer.uint32(24).int64(message.power);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Validator {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseValidator();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.address = reader.bytes();
          break;

        case 3:
          message.power = (reader.int64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): Validator {
    return {
      address: isSet(object.address) ? bytesFromBase64(object.address) : new Uint8Array(),
      power: isSet(object.power) ? Long.fromString(object.power) : Long.ZERO
    };
  },

  toJSON(message: Validator): unknown {
    const obj: any = {};
    message.address !== undefined && (obj.address = base64FromBytes(message.address !== undefined ? message.address : new Uint8Array()));
    message.power !== undefined && (obj.power = (message.power || Long.ZERO).toString());
    return obj;
  },

  fromPartial(object: DeepPartial<Validator>): Validator {
    const message = createBaseValidator();
    message.address = object.address ?? new Uint8Array();
    message.power = object.power !== undefined && object.power !== null ? Long.fromValue(object.power) : Long.ZERO;
    return message;
  }

};

function createBaseValidatorUpdate(): ValidatorUpdate {
  return {
    pubKey: undefined,
    power: Long.ZERO
  };
}

export const ValidatorUpdate = {
  encode(message: ValidatorUpdate, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.pubKey !== undefined) {
      PublicKey.encode(message.pubKey, writer.uint32(10).fork()).ldelim();
    }

    if (!message.power.isZero()) {
      writer.uint32(16).int64(message.power);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ValidatorUpdate {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseValidatorUpdate();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.pubKey = PublicKey.decode(reader, reader.uint32());
          break;

        case 2:
          message.power = (reader.int64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): ValidatorUpdate {
    return {
      pubKey: isSet(object.pubKey) ? PublicKey.fromJSON(object.pubKey) : undefined,
      power: isSet(object.power) ? Long.fromString(object.power) : Long.ZERO
    };
  },

  toJSON(message: ValidatorUpdate): unknown {
    const obj: any = {};
    message.pubKey !== undefined && (obj.pubKey = message.pubKey ? PublicKey.toJSON(message.pubKey) : undefined);
    message.power !== undefined && (obj.power = (message.power || Long.ZERO).toString());
    return obj;
  },

  fromPartial(object: DeepPartial<ValidatorUpdate>): ValidatorUpdate {
    const message = createBaseValidatorUpdate();
    message.pubKey = object.pubKey !== undefined && object.pubKey !== null ? PublicKey.fromPartial(object.pubKey) : undefined;
    message.power = object.power !== undefined && object.power !== null ? Long.fromValue(object.power) : Long.ZERO;
    return message;
  }

};

function createBaseVoteInfo(): VoteInfo {
  return {
    validator: undefined,
    signedLastBlock: false
  };
}

export const VoteInfo = {
  encode(message: VoteInfo, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.validator !== undefined) {
      Validator.encode(message.validator, writer.uint32(10).fork()).ldelim();
    }

    if (message.signedLastBlock === true) {
      writer.uint32(16).bool(message.signedLastBlock);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): VoteInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseVoteInfo();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.validator = Validator.decode(reader, reader.uint32());
          break;

        case 2:
          message.signedLastBlock = reader.bool();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): VoteInfo {
    return {
      validator: isSet(object.validator) ? Validator.fromJSON(object.validator) : undefined,
      signedLastBlock: isSet(object.signedLastBlock) ? Boolean(object.signedLastBlock) : false
    };
  },

  toJSON(message: VoteInfo): unknown {
    const obj: any = {};
    message.validator !== undefined && (obj.validator = message.validator ? Validator.toJSON(message.validator) : undefined);
    message.signedLastBlock !== undefined && (obj.signedLastBlock = message.signedLastBlock);
    return obj;
  },

  fromPartial(object: DeepPartial<VoteInfo>): VoteInfo {
    const message = createBaseVoteInfo();
    message.validator = object.validator !== undefined && object.validator !== null ? Validator.fromPartial(object.validator) : undefined;
    message.signedLastBlock = object.signedLastBlock ?? false;
    return message;
  }

};

function createBaseEvidence(): Evidence {
  return {
    type: 0,
    validator: undefined,
    height: Long.ZERO,
    time: undefined,
    totalVotingPower: Long.ZERO
  };
}

export const Evidence = {
  encode(message: Evidence, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.type !== 0) {
      writer.uint32(8).int32(message.type);
    }

    if (message.validator !== undefined) {
      Validator.encode(message.validator, writer.uint32(18).fork()).ldelim();
    }

    if (!message.height.isZero()) {
      writer.uint32(24).int64(message.height);
    }

    if (message.time !== undefined) {
      Timestamp.encode(toTimestamp(message.time), writer.uint32(34).fork()).ldelim();
    }

    if (!message.totalVotingPower.isZero()) {
      writer.uint32(40).int64(message.totalVotingPower);
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
          message.type = (reader.int32() as any);
          break;

        case 2:
          message.validator = Validator.decode(reader, reader.uint32());
          break;

        case 3:
          message.height = (reader.int64() as Long);
          break;

        case 4:
          message.time = fromTimestamp(Timestamp.decode(reader, reader.uint32()));
          break;

        case 5:
          message.totalVotingPower = (reader.int64() as Long);
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): Evidence {
    return {
      type: isSet(object.type) ? evidenceTypeFromJSON(object.type) : 0,
      validator: isSet(object.validator) ? Validator.fromJSON(object.validator) : undefined,
      height: isSet(object.height) ? Long.fromString(object.height) : Long.ZERO,
      time: isSet(object.time) ? fromJsonTimestamp(object.time) : undefined,
      totalVotingPower: isSet(object.totalVotingPower) ? Long.fromString(object.totalVotingPower) : Long.ZERO
    };
  },

  toJSON(message: Evidence): unknown {
    const obj: any = {};
    message.type !== undefined && (obj.type = evidenceTypeToJSON(message.type));
    message.validator !== undefined && (obj.validator = message.validator ? Validator.toJSON(message.validator) : undefined);
    message.height !== undefined && (obj.height = (message.height || Long.ZERO).toString());
    message.time !== undefined && (obj.time = message.time.toISOString());
    message.totalVotingPower !== undefined && (obj.totalVotingPower = (message.totalVotingPower || Long.ZERO).toString());
    return obj;
  },

  fromPartial(object: DeepPartial<Evidence>): Evidence {
    const message = createBaseEvidence();
    message.type = object.type ?? 0;
    message.validator = object.validator !== undefined && object.validator !== null ? Validator.fromPartial(object.validator) : undefined;
    message.height = object.height !== undefined && object.height !== null ? Long.fromValue(object.height) : Long.ZERO;
    message.time = object.time ?? undefined;
    message.totalVotingPower = object.totalVotingPower !== undefined && object.totalVotingPower !== null ? Long.fromValue(object.totalVotingPower) : Long.ZERO;
    return message;
  }

};

function createBaseSnapshot(): Snapshot {
  return {
    height: Long.UZERO,
    format: 0,
    chunks: 0,
    hash: new Uint8Array(),
    metadata: new Uint8Array()
  };
}

export const Snapshot = {
  encode(message: Snapshot, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (!message.height.isZero()) {
      writer.uint32(8).uint64(message.height);
    }

    if (message.format !== 0) {
      writer.uint32(16).uint32(message.format);
    }

    if (message.chunks !== 0) {
      writer.uint32(24).uint32(message.chunks);
    }

    if (message.hash.length !== 0) {
      writer.uint32(34).bytes(message.hash);
    }

    if (message.metadata.length !== 0) {
      writer.uint32(42).bytes(message.metadata);
    }

    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Snapshot {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseSnapshot();

    while (reader.pos < end) {
      const tag = reader.uint32();

      switch (tag >>> 3) {
        case 1:
          message.height = (reader.uint64() as Long);
          break;

        case 2:
          message.format = reader.uint32();
          break;

        case 3:
          message.chunks = reader.uint32();
          break;

        case 4:
          message.hash = reader.bytes();
          break;

        case 5:
          message.metadata = reader.bytes();
          break;

        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    return message;
  },

  fromJSON(object: any): Snapshot {
    return {
      height: isSet(object.height) ? Long.fromString(object.height) : Long.UZERO,
      format: isSet(object.format) ? Number(object.format) : 0,
      chunks: isSet(object.chunks) ? Number(object.chunks) : 0,
      hash: isSet(object.hash) ? bytesFromBase64(object.hash) : new Uint8Array(),
      metadata: isSet(object.metadata) ? bytesFromBase64(object.metadata) : new Uint8Array()
    };
  },

  toJSON(message: Snapshot): unknown {
    const obj: any = {};
    message.height !== undefined && (obj.height = (message.height || Long.UZERO).toString());
    message.format !== undefined && (obj.format = Math.round(message.format));
    message.chunks !== undefined && (obj.chunks = Math.round(message.chunks));
    message.hash !== undefined && (obj.hash = base64FromBytes(message.hash !== undefined ? message.hash : new Uint8Array()));
    message.metadata !== undefined && (obj.metadata = base64FromBytes(message.metadata !== undefined ? message.metadata : new Uint8Array()));
    return obj;
  },

  fromPartial(object: DeepPartial<Snapshot>): Snapshot {
    const message = createBaseSnapshot();
    message.height = object.height !== undefined && object.height !== null ? Long.fromValue(object.height) : Long.UZERO;
    message.format = object.format ?? 0;
    message.chunks = object.chunks ?? 0;
    message.hash = object.hash ?? new Uint8Array();
    message.metadata = object.metadata ?? new Uint8Array();
    return message;
  }

};