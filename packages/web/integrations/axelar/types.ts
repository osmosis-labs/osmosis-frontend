const IS_TESTNET = process.env.NEXT_PUBLIC_IS_TESTNET === "true";

export interface AxelarBridgeConfig {
  /** Currently just via deposit address, future could be gateway contract call. */
  method: "deposit-address";
  /** Chains that can fungibly source this asset.
   *
   *  See this FigJam for axlUSDC case:
   *  https://www.figma.com/file/utRjpBIvD7sRm31vxif7hF/Bridge-Integration-Diagram?node-id=340%3A935
   */
  sourceChains: SourceChainConfig[];
  /** Default source chain to be selected. Defaults to first in `sourceChains` if left `undefined`. */
  defaultSourceChainId?: SourceChain;
  /** Ex: `uusdc`. NOTE: Will get currency info from `originCurrency` on the IBC balance (from registrar).
   *  See: https://docs.axelar.dev/resources/mainnet#assets
   */
  tokenMinDenom: string;
  /** Amount of Axelar transfer fee in `originCurrency`.
   *  TODO: use `useTransferFeeQuery` should fees become dynamic and once APIs become production ready.
   *  See calculator tool on Axelar docs to get current fee constants: https://docs.axelar.dev/resources/mainnet#cross-chain-relayer-gas-fee.
   */
  transferFeeMinAmount: string;
}

/** See: https://docs.axelar.dev/dev/build/chain-names/mainnet
 *  Testnet: https://axelartest-lcd.quickapi.com/axelar/nexus/v1beta1/chains?status=1
 */
export type SourceChain =
  | "Ethereum"
  | "Ropsten Test Network"
  | "Avalanche"
  | "Fantom"
  | "Polygon"
  | "Moonbeam"
  | "Binance";

/** Maps eth client chainIDs => axelar chain ids.
 *
 *  Values not included as keys are assumed to be the same across chainlist and Axelar.
 */
export const EthClientChainIds_AxelarChainIdsMap: {
  [ethClientChainIds: string]: SourceChain;
} = {
  "Ropsten Test Network": "Ethereum",
  "Avalanche C-Chain": "Avalanche",
  "Binance Smart Chain": "Binance",
  "Fantom Opera": "Fantom",
};

export type SourceChainConfig = {
  /** Axelar-defined identifier. */
  id: SourceChain;
  /** Address of origin ERC20 token for that origin chain. Leave blank to prefer native ETH currency if `id` is not a Cosmos chain in `ChainInfo`.
   */
  erc20ContractAddress?: string;

  /** For IBC transfer from CosmosCounterparty<->via Axelar<->Osmosis */
  ibcConfig?: {
    /** on cosmos counterparty */
    sourceChannelId: string;
    /** on Axelar */
    destChannelId: string;
  };

  logoUrl: string;
};

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
};
