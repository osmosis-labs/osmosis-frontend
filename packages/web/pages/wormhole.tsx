import { useRouter } from "next/router";
import { FunctionComponent, useEffect, useState } from "react";

import { Spinner } from "~/components/loaders";
import { EventName } from "~/config";
import { useAmplitudeAnalytics } from "~/hooks";
import { theme } from "~/tailwind.config";

type PaletteColor = {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  A100: string;
  A200: string;
  A400: string;
  A700: string;
};

type WormholeConnectPartialTheme = {
  mode?: "light" | "dark";
  primary?: PaletteColor;
  secondary?: PaletteColor;
  divider?: string;
  background?: {
    default: string;
  };
  text?: {
    primary: string;
    secondary: string;
  };
  error?: PaletteColor;
  info?: PaletteColor;
  success?: PaletteColor;
  warning?: PaletteColor;
  button?: {
    primary: string;
    primaryText: string;
    disabled: string;
    disabledText: string;
    action: string;
    actionText: string;
    hover: string;
  };
  options?: {
    hover: string;
    select: string;
  };
  card?: {
    background: string;
    elevation: string;
    secondary: string;
  };
  popover?: {
    background: string;
    elevation: string;
    secondary: string;
  };
  modal?: {
    background: string;
  };
  font?: {
    primary: string;
    header: string;
  };
  logo?: string;
};

const customTheme: WormholeConnectPartialTheme = {
  mode: "dark",
  background: {
    default: theme.colors.osmoverse["900"],
  },
  primary: {
    "50": theme.colors.wosmongton["100"],
    "100": theme.colors.wosmongton["100"],
    "200": theme.colors.wosmongton["200"],
    "300": theme.colors.wosmongton["300"],
    "400": theme.colors.wosmongton["400"],
    "500": theme.colors.wosmongton["500"],
    "600": theme.colors.wosmongton["500"],
    "700": theme.colors.wosmongton["700"],
    "800": theme.colors.wosmongton["800"],
    "900": theme.colors.wosmongton["900"],
    A100: theme.colors.wosmongton["100"],
    A200: theme.colors.wosmongton["200"],
    A400: theme.colors.wosmongton["400"],
    A700: theme.colors.wosmongton["700"],
  },
  secondary: {
    "50": theme.colors.osmoverse["100"],
    "100": theme.colors.osmoverse["100"],
    "200": theme.colors.osmoverse["200"],
    "300": theme.colors.osmoverse["300"],
    "400": theme.colors.osmoverse["400"],
    "500": theme.colors.osmoverse["500"],
    "600": theme.colors.osmoverse["600"],
    "700": theme.colors.osmoverse["700"],
    "800": theme.colors.osmoverse["800"],
    "900": theme.colors.osmoverse["900"],
    A100: theme.colors.osmoverse["100"],
    A200: theme.colors.osmoverse["200"],
    A400: theme.colors.osmoverse["400"],
    A700: theme.colors.osmoverse["700"],
  },
};

const MAINNET_CHAINS = {
  solana: 1,
  ethereum: 2,
  bsc: 4,
  polygon: 5,
  avalanche: 6,
  fantom: 10,
  klaytn: 13,
  celo: 14,
  moonbeam: 16,
  injective: 19,
  sui: 21,
  aptos: 22,
  arbitrum: 23,
  optimism: 24,
  base: 30,
  sei: 32,
  scroll: 34,
  blast: 36,
  xlayer: 37,
  wormchain: 3104,
  osmosis: 20,
  cosmoshub: 4000,
  evmos: 4001,
  kujira: 4002,
} as const;
const DEVNET_CHAINS = {
  ethereum: 2,
  terra2: 18,
  osmosis: 20,
  wormchain: 3104,
} as const;
const TESTNET_CHAINS = {
  solana: 1,
  bsc: 4,
  fuji: 6,
  fantom: 10,
  klaytn: 13,
  alfajores: 14,
  moonbasealpha: 16,
  injective: 19,
  sui: 21,
  aptos: 22,
  sei: 32,
  scroll: 34,
  blast: 36,
  xlayer: 37,
  wormchain: 3104,
  osmosis: 20,
  cosmoshub: 4000,
  evmos: 4001,
  kujira: 4002,
  sepolia: 10002,
  arbitrum_sepolia: 10003,
  base_sepolia: 10004,
  optimism_sepolia: 10005,
} as const;

