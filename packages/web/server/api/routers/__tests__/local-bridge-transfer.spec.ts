/**
 * @jest-environment node
 */
import { createCallerFactory } from "@osmosis-labs/trpc";

import { localBridgeTransferRouter } from "~/server/api/routers/local-bridge-transfer";
import { isServerFlagEnabled } from "~/utils/server-flags";

jest.mock("@osmosis-labs/server", () => ({
  ...jest.requireActual("@osmosis-labs/server"),
  getAsset: jest.fn(() => ({ coinMinimalDenom: "uusdc", coinDecimals: 6 })),
  calcAssetValue: jest.fn(() => Promise.resolve(undefined)),
}));
jest.mock("~/utils/server-flags", () => ({
  isServerFlagEnabled: jest.fn(),
}));

const OWNER = "11111111111111111111111111111111";
const MINT = "So11111111111111111111111111111111111111112";

const solanaSource = (count: number) => ({
  type: "solana" as const,
  userSolanaAddress: OWNER,
  assets: Array.from({ length: count }, (_, i) => ({
    chainId: "solana",
    chainType: "solana" as const,
    denom: `TKN${i}`,
    address: MINT,
    decimals: 6,
    transferTypes: [] as ("quote" | "external-url")[],
    supportedVariants: { uusdc: {} },
  })),
});

const caller = () =>
  createCallerFactory(localBridgeTransferRouter)({
    assetLists: [],
    chainList: [],
  } as never);

describe("getSupportedAssetsBalances (solana)", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it("does not reach the keyed RPC while the solana-skip-routes flag is off", async () => {
    jest.mocked(isServerFlagEnabled).mockResolvedValue(false);
    global.fetch = jest.fn();

    const balances = await caller().getSupportedAssetsBalances({
      source: solanaSource(3),
    });

    expect(isServerFlagEnabled).toHaveBeenCalledWith("solana-skip-routes");
    expect(global.fetch).not.toHaveBeenCalled();
    expect(balances).toHaveLength(3);
    expect(balances.every((b) => b.amount.toDec().isZero())).toBe(true);
  });

  it("limits the upstream calls in flight when the flag is on", async () => {
    jest.mocked(isServerFlagEnabled).mockResolvedValue(true);
    let inFlight = 0;
    let peak = 0;
    global.fetch = jest.fn(async () => {
      inFlight++;
      peak = Math.max(peak, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 5));
      inFlight--;
      return new Response(JSON.stringify({ result: { value: [] } }));
    }) as typeof fetch;

    const balances = await caller().getSupportedAssetsBalances({
      source: solanaSource(40),
    });

    expect(balances).toHaveLength(40);
    expect(global.fetch).toHaveBeenCalledTimes(40);
    expect(peak).toBeGreaterThan(1);
    expect(peak).toBeLessThanOrEqual(6);
  });
});
