import { Buffer } from "buffer";
import { sha256 } from "sha.js";

export function makeIBCMinimalDenom(
  sourceChannelId: string,
  coinMinimalDenom: string
): string {
  return (
    "ibc/" +
    Buffer.from(
      sha256_fn(Buffer.from(`transfer/${sourceChannelId}/${coinMinimalDenom}`))
    )
      .toString("hex")
      .toUpperCase()
  );
}

// TODO: Move to utils
const sha256_fn = (data: Uint8Array): Uint8Array => {
  return new Uint8Array(new sha256().update(data).digest());
};
