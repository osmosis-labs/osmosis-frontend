import { Params, ParamsAmino, ParamsSDKType } from "./params";
import {
  DenomAuthorityMetadata,
  DenomAuthorityMetadataAmino,
  DenomAuthorityMetadataSDKType,
} from "./authorityMetadata";
import * as _m0 from "protobufjs/minimal";
/** GenesisState defines the tokenfactory module's genesis state. */
export interface GenesisState {
  /** params defines the paramaters of the module. */
  params?: Params;
  factoryDenoms: GenesisDenom[];
}
export interface GenesisStateProtoMsg {
  typeUrl: "/osmosis.tokenfactory.v1beta1.GenesisState";
  value: Uint8Array;
}
/** GenesisState defines the tokenfactory module's genesis state. */
export interface GenesisStateAmino {
  /** params defines the paramaters of the module. */
  params?: ParamsAmino;
  factory_denoms: GenesisDenomAmino[];
}
export interface GenesisStateAminoMsg {
  type: "osmosis/tokenfactory/genesis-state";
  value: GenesisStateAmino;
}
/** GenesisState defines the tokenfactory module's genesis state. */
export interface GenesisStateSDKType {
  params?: ParamsSDKType;
  factory_denoms: GenesisDenomSDKType[];
}
/**
 * GenesisDenom defines a tokenfactory denom that is defined within genesis
 * state. The structure contains DenomAuthorityMetadata which defines the
 * denom's admin.
 */
export interface GenesisDenom {
  denom: string;
  authorityMetadata?: DenomAuthorityMetadata;
}
export interface GenesisDenomProtoMsg {
  typeUrl: "/osmosis.tokenfactory.v1beta1.GenesisDenom";
  value: Uint8Array;
}
/**
 * GenesisDenom defines a tokenfactory denom that is defined within genesis
 * state. The structure contains DenomAuthorityMetadata which defines the
 * denom's admin.
 */
export interface GenesisDenomAmino {
  denom: string;
  authority_metadata?: DenomAuthorityMetadataAmino;
}
export interface GenesisDenomAminoMsg {
  type: "osmosis/tokenfactory/genesis-denom";
  value: GenesisDenomAmino;
}
/**
 * GenesisDenom defines a tokenfactory denom that is defined within genesis
 * state. The structure contains DenomAuthorityMetadata which defines the
 * denom's admin.
 */
export interface GenesisDenomSDKType {
  denom: string;
  authority_metadata?: DenomAuthorityMetadataSDKType;
}
function createBaseGenesisState(): GenesisState {
  return {
    params: undefined,
    factoryDenoms: [],
  };
}
export const GenesisState = {
  typeUrl: "/osmosis.tokenfactory.v1beta1.GenesisState",
  encode(
    message: GenesisState,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.params !== undefined) {
      Params.encode(message.params, writer.uint32(10).fork()).ldelim();
    }
    for (const v of message.factoryDenoms) {
      GenesisDenom.encode(v!, writer.uint32(18).fork()).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): GenesisState {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisState();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.params = Params.decode(reader, reader.uint32());
          break;
        case 2:
          message.factoryDenoms.push(
            GenesisDenom.decode(reader, reader.uint32())
          );
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
    message.params =
      object.params !== undefined && object.params !== null
        ? Params.fromPartial(object.params)
        : undefined;
    message.factoryDenoms =
      object.factoryDenoms?.map((e) => GenesisDenom.fromPartial(e)) || [];
    return message;
  },
  fromAmino(object: GenesisStateAmino): GenesisState {
    return {
      params: object?.params ? Params.fromAmino(object.params) : undefined,
      factoryDenoms: Array.isArray(object?.factory_denoms)
        ? object.factory_denoms.map((e: any) => GenesisDenom.fromAmino(e))
        : [],
    };
  },
  toAmino(message: GenesisState): GenesisStateAmino {
    const obj: any = {};
    obj.params = message.params ? Params.toAmino(message.params) : undefined;
    if (message.factoryDenoms) {
      obj.factory_denoms = message.factoryDenoms.map((e) =>
        e ? GenesisDenom.toAmino(e) : undefined
      );
    } else {
      obj.factory_denoms = [];
    }
    return obj;
  },
  fromAminoMsg(object: GenesisStateAminoMsg): GenesisState {
    return GenesisState.fromAmino(object.value);
  },
  toAminoMsg(message: GenesisState): GenesisStateAminoMsg {
    return {
      type: "osmosis/tokenfactory/genesis-state",
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
      typeUrl: "/osmosis.tokenfactory.v1beta1.GenesisState",
      value: GenesisState.encode(message).finish(),
    };
  },
};
function createBaseGenesisDenom(): GenesisDenom {
  return {
    denom: "",
    authorityMetadata: undefined,
  };
}
export const GenesisDenom = {
  typeUrl: "/osmosis.tokenfactory.v1beta1.GenesisDenom",
  encode(
    message: GenesisDenom,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.denom !== "") {
      writer.uint32(10).string(message.denom);
    }
    if (message.authorityMetadata !== undefined) {
      DenomAuthorityMetadata.encode(
        message.authorityMetadata,
        writer.uint32(18).fork()
      ).ldelim();
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): GenesisDenom {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGenesisDenom();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.denom = reader.string();
          break;
        case 2:
          message.authorityMetadata = DenomAuthorityMetadata.decode(
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
  fromPartial(object: Partial<GenesisDenom>): GenesisDenom {
    const message = createBaseGenesisDenom();
    message.denom = object.denom ?? "";
    message.authorityMetadata =
      object.authorityMetadata !== undefined &&
      object.authorityMetadata !== null
        ? DenomAuthorityMetadata.fromPartial(object.authorityMetadata)
        : undefined;
    return message;
  },
  fromAmino(object: GenesisDenomAmino): GenesisDenom {
    return {
      denom: object.denom,
      authorityMetadata: object?.authority_metadata
        ? DenomAuthorityMetadata.fromAmino(object.authority_metadata)
        : undefined,
    };
  },
  toAmino(message: GenesisDenom): GenesisDenomAmino {
    const obj: any = {};
    obj.denom = message.denom;
    obj.authority_metadata = message.authorityMetadata
      ? DenomAuthorityMetadata.toAmino(message.authorityMetadata)
      : undefined;
    return obj;
  },
  fromAminoMsg(object: GenesisDenomAminoMsg): GenesisDenom {
    return GenesisDenom.fromAmino(object.value);
  },
  toAminoMsg(message: GenesisDenom): GenesisDenomAminoMsg {
    return {
      type: "osmosis/tokenfactory/genesis-denom",
      value: GenesisDenom.toAmino(message),
    };
  },
  fromProtoMsg(message: GenesisDenomProtoMsg): GenesisDenom {
    return GenesisDenom.decode(message.value);
  },
  toProto(message: GenesisDenom): Uint8Array {
    return GenesisDenom.encode(message).finish();
  },
  toProtoMsg(message: GenesisDenom): GenesisDenomProtoMsg {
    return {
      typeUrl: "/osmosis.tokenfactory.v1beta1.GenesisDenom",
      value: GenesisDenom.encode(message).finish(),
    };
  },
};
