export class TestConfig {
  getBrowserExtensionConfig(headless: boolean, pathToExtension: string) {
    const viewport = { width: 1440, height: 1280 };
    const args = this.getArgs(headless, pathToExtension);

    // Use the full bundled Chromium for extension support. Keep the existing
    // --headless=new argument for headless runs instead of the Headless Shell.
    return {
      channel: "chromium",
      headless: false,
      args: args,
      viewport: viewport,
      slowMo: 300,
    };
  }

  getBrowserConfig(headless: boolean) {
    const viewport = { width: 1440, height: 1280 };
    return {
      headless: headless,
      viewport: viewport,
      slowMo: 300,
    };
  }

  getArgs(headless: boolean, pathToExtension: string) {
    if (headless) {
      return [
        "--headless=new",
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ];
    } else {
      return [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ];
    }
  }
}
