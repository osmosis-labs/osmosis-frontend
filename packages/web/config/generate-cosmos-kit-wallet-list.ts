/* eslint-disable import/no-extraneous-dependencies */
import * as fs from "node:fs";
import path from "node:path";

import { cdcwalletExtensionInfo } from "@cosmos-kit/cdcwallet-extension";
import { Wallet as DefaultWallet } from "@cosmos-kit/core";
import { cosmostationExtensionInfo } from "@cosmos-kit/cosmostation-extension";
import { keplrExtensionInfo } from "@cosmos-kit/keplr-extension";
import { keplrMobileInfo } from "@cosmos-kit/keplr-mobile";
import { leapExtensionInfo } from "@cosmos-kit/leap-extension";
import { LeapMobileInfo as leapMobileInfo } from "@cosmos-kit/leap-mobile";
import { OkxwalletExtensionInfo as okxWalletExtensionInfo } from "@cosmos-kit/okxwallet-extension";
import { stationExtensionInfo } from "@cosmos-kit/station-extension";
import { trustExtensionInfo } from "@cosmos-kit/trust-extension";
import { xdefiExtensionInfo } from "@cosmos-kit/xdefi-extension";
import { isFunction } from "@osmosis-labs/utils";
import * as prettier from "prettier";

type UpdateWalletMode =
  | "ledger"
  | "extension"
  | "wallet-connect"
  | "social-login"
  | undefined;

interface Wallet extends Omit<DefaultWallet, "mode"> {
  mode: UpdateWalletMode;
}

const CosmosKitWalletList: Wallet[] = [
  keplrExtensionInfo,
  keplrMobileInfo,
  leapExtensionInfo,
  leapMobileInfo,
  okxWalletExtensionInfo,
  trustExtensionInfo,
  xdefiExtensionInfo,
  cosmostationExtensionInfo,
  stationExtensionInfo,
  cdcwalletExtensionInfo,
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
const getStringifiedWallet = (wallet: Record<any, any>) => {
  const stringifyObject = (obj: any) => {
    let val: any[] = [];
    Object.entries(obj).forEach(([key, value]) => {
      if (isFunction(value)) {
        val.push(`"${key}": ${value.toString()},`);
      } else if (isObject(value)) {
        val.push(`"${key}": { ${stringifyObject(value)} },`);
      } else {
        val.push(`"${key}": ${JSON.stringify(value)},`);
      }
    });
    return val.join("");
  };

  const body = Object.entries(wallet).reduce((acc, [key, value]) => {
    return isObject(value)
      ? `${acc}"${key}": { ${stringifyObject(value)} },`
      : `${acc}"${key}": ${
          isFunction(value) ? value.toString() : JSON.stringify(value)
        },`;
  }, "");
  return "{" + body + "}";
};

/**
 * Generate a TypeScript file called cosmos-kit-wallet-list.ts containing all approved wallets.
 * We need to generate the file in order to not include wallets size in our main bundle.
 */
async function generateCosmosKitWalletList() {
  /**
   * Convert the registry to the following format to make access simpler.
   * {
   *  "wallet-name": walletData
   * }
   */
  const registryObject = CosmosKitWalletList.reduce((acc, w) => {
    w.logo = ""; // We'll override the logos in wallet-registry.ts
    acc[w.name] = w;
    return acc;
  }, {} as Record<string, Wallet>);

  const content = `
      import {Wallet} from "@cosmos-kit/core"
      export enum AvailableCosmosWallets {${CosmosKitWalletList.map(
        (wallet) =>
          `${wallet.prettyName.replace(/\s/g, "").replace(/\./g, "")} = "${
            wallet.name
          }"`
      ).join(",")}}
      export const CosmosKitWalletList: Record<AvailableCosmosWallets, Wallet> = ${getStringifiedWallet(
        registryObject
      )}     
    `;

  const prettierConfig = await prettier.resolveConfig("./");
  const formatted = prettier.format(content, {
    ...prettierConfig,
    parser: "typescript",
  });

  const fileName = "cosmos-kit-wallet-list.ts";
  try {
    const dirPath = "config/generated";
    const filePath = path.join(dirPath, fileName);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    fs.writeFileSync(filePath, formatted, {
      encoding: "utf8",
      flag: "w",
    });
    console.info(`Successfully wrote ${fileName}`);
  } catch (e) {
    console.error(`Error writing ${fileName}: ${e}`);
  }
}

generateCosmosKitWalletList().catch((e) => {
  console.error(e);
  process.exit(1);
});
