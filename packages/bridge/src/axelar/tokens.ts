import { AxelarSourceChain, EthereumChainInfo } from "@osmosis-labs/utils";

import { BridgeEnvironment } from "../interface";

/** @deprecated Prefer using Axelar chain/asset list API via bridge providers instead */
export type SourceChainTokenConfig = {
  /** Source Chain identifier. */
  id: AxelarSourceChain;
  chainId?: number;
  /** Address of origin ERC20 token for that origin chain. Leave blank to
   *  prefer native ETH currency if `id` is not a Cosmos chain in `ChainInfo`.
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

  /** If this **EVM** token is auto-wrappable by Axelar, specify the native token.
   *  The token on Osmosis is assumed to be the wrapped version of the native token, but labelled as the native token.
   *  Assume we're transferring native token, since it's the gas token as well and generally takes precedence.
   *
   *  i.e. ETH for WETH, BNB for WBNB, etc.
   *
   *  Specified per Axelar bridged token & network due to each token having a single source chain ERC20 instance.
   */
  nativeWrapEquivalent?: {
    /** Used as key for Axelar JS-SDK/APIs, only when *transfering TO* Osmosis (depositing).
     * See (unofficial): https://github.com/axelarnetwork/axelarjs-sdk/blob/302cb4673e0293b707d3401ad141be5e9cec2bbf/src/libs/types/index.ts#L122 */
    tokenMinDenom: string;
    /** Wrap denom (e.g. WETH), since it's assumed we're labeling Osmosis balance as native. */
    wrapDenom: string;
  };
};

/** https://axelarscan.io/assets
 *  Ensure that users bridge sufficient amounts from EthMainnet=>NonEthEvm via Axelar before enabling.
 *  @deprecated Prefer using Axelar chain/asset list API via bridge providers instead
 */
