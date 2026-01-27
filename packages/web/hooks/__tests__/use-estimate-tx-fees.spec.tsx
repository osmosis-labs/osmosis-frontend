/* eslint-disable import/no-extraneous-dependencies */
import { EncodeObject } from "@cosmjs/proto-signing";
import { InsufficientBalanceForFeeError } from "@osmosis-labs/stores";
import {
  getFallbackFeeAmountFromBalances,
  InsufficientFeeError,
} from "@osmosis-labs/tx";
import { Dec, DecUtils } from "@osmosis-labs/unit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import React, { PropsWithChildren } from "react";

import { useEstimateTxFees } from "../use-estimate-tx-fees";

const mockGetWallet = jest.fn();
const mockEstimateFee = jest.fn();
const mockGetChain = jest.fn();
const mockGetAssetWithPrice = jest.fn();
const mockGetUserBalances = jest.fn();

jest.mock("@osmosis-labs/tx", () => {
  const actual = jest.requireActual("@osmosis-labs/tx");
  return {
    ...actual,
    getFallbackFeeAmountFromBalances: jest.fn(
      actual.getFallbackFeeAmountFromBalances
    ),
  };
});

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

const mockGetFallbackFeeAmountFromBalances =
  getFallbackFeeAmountFromBalances as jest.MockedFunction<
    typeof getFallbackFeeAmountFromBalances
  >;

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

  it("uses the fallback denom to compute usd value", async () => {
    const fallbackDenom = "uion-unique";
    mockGetChain.mockReturnValueOnce({
      feeCurrencies: [
        { coinMinimalDenom: "uosmo", gasPriceStep: { high: 0.045 } },
        { coinMinimalDenom: fallbackDenom },
      ],
    });
    mockEstimateFee.mockRejectedValue(new Error("simulation failed"));
    mockGetUserBalances.mockResolvedValue([
      { denom: "uosmo", amount: "0" },
      { denom: fallbackDenom, amount: "100" },
    ]);
    mockGetAssetWithPrice.mockImplementation(
      ({ findMinDenomOrSymbol }: { findMinDenomOrSymbol: string }) =>
        Promise.resolve(
          makeAsset(
            findMinDenomOrSymbol,
            findMinDenomOrSymbol === fallbackDenom ? "100000000" : "1"
          )
        )
    );

    const { result } = renderHook(
      () =>
        useEstimateTxFees({
          messages,
          chainId: "osmosis-1",
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.amount[0].denom).toBe(fallbackDenom);

    const expectedUsdValue = new Dec("1")
      .quo(DecUtils.getTenExponentN(6))
      .mul(new Dec("100000000"));
    expect(result.current.data?.gasUsdValueToPay.toDec()).toEqual(
      expectedUsdValue
    );
  });

  it("falls back to uosmo when chain has no fee currencies", async () => {
    mockGetChain.mockReturnValueOnce(undefined);
    mockEstimateFee.mockRejectedValue(new Error("simulation failed"));
    mockGetUserBalances.mockResolvedValue([
      { denom: "uosmo", amount: "100000" },
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
    expect(result.current.data?.amount[0].denom).toBe("uosmo");
  });

  it("surfaces insufficient fee balance errors from fallback selection", async () => {
    mockEstimateFee.mockRejectedValue(new Error("simulation failed"));
    mockGetFallbackFeeAmountFromBalances.mockRejectedValueOnce(
      new InsufficientFeeError(
        "No fee tokens found with sufficient balance on account for address osmo1testaddress. Please add funds to continue."
      )
    );

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

  it("falls back when estimated fee is missing denom", async () => {
    mockEstimateFee.mockResolvedValue({
      amount: [{}],
      gas: "250000",
    });
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

    const assetDenoms = mockGetAssetWithPrice.mock.calls.map(
      ([args]) => args.findMinDenomOrSymbol
    );
    expect(assetDenoms).not.toContain(undefined);
  });

  it("surfaces InsufficientFeeError from estimation instead of falling back", async () => {
    mockEstimateFee.mockRejectedValue(
      new InsufficientFeeError("fee token missing")
    );

    const { result } = renderHook(
      () =>
        useEstimateTxFees({
          messages,
          chainId: "osmosis-1",
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() =>
      expect(result.current.error).toBeInstanceOf(InsufficientFeeError)
    );
    expect(mockGetUserBalances).not.toHaveBeenCalled();
    expect(mockGetFallbackFeeAmountFromBalances).not.toHaveBeenCalled();
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
