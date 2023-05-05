//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import {
  EvidenceList,
  EvidenceListAmino,
  EvidenceListSDKType,
} from "./evidence";
import {
  Commit,
  CommitAmino,
  CommitSDKType,
  Data,
  DataAmino,
  DataSDKType,
  Header,
  HeaderAmino,
  HeaderSDKType,
} from "./types";
export interface Block {
  header?: Header;
  data?: Data;
  evidence?: EvidenceList;
  lastCommit?: Commit;
}
export interface BlockProtoMsg {
  typeUrl: "/tendermint.types.Block";
  value: Uint8Array;
}
export interface BlockAmino {
  header?: HeaderAmino;
  data?: DataAmino;
  evidence?: EvidenceListAmino;
  last_commit?: CommitAmino;
}
export interface BlockAminoMsg {
  type: "/tendermint.types.Block";
  value: BlockAmino;
}
export interface BlockSDKType {
  header?: HeaderSDKType;
  data?: DataSDKType;
  evidence?: EvidenceListSDKType;
  last_commit?: CommitSDKType;
}
function createBaseBlock(): Block {
  return {
    header: undefined,
    data: undefined,
    evidence: undefined,
    lastCommit: undefined,
  };
}
export const Block = {
  typeUrl: "/tendermint.types.Block",
  encode(message: Block, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.header !== undefined) {
      Header.encode(message.header, writer.uint32(10).fork()).ldelim();
    }
    if (message.data !== undefined) {
      Data.encode(message.data, writer.uint32(18).fork()).ldelim();
    }
    if (message.evidence !== undefined) {
      EvidenceList.encode(message.evidence, writer.uint32(26).fork()).ldelim();
    }
    if (message.lastCommit !== undefined) {
      Commit.encode(message.lastCommit, writer.uint32(34).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Block {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseBlock();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.header = Header.decode(reader, reader.uint32());
          break;
        case 2:
          message.data = Data.decode(reader, reader.uint32());
          break;
        case 3:
          message.evidence = EvidenceList.decode(reader, reader.uint32());
          break;
        case 4:
          message.lastCommit = Commit.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Block>): Block {
    const message = createBaseBlock();
    message.header =
      object.header !== undefined && object.header !== null
        ? Header.fromPartial(object.header)
        : undefined;
    message.data =
      object.data !== undefined && object.data !== null
        ? Data.fromPartial(object.data)
        : undefined;
    message.evidence =
      object.evidence !== undefined && object.evidence !== null
        ? EvidenceList.fromPartial(object.evidence)
        : undefined;
    message.lastCommit =
      object.lastCommit !== undefined && object.lastCommit !== null
        ? Commit.fromPartial(object.lastCommit)
        : undefined;
    return message;
  },
  fromAmino(object: BlockAmino): Block {
    return {
      header: object?.header ? Header.fromAmino(object.header) : undefined,
      data: object?.data ? Data.fromAmino(object.data) : undefined,
      evidence: object?.evidence
        ? EvidenceList.fromAmino(object.evidence)
        : undefined,
      lastCommit: object?.last_commit
        ? Commit.fromAmino(object.last_commit)
        : undefined,
    };
  },
  toAmino(message: Block): BlockAmino {
    const obj: any = {};
    obj.header = message.header ? Header.toAmino(message.header) : undefined;
    obj.data = message.data ? Data.toAmino(message.data) : undefined;
    obj.evidence = message.evidence
      ? EvidenceList.toAmino(message.evidence)
      : undefined;
    obj.last_commit = message.lastCommit
      ? Commit.toAmino(message.lastCommit)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: BlockAminoMsg): Block {
    return Block.fromAmino(object.value);
  },
  fromProtoMsg(message: BlockProtoMsg): Block {
    return Block.decode(message.value);
  },
  toProto(message: Block): Uint8Array {
    return Block.encode(message).finish();
  },
  toProtoMsg(message: Block): BlockProtoMsg {
    return {
      typeUrl: "/tendermint.types.Block",
      value: Block.encode(message).finish(),
    };
  },
};
