import { MultiEndpointClient } from "@osmosis-labs/utils";

import { MockChains } from "../../__tests__/mock-chains";
import { queryRPCStatus } from "../../cosmos";
import {
  getTimeoutHeight,
  resetBlockTimeCacheForTests,
} from "../get-timeout-height";

jest.mock("../../cosmos", () => ({
  ...jest.requireActual("../../cosmos"),
  queryRPCStatus: jest.fn(),
}));

jest.mock("@osmosis-labs/utils", () => ({
  ...jest.requireActual("@osmosis-labs/utils"),
  MultiEndpointClient: jest.fn(),
}));

const LATEST_HEIGHT = 1_000_000;
const LATEST_TIME = "2026-08-10T12:00:00.000Z";

/** 15 minute target window, as configured in the module under test. */
const WINDOW_SECONDS = 15 * 60;
/** Sample size the module looks back by when measuring block time. */
const SAMPLE_SIZE = 1000;
/** Flat height offset used when block time can't be measured. */
const FALLBACK_OFFSET = 200;

function mockStatus({
  latestBlockHeight = String(LATEST_HEIGHT),
  latestBlockTime = LATEST_TIME,
  network = "osmosis-1",
}: {
  latestBlockHeight?: string;
  latestBlockTime?: string;
  network?: string;
} = {}) {
  (queryRPCStatus as jest.Mock).mockResolvedValue({
    result: {
      node_info: { network },
      sync_info: {
        latest_block_height: latestBlockHeight,
        latest_block_time: latestBlockTime,
      },
    },
  });
}

/** Heights the module samples: the start of the window and its midpoint. */
const PRIOR_HEIGHT = LATEST_HEIGHT - SAMPLE_SIZE;
const MID_HEIGHT = LATEST_HEIGHT - SAMPLE_SIZE / 2;
/** `/block` fetches made per measurement (prior and midpoint blocks). */
const FETCHES_PER_MEASUREMENT = 2;

/**
 * A chain halt: no blocks for `seconds` after block `afterHeight`, so every
 * block at or below `afterHeight` is that much older.
 */
type Halt = { afterHeight: number; seconds: number };

/** A `/block` response for `path` on a chain producing a block every `blockTimeSeconds`. */
function blockResponse(path: string, blockTimeSeconds: number, halt?: Halt) {
  const height = Number(new URLSearchParams(path.split("?")[1]).get("height"));
  const haltMs = halt && height <= halt.afterHeight ? halt.seconds * 1_000 : 0;
  const elapsedMs = (LATEST_HEIGHT - height) * blockTimeSeconds * 1_000;
  return {
    result: {
      block: {
        header: {
          time: new Date(
            new Date(LATEST_TIME).getTime() - elapsedMs - haltMs
          ).toISOString(),
        },
      },
    },
  };
}

/** Mocks the block fetches so that block time resolves to `blockTimeSeconds`. */
function mockPriorBlock(blockTimeSeconds: number | undefined, halt?: Halt) {
  (MultiEndpointClient as jest.Mock).mockReturnValue({
    fetch: jest.fn().mockImplementation(async (path: string) => {
      if (blockTimeSeconds === undefined) throw new Error("unreachable node");
      return blockResponse(path, blockTimeSeconds, halt);
    }),
  });
}

/** As {@link mockPriorBlock}, returning the fetch spy for call assertions. */
function mockPriorBlockWithSpy(blockTimeSeconds: number) {
  const fetch = jest
    .fn()
    .mockImplementation(async (path: string) =>
      blockResponse(path, blockTimeSeconds)
    );
  (MultiEndpointClient as jest.Mock).mockReturnValue({ fetch });
  return fetch;
}

/** The revisionHeight the module should return for a given block time. */
function expectedHeight(blockTimeSeconds: number) {
  return String(LATEST_HEIGHT + Math.ceil(WINDOW_SECONDS / blockTimeSeconds));
}

