export class TestConfig {
  getProxyConfig() {
    const server = process.env.TEST_PROXY ?? "http://138.68.112.16:8888";
    const username = process.env.TEST_PROXY_USERNAME;
    const password = process.env.TEST_PROXY_PASSWORD;

    console.info("Get Test Proxy configuration for server: " + server);

    return {
      server: server,
      username: username,
      password: password,
    };
  }
}
