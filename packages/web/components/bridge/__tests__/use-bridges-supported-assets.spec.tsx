import type { MinimalAsset } from "@osmosis-labs/types";
import { renderHook } from "@testing-library/react";

import { useBridgesSupportedAssets } from "../use-bridges-supported-assets";

/**
 * Simulated per-provider query results. `api.useQueries` is mocked to return
 * these directly; the hook only consumes the results array, so the query
 * builder callback is irrelevant here.
 */
let mockQueryResults: unknown[] = [];

jest.mock("~/utils/trpc", () => ({
  api: {
    useQueries: () => mockQueryResults,
  },
}));

const osmosisChain = { chainId: "osmosis-1", chainType: "cosmos" as const };
const testAsset = {
  coinMinimalDenom: "ibc/TESTDENOM",
  coinDenom: "TEST",
  coinDecimals: 6,
} as MinimalAsset;

const renderSupportedAssets = () =>
  renderHook(() =>
    useBridgesSupportedAssets({
      assets: [testAsset],
      chain: osmosisChain,
      direction: "withdraw",
    })
  );

const ethereumChain = {
  chainId: 1,
  chainType: "evm",
  chainName: "Ethereum",
  prettyName: "Ethereum",
};
const ethereumAssetsByChainId = {
  "1": [
    {
      chainId: 1,
      chainType: "evm",
      address: "0xTEST",
      denom: "TEST",
      decimals: 6,
      transferTypes: ["quote"],
    },
  ],
};

const successResult = ({
  providerName = "Skip",
  availableChains = [] as unknown[],
  assetsByChainId = {} as Record<string, unknown[]>,
} = {}) => ({
  isSuccess: true,
  isLoading: false,
  isError: false,
  errorUpdateCount: 0,
  data: {
    supportedAssets: {
      providerName,
      inputAssetAddress: "ibc/TESTDENOM",
      assetsByChainId,
      availableChains,
    },
  },
});
/** Retries exhausted; the hook's manual 30s re-poll refetches it later. */
const errorResult = {
  isSuccess: false,
  isLoading: false,
  isError: true,
  errorUpdateCount: 1,
  refetch: jest.fn(),
  data: undefined,
};
/** First fetch in flight, no failures yet. */
const loadingResult = {
  isSuccess: false,
  isLoading: true,
  isError: false,
  errorUpdateCount: 0,
  data: undefined,
};
/** Re-polling after a settled error (the hook's manual re-poll):
 *  react-query reports isLoading because the query has never had data, and
 *  resets failureCount at fetch start — errorUpdateCount is what persists. */
const retryingResult = {
  isSuccess: false,
  isLoading: true,
  isError: false,
  errorUpdateCount: 1,
  data: undefined,
};

describe("useBridgesSupportedAssets loading and error state", () => {
  it("is loading while any provider query is in flight", () => {
    mockQueryResults = [loadingResult, successResult()];

    const { result } = renderSupportedAssets();

    expect(result.current.isLoading).toBe(true);
  });

  it("holds the loading state when a provider failed and no chains were found", () => {
    // A failed provider (e.g. a rate-limited registry) must not be mistaken
    // for "asset unsupported for quoting": with zero supported chains the
    // modal would settle onto its external-providers fallback.
    mockQueryResults = [errorResult, successResult()];

    const { result } = renderSupportedAssets();

    expect(result.current.supportedChains).toHaveLength(0);
    expect(result.current.isLoading).toBe(true);
  });

  it("proceeds with available chains when one provider failed but another returned routes", () => {
    mockQueryResults = [
      errorResult,
      successResult({
        providerName: "Squid",
        availableChains: [ethereumChain],
        assetsByChainId: ethereumAssetsByChainId,
      }),
    ];

    const { result } = renderSupportedAssets();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.supportedChains).toHaveLength(1);
    expect(result.current.supportedChains[0].chainId).toBe(1);
  });

  it("holds the loading state while a provider is retrying and no chains were found", () => {
    mockQueryResults = [retryingResult, successResult()];

    const { result } = renderSupportedAssets();

    expect(result.current.isLoading).toBe(true);
  });

  it("does not flash loading when a failing provider re-polls while chains are available", () => {
    // an error-interval re-poll reports isLoading (the query never had
    // data); the modal must keep rendering the chains other providers
    // returned instead of dropping to a skeleton every poll cycle
    mockQueryResults = [
      retryingResult,
      successResult({
        providerName: "Squid",
        availableChains: [ethereumChain],
        assetsByChainId: ethereumAssetsByChainId,
      }),
    ];

    const { result } = renderSupportedAssets();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.supportedChains).toHaveLength(1);
  });

  it("holds the loading state when a provider is failing and only external-url chains were found", () => {
    // Wormhole always succeeds with an external-url-only Solana suggestion
    // for assets with a solana counterparty. That must not release the
    // failing-provider hold: with the only quote provider down, releasing
    // would settle the withdraw on Solana and land the modal on the
    // external-providers view.
    mockQueryResults = [
      errorResult,
      successResult({
        providerName: "Wormhole",
        availableChains: [
          { chainId: "solana", chainType: "solana", prettyName: "Solana" },
        ],
        assetsByChainId: {
          solana: [
            {
              chainId: "solana",
              chainType: "solana",
              address: "solanaUSDCaddress",
              denom: "USDC",
              decimals: 6,
              transferTypes: ["external-url"],
            },
          ],
        },
      }),
    ];

    const { result } = renderSupportedAssets();

    expect(result.current.isLoading).toBe(true);
  });

  it("re-polls errored queries with backoff (5s, 10s, 20s, then 30s) while a provider is failing", () => {
    // react-query v4 never interval-refetches a query that settled into an
    // error without data, so the hook drives this itself
    jest.useFakeTimers();
    try {
      const refetch = jest.fn();
      mockQueryResults = [{ ...errorResult, refetch }, successResult()];

      renderSupportedAssets();

      expect(refetch).not.toHaveBeenCalled();
      jest.advanceTimersByTime(5_000);
      expect(refetch).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(10_000);
      expect(refetch).toHaveBeenCalledTimes(2);
      jest.advanceTimersByTime(20_000);
      expect(refetch).toHaveBeenCalledTimes(3);
      jest.advanceTimersByTime(30_000);
      expect(refetch).toHaveBeenCalledTimes(4);
      jest.advanceTimersByTime(30_000);
      expect(refetch).toHaveBeenCalledTimes(5);
    } finally {
      jest.useRealTimers();
    }
  });

  it("does not schedule re-polls when no query is failing", () => {
    jest.useFakeTimers();
    try {
      const refetch = jest.fn();
      mockQueryResults = [{ ...successResult(), refetch }];

      renderSupportedAssets();

      jest.advanceTimersByTime(90_000);
      expect(refetch).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  it("settles into the empty (external-only) state only when every query succeeded with no chains", () => {
    mockQueryResults = [
      successResult(),
      successResult({ providerName: "Squid" }),
    ];

    const { result } = renderSupportedAssets();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.supportedChains).toHaveLength(0);
  });
});
