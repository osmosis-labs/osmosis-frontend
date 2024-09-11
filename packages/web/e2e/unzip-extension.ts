const decompress = require("decompress");
import path from "path";

export class UnzipExtension {
  getPathToExtension() {
    console.log("Unzip Wallet Extension before tests.");
    // Unzip keplr-extension-manifest
    const pathToZip = path.join(
      __dirname,
      "./keplr-extension-manifest-v3-v0.12.125.zip"
    );
    const pathToExtension = path.join(__dirname, "./keplr-extension-manifest");
    decompress(pathToZip, pathToExtension);
    return pathToExtension;
  }

  getPathToMetaMaskExtension() {
    console.log("Unzip Wallet Extension before tests.");
    // Unzip metamask-extension-manifest
    const pathToZip = path.join(__dirname, "./metamask-chrome-12.1.1.zip");
    const pathToExtension = path.join(
      __dirname,
      "./metamask-extension-manifest"
    );
    decompress(pathToZip, pathToExtension);
    return pathToExtension;
  }
}
