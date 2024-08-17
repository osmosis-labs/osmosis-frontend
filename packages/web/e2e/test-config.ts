export class TestConfig {
  getProxyConfig() {
    const server = process.env.TEST_PROXY ?? "http://138.68.112.16:8888";
    const username = process.env.TEST_PROXY_USERNAME;
    const password = process.env.TEST_PROXY_PASSWORD;

    if (!username || !password) {
      throw new Error(
        "Proxy username or password is not set in environment variables."
      );
    }

    return {
      server: server,
      username: username,
      password: password,
    };
  }

  getBrowserExtensionConfig(headless: boolean, pathToExtension: string) {
    // GitHub Actions matrix does not understand true
    const USE_PROXY: boolean = process.env.USE_TEST_PROXY === "use";
    const viewport = { width: 1440, height: 1280 };
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
        viewport: viewport,
        slowMo: 300,
      };
    } else {
      return {
        headless: headless,
        args: args,
        viewport: viewport,
        slowMo: 300,
      };
    }
  }

  getBrowserConfig(headless: boolean) {
    const USE_PROXY: boolean = process.env.USE_TEST_PROXY === "use";
    const viewport = { width: 1440, height: 1280 };
    if (USE_PROXY) {
      console.info(
        "Get Test Proxy configuration for server: " +
          this.getProxyConfig().server
      );
      return {
        headless: headless,
        proxy: this.getProxyConfig(),
        viewport: viewport,
        slowMo: 300,
      };
    } else {
      return {
        headless: headless,
        viewport: viewport,
        slowMo: 300,
      };
    }
  }
}
