import { SourceChainTokenConfig } from "./types";

const IS_TESTNET = process.env.NEXT_PUBLIC_IS_TESTNET === "true";

/** https://axelarscan.io/assets
 *  Ensure that users bridge sufficient amounts from EthMainnet=>NonEthEvm via Axelar before enabling.
 */
export const SourceChainTokenConfigs: {
  [asset: string]: { [chain: string]: SourceChainTokenConfig };
} = {
  usdc: {
    ethereum: {
      id: IS_TESTNET ? ("Goerli Testnet" as const) : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x254d06f33bDc5b8ee05b2ea472107E300226659A"
        : "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // test: 'aUSDC' on metamask/etherscan
      logoUrl: "/networks/ethereum.svg",
    },
    avalanche: {
      id: IS_TESTNET
        ? ("Avalanche Fuji Testnet" as const)
        : ("Avalanche" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x57F1c63497AEe0bE305B8852b354CEc793da43bB"
        : "0xfaB550568C688d5D8A52C7d794cb93Edc26eC0eC",
      logoUrl: "/networks/avalanche.svg",
    },
    binance: {
      id: IS_TESTNET
        ? ("BSC Testnet" as const)
        : ("Binance Smart Chain" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0xc2fA98faB811B785b81c64Ac875b31CC9E40F9D2"
        : "0x4268B8F0B87b6Eae5d897996E6b845ddbD99Adf3",
      logoUrl: "/networks/binance.svg",
    },
    fantom: {
      id: IS_TESTNET ? ("Fantom Testnet" as const) : ("Fantom" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x75Cc4fDf1ee3E781C1A3Ee9151D5c6Ce34Cf5C61"
        : "0x1B6382DBDEa11d97f24495C9A90b7c88469134a4",
      logoUrl: "/networks/fantom.svg",
    },
    moonbeam: {
      id: IS_TESTNET ? ("Moonbase Alpha" as const) : ("Moonbeam" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0xD1633F7Fb3d716643125d6415d4177bC36b7186b"
        : "0xCa01a1D0993565291051daFF390892518ACfAD3A",
      logoUrl: "/networks/moonbeam.svg",
    },
    polygon: {
      id: IS_TESTNET ? ("Mumbai" as const) : ("Polygon" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x2c852e740B62308c46DD29B982FBb650D063Bd07"
        : "0x750e4C4984a9e0f12978eA6742Bc1c5D248f40ed",
      logoUrl: "/networks/polygon.svg",
    },
  },
  weth: {
    ethereum: {
      id: IS_TESTNET ? ("Goerli Testnet" as const) : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
        : "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      logoUrl: "/networks/ethereum.svg",
      nativeWrapEquivalent: {
        wrapDenom: "WETH",
        tokenMinDenom: "eth",
      },
    },
  },
  wglmr: {
    moonbeam: {
      id: IS_TESTNET ? ("Moonbase Alpha" as const) : ("Moonbeam" as const),
      erc20ContractAddress: IS_TESTNET
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
      id: "Ethereum" as const,
      erc20ContractAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      logoUrl: "/networks/ethereum.svg",
    },
  },
  dai: {
    ethereum: {
      id: "Ethereum" as const,
      erc20ContractAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      logoUrl: "/networks/ethereum.svg",
    },
  },
  dot: {
    moonbeam: {
      id: "Moonbeam" as const,
      erc20ContractAddress: "0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080",
      logoUrl: "/networks/moonbeam.svg",
    },
  },
  usdt: {
    ethereum: {
      id: "Ethereum" as const,
      erc20ContractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      logoUrl: "/networks/ethereum.svg",
    },
  },
  frax: {
    ethereum: {
      id: "Ethereum" as const,
      erc20ContractAddress: "0x853d955aCEf822Db058eb8505911ED77F175b99e",
      logoUrl: "/networks/ethereum.svg",
    },
  },
  link: {
    ethereum: {
      id: "Ethereum" as const,
      erc20ContractAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      logoUrl: "/networks/ethereum.svg",
    },
  },
  aave: {
    ethereum: {
      id: "Ethereum" as const,
      erc20ContractAddress: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
      logoUrl: "/networks/ethereum.svg",
    },
  },
  ape: {
    ethereum: {
      id: "Ethereum" as const,
      erc20ContractAddress: "0x4d224452801ACEd8B2F0aebE155379bb5D594381",
      logoUrl: "/networks/ethereum.svg",
    },
  },
  axs: {
    ethereum: {
      id: "Ethereum" as const,
      erc20ContractAddress: "0xBB0E17EF65F82Ab018d8EDd776e8DD940327B28b",
      logoUrl: "/networks/ethereum.svg",
    },
  },
  mkr: {
    ethereum: {
      id: "Ethereum" as const,
      erc20ContractAddress: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
      logoUrl: "/networks/ethereum.svg",
    },
  },
  rai: {
    ethereum: {
      id: "Ethereum" as const,
      erc20ContractAddress: "0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919",
      logoUrl: "/networks/ethereum.svg",
    },
  },
  shib: {
    ethereum: {
      id: "Ethereum" as const,
      erc20ContractAddress: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
      logoUrl: "/networks/ethereum.svg",
    },
  },
  uni: {
    ethereum: {
      id: "Ethereum" as const,
      erc20ContractAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      logoUrl: "/networks/ethereum.svg",
    },
  },
  xcn: {
    ethereum: {
      id: "Ethereum" as const,
      erc20ContractAddress: "0xA2cd3D43c775978A96BdBf12d733D5A1ED94fb18",
      logoUrl: "/networks/ethereum.svg",
    },
  },
  wbnb: {
    binance: {
      id: IS_TESTNET
        ? ("BSC Testnet" as const)
        : ("Binance Smart Chain" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
        : "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      logoUrl: "/networks/binance.svg",
      nativeWrapEquivalent: {
        wrapDenom: "wBNB",
        tokenMinDenom: "bnb",
      },
    },
  },
  wmatic: {
    polygon: {
      id: IS_TESTNET ? ("Mumbai" as const) : ("Polygon" as const),
      erc20ContractAddress: IS_TESTNET
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
      id: "Ethereum" as const,
      erc20ContractAddress: "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
      logoUrl: "/networks/ethereum.svg",
    },
  },
  wavax: {
    avalanche: {
      id: IS_TESTNET
        ? ("Avalanche Fuji Testnet" as const)
        : ("Avalanche" as const),
      erc20ContractAddress: IS_TESTNET
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
      id: IS_TESTNET ? ("Fantom Testnet" as const) : ("Fantom" as const),
      erc20ContractAddress: IS_TESTNET
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
      id: "Polygon" as const,
      erc20ContractAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      logoUrl: "/networks/polygon.svg",
    },
  },
  avalancheusdc: {
    avalanche: {
      id: "Avalanche" as const,
      erc20ContractAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
      logoUrl: "/networks/avalanche.svg",
    },
  },
};
