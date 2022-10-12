import { IBCAsset } from "../stores/assets";
import { SourceChainConfigs as AxelarSourceChainConfigs } from "../integrations/axelar";

const IS_TESTNET = process.env.NEXT_PUBLIC_IS_TESTNET === "true";
export const IS_FRONTIER = process.env.NEXT_PUBLIC_IS_FRONTIER === "true";
export const UNSTABLE_MSG = "Transfers are disabled due to instability";

/**
 * Determine the channel info per the chain.
 * Guide users to use the same channel for convenience.
 */
export const IBCAssetInfos: (IBCAsset & {
  /** URL if the asset requires a custom deposit external link. Must include `https://...`. */
  depositUrlOverride?: string;

  /** URL if the asset requires a custom withdrawal external link. Must include `https://...`. */
  withdrawUrlOverride?: string;

  /** Alternative chain name to display as the source chain */
  sourceChainNameOverride?: string;

  /** Related to showing assets on main (canonical) vs frontier (permissionless). Verified means that governance has
   *  voted on its incentivization or general approval (amongst other possibilities).
   */
  isVerified?: boolean;
})[] = [
  {
    counterpartyChainId: IS_TESTNET
      ? "axelar-testnet-lisbon-3"
      : "axelar-dojo-1",
    sourceChannelId: IS_TESTNET ? "channel-312" : "channel-208",
    destChannelId: IS_TESTNET ? "channel-22" : "channel-3",
    coinMinimalDenom: IS_TESTNET ? "uausdc" : "uusdc",
    sourceChainNameOverride: IS_TESTNET ? "Ropsten Ethereum" : "Ethereum",
    isVerified: true,
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChains: [AxelarSourceChainConfigs.usdc.ethereum],
      tokenMinDenom: IS_TESTNET ? "uausdc" : "uusdc", // test: "uausdc"
      transferFeeMinAmount: IS_TESTNET ? "150000" : "10500000", // From https://docs.axelar.dev/resources/mainnet#cross-chain-relayer-gas-fee
    },
  },
  {
    counterpartyChainId: IS_TESTNET
      ? "axelar-testnet-lisbon-3"
      : "axelar-dojo-1",
    sourceChannelId: IS_TESTNET ? "channel-312" : "channel-208",
    destChannelId: IS_TESTNET ? "channel-22" : "channel-3",
    coinMinimalDenom: "weth-wei",
    sourceChainNameOverride: IS_TESTNET ? "Ropsten Ethereum" : "Ethereum",
    isVerified: true,
    originBridgeInfo: {
      bridge: "axelar" as const,
      wallets: ["metamask" as const, "walletconnect" as const],
      method: "deposit-address" as const,
      sourceChains: [AxelarSourceChainConfigs.weth.ethereum],
      tokenMinDenom: IS_TESTNET ? "weth-wei" : "weth-wei",
      transferFeeMinAmount: IS_TESTNET ? "60000000000000" : "6300000000000000",
    },
  },
  {
    counterpartyChainId: "axelar-dojo-1",
    sourceChannelId: "channel-208",
    destChannelId: "channel-3",
    coinMinimalDenom: "wbtc-satoshi",
    depositUrlOverride:
      "https://satellite.money/?source=ethereum&destination=osmosis&asset_denom=wbtc-satoshi",
    withdrawUrlOverride:
      "https://satellite.money/?source=osmosis&destination=ethereum&asset_denom=wbtc-satoshi",
    sourceChainNameOverride: "Ethereum",
    isVerified: true,
  },
  {
    counterpartyChainId: "axelar-dojo-1",
    sourceChannelId: "channel-208",
    destChannelId: "channel-3",
    coinMinimalDenom: "dai-wei",
    depositUrlOverride:
      "https://satellite.money/?source=ethereum&destination=osmosis&asset_denom=dai-wei",
    withdrawUrlOverride:
      "https://satellite.money/?source=osmosis&destination=ethereum&asset_denom=dai-wei",
    sourceChainNameOverride: "Ethereum",
    isVerified: true,
  },
  {
    counterpartyChainId: "cosmoshub-4",
    sourceChannelId: "channel-0",
    destChannelId: "channel-141",
    coinMinimalDenom: "uatom",
    isVerified: true,
  },
  {
    counterpartyChainId: "crypto-org-chain-mainnet-1",
    sourceChannelId: "channel-5",
    destChannelId: "channel-10",
    coinMinimalDenom: "basecro",
    isVerified: true,
  },
  {
    counterpartyChainId: "juno-1",
    sourceChannelId: "channel-42",
    destChannelId: "channel-0",
    coinMinimalDenom: "ujuno",
    isVerified: true,
  },
  {
    counterpartyChainId: "axelar-dojo-1",
    sourceChannelId: "channel-208",
    destChannelId: "channel-3",
    coinMinimalDenom: "dot-planck",
    depositUrlOverride:
      "https://satellite.money/?source=moonbeam&destination=osmosis&asset_denom=dot-planck",
    withdrawUrlOverride:
      "https://satellite.money/?source=osmosis&destination=moonbeam&asset_denom=dot-planck",
    sourceChainNameOverride: "Moonbeam",
    isVerified: true,
  },
  {
    counterpartyChainId: "evmos_9001-2",
    sourceChannelId: "channel-204",
    destChannelId: "channel-0",
    coinMinimalDenom: "aevmos",
    depositUrlOverride: "https://app.evmos.org/transfer",
    withdrawUrlOverride: "https://app.evmos.org/transfer",
    isVerified: true,
  },
  {
    counterpartyChainId: "kava_2222-10",
    sourceChannelId: "channel-143",
    destChannelId: "channel-1",
    coinMinimalDenom: "ukava",
    isVerified: true,
  },
  {
    counterpartyChainId: "secret-4",
    sourceChannelId: "channel-88",
    destChannelId: "channel-1",
    coinMinimalDenom: "uscrt",
    isVerified: true,
  },
  {
    counterpartyChainId: "columbus-5",
    sourceChannelId: "channel-72",
    destChannelId: "channel-1",
    coinMinimalDenom: "uluna",
    isUnstable: true,
  },
  {
    counterpartyChainId: "columbus-5",
    sourceChannelId: "channel-72",
    destChannelId: "channel-1",
    coinMinimalDenom: "uusd",
    isUnstable: true,
  },
  {
    counterpartyChainId: "stargaze-1",
    sourceChannelId: "channel-75",
    destChannelId: "channel-0",
    coinMinimalDenom: "ustars",
    isVerified: true,
  },
  {
    counterpartyChainId: "chihuahua-1",
    sourceChannelId: "channel-113",
    destChannelId: "channel-7",
    coinMinimalDenom: "uhuahua",
    isVerified: true,
  },
  {
    counterpartyChainId: "core-1",
    sourceChannelId: "channel-4",
    destChannelId: "channel-6",
    coinMinimalDenom: "uxprt",
    isVerified: true,
  },
  {
    counterpartyChainId: "core-1",
    sourceChannelId: "channel-4",
    destChannelId: "channel-6",
    coinMinimalDenom:
      "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
    ibcTransferPathDenom:
      "transfer/channel-38/gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006",
    isVerified: true,
  },
  {
    counterpartyChainId: "akashnet-2",
    sourceChannelId: "channel-1",
    destChannelId: "channel-9",
    coinMinimalDenom: "uakt",
    isVerified: true,
  },
  {
    counterpartyChainId: "regen-1",
    sourceChannelId: "channel-8",
    destChannelId: "channel-1",
    coinMinimalDenom: "uregen",
    isVerified: true,
  },
  {
    counterpartyChainId: "sentinelhub-2",
    sourceChannelId: "channel-2",
    destChannelId: "channel-0",
    coinMinimalDenom: "udvpn",
    isVerified: true,
  },
  {
    counterpartyChainId: "irishub-1",
    sourceChannelId: "channel-6",
    destChannelId: "channel-3",
    coinMinimalDenom: "uiris",
    isVerified: true,
  },
  {
    counterpartyChainId: "iov-mainnet-ibc",
    sourceChannelId: "channel-15",
    destChannelId: "channel-2",
    coinMinimalDenom: "uiov",
    isVerified: true,
  },
  {
    counterpartyChainId: "emoney-3",
    sourceChannelId: "channel-37",
    destChannelId: "channel-0",
    coinMinimalDenom: "ungm",
    isVerified: true,
  },
  {
    counterpartyChainId: "emoney-3",
    sourceChannelId: "channel-37",
    destChannelId: "channel-0",
    coinMinimalDenom: "eeur",
    isVerified: true,
  },
  {
    counterpartyChainId: "likecoin-mainnet-2",
    sourceChannelId: "channel-53",
    destChannelId: "channel-3",
    coinMinimalDenom: "nanolike",
    isVerified: true,
  },
  {
    counterpartyChainId: "impacthub-3",
    sourceChannelId: "channel-38",
    destChannelId: "channel-4",
    coinMinimalDenom: "uixo",
    isVerified: true,
  },
  {
    counterpartyChainId: "bitcanna-1",
    sourceChannelId: "channel-51",
    destChannelId: "channel-1",
    coinMinimalDenom: "ubcna",
    isVerified: true,
  },
  {
    counterpartyChainId: "bitsong-2b",
    sourceChannelId: "channel-73",
    destChannelId: "channel-0",
    coinMinimalDenom: "ubtsg",
    isVerified: true,
  },
  {
    counterpartyChainId: "kichain-2",
    sourceChannelId: "channel-77",
    destChannelId: "channel-0",
    coinMinimalDenom: "uxki",
    isVerified: true,
  },
  {
    counterpartyChainId: "panacea-3",
    sourceChannelId: "channel-82",
    destChannelId: "channel-1",
    coinMinimalDenom: "umed",
    isVerified: true,
  },
  {
    counterpartyChainId: "bostrom",
    sourceChannelId: "channel-95",
    destChannelId: "channel-2",
    coinMinimalDenom: "boot",
    isVerified: true,
  },
  {
    counterpartyChainId: "comdex-1",
    sourceChannelId: "channel-87",
    destChannelId: "channel-1",
    coinMinimalDenom: "ucmdx",
    isVerified: true,
  },
  {
    counterpartyChainId: "cheqd-mainnet-1",
    sourceChannelId: "channel-108",
    destChannelId: "channel-0",
    coinMinimalDenom: "ncheq",
    isVerified: true,
  },
  {
    counterpartyChainId: "lum-network-1",
    sourceChannelId: "channel-115",
    destChannelId: "channel-3",
    coinMinimalDenom: "ulum",
    isVerified: true,
  },
  {
    counterpartyChainId: "vidulum-1",
    sourceChannelId: "channel-124",
    destChannelId: "channel-0",
    coinMinimalDenom: "uvdl",
    isVerified: true,
  },
  {
    counterpartyChainId: "desmos-mainnet",
    sourceChannelId: "channel-135",
    destChannelId: "channel-2",
    coinMinimalDenom: "udsm",
    isVerified: true,
  },
  {
    counterpartyChainId: "dig-1",
    sourceChannelId: "channel-128",
    destChannelId: "channel-1",
    coinMinimalDenom: "udig",
    isVerified: true,
  },
  {
    counterpartyChainId: "sommelier-3",
    sourceChannelId: "channel-165",
    destChannelId: "channel-0",
    coinMinimalDenom: "usomm",
    isVerified: true,
  },
  {
    counterpartyChainId: "sifchain-1",
    sourceChannelId: "channel-47",
    destChannelId: "channel-17",
    coinMinimalDenom: "rowan",
    isVerified: true,
  },
  {
    counterpartyChainId: "laozi-mainnet",
    sourceChannelId: "channel-148",
    destChannelId: "channel-83",
    coinMinimalDenom: "uband",
    isVerified: true,
  },
  {
    counterpartyChainId: "darchub",
    sourceChannelId: "channel-171",
    destChannelId: "channel-0",
    coinMinimalDenom: "udarc",
    isVerified: true,
  },
  {
    counterpartyChainId: "umee-1",
    sourceChannelId: "channel-184",
    destChannelId: "channel-0",
    coinMinimalDenom: "uumee",
    isVerified: true,
  },
  {
    counterpartyChainId: "gravity-bridge-3",
    sourceChannelId: "channel-144",
    destChannelId: "channel-10",
    coinMinimalDenom: "ugraviton",
    isVerified: true,
  },
  {
    counterpartyChainId: "mainnet-3",
    sourceChannelId: "channel-181",
    destChannelId: "channel-1",
    coinMinimalDenom: "udec",
    isVerified: true,
  },
  {
    counterpartyChainId: "juno-1",
    sourceChannelId: "channel-169",
    destChannelId: "channel-47",
    coinMinimalDenom:
      "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
    ics20ContractAddress:
      "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
    isVerified: true,
  },
  {
    counterpartyChainId: "carbon-1",
    sourceChannelId: "channel-188",
    destChannelId: "channel-0",
    coinMinimalDenom: "swth",
    isVerified: true,
  },
  {
    counterpartyChainId: "cerberus-chain-1",
    sourceChannelId: "channel-212",
    destChannelId: "channel-1",
    coinMinimalDenom: "ucrbrus",
    isVerified: true,
  },
  {
    counterpartyChainId: "fetchhub-4",
    sourceChannelId: "channel-229",
    destChannelId: "channel-10",
    coinMinimalDenom: "afet",
    isVerified: true,
  },
  {
    counterpartyChainId: "mantle-1",
    sourceChannelId: "channel-232",
    destChannelId: "channel-0",
    coinMinimalDenom: "umntl",
    isVerified: true,
  },
  {
    counterpartyChainId: "juno-1",
    sourceChannelId: "channel-169",
    destChannelId: "channel-47",
    coinMinimalDenom:
      "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
    ics20ContractAddress:
      "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
    isVerified: true,
  },
  {
    counterpartyChainId: "injective-1",
    sourceChannelId: "channel-122",
    destChannelId: "channel-8",
    coinMinimalDenom: "inj",
    depositUrlOverride:
      "https://hub.injective.network/bridge/?destination=osmosis&origin=injective&token=inj",
    withdrawUrlOverride:
      "https://hub.injective.network/bridge/?destination=injective&origin=osmosis&token=inj",
    isVerified: true,
  },
  {
    counterpartyChainId: "columbus-5",
    sourceChannelId: "channel-72",
    destChannelId: "channel-1",
    coinMinimalDenom: "ukrw",
    isUnstable: true,
  },
  {
    counterpartyChainId: "microtick-1",
    sourceChannelId: "channel-39",
    destChannelId: "channel-16",
    coinMinimalDenom: "utick",
    isUnstable: true,
  },
  {
    counterpartyChainId: "shentu-2.2",
    sourceChannelId: "channel-146",
    destChannelId: "channel-8",
    coinMinimalDenom: "uctk",
  },
  {
    counterpartyChainId: "juno-1",
    sourceChannelId: "channel-169",
    destChannelId: "channel-47",
    coinMinimalDenom:
      "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z",
    ics20ContractAddress:
      "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
  },
  {
    counterpartyChainId: "juno-1",
    sourceChannelId: "channel-169",
    destChannelId: "channel-47",
    coinMinimalDenom:
      "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa",
    ics20ContractAddress:
      "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
  },
  {
    counterpartyChainId: "axelar-dojo-1",
    sourceChannelId: "channel-208",
    destChannelId: "channel-3",
    coinMinimalDenom: "uusdt",
    depositUrlOverride:
      "https://satellite.money/?source=ethereum&destination=osmosis&asset_denom=uusdt",
    withdrawUrlOverride:
      "https://satellite.money/?source=osmosis&destination=ethereum&asset_denom=uusdt",
    sourceChainNameOverride: "Ethereum",
  },
  {
    counterpartyChainId: "axelar-dojo-1",
    sourceChannelId: "channel-208",
    destChannelId: "channel-3",
    coinMinimalDenom: "frax-wei",
    depositUrlOverride:
      "https://satellite.money/?source=ethereum&destination=osmosis&asset_denom=frax-wei",
    withdrawUrlOverride:
      "https://satellite.money/?source=osmosis&destination=ethereum&asset_denom=frax-wei",
    sourceChainNameOverride: "Ethereum",
  },
  {
    counterpartyChainId: "gravity-bridge-3",
    sourceChannelId: "channel-144",
    destChannelId: "channel-10",
    coinMinimalDenom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    depositUrlOverride: "https://spacestation.zone/",
    withdrawUrlOverride: "https://spacestation.zone/",
  },
  {
    counterpartyChainId: "gravity-bridge-3",
    sourceChannelId: "channel-144",
    destChannelId: "channel-10",
    coinMinimalDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    depositUrlOverride: "https://spacestation.zone/",
    withdrawUrlOverride: "https://spacestation.zone/",
  },
  {
    counterpartyChainId: "gravity-bridge-3",
    sourceChannelId: "channel-144",
    destChannelId: "channel-10",
    coinMinimalDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    depositUrlOverride: "https://spacestation.zone/",
    withdrawUrlOverride: "https://spacestation.zone/",
  },
  {
    counterpartyChainId: "gravity-bridge-3",
    sourceChannelId: "channel-144",
    destChannelId: "channel-10",
    coinMinimalDenom: "gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
    depositUrlOverride: "https://spacestation.zone/",
    withdrawUrlOverride: "https://spacestation.zone/",
  },
  {
    counterpartyChainId: "gravity-bridge-3",
    sourceChannelId: "channel-144",
    destChannelId: "channel-10",
    coinMinimalDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
    depositUrlOverride: "https://spacestation.zone/",
    withdrawUrlOverride: "https://spacestation.zone/",
  },
  {
    counterpartyChainId: "juno-1",
    sourceChannelId: "channel-169",
    destChannelId: "channel-47",
    coinMinimalDenom:
      "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq",
    ics20ContractAddress:
      "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
  },
  {
    counterpartyChainId: "pio-mainnet-1",
    sourceChannelId: "channel-222",
    destChannelId: "channel-7",
    coinMinimalDenom: "nhash",
  },
  {
    counterpartyChainId: "galaxy-1",
    sourceChannelId: "channel-236",
    destChannelId: "channel-0",
    coinMinimalDenom: "uglx",
  },
  {
    counterpartyChainId: "juno-1",
    sourceChannelId: "channel-169",
    destChannelId: "channel-47",
    coinMinimalDenom:
      "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49",
    ics20ContractAddress:
      "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
  },
  {
    counterpartyChainId: "juno-1",
    sourceChannelId: "channel-169",
    destChannelId: "channel-47",
    coinMinimalDenom:
      "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g",
    ics20ContractAddress:
      "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
  },
  {
    counterpartyChainId: "meme-1",
    sourceChannelId: "channel-238",
    destChannelId: "channel-1",
    coinMinimalDenom: "umeme",
  },
  {
    counterpartyChainId: "juno-1",
    sourceChannelId: "channel-169",
    destChannelId: "channel-47",
    coinMinimalDenom:
      "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w",
    ics20ContractAddress:
      "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
  },
  {
    counterpartyChainId: "juno-1",
    sourceChannelId: "channel-169",
    destChannelId: "channel-47",
    coinMinimalDenom:
      "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3",
    ics20ContractAddress:
      "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
  },
  {
    counterpartyChainId: "phoenix-1",
    sourceChannelId: "channel-251",
    destChannelId: "channel-1",
    coinMinimalDenom: "uluna",
    depositUrlOverride: "https://bridge.terra.money",
    withdrawUrlOverride: "https://bridge.terra.money",
  },
  {
    counterpartyChainId: "titan-1",
    sourceChannelId: "channel-221",
    destChannelId: "channel-1",
    coinMinimalDenom: "uatolo",
  },
  {
    counterpartyChainId: "kava_2222-10",
    sourceChannelId: "channel-143",
    destChannelId: "channel-1",
    coinMinimalDenom: "hard",
  },
  {
    counterpartyChainId: "kava_2222-10",
    sourceChannelId: "channel-143",
    destChannelId: "channel-1",
    coinMinimalDenom: "swp",
  },
  {
    counterpartyChainId: "axelar-dojo-1",
    sourceChannelId: "channel-208",
    destChannelId: "channel-3",
    coinMinimalDenom: "link-wei",
    depositUrlOverride:
      "https://satellite.money/?source=ethereum&destination=osmosis&asset_denom=link-wei",
    withdrawUrlOverride:
      "https://satellite.money/?source=osmosis&destination=ethereum&asset_denom=link-wei",
    sourceChainNameOverride: "Ethereum",
    isVerified: true,
  },
  {
    counterpartyChainId: "genesis_29-2",
    sourceChannelId: "channel-253",
    destChannelId: "channel-1",
    coinMinimalDenom: "el1",
  },
  {
    counterpartyChainId: "axelar-dojo-1",
    sourceChannelId: "channel-208",
    destChannelId: "channel-3",
    coinMinimalDenom: "aave-wei",
    depositUrlOverride:
      "https://satellite.money/?source=ethereum&destination=osmosis&asset_denom=aave-wei",
    withdrawUrlOverride:
      "https://satellite.money/?source=osmosis&destination=ethereum&asset_denom=aave-wei",
    sourceChainNameOverride: "Ethereum",
  },
  {
    counterpartyChainId: "axelar-dojo-1",
    sourceChannelId: "channel-208",
    destChannelId: "channel-3",
    coinMinimalDenom: "ape-wei",
    depositUrlOverride:
      "https://satellite.money/?source=ethereum&destination=osmosis&asset_denom=ape-wei",
    withdrawUrlOverride:
      "https://satellite.money/?source=osmosis&destination=ethereum&asset_denom=ape-wei",
    sourceChainNameOverride: "Ethereum",
  },
  {
    counterpartyChainId: "axelar-dojo-1",
    sourceChannelId: "channel-208",
    destChannelId: "channel-3",
    coinMinimalDenom: "axs-wei",
    depositUrlOverride:
      "https://satellite.money/?source=ethereum&destination=osmosis&asset_denom=axs-wei",
    withdrawUrlOverride:
      "https://satellite.money/?source=osmosis&destination=ethereum&asset_denom=axs-wei",
    sourceChainNameOverride: "Ethereum",
  },
  {
    counterpartyChainId: "axelar-dojo-1",
    sourceChannelId: "channel-208",
    destChannelId: "channel-3",
    coinMinimalDenom: "mkr-wei",
    depositUrlOverride:
      "https://satellite.money/?source=ethereum&destination=osmosis&asset_denom=mkr-wei",
    withdrawUrlOverride:
      "https://satellite.money/?source=osmosis&destination=ethereum&asset_denom=mkr-wei",
    sourceChainNameOverride: "Ethereum",
    isVerified: true,
  },
  {
    counterpartyChainId: "axelar-dojo-1",
    sourceChannelId: "channel-208",
    destChannelId: "channel-3",
    coinMinimalDenom: "rai-wei",
    depositUrlOverride:
      "https://satellite.money/?source=ethereum&destination=osmosis&asset_denom=rai-wei",
    withdrawUrlOverride:
      "https://satellite.money/?source=osmosis&destination=ethereum&asset_denom=rai-wei",
    sourceChainNameOverride: "Ethereum",
  },
  {
    counterpartyChainId: "axelar-dojo-1",
    sourceChannelId: "channel-208",
    destChannelId: "channel-3",
    coinMinimalDenom: "shib-wei",
    depositUrlOverride:
      "https://satellite.money/?source=ethereum&destination=osmosis&asset_denom=shib-wei",
    withdrawUrlOverride:
      "https://satellite.money/?source=osmosis&destination=ethereum&asset_denom=shib-wei",
    sourceChainNameOverride: "Ethereum",
  },
  {
    counterpartyChainId: "axelar-dojo-1",
    sourceChannelId: "channel-208",
    destChannelId: "channel-3",
    coinMinimalDenom: "uni-wei",
    depositUrlOverride:
      "https://satellite.money/?source=ethereum&destination=osmosis&asset_denom=uni-wei",
    withdrawUrlOverride:
      "https://satellite.money/?source=osmosis&destination=ethereum&asset_denom=uni-wei",
    sourceChainNameOverride: "Ethereum",
  },
  {
    counterpartyChainId: "axelar-dojo-1",
    sourceChannelId: "channel-208",
    destChannelId: "channel-3",
    coinMinimalDenom: "xcn-wei",
    depositUrlOverride:
      "https://satellite.money/?source=ethereum&destination=osmosis&asset_denom=xcn-wei",
    withdrawUrlOverride:
      "https://satellite.money/?source=osmosis&destination=ethereum&asset_denom=xcn-wei",
    sourceChainNameOverride: "Ethereum",
  },
  {
    counterpartyChainId: "kaiyo-1",
    sourceChannelId: "channel-259",
    destChannelId: "channel-3",
    coinMinimalDenom: "ukuji",
    isVerified: true,
  },
  {
    counterpartyChainId: "tgrade-mainnet-1",
    sourceChannelId: "channel-263",
    destChannelId: "channel-0",
    coinMinimalDenom: "utgd",
    isVerified: true,
  },
  {
    counterpartyChainId: "echelon_3000-3",
    sourceChannelId: "channel-262",
    destChannelId: "channel-8",
    coinMinimalDenom: "aechelon",
    depositUrlOverride: "https://app.ech.network/ibc",
    withdrawUrlOverride: "https://app.ech.network/ibc",
  },
  {
    counterpartyChainId: "odin-mainnet-freya",
    sourceChannelId: "channel-258",
    destChannelId: "channel-3",
    coinMinimalDenom: "loki",
  },
  {
    counterpartyChainId: "odin-mainnet-freya",
    sourceChannelId: "channel-258",
    destChannelId: "channel-3",
    coinMinimalDenom: "mGeo",
  },
  {
    counterpartyChainId: "odin-mainnet-freya",
    sourceChannelId: "channel-258",
    destChannelId: "channel-3",
    coinMinimalDenom: "mO9W",
  },
  {
    counterpartyChainId: "kichain-2",
    sourceChannelId: "channel-261",
    destChannelId: "channel-18",
    coinMinimalDenom:
      "cw20:ki1dt3lk455ed360pna38fkhqn0p8y44qndsr77qu73ghyaz2zv4whq83mwdy",
    ics20ContractAddress:
      "ki1hzz0s0ucrhdp6tue2lxk3c03nj6f60qy463we7lgx0wudd72ctmsd9kgha",
  },
  {
    counterpartyChainId: "axelar-dojo-1",
    sourceChannelId: "channel-208",
    destChannelId: "channel-3",
    coinMinimalDenom: "wglmr-wei",
    depositUrlOverride:
      "https://satellite.money/?source=moonbeam&destination=osmosis&asset_denom=wglmr-wei",
    withdrawUrlOverride:
      "https://satellite.money/?source=osmosis&destination=moonbeam&asset_denom=wglmr-wei",
    sourceChainNameOverride: "Moonbeam",
  },
  {
    counterpartyChainId: "juno-1",
    sourceChannelId: "channel-169",
    destChannelId: "channel-47",
    coinMinimalDenom:
      "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se",
    ics20ContractAddress:
      "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
  },
  {
    counterpartyChainId: "juno-1",
    sourceChannelId: "channel-169",
    destChannelId: "channel-47",
    coinMinimalDenom:
      "cw20:juno1gz8cf86zr4vw9cjcyyv432vgdaecvr9n254d3uwwkx9rermekddsxzageh",
    ics20ContractAddress:
      "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
  },
  {
    counterpartyChainId: "crescent-1",
    sourceChannelId: "channel-297",
    destChannelId: "channel-9",
    coinMinimalDenom: "ucre",
  },
  {
    counterpartyChainId: "LumenX",
    sourceChannelId: "channel-286",
    destChannelId: "channel-3",
    coinMinimalDenom: "ulumen",
  },
  {
    counterpartyChainId: "Oraichain",
    sourceChannelId: "channel-216",
    destChannelId: "channel-13",
    coinMinimalDenom: "orai",
  },
  {
    counterpartyChainId: "cudos-1",
    sourceChannelId: "channel-298",
    destChannelId: "channel-1",
    coinMinimalDenom: "acudos",
  },
  {
    counterpartyChainId: "kava_2222-10",
    sourceChannelId: "channel-143",
    destChannelId: "channel-1",
    coinMinimalDenom: "usdx",
  },
  {
    counterpartyChainId: "agoric-3",
    sourceChannelId: "channel-320",
    destChannelId: "channel-1",
    coinMinimalDenom: "ubld",
    isVerified: true,
  },
  {
    counterpartyChainId: "juno-1",
    sourceChannelId: "channel-169",
    destChannelId: "channel-47",
    coinMinimalDenom:
      "cw20:juno1dd0k0um5rqncfueza62w9sentdfh3ec4nw4aq4lk5hkjl63vljqscth9gv",
    ics20ContractAddress:
      "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
  },
  {
    counterpartyChainId: "juno-1",
    sourceChannelId: "channel-169",
    destChannelId: "channel-47",
    coinMinimalDenom:
      "cw20:juno1wwnhkagvcd3tjz6f8vsdsw5plqnw8qy2aj3rrhqr2axvktzv9q2qz8jxn3",
    ics20ContractAddress:
      "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
  },
  {
    counterpartyChainId: "stride-1",
    sourceChannelId: "channel-326",
    destChannelId: "channel-5",
    coinMinimalDenom: "ustrd",
  },
  {
    counterpartyChainId: "stride-1",
    sourceChannelId: "channel-326",
    destChannelId: "channel-5",
    coinMinimalDenom: "stuatom",
    isVerified: true,
  },
  {
    counterpartyChainId: "stride-1",
    sourceChannelId: "channel-326",
    destChannelId: "channel-5",
    coinMinimalDenom: "stustars",
  },
  {
    counterpartyChainId: "juno-1",
    sourceChannelId: "channel-169",
    destChannelId: "channel-47",
    coinMinimalDenom:
      "cw20:juno159q8t5g02744lxq8lfmcn6f78qqulq9wn3y9w7lxjgkz4e0a6kvsfvapse",
    ics20ContractAddress:
      "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
  },
  {
    counterpartyChainId: "juno-1",
    sourceChannelId: "channel-169",
    destChannelId: "channel-47",
    coinMinimalDenom:
      "cw20:juno19rqljkh95gh40s7qdx40ksx3zq5tm4qsmsrdz9smw668x9zdr3lqtg33mf",
    ics20ContractAddress:
      "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
  },
  {
    counterpartyChainId: "axelar-dojo-1",
    sourceChannelId: "channel-208",
    destChannelId: "channel-3",
    coinMinimalDenom: "uaxl",
    isVerified: true,
  },
  {
    counterpartyChainId: "reb_1111-1",
    sourceChannelId: "channel-355",
    destChannelId: "channel-0",
    coinMinimalDenom: "arebus",
  },
  {
    counterpartyChainId: "teritori-1",
    sourceChannelId: "channel-362",
    destChannelId: "channel-0",
    coinMinimalDenom: "utori",
  },
  {
    counterpartyChainId: "stride-1",
    sourceChannelId: "channel-326",
    destChannelId: "channel-5",
    coinMinimalDenom: "stujuno",
  },
].filter((ibcAsset) => {
  // validate IBC asset config
  if (
    (ibcAsset.depositUrlOverride || ibcAsset.depositUrlOverride) &&
    ibcAsset.originBridgeInfo
  ) {
    throw new Error("Can't have URL overrides and origin bridge config");
  }

  if (ibcAsset.originBridgeInfo?.sourceChains.length === 0) {
    throw new Error("Must have at least one source chain");
  }

  // remove outstanding mainnet Axelar assets when using testnets
  if (IS_TESTNET && ibcAsset.counterpartyChainId === "axelar-dojo-1") {
    return false;
  }

  return IS_FRONTIER ? true : ibcAsset.isVerified;
});

if (IS_TESTNET && typeof window === "undefined") {
  console.warn(
    "Reminder: clear browser cache between testnet/mainnet config change."
  );
}

export default IBCAssetInfos;
