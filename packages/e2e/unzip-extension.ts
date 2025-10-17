import decompress from "decompress";
import path from "node:path";
import fs from "node:fs";

export class UnzipExtension {
  getPathToExtension() {
    console.log("Unzip Wallet Extension before tests.");
    // Unzip keplr-extension-manifest
    const pathToZip = path.join(
      __dirname,
      "./keplr-extension-manifest-v3-v0.12.280.zip"
    );
    const pathToExtension = path.join(__dirname, "./keplr-extension-manifest");
    decompress(pathToZip, pathToExtension);
    return pathToExtension;
  }

  async deleteExtension(pathToExtension: string) {
    console.log("Delete Wallet Extension from " + pathToExtension);
    fs.rm(pathToExtension, { recursive: true }, (err) => {
      if (err) {
        console.error("Error deleting extension:", err);
      } else {
        console.log("Extension deleted successfully");
      }
    });
  }
}
