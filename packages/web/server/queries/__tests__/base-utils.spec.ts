import { Chain } from "@osmosis-labs/types";
import { apiClient } from "@osmosis-labs/utils";

import { createNodeQuery } from "../base-utils";

jest.mock("@osmosis-labs/utils", () => ({
  ...jest.requireActual("@osmosis-labs/utils"),
  apiClient: jest.fn(),
}));

describe("createNodeQuery", () => {
  beforeEach(() => {
    (apiClient as jest.Mock).mockClear();
  });

  it("should create a URL and call apiClient with it", async () => {
    const mockResult = { data: "test" };
    (apiClient as jest.Mock).mockResolvedValue(mockResult);

    const [path, params] = ["/test", { address: "testAddress" }];

    const query = createNodeQuery<{ data: string }, typeof params>({
      path,
      chainList: mockChainList,
    });
    const result = await query(params);

    expect(apiClient).toHaveBeenCalledWith(
      `https://lcd-osmosis.keplr.app${path}`
    );
    expect(result).toEqual(mockResult);
  });

  it("should handle function paths", async () => {
    const mockResult = { data: "test" };
    (apiClient as jest.Mock).mockResolvedValue(mockResult);

    const [path, params] = [
      ({ address }: { address: string }) => `/test/${address}`,
      { address: "testAddress" },
    ];

    const query = createNodeQuery<{ data: string }, typeof params>({
      path,
      chainList: mockChainList,
    });
    const result = await query(params);

    expect(apiClient).toHaveBeenCalledWith(
      `https://lcd-osmosis.keplr.app${path(params)}`
    );
    expect(result).toEqual(mockResult);
  });

  it("should throw when chain id is not available in ChainList", async () => {
    const mockResult = { data: "test" };
    (apiClient as jest.Mock).mockResolvedValue(mockResult);

    const [path, params] = [
      ({ address }: { address: string }) => `/test/${address}`,
      { address: "testAddress", chainId: "invalid-chain-id" },
    ];

    const query = createNodeQuery<{ data: string }, typeof params>({
      path,
      chainList: mockChainList,
    });

    await query(params).catch((result) => {
      expect(result.message).toEqual("Chain invalid-chain-id not found");
    });
  });

  it("should allow to change endpoint by chain id", async () => {
    const mockResult = { data: "test" };
    (apiClient as jest.Mock).mockResolvedValue(mockResult);

    const [path, params] = [
      ({ address }: { address: string }) => `/test/${address}`,
      { address: "testAddress", chainId: mockChainList[1].chain_id },
    ];

    const query = createNodeQuery<{ data: string }, typeof params>({
      path,
      chainList: mockChainList,
    });
    const result = await query(params);

    expect(apiClient).toHaveBeenCalledWith(
      `https://lcd-osmosis2.keplr.app${path(params)}`
    );
    expect(result).toEqual(mockResult);
  });
});