type DevnetChainName = keyof typeof DEVNET_CHAINS;
type MainnetChainName = keyof typeof MAINNET_CHAINS;
type TestnetChainName = keyof typeof TESTNET_CHAINS;

type ChainName = MainnetChainName | TestnetChainName | DevnetChainName;
type Network = "mainnet" | "testnet" | "devnet";
type ChainResourceMap = {
  [chain in ChainName]?: string;
};
type TokenConfig = {
  key: string;
  symbol: string;
  nativeChain: ChainName;
  icon: string;
  tokenId?: {
    chain: ChainName;
    address: string;
  };
  coinGeckoId: string;
  color?: string;
  decimals: DecimalsMap;
  wrappedAsset?: string;
  displayName?: string;
  foreignAssets?: {
    [chainName in ChainName]?: {
      address: string;
      decimals: number;
    };
  };
};
type TokensConfig = { [key: string]: TokenConfig };
enum Context {
  ETH = "Ethereum",
  TERRA = "Terra",
  XPLA = "XPLA",
  SOLANA = "Solana",
  ALGORAND = "Algorand",
  NEAR = "Near",
  APTOS = "Aptos",
  SUI = "Sui",
  SEI = "Sei",
  COSMOS = "Cosmos",
  OTHER = "OTHER",
}

type DecimalsMap = Partial<Record<Context, number>> & {
  default: number;
};

interface WormholeConnectConfig {
  network?: Network; // New name for this, consistent with SDKv2

  // External resources
  rpcs?: ChainResourceMap;

  // White lists
  networks?: ChainName[]; // TODO REMOVE; DEPRECATED

  tokens?: string[];

  // Custom tokens
  tokensConfig?: TokensConfig;

  bridgeDefaults?: {
    fromNetwork?: ChainName;
    toNetwork?: ChainName;
    token?: string;
    requiredNetwork?: ChainName;
  };
}

