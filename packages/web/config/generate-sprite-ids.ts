import fs from "fs";
import { JSDOM } from "jsdom";
import path from "path";

/**
 * Generate a TypeScript file sprite-ids.ts containing all the available
 * ids defined in sprite.svg. This is used by the Icon component to render the svg.
 */
async function generateSpriteIds() {
  const svgFile = fs.readFileSync("public/icons/sprite.svg", "utf-8");

  const dom = new JSDOM(svgFile);
  const document = dom.window.document;

  const symbols = document.querySelectorAll("symbol");

  const ids = Array.from(symbols).map((symbol) => symbol.id);

  const content = `export type SpriteIconId = ${ids
    .map((id) => `'${id}'`)
    .join(" | ")};\n`;

  try {
    const dirPath = "config/generated";
    const filePath = path.join(dirPath, "sprite-ids.ts");

    fs.mkdirSync(dirPath, { recursive: true });

    fs.writeFileSync(filePath, content, {
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
