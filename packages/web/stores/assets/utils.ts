import { Hash } from "@keplr-wallet/crypto";
import { Buffer } from "buffer";

export function makeIBCMinimalDenom(
  sourceChannelId: string,
  coinMinimalDenom: string
): string {
  return (
    "ibc/" +
    Buffer.from(
      Hash.sha256(
        Buffer.from(`transfer/${sourceChannelId}/${coinMinimalDenom}`)
      )
    )
      .toString("hex")
      .toUpperCase()
  );
}
