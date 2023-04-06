import type { Asset, AssetList } from "@chain-registry/types";
// eslint-disable-next-line import/no-extraneous-dependencies
import { assets as assetLists } from "chain-registry";
import * as fs from "fs";
// eslint-disable-next-line import/no-extraneous-dependencies
import * as prettier from "prettier";

import IBCAssetInfos from "./ibc-assets";

const AssetInfos: { isVerified?: boolean; coinMinimalDenom: string }[] = [
  ...IBCAssetInfos,
  // Native Osmosis Assets
  { coinMinimalDenom: "uosmo", isVerified: true },
  { coinMinimalDenom: "uion", isVerified: true },
];

const hasMatchingMinimalDenom = (
  { denom_units, traces }: Asset,
  coinMinimalDenom: string
) => {
  return (
    denom_units.some(
      ({ aliases, denom }) =>
        denom.toLowerCase() === coinMinimalDenom.toLowerCase() ||
        aliases?.some(
          (alias) => alias.toLowerCase() === coinMinimalDenom.toLowerCase()
        )
    ) ||
    traces?.some(
      ({ counterparty }) =>
        counterparty?.base_denom.toLowerCase() ===
        coinMinimalDenom.toLowerCase()
    )
  );
};

function getAssetLists(): AssetList[] {
  let newAssetLists: AssetList[] = [];

  for (const list of assetLists) {
    // Filter out assets that are not IBC assets
    list.assets = list.assets.filter((asset) =>
      AssetInfos.some(({ coinMinimalDenom }) =>
        hasMatchingMinimalDenom(asset, coinMinimalDenom)
      )
    );

    if (list.assets.length > 0) {
      newAssetLists.push(list);
    } else {
      console.log(`No IBC assets found for ${list.chain_name}`);
    }
  }

  return newAssetLists;
}

async function generateChainInfo() {
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

generateChainInfo().catch((e) => {
  console.error(e);
  process.exit(1);
});
