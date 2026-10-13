import { act, renderHook } from "@testing-library/react";

import { POOL_CREATION_FEE_COIN } from "~/components/complex/pool/create";

import { useOrderbookCreationFlow } from "../use-orderbook-creation-flow";

// ATOM / allUSDC: real denoms, so decimals resolve from the generated asset
// list exactly as in the app.
const ATOM =
  "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";
const ALL_USDC =
  "factory/osmo147h5x9pcj7lm0cttlaefx6sqq5vdfnmwfcqxkmjd7exqm9gc7grqhr75m0/alloyed/allUSDC";

const mockCreateOrderbook = jest.fn();
const mockOpenWalletSelect = jest.fn();
let mockWallet: { address?: string; isWalletConnected: boolean } | undefined;
let mockBalances: { denom: string; amount: string }[] | undefined;
let mockGuard = { isBlocked: false, isRatioTooLow: false };

jest.mock("~/stores", () => ({
  useStore: () => ({
    accountStore: {
      osmosisChainId: "osmosis-1",
      getWallet: () => mockWallet,
    },
  }),
}));

jest.mock("~/hooks", () => ({
  useWalletSelect: () => ({ onOpenWalletSelect: mockOpenWalletSelect }),
}));

jest.mock("~/hooks/language", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("~/hooks/limit-orders/use-create-orderbook", () => ({
  useCreateOrderbook: () => ({
    createOrderbook: mockCreateOrderbook,
    isCreating: false,
    error: undefined,
    resetError: jest.fn(),
  }),
}));

jest.mock("~/hooks/limit-orders/use-orderbook-ratio-guard", () => ({
  useOrderbookRatioGuard: () => mockGuard,
}));

jest.mock("~/utils/trpc", () => ({
  api: {
    local: {
      balances: {
        getUserBalances: {
          useQuery: () => ({ data: mockBalances, isFetching: false }),
        },
      },
    },
  },
}));

function renderFlow(onCreated = jest.fn()) {
  return renderHook(() =>
    useOrderbookCreationFlow({
      baseDenom: ATOM,
      quoteDenom: ALL_USDC,
      onCreated,
    })
  );
}

describe("useOrderbookCreationFlow", () => {
  beforeEach(() => {
    mockCreateOrderbook.mockReset().mockResolvedValue(undefined);
    mockOpenWalletSelect.mockReset();
    mockWallet = { address: "osmo1user", isWalletConnected: true };
    mockBalances = [{ denom: ALL_USDC, amount: "25000000" }];
    mockGuard = { isBlocked: false, isRatioTooLow: false };
  });

  it("prechecks against the poolmanager fee: 20 allUSDC", () => {
    // Live params as of this change; update with the display string if
    // governance changes the fee.
    expect(POOL_CREATION_FEE_COIN).toEqual({
      denom: ALL_USDC,
      amount: "20000000",
    });
  });

  it("allows a balance of exactly the fee", () => {
    mockBalances = [{ denom: ALL_USDC, amount: "20000000" }];
    const { result } = renderFlow();
    expect(result.current.modalProps.blockedReason).toBeUndefined();
  });

  it("creates and reports success when every check passes", async () => {
    const onCreated = jest.fn();
    const { result } = renderFlow(onCreated);
    act(() => result.current.open());

    expect(result.current.modalProps.isConfirmPending).toBe(false);
    expect(result.current.modalProps.blockedReason).toBeUndefined();
    await act(async () => {
      await result.current.modalProps.onConfirm();
    });

    expect(mockCreateOrderbook).toHaveBeenCalledTimes(1);
    expect(onCreated).toHaveBeenCalledTimes(1);
    expect(result.current.isOpen).toBe(false);
  });

  it("blocks with a reason when the fee balance is insufficient", async () => {
    mockBalances = [{ denom: ALL_USDC, amount: "19999999" }];
    const { result } = renderFlow();
    act(() => result.current.open());

    expect(result.current.modalProps.blockedReason).toBe(
      "errors.insufficientBal"
    );
    await act(async () => {
      await result.current.modalProps.onConfirm();
    });
    expect(mockCreateOrderbook).not.toHaveBeenCalled();
    // The modal stays open with the reason instead of closing silently.
    expect(result.current.isOpen).toBe(true);
  });

  it("treats a missing fee-denom balance as zero", () => {
    mockBalances = [{ denom: "uosmo", amount: "1000000000" }];
    const { result } = renderFlow();
    expect(result.current.modalProps.blockedReason).toBe(
      "errors.insufficientBal"
    );
  });

  it("blocks with a reason when the settled price ratio is too low", async () => {
    mockGuard = { isBlocked: true, isRatioTooLow: true };
    const { result } = renderFlow();
    act(() => result.current.open());

    expect(result.current.modalProps.blockedReason).toBe(
      "limitOrders.unavailable"
    );
    await act(async () => {
      await result.current.modalProps.onConfirm();
    });
    expect(mockCreateOrderbook).not.toHaveBeenCalled();
    expect(result.current.isOpen).toBe(true);
  });

  it.each([
    [
      "the price guard is still settling",
      () => {
        mockGuard = { isBlocked: true, isRatioTooLow: false };
      },
    ],
    [
      "balances have not loaded",
      () => {
        mockBalances = undefined;
      },
    ],
  ])(
    "keeps confirm pending (and does not sign) while %s",
    async (_l, setup) => {
      setup();
      const { result } = renderFlow();
      act(() => result.current.open());

      expect(result.current.modalProps.isConfirmPending).toBe(true);
      await act(async () => {
        await result.current.modalProps.onConfirm();
      });
      expect(mockCreateOrderbook).not.toHaveBeenCalled();
    }
  );

  it("hands a disconnected user to the wallet selector instead of signing", async () => {
    mockWallet = { isWalletConnected: false };
    mockBalances = undefined;
    const { result } = renderFlow();
    act(() => result.current.open());

    await act(async () => {
      await result.current.modalProps.onConfirm();
    });
    expect(mockOpenWalletSelect).toHaveBeenCalledTimes(1);
    expect(mockCreateOrderbook).not.toHaveBeenCalled();
    expect(result.current.isOpen).toBe(false);
  });

  it("keeps the modal open when creation fails", async () => {
    mockCreateOrderbook.mockRejectedValue(new Error("rejected"));
    const onCreated = jest.fn();
    const { result } = renderFlow(onCreated);
    act(() => result.current.open());

    await act(async () => {
      await result.current.modalProps.onConfirm();
    });
    expect(onCreated).not.toHaveBeenCalled();
    expect(result.current.isOpen).toBe(true);
  });
});
