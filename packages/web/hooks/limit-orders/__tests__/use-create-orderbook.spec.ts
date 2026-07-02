import { OrderbookPoolCodeIds } from "@osmosis-labs/server";
import { act, renderHook } from "@testing-library/react";

import { useCreateOrderbook } from "../use-create-orderbook";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

const mockInvalidateGetPools = jest.fn().mockResolvedValue(undefined);
const mockInvalidateVerify = jest.fn().mockResolvedValue(undefined);
const mockFetchVerify = jest.fn().mockResolvedValue(undefined);
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

  describe("early-exit guards", () => {
    it("does not broadcast when address is missing", async () => {
      mockWalletAddress = undefined;

      const { result } = renderHook(() =>
        useCreateOrderbook({ baseDenom: BASE_DENOM, quoteDenom: QUOTE_DENOM })
      );

      await act(async () => {
        await result.current.createOrderbook();
      });

      expect(mockSignAndBroadcast).not.toHaveBeenCalled();
      mockWalletAddress = "osmo1testaddress";
    });
  });
});
