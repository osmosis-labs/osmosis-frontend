import { NativeEVMTokenConstantAddress } from "../../ethereum";
import { getAxelarExternalUrl } from "../external-urls";

describe("getAxelarExternalUrl", () => {
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
      "https://satellite.money/?source=Ethereum&destination=osmosis&asset_denom=eth-wei&destination_address=destination-address"
    );
  });

  it("should throw an error if fromChain is not found", async () => {
    const params = {
      fromChain: { chainId: "nonexistent", chainType: "evm" },
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
    } as Parameters<typeof getAxelarExternalUrl>[0];

    await expect(getAxelarExternalUrl(params)).rejects.toThrow(
      "Chain not found: nonexistent"
    );
  });

  it("should throw an error if toChain is not found", async () => {
    const params = {
      fromChain: { chainId: "chain1", chainType: "evm" },
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
    } as Parameters<typeof getAxelarExternalUrl>[0];

    await expect(getAxelarExternalUrl(params)).rejects.toThrow(
      "Chain not found: chain1"
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
