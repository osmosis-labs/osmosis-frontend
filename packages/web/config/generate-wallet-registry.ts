/* eslint-disable import/no-extraneous-dependencies */
import { cosmostationExtensionInfo } from "@cosmos-kit/cosmostation-extension";
import { keplrExtensionInfo } from "@cosmos-kit/keplr-extension";
import { keplrMobileInfo } from "@cosmos-kit/keplr-mobile";
import { leapExtensionInfo } from "@cosmos-kit/leap-extension";
import { OkxwalletExtensionInfo as okxWalletExtensionInfo } from "@cosmos-kit/okxwallet-extension";
import { RegistryWallet } from "@osmosis-labs/stores";
import * as fs from "fs";
import path from "path";
import * as prettier from "prettier";

import { isFunction } from "~/utils/assertion";

interface GenerateRegistryWallet extends Omit<RegistryWallet, "lazyInstall"> {
  lazyInstallUrl: string;
  walletClassName: string;
}

const WalletRegistry: GenerateRegistryWallet[] = [
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
    ...cosmostationExtensionInfo,
    logo: "/wallets/cosmostation.png",
    lazyInstallUrl: "@cosmos-kit/cosmostation-extension",
    walletClassName: "CosmostationExtensionWallet",
    windowPropertyName: "cosmostation",
  },
  {
    ...okxWalletExtensionInfo,
    logo: "/wallets/okx.png",
    lazyInstallUrl: "@cosmos-kit/okxwallet-extension",
    walletClassName: "OkxwalletExtensionWallet",
    windowPropertyName: "okxwallet",
    supportsChain: async (chainId) => {
      if (typeof window === "undefined") return true;

      // @ts-ignore
      const okxWallet = window?.okxwallet?.keplr as {
        getKey: (chainId: string) => Promise<boolean>;
      };

      if (!okxWallet) return true;

      return okxWallet
        .getKey(chainId)
        .then(() => true)
        .catch(() => false);
    },
  },
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
      import { RegistryWallet } from "@osmosis-labs/stores";
      export const WalletRegistry: RegistryWallet[] = [${WalletRegistry.map(
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
