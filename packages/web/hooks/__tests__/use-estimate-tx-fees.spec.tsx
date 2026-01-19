/* eslint-disable import/no-extraneous-dependencies */
import { EncodeObject } from "@cosmjs/proto-signing";
import { InsufficientBalanceForFeeError } from "@osmosis-labs/stores";
import { Dec } from "@osmosis-labs/unit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React, { PropsWithChildren } from "react";

import { useEstimateTxFees } from "../use-estimate-tx-fees";

const mockGetWallet = jest.fn();
const mockEstimateFee = jest.fn();
const mockGetChain = jest.fn();
const mockGetAssetWithPrice = jest.fn();
const mockGetUserBalances = jest.fn();

jest.mock("~/stores", () => ({
  useStore: () => ({
    accountStore: {
      getWallet: mockGetWallet,
      estimateFee: mockEstimateFee,
    },
    chainStore: {
      getChain: mockGetChain,
    },
  }),
}));

jest.mock("~/utils/trpc", () => ({
  api: {
    useUtils: () => ({
      edge: {
        assets: {
          getAssetWithPrice: {
            fetch: mockGetAssetWithPrice,
          },
        },
      },
      local: {
        balances: {
          getUserBalances: {
            fetch: mockGetUserBalances,
          },
        },
      },
    }),
  },
}));

const makeAsset = (denom: string, price = "1") => ({
  coinMinimalDenom: denom,
  coinDenom: denom.toUpperCase(),
  coinDecimals: 6,
  currentPrice: {
    toDec: () => new Dec(price),
  },
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const messages = [
  {
    typeUrl: "/osmosis.gamm.v1beta1.MsgSwapExactAmountIn",
    value: {},
  },
] as unknown as EncodeObject[];

describe("useEstimateTxFees", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetWallet.mockReturnValue({
      address: "osmo1testaddress",
      walletInfo: {},
    });

    mockGetChain.mockReturnValue({
      feeCurrencies: [
        { coinMinimalDenom: "uosmo", gasPriceStep: { high: 0.045 } },
        { coinMinimalDenom: "uion" },
      ],
    });

    mockGetAssetWithPrice.mockImplementation(
      ({ findMinDenomOrSymbol }: { findMinDenomOrSymbol: string }) =>
        Promise.resolve(makeAsset(findMinDenomOrSymbol))
    );
    mockGetUserBalances.mockResolvedValue([]);
  });

  it("returns estimated fee values when estimation succeeds", async () => {
    mockEstimateFee.mockResolvedValue({
      amount: [{ denom: "uion", amount: "1000" }],
      gas: "250000",
    });
    mockGetAssetWithPrice.mockResolvedValue(makeAsset("uion", "2"));

    const { result } = renderHook(
      () =>
        useEstimateTxFees({
          messages,
          chainId: "osmosis-1",
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.amount[0]).toEqual({
      denom: "uion",
      amount: "1000",
    });
    expect(result.current.data?.gasLimit).toBe("250000");
    expect(result.current.data?.gasAmount.currency.coinMinimalDenom).toBe(
      "uion"
    );
    expect(result.current.data?.gasAmount.toCoin().amount).toBe("1000");
    expect(result.current.data?.gasUsdValueToPay.toDec()).toEqual(
      new Dec("0.002")
    );
  });

  it("does not query when messages are empty", async () => {
    const { result } = renderHook(
      () =>
        useEstimateTxFees({
          messages: [],
          chainId: "osmosis-1",
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.data).toBeUndefined();
      expect(mockEstimateFee).not.toHaveBeenCalled();
    });
  });

  it("does not query when wallet address is missing", async () => {
    mockGetWallet.mockReturnValue({
      address: undefined,
      walletInfo: {},
    });

    const { result } = renderHook(
      () =>
        useEstimateTxFees({
          messages,
          chainId: "osmosis-1",
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.data).toBeUndefined();
      expect(mockEstimateFee).not.toHaveBeenCalled();
    });
  });

  it("uses a non-OSMO fee token in fallback when user has no OSMO balance", async () => {
    mockEstimateFee.mockRejectedValue(new Error("simulation failed"));
    mockGetUserBalances.mockResolvedValue([
      { denom: "uosmo", amount: "0" },
      { denom: "uion", amount: "100000" },
    ]);

    const { result } = renderHook(
      () =>
        useEstimateTxFees({
          messages,
          chainId: "osmosis-1",
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.amount[0].denom).toBe("uion");
  });

  it("surfaces insufficient fee balance errors instead of falling back", async () => {
    mockEstimateFee.mockRejectedValue(
      new InsufficientBalanceForFeeError("No fee tokens found")
    );
    mockGetUserBalances.mockResolvedValue([{ denom: "uosmo", amount: "0" }]);

    const { result } = renderHook(
      () =>
        useEstimateTxFees({
          messages,
          chainId: "osmosis-1",
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() =>
      expect(result.current.error).toBeInstanceOf(
        InsufficientBalanceForFeeError
      )
    );
  });
});
