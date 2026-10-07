// Test-only Next app. No dotenv, secrets, production routes, API or transaction code.
const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");
const { createRequire } = require("node:module");
const web = path.resolve(__dirname, "../../web");
const root = path.resolve(__dirname, "../../..");
const webRequire = createRequire(path.join(web, "package.json"));
if (
  fs.lstatSync(path.join(root, "node_modules")).isSymbolicLink() ||
  !fs.realpathSync(webRequire.resolve("next")).startsWith(root + path.sep)
)
  throw new Error("Smoke requires worktree-local dependencies");
const next = webRequire("next");
const port = Number(process.env.REACT19_SMOKE_PORT || 4179);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error("Invalid local smoke port");
const app = next({
  dev: false,
  dir: path.join(__dirname, "fixture"),
  hostname: "127.0.0.1",
  port,
});
const types = {
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".cur": "image/x-icon",
};
let server;
app.prepare().then(() => {
  const handler = app.getRequestHandler();
  server = http.createServer((req, res) => {
    if (
      req.headers.host !== `127.0.0.1:${port}` ||
      !["GET", "HEAD"].includes(req.method)
    ) {
      res.writeHead(403).end();
      return;
    }
    const pathname = new URL(req.url, `http://127.0.0.1:${port}`).pathname;
    if (pathname.startsWith("/api/")) {
      res.writeHead(403).end();
      return;
    }
    if (pathname.startsWith("/tradingview/")) {
      const root = path.join(web, "public/tradingview");
      const file = path.resolve(
        root,
        "." + decodeURIComponent(pathname.slice("/tradingview".length))
      );
      if (!file.startsWith(root + path.sep)) {
        res.writeHead(403).end();
        return;
      }
      fs.readFile(file, (err, data) => {
        if (err) {
          res.writeHead(404).end();
          return;
        }
        res.setHeader(
          "Content-Type",
          types[path.extname(file)] || "application/octet-stream"
        );
        res.end(data);
      });
      return;
    }
    handler(req, res);
  });
  server.listen(port, "127.0.0.1");
});
async function close() {
  await new Promise((resolve) => (server ? server.close(resolve) : resolve()));
  await app.close();
  process.exit(0);
}
process.on("SIGTERM", close);
process.on("SIGINT", close);
