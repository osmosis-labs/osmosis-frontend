// eslint-disable-next-line import/no-extraneous-dependencies
import * as fs from "fs";
// eslint-disable-next-line import/no-extraneous-dependencies
import * as prettier from "prettier";

import { getChainInfos } from "./utils";

/**
 * Generate a properly formatted TypeScript file chain-infos.ts containing an array of
 * ChainInfoWithExplorer & Chain objects. This array is derived from the combination of local
 * and registry chain information. This is used by comos-kit wallets and keplr to display chain
 * information hence meshing both types.
 */
async function generateChainInfo() {
  const chainInfos = getChainInfos();
  const content = `
    import type { Chain } from "@chain-registry/types";
    import { ChainInfoWithExplorer } from "@osmosis-labs/stores";

    export const ChainInfos = ${JSON.stringify(
      chainInfos,
      null,
      2
    )} as (ChainInfoWithExplorer & Chain & { chainRegistryChainName: string })[];
  `;

  const prettierConfig = await prettier.resolveConfig("./");
  const formatted = prettier.format(content, {
    ...prettierConfig,
    parser: "typescript",
  });

  try {
    fs.writeFileSync("config/chain-infos.ts", formatted, {
      encoding: "utf8",
      flag: "w",
    });
    console.log("Successfully wrote chain-infos.ts");
  } catch (e) {
    console.log(`Error writing chain-infos.ts: ${e}`);
  }
}

generateChainInfo().catch((e) => {
  console.error(e);
  process.exit(1);
});
