import { MockAssetLists, MockChains } from "~/config/asset-list/mock-data";

beforeAll(() => {
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterAll(() => {
  // eslint-disable-next-line no-console
  (console.warn as jest.Mock).mockRestore();
});

describe("getKeplrCompatibleChain", () => {
  it("should return undefined if assetList is not found and environment is testnet", async () => {
    const assetLists: any[] = [];
    const environment = "testnet";

    const getKeplrCompatibleChain = await import("../utils").then(
      (module) => module.getKeplrCompatibleChain
    );
    const result = getKeplrCompatibleChain({
      chain: MockChains[0],
      assetLists,
      environment,
    });

    expect(result).toBeUndefined();
  });

  it("should return error if assetList is not found and environment is mainnet", async () => {
    const assetLists: any[] = [];
    const environment = "mainnet";

    const getKeplrCompatibleChain = await import("../utils").then(
      (module) => module.getKeplrCompatibleChain
    );

    expect(() =>
      getKeplrCompatibleChain({
        chain: MockChains[0],
        assetLists,
        environment,
      })
    ).toThrow(`Failed to find currencies for ${MockChains[0].chain_name}`);
  });

  it("should return a valid ChainInfoWithExplorer object when assetList is found", async () => {
    const environment = "mainnet";

    const getKeplrCompatibleChain = await import("../utils").then(
      (module) => module.getKeplrCompatibleChain
    );

    const result = getKeplrCompatibleChain({
      chain: MockChains[0],
      assetLists: MockAssetLists,
      environment,
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "bech32Config": {
          "bech32PrefixAccAddr": "osmo",
          "bech32PrefixAccPub": "osmopub",
          "bech32PrefixConsAddr": "osmovalcons",
          "bech32PrefixConsPub": "osmovalconspub",
          "bech32PrefixValAddr": "osmovaloper",
          "bech32PrefixValPub": "osmovaloperpub",
        },
        "bip44": {
          "coinType": 118,
        },
        "chainId": "osmosis-1",
        "chainName": "osmosis",
        "currencies": [
          {
            "coinDecimals": 6,
            "coinDenom": "OSMO",
            "coinGeckoId": "osmosis",
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg",
            "coinMinimalDenom": "uosmo",
            "priceCoinId": "pool:uosmo",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "ION",
            "coinGeckoId": "ion",
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/ion.svg",
            "coinMinimalDenom": "uion",
            "priceCoinId": "pool:uion",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "IBCX",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/ibcx.svg",
            "coinMinimalDenom": "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
            "priceCoinId": "pool:ibcx",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "stIBCX",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/stibcx.svg",
            "coinMinimalDenom": "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
            "priceCoinId": "pool:stibcx",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "ampOSMO",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/amposmo.png",
            "coinMinimalDenom": "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
            "priceCoinId": "pool:amposmo",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "CDT",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/CDT.svg",
            "coinMinimalDenom": "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
            "priceCoinId": "pool:cdt",
          },
          {
            "coinDecimals": 6,
            "coinDenom": "MBRN",
            "coinGeckoId": undefined,
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/MBRN.svg",
            "coinMinimalDenom": "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
            "priceCoinId": "pool:mbrn",
          },
        ],
        "explorerUrlToTx": "https://www.mintscan.io/cosmos/txs/\${txHash}",
        "features": [
          "ibc-go",
          "ibc-transfer",
          "cosmwasm",
          "wasmd_0.24+",
          "osmosis-txfees",
        ],
        "feeCurrencies": [
          {
            "coinDecimals": 6,
            "coinDenom": "OSMO",
            "coinGeckoId": "osmosis",
            "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg",
            "coinMinimalDenom": "uosmo",
            "priceCoinId": "pool:uosmo",
          },
        ],
        "prettyChainName": "Osmosis",
        "rest": "https://lcd-osmosis.keplr.app",
        "rpc": "https://rpc-osmosis.keplr.app",
        "stakeCurrency": {
          "coinDecimals": 6,
          "coinDenom": "OSMO",
          "coinGeckoId": "osmosis",
          "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.svg",
          "coinMinimalDenom": "uosmo",
        },
      }
    `);
  });
});

describe("getChainList", () => {
  afterEach(() => {
    jest.resetModules();
  });

  it("should return the correct chain information when OSMOSIS_CHAIN_ID_OVERWRITE is not set", async () => {
    // Set OSMOSIS_CHAIN_ID_OVERWRITE to undefined
    delete process.env.NEXT_PUBLIC_OSMOSIS_CHAIN_ID_OVERWRITE;

    const getChainList = await import("../utils").then(
      (module) => module.getChainList
    );

    const result = getChainList({
      assetLists: MockAssetLists,
      chains: MockChains,
      environment: "mainnet",
    });
    const expectedChainId = "osmosis-1";

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]?.chain_id).toBe(expectedChainId);
    expect(result[0]?.bech32_prefix).toBe("osmo");
  });

  it("should return the correct chain information when OSMOSIS_CHAIN_ID_OVERWRITE is set", async () => {
    // Set OSMOSIS_CHAIN_ID_OVERWRITE to a custom value
    process.env.NEXT_PUBLIC_OSMOSIS_CHAIN_ID_OVERWRITE = "custom-chain-id";

    const getChainList = await import("../utils").then(
      (module) => module.getChainList
    );

    const result = getChainList({
      assetLists: MockAssetLists,
      chains: MockChains,
      environment: "mainnet",
    });
    const expectedChainId = "custom-chain-id";

    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]?.chain_id).toBe(expectedChainId);
    expect(result[0]?.bech32_prefix).toBe("osmo");
  });
});
