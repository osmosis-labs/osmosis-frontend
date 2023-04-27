//@ts-nocheck
/* eslint-disable */
import { Long } from "../../helpers";
import * as _m0 from "protobufjs/minimal";
export interface NetAddress {
  id: string;
  ip: string;
  port: number;
}
export interface NetAddressProtoMsg {
  typeUrl: "/tendermint.p2p.NetAddress";
  value: Uint8Array;
}
export interface NetAddressAmino {
  id: string;
  ip: string;
  port: number;
}
export interface NetAddressAminoMsg {
  type: "/tendermint.p2p.NetAddress";
  value: NetAddressAmino;
}
export interface NetAddressSDKType {
  id: string;
  ip: string;
  port: number;
}
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
export interface DefaultNodeInfo {
  protocolVersion?: ProtocolVersion;
  defaultNodeId: string;
  listenAddr: string;
  network: string;
  version: string;
  channels: Uint8Array;
  moniker: string;
  other?: DefaultNodeInfoOther;
}
export interface DefaultNodeInfoProtoMsg {
  typeUrl: "/tendermint.p2p.DefaultNodeInfo";
  value: Uint8Array;
}
export interface DefaultNodeInfoAmino {
  protocol_version?: ProtocolVersionAmino;
  default_node_id: string;
  listen_addr: string;
  network: string;
  version: string;
  channels: Uint8Array;
  moniker: string;
  other?: DefaultNodeInfoOtherAmino;
}
export interface DefaultNodeInfoAminoMsg {
  type: "/tendermint.p2p.DefaultNodeInfo";
  value: DefaultNodeInfoAmino;
}
export interface DefaultNodeInfoSDKType {
  protocol_version?: ProtocolVersionSDKType;
  default_node_id: string;
  listen_addr: string;
  network: string;
  version: string;
  channels: Uint8Array;
  moniker: string;
  other?: DefaultNodeInfoOtherSDKType;
}
export interface DefaultNodeInfoOther {
  txIndex: string;
  rpcAddress: string;
}
export interface DefaultNodeInfoOtherProtoMsg {
  typeUrl: "/tendermint.p2p.DefaultNodeInfoOther";
  value: Uint8Array;
}
export interface DefaultNodeInfoOtherAmino {
  tx_index: string;
  rpc_address: string;
}
export interface DefaultNodeInfoOtherAminoMsg {
  type: "/tendermint.p2p.DefaultNodeInfoOther";
  value: DefaultNodeInfoOtherAmino;
}
export interface DefaultNodeInfoOtherSDKType {
  tx_index: string;
  rpc_address: string;
}
function createBaseNetAddress(): NetAddress {
  return {
    id: "",
    ip: "",
    port: 0,
  };
}
export const NetAddress = {
  typeUrl: "/tendermint.p2p.NetAddress",
  encode(
    message: NetAddress,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.ip !== "") {
      writer.uint32(18).string(message.ip);
    }
    if (message.port !== 0) {
      writer.uint32(24).uint32(message.port);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): NetAddress {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseNetAddress();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.ip = reader.string();
          break;
        case 3:
          message.port = reader.uint32();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<NetAddress>): NetAddress {
    const message = createBaseNetAddress();
    message.id = object.id ?? "";
    message.ip = object.ip ?? "";
    message.port = object.port ?? 0;
    return message;
  },
  fromAmino(object: NetAddressAmino): NetAddress {
    return {
      id: object.id,
      ip: object.ip,
      port: object.port,
    };
  },
  toAmino(message: NetAddress): NetAddressAmino {
    const obj: any = {};
    obj.id = message.id;
    obj.ip = message.ip;
    obj.port = message.port;
    return obj;
  },
  fromAminoMsg(object: NetAddressAminoMsg): NetAddress {
    return NetAddress.fromAmino(object.value);
  },
  fromProtoMsg(message: NetAddressProtoMsg): NetAddress {
    return NetAddress.decode(message.value);
  },
  toProto(message: NetAddress): Uint8Array {
    return NetAddress.encode(message).finish();
  },
  toProtoMsg(message: NetAddress): NetAddressProtoMsg {
    return {
      typeUrl: "/tendermint.p2p.NetAddress",
      value: NetAddress.encode(message).finish(),
    };
  },
};
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
function createBaseDefaultNodeInfo(): DefaultNodeInfo {
  return {
    protocolVersion: undefined,
    defaultNodeId: "",
    listenAddr: "",
    network: "",
    version: "",
    channels: new Uint8Array(),
    moniker: "",
    other: undefined,
  };
}
export const DefaultNodeInfo = {
  typeUrl: "/tendermint.p2p.DefaultNodeInfo",
  encode(
    message: DefaultNodeInfo,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.protocolVersion !== undefined) {
      ProtocolVersion.encode(
        message.protocolVersion,
        writer.uint32(10).fork()
      ).ldelim();
    }
    if (message.defaultNodeId !== "") {
      writer.uint32(18).string(message.defaultNodeId);
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
      DefaultNodeInfoOther.encode(
        message.other,
        writer.uint32(66).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): DefaultNodeInfo {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDefaultNodeInfo();
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
          message.defaultNodeId = reader.string();
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
          message.other = DefaultNodeInfoOther.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<DefaultNodeInfo>): DefaultNodeInfo {
    const message = createBaseDefaultNodeInfo();
    message.protocolVersion =
      object.protocolVersion !== undefined && object.protocolVersion !== null
        ? ProtocolVersion.fromPartial(object.protocolVersion)
        : undefined;
    message.defaultNodeId = object.defaultNodeId ?? "";
    message.listenAddr = object.listenAddr ?? "";
    message.network = object.network ?? "";
    message.version = object.version ?? "";
    message.channels = object.channels ?? new Uint8Array();
    message.moniker = object.moniker ?? "";
    message.other =
      object.other !== undefined && object.other !== null
        ? DefaultNodeInfoOther.fromPartial(object.other)
        : undefined;
    return message;
  },
  fromAmino(object: DefaultNodeInfoAmino): DefaultNodeInfo {
    return {
      protocolVersion: object?.protocol_version
        ? ProtocolVersion.fromAmino(object.protocol_version)
        : undefined,
      defaultNodeId: object.default_node_id,
      listenAddr: object.listen_addr,
      network: object.network,
      version: object.version,
      channels: object.channels,
      moniker: object.moniker,
      other: object?.other
        ? DefaultNodeInfoOther.fromAmino(object.other)
        : undefined,
    };
  },
  toAmino(message: DefaultNodeInfo): DefaultNodeInfoAmino {
    const obj: any = {};
    obj.protocol_version = message.protocolVersion
      ? ProtocolVersion.toAmino(message.protocolVersion)
      : undefined;
    obj.default_node_id = message.defaultNodeId;
    obj.listen_addr = message.listenAddr;
    obj.network = message.network;
    obj.version = message.version;
    obj.channels = message.channels;
    obj.moniker = message.moniker;
    obj.other = message.other
      ? DefaultNodeInfoOther.toAmino(message.other)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: DefaultNodeInfoAminoMsg): DefaultNodeInfo {
    return DefaultNodeInfo.fromAmino(object.value);
  },
  fromProtoMsg(message: DefaultNodeInfoProtoMsg): DefaultNodeInfo {
    return DefaultNodeInfo.decode(message.value);
  },
  toProto(message: DefaultNodeInfo): Uint8Array {
    return DefaultNodeInfo.encode(message).finish();
  },
  toProtoMsg(message: DefaultNodeInfo): DefaultNodeInfoProtoMsg {
    return {
      typeUrl: "/tendermint.p2p.DefaultNodeInfo",
      value: DefaultNodeInfo.encode(message).finish(),
    };
  },
};
function createBaseDefaultNodeInfoOther(): DefaultNodeInfoOther {
  return {
    txIndex: "",
    rpcAddress: "",
  };
}
export const DefaultNodeInfoOther = {
  typeUrl: "/tendermint.p2p.DefaultNodeInfoOther",
  encode(
    message: DefaultNodeInfoOther,
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
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): DefaultNodeInfoOther {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDefaultNodeInfoOther();
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
  fromPartial(object: Partial<DefaultNodeInfoOther>): DefaultNodeInfoOther {
    const message = createBaseDefaultNodeInfoOther();
    message.txIndex = object.txIndex ?? "";
    message.rpcAddress = object.rpcAddress ?? "";
    return message;
  },
  fromAmino(object: DefaultNodeInfoOtherAmino): DefaultNodeInfoOther {
    return {
      txIndex: object.tx_index,
      rpcAddress: object.rpc_address,
    };
  },
  toAmino(message: DefaultNodeInfoOther): DefaultNodeInfoOtherAmino {
    const obj: any = {};
    obj.tx_index = message.txIndex;
    obj.rpc_address = message.rpcAddress;
    return obj;
  },
  fromAminoMsg(object: DefaultNodeInfoOtherAminoMsg): DefaultNodeInfoOther {
    return DefaultNodeInfoOther.fromAmino(object.value);
  },
  fromProtoMsg(message: DefaultNodeInfoOtherProtoMsg): DefaultNodeInfoOther {
    return DefaultNodeInfoOther.decode(message.value);
  },
  toProto(message: DefaultNodeInfoOther): Uint8Array {
    return DefaultNodeInfoOther.encode(message).finish();
  },
  toProtoMsg(message: DefaultNodeInfoOther): DefaultNodeInfoOtherProtoMsg {
    return {
      typeUrl: "/tendermint.p2p.DefaultNodeInfoOther",
      value: DefaultNodeInfoOther.encode(message).finish(),
    };
  },
};
