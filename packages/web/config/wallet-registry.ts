/* eslint-disable import/no-extraneous-dependencies */
import type { Wallet } from "@cosmos-kit/core";
import {
  cosmostationExtensionInfo,
  CosmostationExtensionWallet,
} from "@cosmos-kit/cosmostation-extension";
import {
  cosmostationMobileInfo,
  CosmostationMobileWallet,
} from "@cosmos-kit/cosmostation-mobile";
import {
  frontierExtensionInfo,
  FrontierExtensionWallet,
} from "@cosmos-kit/frontier-extension";
import {
  keplrExtensionInfo,
  KeplrExtensionWallet,
} from "@cosmos-kit/keplr-extension";
import { keplrMobileInfo, KeplrMobileWallet } from "@cosmos-kit/keplr-mobile";
import {
  leapExtensionInfo,
  LeapExtensionWallet,
} from "@cosmos-kit/leap-extension";
import { omniMobileInfo, OmniMobileWallet } from "@cosmos-kit/omni-mobile";
import {
  terrastationExtensionInfo,
  TerrastationExtensionWallet,
} from "@cosmos-kit/terrastation-extension";
import { trustMobileInfo, TrustMobileWallet } from "@cosmos-kit/trust-mobile";
import {
  xdefiExtensionInfo,
  XDEFIExtensionWallet,
} from "@cosmos-kit/xdefi-extension";

export const WalletRegistry: Record<string, Wallet> = {
  [cosmostationExtensionInfo.name]: {
    ...cosmostationExtensionInfo,
    logo: "/wallets/cosmostation.png",
  },
  [cosmostationMobileInfo.name]: {
    ...cosmostationMobileInfo,
    logo: "/wallets/cosmostation.png",
  },
  [keplrExtensionInfo.name]: {
    ...keplrExtensionInfo,
    logo: "/wallets/keplr.svg",
  },
  [keplrMobileInfo.name]: {
    ...keplrMobileInfo,
    logo: "/wallets/keplr.svg",
  },
  [frontierExtensionInfo.name]: {
    ...frontierExtensionInfo,
    logo: "/wallets/frontier.png",
  },
  [leapExtensionInfo.name]: {
    ...leapExtensionInfo,
    logo: "/wallets/leap.png",
  },
  [terrastationExtensionInfo.name]: {
    ...terrastationExtensionInfo,
    logo: "/wallets/terrastation.svg",
  },
  [trustMobileInfo.name]: {
    ...trustMobileInfo,
    logo: "/wallets/trust.png",
  },
  [xdefiExtensionInfo.name]: {
    ...xdefiExtensionInfo,
    logo: "/wallets/xdefi.png",
  },
  [omniMobileInfo.name]: {
    ...omniMobileInfo,
    logo: "/wallets/omni.webp",
  },
};

export const Wallets = [
  new KeplrExtensionWallet(WalletRegistry[keplrExtensionInfo.name]),
  new KeplrMobileWallet(WalletRegistry[keplrMobileInfo.name]),
  new LeapExtensionWallet(WalletRegistry[leapExtensionInfo.name]),
  new CosmostationExtensionWallet(
    WalletRegistry[cosmostationExtensionInfo.name]
  ),
  new CosmostationMobileWallet(WalletRegistry[cosmostationMobileInfo.name]),
  new TerrastationExtensionWallet(
    WalletRegistry[terrastationExtensionInfo.name]
  ),
  new FrontierExtensionWallet(WalletRegistry[frontierExtensionInfo.name]),
  new TrustMobileWallet(WalletRegistry[trustMobileInfo.name]),
  new XDEFIExtensionWallet(WalletRegistry[xdefiExtensionInfo.name]),
  new OmniMobileWallet(WalletRegistry[omniMobileInfo.name]),
];
