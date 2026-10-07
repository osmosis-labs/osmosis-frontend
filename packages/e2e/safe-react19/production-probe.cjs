// Optional diagnostic, NOT part of the offline suite. Reads no wallet secrets.
// Uses the existing local production build and opens only its disconnected list.
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");
const { createRequire } = require("node:module");
const { chromium } = require("@playwright/test");
const root = path.resolve(__dirname, "../../..");
const web = path.join(root, "packages/web");
const webRequire = createRequire(path.join(web, "package.json"));
if (process.env.BASE_URL)
  throw new Error(
    "Unset BASE_URL: this probe always launches its own localhost server"
  );
if (
  fs.lstatSync(path.join(root, "node_modules")).isSymbolicLink() ||
  !fs.realpathSync(webRequire.resolve("next")).startsWith(root + path.sep)
)
  throw new Error("Local dependencies required");
const fontStub = process.argv.slice(2).includes("--local-font-stub");
if (process.argv.slice(2).some((arg) => arg !== "--local-font-stub"))
  throw new Error("Unknown probe argument");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function probe() {
  const reserve = net.createServer();
  reserve.listen(0, "127.0.0.1");
  await once(reserve, "listening");
  const port = reserve.address().port;
  await new Promise((resolve) => reserve.close(resolve));
  const origin = `http://127.0.0.1:${port}`;
  const server = spawn(
    process.execPath,
    [
      path.join(root, "node_modules/next/dist/bin/next"),
      "start",
      web,
      "-H",
      "127.0.0.1",
      "-p",
      String(port),
    ],
    { cwd: root, stdio: ["ignore", "pipe", "pipe"] }
  );
  // Do not dump server output/config. Count errors, retain no raw messages.
  let serverErrors = 0;
  server.stdout.on("data", () => {});
  server.stderr.on("data", (data) => {
    if (/error|failed/i.test(String(data))) serverErrors++;
  });
  const exited = once(server, "exit");
  let browser;
  let completed = false;
  const result = {
    ok: false,
    origin,
    fontStylesheetsStubbed: fontStub,
    navigation: "not-started",
    consoleErrors: 0,
    pageErrors: 0,
    reactRefHydrationErrors: 0,
    errorCategories: {},
    networkFailures: [],
    httpFailures: [],
    modal: { opened: false, closedWithEscape: false, focusReturned: false },
    cleanedUp: false,
  };
  try {
    let ready = false;
    for (let i = 0; i < 30; i++) {
      if (server.exitCode !== null)
        throw new Error("Local Next server exited during startup");
      try {
        await fetch(`${origin}/favicon.ico`);
        ready = true;
        break;
      } catch {
        await delay(1000);
      }
    }
    if (!ready) throw new Error("Local Next server startup timed out");
    browser = await chromium.launch();
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
    });
    if (fontStub)
      await page.route("https://fonts.googleapis.com/css2?*", (route) =>
        route.fulfill({
          status: 200,
          contentType: "text/css",
          body: "/* explicit diagnostic-only stylesheet stub; production fonts NOT validated */",
        })
      );
    page.on("pageerror", (error) => {
      result.pageErrors++;
      if (/React|hydration|element.ref|findDOMNode/i.test(error.message))
        result.reactRefHydrationErrors++;
    });
    page.on("console", (message) => {
      if (message.type() !== "error") return;
      result.consoleErrors++;
      const text = message.text();
      if (/hydration|Minified React|element.ref|findDOMNode/i.test(text))
        result.reactRefHydrationErrors++;
      const category =
        text.match(/(?:local|edge)\.[A-Za-z.]+/)?.[0] ||
        (text.includes("Failed to load resource")
          ? "resource"
          : "unclassified");
      result.errorCategories[category] =
        (result.errorCategories[category] || 0) + 1;
    });
    page.on("requestfailed", (request) => {
      const url = new URL(request.url());
      result.networkFailures.push({
        origin: url.origin,
        path: url.pathname,
        error: request.failure()?.errorText,
      });
    });
    page.on("response", (response) => {
      if (response.status() >= 400) {
        const url = new URL(response.url());
        result.httpFailures.push({
          origin: url.origin,
          path: url.pathname,
          status: response.status(),
        });
      }
    });
    const response = await page.goto(origin, {
      waitUntil: "commit",
      timeout: 45_000,
    });
    result.navigation = `HTTP ${response.status()}`;
    // Bounded diagnostic window; pending external requests are not success.
    await delay(45_000);
    result.readyState = await page.evaluate(() => document.readyState);
    const connect = page
      .getByRole("button", { name: /^connect wallet$/i })
      .first();
    if (await connect.count()) {
      await connect.click();
      const dialog = page.getByRole("dialog", { includeHidden: true });
      await dialog.waitFor({ state: "visible", timeout: 15_000 });
      result.modal.opened = true;
      // Never click an adapter, approval, signing, swap/order or transfer control.
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "detached", timeout: 5000 });
      result.modal.closedWithEscape = true;
      result.modal.focusReturned = await connect.evaluate(
        (element) => document.activeElement === element
      );
    }
    completed = true;
  } finally {
    await browser?.close();
    if (server.exitCode === null) server.kill("SIGTERM");
    await exited;
    result.cleanedUp = true;
    result.serverErrorChunks = serverErrors;
    result.ok =
      completed &&
      result.modal.opened &&
      result.modal.closedWithEscape &&
      result.modal.focusReturned &&
      result.consoleErrors === 0 &&
      result.pageErrors === 0 &&
      result.networkFailures.length === 0 &&
      result.httpFailures.length === 0 &&
      serverErrors === 0;
    const output = path.join(root, ".yarn/react19-browser");
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(
      path.join(output, "production-summary.json"),
      JSON.stringify(result, null, 2)
    );
    console.log(JSON.stringify(result, null, 2));
  }
  if (!result.ok) process.exitCode = 1;
}
probe().catch(() => {
  console.error(
    "Production probe blocked/failed; see sanitized local summary (no release approval)."
  );
  process.exitCode = 1;
});
