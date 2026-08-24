import { OrderbookPoolCodeIds } from "@osmosis-labs/server";
import { act, renderHook } from "@testing-library/react";

import {
  __resetJustCreatedOrderbooksForTesting,
  useCreateOrderbook,
  wasOrderbookJustCreated,
} from "../use-create-orderbook";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const mockInvalidateGetPools = jest.fn().mockResolvedValue(undefined);
const mockInvalidateVerify = jest.fn().mockResolvedValue(undefined);
const mockFetchVerify = jest.fn();
const mockFetchTxStatus = jest.fn();
const mockSignAndBroadcast = jest.fn();

// Matches the real verifyOrderbookCreation response shape.
const PAIR_ABSENT = { orderbookExists: false, endpointFunctional: true };
const PAIR_PRESENT = { orderbookExists: true, endpointFunctional: true };

let mockWalletAddress: string | undefined = "osmo1testaddress";

jest.mock("~/stores", () => ({
  useStore: () => ({
    accountStore: {
      osmosisChainId: "osmosis-1",
      getWallet: () => ({ address: mockWalletAddress }),
      signAndBroadcast: mockSignAndBroadcast,
    },
  }),
}));

jest.mock("~/utils/trpc", () => ({
  api: {
    useUtils: () => ({
      edge: {
        orderbooks: {
          getPools: { invalidate: mockInvalidateGetPools },
          verifyOrderbookCreation: {
            invalidate: mockInvalidateVerify,
            fetch: mockFetchVerify,
          },
          getCreateOrderbookTxStatus: {
            fetch: mockFetchTxStatus,
          },
        },
      },
    }),
  },
}));

