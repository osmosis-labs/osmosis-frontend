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
  | "Avalanche FUJI C-Chain"
  | "Fantom"
  | "Fantom Testnet"
  | "Polygon"
  | "Mumbai"
  | "Moonbeam"
  | "Moonbase Alpha TestNet"
  | "Binance Smart Chain"
  | "Binance Smart Chain Testnet";

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
  uusdc: {
    avalanche: {
      id: IS_TESTNET
        ? ("Avalanche FUJI C-Chain" as const)
        : ("Avalanche" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x57F1c63497AEe0bE305B8852b354CEc793da43bB"
        : "0xfaB550568C688d5D8A52C7d794cb93Edc26eC0eC",
      logoUrl: "/networks/avalanche.svg",
    },
    binance: {
      id: IS_TESTNET
        ? ("Binance Smart Chain Testnet" as const)
        : ("Binance Smart Chain" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0xc2fA98faB811B785b81c64Ac875b31CC9E40F9D2"
        : "0x4268B8F0B87b6Eae5d897996E6b845ddbD99Adf3",
      logoUrl: "/networks/binance.svg",
    },
    ethereum: {
      id: IS_TESTNET
        ? ("Ropsten Test Network" as const)
        : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x526f0A95EDC3DF4CBDB7bb37d4F7Ed451dB8e369"
        : "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      logoUrl: "/networks/ethereum.svg",
    },
    fantom: {
      id: IS_TESTNET
        ? ("Fantom Testnet" as const)
        : ("Fantom" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x75Cc4fDf1ee3E781C1A3Ee9151D5c6Ce34Cf5C61"
        : "0x1B6382DBDEa11d97f24495C9A90b7c88469134a4",
      logoUrl: "/networks/fantom.svg",
    },
    moonbeam: {
      id: IS_TESTNET
        ? ("Moonbase Alpha TestNet" as const)
        : ("Moonbeam" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0xD1633F7Fb3d716643125d6415d4177bC36b7186b"
        : "0xCa01a1D0993565291051daFF390892518ACfAD3A",
      logoUrl: IS_TESTNET
        ? "/networks/moonbase.svg"
        : "/networks/moonbeam.svg",
    },
    polygon: {
      id: IS_TESTNET
        ? ("Mumbai" as const)
        : ("Polygon" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x2c852e740B62308c46DD29B982FBb650D063Bd07"
        : "0x750e4C4984a9e0f12978eA6742Bc1c5D248f40ed",
      logoUrl: "/networks/polygon.svg",
    },
  },
  wethwei: {
    ethereum: {
      id: IS_TESTNET
        ? ("Ropsten Test Network" as const)
        : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0xc778417E063141139Fce010982780140Aa0cD5Ab"
        : "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      logoUrl: "/networks/ethereum.svg",
    },
    avalanche: {
      id: IS_TESTNET
        ? ("Avalanche FUJI C-Chain" as const)
        : ("Avalanche" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x3613C187b3eF813619A25322595bA5E297E4C08a"
        : "",
      logoUrl: "/networks/avalanche.svg",
    },
    binance: {
      id: IS_TESTNET
        ? ("Binance Smart Chain Testnet" as const)
        : ("Binance Smart Chain" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x03Dc012b7851b7D65592Aebc40a6aF9A171E9315"
        : "",
      logoUrl: "/networks/binance.svg",
    },
    fantom: {
      id: IS_TESTNET
        ? ("Fantom Testnet" as const)
        : ("Fantom" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x930640ef299Bf772f786Cf7E88DA951D76E33168"
        : "",
      logoUrl: "/networks/fantom.svg",
    },
    moonbeam: {
      id: IS_TESTNET
        ? ("Moonbase Alpha TestNet" as const)
        : ("Moonbeam" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0xc40Fdaa2cB43C85eAA6D43856df42E7A80669fca"
        : "",
      logoUrl: IS_TESTNET
        ? "/networks/moonbase.svg"
        : "/networks/moonbeam.svg",
    },
    polygon: {
      id: IS_TESTNET
        ? ("Mumbai" as const)
        : ("Polygon" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0xfba15fFF35558fE2A469B96A90AeD7727FE38fAE"
        : "",
      logoUrl: "/networks/polygon.svg",
    },
  },
  daiwei: {
    avalanche: {
      id: IS_TESTNET
        ? ("Avalanche FUJI C-Chain" as const)
        : ("Avalanche" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0xC5Fa5669E326DA8B2C35540257cD48811F40a36B",
      logoUrl: "/networks/avalanche.svg",
    },
    ethereum: {
      id: IS_TESTNET
        ? ("Ropsten Test Network" as const)
        : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      logoUrl: "/networks/ethereum.svg",
    },
    fantom: {
      id: IS_TESTNET
        ? ("Fantom Testnet" as const)
        : ("Fantom" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0xD5d5350F42CB484036A1C1aF5F2DF77eAFadcAFF",
      logoUrl: "/networks/fantom.svg",
    },
    moonbeam: {
      id: IS_TESTNET
        ? ("Moonbase Alpha TestNet" as const)
        : ("Moonbeam" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0x14dF360966a1c4582d2b18EDbdae432EA0A27575",
      logoUrl: IS_TESTNET
        ? "/networks/moonbase.svg"
        : "/networks/moonbeam.svg",
    },
    polygon: {
      id: IS_TESTNET
        ? ("Mumbai" as const)
        : ("Polygon" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0xDDc9E2891FA11a4CC5C223145e8d14B44f3077c9",
      logoUrl: "/networks/polygon.svg",
    },
  },
  uusdt: {
    avalanche: {
      id: IS_TESTNET
        ? ("Avalanche FUJI C-Chain" as const)
        : ("Avalanche" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0xF976ba91b6bb3468C91E4f02E68B37bc64a57e66",
      logoUrl: "/networks/avalanche.svg",
    },
    ethereum: {
      id: IS_TESTNET
        ? ("Ropsten Test Network" as const)
        : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      logoUrl: "/networks/ethereum.svg",
    },
    fantom: {
      id: IS_TESTNET
        ? ("Fantom Testnet" as const)
        : ("Fantom" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0xd226392C23fb3476274ED6759D4a478db3197d82",
      logoUrl: "/networks/fantom.svg",
    },
    moonbeam: {
      id: IS_TESTNET
        ? ("Moonbase Alpha TestNet" as const)
        : ("Moonbeam" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0xDFd74aF792bC6D45D1803F425CE62Dd16f8Ae038",
      logoUrl: IS_TESTNET
        ? "/networks/moonbase.svg"
        : "/networks/moonbeam.svg",
    },
    polygon: {
      id: IS_TESTNET
        ? ("Mumbai" as const)
        : ("Polygon" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0xCeED2671d8634e3ee65000EDbbEe66139b132fBf",
      logoUrl: "/networks/polygon.svg",
    },
  },
  dotplanck: {
    moonbeam: {
      id: IS_TESTNET
        ? ("Moonbase Alpha TestNet" as const)
        : ("Moonbeam" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080",
      logoUrl: IS_TESTNET
        ? "/networks/moonbase.svg"
        : "/networks/moonbeam.svg",
    },
  },
  wavaxwei: {
    avalanche: {
      id: IS_TESTNET
        ? ("Avalanche FUJI C-Chain" as const)
        : ("Avalanche" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0xd00ae08403B9bbb9124bB305C09058E32C39A48c"
        : "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      logoUrl: "/networks/avalanche.svg",
    },
    binance: {
      id: IS_TESTNET
        ? ("Binance Smart Chain Testnet" as const)
        : ("Binance Smart Chain" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x1B29EC62efC689c462b4E0512457175793cEc9e6"
        : "",
      logoUrl: "/networks/binance.svg",
    },
    ethereum: {
      id: IS_TESTNET
        ? ("Ropsten Test Network" as const)
        : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x72af7e1e7E0D38bCF033C541598F5a0301D051A5"
        : "",
      logoUrl: "/networks/ethereum.svg",
    },
    fantom: {
      id: IS_TESTNET
        ? ("Fantom Testnet" as const)
        : ("Fantom" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x8776aDD48553518641a589C39792cc409d4C8B84"
        : "",
      logoUrl: "/networks/fantom.svg",
    },
    moonbeam: {
      id: IS_TESTNET
        ? ("Moonbase Alpha TestNet" as const)
        : ("Moonbeam" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x64aae6319934995Bf30e67EBBBA9750256E07283"
        : "",
      logoUrl: IS_TESTNET
        ? "/networks/moonbase.svg"
        : "/networks/moonbeam.svg",
    },
    polygon: {
      id: IS_TESTNET
        ? ("Mumbai" as const)
        : ("Polygon" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x6DD60c05FdA1255A44Ffaa9A8200b5b179A578D6"
        : "",
      logoUrl: "/networks/polygon.svg",
    },
  },
  wglmrwei: {
    moonbeam: {
      id: IS_TESTNET
        ? ("Moonbase Alpha TestNet" as const)
        : ("Moonbeam" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x1436aE0dF0A8663F18c0Ec51d7e2E46591730715"
        : "0xAcc15dC74880C9944775448304B263D191c6077F",
      logoUrl: IS_TESTNET
        ? "/networks/moonbase.svg"
        : "/networks/moonbeam.svg",
    },
    avalanche: {
      id: IS_TESTNET
        ? ("Avalanche FUJI C-Chain" as const)
        : ("Avalanche" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0xF58537d9061f7257e44442Fb7870A094AAE92B43"
        : "",
      logoUrl: "/networks/avalanche.svg",
    },
    binance: {
      id: IS_TESTNET
        ? ("Binance Smart Chain Testnet" as const)
        : ("Binance Smart Chain" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0xa893Fd868c3159B294f6416F512203be53315fd8"
        : "",
      logoUrl: "/networks/binance.svg",
    },
    ethereum: {
      id: IS_TESTNET
        ? ("Ropsten Test Network" as const)
        : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0xDc6B192eFa7eBab24063e20c962E74C88A012D3c"
        : "",
      logoUrl: "/networks/ethereum.svg",
    },
    fantom: {
      id: IS_TESTNET
        ? ("Fantom Testnet" as const)
        : ("Fantom" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0xD6f858A1E75e9a06c42dcd86BB876C5E9FccA572"
        : "",
      logoUrl: "/networks/fantom.svg",
    },
    polygon: {
      id: IS_TESTNET
        ? ("Mumbai" as const)
        : ("Polygon" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0xb6a2f51C219A66866263Cb18DD41EE6C51B464cB"
        : "",
      logoUrl: "/networks/polygon.svg",
    },
  },
  wmaticwei: {
    polygon: {
      id: IS_TESTNET
        ? ("Mumbai" as const)
        : ("Polygon" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889"
        : "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
      logoUrl: "/networks/polygon.svg",
    },
    avalanche: {
      id: IS_TESTNET
        ? ("Avalanche FUJI C-Chain" as const)
        : ("Avalanche" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0xB923E2374639D0605388D91CFedAfCeCE03Cfd8f"
        : "",
      logoUrl: "/networks/avalanche.svg",
    },
    binance: {
      id: IS_TESTNET
        ? ("Binance Smart Chain Testnet" as const)
        : ("Binance Smart Chain" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x920fA0DbB65cE928C29103AeC7B5c188bbea2f24"
        : "",
      logoUrl: "/networks/binance.svg",
    },
    ethereum: {
      id: IS_TESTNET
        ? ("Ropsten Test Network" as const)
        : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0xEAE61FD42A56F435a913d1570fF301a532d027b2"
        : "",
      logoUrl: "/networks/ethereum.svg",
    },
    fantom: {
      id: IS_TESTNET
        ? ("Fantom Testnet" as const)
        : ("Fantom" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x3C12d813bb36295A8361C4740A732Bb700df6Db0"
        : "",
      logoUrl: "/networks/fantom.svg",
    },
    moonbeam: {
      id: IS_TESTNET
        ? ("Moonbase Alpha TestNet" as const)
        : ("Moonbeam" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0xde3dB4FD7D7A5Cc7D8811b7BaFA4103FD90282f3"
        : "",
      logoUrl: IS_TESTNET
        ? "/networks/moonbase.svg"
        : "/networks/moonbeam.svg",
    },
  },
  wbtcsatoshi: {
    ethereum: {
      id: IS_TESTNET
        ? ("Ropsten Test Network" as const)
        : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x5db5f7d211FA88266Fb316948da0D45798e5a22f"
        : "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      logoUrl: "/networks/ethereum.svg",
    },
  },
  wbnbwei: {
    binance: {
      id: IS_TESTNET
        ? ("Binance Smart Chain Testnet" as const)
        : ("Binance Smart Chain" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
        : "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      logoUrl: "/networks/binance.svg",
    },
    avalanche: {
      id: IS_TESTNET
        ? ("Avalanche FUJI C-Chain" as const)
        : ("Avalanche" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0xd020f566723e8402f925A891605c02ce7AF2477F"
        : "",
      logoUrl: "/networks/avalanche.svg",
    },
    ethereum: {
      id: IS_TESTNET
        ? ("Ropsten Test Network" as const)
        : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x653044Df3e853e8FF96c8D9a7Ab7A90E34c4d484"
        : "",
      logoUrl: "/networks/ethereum.svg",
    },
    fantom: {
      id: IS_TESTNET
        ? ("Fantom Testnet" as const)
        : ("Fantom" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x8DA729FC44366eFE36d522B865FeC34653e85F6e"
        : "",
      logoUrl: "/networks/fantom.svg",
    },
    moonbeam: {
      id: IS_TESTNET
        ? ("Moonbase Alpha TestNet" as const)
        : ("Moonbeam" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x8d0BBbA567Ae73a06A8678e53Dc7ADD0AF6b7039"
        : "",
      logoUrl: IS_TESTNET
        ? "/networks/moonbase.svg"
        : "/networks/moonbeam.svg",
    },
    polygon: {
      id: IS_TESTNET
        ? ("Mumbai" as const)
        : ("Polygon" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x55fDE07dEF3261a41fC59B783D27A6357e8A86Df"
        : "",
      logoUrl: "/networks/polygon.svg",
    },
  },
  wftmwei: {
    fantom: {
      id: IS_TESTNET
        ? ("Fantom Testnet" as const)
        : ("Fantom" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x812666209b90344Ec8e528375298ab9045c2Bd08"
        : "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
      logoUrl: "/networks/fantom.svg",
    },
    avalanche: {
      id: IS_TESTNET
        ? ("Avalanche FUJI C-Chain" as const)
        : ("Avalanche" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0xeF721BaBf08A2eE5BCcfd2f2A34CbF4Dc9A56959"
        : "",
      logoUrl: "/networks/avalanche.svg",
    },
    binance: {
      id: IS_TESTNET
        ? ("Binance Smart Chain Testnet" as const)
        : ("Binance Smart Chain" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x90dEcD89a744a0CFbB3cc8DE08A5f3B14875B6C4"
        : "",
      logoUrl: "/networks/binance.svg",
    },
    ethereum: {
      id: IS_TESTNET
        ? ("Ropsten Test Network" as const)
        : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0xd9774230A31Bf49c3D9372Eeb55Aa10Df1807238"
        : "",
      logoUrl: "/networks/ethereum.svg",
    },
    moonbeam: {
      id: IS_TESTNET
        ? ("Moonbase Alpha TestNet" as const)
        : ("Moonbeam" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x40EebD34eC6CB4C0644a18494365171b1dcE97eb"
        : "",
      logoUrl: IS_TESTNET
        ? "/networks/moonbase.svg"
        : "/networks/moonbeam.svg",
    },
    polygon: {
      id: IS_TESTNET
        ? ("Mumbai" as const)
        : ("Polygon" as const),
      erc20ContractAddress: IS_TESTNET
        ? "0x62b6F2A4eE6a4801bfcD2056d19c6d71654D2582"
        : "",
      logoUrl: "/networks/polygon.svg",
    },
  },
  raiwei: {
    ethereum: {
      id: IS_TESTNET
        ? ("Ropsten Test Network" as const)
        : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919",
      logoUrl: "/networks/ethereum.svg",
    },
  },
  linkwei: {
    ethereum: {
      id: IS_TESTNET
        ? ("Ropsten Test Network" as const)
        : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      logoUrl: "/networks/ethereum.svg",
    },
  },
  aavewei: {
    ethereum: {
      id: IS_TESTNET
        ? ("Ropsten Test Network" as const)
        : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
      logoUrl: "/networks/ethereum.svg",
    },
  },
  fraxwei: {
    avalanche: {
      id: IS_TESTNET
        ? ("Avalanche FUJI C-Chain" as const)
        : ("Avalanche" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0x4914886dBb8aAd7A7456D471EAab10b06d42348D",
      logoUrl: "/networks/avalanche.svg",
    },
    ethereum: {
      id: IS_TESTNET
        ? ("Ropsten Test Network" as const)
        : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0x853d955aCEf822Db058eb8505911ED77F175b99e",
      logoUrl: "/networks/ethereum.svg",
    },
    fantom: {
      id: IS_TESTNET
        ? ("Fantom Testnet" as const)
        : ("Fantom" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0xbE71e68fB36d14565F523C9c36ab2A8Be0c26D55",
      logoUrl: "/networks/fantom.svg",
    },
    moonbeam: {
      id: IS_TESTNET
        ? ("Moonbase Alpha TestNet" as const)
        : ("Moonbeam" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0x61C82805453a989E99B544DFB7031902e9bac448",
      logoUrl: IS_TESTNET
        ? "/networks/moonbase.svg"
        : "/networks/moonbeam.svg",
    },
    polygon: {
      id: IS_TESTNET
        ? ("Mumbai" as const)
        : ("Polygon" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0x53Adc464b488bE8C5d7269B9ABBCe8bA74195C3a",
      logoUrl: "/networks/polygon.svg",
    },
  },
  apewei: {
    ethereum: {
      id: IS_TESTNET
        ? ("Ropsten Test Network" as const)
        : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0x4d224452801ACEd8B2F0aebE155379bb5D594381",
      logoUrl: "/networks/ethereum.svg",
    },
  },
  uniwei: {
    ethereum: {
      id: IS_TESTNET
        ? ("Ropsten Test Network" as const)
        : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      logoUrl: "/networks/ethereum.svg",
    },
  },
  shibwei: {
    ethereum: {
      id: IS_TESTNET
        ? ("Ropsten Test Network" as const)
        : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
      logoUrl: "/networks/ethereum.svg",
    },
  },
  axswei: {
    ethereum: {
      id: IS_TESTNET
        ? ("Ropsten Test Network" as const)
        : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0xBB0E17EF65F82Ab018d8EDd776e8DD940327B28b",
      logoUrl: "/networks/ethereum.svg",
    },
  },
  xcnwei: {
    ethereum: {
      id: IS_TESTNET
        ? ("Ropsten Test Network" as const)
        : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0xA2cd3D43c775978A96BdBf12d733D5A1ED94fb18",
      logoUrl: "/networks/ethereum.svg",
    },
  },
  mkrwei: {
    ethereum: {
      id: IS_TESTNET
        ? ("Ropsten Test Network" as const)
        : ("Ethereum" as const),
      erc20ContractAddress: IS_TESTNET
        ? ""
        : "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
      logoUrl: "/networks/ethereum.svg",
    },
  },
};