describe("getTimeoutHeight", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Block time is cached per chain across calls; reset so cases stay isolated.
    resetBlockTimeCacheForTests();
    mockStatus();
  });

  it("scales the offset by block time so the window is ~15 minutes", async () => {
    // Nibiru-like fast blocks: the case that previously produced a ~4.5 min window.
    mockPriorBlock(1.79);

    const result = await getTimeoutHeight({
      chainList: MockChains,
      chainId: "osmosis-1",
    });

    expect(result.revisionHeight).toBe(expectedHeight(1.79));
  });

  it("gives a slow-block chain the same wall-clock window, not the same block count", async () => {
    const slowBlockTime = 6;
    const fastBlockTime = 1.79;

    mockPriorBlock(slowBlockTime);
    const slow = await getTimeoutHeight({
      chainList: MockChains,
      chainId: "osmosis-1",
    });

    // Different chain id, so this measures afresh rather than reusing the
    // cached block time from the call above.
    mockPriorBlock(fastBlockTime);
    const fast = await getTimeoutHeight({
      chainList: MockChains,
      chainId: "cosmoshub-4",
    });

    const slowOffset = Number(slow.revisionHeight) - LATEST_HEIGHT;
    const fastOffset = Number(fast.revisionHeight) - LATEST_HEIGHT;

    // Fewer blocks on the slower chain, but the same duration.
    expect(slowOffset).toBeLessThan(fastOffset);
    expect(slowOffset * slowBlockTime).toBeCloseTo(WINDOW_SECONDS, -1);
    expect(fastOffset * fastBlockTime).toBeCloseTo(WINDOW_SECONDS, -1);
  });

  it("never returns a window shorter than the target, at any block speed", async () => {
    // A flat block count gave fast chains ~4.5 min, which stranded packets.
    for (const blockTime of [0.5, 1.79, 2, 6]) {
      // Clear per iteration, otherwise the cached block time from the previous
      // one is reused and the remaining cases assert nothing.
      resetBlockTimeCacheForTests();
      mockPriorBlock(blockTime);
      const result = await getTimeoutHeight({
        chainList: MockChains,
        chainId: "osmosis-1",
      });
      const offset = Number(result.revisionHeight) - LATEST_HEIGHT;
      expect(offset * blockTime).toBeGreaterThanOrEqual(WINDOW_SECONDS);
    }
  });

  it("caps slow chains at the target window rather than inheriting a long one", async () => {
    // A flat block count gave slow chains incidentally long windows (Babylon at
    // ~10s got ~25 min, Optio at ~60.7s got ~152 min). Those are shortened to the
    // target on purpose: a user should not wait hours to become refund-eligible.
    //
    // 60.785 is Optio's measured block time, the slowest in the chain list, and
    // is here to catch the plausibility bound being set below a real chain.
    for (const blockTime of [6.9, 10, 14.9, 60, 60.785]) {
      resetBlockTimeCacheForTests();
      mockPriorBlock(blockTime);
      const result = await getTimeoutHeight({
        chainList: MockChains,
        chainId: "osmosis-1",
      });
      const offset = Number(result.revisionHeight) - LATEST_HEIGHT;

      // Within one block of the target, in both directions.
      expect(offset * blockTime).toBeGreaterThanOrEqual(WINDOW_SECONDS);
      expect(offset * blockTime).toBeLessThan(WINDOW_SECONDS + blockTime);
    }
  });

  it("samples the prior and midpoint blocks from the chain's RPC endpoints", async () => {
    const fetch = mockPriorBlockWithSpy(1.79);

    await getTimeoutHeight({ chainList: MockChains, chainId: "osmosis-1" });

    expect(fetch).toHaveBeenCalledWith(`/block?height=${PRIOR_HEIGHT}`);
    expect(fetch).toHaveBeenCalledWith(`/block?height=${MID_HEIGHT}`);
    const osmosis = MockChains.find((c) => c.chain_id === "osmosis-1")!;
    expect(MultiEndpointClient).toHaveBeenCalledWith(
      osmosis.apis.rpc.map(({ address }) => ({ address }))
    );
  });

  it("does not shorten the window when a halt falls inside the sample", async () => {
    // A ~1.2s chain resuming from a 10h halt: averaged over the whole sample
    // this measures ~37s blocks and a ~30s window. The halt can only land in
    // one half, so the other half must win, whichever side it is on.
    const blockTime = 1.2;
    const tenHours = 10 * 60 * 60;
    for (const afterHeight of [LATEST_HEIGHT - 100, PRIOR_HEIGHT + 100]) {
      resetBlockTimeCacheForTests();
      mockPriorBlock(blockTime, { afterHeight, seconds: tenHours });

      const result = await getTimeoutHeight({
        chainList: MockChains,
        chainId: "osmosis-1",
      });

      expect(result.revisionHeight).toBe(expectedHeight(blockTime));
    }
  });

  it("uses the faster half when the chain's pace changed within the sample", async () => {
    // Older half at 6s, recent half at 1.2s (e.g. just after a block time
    // retune): the faster pace gives the longer, safe window.
    (MultiEndpointClient as jest.Mock).mockReturnValue({
      fetch: jest.fn().mockImplementation(async (path: string) => {
        const height = Number(
          new URLSearchParams(path.split("?")[1]).get("height")
        );
        const recentMs = (SAMPLE_SIZE / 2) * 1.2 * 1_000;
        const olderMs = height < MID_HEIGHT ? (SAMPLE_SIZE / 2) * 6 * 1_000 : 0;
        return {
          result: {
            block: {
              header: {
                time: new Date(
                  new Date(LATEST_TIME).getTime() - recentMs - olderMs
                ).toISOString(),
              },
            },
          },
        };
      }),
    });

    const result = await getTimeoutHeight({
      chainList: MockChains,
      chainId: "osmosis-1",
    });

    expect(result.revisionHeight).toBe(expectedHeight(1.2));
  });

  it("falls back when the latest block time is missing from status", async () => {
    mockStatus({ latestBlockTime: "" });
    mockPriorBlock(1.79);

    const result = await getTimeoutHeight({
      chainList: MockChains,
      chainId: "osmosis-1",
    });

    expect(result.revisionHeight).toBe(String(LATEST_HEIGHT + FALLBACK_OFFSET));
  });

  it("falls back to the flat offset when the prior block can't be fetched", async () => {
    // A timeout must always be set; an unset one removes the path to a refund.
    // The flat offset applies only while measurement fails, and only until the
    // short failure TTL lapses.
    mockPriorBlock(undefined);

    const result = await getTimeoutHeight({
      chainList: MockChains,
      chainId: "osmosis-1",
    });

    expect(result.revisionHeight).toBe(String(LATEST_HEIGHT + FALLBACK_OFFSET));
  });

  it("falls back when the node reports an implausible block time", async () => {
    // Clock skew or a stalled node, well beyond the slowest real chain (~60.7s).
    for (const blockTime of [121, 600, 86_400]) {
      resetBlockTimeCacheForTests();
      mockPriorBlock(blockTime);

      const result = await getTimeoutHeight({
        chainList: MockChains,
        chainId: "osmosis-1",
      });

      expect(result.revisionHeight).toBe(
        String(LATEST_HEIGHT + FALLBACK_OFFSET)
      );
    }
  });

  it("falls back when the prior block time is not older than the latest", async () => {
    // Non-monotonic timestamps would otherwise yield a zero/negative block time.
    mockPriorBlock(0);

    const result = await getTimeoutHeight({
      chainList: MockChains,
      chainId: "osmosis-1",
    });

    expect(result.revisionHeight).toBe(String(LATEST_HEIGHT + FALLBACK_OFFSET));
  });

  it("falls back when the chain is too young to sample", async () => {
    mockStatus({ latestBlockHeight: "10" });
    mockPriorBlock(1.79);

    const result = await getTimeoutHeight({
      chainList: MockChains,
      chainId: "osmosis-1",
    });

    expect(result.revisionHeight).toBe(String(10 + FALLBACK_OFFSET));
  });

  it("includes the revisionNumber parsed from the chain id", async () => {
    mockStatus({ network: "osmosis-1" });
    mockPriorBlock(1.79);

    const result = await getTimeoutHeight({
      chainList: MockChains,
      chainId: "osmosis-1",
    });

    expect(result.revisionNumber).toBe("1");
  });

  it("omits revisionNumber for a chain id without a version suffix", async () => {
    // Sending revision_number 0 would cause the transfer to fail.
    mockStatus({ network: "cataclysm" });
    mockPriorBlock(1.79);

    const result = await getTimeoutHeight({
      chainList: MockChains,
      chainId: "osmosis-1",
    });

    expect(result.revisionNumber).toBeUndefined();
  });

  it("throws when the destination chain isn't in the chain list", async () => {
    await expect(
      getTimeoutHeight({ chainList: MockChains, chainId: "not-a-chain" })
    ).rejects.toThrow("Could not find destination Cosmos chain");
  });

  describe("block time caching", () => {
    it("reuses a measured block time instead of re-querying per transfer", async () => {
      const fetch = mockPriorBlockWithSpy(1.79);

      await getTimeoutHeight({ chainList: MockChains, chainId: "osmosis-1" });
      await getTimeoutHeight({ chainList: MockChains, chainId: "osmosis-1" });
      await getTimeoutHeight({ chainList: MockChains, chainId: "osmosis-1" });

      expect(fetch).toHaveBeenCalledTimes(FETCHES_PER_MEASUREMENT);
    });

    it("still advances revisionHeight with the live block height while cached", async () => {
      mockPriorBlockWithSpy(1.79);

      mockStatus({ latestBlockHeight: String(LATEST_HEIGHT) });
      const first = await getTimeoutHeight({
        chainList: MockChains,
        chainId: "osmosis-1",
      });

      // A later transfer sees a higher tip; the cached block time must not
      // freeze the returned height, which would hand out a stale timeout.
      mockStatus({ latestBlockHeight: String(LATEST_HEIGHT + 500) });
      const second = await getTimeoutHeight({
        chainList: MockChains,
        chainId: "osmosis-1",
      });

      expect(Number(second.revisionHeight) - Number(first.revisionHeight)).toBe(
        500
      );
    });

    it("does not repeat the query while a failure is cached", async () => {
      // Every endpoint having pruned the sampled height would otherwise repeat
      // the full hedged request per quote, which costs seconds each time.
      const fetch = jest
        .fn()
        .mockRejectedValue(new Error("height is not available"));
      (MultiEndpointClient as jest.Mock).mockReturnValue({ fetch });

      const first = await getTimeoutHeight({
        chainList: MockChains,
        chainId: "osmosis-1",
      });
      const second = await getTimeoutHeight({
        chainList: MockChains,
        chainId: "osmosis-1",
      });

      expect(first.revisionHeight).toBe(
        String(LATEST_HEIGHT + FALLBACK_OFFSET)
      );
      expect(second.revisionHeight).toBe(
        String(LATEST_HEIGHT + FALLBACK_OFFSET)
      );
      expect(fetch).toHaveBeenCalledTimes(FETCHES_PER_MEASUREMENT);
    });

    it("re-measures a failure after a minute, not an hour", async () => {
      // A transient failure must not pin the chain to the fallback for the full
      // success TTL, so it is cached under a much shorter one.
      jest.useFakeTimers({ doNotFake: ["nextTick"] });
      try {
        const fetch = jest
          .fn()
          .mockRejectedValueOnce(new Error("transient RPC failure"))
          .mockImplementation(async (path: string) =>
            blockResponse(path, 1.79)
          );
        (MultiEndpointClient as jest.Mock).mockReturnValue({ fetch });

        const failed = await getTimeoutHeight({
          chainList: MockChains,
          chainId: "osmosis-1",
        });
        expect(failed.revisionHeight).toBe(
          String(LATEST_HEIGHT + FALLBACK_OFFSET)
        );

        jest.advanceTimersByTime(1000 * 61);

        const recovered = await getTimeoutHeight({
          chainList: MockChains,
          chainId: "osmosis-1",
        });
        expect(recovered.revisionHeight).toBe(expectedHeight(1.79));
      } finally {
        jest.useRealTimers();
      }
    });

    it("keeps a successful measurement well past the failure TTL", async () => {
      jest.useFakeTimers({ doNotFake: ["nextTick"] });
      try {
        const fetch = mockPriorBlockWithSpy(1.79);

        await getTimeoutHeight({ chainList: MockChains, chainId: "osmosis-1" });

        // Past the one minute failure TTL, but far short of the one hour
        // success TTL, so this must still be served from cache.
        jest.advanceTimersByTime(1000 * 60 * 5);

        await getTimeoutHeight({ chainList: MockChains, chainId: "osmosis-1" });

        expect(fetch).toHaveBeenCalledTimes(FETCHES_PER_MEASUREMENT);
      } finally {
        jest.useRealTimers();
      }
    });
  });
});
