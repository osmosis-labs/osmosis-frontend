import { fromBase64, toBase64, toHex } from "@cosmjs/encoding";
import { makeSignBytes, makeSignDoc } from "@cosmjs/proto-signing";
import { Hash, PrivKeySecp256k1 } from "@keplr-wallet/crypto";

import { padSessionKeyBytes } from "../utils";

/**
 * One-click trading signs `sha256(makeSignBytes(signDoc))` with the session key.
 * These bytes were recorded from @keplr-wallet/proto-types' SignDoc encoder,
 * which this path used before, so a change here means signatures change.
 */
describe("direct sign bytes", () => {
  const bodyBytes = Uint8Array.from([10, 3, 1, 2, 3]);
  const authInfoBytes = Uint8Array.from([18, 2, 9, 9]);
  const prefix = "0a050a030102031204120209091a096f736d6f7369732d31";

  it("restores a generated session key from its stored base64 representation", () => {
    const key = PrivKeySecp256k1.generateRandomKey();
    const restored = new PrivKeySecp256k1(fromBase64(toBase64(key.toBytes())));
    const digest = Hash.sha256(bodyBytes);
    const { r, s } = restored.signDigest32(digest);

    expect(key.toBytes()).toHaveLength(32);
    expect(restored.getPubKey().toBytes()).toEqual(key.getPubKey().toBytes());
    expect(
      key.getPubKey().verifyDigest32(digest, new Uint8Array([...r, ...s]))
    ).toBe(true);
  });

  // Recorded with @keplr-wallet/crypto@0.12, which stored keys without their
  // leading zero bytes. Sessions saved that way must keep signing.
  it("restores a stored session key shorter than 32 bytes", () => {
    const stored = fromBase64("BwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBw==");
    const key = new PrivKeySecp256k1(padSessionKeyBytes(stored));
    const { r, s, v } = key.signDigest32(Hash.sha256(bodyBytes));

    expect(stored).toHaveLength(31);
    expect(toHex(key.getPubKey().toBytes())).toBe(
      "02b65459ccc9193bb06c5458f4d48b1adc1f9dd07318e05a85ade662d9fa797238"
    );
    expect(toHex(new Uint8Array([...r, ...s]))).toBe(
      "ca9a258207c019929f9d50ca02ae7a6c42619581625d4abfb25c7264f52137cc6b43e3394cd271718145885c976239984587793b11299781046dd9de84e2f285"
    );
    expect(v).toBe(0);
  });

  it("leaves a 32-byte session key unchanged", () => {
    const key = new Uint8Array(32).fill(1);
    expect(padSessionKeyBytes(key)).toBe(key);
  });

  it.each([0, 33])("rejects a session key of length %s", (length) => {
    expect(() => padSessionKeyBytes(new Uint8Array(length))).toThrow(
      `Invalid length of session key: ${length}`
    );
  });

  it.each([0, 31, 33])("rejects a digest of length %s", (length) => {
    const key = new PrivKeySecp256k1(new Uint8Array(32).fill(1));
    expect(() => key.signDigest32(new Uint8Array(length))).toThrow(
      `Invalid length of digest to sign: ${length}`
    );
  });

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

  // Recorded with @keplr-wallet/crypto@0.12.48 and the fixed session key below.
  // Preserve the actual direct-signing output when changing crypto backends.
  it.each([
    [
      "0",
      "e1faa9f2403b39f6b7ae2ee62e2a32d0940bee569ca915c5152cafdbf4fe029936ad2745bd8ff24bc97b3431a803a6986f8078cd71f9d1b9ba3b5d1cde0cfdee",
      0,
    ],
    [
      "12345",
      "804afcc0759bd1abecd40db0bfebb9338b3166791a8b67dc23d7b476ebdda5c0077c83f0f249a7b4f4cb4806e658726927267bc4cd5811721165891f7c8a522e",
      0,
    ],
    [
      "9007199254740993",
      "679ca567d59b27dd4ed150f4a0f64368a0b9c83d8666139047e3e25cddaa8b8b439054332bfdf19dbc54e5e991055d3980a62af12030fe14ac5b3c1beacb003e",
      1,
    ],
    [
      "18446744073709551615",
      "00dc0c18ea9cdb8da821f385ffc06399a193b8e6e30a709e5d5cfc97ea5388fb09e38f9222dda4b4fe1c44a808e04e1fdd6b039108c4df4a41e8ac04d8ba5091",
      0,
    ],
  ])(
    "preserves the signature for account number %s",
    (accountNumber, expected, recovery) => {
      const keyBytes = new Uint8Array(32);
      keyBytes[31] = 1;
      const key = new PrivKeySecp256k1(keyBytes);
      const signDoc = makeSignDoc(
        bodyBytes,
        authInfoBytes,
        "osmosis-1",
        accountNumber as unknown as number
      );
      const digest = Hash.sha256(makeSignBytes(signDoc));
      const { r, s, v } = key.signDigest32(digest);
      const signature = new Uint8Array([...r, ...s]);

      expect(toHex(key.getPubKey().toBytes())).toBe(
        "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"
      );
      expect(r).toHaveLength(32);
      expect(s).toHaveLength(32);
      expect(toHex(signature)).toBe(expected);
      expect(v).toBe(recovery);
      expect(key.getPubKey().verifyDigest32(digest, signature)).toBe(true);
    }
  );
});
