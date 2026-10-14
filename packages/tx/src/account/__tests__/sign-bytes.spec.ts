import { toHex } from "@cosmjs/encoding";
import { makeSignBytes, makeSignDoc } from "@cosmjs/proto-signing";

/**
 * One-click trading signs `sha256(makeSignBytes(signDoc))` with the session key.
 * These bytes were recorded from @keplr-wallet/proto-types' SignDoc encoder,
 * which this path used before, so a change here means signatures change.
 */
describe("direct sign bytes", () => {
  const bodyBytes = Uint8Array.from([10, 3, 1, 2, 3]);
  const authInfoBytes = Uint8Array.from([18, 2, 9, 9]);
  const prefix = "0a050a030102031204120209091a096f736d6f7369732d31";

  it.each([
    ["0", prefix],
    ["12345", prefix + "20b960"],
    ["9007199254740993", prefix + "208180808080808010"],
    ["18446744073709551615", prefix + "20ffffffffffffffffff01"],
  ])("encodes account number %s", (accountNumber, expected) => {
    const signDoc = makeSignDoc(
      bodyBytes,
      authInfoBytes,
      "osmosis-1",
      // Typed as a number upstream, but only ever handed to BigInt().
      accountNumber as unknown as number
    );

    expect(toHex(makeSignBytes(signDoc))).toBe(expected);
  });
});
