import {
  chunkBridgeBalanceSource,
  MAX_BRIDGE_BALANCE_BATCH_SIZE,
  selectDisplayableBalances,
} from "~/components/bridge/bridge-balance-batching";
import { localBridgeTransferRouter } from "~/server/api/routers/local-bridge-transfer";

describe("bridge balance batching", () => {
  const makeAsset = (index: number) => ({
    chainType: "bitcoin" as const,
    chainId: "bitcoin",
    address: `addr-${index}`,
    denom: `TOKEN${index}`,
    decimals: 8,
    transferTypes: ["quote" as const],
    supportedVariants: { uosmo: { Skip: ["quote"] } },
  });

  it("returns no batches for undefined or empty sources", () => {
    expect(chunkBridgeBalanceSource(undefined)).toEqual([]);
    expect(chunkBridgeBalanceSource({ type: "bitcoin", assets: [] })).toEqual(
      []
    );
  });

  it("keeps a single batch unchanged when within the limit", () => {
    const source = {
      type: "evm" as const,
      userEvmAddress: "0x1234",
      assets: Array.from({ length: 10 }, (_, i) => makeAsset(i)),
    };
    const batches = chunkBridgeBalanceSource(source, 100);
    expect(batches).toHaveLength(1);
    expect(batches[0]).toBe(source);
  });

  it("splits oversized asset lists into ordered chunks preserving metadata", () => {
    const assets = Array.from({ length: 235 }, (_, i) => makeAsset(i));
    const source = {
      type: "evm" as const,
      userEvmAddress: "0xdeadbeef",
      assets,
    };

    const batches = chunkBridgeBalanceSource(
      source,
      MAX_BRIDGE_BALANCE_BATCH_SIZE
    );
    expect(batches).toHaveLength(3);
    expect(batches.map((b) => b.assets.length)).toEqual([100, 100, 35]);
    expect(batches.every((b) => b.userEvmAddress === "0xdeadbeef")).toBe(true);
    expect(batches.flatMap((b) => b.assets)).toEqual(assets);
  });

  it("selectDisplayableBalances keeps positive balances or falls back to the first asset", () => {
    const zero = (id: string) => ({
      id,
      amount: { toDec: () => ({ isPositive: () => false }) },
    });
    const positive = (id: string) => ({
      id,
      amount: { toDec: () => ({ isPositive: () => true }) },
    });

    expect(selectDisplayableBalances([])).toEqual([]);
    expect(selectDisplayableBalances([zero("a"), zero("b")])).toEqual([
      expect.objectContaining({ id: "a" }),
    ]);
    expect(
      selectDisplayableBalances([zero("a"), positive("b"), positive("c")])
    ).toEqual([
      expect.objectContaining({ id: "b" }),
      expect.objectContaining({ id: "c" }),
    ]);
  });

  it("enforces MAX_BRIDGE_BALANCE_BATCH_SIZE on the server router schema", async () => {
    const caller = localBridgeTransferRouter.createCaller({
      assetLists: [],
      chainList: [],
    });

    const oversized = Array.from(
      { length: MAX_BRIDGE_BALANCE_BATCH_SIZE + 1 },
      (_, i) => makeAsset(i)
    );
    await expect(
      caller.getSupportedAssetsBalances({
        source: { type: "bitcoin", assets: oversized },
      })
    ).rejects.toThrow();

    const exact = Array.from(
      { length: MAX_BRIDGE_BALANCE_BATCH_SIZE },
      (_, i) => makeAsset(i)
    );
    const res = await caller.getSupportedAssetsBalances({
      source: { type: "bitcoin", assets: exact },
    });
    expect(res).toHaveLength(MAX_BRIDGE_BALANCE_BATCH_SIZE);
  });
});
