import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { FunctionComponent, useEffect, useState } from "react";

import { Icon } from "~/components/assets";
import { Spinner } from "~/components/loaders";
import { EventName } from "~/config";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";
import { theme } from "~/tailwind.config";

const WormholeRedeem = dynamic(
  () =>
    import("~/components/bridge/wormhole-redeem").then(
      (mod) => mod.WormholeRedeem
    ),
  { ssr: false }
);

const WormholeAlloyConvert = dynamic(
  () =>
    import("~/components/bridge/wormhole-alloy-convert").then(
      (mod) => mod.WormholeAlloyConvert
    ),
  { ssr: false }
);

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
    // Match the bridge step box so the widget blends in rather than reading as
    // a nested card-within-a-box.
    default: theme.colors.osmoverse["850"],
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
  const { t } = useTranslation();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  // The Connect widget mounts once on script execution and exposes no balance
  // refresh API, so after the user converts their alloy to the `.wh` variant it
  // keeps showing the stale balance. Bumping this re-mounts the widget div and
  // re-injects (cache-busted) the bundle so it re-reads balances from scratch.
  const [reloadKey, setReloadKey] = useState(0);

  useAmplitudeAnalytics({ onLoadEvent: [EventName.Wormhole.pageViewed] });

  const fromNetwork = router.query.from as string;
  const toNetwork = router.query.to as string;
  const token = router.query.token as string;

  let config: WormholeConnectConfig = {
    networks: ["solana", "osmosis", "sui", "aptos", "ethereum"],
    rpcs: {
      // Was a hardcoded Helius URL with a shared public API key that
      // routinely 429s; the widget interprets failed `getAccountInfo`
      // lookups as "no ATA exists" and shows a misleading create-account
      // banner. Use the same keyless endpoint the recovery widget below
      // relies on (see SOLANA_RPC in components/bridge/wormhole-redeem.tsx).
      solana: "https://solana-rpc.publicnode.com",
      wormchain: "https://wormchain-rpc.polkachu.com",
      ethereum: "https://ethereum-rpc.publicnode.com",
      osmosis: "https://rpc.osmosis.zone",
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
    tokens: ["W", "SOL", "PYTH", "BONK", "SUI", "APT", "WSOL", "USDT"],
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
    // Wormhole Connect keys native Solana SOL as "SOL" (no Osmosis foreign
    // asset) and the Osmosis-side wrapped form as "WSOL" (the SOL.wh denom). An
    // Osmosis→Solana withdrawal therefore has to use "WSOL" or Connect can't
    // resolve the source asset and won't prefill the token. The asset list
    // hands off with token=SOL, so translate it here for that direction.
    bridgeDefaults.token =
      token === "SOL" && bridgeDefaults.fromNetwork === "osmosis"
        ? "WSOL"
        : token;
  }
  config.bridgeDefaults = bridgeDefaults;

  useEffect(() => {
    // The Connect bundle reads `data-config` once on init and never re-reads it.
    // Wait for the router to be ready so `config.bridgeDefaults` (built from the
    // from/to/token query params) is populated before the script loads —
    // otherwise the widget initialises with empty defaults and the deep-linked
    // direction/token are lost.
    if (!router.isReady) return;

    // Each reload needs the spinner back until the re-injected bundle re-mounts.
    setScriptLoaded(false);

    // Removing the <script> node on cleanup does not abort an in-flight load, so
    // a superseded reload's onload could still fire and flip scriptLoaded for a
    // bundle that is no longer mounted. Guard the callbacks against a stale run.
    let cancelled = false;

    const script = document.createElement("script");
    script.type = "module";
    // The bundle mounts once on execution and finds #wormhole-connect by id.
    // To force a re-mount (after a convert) we re-key the container div AND
    // re-run the module — module scripts are cached by resolved URL, so a
    // changing query string is what makes the browser execute it again. The SRI
    // hash is content-addressed (unpkg serves identical bytes for the
    // query-string variants), so it still matches across the cache-busted URLs.
    const cacheBust = reloadKey > 0 ? `?reload=${reloadKey}` : "";
    script.src = `https://www.unpkg.com/@wormhole-foundation/wormhole-connect@0.3.21/dist/main.js${cacheBust}`;
    script.defer = true;
    /**
     * On version bumps make sure to update the hash.
     * @see https://www.srihash.org/ - to compute it
     */
    script.integrity =
      "sha384-zGJnnw0Y8umaoMLkKqntkswRCTpYwMyu960bF3J77xySwmusndSEX9d4xUN/JXCl";
    script.crossOrigin = "anonymous";
    script.onload = () => {
      if (!cancelled) setScriptLoaded(true);
    };
    // A failed integrity check or network error would otherwise leave the
    // spinner up and the refresh button disabled forever with no recovery.
    // Surface the bridge again so the user can retry via the refresh button.
    script.onerror = () => {
      if (!cancelled) setScriptLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      cancelled = true;
      document.body.removeChild(script);
    };
  }, [router.isReady, reloadKey]);

  return (
    <div className="bg-osmoverse-900">
      <div className="mx-auto flex max-w-2xl flex-col gap-3 px-4 pt-8 pb-16">
        <div className="flex gap-3 rounded-2xl border-2 border-rust-600 p-5">
          <Icon
            id="alert-triangle"
            className="h-6 w-6 shrink-0 text-rust-600"
          />
          <div className="flex flex-col gap-1">
            <h1 className="body2 text-white-full">
              {t("wormhole.deprecationTitle")}
            </h1>
            <p className="body2 text-osmoverse-300">
              {t("wormhole.deprecationSubtitle")}
            </p>
          </div>
        </div>

        {/* Step 1 (optional): convert the alloy → its Wormhole `.wh` variant
         * (allSOL→SOL.wh, allSUI→SUI.wh, allAPT→APT.wh) before bridging. The
         * component self-gates on the destination + whether the user holds the
         * alloy. */}
        <WormholeAlloyConvert toNetwork={toNetwork} token={token} />

        {/* Bridge step: the embedded Wormhole Connect widget. The widget brings
         * its own generous internal padding and now shares the box background,
         * so the container is pulled tight with negative margins to absorb the
         * widget's built-in whitespace. */}
        <div className="flex flex-col gap-1 rounded-3xl border border-osmoverse-700 bg-osmoverse-850 px-5 pt-5 pb-1">
          <div className="flex items-center justify-between">
            <h2 className="subtitle1 text-white-full">
              {t("wormhole.bridgeStepTitle")}
            </h2>
            {/* The widget reads balances once on mount with no refresh API, so
             * after a convert it can show a stale balance. This re-mounts and
             * re-injects the bundle to re-read it. */}
            <button
              type="button"
              onClick={() => {
                // Show the spinner on this same render — without it the re-keyed
                // (empty) container would flash visible for a frame before the
                // effect resets scriptLoaded.
                setScriptLoaded(false);
                setReloadKey((k) => k + 1);
              }}
              disabled={!scriptLoaded}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-osmoverse-300 transition-colors hover:bg-osmoverse-800 hover:text-white-full disabled:opacity-50"
            >
              <Icon id="refresh-ccw" className="h-4 w-4" />
              <span className="caption">{t("wormhole.refreshBalance")}</span>
            </button>
          </div>
          {(!scriptLoaded || !router.isReady) && (
            <div className="flex w-full items-center justify-center py-16">
              <Spinner />
            </div>
          )}
          {/* Internal widget spacing is tightened via #wormhole-connect rules
           * in globals.css (its DOM is a third-party CDN bundle). The key forces
           * a fresh container on reload so the re-injected bundle mounts into an
           * empty element rather than one holding a stale React root. */}
          {router.isReady && (
            <div
              key={reloadKey}
              id="wormhole-connect"
              data-config={JSON.stringify(config)}
              data-theme={JSON.stringify(customTheme)}
              style={{ display: scriptLoaded ? "block" : "none" }}
            ></div>
          )}
        </div>

        {/* Optional recovery step for stuck/unredeemed transfers — a sibling
         * box in the step column. */}
        <WormholeRedeem />
      </div>

      {/**
       * On version bumps make sure to update the hash.
       * @see https://www.srihash.org/ - to compute it
       */}
      <link
        rel="stylesheet"
        href="https://www.unpkg.com/@wormhole-foundation/wormhole-connect@0.3.16/dist/main.css"
        integrity="sha384-BTkX2AhTeIfxDRFsJbLtR26TQ9QKKpi7EMe807JdfQQBTAkUT9a2mSGwf/5CJ4bF"
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default Wormhole;
