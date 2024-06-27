import * as fs from "fs";
import path from "path";
// eslint-disable-next-line import/no-extraneous-dependencies
import * as prettier from "prettier";

/** Generates a prettified TS file or appends to an existing TS file if `overwriteFile` is `false`.
 *  Prettier config must be at the root dir of where this function is called. */
export async function generateTsFile(
  content: string,
  dirPath: string,
  fileName: string,
  overwriteFile: boolean = true
): Promise<boolean> {
  if (!fileName.endsWith(".ts")) {
    throw new Error("TypeScript file name must end with '.ts'.");
  }

  try {
    const prettierConfig = await prettier.resolveConfig("./");
    const formatted = prettier.format(content, {
      ...prettierConfig,
      parser: "typescript",
    });

    const filePath = path.join(dirPath, fileName);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    if (overwriteFile) {
      fs.writeFileSync(filePath, formatted, {
        encoding: "utf8",
        flag: "w",
      });
    } else {
      fs.appendFileSync(filePath, formatted, {
        encoding: "utf8",
        flag: "a",
      });
    }

    console.info(
      `Successfully ${
        overwriteFile ? "wrote" : "appended to"
      } ${dirPath}/${fileName}.`
    );
    return true;
  } catch (e) {
    console.error(`Error writing ${fileName}: ${e}`);
    return false;
  }
}
