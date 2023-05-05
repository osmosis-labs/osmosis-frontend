//@ts-nocheck
import * as _m0 from "protobufjs/minimal";

import { Long } from "../../../../helpers";
import {
  ClientConsensusStates,
  ClientConsensusStatesAmino,
  ClientConsensusStatesSDKType,
  IdentifiedClientState,
  IdentifiedClientStateAmino,
  IdentifiedClientStateSDKType,
  Params,
  ParamsAmino,
  ParamsSDKType,
} from "./client";
/** GenesisState defines the ibc client submodule's genesis state. */
export interface GenesisState {
  /** client states with their corresponding identifiers */
  clients: IdentifiedClientState[];
  /** consensus states from each client */
  clientsConsensus: ClientConsensusStates[];
  /** metadata from each client */
  clientsMetadata: IdentifiedGenesisMetadata[];
  params?: Params;
  /** create localhost on initialization */
  createLocalhost: boolean;
  /** the sequence for the next generated client identifier */
  nextClientSequence: Long;
}
export interface GenesisStateProtoMsg {
  typeUrl: "/ibc.core.client.v1.GenesisState";
  value: Uint8Array;
}
/** GenesisState defines the ibc client submodule's genesis state. */
export interface GenesisStateAmino {
  /** client states with their corresponding identifiers */
  clients: IdentifiedClientStateAmino[];
  /** consensus states from each client */
  clients_consensus: ClientConsensusStatesAmino[];
  /** metadata from each client */
  clients_metadata: IdentifiedGenesisMetadataAmino[];
  params?: ParamsAmino;
  /** create localhost on initialization */
  create_localhost: boolean;
  /** the sequence for the next generated client identifier */
  next_client_sequence: string;
}
export interface GenesisStateAminoMsg {
  type: "cosmos-sdk/GenesisState";
  value: GenesisStateAmino;
}
/** GenesisState defines the ibc client submodule's genesis state. */
export interface GenesisStateSDKType {
  clients: IdentifiedClientStateSDKType[];
  clients_consensus: ClientConsensusStatesSDKType[];
  clients_metadata: IdentifiedGenesisMetadataSDKType[];
  params?: ParamsSDKType;
  create_localhost: boolean;
  next_client_sequence: Long;
}
/**
 * GenesisMetadata defines the genesis type for metadata that clients may return
 * with ExportMetadata
 */
export interface GenesisMetadata {
  /** store key of metadata without clientID-prefix */
  key: Uint8Array;
  /** metadata value */
  value: Uint8Array;
}
export interface GenesisMetadataProtoMsg {
  typeUrl: "/ibc.core.client.v1.GenesisMetadata";
  value: Uint8Array;
}
/**
 * GenesisMetadata defines the genesis type for metadata that clients may return
 * with ExportMetadata
 */
export interface GenesisMetadataAmino {
  /** store key of metadata without clientID-prefix */
  key: Uint8Array;
  /** metadata value */
  value: Uint8Array;
}
export interface GenesisMetadataAminoMsg {
  type: "cosmos-sdk/GenesisMetadata";
  value: GenesisMetadataAmino;
}
/**
 * GenesisMetadata defines the genesis type for metadata that clients may return
 * with ExportMetadata
 */
export interface GenesisMetadataSDKType {
  key: Uint8Array;
  value: Uint8Array;
}
/**
 * IdentifiedGenesisMetadata has the client metadata with the corresponding
 * client id.
 */
export interface IdentifiedGenesisMetadata {
  clientId: string;
  clientMetadata: GenesisMetadata[];
}
export interface IdentifiedGenesisMetadataProtoMsg {
  typeUrl: "/ibc.core.client.v1.IdentifiedGenesisMetadata";
  value: Uint8Array;
}
/**
 * IdentifiedGenesisMetadata has the client metadata with the corresponding
 * client id.
 */
export interface IdentifiedGenesisMetadataAmino {
  client_id: string;
  client_metadata: GenesisMetadataAmino[];
}
export interface IdentifiedGenesisMetadataAminoMsg {
  type: "cosmos-sdk/IdentifiedGenesisMetadata";
  value: IdentifiedGenesisMetadataAmino;
}
/**
 * IdentifiedGenesisMetadata has the client metadata with the corresponding
 * client id.
 */
