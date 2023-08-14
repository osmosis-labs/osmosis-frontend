// eslint-disable-next-line import/no-extraneous-dependencies
import * as fs from "fs";
import path from "path";
// eslint-disable-next-line import/no-extraneous-dependencies
import * as prettier from "prettier";

import {
  mainnetChainInfos,
  testnetChainInfos,
} from "~/config/generate-chain-infos/source-chain-infos";
import { getChainInfos } from "~/config/generate-chain-infos/utils";
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
    export type AvailableChainIds = ${Array.from(
      /**
       * We cannot directly use `chainInfos` as it is sensitive
       * to changes in environment variables, such as testnet. By merging
       * these three elements, we will cover all possible chain IDs.
       * Additionally, using a `Set` ensures that there will be no duplicate IDs.
       */
      new Set([...mainnetChainInfos, ...testnetChainInfos, ...chainInfos])
    )
      .map((c) => `"${c.chainId}" /** ${c.chainName} */`)
      .join(" | ")};
  `;

  const prettierConfig = await prettier.resolveConfig("./");
  const formatted = prettier.format(content, {
    ...prettierConfig,
    parser: "typescript",
  });

  try {
    const dirPath = "config/generated";
    const filePath = path.join(dirPath, "chain-infos.ts");

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    fs.writeFileSync(filePath, formatted, {
      encoding: "utf8",
      flag: "w",
    });
    console.info("Successfully wrote chain-infos.ts");
  } catch (e) {
    console.error(`Error writing chain-infos.ts: ${e}`);
  }
}

generateChainInfo().catch((e) => {
  console.error(e);
  process.exit(1);
});
