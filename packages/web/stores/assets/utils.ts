import { Buffer } from "buffer";
import { sha256 } from "sha.js";

/**
 *
 * @param path - The path of the IBC transfer. i.e. "channel-2/transfer/channel-1/..." or just the channel: "channel-1"
 * @param coinMinimalDenom Coin denom on source chain.
 * @returns IBC hash of the coin denom.
 */
export function makeIBCMinimalDenom(
  path: string,
  coinMinimalDenom: string
): string {
  return (
    "ibc/" +
    Buffer.from(sha256_fn(Buffer.from(`transfer/${path}/${coinMinimalDenom}`)))
      .toString("hex")
      .toUpperCase()
  );
}

// TODO: Move to utils
const sha256_fn = (data: Uint8Array): Uint8Array => {
  return new Uint8Array(new sha256().update(data).digest());
};