const Wormhole: FunctionComponent = () => {
  const router = useRouter();
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useAmplitudeAnalytics({ onLoadEvent: [EventName.Wormhole.pageViewed] });

  const fromNetwork = router.query.from as string;
  const toNetwork = router.query.to as string;
  const token = router.query.token as string;

  let config: WormholeConnectConfig = {
    networks: ["solana", "osmosis", "sui", "aptos"],
    rpcs: {
      solana:
        "https://mainnet.helius-rpc.com/?api-key=f4713222-8bbc-4495-aace-5693e719712e",
      wormchain: "https://tncnt-eu-wormchain-main-01.rpc.p2p.world/",
    },
    tokensConfig: {
      BONK: {
        key: "BONK",
        symbol: "BONK",
        nativeChain: "solana",
        tokenId: {
          chain: "solana",
          address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        },
        icon: "https://assets.coingecko.com/coins/images/28600/standard/bonk.jpg",
        coinGeckoId: "bonk",
        color: "#FC8E03",
        decimals: {
          default: 5,
        },
        foreignAssets: {
          ethereum: {
            address: "0x1151CB3d861920e07a38e03eEAd12C32178567F6",
            decimals: 5,
          },
          bsc: {
            address: "0xA697e272a73744b343528C3Bc4702F2565b2F422",
            decimals: 5,
          },
          polygon: {
            address: "0xe5B49820e5A1063F6F4DdF851327b5E8B2301048",
            decimals: 5,
          },
          avalanche: {
            address: "0xC07C98a93591504584738e4569928DDb3b9f12A7",
            decimals: 5,
          },
          sui: {
            address:
              "0x6907963ca849faff0957b9a8269a7a07065e3def2eef49cc33b50ab946ea5a9f::coin::COIN",
            decimals: 5,
          },
          aptos: {
            address:
              "0x2a90fae71afc7460ee42b20ee49a9c9b29272905ad71fef92fbd8b3905a24b56::coin::T",
            decimals: 5,
          },
          arbitrum: {
            address: "0x09199d9A5F4448D0848e4395D065e1ad9c4a1F74",
            decimals: 5,
          },
          wormchain: {
            address:
              "wormhole10qt8wg0n7z740ssvf3urmvgtjhxpyp74hxqvqt7z226gykuus7eq9mpu8u",
            decimals: 5,
          },
          osmosis: {
            address:
              "ibc/CA3733CB0071F480FAE8EF0D9C3D47A49C6589144620A642BBE0D59A293D110E",
            decimals: 5,
          },
          fantom: {
            address: "0x3fEcdF1248fe7642d29f879a75CFC0339659ab93",
            decimals: 5,
          },
          base: {
            address: "0xDF1Cf211D38E7762c9691Be4D779A441a17A6cFC",
            decimals: 5,
          },
          celo: {
            address: "0x3fc50bc066aE2ee280876EeefADfdAbF6cA02894",
            decimals: 5,
          },
        },
      },
      W: {
        key: "W",
        symbol: "W",
        nativeChain: "solana",
        tokenId: {
          chain: "solana",
          address: "85VBFQZC9TZkfaptBWjvUw7YbZjy52A6mjtPGjstQAmQ",
        },
        coinGeckoId: "wormhole",
        icon: "https://assets.coingecko.com/coins/images/35087/standard/womrhole_logo_full_color_rgb_2000px_72ppi_fb766ac85a.png?1708688954",
        color: "#2894EE",
        decimals: {
          default: 6,
        },
        foreignAssets: {
          osmosis: {
            address:
              "ibc/AC6EE43E608B5A7EEE460C960480BC1C3708010E32B2071C429DA259836E10C3",
            decimals: 6,
          },
        },
      },
    },
    tokens: ["W", "SOL", "PYTH", "BONK", "SUI", "APT", "WSOL"],
  };

  let bridgeDefaults = {
    fromNetwork: "solana" as ChainName,
    toNetwork: "osmosis" as ChainName,
    token: "W",
    requiredNetwork: "osmosis" as ChainName,
  };

  if (fromNetwork) {
    bridgeDefaults.fromNetwork = fromNetwork as ChainName;
  }
  if (toNetwork) {
    bridgeDefaults.toNetwork = toNetwork as ChainName;
  }
  if (token) {
    bridgeDefaults.token = token;
  }
  config.bridgeDefaults = bridgeDefaults;

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://www.unpkg.com/@wormhole-foundation/wormhole-connect@0.3.16/dist/main.js";
    script.defer = true;
    script.integrity =
      "sha384-RolM9SJlJRj0Qi9rYuG5ge7kxPsT4iyrxKLPN4EMnoe5R//1mFRYrlz6L09eyXAT";
    script.crossOrigin = "anonymous";
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      {!scriptLoaded && (
        <div className="flex h-screen w-full items-center justify-center">
          <Spinner />
        </div>
      )}
      <div
        id="wormhole-connect"
        data-config={JSON.stringify(config)}
        data-theme={JSON.stringify(customTheme)}
        style={{ display: scriptLoaded ? "block" : "none" }}
      ></div>

      <link
        rel="stylesheet"
        href="https://www.unpkg.com/@wormhole-foundation/wormhole-connect@0.3.16/dist/main.css"
        integrity="sha384-BTkX2AhTeIfxDRFsJbLtR26TQ9QKKpi7EMe807JdfQQBTAkUT9a2mSGwf/5CJ4bF"
        crossOrigin="anonymous"
      />
    </>
  );
};

export default Wormhole;
