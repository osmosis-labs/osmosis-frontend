import { IS_TESTNET } from "~/config/env";
import { SourceChainTokenConfigs as AxelarSourceChainConfigs } from "~/integrations/axelar";
import { IBCAsset } from "~/stores/assets";

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
})[] = IS_TESTNET
  ? [
      {
        counterpartyChainId: "theta-testnet-001",
        sourceChannelId: "channel-12",
        destChannelId: "channel-2500",
        coinMinimalDenom: "uatom",
        isVerified: true,
      },
      {
        counterpartyChainId: "ares-1",
        sourceChannelId: "channel-24",
        destChannelId: "channel-14",
        coinMinimalDenom: "umars",
        isVerified: true,
      },
      {
        counterpartyChainId: "axelar-testnet-lisbon-3",
        sourceChannelId: "channel-3",
        destChannelId: "channel-227",
        coinMinimalDenom: "uausdc",
        sourceChainNameOverride: "Goerli Ethereum",
        isVerified: true,
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [
            AxelarSourceChainConfigs.usdc.ethereum,
            AxelarSourceChainConfigs.usdc.binance,
            AxelarSourceChainConfigs.usdc.moonbeam,
            AxelarSourceChainConfigs.usdc.polygon,
            AxelarSourceChainConfigs.usdc.avalanche,
            AxelarSourceChainConfigs.usdc.fantom,
          ],
        },
        fiatRamps: [
          { rampKey: "layerswapcoinbase" as const, assetKey: "USDC" },
        ],
      },
      {
        counterpartyChainId: "uni-6",
        sourceChannelId: "channel-1",
        destChannelId: "channel-190",
        coinMinimalDenom: "ujunox",
        isVerified: true,
      },
      {
        counterpartyChainId: "grand-1",
        sourceChannelId: "channel-6",
        destChannelId: "channel-6",
        coinMinimalDenom: "uusdc",
        isVerified: true,
      },
      {
        counterpartyChainId: "sandbox",
        sourceChannelId: "channel-73",
        destChannelId: "channel-1",
        coinMinimalDenom: "uakt",
        isVerified: true,
      },
      {
        counterpartyChainId: "kaon-1",
        sourceChannelId: "channel-10",
        destChannelId: "channel-2",
        coinMinimalDenom: "tkyve",
        isVerified: true,
      },
      {
        counterpartyChainId: "babajaga-1",
        sourceChannelId: "channel-111",
        destChannelId: "channel-0",
        coinMinimalDenom: "uc4e",
        isVerified: true,
      },
      {
        counterpartyChainId: "rhye-1",
        sourceChannelId: "channel-13",
        destChannelId: "channel-20",
        coinMinimalDenom: "uqck",
        isVerified: true,
      },
      {
        counterpartyChainId: "rila-1",
        sourceChannelId: "channel-110",
        destChannelId: "channel-0",
        coinMinimalDenom: "unls",
        isVerified: true,
      },
    ]
  : [
      {
        counterpartyChainId: "mars-1",
        sourceChannelId: "channel-557",
        destChannelId: "channel-1",
        coinMinimalDenom: "umars",
        isVerified: true,
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "wbtc-satoshi",
        sourceChainNameOverride: "Ethereum",
        isVerified: true,
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.wbtc.ethereum],
        },
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "weth-wei",
        sourceChainNameOverride: "Ethereum",
        isVerified: true,
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.weth.ethereum],
        },
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "uusdt",
        sourceChainNameOverride: "Ethereum",
        isVerified: true,
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.usdt.ethereum],
        },
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "uusdc",
        sourceChainNameOverride: "Ethereum",
        isVerified: true,
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [
            AxelarSourceChainConfigs.usdc.ethereum,
            AxelarSourceChainConfigs.usdc.binance,
            AxelarSourceChainConfigs.usdc.moonbeam,
            AxelarSourceChainConfigs.usdc.polygon,
            AxelarSourceChainConfigs.usdc.avalanche,
            AxelarSourceChainConfigs.usdc.fantom,
          ],
        },
        fiatRamps: [
          { rampKey: "layerswapcoinbase" as const, assetKey: "USDC" },
        ],
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "wbnb-wei",
        sourceChainNameOverride: "Binance Smart Chain",
        isVerified: true,
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.wbnb.binance],
        },
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "busd-wei",
        sourceChainNameOverride: "Ethereum",
        isVerified: true,
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.busd.ethereum],
        },
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "wmatic-wei",
        sourceChainNameOverride: "Polygon",
        isVerified: true,
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.wmatic.polygon],
        },
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "dot-planck",
        sourceChainNameOverride: "Moonbeam",
        isVerified: true,
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.dot.moonbeam],
        },
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "shib-wei",
        sourceChainNameOverride: "Ethereum",
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.shib.ethereum],
        },
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "wavax-wei",
        sourceChainNameOverride: "Avalanche",
        isVerified: true,
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.wavax.avalanche],
        },
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "dai-wei",
        sourceChainNameOverride: "Ethereum",
        isVerified: true,
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.dai.ethereum],
        },
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "uni-wei",
        sourceChainNameOverride: "Ethereum",
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.uni.ethereum],
        },
      },
      {
        counterpartyChainId: "cosmoshub-4",
        sourceChannelId: "channel-0",
        destChannelId: "channel-141",
        coinMinimalDenom: "uatom",
        isVerified: true,
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "link-wei",
        sourceChainNameOverride: "Ethereum",
        isVerified: true,
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.link.ethereum],
        },
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "wfil-wei",
        sourceChainNameOverride: "Filecoin",
        isVerified: true,
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.wfil.filecoin],
        },
      },
      {
        counterpartyChainId: "crypto-org-chain-mainnet-1",
        sourceChannelId: "channel-5",
        destChannelId: "channel-10",
        coinMinimalDenom: "basecro",
        isVerified: true,
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "arb-wei",
        sourceChainNameOverride: "Arbitrum",
        isVerified: true,
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.arb.arbitrum],
        },
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "ape-wei",
        sourceChainNameOverride: "Ethereum",
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.ape.ethereum],
        },
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "pepe-wei",
        sourceChainNameOverride: "Ethereum",
        isVerified: true,
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.pepe.ethereum],
        },
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "cbeth-wei",
        sourceChainNameOverride: "Ethereum",
        isVerified: true,
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.cbeth.ethereum],
        },
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "reth-wei",
        sourceChainNameOverride: "Ethereum",
        isVerified: true,
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.reth.ethereum],
        },
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "sfrxeth-wei",
        sourceChainNameOverride: "Ethereum",
        isVerified: true,
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.sfrxeth.ethereum],
        },
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "wsteth-wei",
        sourceChainNameOverride: "Ethereum",
        isVerified: true,
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.wsteth.ethereum],
        },
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "aave-wei",
        sourceChainNameOverride: "Ethereum",
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.aave.ethereum],
        },
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "axs-wei",
        sourceChainNameOverride: "Ethereum",
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.axs.ethereum],
        },
      },
      {
        counterpartyChainId: "columbus-5",
        sourceChannelId: "channel-72",
        destChannelId: "channel-1",
        coinMinimalDenom: "uluna",
        isVerified: true,
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "frax-wei",
        sourceChainNameOverride: "Ethereum",
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.frax.ethereum],
        },
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "wftm-wei",
        sourceChainNameOverride: "Fantom",
        isVerified: true,
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.wftm.fantom],
        },
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "mkr-wei",
        sourceChainNameOverride: "Ethereum",
        isVerified: true,
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.mkr.ethereum],
        },
      },
      {
        counterpartyChainId: "phoenix-1",
        sourceChannelId: "channel-251",
        destChannelId: "channel-1",
        coinMinimalDenom: "uluna",
        isVerified: true,
        depositUrlOverride: "https://bridge.terra.money",
        withdrawUrlOverride: "https://bridge.terra.money",
      },
      {
        counterpartyChainId: "kava_2222-10",
        sourceChannelId: "channel-143",
        destChannelId: "channel-1",
        coinMinimalDenom: "ukava",
        isVerified: true,
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "xcn-wei",
        sourceChainNameOverride: "Ethereum",
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.xcn.ethereum],
        },
      },
      {
        counterpartyChainId: "fetchhub-4",
        sourceChannelId: "channel-229",
        destChannelId: "channel-10",
        coinMinimalDenom: "afet",
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
        counterpartyChainId: "columbus-5",
        sourceChannelId: "channel-72",
        destChannelId: "channel-1",
        coinMinimalDenom: "uusd",
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "wglmr-wei",
        sourceChainNameOverride: "Moonbeam",
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.wglmr.moonbeam],
        },
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
        counterpartyChainId: "evmos_9001-2",
        sourceChannelId: "channel-204",
        destChannelId: "channel-0",
        coinMinimalDenom: "aevmos",
        depositUrlOverride: "https://app.evmos.org/assets",
        withdrawUrlOverride: "https://app.evmos.org/assets",
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
        counterpartyChainId: "canto_7700-1",
        sourceChannelId: "channel-550",
        destChannelId: "channel-5",
        coinMinimalDenom: "acanto",
        isVerified: false,
      },
      {
        counterpartyChainId: "agoric-3",
        sourceChannelId: "channel-320",
        destChannelId: "channel-1",
        coinMinimalDenom: "ubld",
        isVerified: true,
      },
      {
        counterpartyChainId: "kava_2222-10",
        sourceChannelId: "channel-143",
        destChannelId: "channel-1",
        coinMinimalDenom: "usdx",
      },
      {
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-42",
        destChannelId: "channel-0",
        coinMinimalDenom: "ujuno",
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
        counterpartyChainId: "core-1",
        sourceChannelId: "channel-4",
        destChannelId: "channel-6",
        coinMinimalDenom: "uxprt",
        isVerified: true,
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "uaxl",
        isVerified: true,
      },
      {
        counterpartyChainId: "shentu-2.2",
        sourceChannelId: "channel-146",
        destChannelId: "channel-8",
        coinMinimalDenom: "uctk",
      },
      {
        counterpartyChainId: "akashnet-2",
        sourceChannelId: "channel-1",
        destChannelId: "channel-9",
        coinMinimalDenom: "uakt",
        isVerified: true,
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "polygon-uusdc",
        sourceChainNameOverride: "Polygon",
        isVerified: false,
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.polygonusdc.polygon],
        },
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "avalanche-uusdc",
        sourceChainNameOverride: "Avalanche",
        isVerified: false,
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.avalancheusdc.avalanche],
        },
      },
      {
        counterpartyChainId: "kaiyo-1",
        sourceChannelId: "channel-259",
        destChannelId: "channel-3",
        coinMinimalDenom: "ukuji",
        depositUrlOverride:
          "https://blue.kujira.app/ibc?destination=osmosis-1&denom=ukuji",
        // withdrawUrlOverride:
        //   "https://blue.kujira.app/ibc?destination=kaiyo-1&source=osmosis-1&denom=ukuji",
        isVerified: true,
      },
      {
        counterpartyChainId: "stargaze-1",
        sourceChannelId: "channel-75",
        destChannelId: "channel-0",
        coinMinimalDenom: "ustars",
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
        counterpartyChainId: "regen-1",
        sourceChannelId: "channel-8",
        destChannelId: "channel-1",
        coinMinimalDenom: "eco.uC.NCT",
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
        counterpartyChainId: "irishub-1",
        sourceChannelId: "channel-6",
        destChannelId: "channel-3",
        coinMinimalDenom: "uiris",
        isVerified: true,
      },
      {
        counterpartyChainId: "kava_2222-10",
        sourceChannelId: "channel-143",
        destChannelId: "channel-1",
        coinMinimalDenom: "hard",
      },
      {
        counterpartyChainId: "stride-1",
        sourceChannelId: "channel-326",
        destChannelId: "channel-5",
        coinMinimalDenom: "ustrd",
        isVerified: true,
      },
      {
        counterpartyChainId: "stride-1",
        sourceChannelId: "channel-326",
        destChannelId: "channel-5",
        coinMinimalDenom: "stuosmo",
        isVerified: true,
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
        coinMinimalDenom: "stujuno",
        isVerified: true,
      },
      {
        counterpartyChainId: "stride-1",
        sourceChannelId: "channel-326",
        destChannelId: "channel-5",
        coinMinimalDenom: "stustars",
        isVerified: true,
      },
      {
        counterpartyChainId: "stride-1",
        sourceChannelId: "channel-326",
        destChannelId: "channel-5",
        coinMinimalDenom: "stuluna",
        isVerified: true,
      },
      {
        counterpartyChainId: "stride-1",
        sourceChannelId: "channel-326",
        destChannelId: "channel-5",
        coinMinimalDenom: "staevmos",
        isVerified: true,
      },
      {
        counterpartyChainId: "stride-1",
        sourceChannelId: "channel-326",
        destChannelId: "channel-5",
        coinMinimalDenom: "stuumee",
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
        counterpartyChainId: "umee-1",
        sourceChannelId: "channel-184",
        destChannelId: "channel-0",
        coinMinimalDenom: "uumee",
        isVerified: true,
      },
      {
        counterpartyChainId: "Oraichain",
        sourceChannelId: "channel-216",
        destChannelId: "channel-13",
        coinMinimalDenom: "orai",
      },
      {
        counterpartyChainId: "crescent-1",
        sourceChannelId: "channel-297",
        destChannelId: "channel-9",
        coinMinimalDenom: "ucre",
      },
      {
        counterpartyChainId: "cudos-1",
        sourceChannelId: "channel-298",
        destChannelId: "channel-1",
        coinMinimalDenom: "acudos",
      },
      {
        counterpartyChainId: "carbon-1",
        sourceChannelId: "channel-188",
        destChannelId: "channel-0",
        coinMinimalDenom: "swth",
        isVerified: true,
        depositUrlOverride:
          "https://app.dem.exchange/account/balance/withdraw/swth",
        withdrawUrlOverride:
          "https://app.dem.exchange/account/balance/deposit/swth",
      },
      {
        counterpartyChainId: "axelar-dojo-1",
        sourceChannelId: "channel-208",
        destChannelId: "channel-3",
        coinMinimalDenom: "rai-wei",
        sourceChainNameOverride: "Ethereum",
        originBridgeInfo: {
          bridge: "axelar" as const,
          wallets: ["metamask" as const, "walletconnect" as const],
          method: "deposit-address" as const,
          sourceChainTokens: [AxelarSourceChainConfigs.rai.ethereum],
        },
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
        counterpartyChainId: "kava_2222-10",
        sourceChannelId: "channel-143",
        destChannelId: "channel-1",
        coinMinimalDenom: "swp",
      },
      {
        // SHD (old)
        counterpartyChainId: "secret-4",
        sourceChannelId: "channel-476",
        destChannelId: "channel-44",
        coinMinimalDenom: "cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d",
        depositUrlOverride: "https://wrap.scrt.network",
        ics20ContractAddress: "secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
      },
      {
        // SHD
        counterpartyChainId: "secret-4",
        sourceChannelId: "channel-476",
        destChannelId: "channel-44",
        coinMinimalDenom: "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
        ics20ContractAddress: "secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
        depositUrlOverride: "https://dash.scrt.network/ibc",
      },
      {
        // SILK
        counterpartyChainId: "secret-4",
        sourceChannelId: "channel-476",
        destChannelId: "channel-44",
        coinMinimalDenom: "cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd",
        ics20ContractAddress: "secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
        depositUrlOverride: "https://dash.scrt.network/ibc",
      },
      {
        counterpartyChainId: "bostrom",
        sourceChannelId: "channel-95",
        destChannelId: "channel-2",
        coinMinimalDenom: "boot",
      },
      {
        counterpartyChainId: "emoney-3",
        sourceChannelId: "channel-37",
        destChannelId: "channel-0",
        coinMinimalDenom: "ungm",
        isVerified: true,
      },
      {
        counterpartyChainId: "teritori-1",
        sourceChannelId: "channel-362",
        destChannelId: "channel-0",
        coinMinimalDenom: "utori",
      },
      {
        counterpartyChainId: "sentinelhub-2",
        sourceChannelId: "channel-2",
        destChannelId: "channel-0",
        coinMinimalDenom: "udvpn",
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
        counterpartyChainId: "gravity-bridge-3",
        sourceChannelId: "channel-144",
        destChannelId: "channel-10",
        coinMinimalDenom: "gravity0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
        depositUrlOverride:
          "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
        withdrawUrlOverride:
          "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
      },
      {
        counterpartyChainId: "gravity-bridge-3",
        sourceChannelId: "channel-144",
        destChannelId: "channel-10",
        coinMinimalDenom: "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        depositUrlOverride:
          "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
        withdrawUrlOverride:
          "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
      },
      {
        counterpartyChainId: "gravity-bridge-3",
        sourceChannelId: "channel-144",
        destChannelId: "channel-10",
        coinMinimalDenom: "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        depositUrlOverride:
          "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
        withdrawUrlOverride:
          "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
      },
      {
        counterpartyChainId: "gravity-bridge-3",
        sourceChannelId: "channel-144",
        destChannelId: "channel-10",
        coinMinimalDenom: "gravity0x6B175474E89094C44Da98b954EedeAC495271d0F",
        depositUrlOverride:
          "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
        withdrawUrlOverride:
          "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
      },
      {
        counterpartyChainId: "gravity-bridge-3",
        sourceChannelId: "channel-144",
        destChannelId: "channel-10",
        coinMinimalDenom: "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7",
        depositUrlOverride:
          "https://bridge.blockscape.network/?from=gravitybridge&to=osmosis",
        withdrawUrlOverride:
          "https://bridge.blockscape.network/?from=osmosis&to=gravitybridge",
      },
      {
        counterpartyChainId: "mantle-1",
        sourceChannelId: "channel-232",
        destChannelId: "channel-0",
        coinMinimalDenom: "umntl",
        isVerified: true,
      },
      {
        counterpartyChainId: "emoney-3",
        sourceChannelId: "channel-37",
        destChannelId: "channel-0",
        coinMinimalDenom: "eeur",
        isVerified: false,
      },
      {
        // SIENNA
        counterpartyChainId: "secret-4",
        sourceChannelId: "channel-476",
        destChannelId: "channel-44",
        coinMinimalDenom: "cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4",
        depositUrlOverride: "https://wrap.scrt.network",
        ics20ContractAddress: "secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
      },
      {
        counterpartyChainId: "lambda_92000-1",
        sourceChannelId: "channel-378",
        destChannelId: "channel-2",
        coinMinimalDenom: "ulamb",
      },
      {
        counterpartyChainId: "likecoin-mainnet-2",
        sourceChannelId: "channel-53",
        destChannelId: "channel-3",
        coinMinimalDenom: "nanolike",
        isVerified: true,
      },
      {
        counterpartyChainId: "agoric-3",
        sourceChannelId: "channel-320",
        destChannelId: "channel-1",
        coinMinimalDenom: "uist",
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
        counterpartyChainId: "mainnet-3",
        sourceChannelId: "channel-181",
        destChannelId: "channel-1",
        coinMinimalDenom: "udec",
        isVerified: true,
      },
      {
        counterpartyChainId: "sifchain-1",
        sourceChannelId: "channel-47",
        destChannelId: "channel-17",
        coinMinimalDenom: "rowan",
        isUnstable: true,
      },
      {
        counterpartyChainId: "kaiyo-1",
        sourceChannelId: "channel-259",
        destChannelId: "channel-3",
        coinMinimalDenom:
          "factory/kujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7/uusk",
        depositUrlOverride:
          "https://blue.kujira.app/ibc?destination=osmosis-1&source=kaiyo-1&denom=factory%2Fkujira1qk00h5atutpsv900x202pxx42npjr9thg58dnqpa72f2p7m2luase444a7%2Fuusk",
        withdrawUrlOverride:
          "https://blue.kujira.app/ibc?destination=kaiyo-1&source=osmosis-1&denom=ibc%2F44492EAB24B72E3FB59B9FA619A22337FB74F95D8808FE6BC78CC0E6C18DC2EC",
      },
      {
        counterpartyChainId: "acre_9052-1",
        sourceChannelId: "channel-490",
        destChannelId: "channel-0",
        coinMinimalDenom: "aacre",
      },
      {
        counterpartyChainId: "bitsong-2b",
        sourceChannelId: "channel-73",
        destChannelId: "channel-0",
        coinMinimalDenom: "ubtsg",
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
        counterpartyChainId: "odin-mainnet-freya",
        sourceChannelId: "channel-258",
        destChannelId: "channel-3",
        coinMinimalDenom: "mGeo",
      },
      {
        counterpartyChainId: "vidulum-1",
        sourceChannelId: "channel-124",
        destChannelId: "channel-0",
        coinMinimalDenom: "uvdl",
        isVerified: true,
      },
      {
        counterpartyChainId: "microtick-1",
        sourceChannelId: "channel-39",
        destChannelId: "channel-16",
        coinMinimalDenom: "utick",
        isUnstable: true,
      },
      {
        counterpartyChainId: "titan-1",
        sourceChannelId: "channel-221",
        destChannelId: "channel-1",
        coinMinimalDenom: "uatolo",
      },
      //-------No CoinGecko Market Capitalization-------
      {
        counterpartyChainId: "chihuahua-1",
        sourceChannelId: "channel-113",
        destChannelId: "channel-7",
        coinMinimalDenom: "uhuahua",
        isVerified: true,
      },
      {
        counterpartyChainId: "ixo-5",
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
        counterpartyChainId: "lum-network-1",
        sourceChannelId: "channel-115",
        destChannelId: "channel-3",
        coinMinimalDenom: "ulum",
        isVerified: true,
      },
      {
        counterpartyChainId: "dig-1",
        sourceChannelId: "channel-128",
        destChannelId: "channel-1",
        coinMinimalDenom: "udig",
        isVerified: true,
        isUnstable: true,
      },
      {
        counterpartyChainId: "sommelier-3",
        sourceChannelId: "channel-165",
        destChannelId: "channel-0",
        coinMinimalDenom: "usomm",
        isVerified: true,
      },
      {
        counterpartyChainId: "darchub",
        sourceChannelId: "channel-171",
        destChannelId: "channel-0",
        coinMinimalDenom: "udarc",
      },
      {
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        counterpartyChainId: "cerberus-chain-1",
        sourceChannelId: "channel-212",
        destChannelId: "channel-1",
        coinMinimalDenom: "ucrbrus",
        isUnstable: true,
      },
      {
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        counterpartyChainId: "columbus-5",
        sourceChannelId: "channel-72",
        destChannelId: "channel-1",
        coinMinimalDenom: "ukrw",
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
        counterpartyChainId: "genesis_29-2",
        sourceChannelId: "channel-253",
        destChannelId: "channel-1",
        coinMinimalDenom: "el1",
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
        sourceChannelId: "channel-403",
        destChannelId: "channel-11",
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
        counterpartyChainId: "LumenX",
        sourceChannelId: "channel-286",
        destChannelId: "channel-3",
        coinMinimalDenom: "ulumen",
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
        counterpartyChainId: "reb_1111-1",
        sourceChannelId: "channel-355",
        destChannelId: "channel-0",
        coinMinimalDenom: "arebus",
      },
      {
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1p8x807f6h222ur0vssqy3qk6mcpa40gw2pchquz5atl935t7kvyq894ne3",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        counterpartyChainId: "FUND-MainNet-2",
        sourceChannelId: "channel-382",
        destChannelId: "channel-0",
        coinMinimalDenom: "nund",
      },
      {
        counterpartyChainId: "jackal-1",
        sourceChannelId: "channel-412",
        destChannelId: "channel-0",
        coinMinimalDenom: "ujkl",
        isVerified: true,
      },
      {
        // ALTER
        counterpartyChainId: "secret-4",
        sourceChannelId: "channel-476",
        destChannelId: "channel-44",
        coinMinimalDenom: "cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej",
        depositUrlOverride: "https://wrap.scrt.network",
        ics20ContractAddress: "secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
      },
      {
        // BUTT
        counterpartyChainId: "secret-4",
        sourceChannelId: "channel-476",
        destChannelId: "channel-44",
        coinMinimalDenom: "cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt",
        depositUrlOverride: "https://wrap.scrt.network",
        ics20ContractAddress: "secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
      },
      {
        // stkd-SCRT
        counterpartyChainId: "secret-4",
        sourceChannelId: "channel-476",
        destChannelId: "channel-44",
        coinMinimalDenom: "cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4",
        depositUrlOverride: "https://wrap.scrt.network",
        ics20ContractAddress: "secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
      },
      {
        counterpartyChainId: "beezee-1",
        sourceChannelId: "channel-340",
        destChannelId: "channel-0",
        coinMinimalDenom: "ubze",
      },
      {
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1cltgm8v842gu54srmejewghnd6uqa26lzkpa635wzra9m9xuudkqa2gtcz",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        counterpartyChainId: "comdex-1",
        sourceChannelId: "channel-87",
        destChannelId: "channel-1",
        coinMinimalDenom: "ucmst",
        isVerified: true,
      },
      {
        counterpartyChainId: "imversed_5555555-1",
        sourceChannelId: "channel-517",
        destChannelId: "channel-1",
        coinMinimalDenom: "aimv",
      },
      {
        counterpartyChainId: "medasdigital-1",
        sourceChannelId: "channel-519",
        destChannelId: "channel-0",
        coinMinimalDenom: "umedas",
      },
      {
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1rws84uz7969aaa7pej303udhlkt3j9ca0l3egpcae98jwak9quzq8szn2l",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        counterpartyChainId: "secret-4",
        sourceChannelId: "channel-476",
        destChannelId: "channel-44",
        coinMinimalDenom: "cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852",
        depositUrlOverride: "https://wrap.scrt.network",
        ics20ContractAddress: "secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
      },
      {
        counterpartyChainId: "onomy-mainnet-1",
        sourceChannelId: "channel-525",
        destChannelId: "channel-0",
        coinMinimalDenom: "anom",
        isVerified: true,
      },
      {
        counterpartyChainId: "core-1",
        sourceChannelId: "channel-4",
        destChannelId: "channel-6",
        coinMinimalDenom: "stk/uatom",
        isVerified: true,
      },
      {
        counterpartyChainId: "dyson-mainnet-01",
        sourceChannelId: "channel-526",
        destChannelId: "channel-2",
        coinMinimalDenom: "dys",
      },
      {
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1u45shlp0q4gcckvsj06ss4xuvsu0z24a0d0vr9ce6r24pht4e5xq7q995n",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        counterpartyChainId: "acre_9052-1",
        sourceChannelId: "channel-490",
        destChannelId: "channel-0",
        coinMinimalDenom: "erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c",
        depositUrlOverride: "https://app.arable.finance/#/ibc",
        withdrawUrlOverride: "https://app.arable.finance/#/ibc",
      },
      {
        counterpartyChainId: "planq_7070-2",
        sourceChannelId: "channel-492",
        destChannelId: "channel-1",
        coinMinimalDenom: "aplanq",
      },
      {
        counterpartyChainId: "quicksilver-2",
        sourceChannelId: "channel-522",
        destChannelId: "channel-2",
        coinMinimalDenom: "uqstars",
        isVerified: true,
      },
      {
        // WYND
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
        isVerified: true,
      },
      {
        counterpartyChainId: "acre_9052-1",
        sourceChannelId: "channel-490",
        destChannelId: "channel-0",
        coinMinimalDenom: "erc20/0xAE6D3334989a22A65228732446731438672418F2",
        depositUrlOverride: "https://app.arable.finance/#/ibc",
        withdrawUrlOverride: "https://app.arable.finance/#/ibc",
      },
      {
        // NRIDE
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1qmlchtmjpvu0cr7u0tad2pq8838h6farrrjzp39eqa9xswg7teussrswlq",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        counterpartyChainId: "eightball-1",
        sourceChannelId: "channel-641",
        destChannelId: "channel-16",
        coinMinimalDenom: "uebl",
      },
      {
        counterpartyChainId: "quicksilver-2",
        sourceChannelId: "channel-522",
        destChannelId: "channel-2",
        coinMinimalDenom: "uqatom",
        isVerified: true,
      },
      {
        counterpartyChainId: "comdex-1",
        sourceChannelId: "channel-87",
        destChannelId: "channel-1",
        coinMinimalDenom: "uharbor",
      },
      {
        counterpartyChainId: "quicksilver-2",
        sourceChannelId: "channel-522",
        destChannelId: "channel-2",
        coinMinimalDenom: "uqregen",
        isVerified: true,
      },
      {
        //JunoFox
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1u8cr3hcjvfkzxcaacv9q75uw9hwjmn8pucc93pmy6yvkzz79kh3qncca8x",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        counterpartyChainId: "quicksilver-2",
        sourceChannelId: "channel-522",
        destChannelId: "channel-2",
        coinMinimalDenom: "uqck",
        isVerified: true,
      },
      {
        counterpartyChainId: "arkh",
        sourceChannelId: "channel-648",
        destChannelId: "channel-12",
        coinMinimalDenom: "arkh",
        isUnstable: true,
      },
      {
        counterpartyChainId: "quicksilver-2",
        sourceChannelId: "channel-522",
        destChannelId: "channel-2",
        coinMinimalDenom: "uqosmo",
        isVerified: true,
      },
      {
        counterpartyChainId: "noble-1",
        sourceChannelId: "channel-750",
        destChannelId: "channel-1",
        coinMinimalDenom: "ufrienzies",
      },
      {
        counterpartyChainId: "migaloo-1",
        sourceChannelId: "channel-642",
        destChannelId: "channel-5",
        coinMinimalDenom: "uwhale",
        isVerified: true,
      },
      {
        counterpartyChainId: "omniflixhub-1",
        sourceChannelId: "channel-199",
        destChannelId: "channel-1",
        coinMinimalDenom: "uflix",
        isVerified: true,
      },
      {
        //GRDN
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1xekkh27punj0uxruv3gvuydyt856fax0nu750xns99t2qcxp7xmsqwhfma",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        //MNPU
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno166heaxlyntd33a5euh4rrz26svhean4klzw594esmd02l4atan6sazy2my",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        //SHIBAC
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1x5qt47rw84c4k6xvvywtrd40p8gxjt8wnmlahlqg07qevah3f8lqwxfs7z",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        //SKOJ
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1qqwf3lkfjhp77yja7gmg3y95pda0e5xctqrdhf3wvwdd79flagvqfgrgxp",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        //CLST
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1ngww7zxak55fql42wmyqrr4rhzpne24hhs4p3w4cwhcdgqgr3hxsmzl9zg",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        //OSDOGE
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1ytymtllllsp3hfmndvcp802p2xmy5s8m59ufel8xv9ahyxyfs4hs4kd4je",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        //APEMOS
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1jrr0tuuzxrrwcg6hgeqhw5wqpck2y55734e7zcrp745aardlp0qqg8jz06",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        //INVDRS
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1jwdy7v4egw36pd84aeks3ww6n8k7zhsumd4ac8q5lts83ppxueus4626e8",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        //DOGA
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1k2ruzzvvwwtwny6gq6kcwyfhkzahaunp685wmz4hafplduekj98q9hgs6d",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        //CATMOS
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1f5datjdse3mdgrapwuzs3prl7pvxxht48ns6calnn0t77v2s9l8s0qu488",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        //SUMMIT
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1j4ux0f6gt7e82z7jdpm25v4g2gts880ap64rdwa49989wzhd0dfqed6vqm",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        //SPACER
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1dyyf7pxeassxvftf570krv7fdf5r8e4r04mp99h0mllsqzp3rs4q7y8yqg",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        //LIGHT
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1dpany8c0lj526lsa02sldv7shzvnw5dt5ues72rk35hd69rrydxqeraz8l",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        //MILE
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1llg7q2d5dqlrqzh5dxv8c7kzzjszld34s5vktqmlmaaxqjssz43sxyhq0d",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        //MANNA
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno13ca2g36ng6etcfhr9qxx352uw2n5e92np54thfkm3w3nzlhsgvwsjaqlyq",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        //BLZ
        counterpartyChainId: "bluzelle-9",
        sourceChannelId: "channel-763",
        destChannelId: "channel-0",
        coinMinimalDenom: "ubnt",
      },
      {
        //SLCA
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno10vgf2u03ufcf25tspgn05l7j3tfg0j63ljgpffy98t697m5r5hmqaw95ux",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        //PEPEC
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1epxnvge53c4hkcmqzlxryw5fp7eae2utyk6ehjcfpwajwp48km3sgxsh9k",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        counterpartyChainId: "gitopia",
        sourceChannelId: "channel-781",
        destChannelId: "channel-0",
        coinMinimalDenom: "ulore",
        isVerified: true,
      },
      {
        counterpartyChainId: "pirin-1",
        sourceChannelId: "channel-783",
        destChannelId: "channel-0",
        coinMinimalDenom: "unls",
        isVerified: true,
      },
      {
        //ROAR
        counterpartyChainId: "phoenix-1",
        sourceChannelId: "channel-341",
        destChannelId: "channel-26",
        coinMinimalDenom:
          "cw20:terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
        ics20ContractAddress:
          "terra1e0mrzy8077druuu42vs0hu7ugguade0cj65dgtauyaw4gsl4kv0qtdf2au",
        depositUrlOverride:
          "https://tfm.com/bridge?chainTo=osmosis-1&chainFrom=phoenix-1&token0=terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv&token1=ibc%2F98BCD43F190C6960D0005BC46BB765C827403A361C9C03C2FF694150A30284B0",
        withdrawUrlOverride:
          "https://tfm.com/bridge?chainFrom=osmosis-1&chainTo=phoenix-1&token0=ibc%2F98BCD43F190C6960D0005BC46BB765C827403A361C9C03C2FF694150A30284B0&token1=terra1lxx40s29qvkrcj8fsa3yzyehy7w50umdvvnls2r830rys6lu2zns63eelv",
        isVerified: true,
      },
      {
        //CUB
        counterpartyChainId: "phoenix-1",
        sourceChannelId: "channel-341",
        destChannelId: "channel-26",
        coinMinimalDenom:
          "cw20:terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
        ics20ContractAddress:
          "terra1e0mrzy8077druuu42vs0hu7ugguade0cj65dgtauyaw4gsl4kv0qtdf2au",
        depositUrlOverride:
          "https://tfm.com/bridge?chainTo=osmosis-1&chainFrom=phoenix-1&token0=terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t&token1=ibc%2F6F18EFEBF1688AA77F7EAC17065609494DC1BA12AFC78E9AEC832AF70A11BEF3",
        withdrawUrlOverride:
          "https://tfm.com/bridge?chainFrom=osmosis-1&chainTo=phoenix-1&token0=ibc%2F6F18EFEBF1688AA77F7EAC17065609494DC1BA12AFC78E9AEC832AF70A11BEF3&token1=terra1lalvk0r6nhruel7fvzdppk3tup3mh5j4d4eadrqzfhle4zrf52as58hh9t",
      },
      {
        //BLUE
        counterpartyChainId: "phoenix-1",
        sourceChannelId: "channel-341",
        destChannelId: "channel-26",
        coinMinimalDenom:
          "cw20:terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584",
        ics20ContractAddress:
          "terra1e0mrzy8077druuu42vs0hu7ugguade0cj65dgtauyaw4gsl4kv0qtdf2au",
        depositUrlOverride:
          "https://tfm.com/bridge?chainTo=osmosis-1&chainFrom=phoenix-1&token0=terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584&token1=ibc%2FDA961FE314B009C38595FFE3AF41225D8894D663B8C3F6650DCB5B6F8435592E",
        withdrawUrlOverride:
          "https://tfm.com/bridge?chainFrom=osmosis-1&chainTo=phoenix-1&token0=ibc%2FDA961FE314B009C38595FFE3AF41225D8894D663B8C3F6650DCB5B6F8435592E&token1=terra1gwrz9xzhqsygyr5asrgyq3pu0ewpn00mv2zenu86yvx2nlwpe8lqppv584",
      },
      {
        counterpartyChainId: "neutron-1",
        sourceChannelId: "channel-874",
        destChannelId: "channel-10",
        coinMinimalDenom: "untrn",
      },
      {
        //CASA
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1ju8k8sqwsqu5k6umrypmtyqu2wqcpnrkf4w4mntvl0javt4nma7s8lzgss",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        counterpartyChainId: "quasar-1",
        sourceChannelId: "channel-688",
        destChannelId: "channel-1",
        coinMinimalDenom: "uqsr",
        isVerified: true,
      },
      {
        counterpartyChainId: "archway-1",
        sourceChannelId: "channel-1429",
        destChannelId: "channel-1",
        coinMinimalDenom: "aarch",
        isVerified: true,
      },
      {
        counterpartyChainId: "centauri-1",
        sourceChannelId: "channel-1279",
        destChannelId: "channel-3",
        coinMinimalDenom: "ppica",
        depositUrlOverride:
          "https://app.trustless.zone/multihop?from=PICASSO&to=OSMOSIS",
        withdrawUrlOverride:
          "https://app.trustless.zone/multihop?from=OSMOSIS&to=PICASSO",
        isVerified: true,
      },
      {
        counterpartyChainId: "empowerchain-1",
        sourceChannelId: "channel-1411",
        destChannelId: "channel-1",
        coinMinimalDenom: "umpwr",
        depositUrlOverride:
          "https://tfm.com/bridge?chainTo=osmosis-1&chainFrom=empowerchain-1&token0=umpwr&token1=ibc%2FDD3938D8131F41994C1F01F4EB5233DEE9A0A5B787545B9A07A321925655BF38",
        isVerified: true,
      },
      {
        //WATR
        counterpartyChainId: "juno-1",
        sourceChannelId: "channel-169",
        destChannelId: "channel-47",
        coinMinimalDenom:
          "cw20:juno1m4h8q4p305wgy7vkux0w6e5ylhqll3s6pmadhxkhqtuwd5wlxhxs8xklsw",
        ics20ContractAddress:
          "juno1v4887y83d6g28puzvt8cl0f3cdhd3y6y9mpysnsp3k8krdm7l6jqgm0rkn",
      },
      {
        counterpartyChainId: "realionetwork_3301-1",
        sourceChannelId: "channel-1424",
        destChannelId: "channel-1",
        coinMinimalDenom: "ario",
      },
    ].filter((ibcAsset) => {
      // validate IBC asset config
      if (
        (ibcAsset.depositUrlOverride || ibcAsset.depositUrlOverride) &&
        ibcAsset.originBridgeInfo
      ) {
        throw new Error("Can't have URL overrides and origin bridge config");
      }

      if (ibcAsset.originBridgeInfo?.sourceChainTokens.length === 0) {
        throw new Error("Must have at least one source chain");
      }

      // remove outstanding mainnet Axelar assets when using testnets
      if (IS_TESTNET && ibcAsset.counterpartyChainId === "axelar-dojo-1") {
        return false;
      }

      return true;
    });

if (IS_TESTNET && typeof window === "undefined") {
  console.warn(
    "Reminder: clear browser cache between testnet/mainnet config change."
  );
}

export default IBCAssetInfos;
