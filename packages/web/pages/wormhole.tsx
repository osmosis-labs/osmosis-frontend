import type {
  WormholeConnectConfig,
  WormholeConnectPartialTheme,
} from "@wormhole-foundation/wormhole-connect";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
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
  const router = useRouter();

  const fromNetwork = router.query.from as string;
  const toNetwork = router.query.to as string;
  const token = router.query.token as string;

  console.log("log: ", {
    fromNetwork,
    toNetwork,
    token,
  });

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
    fromNetwork: "solana",
    toNetwork: "osmosis",
    token: "W",
    requiredNetwork: "osmosis",
  };

  if (fromNetwork) {
    bridgeDefaults.fromNetwork = fromNetwork;
  }
  if (toNetwork) {
    bridgeDefaults.toNetwork = toNetwork;
  }
  if (token) {
    bridgeDefaults.token = token;
  }
  config.bridgeDefaults = bridgeDefaults;

  return <WormholeConnect config={config} theme={customTheme} />;
};

export default Wormhole;
