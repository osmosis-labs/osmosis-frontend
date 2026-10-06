export class TestConfig {
  getBrowserExtensionConfig(headless: boolean, pathToExtension: string) {
    const viewport = { width: 1440, height: 1280 };
    const args = this.getArgs(headless, pathToExtension);

    // Playwright's headless flag must always be false for extension configs.
    // When headless=true Playwright selects the Chromium Headless Shell binary
    // which is a stripped build that does NOT support extensions. Instead we
    // tell Playwright to launch the full Chromium (headless: false) and let
    // Chrome's own --headless=new flag (injected via getArgs) handle headless
    // rendering while retaining full extension support.
    return {
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
