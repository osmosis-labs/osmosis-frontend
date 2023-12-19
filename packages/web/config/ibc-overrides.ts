import type {
  FiatRampKey,
  OriginBridgeInfo,
} from "../integrations/bridge-info";
import { AxelarSourceChainTokenConfigs } from "../integrations/bridges/axelar/axelar-source-chain-token-config";
import { IS_TESTNET } from "./env";
import type {
  MainnetAssetSymbols,
  TestnetAssetSymbols,
} from "./generated/asset-lists";

export const UNSTABLE_MSG = "Transfers are disabled due to instability";

type AdditionalDataValue = {
  /** URL if the asset requires a custom deposit external link. Must include `https://...`. */
  depositUrlOverride?: string;

  /** URL if the asset requires a custom withdrawal external link. Must include `https://...`. */
  withdrawUrlOverride?: string;

  /** Alternative chain name to display as the source chain */
  sourceChainNameOverride?: string;
  originBridgeInfo?: OriginBridgeInfo;
  /** Keys for fiat on/off ramps. Ramp must accept asset's major denom (e.g. `ATOM`). */
  fiatRamps?: { rampKey: FiatRampKey; assetKey: string }[];
  sourceSymbolOverride?: string;
};

type AdditionalData = Partial<
  Record<MainnetAssetSymbols | TestnetAssetSymbols, AdditionalDataValue>
>;

const TestnetIBCAdditionalData: Partial<
  Record<TestnetAssetSymbols, AdditionalDataValue>
> = {
  aUSDC: {
    sourceChainNameOverride: "Goerli Ethereum",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [
        AxelarSourceChainTokenConfigs.usdc.ethereum,
        AxelarSourceChainTokenConfigs.usdc.binance,
        AxelarSourceChainTokenConfigs.usdc.moonbeam,
        AxelarSourceChainTokenConfigs.usdc.polygon,
        AxelarSourceChainTokenConfigs.usdc.avalanche,
        AxelarSourceChainTokenConfigs.usdc.fantom,
      ],
    },
    fiatRamps: [{ rampKey: "layerswapcoinbase" as const, assetKey: "USDC" }],
  },
  ETH: {
    sourceChainNameOverride: "Goerli Ethereum",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.weth.ethereum],
    },
  },
};

const MainnetIBCAdditionalData: Partial<
  Record<MainnetAssetSymbols, AdditionalDataValue>
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
          logoUrl: `${process.env.NEXT_PUBLIC_BASEPATH}/networks/bitcoin.svg`,
        },
      ],
    },
  },
  WBTC: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.wbtc.ethereum],
    },
  },
  ETH: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.weth.ethereum],
    },
  },
  BNB: {
    sourceChainNameOverride: "Binance Smart Chain",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.wbnb.binance],
    },
  },
  "wstETH.axl": {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.wsteth.ethereum],
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
      bridge: "axelar" as const,
      wallets: ["metamask" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.wmatic.polygon],
    },
  },
  SHIB: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.shib.ethereum],
    },
  },
  DAI: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.dai.ethereum],
    },
  },
  AVAX: {
    sourceChainNameOverride: "Avalanche",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.wavax.avalanche],
    },
  },
  LINK: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.link.ethereum],
    },
  },
  UNI: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.uni.ethereum],
    },
  },
  BUSD: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.busd.ethereum],
    },
  },
  FIL: {
    sourceChainNameOverride: "Filecoin",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.wfil.filecoin],
    },
  },
  APT: {
    depositUrlOverride: "https://portalbridge.com/cosmos/",
    withdrawUrlOverride: "https://portalbridge.com/cosmos/",
  },
  ARB: {
    sourceChainNameOverride: "Arbitrum",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.arb.arbitrum],
    },
  },
  MKR: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.mkr.ethereum],
    },
  },
  rETH: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.reth.ethereum],
    },
  },
  AAVE: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.aave.ethereum],
    },
  },
  FRAX: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.frax.ethereum],
    },
  },
  AXS: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.axs.ethereum],
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
      bridge: "axelar" as const,
      wallets: ["metamask" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.wftm.fantom],
    },
  },
  APE: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.ape.ethereum],
    },
  },
  SUI: {
    depositUrlOverride: "https://portalbridge.com/cosmos/",
    withdrawUrlOverride: "https://portalbridge.com/cosmos/",
  },
  cbETH: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.cbeth.ethereum],
    },
  },
  PEPE: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.pepe.ethereum],
    },
  },
  sfrxETH: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.sfrxeth.ethereum],
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
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.usdt.ethereum],
    },
  },
  "USDC.axl": {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [
        AxelarSourceChainTokenConfigs.usdc.ethereum,
        AxelarSourceChainTokenConfigs.usdc.binance,
        AxelarSourceChainTokenConfigs.usdc.moonbeam,
        AxelarSourceChainTokenConfigs.usdc.polygon,
        AxelarSourceChainTokenConfigs.usdc.avalanche,
        AxelarSourceChainTokenConfigs.usdc.fantom,
      ],
    },
    fiatRamps: [{ rampKey: "layerswapcoinbase" as const, assetKey: "USDC" }],
  },
  "polygon.USDC": {
    sourceChainNameOverride: "Polygon",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.polygonusdc.polygon],
    },
  },
  "avalanche.USDC": {
    sourceChainNameOverride: "Avalanche",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [
        AxelarSourceChainTokenConfigs.avalancheusdc.avalanche,
      ],
    },
  },
  "DOT.axl": {
    sourceChainNameOverride: "Moonbeam",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.dot.moonbeam],
    },
  },
  GLMR: {
    sourceChainNameOverride: "Moonbeam",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.wglmr.moonbeam],
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
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.xcn.ethereum],
    },
  },
  BONK: {
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
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.rai.ethereum],
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
  SILK: {
    depositUrlOverride: "https://dash.scrt.network/ibc",
  },
  SIENNA: {
    depositUrlOverride: "https://wrap.scrt.network",
  },
  ECH: {
    depositUrlOverride: "https://app.ech.network/ibc",
    withdrawUrlOverride: "https://app.ech.network/ibc",
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
  PYTH: {
    depositUrlOverride: "https://portalbridge.com/cosmos/",
    withdrawUrlOverride: "https://portalbridge.com/cosmos/",
  },
  YieldETH: {
    sourceChainNameOverride: "Ethereum",
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChainTokens: [AxelarSourceChainTokenConfigs.yieldeth.ethereum],
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

export const IBCAdditionalData: AdditionalData = IS_TESTNET
  ? TestnetIBCAdditionalData
  : MainnetIBCAdditionalData;