export interface IdentifiedGenesisMetadataSDKType {
  client_id: string;
  client_metadata: GenesisMetadataSDKType[];
}
function createBaseGenesisState(): GenesisState {
  return {
    clients: [],
    clientsConsensus: [],
    clientsMetadata: [],
    params: undefined,
    createLocalhost: false,
    nextClientSequence: Long.UZERO,
  };
}
export const GenesisState = {
  typeUrl: "/ibc.core.client.v1.GenesisState",
  encode(
    message: GenesisState,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    for (const v of message.clients) {
      IdentifiedClientState.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.clientsConsensus) {
      ClientConsensusStates.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    for (const v of message.clientsMetadata) {
      IdentifiedGenesisMetadata.encode(v!, writer.uint32(26).fork()).ldelim();
    }
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(34).fork()).ldelim();
    }
    if (message.createLocalhost === true) {
      writer.uint32(40).bool(message.createLocalhost);
    }
    if (!message.nextClientSequence.isZero()) {
      writer.uint32(48).uint64(message.nextClientSequence);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): GenesisState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.clients.push(
            IdentifiedClientState.decode(reader, reader.uint32())
          );
          break;
        case 2:
          message.clientsConsensus.push(
            ClientConsensusStates.decode(reader, reader.uint32())
          );
          break;
        case 3:
          message.clientsMetadata.push(
            IdentifiedGenesisMetadata.decode(reader, reader.uint32())
          );
          break;
        case 4:
          message.params = Params.decode(reader, reader.uint32());
          break;
        case 5:
          message.createLocalhost = reader.bool();
          break;
        case 6:
          message.nextClientSequence = reader.uint64() as Long;
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<GenesisState>): GenesisState {
    const message = createBaseGenesisState();
    message.clients =
      object.clients?.map((e) => IdentifiedClientState.fromPartial(e)) || [];
    message.clientsConsensus =
      object.clientsConsensus?.map((e) =>
        ClientConsensusStates.fromPartial(e)
      ) || [];
    message.clientsMetadata =
      object.clientsMetadata?.map((e) =>
        IdentifiedGenesisMetadata.fromPartial(e)
      ) || [];
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    message.createLocalhost = object.createLocalhost ?? false;
    message.nextClientSequence =
      object.nextClientSequence !== undefined &&
      object.nextClientSequence !== null
        ? Long.fromValue(object.nextClientSequence)
        : Long.UZERO;
    return message;
  },
  fromAmino(object: GenesisStateAmino): GenesisState {
    return {
      clients: Array.isArray(object?.clients)
        ? object.clients.map((e: any) => IdentifiedClientState.fromAmino(e))
        : [],
      clientsConsensus: Array.isArray(object?.clients_consensus)
        ? object.clients_consensus.map((e: any) =>
            ClientConsensusStates.fromAmino(e)
          )
        : [],
      clientsMetadata: Array.isArray(object?.clients_metadata)
        ? object.clients_metadata.map((e: any) =>
            IdentifiedGenesisMetadata.fromAmino(e)
          )
        : [],
      params: object?.params ? Params.fromAmino(object.params) : undefined,
      createLocalhost: object.create_localhost,
      nextClientSequence: Long.fromString(object.next_client_sequence),
    };
  },
  toAmino(message: GenesisState): GenesisStateAmino {
    const obj: any = {};
    if (message.clients) {
      obj.clients = message.clients.map((e) =>
        e ? IdentifiedClientState.toAmino(e) : undefined
      );
    } else {
      obj.clients = [];
    }
    if (message.clientsConsensus) {
      obj.clients_consensus = message.clientsConsensus.map((e) =>
        e ? ClientConsensusStates.toAmino(e) : undefined
      );
    } else {
      obj.clients_consensus = [];
    }
    if (message.clientsMetadata) {
      obj.clients_metadata = message.clientsMetadata.map((e) =>
        e ? IdentifiedGenesisMetadata.toAmino(e) : undefined
      );
    } else {
      obj.clients_metadata = [];
    }
    obj.params = message.params ? Params.toAmino(message.params) : undefined;
    obj.create_localhost = message.createLocalhost;
    obj.next_client_sequence = message.nextClientSequence
      ? message.nextClientSequence.toString()
      : undefined;
    return obj;
  },
  fromAminoMsg(object: GenesisStateAminoMsg): GenesisState {
    return GenesisState.fromAmino(object.value);
  },
  toAminoMsg(message: GenesisState): GenesisStateAminoMsg {
    return {
      type: "cosmos-sdk/GenesisState",
      value: GenesisState.toAmino(message),
    };
  },
  fromProtoMsg(message: GenesisStateProtoMsg): GenesisState {
    return GenesisState.decode(message.value);
  },
  toProto(message: GenesisState): Uint8Array {
    return GenesisState.encode(message).finish();
  },
  toProtoMsg(message: GenesisState): GenesisStateProtoMsg {
    return {
      typeUrl: "/ibc.core.client.v1.GenesisState",
      value: GenesisState.encode(message).finish(),
    };
  },
};
function createBaseGenesisMetadata(): GenesisMetadata {
  return {
    key: new Uint8Array(),
    value: new Uint8Array(),
  };
}
export const GenesisMetadata = {
  typeUrl: "/ibc.core.client.v1.GenesisMetadata",
  encode(
    message: GenesisMetadata,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.key.length !== 0) {
      writer.uint32(10).bytes(message.key);
    }
    if (message.value.length !== 0) {
      writer.uint32(18).bytes(message.value);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): GenesisMetadata {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisMetadata();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.bytes();
          break;
        case 2:
          message.value = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<GenesisMetadata>): GenesisMetadata {
    const message = createBaseGenesisMetadata();
    message.key = object.key ?? new Uint8Array();
    message.value = object.value ?? new Uint8Array();
    return message;
  },
  fromAmino(object: GenesisMetadataAmino): GenesisMetadata {
    return {
      key: object.key,
      value: object.value,
    };
  },
  toAmino(message: GenesisMetadata): GenesisMetadataAmino {
    const obj: any = {};
    obj.key = message.key;
    obj.value = message.value;
    return obj;
  },
  fromAminoMsg(object: GenesisMetadataAminoMsg): GenesisMetadata {
    return GenesisMetadata.fromAmino(object.value);
  },
  toAminoMsg(message: GenesisMetadata): GenesisMetadataAminoMsg {
    return {
      type: "cosmos-sdk/GenesisMetadata",
      value: GenesisMetadata.toAmino(message),
    };
  },
  fromProtoMsg(message: GenesisMetadataProtoMsg): GenesisMetadata {
    return GenesisMetadata.decode(message.value);
  },
  toProto(message: GenesisMetadata): Uint8Array {
    return GenesisMetadata.encode(message).finish();
  },
  toProtoMsg(message: GenesisMetadata): GenesisMetadataProtoMsg {
    return {
      typeUrl: "/ibc.core.client.v1.GenesisMetadata",
      value: GenesisMetadata.encode(message).finish(),
    };
  },
};
function createBaseIdentifiedGenesisMetadata(): IdentifiedGenesisMetadata {
  return {
    clientId: "",
    clientMetadata: [],
  };
}
export const IdentifiedGenesisMetadata = {
  typeUrl: "/ibc.core.client.v1.IdentifiedGenesisMetadata",
  encode(
    message: IdentifiedGenesisMetadata,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.clientId !== "") {
      writer.uint32(10).string(message.clientId);
    }
    for (const v of message.clientMetadata) {
      GenesisMetadata.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): IdentifiedGenesisMetadata {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseIdentifiedGenesisMetadata();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.clientId = reader.string();
          break;
        case 2:
          message.clientMetadata.push(
            GenesisMetadata.decode(reader, reader.uint32())
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
    object: Partial<IdentifiedGenesisMetadata>
  ): IdentifiedGenesisMetadata {
    const message = createBaseIdentifiedGenesisMetadata();
    message.clientId = object.clientId ?? "";
    message.clientMetadata =
      object.clientMetadata?.map((e) => GenesisMetadata.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: IdentifiedGenesisMetadataAmino): IdentifiedGenesisMetadata {
    return {
      clientId: object.client_id,
      clientMetadata: Array.isArray(object?.client_metadata)
        ? object.client_metadata.map((e: any) => GenesisMetadata.fromAmino(e))
        : [],
    };
  },
  toAmino(message: IdentifiedGenesisMetadata): IdentifiedGenesisMetadataAmino {
    const obj: any = {};
    obj.client_id = message.clientId;
    if (message.clientMetadata) {
      obj.client_metadata = message.clientMetadata.map((e) =>
        e ? GenesisMetadata.toAmino(e) : undefined
      );
    } else {
      obj.client_metadata = [];
    }
    return obj;
  },
  fromAminoMsg(
    object: IdentifiedGenesisMetadataAminoMsg
  ): IdentifiedGenesisMetadata {
    return IdentifiedGenesisMetadata.fromAmino(object.value);
  },
  toAminoMsg(
    message: IdentifiedGenesisMetadata
  ): IdentifiedGenesisMetadataAminoMsg {
    return {
      type: "cosmos-sdk/IdentifiedGenesisMetadata",
      value: IdentifiedGenesisMetadata.toAmino(message),
    };
  },
  fromProtoMsg(
    message: IdentifiedGenesisMetadataProtoMsg
  ): IdentifiedGenesisMetadata {
    return IdentifiedGenesisMetadata.decode(message.value);
  },
  toProto(message: IdentifiedGenesisMetadata): Uint8Array {
    return IdentifiedGenesisMetadata.encode(message).finish();
  },
  toProtoMsg(
    message: IdentifiedGenesisMetadata
  ): IdentifiedGenesisMetadataProtoMsg {
    return {
      typeUrl: "/ibc.core.client.v1.IdentifiedGenesisMetadata",
      value: IdentifiedGenesisMetadata.encode(message).finish(),
    };
  },
};
