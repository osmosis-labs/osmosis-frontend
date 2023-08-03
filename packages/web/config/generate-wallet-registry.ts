/* eslint-disable import/no-extraneous-dependencies */
import type { Wallet } from "@cosmos-kit/core";
import { cosmostationExtensionInfo } from "@cosmos-kit/cosmostation-extension";
import { keplrExtensionInfo } from "@cosmos-kit/keplr-extension";
import { leapExtensionInfo } from "@cosmos-kit/leap-extension";
import * as fs from "fs";
import path from "path";
import * as prettier from "prettier";

import { keplrMobileInfo } from "~/integrations/keplr-walletconnect";
import { leapMobileInfo } from "~/integrations/leap-walletconnect";
import { isFunction } from "~/utils/assertion";

const WalletRegistry: (Wallet & {
  lazyInstallUrl: string;
  walletClassName: string;
  // Used to determine if wallet is installed.
  windowPropertyName?: string;
})[] = [
  {
    ...keplrExtensionInfo,
    mobileDisabled: false,
    logo: "/wallets/keplr.svg",
    lazyInstallUrl: "@cosmos-kit/keplr-extension",
    walletClassName: "KeplrExtensionWallet",
    windowPropertyName: "keplr",
  },
  {
    ...keplrMobileInfo,
    logo: "/wallets/keplr.svg",
    lazyInstallUrl: "~/integrations/keplr-walletconnect",
    walletClassName: "KeplrMobileWallet",
  },
  {
    ...leapExtensionInfo,
    logo: "/wallets/leap.svg",
    mobileDisabled: false,
    lazyInstallUrl: "@cosmos-kit/leap-extension",
    walletClassName: "LeapExtensionWallet",
    windowPropertyName: "leap",
  },
  {
    ...leapMobileInfo,
    logo: "/wallets/leap.svg",
    lazyInstallUrl: "~/integrations/leap-walletconnect",
    walletClassName: "LeapMobileWallet",
  },
  {
    ...cosmostationExtensionInfo,
    logo: "/wallets/cosmostation.png",
    lazyInstallUrl: "@cosmos-kit/cosmostation-extension",
    walletClassName: "CosmostationExtensionWallet",
    windowPropertyName: "cosmostation",
  },
  // {
  //   ...cosmostationMobileInfo,
  //   logo: "/wallets/cosmostation.png",
  //   lazyInstallUrl: "@cosmos-kit/cosmostation-mobile",
  //   walletClassName: "CosmostationMobileWallet",
  // },
  // {
  //   ...frontierExtensionInfo,
  //   logo: "/wallets/frontier.png",
  //   lazyInstallUrl: "@cosmos-kit/frontier-extension",
  //   walletClassName: "FrontierExtensionWallet",
  // },
  // {
  //   ...stationExtensionInfo,
  //   logo: "/wallets/station.svg",
  //   lazyInstallUrl: "@cosmos-kit/station-extension",
  //   walletClassName: "StationExtensionWallet",
  // },
  // {
  //   ...trustMobileInfo,
  //   logo: "/wallets/trust.png",
  //   lazyInstallUrl: "@cosmos-kit/trust-mobile",
  //   walletClassName: "TrustMobileWallet",
  // },
  // {
  //   ...xdefiExtensionInfo,
  //   logo: "/wallets/xdefi.png",
  //   lazyInstallUrl: "@cosmos-kit/xdefi-extension",
  //   walletClassName: "XDEFIExtensionWallet",
  // },
  // {
  //   ...omniMobileInfo,
  //   logo: "/wallets/omni.webp",
  //   lazyInstallUrl: "@cosmos-kit/omni-mobile",
  //   walletClassName: "OmniMobileWallet",
  // },
];

function isObject(value: any): value is Record<any, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Convert a wallet object to a stringified version. It replaces the lazyInstallUrl with a function
 * to lazy load the wallet. We avoid JSON.stringify because it can't serialize functions.
 * @param wallet Wallet object
 * @example
 * {
 *  ...walletData,
 *  lazyInstall: () => import("wallet-lazy-install-url").then(m => m.wallets),
 * }
 */
const getStringifiedWallet = (wallet: (typeof WalletRegistry)[number]) => {
  const stringifyObject = (obj: any) => {
    let val: any[] = [];
    Object.entries(obj).forEach(([key, value]) => {
      if (isFunction(value)) {
        val.push(`${key}: ${value.toString()},`);
      } else if (isObject(value)) {
        val.push(`${key}: { ${stringifyObject(value)} },`);
      } else {
        val.push(`${key}: ${JSON.stringify(value)},`);
      }
    });
    return val.join("");
  };

  const body = Object.entries(wallet).reduce((acc, [key, value]) => {
    if (key === "walletClassName") return acc;
    if (key === "lazyInstallUrl") {
      return `${acc}lazyInstall: () => import("${value}").then(m => m.${wallet.walletClassName}),`;
    }
    return isObject(value)
      ? `${acc}${key}: { ${stringifyObject(value)} },`
      : `${acc}${key}: ${
          isFunction(value) ? value.toString() : JSON.stringify(value)
        },`;
  }, "");
  return "{" + body + "}";
};

/**
 * Generate a TypeScript file called wallet-registry.ts containing all approved wallets.
 * We need to generate the file in order to not include wallets size in our main bundle.
 */
async function generateWalletRegistry() {
  const content = `  
      /* eslint-disable import/no-extraneous-dependencies */
      import type { Wallet } from "@cosmos-kit/core";
      export const WalletRegistry: (Wallet & { lazyInstall: Function, windowPropertyName?: string })[] = [${WalletRegistry.map(
        getStringifiedWallet
      ).join(",")}];
      export enum AvailableWallets {${WalletRegistry.map(
        (wallet) => `${wallet.prettyName.replace(/\s/g, "")} = "${wallet.name}"`
      ).join(",")}}
    `;

  const prettierConfig = await prettier.resolveConfig("./");
  const formatted = prettier.format(content, {
    ...prettierConfig,
    parser: "typescript",
  });

  try {
    const dirPath = "config/generated";
    const filePath = path.join(dirPath, "wallet-registry.ts");

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    fs.writeFileSync(filePath, formatted, {
      encoding: "utf8",
      flag: "w",
    });
    console.info("Successfully wrote wallet-registry.ts");
  } catch (e) {
    console.error(`Error writing wallet-registry.ts: ${e}`);
  }
}

generateWalletRegistry().catch((e) => {
  console.error(e);
  process.exit(1);
});
