import { SourceChainConfig } from "./types";

const IS_TESTNET = process.env.NEXT_PUBLIC_IS_TESTNET === "true";

/** https://axelarscan.io/assets
 *  Ensure that users bridge sufficient amounts from EthMainnet=>NonEthEvm via Axelar before enabling.
 */
export const SourceChainConfigs: {
  [asset: string]: { [chain: string]: SourceChainConfig };
} = {
  usdc: {
    ethereum: {
      id: IS_TESTNET
        ? ("Ropsten Test Network" as const)
        : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x526f0A95EDC3DF4CBDB7bb37d4F7Ed451dB8e369"
        : "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // test: 'aUSDC' on metamask/etherscan
      logoUrl: "/networks/ethereum.svg",
    },
    bnbChain: {
      id: "Binance" as const,
      erc20ContractAddress: "0x4268B8F0B87b6Eae5d897996E6b845ddbD99Adf3",
      logoUrl: "/networks/binance.svg",
    },
    avalanche: {
      id: "Avalanche" as const,
      erc20ContractAddress: "0xfaB550568C688d5D8A52C7d794cb93Edc26eC0eC",
      logoUrl: "/networks/avalanche.svg",
    },
    polygon: {
      id: "Polygon" as const,
      erc20ContractAddress: "0x750e4C4984a9e0f12978eA6742Bc1c5D248f40ed",
      logoUrl: "/networks/polygon.svg",
    },
    fantom: {
      id: "Fantom" as const,
      erc20ContractAddress: "0x1B6382DBDEa11d97f24495C9A90b7c88469134a4",
      logoUrl: "/networks/fantom.svg",
    },
    moonbeam: {
      id: "Moonbeam" as const,
      erc20ContractAddress: "0xCa01a1D0993565291051daFF390892518ACfAD3A",
      logoUrl: "/networks/moonbeam.svg",
    },
  },
  weth: {
    ethereum: {
      id: IS_TESTNET
        ? ("Ropsten Test Network" as const)
        : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0xc778417E063141139Fce010982780140Aa0cD5Ab"
        : "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      logoUrl: "/networks/ethereum.svg",
    },
  },
};
