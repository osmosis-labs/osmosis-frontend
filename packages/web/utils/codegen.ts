import * as fs from "fs";
import path from "path";

/** Generates a TS file or appends to an existing TS file if `overwriteFile` is `false`. */
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
    fs.mkdirSync(dirPath, { recursive: true });
    const output = content.endsWith("\n") ? content : `${content}\n`;
    const filePath = path.join(dirPath, fileName);

    if (overwriteFile) {
      fs.writeFileSync(filePath, output, {
        encoding: "utf8",
        flag: "w",
      });
    } else {
      fs.appendFileSync(filePath, output, {
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
