import { EthereumChainInfo } from "@osmosis-labs/utils";
import { Transport } from "viem";
import { createConfig, http } from "wagmi";
import { coinbaseWallet, metaMask, walletConnect } from "wagmi/connectors";

import { WALLETCONNECT_PROJECT_KEY } from "~/config/env";
import { theme } from "~/tailwind.config";

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}

/**
 * PLEASE DO NOT USE THIS OUTSIDE THIS FILE
 * This is a workaround to get the tuple chain ids from the EthereumChainInfo object
 * Since wagmi does not care about item order, it's ok to do this. However, this should not be used outside this file.
 */
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;
type LastOf<T> = UnionToIntersection<
  T extends any ? () => T : never
> extends () => infer R
  ? R
  : never;

type Push<T extends any[], V> = [...T, V];

type TuplifyUnion<
  T,
  L = LastOf<T>,
  N = [T] extends [never] ? true : false
> = true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>;

type ObjValueTuple<
  T,
  KS extends any[] = TuplifyUnion<keyof T>,
  R extends any[] = []
> = KS extends [infer K, ...infer KT]
  ? ObjValueTuple<T, KT, [...R, T[K & keyof T]]>
  : R;

const chains = Object.values(EthereumChainInfo) as ObjValueTuple<
  typeof EthereumChainInfo
>;
const transports = Object.fromEntries(
  chains.map((info) => [info.id, http()])
) as Record<keyof typeof chains, Transport>;

export const wagmiConfig = createConfig({
  chains,
  transports,
  connectors: [
    metaMask({
      dappMetadata: {
        name: "Osmosis",
        url: "https://osmosis.zone",
        iconUrl: "https://osmosis.zone/favicon.ico",
      },
      injectProvider: false,
    }),
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_KEY ?? "",
      qrModalOptions: {
        themeVariables: {
          "--wcm-accent-color": theme.colors.wosmongton[300],
          "--wcm-background-color": theme.colors.osmoverse[700],
          "--wcm-font-family": "Inter, ui-sans-serif, system-ui",
          "--wcm-z-index": "9999",
        },
      },
    }),
    coinbaseWallet({
      appLogoUrl: "https://osmosis.zone/favicon.ico",
      appName: "Osmosis",
    }),
  ],
});

export type EthereumChainIds = (typeof wagmiConfig)["chains"][number]["id"];
