import { Buffer } from "buffer/";
import type { Any } from "cosmjs-types/google/protobuf/any";

export function encodeAnyBase64({ typeUrl, value }: Any): {
  typeUrl: string;
  value: string;
} {
  return {
    // convert protobufAny to base64 to send over the interwebs
    typeUrl,
    value: Buffer.from(value).toString("base64"),
  };
}

export function decodeAnyBase64({
  typeUrl,
  value,
}: {
  typeUrl: string;
  value: string;
}): Any {
  return {
    // convert base64 to protobufAny to decode
    typeUrl,
    value: Buffer.from(value, "base64"),
  };
}

export async function getOsmosisCodec() {
  return import("@osmosis-labs/proto-codecs").then((module) => module.osmosis);
}

export async function getCosmwasmCodec() {
  return import("@osmosis-labs/proto-codecs").then((module) => module.cosmwasm);
}

export async function getIbcCodec() {
  return import("@osmosis-labs/proto-codecs").then((module) => module.ibc);
}
