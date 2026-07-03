import { OrderbookPoolCodeIds } from "@osmosis-labs/server";
import { act, renderHook } from "@testing-library/react";

import { useCreateOrderbook } from "../use-create-orderbook";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const mockInvalidateGetPools = jest.fn().mockResolvedValue(undefined);
const mockInvalidateVerify = jest.fn().mockResolvedValue(undefined);
// Matches the real verifyOrderbookCreation response shape; orderbookExists
// true so the post-create refresh's sidecar-catch-up retry loop exits on the
// first attempt.
const mockFetchVerify = jest.fn().mockResolvedValue({
  orderbookExists: true,
  endpointFunctional: true,
});
const mockSignAndBroadcast = jest.fn();

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

/** Capture the msg passed to signAndBroadcast and resolve the tx callback with success. */
function mockBroadcastSuccess() {
  mockSignAndBroadcast.mockImplementation(
    async (
      _chainId: string,
      _type: string,
      _msgs: unknown[],
      _memo: unknown,
      _fee: unknown,
      _signOpts: unknown,
      onFulfill: (tx: { code: number }) => Promise<void>
    ) => {
      await onFulfill({ code: 0 });
    }
  );
}

function mockBroadcastFailure(error: Error) {
  mockSignAndBroadcast.mockRejectedValue(error);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useCreateOrderbook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // The just-created registry persists to localStorage (so a page reload
    // can't re-offer a paid creation); clear it or the duplicate-broadcast
    // gate short-circuits every test after the first success.
    window.localStorage.clear();
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
      mockSignAndBroadcast.mockImplementation(
        async (
          _chainId: string,
          _type: string,
          _msgs: unknown[],
          _memo: unknown,
          _fee: unknown,
          _signOpts: unknown,
          onFulfill: (tx: { code: number; rawLog?: string }) => Promise<void>
        ) => {
          await onFulfill({ code: 5, rawLog: "out of gas" });
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

      // A failed delivery must not arm the duplicate-broadcast gate.
      await act(async () => {
        await result.current.createOrderbook().catch(() => {});
      });
      expect(mockSignAndBroadcast).toHaveBeenCalledTimes(2);
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
      expect(mockFetchVerify).toHaveBeenCalledTimes(2);
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
      // Arm an in-flight ("pending") mark: a broadcast that never settles.
      mockSignAndBroadcast.mockReturnValue(new Promise(() => {}));
      const first = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );
      act(() => {
        void first.result.current.createOrderbook();
      });

      // A concurrent confirm sees the pending mark; the pool never appears,
      // so the refresh-only path must reject rather than report success.
      mockFetchVerify.mockResolvedValue({
        orderbookExists: false,
        endpointFunctional: true,
      });
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

      // Restore the default for subsequent tests.
      mockFetchVerify.mockResolvedValue({
        orderbookExists: true,
        endpointFunctional: true,
      });
    }, 15_000); // the not-found refresh path sleeps between its retry attempts

    it("resolves the flow even when the post-create cache refresh fails", async () => {
      mockBroadcastSuccess();
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
      mockWalletAddress = "osmo1testaddress";
    });
  });
});
