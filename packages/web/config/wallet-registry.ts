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
    logo: "/images/wallets/cosmostation.svg",
  },
  [cosmostationMobileInfo.name]: {
    ...cosmostationMobileInfo,
    logo: "/images/wallets/cosmostation.svg",
  },
  [keplrExtensionInfo.name]: {
    ...keplrExtensionInfo,
    logo: "/images/wallets/keplr.svg",
  },
  [keplrMobileInfo.name]: {
    ...keplrMobileInfo,
    logo: "/images/wallets/keplr.svg",
  },
  [frontierExtensionInfo.name]: {
    ...frontierExtensionInfo,
    logo: "/images/wallets/frontier.svg",
  },
  [leapExtensionInfo.name]: {
    ...leapExtensionInfo,
    logo: "/images/wallets/leap.svg",
  },
  [terrastationExtensionInfo.name]: {
    ...terrastationExtensionInfo,
    logo: "/images/wallets/terrastation.svg",
  },
  [trustMobileInfo.name]: {
    ...trustMobileInfo,
    logo: "/images/wallets/trust.svg",
  },
  [xdefiExtensionInfo.name]: {
    ...xdefiExtensionInfo,
    logo: "/images/wallets/xdefi.svg",
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
];