export const AxelarSourceChainTokenConfigs: (env: BridgeEnvironment) => {
  [asset: string]: { [chain: string]: SourceChainTokenConfig };
} = (env) => {
  const isTestnet = env === "testnet";

  return {
    usdc: {
      ethereum: {
        id: isTestnet
          ? EthereumChainInfo["Goerli Testnet"].chainName
          : EthereumChainInfo["Ethereum"].chainName,
        chainId: isTestnet
          ? EthereumChainInfo["Goerli Testnet"].id
          : EthereumChainInfo["Ethereum"].id,
        erc20ContractAddress: isTestnet
          ? "0x254d06f33bDc5b8ee05b2ea472107E300226659A"
          : "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // test: 'aUSDC' on metamask/etherscan
        logoUrl: "/networks/ethereum.svg",
      },
      avalanche: {
        id: isTestnet
          ? EthereumChainInfo["Avalanche Fuji Testnet"].chainName
          : EthereumChainInfo["Avalanche"].chainName,
        chainId: isTestnet
          ? EthereumChainInfo["Avalanche Fuji Testnet"].id
          : EthereumChainInfo["Avalanche"].id,
        erc20ContractAddress: isTestnet
          ? "0x57F1c63497AEe0bE305B8852b354CEc793da43bB"
          : "0xfaB550568C688d5D8A52C7d794cb93Edc26eC0eC",
        logoUrl: "/networks/avalanche.svg",
      },
      binance: {
        id: isTestnet
          ? EthereumChainInfo["BSC Testnet"].chainName
          : EthereumChainInfo["Binance Smart Chain"].chainName,
        chainId: isTestnet
          ? EthereumChainInfo["BSC Testnet"].id
          : EthereumChainInfo["Binance Smart Chain"].id,
        erc20ContractAddress: isTestnet
          ? "0xc2fA98faB811B785b81c64Ac875b31CC9E40F9D2"
          : "0x4268B8F0B87b6Eae5d897996E6b845ddbD99Adf3",
        logoUrl: "/networks/binance.svg",
      },
      fantom: {
        id: isTestnet
          ? EthereumChainInfo["Fantom Testnet"].chainName
          : EthereumChainInfo["Fantom"].chainName,
        chainId: isTestnet
          ? EthereumChainInfo["Fantom Testnet"].id
          : EthereumChainInfo["Fantom"].id,
        erc20ContractAddress: isTestnet
          ? "0x75Cc4fDf1ee3E781C1A3Ee9151D5c6Ce34Cf5C61"
          : "0x1B6382DBDEa11d97f24495C9A90b7c88469134a4",
        logoUrl: "/networks/fantom.svg",
      },
      moonbeam: {
        id: isTestnet
          ? EthereumChainInfo["Moonbase Alpha"].chainName
          : EthereumChainInfo["Moonbeam"].chainName,
        chainId: isTestnet
          ? EthereumChainInfo["Moonbase Alpha"].id
          : EthereumChainInfo["Moonbeam"].id,
        erc20ContractAddress: isTestnet
          ? "0xD1633F7Fb3d716643125d6415d4177bC36b7186b"
          : "0xCa01a1D0993565291051daFF390892518ACfAD3A",
        logoUrl: "/networks/moonbeam.svg",
      },
      polygon: {
        id: isTestnet
          ? EthereumChainInfo["Mumbai"].chainName
          : EthereumChainInfo["Polygon"].chainName,
        chainId: isTestnet
          ? EthereumChainInfo["Mumbai"].id
          : EthereumChainInfo["Polygon"].id,
        erc20ContractAddress: isTestnet
          ? "0x2c852e740B62308c46DD29B982FBb650D063Bd07"
          : "0x750e4C4984a9e0f12978eA6742Bc1c5D248f40ed",
        logoUrl: "/networks/polygon.svg",
      },
    },
    weth: {
      ethereum: {
        id: isTestnet
          ? EthereumChainInfo["Goerli Testnet"].chainName
          : EthereumChainInfo["Ethereum"].chainName,
        chainId: isTestnet ? 5 : 1,
        erc20ContractAddress: isTestnet
          ? "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
          : "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        logoUrl: "/networks/ethereum.svg",
        nativeWrapEquivalent: {
          wrapDenom: isTestnet ? "aWETH" : "WETH",
          tokenMinDenom: "eth",
        },
      },
    },
    etharbaxl: {
      arbitrum: {
        id: EthereumChainInfo["Arbitrum"].chainName,
        chainId: EthereumChainInfo["Arbitrum"].id,
        erc20ContractAddress: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
        logoUrl: "/networks/abritrum.svg",
      },
    },
    ethbaseaxl: {
      base: {
        id: EthereumChainInfo["Base"].chainName,
        chainId: EthereumChainInfo["Base"].id,
        erc20ContractAddress: "0x4200000000000000000000000000000000000006",
        logoUrl: "/networks/base.svg",
      },
    },
    ethmaticaxl: {
      polygon: {
        id: EthereumChainInfo["Polygon"].chainName,
        chainId: EthereumChainInfo["Polygon"].id,
        erc20ContractAddress: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
        logoUrl: "/networks/polygon.svg",
      },
    },
    wglmr: {
      moonbeam: {
        id: isTestnet
          ? EthereumChainInfo["Moonbase Alpha"].chainName
          : EthereumChainInfo["Moonbeam"].chainName,
        chainId: isTestnet
          ? EthereumChainInfo["Moonbase Alpha"].id
          : EthereumChainInfo["Moonbeam"].id,
        erc20ContractAddress: isTestnet
          ? "0x1436aE0dF0A8663F18c0Ec51d7e2E46591730715"
          : "0xAcc15dC74880C9944775448304B263D191c6077F",
        logoUrl: "/networks/moonbeam.svg",
        nativeWrapEquivalent: {
          wrapDenom: "WGLMR",
          tokenMinDenom: "glmr",
        },
      },
    },
    wbtc: {
      ethereum: {
        id: EthereumChainInfo["Ethereum"].chainName,
        chainId: EthereumChainInfo["Ethereum"].id,
        erc20ContractAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        logoUrl: "/networks/ethereum.svg",
      },
    },
    dai: {
      ethereum: {
        id: EthereumChainInfo["Ethereum"].chainName,
        chainId: EthereumChainInfo["Ethereum"].id,
        erc20ContractAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        logoUrl: "/networks/ethereum.svg",
      },
    },
    dot: {
      moonbeam: {
        id: EthereumChainInfo["Moonbeam"].chainName,
        chainId: EthereumChainInfo["Moonbeam"].id,
        erc20ContractAddress: "0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080",
        logoUrl: "/networks/moonbeam.svg",
      },
    },
    usdt: {
      ethereum: {
        id: EthereumChainInfo["Ethereum"].chainName,
        chainId: EthereumChainInfo["Ethereum"].id,
        erc20ContractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        logoUrl: "/networks/ethereum.svg",
      },
    },
    frax: {
      ethereum: {
        id: EthereumChainInfo["Ethereum"].chainName,
        chainId: EthereumChainInfo["Ethereum"].id,
        erc20ContractAddress: "0x853d955aCEf822Db058eb8505911ED77F175b99e",
        logoUrl: "/networks/ethereum.svg",
      },
    },
    link: {
      ethereum: {
        id: EthereumChainInfo["Ethereum"].chainName,
        chainId: EthereumChainInfo["Ethereum"].id,
        erc20ContractAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
        logoUrl: "/networks/ethereum.svg",
      },
    },
    aave: {
      ethereum: {
        id: EthereumChainInfo["Ethereum"].chainName,
        chainId: EthereumChainInfo["Ethereum"].id,
        erc20ContractAddress: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
        logoUrl: "/networks/ethereum.svg",
      },
    },
    ape: {
      ethereum: {
        id: EthereumChainInfo["Ethereum"].chainName,
        chainId: EthereumChainInfo["Ethereum"].id,
        erc20ContractAddress: "0x4d224452801ACEd8B2F0aebE155379bb5D594381",
        logoUrl: "/networks/ethereum.svg",
      },
    },
    axs: {
      ethereum: {
        id: EthereumChainInfo["Ethereum"].chainName,
        chainId: EthereumChainInfo["Ethereum"].id,
        erc20ContractAddress: "0xBB0E17EF65F82Ab018d8EDd776e8DD940327B28b",
        logoUrl: "/networks/ethereum.svg",
      },
    },
    mkr: {
      ethereum: {
        id: EthereumChainInfo["Ethereum"].chainName,
        chainId: EthereumChainInfo["Ethereum"].id,
        erc20ContractAddress: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
        logoUrl: "/networks/ethereum.svg",
      },
    },
    rai: {
      ethereum: {
        id: EthereumChainInfo["Ethereum"].chainName,
        chainId: EthereumChainInfo["Ethereum"].id,
        erc20ContractAddress: "0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919",
        logoUrl: "/networks/ethereum.svg",
      },
    },
    shib: {
      ethereum: {
        id: EthereumChainInfo["Ethereum"].chainName,
        chainId: EthereumChainInfo["Ethereum"].id,
        erc20ContractAddress: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
        logoUrl: "/networks/ethereum.svg",
      },
    },
    uni: {
      ethereum: {
        id: EthereumChainInfo["Ethereum"].chainName,
        chainId: EthereumChainInfo["Ethereum"].id,
        erc20ContractAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        logoUrl: "/networks/ethereum.svg",
      },
    },
    xcn: {
      ethereum: {
        id: EthereumChainInfo["Ethereum"].chainName,
        chainId: EthereumChainInfo["Ethereum"].id,
        erc20ContractAddress: "0xA2cd3D43c775978A96BdBf12d733D5A1ED94fb18",
        logoUrl: "/networks/ethereum.svg",
      },
    },
    pepe: {
      ethereum: {
        id: EthereumChainInfo["Ethereum"].chainName,
        chainId: EthereumChainInfo["Ethereum"].id,
        erc20ContractAddress: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
        logoUrl: "/networks/ethereum.svg",
      },
    },
    cbeth: {
      ethereum: {
        id: EthereumChainInfo["Ethereum"].chainName,
        chainId: EthereumChainInfo["Ethereum"].id,
        erc20ContractAddress: "0xbe9895146f7af43049ca1c1ae358b0541ea49704",
        logoUrl: "/networks/ethereum.svg",
      },
    },
    reth: {
      ethereum: {
        id: EthereumChainInfo["Ethereum"].chainName,
        chainId: EthereumChainInfo["Ethereum"].id,
        erc20ContractAddress: "0xae78736cd615f374d3085123a210448e74fc6393",
        logoUrl: "/networks/ethereum.svg",
      },
    },
    sfrxeth: {
      ethereum: {
        id: EthereumChainInfo["Ethereum"].chainName,
        chainId: EthereumChainInfo["Ethereum"].id,
        erc20ContractAddress: "0xac3e018457b222d93114458476f3e3416abbe38f",
        logoUrl: "/networks/ethereum.svg",
      },
    },
    wsteth: {
      ethereum: {
        id: EthereumChainInfo["Ethereum"].chainName,
        chainId: EthereumChainInfo["Ethereum"].id,
        erc20ContractAddress: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
        logoUrl: "/networks/ethereum.svg",
      },
    },
    yieldeth: {
      ethereum: {
        id: EthereumChainInfo["Ethereum"].chainName,
        chainId: EthereumChainInfo["Ethereum"].id,
        erc20ContractAddress: "0xb5b29320d2Dde5BA5BAFA1EbcD270052070483ec",
        logoUrl: "/networks/ethereum.svg",
      },
    },
    wbnb: {
      binance: {
        id: isTestnet
          ? EthereumChainInfo["BSC Testnet"].chainName
          : EthereumChainInfo["Binance Smart Chain"].chainName,
        chainId: isTestnet
          ? EthereumChainInfo["BSC Testnet"].id
          : EthereumChainInfo["Binance Smart Chain"].id,
        erc20ContractAddress: isTestnet
          ? "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
          : "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        logoUrl: "/networks/binance.svg",
        nativeWrapEquivalent: {
          wrapDenom: "WBNB",
          tokenMinDenom: "bnb",
        },
      },
    },
    wmatic: {
      polygon: {
        id: isTestnet
          ? EthereumChainInfo["Mumbai"].chainName
          : EthereumChainInfo["Polygon"].chainName,
        chainId: isTestnet
          ? EthereumChainInfo["Mumbai"].id
          : EthereumChainInfo["Polygon"].id,
        erc20ContractAddress: isTestnet
          ? "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889"
          : "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
        logoUrl: "/networks/polygon.svg",
        nativeWrapEquivalent: {
          wrapDenom: "WMATIC",
          tokenMinDenom: "matic",
        },
      },
    },
    busd: {
      ethereum: {
        id: EthereumChainInfo["Ethereum"].chainName,
        chainId: EthereumChainInfo["Ethereum"].id,
        erc20ContractAddress: "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
        logoUrl: "/networks/ethereum.svg",
      },
    },
    wavax: {
      avalanche: {
        id: isTestnet
          ? EthereumChainInfo["Avalanche Fuji Testnet"].chainName
          : EthereumChainInfo["Avalanche"].chainName,
        chainId: isTestnet
          ? EthereumChainInfo["Avalanche Fuji Testnet"].id
          : EthereumChainInfo["Avalanche"].id,
        erc20ContractAddress: isTestnet
          ? "0xd00ae08403B9bbb9124bB305C09058E32C39A48c"
          : "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
        logoUrl: "/networks/avalanche.svg",
        nativeWrapEquivalent: {
          wrapDenom: "WAVAX",
          tokenMinDenom: "avax",
        },
      },
    },
    wftm: {
      fantom: {
        id: isTestnet
          ? EthereumChainInfo["Fantom Testnet"].chainName
          : EthereumChainInfo["Fantom"].chainName,
        chainId: isTestnet ? 4002 : 250,
        erc20ContractAddress: isTestnet
          ? "0x812666209b90344Ec8e528375298ab9045c2Bd08"
          : "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
        logoUrl: "/networks/fantom.svg",
        nativeWrapEquivalent: {
          wrapDenom: "WFTM",
          tokenMinDenom: "ftm",
        },
      },
    },
    polygonusdc: {
      polygon: {
        id: EthereumChainInfo["Polygon"].chainName,
        chainId: EthereumChainInfo["Polygon"].id,
        erc20ContractAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        logoUrl: "/networks/polygon.svg",
      },
    },
    avalancheusdc: {
      avalanche: {
        id: EthereumChainInfo["Avalanche"].chainName,
        chainId: EthereumChainInfo["Avalanche"].id,
        erc20ContractAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
        logoUrl: "/networks/avalanche.svg",
      },
    },
    wfil: {
      filecoin: {
        id: isTestnet
          ? EthereumChainInfo["Filecoin Hyperspace"].chainName
          : EthereumChainInfo["Filecoin"].chainName,
        chainId: isTestnet
          ? EthereumChainInfo["Filecoin Hyperspace"].id
          : EthereumChainInfo["Filecoin"].id,
        erc20ContractAddress: isTestnet
          ? "0x6C297AeD654816dc5d211c956DE816Ba923475D2"
          : "0x60E1773636CF5E4A227d9AC24F20fEca034ee25A",
        logoUrl: "/networks/filecoin.svg",
        nativeWrapEquivalent: {
          wrapDenom: "WFIL",
          tokenMinDenom: "fil",
        },
      },
    },
    arb: {
      arbitrum: {
        id: EthereumChainInfo["Arbitrum"].chainName,
        chainId: EthereumChainInfo["Arbitrum"].id,
        erc20ContractAddress: "0x912CE59144191C1204E64559FE8253a0e49E6548",
        logoUrl: "/networks/arbitrum.svg",
      },
    },
  };
};
