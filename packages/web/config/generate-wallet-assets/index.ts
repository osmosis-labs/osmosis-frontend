// eslint-disable-next-line import/no-extraneous-dependencies
import * as fs from "fs";
// eslint-disable-next-line import/no-extraneous-dependencies
import * as prettier from "prettier";

import { getAssetLists } from "./utils";

/**
 * Generate a TypeScript file called wallet-assets.ts containing
 * a filtered list of wallet assets based on the approved list on our repo. This is going to be used
 * only in cosmos-kit wallets for now.
 */
async function generateWalletAssets() {
  const assets = getAssetLists();
  const content = `
    import type { AssetList } from "@chain-registry/types";

    export const WalletAssets = ${JSON.stringify(
      assets,
      null,
      2
    )} as AssetList[];
  `;

  const prettierConfig = await prettier.resolveConfig("./");
  const formatted = prettier.format(content, {
    ...prettierConfig,
    parser: "typescript",
  });

  try {
    fs.writeFileSync("config/wallet-assets.ts", formatted, {
      encoding: "utf8",
      flag: "w",
    });
    console.log("Successfully wrote wallet-assets.ts");
  } catch (e) {
    console.log(`Error writing wallet-assets.ts: ${e}`);
  }
}

generateWalletAssets().catch((e) => {
  console.error(e);
  process.exit(1);
});
