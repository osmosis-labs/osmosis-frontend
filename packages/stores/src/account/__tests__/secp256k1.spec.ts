/** @jest-environment node */

import { fromHex, toHex } from "@cosmjs/encoding";
import { Mnemonic, PrivKeySecp256k1 } from "@keplr-wallet/crypto";

// Public test vectors only; never use these keys for funds.
const MNEMONIC =
  "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
// SHA-256("sample") with private scalar 1. Independently checked with Noble.
const DIGEST = fromHex(
  "af2bdbe1aa9b6ec1e2ade1d694f41fc71a831d0268e9891562113d8a62add1bf"
);
const SIGNATURE =
  "58db657bcd631038bea07b4941172f0167aca98f12b55e3176bd1c35435d6501" +
  "3a78e73d8ff8ab554e13c10f6390d81a882f91945d6275493882676170b53a57";

const privateKey = () => new PrivKeySecp256k1(fromHex("1".padStart(64, "0")));

// Mnemonic derivation exercises Keplr -> bip32 -> tiny-secp256k1. Signing
// exercises the separate, still elliptic-backed one-click trading API.
describe("secp256k1 dependency compatibility", () => {
  it.each([
    {
      path: "m/44'/118'/0'/0/0",
      privateKey:
        "c4a48e2fce1481cd3294b4490f6678090ea98d3d0e5cd984558ab0968741b104",
      publicKey:
        "024f4e2ad99c34d60b9ba6283c9431a8418af8673212961f97a77b6377fcd05b62",
    },
    {
      path: "m/44'/0'/0'/0/0",
      privateKey:
        "e284129cc0922579a535bbf4d1a3b25773090d28c909bc0fed73b5e0222cc372",
      publicKey:
        "03aaeb52dd7494c361049de67cc680e83ebcbbbdbeb13637d92cd845f70308af5e",
    },
  ])("preserves BIP39/BIP32 derivation for $path", (vector) => {
    // Expected keys independently checked with @scure/bip39 and @scure/bip32.
    const bytes = Mnemonic.generateWalletFromMnemonic(MNEMONIC, vector.path);
    expect(toHex(bytes)).toBe(vector.privateKey);
    expect(toHex(new PrivKeySecp256k1(bytes).getPubKey().toBytes())).toBe(
      vector.publicKey
    );
  });

  it("preserves deterministic low-S, fixed-width signatures and recovery ID", () => {
    const key = privateKey();
    const { r, s, v } = key.signDigest32(DIGEST);

    expect(r).toHaveLength(32);
    expect(s).toHaveLength(32);
    expect(toHex(new Uint8Array([...r, ...s]))).toBe(SIGNATURE);
    expect(v).toBe(1);
    expect(toHex(key.getPubKey().toBytes())).toBe(
      "0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798"
    );
    expect(key.getPubKey().verifyDigest32(DIGEST, fromHex(SIGNATURE))).toBe(
      true
    );
  });

  it("rejects a signature for a different digest", () => {
    const changedDigest = Uint8Array.from(DIGEST);
    changedDigest[0] ^= 1;
    expect(
      privateKey().getPubKey().verifyDigest32(changedDigest, fromHex(SIGNATURE))
    ).toBe(false);
  });

  it.each([0, 31, 33])("rejects a %i-byte signing digest", (length) => {
    expect(() => privateKey().signDigest32(new Uint8Array(length))).toThrow(
      "Invalid length of digest"
    );
  });
});