jest.mock("~/hooks/language", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Stub getOsmosisCodec — returns enough structure for MsgCreateCosmWasmPool
jest.mock("@osmosis-labs/tx", () => ({
  getOsmosisCodec: async () => ({
    cosmwasmpool: {
      v1beta1: {
        MsgCreateCosmWasmPool: {
          fromPartial: (v: unknown) => v,
        },
      },
    },
  }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_DENOM = "uatom";
const QUOTE_DENOM =
  "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";

type OnTxEvents = {
  onSign?: () => Promise<void> | void;
  onBroadcasted?: (txHash: Uint8Array) => void;
  onFulfill?: (tx: { code: number; rawLog?: string }) => Promise<void> | void;
};

/** Capture the msg passed to signAndBroadcast and resolve the tx lifecycle with success. */
function mockBroadcastSuccess() {
  mockSignAndBroadcast.mockImplementation(
    async (
      _chainId: string,
      _type: string,
      _msgs: unknown[],
      _memo: unknown,
      _fee: unknown,
      _signOpts: unknown,
      onTxEvents: OnTxEvents
    ) => {
      // Mirrors the real pipeline: onSign after wallet approval (a throw here
      // aborts the broadcast), then acceptance, then delivery.
      await onTxEvents.onSign?.();
      onTxEvents.onBroadcasted?.(new Uint8Array());
      await onTxEvents.onFulfill?.({ code: 0 });
    }
  );
}

function mockBroadcastFailure(error: Error) {
  mockSignAndBroadcast.mockRejectedValue(error);
}

/** Drain the pre-broadcast await chain (preflight fetch, codec load). */
const flushAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useCreateOrderbook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // The just-created registry persists to localStorage AND an in-memory
    // mirror (so a page reload or a storage-denied browser can't re-offer a
    // paid creation); clear both or the duplicate-broadcast gate
    // short-circuits every test after the first success.
    window.localStorage.clear();
    __resetJustCreatedOrderbooksForTesting();
    // Default verify sequencing: the early preflight AND the post-approval
    // onSign recheck see the pair as absent (so creation proceeds), and every
    // later fresh read (the post-create refresh's sidecar-catch-up loop) sees
    // it present so the retry loop exits on the first attempt.
    mockFetchVerify
      .mockReset()
      .mockResolvedValueOnce(PAIR_ABSENT)
      .mockResolvedValueOnce(PAIR_ABSENT)
      .mockResolvedValue(PAIR_PRESENT);
    // A broadcast-accepted tx's node lookup defaults to notFound (delivery
    // unproven), the direction that keeps duplicate protection.
    mockFetchTxStatus.mockReset().mockResolvedValue({ status: "notFound" });
  });

  describe("createOrderbook — instantiate message", () => {
    it("encodes base_denom and quote_denom into the instantiate message", async () => {
      mockBroadcastSuccess();

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );

      await act(async () => {
        await result.current.createOrderbook();
      });

      expect(mockSignAndBroadcast).toHaveBeenCalledTimes(1);
      const [, , msgs] = mockSignAndBroadcast.mock.calls[0] as [
        string,
        string,
        Array<{ typeUrl: string; value: { instantiateMsg: Uint8Array } }>
      ];

      const msg = msgs[0];
      expect(msg.typeUrl).toBe(
        "/osmosis.cosmwasmpool.v1beta1.MsgCreateCosmWasmPool"
      );

      const decoded = JSON.parse(
        new TextDecoder().decode(msg.value.instantiateMsg)
      );
      expect(decoded).toEqual({
        base_denom: BASE_DENOM,
        quote_denom: QUOTE_DENOM,
      });
    });

    it("uses the correct orderbook code ID", async () => {
      mockBroadcastSuccess();

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );

      await act(async () => {
        await result.current.createOrderbook();
      });

      const [, , msgs] = mockSignAndBroadcast.mock.calls[0] as [
        string,
        string,
        Array<{ typeUrl: string; value: { codeId: bigint } }>
      ];

      expect(msgs[0].value.codeId).toBe(BigInt(OrderbookPoolCodeIds[0]));
    });
  });

  describe("createOrderbook — success path", () => {
    it("invalidates getPools and verifyOrderbookCreation caches on success", async () => {
      mockBroadcastSuccess();

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );

      await act(async () => {
        await result.current.createOrderbook();
      });

      expect(mockInvalidateGetPools).toHaveBeenCalledTimes(1);
      expect(mockFetchVerify).toHaveBeenCalledWith({
        baseDenom: BASE_DENOM,
        quoteDenom: QUOTE_DENOM,
        fresh: true,
      });
    });

    it("sets isCreating to true during broadcast and false after", async () => {
      let resolveBroadcast!: () => void;
      mockSignAndBroadcast.mockReturnValue(
        new Promise<void>((resolve) => {
          resolveBroadcast = resolve;
        })
      );

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );

      expect(result.current.isCreating).toBe(false);

      // Kick off without awaiting
      act(() => {
        result.current.createOrderbook();
      });

      // Should be creating now
      expect(result.current.isCreating).toBe(true);

      await act(async () => {
        resolveBroadcast();
      });

      expect(result.current.isCreating).toBe(false);
    });
  });

  describe("createOrderbook — pre-broadcast verification", () => {
    it("resolves without broadcasting when the pair already exists at confirmation", async () => {
      // Another user created the pair since the UI's cached verification was
      // populated; the fresh preflight must catch it instead of broadcasting
      // a duplicate paid creation.
      mockBroadcastSuccess();
      mockFetchVerify.mockReset().mockResolvedValue(PAIR_PRESENT);

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );

      // The goal state (orderbook exists) is reached, so this is a success.
      await act(async () => {
        await result.current.createOrderbook();
      });

      expect(mockSignAndBroadcast).not.toHaveBeenCalled();
      // Client caches refresh so the existing orderbook becomes visible.
      expect(mockInvalidateGetPools).toHaveBeenCalledTimes(1);

      // The pair is marked, so a re-confirm stays broadcast-free too.
      await act(async () => {
        await result.current.createOrderbook();
      });
      expect(mockSignAndBroadcast).not.toHaveBeenCalled();
    });

    it("fails closed when the preflight verification cannot complete", async () => {
      mockBroadcastSuccess();
      mockFetchVerify
        .mockReset()
        .mockRejectedValueOnce(new Error("sidecar down"));

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );

      let thrown: unknown;
      await act(async () => {
        await result.current.createOrderbook().catch((e) => {
          thrown = e;
        });
      });

      expect(thrown).toBeInstanceOf(Error);
      expect(mockSignAndBroadcast).not.toHaveBeenCalled();
      expect(result.current.error).toBeDefined();

      // The failed attempt released its in-flight mark: once verification
      // recovers, a retry broadcasts normally.
      mockFetchVerify
        .mockResolvedValueOnce(PAIR_ABSENT)
        .mockResolvedValueOnce(PAIR_ABSENT)
        .mockResolvedValue(PAIR_PRESENT);
      await act(async () => {
        await result.current.createOrderbook();
      });
      expect(mockSignAndBroadcast).toHaveBeenCalledTimes(1);
    });

    it("fails closed when the orderbook endpoint is not functional", async () => {
      mockBroadcastSuccess();
      mockFetchVerify.mockReset().mockResolvedValue({
        orderbookExists: false,
        endpointFunctional: false,
      });

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );

      let thrown: unknown;
      await act(async () => {
        await result.current.createOrderbook().catch((e) => {
          thrown = e;
        });
      });

      expect(thrown).toBeInstanceOf(Error);
      expect(mockSignAndBroadcast).not.toHaveBeenCalled();
    });
  });

  describe("createOrderbook — post-approval recheck (onSign)", () => {
    it("aborts the broadcast and settles as success when the pair appears during wallet approval", async () => {
      // The pair is absent at the early preflight, but another user creates
      // it while this user sits on the wallet prompt. The onSign recheck
      // (after approval, before broadcast) must catch it: the signed tx is
      // discarded, no fee is spent, and the flow resolves as success since
      // the goal state (orderbook exists) is reached.
      mockBroadcastSuccess();
      mockFetchVerify
        .mockReset()
        .mockResolvedValueOnce(PAIR_ABSENT) // early preflight
        .mockResolvedValue(PAIR_PRESENT); // onSign recheck onward

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );

      await act(async () => {
        await result.current.createOrderbook();
      });
      expect(result.current.error).toBeUndefined();
      // Client caches refresh so the existing orderbook becomes visible.
      expect(mockInvalidateGetPools).toHaveBeenCalledTimes(1);

      // The pair is marked created, so a re-confirm stays broadcast-free.
      await act(async () => {
        await result.current.createOrderbook();
      });
      expect(mockSignAndBroadcast).toHaveBeenCalledTimes(1);
    });

    it("fails closed and releases the pair when the post-approval recheck cannot complete", async () => {
      mockBroadcastSuccess();
      mockFetchVerify
        .mockReset()
        .mockResolvedValueOnce(PAIR_ABSENT) // early preflight
        .mockRejectedValueOnce(new Error("sidecar down")); // onSign recheck

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );

      let thrown: unknown;
      await act(async () => {
        await result.current.createOrderbook().catch((e) => {
          thrown = e;
        });
      });
      expect(thrown).toBeInstanceOf(Error);
      expect(result.current.error).toBeDefined();

      // Nothing was broadcast, so the in-flight mark was rolled back: a
      // retry once verification recovers broadcasts normally.
      mockFetchVerify
        .mockResolvedValueOnce(PAIR_ABSENT)
        .mockResolvedValueOnce(PAIR_ABSENT)
        .mockResolvedValue(PAIR_PRESENT);
      await act(async () => {
        await result.current.createOrderbook();
      });
      expect(mockSignAndBroadcast).toHaveBeenCalledTimes(2);
    });
  });

  describe("createOrderbook — cross-tab coordination", () => {
    it("refuses to start when another tab holds the pair's creation lock", async () => {
      // Simulate the Web Locks API reporting the per-pair lock as held
      // elsewhere (ifAvailable grants null).
      Object.defineProperty(window.navigator, "locks", {
        configurable: true,
        value: {
          request: (
            _name: string,
            _opts: unknown,
            cb: (lock: unknown) => unknown
          ) => Promise.resolve(cb(null)),
        },
      });
      try {
        mockBroadcastSuccess();

        const { result } = renderHook(() =>
          useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
        );

        let thrown: unknown;
        await act(async () => {
          await result.current.createOrderbook().catch((e) => {
            thrown = e;
          });
        });
        expect(thrown).toBeInstanceOf(Error);
        expect(mockSignAndBroadcast).not.toHaveBeenCalled();
        expect(mockFetchVerify).not.toHaveBeenCalled();
        expect(result.current.error).toBeDefined();
      } finally {
        delete (window.navigator as { locks?: unknown }).locks;
      }
    });

    it("does not let a delivered failure clear another attempt's created mark", async () => {
      // Residual race: this attempt broadcasts, and while it awaits delivery
      // a concurrent attempt's tx delivers successfully and upgrades the
      // shared entry to "created". This attempt's delivered FAILURE must not
      // strip that protection (the clear is owner-scoped).
      mockFetchVerify.mockReset().mockResolvedValue(PAIR_ABSENT);
      let releaseDelivery!: () => void;
      const deliveryGate = new Promise<void>((resolve) => {
        releaseDelivery = resolve;
      });
      mockSignAndBroadcast.mockImplementation(
        async (
          _chainId: string,
          _type: string,
          _msgs: unknown[],
          _memo: unknown,
          _fee: unknown,
          _signOpts: unknown,
          onTxEvents: OnTxEvents
        ) => {
          await onTxEvents.onSign?.();
          onTxEvents.onBroadcasted?.(new Uint8Array());
          await deliveryGate;
          await onTxEvents.onFulfill?.({ code: 5, rawLog: "out of gas" });
        }
      );

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );

      let attempt!: Promise<unknown>;
      await act(async () => {
        attempt = result.current.createOrderbook().catch(() => {});
        await flushAsync();
      });

      // Another attempt's delivered success lands while ours awaits delivery.
      window.localStorage.setItem(
        `just-created-orderbook:${JSON.stringify(
          [BASE_DENOM, QUOTE_DENOM].sort()
        )}`,
        JSON.stringify({
          t: Date.now(),
          s: "created",
          o: "another-attempt",
        })
      );

      await act(async () => {
        releaseDelivery();
        await attempt;
      });

      // The created mark survives our failure: a re-confirm is refresh-only.
      await act(async () => {
        await result.current.createOrderbook();
      });
      expect(mockSignAndBroadcast).toHaveBeenCalledTimes(1);
    }, 20_000); // the all-absent refresh loop sleeps between retry attempts

    it("keeps per-pair marks independent (no cross-pair lost updates)", async () => {
      mockBroadcastSuccess();

      const first = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );
      await act(async () => {
        await first.result.current.createOrderbook();
      });

      // A second pair's full creation must not clobber the first pair's
      // protection (each pair persists under its own storage key).
      mockFetchVerify
        .mockReset()
        .mockResolvedValueOnce(PAIR_ABSENT)
        .mockResolvedValueOnce(PAIR_ABSENT)
        .mockResolvedValue(PAIR_PRESENT);
      const second = renderHook(() =>
        useCreateOrderbook({ baseDenom: "uosmo", quoteDenom: QUOTE_DENOM })
      );
      await act(async () => {
        await second.result.current.createOrderbook();
      });

      expect(mockSignAndBroadcast).toHaveBeenCalledTimes(2);
      expect(wasOrderbookJustCreated(BASE_DENOM, QUOTE_DENOM)).toBe(true);
      expect(wasOrderbookJustCreated("uosmo", QUOTE_DENOM)).toBe(true);
    });
  });

  describe("createOrderbook — broadcasted-mark reconciliation by tx hash", () => {
    const writeBroadcastedEntry = (ageMs = 0) =>
      window.localStorage.setItem(
        `just-created-orderbook:${JSON.stringify(
          [BASE_DENOM, QUOTE_DENOM].sort()
        )}`,
        JSON.stringify({
          t: Date.now() - ageMs,
          s: "broadcasted",
          o: "another-attempt",
          h: "abcd",
        })
      );

    it("settles as success when the node shows the broadcasted tx delivered", async () => {
      // A prior attempt broadcast and its tab died before observing delivery.
      // The node's tx endpoint (not the possibly-lagging SQS list) proves the
      // pool exists, so a confirm resolves without another paid broadcast.
      writeBroadcastedEntry();
      mockFetchTxStatus.mockReset().mockResolvedValue({ status: "delivered" });
      mockFetchVerify.mockReset().mockResolvedValue(PAIR_PRESENT);
      mockBroadcastSuccess();

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );
      await act(async () => {
        await result.current.createOrderbook();
      });

      expect(mockFetchTxStatus).toHaveBeenCalledWith({ txHash: "abcd" });
      expect(mockSignAndBroadcast).not.toHaveBeenCalled();
      expect(mockInvalidateGetPools).toHaveBeenCalledTimes(1);
      expect(result.current.error).toBeUndefined();
    });

    it("releases a provably failed tx and proceeds to a fresh creation", async () => {
      // The node shows the prior broadcast delivered with a non-zero code:
      // no pool exists, so the pair is released and this confirm creates.
      writeBroadcastedEntry();
      mockFetchTxStatus
        .mockReset()
        .mockResolvedValue({ status: "failed", code: 5, rawLog: "out of gas" });
      mockBroadcastSuccess();

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );
      await act(async () => {
        await result.current.createOrderbook();
      });

      expect(mockSignAndBroadcast).toHaveBeenCalledTimes(1);
      expect(result.current.error).toBeUndefined();
    });

    it("still reconciles an aged broadcasted mark instead of silently releasing it", async () => {
      // Well past the old 10-minute expiry: the entry must remain readable so
      // the hash is queried, and a delivered tx settles as success rather
      // than the expiry re-arming a duplicate paid creation.
      writeBroadcastedEntry(15 * 60 * 1000);
      mockFetchTxStatus.mockReset().mockResolvedValue({ status: "delivered" });
      mockFetchVerify.mockReset().mockResolvedValue(PAIR_PRESENT);
      mockBroadcastSuccess();

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );
      await act(async () => {
        await result.current.createOrderbook();
      });

      expect(mockFetchTxStatus).toHaveBeenCalledWith({ txHash: "abcd" });
      expect(mockSignAndBroadcast).not.toHaveBeenCalled();
      expect(result.current.error).toBeUndefined();
    });

    it("releases an unfound tx only after the inclusion window has provably passed", async () => {
      // Aged past the timeout-height window AND not found on the node: the
      // tx can never be included, so the pair releases into a fresh attempt.
      writeBroadcastedEntry(15 * 60 * 1000);
      mockFetchTxStatus.mockReset().mockResolvedValue({ status: "notFound" });
      mockBroadcastSuccess();

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );
      await act(async () => {
        await result.current.createOrderbook();
      });

      expect(mockSignAndBroadcast).toHaveBeenCalledTimes(1);
      expect(result.current.error).toBeUndefined();
    });

    it("keeps protecting a fresh broadcasted mark whose tx is not yet found", async () => {
      // Within the inclusion window, notFound proves nothing (the tx may be
      // in the next block): the confirm must reject, not rebroadcast.
      writeBroadcastedEntry();
      mockFetchTxStatus.mockReset().mockResolvedValue({ status: "notFound" });
      mockFetchVerify.mockReset().mockResolvedValue(PAIR_ABSENT);
      mockBroadcastSuccess();

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );
      let thrown: unknown;
      await act(async () => {
        await result.current.createOrderbook().catch((e) => {
          thrown = e;
        });
      });

      expect(thrown).toBeInstanceOf(Error);
      expect(mockSignAndBroadcast).not.toHaveBeenCalled();
    }, 15_000); // the all-absent refresh gate sleeps between retry attempts
  });

  describe("createOrderbook — error path", () => {
    it("re-throws so callers can detect failure", async () => {
      mockBroadcastFailure(new Error("broadcast failed"));

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );

      await expect(
        act(async () => {
          await result.current.createOrderbook();
        })
      ).rejects.toThrow("broadcast failed");
    });

    it("sets isCreating back to false after an error", async () => {
      mockBroadcastFailure(new Error("broadcast failed"));

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );

      await act(async () => {
        await result.current.createOrderbook().catch(() => {});
      });

      expect(result.current.isCreating).toBe(false);
    });

    it("does not invalidate caches when broadcast fails", async () => {
      mockBroadcastFailure(new Error("broadcast failed"));

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );

      await act(async () => {
        await result.current.createOrderbook().catch(() => {});
      });

      expect(mockInvalidateGetPools).not.toHaveBeenCalled();
      expect(mockInvalidateVerify).not.toHaveBeenCalled();
    });
  });

  describe("createOrderbook — delivered tx failure", () => {
    it("rejects with the raw log when the delivered tx has a non-zero code", async () => {
      // Both attempts below must preflight through an absent pair.
      mockFetchVerify.mockReset().mockResolvedValue(PAIR_ABSENT);
      mockSignAndBroadcast.mockImplementation(
        async (
          _chainId: string,
          _type: string,
          _msgs: unknown[],
          _memo: unknown,
          _fee: unknown,
          _signOpts: unknown,
          onTxEvents: OnTxEvents
        ) => {
          await onTxEvents.onSign?.();
          onTxEvents.onBroadcasted?.(new Uint8Array());
          await onTxEvents.onFulfill?.({ code: 5, rawLog: "out of gas" });
        }
      );

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );

      // Capture the rejection inside act: letting the act promise itself
      // reject poisons the shared test renderer for subsequent renderHooks.
      let thrown: unknown;
      await act(async () => {
        await result.current.createOrderbook().catch((e) => {
          thrown = e;
        });
      });
      expect(thrown).toBeInstanceOf(Error);
      expect((thrown as Error).message).toContain("out of gas");

      // A failed delivery must not arm the duplicate-broadcast gate, even
      // though the tx was broadcast-accepted before it failed.
      await act(async () => {
        await result.current.createOrderbook().catch(() => {});
      });
      expect(mockSignAndBroadcast).toHaveBeenCalledTimes(2);
    });
  });

  describe("createOrderbook — broadcast accepted, delivery unknown", () => {
    it("resolves as success when tracing fails but the pool is already visible", async () => {
      // CheckTx accepted, then the tx tracer fails: signAndBroadcast rejects
      // even though the tx landed. The reconcile verify sees the pool, so the
      // flow is a success and the pair is marked created.
      mockSignAndBroadcast.mockImplementation(
        async (
          _chainId: string,
          _type: string,
          _msgs: unknown[],
          _memo: unknown,
          _fee: unknown,
          _signOpts: unknown,
          onTxEvents: OnTxEvents
        ) => {
          await onTxEvents.onSign?.();
          onTxEvents.onBroadcasted?.(new Uint8Array());
          throw new Error("tx tracing failed");
        }
      );

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );

      await act(async () => {
        await result.current.createOrderbook();
      });
      expect(result.current.error).toBeUndefined();
      expect(mockSignAndBroadcast).toHaveBeenCalledTimes(1);

      // Marked created: a re-confirm is refresh-only.
      await act(async () => {
        await result.current.createOrderbook();
      });
      expect(mockSignAndBroadcast).toHaveBeenCalledTimes(1);
    });

    it("keeps the duplicate gate when tracing fails and the pool is not yet visible", async () => {
      // CheckTx accepted, tracer fails, and the sidecar has not (yet) seen
      // the pool. The tx can still land, so the mark must survive the error
      // and a re-confirm must NOT broadcast a second paid creation.
      mockFetchVerify.mockReset().mockResolvedValue(PAIR_ABSENT);
      mockSignAndBroadcast.mockImplementation(
        async (
          _chainId: string,
          _type: string,
          _msgs: unknown[],
          _memo: unknown,
          _fee: unknown,
          _signOpts: unknown,
          onTxEvents: OnTxEvents
        ) => {
          await onTxEvents.onSign?.();
          onTxEvents.onBroadcasted?.(new Uint8Array());
          throw new Error("tx tracing failed");
        }
      );

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );

      let thrown: unknown;
      await act(async () => {
        await result.current.createOrderbook().catch((e) => {
          thrown = e;
        });
      });
      expect(thrown).toBeInstanceOf(Error);

      // The re-confirm hits the "broadcasted" mark: refresh-only, and since
      // the pool still is not visible it rejects rather than re-broadcasting.
      let rethrown: unknown;
      await act(async () => {
        await result.current.createOrderbook().catch((e) => {
          rethrown = e;
        });
      });
      expect(rethrown).toBeInstanceOf(Error);
      expect(mockSignAndBroadcast).toHaveBeenCalledTimes(1);
    }, 30_000); // both the reconcile and the refresh-only retry loops sleep between attempts

    it("still invalidates caches via the reconcile after a trace failure", async () => {
      mockSignAndBroadcast.mockImplementation(
        async (
          _chainId: string,
          _type: string,
          _msgs: unknown[],
          _memo: unknown,
          _fee: unknown,
          _signOpts: unknown,
          onTxEvents: OnTxEvents
        ) => {
          await onTxEvents.onSign?.();
          onTxEvents.onBroadcasted?.(new Uint8Array());
          throw new Error("tx tracing failed");
        }
      );

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );

      await act(async () => {
        await result.current.createOrderbook();
      });
      expect(mockInvalidateGetPools).toHaveBeenCalledTimes(1);
    });
  });

  describe("createOrderbook — duplicate-broadcast gate", () => {
    it("does not broadcast a second creation for a just-created pair", async () => {
      mockBroadcastSuccess();

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );

      await act(async () => {
        await result.current.createOrderbook();
      });
      expect(mockSignAndBroadcast).toHaveBeenCalledTimes(1);

      // A re-confirm becomes a cache-refresh retry, not another paid tx.
      await act(async () => {
        await result.current.createOrderbook();
      });
      expect(mockSignAndBroadcast).toHaveBeenCalledTimes(1);
      // preflight + onSign recheck + post-create refresh + re-confirm refresh
      expect(mockFetchVerify).toHaveBeenCalledTimes(4);
    });

    it("gates the reversed orientation of a just-created pair", async () => {
      mockBroadcastSuccess();

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );
      await act(async () => {
        await result.current.createOrderbook();
      });
      expect(mockSignAndBroadcast).toHaveBeenCalledTimes(1);

      // One orderbook serves both orientations (the verify endpoint matches
      // base and quote swapped), so the reversed pair must not broadcast.
      const reversed = renderHook(() =>
        useCreateOrderbook({ baseDenom: QUOTE_DENOM, quoteDenom: BASE_DENOM })
      );
      await act(async () => {
        await reversed.result.current.createOrderbook();
      });
      expect(mockSignAndBroadcast).toHaveBeenCalledTimes(1);
    });

    it("rejects a refresh-only confirm while a pending pair has not landed", async () => {
      // Arm an in-flight ("pending") mark: a broadcast that stays open, as if
      // the wallet approval prompt were sitting unanswered.
      let rejectBroadcast!: (e: Error) => void;
      mockSignAndBroadcast.mockReturnValue(
        new Promise((_resolve, reject) => {
          rejectBroadcast = reject;
        })
      );
      // The first attempt's preflight and the second attempt's refresh-only
      // retries must all see the pair as absent.
      mockFetchVerify.mockReset().mockResolvedValue(PAIR_ABSENT);

      const first = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );
      let firstAttempt!: Promise<unknown>;
      await act(async () => {
        firstAttempt = first.result.current.createOrderbook().catch(() => {});
        // Drain the preflight/codec chain so the pending mark is armed and
        // the (hanging) broadcast has been issued.
        await flushAsync();
      });
      expect(mockSignAndBroadcast).toHaveBeenCalledTimes(1);

      // A concurrent confirm sees the pending mark; the pool never appears,
      // so the refresh-only path must reject rather than report success.
      const second = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );
      let thrown: unknown;
      await act(async () => {
        await second.result.current.createOrderbook().catch((e) => {
          thrown = e;
        });
      });

      expect(thrown).toBeInstanceOf(Error);
      // Only the first (hanging) broadcast was ever sent.
      expect(mockSignAndBroadcast).toHaveBeenCalledTimes(1);

      // Settle the hanging broadcast so the attempt's heartbeat interval is
      // cleared and nothing leaks into later tests.
      await act(async () => {
        rejectBroadcast(new Error("aborted"));
        await firstAttempt;
      });
    }, 20_000); // the not-found refresh path sleeps between its retry attempts

    it("resolves the flow even when the post-create cache refresh fails", async () => {
      mockBroadcastSuccess();
      // Queue after the beforeEach preflight entry: the post-create refresh's
      // first fresh read fails.
      mockFetchVerify.mockRejectedValueOnce(new Error("network down"));

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );

      // The creation succeeded onchain; a refetch failure must not reject.
      await act(async () => {
        await result.current.createOrderbook();
      });
      expect(result.current.error).toBeUndefined();
      // The gate is armed even though the refresh failed.
      await act(async () => {
        await result.current.createOrderbook();
      });
      expect(mockSignAndBroadcast).toHaveBeenCalledTimes(1);
    });

    it("keeps gating duplicates when localStorage writes are denied", async () => {
      // Privacy mode / quota: persistence is unavailable, so protection
      // degrades to the in-memory mirror — but must not disappear.
      const setItemSpy = jest
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new Error("quota exceeded");
        });
      try {
        mockBroadcastSuccess();

        const { result } = renderHook(() =>
          useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
        );

        await act(async () => {
          await result.current.createOrderbook();
        });
        expect(mockSignAndBroadcast).toHaveBeenCalledTimes(1);

        // The in-memory registry alone gates the re-confirm.
        await act(async () => {
          await result.current.createOrderbook();
        });
        expect(mockSignAndBroadcast).toHaveBeenCalledTimes(1);
      } finally {
        setItemSpy.mockRestore();
      }
    });
  });

  describe("early-exit guards", () => {
    it("throws without broadcasting when address is missing", async () => {
      mockWalletAddress = undefined;

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );

      // Precondition violations reject (callers treat a resolved
      // createOrderbook as success), captured inside act.
      let thrown: unknown;
      await act(async () => {
        await result.current.createOrderbook().catch((e) => {
          thrown = e;
        });
      });

      expect(thrown).toBeInstanceOf(Error);
      expect(mockSignAndBroadcast).not.toHaveBeenCalled();
      // The guard also surfaces a user-facing error so the confirm modal
      // never sits open with no explanation.
      expect(result.current.error).toBeDefined();
      mockWalletAddress = "osmo1testaddress";
    });
  });
});
