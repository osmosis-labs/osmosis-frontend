import { Buffer } from "buffer/";
import { Any } from "cosmjs-types/google/protobuf/any";

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
