import fs from "fs";
// eslint-disable-next-line import/no-extraneous-dependencies
import { JSDOM } from "jsdom";
import path from "path";
// eslint-disable-next-line import/no-extraneous-dependencies
import * as prettier from "prettier";

/**
 * Generate a properly formatted TypeScript file sprite-ids.ts containing all the available
 * ids defines in sprite.svg. This is used by the Icon component to render the svg.
 */
async function generateSpriteIds() {
  const svgFile = fs.readFileSync("public/icons/sprite.svg", "utf-8");

  const dom = new JSDOM(svgFile);
  const document = dom.window.document;

  const symbols = document.querySelectorAll("symbol");

  const ids = Array.from(symbols).map((symbol) => symbol.id);

  const content = `export type SpriteIconId = ${ids
    .map((id) => `'${id}'`)
    .join(" | ")};`;

  const prettierConfig = await prettier.resolveConfig("./");
  const formatted = prettier.format(content, {
    ...prettierConfig,
    parser: "typescript",
  });

  try {
    const dirPath = "config/generated";
    const filePath = path.join(dirPath, "sprite-ids.ts");

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    fs.writeFileSync(filePath, formatted, {
      encoding: "utf8",
      flag: "w",
    });
    console.info("Successfully wrote sprite-ids.ts");
  } catch (e) {
    console.error(`Error writing sprite-ids.ts: ${e}`);
  }
}

generateSpriteIds().catch((e) => {
  console.error(e);
  process.exit(1);
});
