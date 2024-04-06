import type {
  WormholeConnectConfig,
  WormholeConnectPartialTheme,
} from "@wormhole-foundation/wormhole-connect";
import dynamic from "next/dynamic";
import { FunctionComponent } from "react";

import { Spinner } from "~/components/loaders";
import { theme } from "~/tailwind.config";

const WormholeConnect = dynamic(
  () =>
    import("@wormhole-foundation/wormhole-connect").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    ),
  }
);

const config: WormholeConnectConfig = {
  networks: ["solana", "osmosis"],
  rpcs: {
    solana:
      "https://mainnet.helius-rpc.com/?api-key=f4713222-8bbc-4495-aace-5693e719712e",
    wormchain: "https://tncnt-eu-wormchain-main-01.rpc.p2p.world/",
  },
  tokensConfig: {
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
  bridgeDefaults: {
    fromNetwork: "solana",
    toNetwork: "osmosis",
    token: "W",
    requiredNetwork: "osmosis",
  },
  tokens: ["W", "SOL", "PYTH"],
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

const Wormhole: FunctionComponent = () => {
  return <WormholeConnect config={config} theme={customTheme} />;
};

export default Wormhole;
