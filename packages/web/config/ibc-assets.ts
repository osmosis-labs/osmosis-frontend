import type { AvailableAssetSymbols } from "~/config";
import type { FiatRampKey, OriginBridgeInfo } from "~/integrations";

export const IBCAdditionalData: Record<
  AvailableAssetSymbols,
  {
    /** URL if the asset requires a custom deposit external link. Must include `https://...`. */
    depositUrlOverride?: string;

    /** URL if the asset requires a custom withdrawal external link. Must include `https://...`. */
    withdrawUrlOverride?: string;
    isUnstable?: boolean;

    /** Alternative chain name to display as the source chain */
    sourceChainNameOverride?: string;
    originBridgeInfo?: OriginBridgeInfo;
    /** Keys for fiat on/off ramps. Ramp must accept asset's major denom (e.g. `ATOM`). */
    fiatRamps?: { rampKey: FiatRampKey; assetKey: string }[];
  }
> = {
  nBTC: {
    sourceChainNameOverride: "Bitcoin",
    originBridgeInfo: {
      bridge: "nomic",
      wallets: [],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Bitcoin",
          logoUrl: "/networks/bitcoin.svg",
        },
      ],
    },
  },
  WBTC: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Ethereum",
          chainId: 1,
          erc20ContractAddress: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
          logoUrl: "/networks/ethereum.svg",
        },
      ],
    },
  },
  ETH: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Ethereum",
          chainId: 1,
          erc20ContractAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          logoUrl: "/networks/ethereum.svg",
          nativeWrapEquivalent: {
            wrapDenom: "WETH",
            tokenMinDenom: "eth",
          },
        },
      ],
    },
  },
  BNB: {
    sourceChainNameOverride: "Binance Smart Chain",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Binance Smart Chain",
          chainId: 56,
          erc20ContractAddress: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
          logoUrl: "/networks/binance.svg",
          nativeWrapEquivalent: {
            wrapDenom: "WBNB",
            tokenMinDenom: "bnb",
          },
        },
      ],
    },
  },
  wstETH: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Ethereum",
          chainId: 1,
          erc20ContractAddress: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
          logoUrl: "/networks/ethereum.svg",
        },
      ],
    },
  },
  SOL: {
    depositUrlOverride: "https://portalbridge.com/cosmos/",
    withdrawUrlOverride: "https://portalbridge.com/cosmos/",
  },
  DOT: {
    depositUrlOverride:
      "https://app.trustless.zone/multihop?from=PICASSO&to=OSMOSIS",
    withdrawUrlOverride:
      "https://app.trustless.zone/multihop?from=OSMOSIS&to=PICASSO",
  },
  MATIC: {
    sourceChainNameOverride: "Polygon",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Polygon",
          chainId: 137,
          erc20ContractAddress: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
          logoUrl: "/networks/polygon.svg",
          nativeWrapEquivalent: {
            wrapDenom: "WMATIC",
            tokenMinDenom: "matic",
          },
        },
      ],
    },
  },
  SHIB: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Ethereum",
          chainId: 1,
          erc20ContractAddress: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
          logoUrl: "/networks/ethereum.svg",
        },
      ],
    },
  },
  DAI: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Ethereum",
          chainId: 1,
          erc20ContractAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
          logoUrl: "/networks/ethereum.svg",
        },
      ],
    },
  },
  AVAX: {
    sourceChainNameOverride: "Avalanche",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Avalanche",
          chainId: 43114,
          erc20ContractAddress: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
          logoUrl: "/networks/avalanche.svg",
          nativeWrapEquivalent: {
            wrapDenom: "WAVAX",
            tokenMinDenom: "avax",
          },
        },
      ],
    },
  },
  LINK: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Ethereum",
          chainId: 1,
          erc20ContractAddress: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
          logoUrl: "/networks/ethereum.svg",
        },
      ],
    },
  },
  UNI: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Ethereum",
          chainId: 1,
          erc20ContractAddress: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
          logoUrl: "/networks/ethereum.svg",
        },
      ],
    },
  },
  BUSD: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Ethereum",
          chainId: 1,
          erc20ContractAddress: "0x4Fabb145d64652a948d72533023f6E7A623C7C53",
          logoUrl: "/networks/ethereum.svg",
        },
      ],
    },
  },
  axlFIL: {
    sourceChainNameOverride: "Filecoin",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Filecoin",
          chainId: 461,
          erc20ContractAddress: "0x60E1773636CF5E4A227d9AC24F20fEca034ee25A",
          logoUrl: "/networks/filecoin.svg",
          nativeWrapEquivalent: {
            wrapDenom: "WFIL",
            tokenMinDenom: "fil",
          },
        },
      ],
    },
  },
  APT: {
    depositUrlOverride: "https://portalbridge.com/cosmos/",
    withdrawUrlOverride: "https://portalbridge.com/cosmos/",
  },
  ARB: {
    sourceChainNameOverride: "Arbitrum",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Arbitrum",
          chainId: 42161,
          erc20ContractAddress: "0x912CE59144191C1204E64559FE8253a0e49E6548",
          logoUrl: "/networks/arbitrum.svg",
        },
      ],
    },
  },
  MKR: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Ethereum",
          chainId: 1,
          erc20ContractAddress: "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
          logoUrl: "/networks/ethereum.svg",
        },
      ],
    },
  },
  rETH: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Ethereum",
          chainId: 1,
          erc20ContractAddress: "0xae78736cd615f374d3085123a210448e74fc6393",
          logoUrl: "/networks/ethereum.svg",
        },
      ],
    },
  },
  AAVE: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Ethereum",
          chainId: 1,
          erc20ContractAddress: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",
          logoUrl: "/networks/ethereum.svg",
        },
      ],
    },
  },
  FRAX: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Ethereum",
          chainId: 1,
          erc20ContractAddress: "0x853d955aCEf822Db058eb8505911ED77F175b99e",
          logoUrl: "/networks/ethereum.svg",
        },
      ],
    },
  },
  AXS: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Ethereum",
          chainId: 1,
          erc20ContractAddress: "0xBB0E17EF65F82Ab018d8EDd776e8DD940327B28b",
          logoUrl: "/networks/ethereum.svg",
        },
      ],
    },
  },
  INJ: {
    depositUrlOverride:
      "https://hub.injective.network/bridge/?destination=osmosis&origin=injective&token=inj",
    withdrawUrlOverride:
      "https://hub.injective.network/bridge/?destination=injective&origin=osmosis&token=inj",
  },
  FTM: {
    sourceChainNameOverride: "Fantom",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Fantom",
          chainId: 250,
          erc20ContractAddress: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",
          logoUrl: "/networks/fantom.svg",
          nativeWrapEquivalent: {
            wrapDenom: "WFTM",
            tokenMinDenom: "ftm",
          },
        },
      ],
    },
  },
  APE: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Ethereum",
          chainId: 1,
          erc20ContractAddress: "0x4d224452801ACEd8B2F0aebE155379bb5D594381",
          logoUrl: "/networks/ethereum.svg",
        },
      ],
    },
  },
  SUI: {
    depositUrlOverride: "https://portalbridge.com/cosmos/",
    withdrawUrlOverride: "https://portalbridge.com/cosmos/",
  },
  cbETH: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Ethereum",
          chainId: 1,
          erc20ContractAddress: "0xbe9895146f7af43049ca1c1ae358b0541ea49704",
          logoUrl: "/networks/ethereum.svg",
        },
      ],
    },
  },
  PEPE: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Ethereum",
          chainId: 1,
          erc20ContractAddress: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
          logoUrl: "/networks/ethereum.svg",
        },
      ],
    },
  },
  sfrxETH: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Ethereum",
          chainId: 1,
          erc20ContractAddress: "0xac3e018457b222d93114458476f3e3416abbe38f",
          logoUrl: "/networks/ethereum.svg",
        },
      ],
    },
  },
  SEI: {
    withdrawUrlOverride:
      "https://tfm.com/bridge?chainFrom=osmosis-1&chainTo=pacific-1&token0=ibc%2F71F11BC0AF8E526B80E44172EBA9D3F0A8E03950BB882325435691EBC9450B1D&token1=usei",
  },
  KSM: {
    depositUrlOverride:
      "https://app.trustless.zone/multihop?from=PICASSO&to=OSMOSIS",
    withdrawUrlOverride:
      "https://app.trustless.zone/multihop?from=OSMOSIS&to=PICASSO",
  },
  LUNC: {
    depositUrlOverride: "https://bridge.terra.money",
    withdrawUrlOverride: "https://bridge.terra.money",
  },
  "USDT.axl": {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Ethereum",
          chainId: 1,
          erc20ContractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
          logoUrl: "/networks/ethereum.svg",
        },
      ],
    },
  },
  "USDC.axl": {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Ethereum",
          chainId: 1,
          erc20ContractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          logoUrl: "/networks/ethereum.svg",
        },
        {
          id: "Binance Smart Chain",
          chainId: 56,
          erc20ContractAddress: "0x4268B8F0B87b6Eae5d897996E6b845ddbD99Adf3",
          logoUrl: "/networks/binance.svg",
        },
        {
          id: "Moonbeam",
          chainId: 1284,
          erc20ContractAddress: "0xCa01a1D0993565291051daFF390892518ACfAD3A",
          logoUrl: "/networks/moonbeam.svg",
        },
        {
          id: "Polygon",
          chainId: 137,
          erc20ContractAddress: "0x750e4C4984a9e0f12978eA6742Bc1c5D248f40ed",
          logoUrl: "/networks/polygon.svg",
        },
        {
          id: "Avalanche",
          chainId: 43114,
          erc20ContractAddress: "0xfaB550568C688d5D8A52C7d794cb93Edc26eC0eC",
          logoUrl: "/networks/avalanche.svg",
        },
        {
          id: "Fantom",
          chainId: 250,
          erc20ContractAddress: "0x1B6382DBDEa11d97f24495C9A90b7c88469134a4",
          logoUrl: "/networks/fantom.svg",
        },
      ],
    },
    fiatRamps: [
      {
        rampKey: "layerswapcoinbase",
        assetKey: "USDC",
      },
    ],
  },
  "polygon.USDC": {
    sourceChainNameOverride: "Polygon",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Polygon",
          chainId: 137,
          erc20ContractAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
          logoUrl: "/networks/polygon.svg",
        },
      ],
    },
  },
  "avalanche.USDC": {
    sourceChainNameOverride: "Avalanche",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Avalanche",
          chainId: 43114,
          erc20ContractAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
          logoUrl: "/networks/avalanche.svg",
        },
      ],
    },
  },
  "DOT.axl": {
    sourceChainNameOverride: "Moonbeam",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Moonbeam",
          chainId: 1284,
          erc20ContractAddress: "0xFfFFfFff1FcaCBd218EDc0EbA20Fc2308C778080",
          logoUrl: "/networks/moonbeam.svg",
        },
      ],
    },
  },
  GLMR: {
    sourceChainNameOverride: "Moonbeam",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Moonbeam",
          chainId: 1284,
          erc20ContractAddress: "0xAcc15dC74880C9944775448304B263D191c6077F",
          logoUrl: "/networks/moonbeam.svg",
          nativeWrapEquivalent: {
            wrapDenom: "WGLMR",
            tokenMinDenom: "glmr",
          },
        },
      ],
    },
  },
  KUJI: {
    depositUrlOverride:
      "https://blue.kujira.app/ibc?destination=osmosis-1&denom=ukuji",
  },
  EVMOS: {
    depositUrlOverride: "https://app.evmos.org/assets",
    withdrawUrlOverride: "https://app.evmos.org/assets",
  },
  XCN: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Ethereum",
          chainId: 1,
          erc20ContractAddress: "0xA2cd3D43c775978A96BdBf12d733D5A1ED94fb18",
          logoUrl: "/networks/ethereum.svg",
        },
      ],
    },
  },
  Bonk: {
    depositUrlOverride: "https://portalbridge.com/cosmos/",
    withdrawUrlOverride: "https://portalbridge.com/cosmos/",
  },
  SWTH: {
    depositUrlOverride:
      "https://app.dem.exchange/account/balance/withdraw/swth",
    withdrawUrlOverride:
      "https://app.dem.exchange/account/balance/deposit/swth",
  },
  RAI: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Ethereum",
          chainId: 1,
          erc20ContractAddress: "0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919",
          logoUrl: "/networks/ethereum.svg",
        },
      ],
    },
  },
  SHD: {
    depositUrlOverride: "https://dash.scrt.network/ibc",
  },
  "SHD(old)": {
    depositUrlOverride: "https://wrap.scrt.network",
  },
  MNTA: {
    depositUrlOverride:
      "https://blue.kujira.app/ibc?destination=osmosis-1&source=kaiyo-1&denom=factory%2Fkujira1643jxg8wasy5cfcn7xm8rd742yeazcksqlg4d7%2Fumnta",
  },
  USK: {
    depositUrlOverride:
      "https://blue.kujira.app/ibc?destination=osmosis-1&source=kaiyo-1&denom=factory%2Fkujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7%2Fuusk",
  },
  PLQ: {
    depositUrlOverride:
      "https://tfm.com/bridge?chainTo=osmosis-1&chainFrom=planq_7070-2&token0=aplanq&token1=ibc%2FB1E0166EA0D759FDF4B207D1F5F12210D8BFE36F2345CEFC76948CE2B36DFBAF",
  },
  PICA: {
    depositUrlOverride:
      "https://app.trustless.zone/multihop?from=PICASSO&to=OSMOSIS",
    withdrawUrlOverride:
      "https://app.trustless.zone/multihop?from=OSMOSIS&to=PICASSO",
  },
  "WBTC.grv": {
    depositUrlOverride:
      "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
    withdrawUrlOverride:
      "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
  },
  "WETH.grv": {
    depositUrlOverride:
      "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
    withdrawUrlOverride:
      "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
  },
  "USDC.grv": {
    depositUrlOverride:
      "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
    withdrawUrlOverride:
      "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
  },
  "DAI.grv": {
    depositUrlOverride:
      "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
    withdrawUrlOverride:
      "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
  },
  "USDT.grv": {
    depositUrlOverride:
      "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
    withdrawUrlOverride:
      "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
  },
  ROWAN: {
    isUnstable: true,
  },
  TICK: {
    isUnstable: true,
  },
  DIG: {
    isUnstable: true,
  },
  SILK: {
    depositUrlOverride: "https://dash.scrt.network/ibc",
  },
  SIENNA: {
    depositUrlOverride: "https://wrap.scrt.network",
  },
  CRBRUS: {
    isUnstable: true,
  },
  ECH: {
    depositUrlOverride: "https://app.ech.network/ibc",
    withdrawUrlOverride: "https://app.ech.network/ibc",
  },
  LUMEN: {
    isUnstable: true,
  },
  ALTER: {
    depositUrlOverride: "https://wrap.scrt.network",
  },
  BUTT: {
    depositUrlOverride: "https://wrap.scrt.network",
  },
  "stkd-SCRT": {
    depositUrlOverride: "https://wrap.scrt.network",
  },
  AMBER: {
    depositUrlOverride: "https://wrap.scrt.network",
  },
  arUSD: {
    depositUrlOverride: "https://app.arable.finance/#/ibc",
    withdrawUrlOverride: "https://app.arable.finance/#/ibc",
  },
  CNTO: {
    depositUrlOverride: "https://app.arable.finance/#/ibc",
    withdrawUrlOverride: "https://app.arable.finance/#/ibc",
  },
  ARKH: {
    isUnstable: true,
  },
  ROAR: {
    depositUrlOverride:
      "https://tfm.com/bridge?chainTo=osmosis-1&chainFrom=phoenix-1&token0=terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv&token1=ibc%2F98BCD43F190C6960D0005BC46BB765C827403A361C9C03C2FF694150A30284B0",
    withdrawUrlOverride:
      "https://tfm.com/bridge?chainFrom=osmosis-1&chainTo=phoenix-1&token0=ibc%2F98BCD43F190C6960D0005BC46BB765C827403A361C9C03C2FF694150A30284B0&token1=terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
  },
  CUB: {
    depositUrlOverride:
      "https://tfm.com/bridge?chainTo=osmosis-1&chainFrom=phoenix-1&token0=terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t&token1=ibc%2F6F18EFEBF1688AA77F7EAC17065609494DC1BA12AFC78E9AEC832AF70A11BEF3",
    withdrawUrlOverride:
      "https://tfm.com/bridge?chainFrom=osmosis-1&chainTo=phoenix-1&token0=ibc%2F6F18EFEBF1688AA77F7EAC17065609494DC1BA12AFC78E9AEC832AF70A11BEF3&token1=terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
  },
  BLUE: {
    depositUrlOverride:
      "https://tfm.com/bridge?chainTo=osmosis-1&chainFrom=phoenix-1&token0=terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584&token1=ibc%2FDA961FE314B009C38595FFE3AF41225D8894D663B8C3F6650DCB5B6F8435592E",
    withdrawUrlOverride:
      "https://tfm.com/bridge?chainFrom=osmosis-1&chainTo=phoenix-1&token0=ibc%2FDA961FE314B009C38595FFE3AF41225D8894D663B8C3F6650DCB5B6F8435592E&token1=terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584",
  },
  MPWR: {
    depositUrlOverride:
      "https://tfm.com/bridge?chainTo=osmosis-1&chainFrom=empowerchain-1&token0=umpwr&token1=ibc%2FDD3938D8131F41994C1F01F4EB5233DEE9A0A5B787545B9A07A321925655BF38",
  },
  "USDT.wh": {
    depositUrlOverride: "https://portalbridge.com/cosmos/",
    withdrawUrlOverride: "https://portalbridge.com/cosmos/",
  },
  "USDC.wh": {
    depositUrlOverride: "https://portalbridge.com/cosmos/",
    withdrawUrlOverride: "https://portalbridge.com/cosmos/",
  },
  "wETH.wh": {
    depositUrlOverride: "https://portalbridge.com/cosmos/",
    withdrawUrlOverride: "https://portalbridge.com/cosmos/",
  },
  YieldETH: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar",
      wallets: ["metamask", "walletconnect"],
      method: "deposit-address",
      sourceChainTokens: [
        {
          id: "Ethereum",
          chainId: 1,
          erc20ContractAddress: "0xb5b29320d2Dde5BA5BAFA1EbcD270052070483ec",
          logoUrl: "/networks/ethereum.svg",
        },
      ],
    },
  },
  XPLA: {
    depositUrlOverride: "https://ibc.xpla.io/",
  },
  NEOK: {
    depositUrlOverride: "https://app.evmos.org/assets",
  },
  RIO: {
    depositUrlOverride: "https://app.realio.network/",
  },
  FX: {
    depositUrlOverride:
      "https://starscan.io/fxbridge?from=fxcore&to=osmosis&token=FX",
  },
};
