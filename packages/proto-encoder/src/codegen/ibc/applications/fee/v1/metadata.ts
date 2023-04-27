//@ts-nocheck
/* eslint-disable */
import * as _m0 from "protobufjs/minimal";
/**
 * Metadata defines the ICS29 channel specific metadata encoded into the channel version bytestring
 * See ICS004: https://github.com/cosmos/ibc/tree/master/spec/core/ics-004-channel-and-packet-semantics#Versioning
 */
export interface Metadata {
  /** fee_version defines the ICS29 fee version */
  feeVersion: string;
  /** app_version defines the underlying application version, which may or may not be a JSON encoded bytestring */
  appVersion: string;
}
export interface MetadataProtoMsg {
  typeUrl: "/ibc.applications.fee.v1.Metadata";
  value: Uint8Array;
}
/**
 * Metadata defines the ICS29 channel specific metadata encoded into the channel version bytestring
 * See ICS004: https://github.com/cosmos/ibc/tree/master/spec/core/ics-004-channel-and-packet-semantics#Versioning
 */
export interface MetadataAmino {
  /** fee_version defines the ICS29 fee version */
  fee_version: string;
  /** app_version defines the underlying application version, which may or may not be a JSON encoded bytestring */
  app_version: string;
}
export interface MetadataAminoMsg {
  type: "cosmos-sdk/Metadata";
  value: MetadataAmino;
}
/**
 * Metadata defines the ICS29 channel specific metadata encoded into the channel version bytestring
 * See ICS004: https://github.com/cosmos/ibc/tree/master/spec/core/ics-004-channel-and-packet-semantics#Versioning
 */
export interface MetadataSDKType {
  fee_version: string;
  app_version: string;
}
function createBaseMetadata(): Metadata {
  return {
    feeVersion: "",
    appVersion: "",
  };
}
export const Metadata = {
  typeUrl: "/ibc.applications.fee.v1.Metadata",
  encode(
    message: Metadata,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.feeVersion !== "") {
      writer.uint32(10).string(message.feeVersion);
    }
    if (message.appVersion !== "") {
      writer.uint32(18).string(message.appVersion);
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): Metadata {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMetadata();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.feeVersion = reader.string();
          break;
        case 2:
          message.appVersion = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
  fromPartial(object: Partial<Metadata>): Metadata {
    const message = createBaseMetadata();
    message.feeVersion = object.feeVersion ?? "";
    message.appVersion = object.appVersion ?? "";
    return message;
  },
  fromAmino(object: MetadataAmino): Metadata {
    return {
      feeVersion: object.fee_version,
      appVersion: object.app_version,
    };
  },
  toAmino(message: Metadata): MetadataAmino {
    const obj: any = {};
    obj.fee_version = message.feeVersion;
    obj.app_version = message.appVersion;
    return obj;
  },
  fromAminoMsg(object: MetadataAminoMsg): Metadata {
    return Metadata.fromAmino(object.value);
  },
  toAminoMsg(message: Metadata): MetadataAminoMsg {
    return {
      type: "cosmos-sdk/Metadata",
      value: Metadata.toAmino(message),
    };
  },
  fromProtoMsg(message: MetadataProtoMsg): Metadata {
    return Metadata.decode(message.value);
  },
  toProto(message: Metadata): Uint8Array {
    return Metadata.encode(message).finish();
  },
  toProtoMsg(message: Metadata): MetadataProtoMsg {
    return {
      typeUrl: "/ibc.applications.fee.v1.Metadata",
      value: Metadata.encode(message).finish(),
    };
  },
};
