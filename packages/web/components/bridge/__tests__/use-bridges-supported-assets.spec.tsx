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
  data: {
    supportedAssets: {
      providerName,
      inputAssetAddress: "ibc/TESTDENOM",
      assetsByChainId,
      availableChains,
    },
  },
});
const errorResult = {
  isSuccess: false,
  isLoading: false,
  isError: true,
  data: undefined,
};
const loadingResult = {
  isSuccess: false,
  isLoading: true,
  isError: false,
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
