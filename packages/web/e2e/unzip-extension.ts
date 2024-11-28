const decompress = require("decompress");
import path from "path";

export class UnzipExtension {
  getPathToExtension() {
    console.log("Unzip Keplr Wallet Extension before tests.");
    // Unzip keplr-extension-manifest
    const pathToZip = path.join(
      __dirname,
      "./keplr-extension-manifest-v3-v0.12.156.zip"
    );
    const pathToExtension = path.join(__dirname, "./keplr-extension-manifest");
    decompress(pathToZip, pathToExtension);
    return pathToExtension;
  }
}
