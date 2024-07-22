export class TestConfig {
  getProxyConfig() {
    const server = process.env.TEST_PROXY ?? "http://138.68.112.16:8888";
    const username = process.env.TEST_PROXY_USERNAME;
    const password = process.env.TEST_PROXY_PASSWORD;

    return {
      server: server,
      username: username,
      password: password,
    };
  }

  getBrowserExtensionConfig(headless: boolean, pathToExtension: string) {
    const USE_PROXY: boolean = process.env.USE_TEST_PROXY === "true";

    const args = [
      "--headless=new",
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
    ];
    if (USE_PROXY) {
      console.info(
        "Get Test Proxy configuration for server: " +
          this.getProxyConfig().server
      );
      return {
        headless: headless,
        args: args,
        proxy: this.getProxyConfig(),
        viewport: { width: 1440, height: 1280 },
        slowMo: 300,
      };
    } else {
      return {
        headless: headless,
        args: args,
        viewport: { width: 1440, height: 1280 },
        slowMo: 300,
      };
    }
  }

  getBrowserConfig(headless: boolean) {
    const USE_PROXY: boolean = process.env.USE_TEST_PROXY === "true";
    if (USE_PROXY) {
      console.info(
        "Get Test Proxy configuration for server: " +
          this.getProxyConfig().server
      );
      return {
        headless: headless,
        proxy: this.getProxyConfig(),
        viewport: { width: 1440, height: 1280 },
        slowMo: 300,
      };
    } else {
      return {
        headless: headless,
        viewport: { width: 1440, height: 1280 },
        slowMo: 300,
      };
    }
  }
}
