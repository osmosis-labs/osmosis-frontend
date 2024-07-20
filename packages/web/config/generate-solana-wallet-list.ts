/* eslint-disable import/no-extraneous-dependencies */
import * as fs from "node:fs";
import path from "node:path";

import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";
import * as prettier from "prettier";

type UpdateWalletMode = "extension" | "mobile" | "hardware" | undefined;

interface Wallet {
  name: string;
  prettyName: string;
  mode: UpdateWalletMode;
  adapter: any;
}

const SolanaWalletList: Wallet[] = [
  {
    // This is the generic wallet type that automatically supports
    // Solana wallets that implement the Solana Wallet Standard
    name: "unsafeBurner",
    prettyName: "Unsafe Burner",
    mode: "extension",
    adapter: new UnsafeBurnerWalletAdapter(),
  },
  // TODO: add other wallets here
];

function isObject(value: any): value is Record<any, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const getStringifiedWallet = (wallet: Record<any, any>) => {
  const stringifyObject = (obj: any) => {
    let val: any[] = [];
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === "function") {
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
          typeof value === "function" ? value.toString() : JSON.stringify(value)
        },`;
  }, "");
  return "{" + body + "}";
};

async function generateSolanaWalletList() {
  const registryObject = SolanaWalletList.reduce((acc, w) => {
    acc[w.name] = w;
    return acc;
  }, {} as Record<string, Wallet>);

  const content = `
      import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
      import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";
      
      export enum AvailableSolanaWallets {${SolanaWalletList.map(
        (wallet) =>
          `${wallet.prettyName.replace(/\s/g, "").replace(/\./g, "")} = "${
            wallet.name
          }"`
      ).join(",")}}
      
      export const SolanaWalletList: Record<AvailableSolanaWallets, Wallet> = ${getStringifiedWallet(
        registryObject
      )}     
    `;

  const prettierConfig = await prettier.resolveConfig("./");
  const formatted = prettier.format(content, {
    ...prettierConfig,
    parser: "typescript",
  });

  const fileName = "solana-wallet-list.ts";
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

generateSolanaWalletList().catch((e) => {
  console.error(e);
  process.exit(1);
});
