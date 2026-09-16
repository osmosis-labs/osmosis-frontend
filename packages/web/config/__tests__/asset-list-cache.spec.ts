import { isAssetListLockReady } from "~/config/utils";

describe("isAssetListLockReady", () => {
  const hash = "abc123";

  it("rejects a missing lock", () => {
    expect(isAssetListLockReady(null, hash, false)).toBe(false);
  });

  it("rejects a hash mismatch", () => {
    expect(
      isAssetListLockReady(
        { assetListHash: "other", isTestnet: false, listsGenerated: true },
        hash,
        false
      )
    ).toBe(false);
  });

  it("rejects a network mismatch", () => {
    expect(
      isAssetListLockReady(
        { assetListHash: hash, isTestnet: true, listsGenerated: true },
        hash,
        false
      )
    ).toBe(false);
  });

  it("rejects a lock written before list generation finished", () => {
    expect(
      isAssetListLockReady(
        { assetListHash: hash, isTestnet: false, listsGenerated: false },
        hash,
        false
      )
    ).toBe(false);
    expect(
      isAssetListLockReady(
        { assetListHash: hash, isTestnet: false },
        hash,
        false
      )
    ).toBe(false);
  });

  it("accepts a completed lock for the same commit and network", () => {
    expect(
      isAssetListLockReady(
        { assetListHash: hash, isTestnet: false, listsGenerated: true },
        hash,
        false
      )
    ).toBe(true);
  });
});