const mockChainList: Chain[] = [
  {
    chain_name: "osmosis",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Osmosis",
    chain_id: "osmosis-1",
    bech32_prefix: "osmo",
    bech32_config: {
      bech32PrefixAccAddr: "osmo",
      bech32PrefixAccPub: "osmopub",
      bech32PrefixValAddr: "osmovaloper",
      bech32PrefixValPub: "osmovaloperpub",
      bech32PrefixConsAddr: "osmovalcons",
      bech32PrefixConsPub: "osmovalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uosmo",
          fixed_min_gas_price: 0.0025,
          low_gas_price: 0.0025,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uosmo",
        },
      ],
      lock_duration: {
        time: "1209600s",
      },
    },
    description:
      "Osmosis (OSMO) is the premier DEX and cross-chain DeFi hub within the Cosmos ecosystem, a network of over 50 sovereign, interoperable blockchains seamlessly connected through the Inter-Blockchain Communication Protocol (IBC). Pioneering in its approach, Osmosis offers a dynamic trading and liquidity provision experience, integrating non-IBC assets from other ecosystems, including Ethereum, Solana, Avalanche, and Polkadot. Initially adopting Balancer-style pools, Osmosis now also features a concentrated liquidity model that is orders of magnitude more capital efficient, meaning that significantly less liquidity is required to handle the same amount of trading volume with minimal slippage.\n\nAs a true appchain, Osmosis has greater control over the full blockchain stack than traditional smart contract DEXs, which must follow the code of the parent chain that it is built on. This fine-grained control has enabled, for example, the development of Superfluid Staking, an extension of Proof of Stake that allows assets at the application layer to be staked to secure the chain. The customizability of appchains also allows implementing features like the Protocol Revenue module, which enables Osmosis to conduct on-chain arbitrage on behalf of OSMO stakers, balancing prices across pools while generating real yield revenue from this volume. Additionally, as a sovereign appchain, Osmosis governance can vote on upgrades to the protocol. One example of this was the introduction of a Taker Fee, which switched on the collection of exchange fees to generate diverse yield from Osmosis volume and distribute it to OSMO stakers.\n\nOsmosis is bringing the full centralized exchange experience to the decentralized world by building a cross-chain native DEX and trading suite that connects all chains over IBC, including Ethereum and Bitcoin. To reach this goal, Osmosis hosts an ever-expanding suite of DeFi applications aimed at providing a one-stop experience that includes lending, credit, margin, DeFi strategy vaults, power perps, fiat on-ramps, NFTs, stablecoins, and more — all of the functionalities that centralized exchange offer and more, in the trust-minimized environment of decentralized finance.",
    apis: {
      rpc: [
        {
          address: "https://rpc-osmosis.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-osmosis.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/osmosis/txs/{txHash}",
      },
    ],
    features: [
      "ibc-go",
      "ibc-transfer",
      "cosmwasm",
      "wasmd_0.24+",
      "osmosis-txfees",
    ],
  },
  {
    chain_name: "osmosis",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Osmosis",
    chain_id: "osmosis-2",
    bech32_prefix: "osmo",
    bech32_config: {
      bech32PrefixAccAddr: "osmo",
      bech32PrefixAccPub: "osmopub",
      bech32PrefixValAddr: "osmovaloper",
      bech32PrefixValPub: "osmovaloperpub",
      bech32PrefixConsAddr: "osmovalcons",
      bech32PrefixConsPub: "osmovalconspub",
    },
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "uosmo",
          fixed_min_gas_price: 0.0025,
          low_gas_price: 0.0025,
          average_gas_price: 0.025,
          high_gas_price: 0.04,
        },
      ],
    },
    staking: {
      staking_tokens: [
        {
          denom: "uosmo",
        },
      ],
      lock_duration: {
        time: "1209600s",
      },
    },
    description:
      "Osmosis (OSMO) is the premier DEX and cross-chain DeFi hub within the Cosmos ecosystem, a network of over 50 sovereign, interoperable blockchains seamlessly connected through the Inter-Blockchain Communication Protocol (IBC). Pioneering in its approach, Osmosis offers a dynamic trading and liquidity provision experience, integrating non-IBC assets from other ecosystems, including Ethereum, Solana, Avalanche, and Polkadot. Initially adopting Balancer-style pools, Osmosis now also features a concentrated liquidity model that is orders of magnitude more capital efficient, meaning that significantly less liquidity is required to handle the same amount of trading volume with minimal slippage.\n\nAs a true appchain, Osmosis has greater control over the full blockchain stack than traditional smart contract DEXs, which must follow the code of the parent chain that it is built on. This fine-grained control has enabled, for example, the development of Superfluid Staking, an extension of Proof of Stake that allows assets at the application layer to be staked to secure the chain. The customizability of appchains also allows implementing features like the Protocol Revenue module, which enables Osmosis to conduct on-chain arbitrage on behalf of OSMO stakers, balancing prices across pools while generating real yield revenue from this volume. Additionally, as a sovereign appchain, Osmosis governance can vote on upgrades to the protocol. One example of this was the introduction of a Taker Fee, which switched on the collection of exchange fees to generate diverse yield from Osmosis volume and distribute it to OSMO stakers.\n\nOsmosis is bringing the full centralized exchange experience to the decentralized world by building a cross-chain native DEX and trading suite that connects all chains over IBC, including Ethereum and Bitcoin. To reach this goal, Osmosis hosts an ever-expanding suite of DeFi applications aimed at providing a one-stop experience that includes lending, credit, margin, DeFi strategy vaults, power perps, fiat on-ramps, NFTs, stablecoins, and more — all of the functionalities that centralized exchange offer and more, in the trust-minimized environment of decentralized finance.",
    apis: {
      rpc: [
        {
          address: "https://rpc-osmosis.keplr.app",
        },
      ],
      rest: [
        {
          address: "https://lcd-osmosis2.keplr.app",
        },
      ],
    },
    explorers: [
      {
        tx_page: "https://www.mintscan.io/osmosis/txs/{txHash}",
      },
    ],
    features: [
      "ibc-go",
      "ibc-transfer",
      "cosmwasm",
      "wasmd_0.24+",
      "osmosis-txfees",
    ],
  },
];
