// eslint-disable-next-line import/no-extraneous-dependencies
import { rest } from "msw";

import { server } from "../../__tests__/msw";
import { NativeEVMTokenConstantAddress } from "../../ethereum";
import { getAxelarExternalUrl } from "../external-url";
import {
  MockAxelarAssets,
  MockAxelarChains,
} from "./mock-axelar-assets-and-chains";

beforeEach(() => {
  server.use(
    rest.get("https://api.axelarscan.io/api/getAssets", (_req, res, ctx) => {
      return res(ctx.json(MockAxelarAssets));
    }),
    rest.get("https://api.axelarscan.io/api/getChains", (_req, res, ctx) => {
      return res(ctx.json(MockAxelarChains));
    })
  );
});

describe("getAxelarExternalUrl", () => {
  it("should return the correct URL for Weth <> axlEth", async () => {
    const params = {
      fromChain: { chainId: 1, chainType: "evm" },
      toChain: { chainId: "osmosis-1", chainType: "cosmos" },
      fromAsset: {
        denom: "ETH",
        sourceDenom: "weth-wei",
        decimals: 18,
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      },
      toAsset: {
        address:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        decimals: 18,
        denom: "ETH",
        sourceDenom: "weth-wei",
      },
      env: "mainnet",
      toAddress: "destination-address",
    } as Parameters<typeof getAxelarExternalUrl>[0];

    const url = await getAxelarExternalUrl(params);

    expect(url).toBe(
      "https://satellite.money/?source=Ethereum&destination=osmosis&asset_denom=weth-wei&destination_address=destination-address"
    );
  });

  it("should return the correct URL for Eth <> axlEth", async () => {
    const params = {
      fromChain: { chainId: 1, chainType: "evm" },
      toChain: { chainId: "osmosis-1", chainType: "cosmos" },
      fromAsset: {
        denom: "ETH",
        sourceDenom: "weth-wei",
        decimals: 18,
        address: NativeEVMTokenConstantAddress,
      },
      toAsset: {
        address:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        decimals: 18,
        denom: "ETH",
        sourceDenom: "weth-wei",
      },
      env: "mainnet",
      toAddress: "destination-address",
    } as Parameters<typeof getAxelarExternalUrl>[0];

    const url = await getAxelarExternalUrl(params);

    expect(url).toBe(
      "https://satellite.money/?source=Ethereum&destination=osmosis&asset_denom=eth&destination_address=destination-address"
    );
  });

  it("should return the correct URL for USDC <> axlUSDC", async () => {
    const params = {
      fromChain: { chainId: 1, chainType: "evm" },
      toChain: { chainId: "osmosis-1", chainType: "cosmos" },
      fromAsset: {
        denom: "USDC",
        sourceDenom: "uusdc",
        decimals: 6,
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      },
      toAsset: {
        address:
          "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        decimals: 6,
        denom: "USDC",
        sourceDenom: "uusdc",
      },
      env: "mainnet",
      toAddress: "destination-address",
    } as Parameters<typeof getAxelarExternalUrl>[0];

    const url = await getAxelarExternalUrl(params);

    expect(url).toBe(
      "https://satellite.money/?source=Ethereum&destination=osmosis&asset_denom=uusdc&destination_address=destination-address"
    );
  });

  it("should return the correct URL for USDC <> axlUSDC (Avalanche)", async () => {
    const params = {
      fromChain: { chainId: 43114, chainType: "evm" },
      toChain: { chainId: "osmosis-1", chainType: "cosmos" },
      fromAsset: {
        denom: "USDC",
        sourceDenom: "uusdc",
        decimals: 6,
        address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      },
      toAsset: {
        address:
          "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        decimals: 6,
        denom: "USDC",
        sourceDenom: "uusdc",
      },
      env: "mainnet",
      toAddress: "destination-address",
    } as Parameters<typeof getAxelarExternalUrl>[0];

    const url = await getAxelarExternalUrl(params);

    expect(url).toBe(
      "https://satellite.money/?source=Avalanche&destination=osmosis&asset_denom=uusdc&destination_address=destination-address"
    );
  });

  it("should throw an error if fromChain is not found", async () => {
    const params = {
      fromChain: { chainId: 9898989898988, chainType: "evm" },
      toChain: { chainId: "chain2", chainType: "cosmos" },
      fromAsset: {
        address: "address1",
        denom: "denom1",
        sourceDenom: "sourceDenom1",
        decimals: 18,
      },
      toAsset: {
        address: "address2",
        denom: "denom2",
        sourceDenom: "sourceDenom2",
        decimals: 18,
      },
      env: "mainnet",
      toAddress: "destination-address",
    } satisfies Parameters<typeof getAxelarExternalUrl>[0];

    await expect(getAxelarExternalUrl(params)).rejects.toThrow(
      "Chain not found: 9898989898988"
    );
  });

  it("should throw an error if toChain is not found", async () => {
    const params = {
      fromChain: { chainId: 1, chainType: "evm" },
      toChain: { chainId: "nonexistent", chainType: "cosmos" },
      fromAsset: {
        address: "address1",
        denom: "denom1",
        sourceDenom: "sourceDenom1",
        decimals: 18,
      },
      toAsset: {
        address: "address2",
        denom: "denom2",
        sourceDenom: "sourceDenom2",
        decimals: 18,
      },
      env: "mainnet",
      toAddress: "destination-address",
    } satisfies Parameters<typeof getAxelarExternalUrl>[0];

    await expect(getAxelarExternalUrl(params)).rejects.toThrow(
      "Chain not found: nonexistent"
    );
  });

  it("should throw an error if toAsset is not found", async () => {
    const params = {
      fromChain: { chainId: 1, chainType: "evm" },
      toChain: { chainId: "osmosis-1", chainType: "cosmos" },
      fromAsset: {
        address: "address1",
        denom: "denom1",
        sourceDenom: "sourceDenom1",
        decimals: 18,
      },
      toAsset: {
        address: "nonexistent",
        denom: "denom2",
        sourceDenom: "sourceDenom2",
        decimals: 18,
      },
      env: "mainnet",
      toAddress: "destination-address",
    } as Parameters<typeof getAxelarExternalUrl>[0];

    await expect(getAxelarExternalUrl(params)).rejects.toThrow(
      "Asset not found: nonexistent"
    );
  });
});
