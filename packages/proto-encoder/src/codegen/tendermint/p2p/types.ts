import { Timestamp } from "../../google/protobuf/timestamp";
import { Long, toTimestamp, fromTimestamp } from "../../helpers";
import * as _m0 from "protobufjs/minimal";
export interface ProtocolVersion {
  p2p: Long;
  block: Long;
  app: Long;
}
export interface ProtocolVersionProtoMsg {
  typeUrl: "/tendermint.p2p.ProtocolVersion";
  value: Uint8Array;
}
export interface ProtocolVersionAmino {
  p2p: string;
  block: string;
  app: string;
}
export interface ProtocolVersionAminoMsg {
  type: "/tendermint.p2p.ProtocolVersion";
  value: ProtocolVersionAmino;
}
export interface ProtocolVersionSDKType {
  p2p: Long;
  block: Long;
  app: Long;
}
export interface NodeInfo {
  protocolVersion?: ProtocolVersion;
  nodeId: string;
  listenAddr: string;
  network: string;
  version: string;
  channels: Uint8Array;
  moniker: string;
  other?: NodeInfoOther;
}
export interface NodeInfoProtoMsg {
  typeUrl: "/tendermint.p2p.NodeInfo";
  value: Uint8Array;
}
export interface NodeInfoAmino {
  protocol_version?: ProtocolVersionAmino;
  node_id: string;
  listen_addr: string;
  network: string;
  version: string;
  channels: Uint8Array;
  moniker: string;
  other?: NodeInfoOtherAmino;
}
export interface NodeInfoAminoMsg {
  type: "/tendermint.p2p.NodeInfo";
  value: NodeInfoAmino;
}
export interface NodeInfoSDKType {
  protocol_version?: ProtocolVersionSDKType;
  node_id: string;
  listen_addr: string;
  network: string;
  version: string;
  channels: Uint8Array;
  moniker: string;
  other?: NodeInfoOtherSDKType;
}
export interface NodeInfoOther {
  txIndex: string;
  rpcAddress: string;
}
export interface NodeInfoOtherProtoMsg {
  typeUrl: "/tendermint.p2p.NodeInfoOther";
  value: Uint8Array;
}
export interface NodeInfoOtherAmino {
  tx_index: string;
  rpc_address: string;
}
export interface NodeInfoOtherAminoMsg {
  type: "/tendermint.p2p.NodeInfoOther";
  value: NodeInfoOtherAmino;
}
export interface NodeInfoOtherSDKType {
  tx_index: string;
  rpc_address: string;
}
export interface PeerInfo {
  id: string;
  addressInfo: PeerAddressInfo[];
  lastConnected?: Date;
}
export interface PeerInfoProtoMsg {
  typeUrl: "/tendermint.p2p.PeerInfo";
  value: Uint8Array;
}
export interface PeerInfoAmino {
  id: string;
  address_info: PeerAddressInfoAmino[];
  last_connected?: Date;
}
export interface PeerInfoAminoMsg {
  type: "/tendermint.p2p.PeerInfo";
  value: PeerInfoAmino;
}
export interface PeerInfoSDKType {
  id: string;
  address_info: PeerAddressInfoSDKType[];
  last_connected?: Date;
}
export interface PeerAddressInfo {
  address: string;
  lastDialSuccess?: Date;
  lastDialFailure?: Date;
  dialFailures: number;
}
export interface PeerAddressInfoProtoMsg {
  typeUrl: "/tendermint.p2p.PeerAddressInfo";
  value: Uint8Array;
}
export interface PeerAddressInfoAmino {
  address: string;
  last_dial_success?: Date;
  last_dial_failure?: Date;
  dial_failures: number;
}
export interface PeerAddressInfoAminoMsg {
  type: "/tendermint.p2p.PeerAddressInfo";
  value: PeerAddressInfoAmino;
}
export interface PeerAddressInfoSDKType {
  address: string;
  last_dial_success?: Date;
  last_dial_failure?: Date;
  dial_failures: number;
}
function createBaseProtocolVersion(): ProtocolVersion {
  return {
    p2p: Long.UZERO,
    block: Long.UZERO,
    app: Long.UZERO,
  };
}
export const ProtocolVersion = {
  typeUrl: "/tendermint.p2p.ProtocolVersion",
  encode(
    message: ProtocolVersion,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (!message.p2p.isZero()) {
      writer.uint32(8).uint64(message.p2p);
    }
    if (!message.block.isZero()) {
      writer.uint32(16).uint64(message.block);
    }
    if (!message.app.isZero()) {
      writer.uint32(24).uint64(message.app);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): ProtocolVersion {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseProtocolVersion();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.p2p = reader.uint64() as Long;
          break;
        case 2:
          message.block = reader.uint64() as Long;
          break;
        case 3:
          message.app = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<ProtocolVersion>): ProtocolVersion {
    const message = createBaseProtocolVersion();
    message.p2p =
      object.p2p !== undefined && object.p2p !== null
        ? Long.fromValue(object.p2p)
        : Long.UZERO;
    message.block =
      object.block !== undefined && object.block !== null
        ? Long.fromValue(object.block)
        : Long.UZERO;
    message.app =
      object.app !== undefined && object.app !== null
        ? Long.fromValue(object.app)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: ProtocolVersionAmino): ProtocolVersion {
    return {
      p2p: Long.fromString(object.p2p),
      block: Long.fromString(object.block),
      app: Long.fromString(object.app),
    };
  },
  toAmino(message: ProtocolVersion): ProtocolVersionAmino {
    const obj: any = {};
    obj.p2p = message.p2p ? message.p2p.toString() : undefined;
    obj.block = message.block ? message.block.toString() : undefined;
    obj.app = message.app ? message.app.toString() : undefined;
    return obj;
  },
  fromAminoMsg(object: ProtocolVersionAminoMsg): ProtocolVersion {
    return ProtocolVersion.fromAmino(object.value);
  },
  fromProtoMsg(message: ProtocolVersionProtoMsg): ProtocolVersion {
    return ProtocolVersion.decode(message.value);
  },
  toProto(message: ProtocolVersion): Uint8Array {
    return ProtocolVersion.encode(message).finish();
  },
  toProtoMsg(message: ProtocolVersion): ProtocolVersionProtoMsg {
    return {
      typeUrl: "/tendermint.p2p.ProtocolVersion",
      value: ProtocolVersion.encode(message).finish(),
    };
  },
};
function createBaseNodeInfo(): NodeInfo {
  return {
    protocolVersion: undefined,
    nodeId: "",
    listenAddr: "",
    network: "",
    version: "",
    channels: new Uint8Array(),
    moniker: "",
    other: undefined,
  };
}
export const NodeInfo = {
  typeUrl: "/tendermint.p2p.NodeInfo",
  encode(
    message: NodeInfo,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.protocolVersion !== undefined) {
      ProtocolVersion.encode(
        message.protocolVersion,
        writer.uint32(10).fork()
      ).ldelim();
    }
    if (message.nodeId !== "") {
      writer.uint32(18).string(message.nodeId);
    }
    if (message.listenAddr !== "") {
      writer.uint32(26).string(message.listenAddr);
    }
    if (message.network !== "") {
      writer.uint32(34).string(message.network);
    }
    if (message.version !== "") {
      writer.uint32(42).string(message.version);
    }
    if (message.channels.length !== 0) {
      writer.uint32(50).bytes(message.channels);
    }
    if (message.moniker !== "") {
      writer.uint32(58).string(message.moniker);
    }
    if (message.other !== undefined) {
      NodeInfoOther.encode(message.other, writer.uint32(66).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): NodeInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNodeInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.protocolVersion = ProtocolVersion.decode(
            reader,
            reader.uint32()
          );
          break;
        case 2:
          message.nodeId = reader.string();
          break;
        case 3:
          message.listenAddr = reader.string();
          break;
        case 4:
          message.network = reader.string();
          break;
        case 5:
          message.version = reader.string();
          break;
        case 6:
          message.channels = reader.bytes();
          break;
        case 7:
          message.moniker = reader.string();
          break;
        case 8:
          message.other = NodeInfoOther.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<NodeInfo>): NodeInfo {
    const message = createBaseNodeInfo();
    message.protocolVersion =
      object.protocolVersion !== undefined && object.protocolVersion !== null
        ? ProtocolVersion.fromPartial(object.protocolVersion)
        : undefined;
    message.nodeId = object.nodeId ?? "";
    message.listenAddr = object.listenAddr ?? "";
    message.network = object.network ?? "";
    message.version = object.version ?? "";
    message.channels = object.channels ?? new Uint8Array();
    message.moniker = object.moniker ?? "";
    message.other =
      object.other !== undefined && object.other !== null
        ? NodeInfoOther.fromPartial(object.other)
        : undefined;
    return message;
  },
  fromAmino(object: NodeInfoAmino): NodeInfo {
    return {
      protocolVersion: object?.protocol_version
        ? ProtocolVersion.fromAmino(object.protocol_version)
        : undefined,
      nodeId: object.node_id,
      listenAddr: object.listen_addr,
      network: object.network,
      version: object.version,
      channels: object.channels,
      moniker: object.moniker,
      other: object?.other ? NodeInfoOther.fromAmino(object.other) : undefined,
    };
  },
  toAmino(message: NodeInfo): NodeInfoAmino {
    const obj: any = {};
    obj.protocol_version = message.protocolVersion
      ? ProtocolVersion.toAmino(message.protocolVersion)
      : undefined;
    obj.node_id = message.nodeId;
    obj.listen_addr = message.listenAddr;
    obj.network = message.network;
    obj.version = message.version;
    obj.channels = message.channels;
    obj.moniker = message.moniker;
    obj.other = message.other
      ? NodeInfoOther.toAmino(message.other)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: NodeInfoAminoMsg): NodeInfo {
    return NodeInfo.fromAmino(object.value);
  },
  fromProtoMsg(message: NodeInfoProtoMsg): NodeInfo {
    return NodeInfo.decode(message.value);
  },
  toProto(message: NodeInfo): Uint8Array {
    return NodeInfo.encode(message).finish();
  },
  toProtoMsg(message: NodeInfo): NodeInfoProtoMsg {
    return {
      typeUrl: "/tendermint.p2p.NodeInfo",
      value: NodeInfo.encode(message).finish(),
    };
  },
};
function createBaseNodeInfoOther(): NodeInfoOther {
  return {
    txIndex: "",
    rpcAddress: "",
  };
}
export const NodeInfoOther = {
  typeUrl: "/tendermint.p2p.NodeInfoOther",
  encode(
    message: NodeInfoOther,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.txIndex !== "") {
      writer.uint32(10).string(message.txIndex);
    }
    if (message.rpcAddress !== "") {
      writer.uint32(18).string(message.rpcAddress);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): NodeInfoOther {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNodeInfoOther();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.txIndex = reader.string();
          break;
        case 2:
          message.rpcAddress = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<NodeInfoOther>): NodeInfoOther {
    const message = createBaseNodeInfoOther();
    message.txIndex = object.txIndex ?? "";
    message.rpcAddress = object.rpcAddress ?? "";
    return message;
  },
  fromAmino(object: NodeInfoOtherAmino): NodeInfoOther {
    return {
      txIndex: object.tx_index,
      rpcAddress: object.rpc_address,
    };
  },
  toAmino(message: NodeInfoOther): NodeInfoOtherAmino {
    const obj: any = {};
    obj.tx_index = message.txIndex;
    obj.rpc_address = message.rpcAddress;
    return obj;
  },
  fromAminoMsg(object: NodeInfoOtherAminoMsg): NodeInfoOther {
    return NodeInfoOther.fromAmino(object.value);
  },
  fromProtoMsg(message: NodeInfoOtherProtoMsg): NodeInfoOther {
    return NodeInfoOther.decode(message.value);
  },
  toProto(message: NodeInfoOther): Uint8Array {
    return NodeInfoOther.encode(message).finish();
  },
  toProtoMsg(message: NodeInfoOther): NodeInfoOtherProtoMsg {
    return {
      typeUrl: "/tendermint.p2p.NodeInfoOther",
      value: NodeInfoOther.encode(message).finish(),
    };
  },
};
function createBasePeerInfo(): PeerInfo {
  return {
    id: "",
    addressInfo: [],
    lastConnected: undefined,
  };
}
export const PeerInfo = {
  typeUrl: "/tendermint.p2p.PeerInfo",
  encode(
    message: PeerInfo,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    for (const v of message.addressInfo) {
      PeerAddressInfo.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    if (message.lastConnected !== undefined) {
      Timestamp.encode(
        toTimestamp(message.lastConnected),
        writer.uint32(26).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): PeerInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePeerInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.addressInfo.push(
            PeerAddressInfo.decode(reader, reader.uint32())
          );
          break;
        case 3:
          message.lastConnected = fromTimestamp(
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
  fromPartial(object: Partial<PeerInfo>): PeerInfo {
    const message = createBasePeerInfo();
    message.id = object.id ?? "";
    message.addressInfo =
      object.addressInfo?.map((e) => PeerAddressInfo.fromPartial(e)) || [];
    message.lastConnected = object.lastConnected ?? undefined;
    return message;
  },
  fromAmino(object: PeerInfoAmino): PeerInfo {
    return {
      id: object.id,
      addressInfo: Array.isArray(object?.address_info)
        ? object.address_info.map((e: any) => PeerAddressInfo.fromAmino(e))
        : [],
      lastConnected: object?.last_connected
        ? Timestamp.fromAmino(object.last_connected)
        : undefined,
    };
  },
  toAmino(message: PeerInfo): PeerInfoAmino {
    const obj: any = {};
    obj.id = message.id;
    if (message.addressInfo) {
      obj.address_info = message.addressInfo.map((e) =>
        e ? PeerAddressInfo.toAmino(e) : undefined
      );
    } else {
      obj.address_info = [];
    }
    obj.last_connected = message.lastConnected
      ? Timestamp.toAmino(message.lastConnected)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: PeerInfoAminoMsg): PeerInfo {
    return PeerInfo.fromAmino(object.value);
  },
  fromProtoMsg(message: PeerInfoProtoMsg): PeerInfo {
    return PeerInfo.decode(message.value);
  },
  toProto(message: PeerInfo): Uint8Array {
    return PeerInfo.encode(message).finish();
  },
  toProtoMsg(message: PeerInfo): PeerInfoProtoMsg {
    return {
      typeUrl: "/tendermint.p2p.PeerInfo",
      value: PeerInfo.encode(message).finish(),
    };
  },
};
function createBasePeerAddressInfo(): PeerAddressInfo {
  return {
    address: "",
    lastDialSuccess: undefined,
    lastDialFailure: undefined,
    dialFailures: 0,
  };
}
export const PeerAddressInfo = {
  typeUrl: "/tendermint.p2p.PeerAddressInfo",
  encode(
    message: PeerAddressInfo,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.address !== "") {
      writer.uint32(10).string(message.address);
    }
    if (message.lastDialSuccess !== undefined) {
      Timestamp.encode(
        toTimestamp(message.lastDialSuccess),
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.lastDialFailure !== undefined) {
      Timestamp.encode(
        toTimestamp(message.lastDialFailure),
        writer.uint32(26).fork()
      ).ldelim();
    }
    if (message.dialFailures !== 0) {
      writer.uint32(32).uint32(message.dialFailures);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): PeerAddressInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePeerAddressInfo();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.address = reader.string();
          break;
        case 2:
          message.lastDialSuccess = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        case 3:
          message.lastDialFailure = fromTimestamp(
            Timestamp.decode(reader, reader.uint32())
          );
          break;
        case 4:
          message.dialFailures = reader.uint32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<PeerAddressInfo>): PeerAddressInfo {
    const message = createBasePeerAddressInfo();
    message.address = object.address ?? "";
    message.lastDialSuccess = object.lastDialSuccess ?? undefined;
    message.lastDialFailure = object.lastDialFailure ?? undefined;
    message.dialFailures = object.dialFailures ?? 0;
    return message;
  },
  fromAmino(object: PeerAddressInfoAmino): PeerAddressInfo {
    return {
      address: object.address,
      lastDialSuccess: object?.last_dial_success
        ? Timestamp.fromAmino(object.last_dial_success)
        : undefined,
      lastDialFailure: object?.last_dial_failure
        ? Timestamp.fromAmino(object.last_dial_failure)
        : undefined,
      dialFailures: object.dial_failures,
    };
  },
  toAmino(message: PeerAddressInfo): PeerAddressInfoAmino {
    const obj: any = {};
    obj.address = message.address;
    obj.last_dial_success = message.lastDialSuccess
      ? Timestamp.toAmino(message.lastDialSuccess)
      : undefined;
    obj.last_dial_failure = message.lastDialFailure
      ? Timestamp.toAmino(message.lastDialFailure)
      : undefined;
    obj.dial_failures = message.dialFailures;
    return obj;
  },
  fromAminoMsg(object: PeerAddressInfoAminoMsg): PeerAddressInfo {
    return PeerAddressInfo.fromAmino(object.value);
  },
  fromProtoMsg(message: PeerAddressInfoProtoMsg): PeerAddressInfo {
    return PeerAddressInfo.decode(message.value);
  },
  toProto(message: PeerAddressInfo): Uint8Array {
    return PeerAddressInfo.encode(message).finish();
  },
  toProtoMsg(message: PeerAddressInfo): PeerAddressInfoProtoMsg {
    return {
      typeUrl: "/tendermint.p2p.PeerAddressInfo",
      value: PeerAddressInfo.encode(message).finish(),
    };
  },
};
