import { UnzipExtension } from "./unzip-extension";
import { TestConfig } from "./test-config";
import { type BrowserContext, chromium } from "playwright";
import { fail } from "assert";
import { WalletPage } from "./pages/keplr-page";

export class SetupKeplr {
  /**
   * Resolve the Keplr register page from the browser context.
   *
   * In headed mode (macOS CI) the extension auto-opens a tab at register.html
   * which appears as existingPages[1] or fires a "page" event.
   *
   * In --headless=new on Linux the auto-tab often doesn't appear, so we fall
   * back to discovering the extension ID from its service worker and navigating
   * to the register page manually.
   */
  private async getKeplrRegisterPage(context: BrowserContext) {
    const existingPages = context.pages();
    const registerPage = existingPages.find((p) =>
      p.url().includes("register.html")
    );
    if (registerPage) {
      console.log("Keplr register page found in existing pages.");
      return registerPage;
    }

    if (existingPages[1]) {
      try {
        await existingPages[1].waitForURL("**/register.html#", {
          timeout: 5_000,
        });
        console.log("Keplr register page found at existingPages[1].");
        return existingPages[1];
      } catch {
        // Not the register page; continue to other strategies.
      }
    }

    try {
      const page = await context.waitForEvent("page", { timeout: 10_000 });
      console.log(`New page event fired: ${page.url()}`);
      return page;
    } catch {
      console.log(
        "No page event for Keplr register tab; falling back to service worker discovery."
      );
    }

    const extensionId = await this.discoverExtensionId(context);
    if (extensionId) {
      const page = existingPages[0] ?? (await context.newPage());
      const registerUrl = `chrome-extension://${extensionId}/register.html#`;
      console.log(`Navigating directly to: ${registerUrl}`);
      await page.goto(registerUrl, { waitUntil: "domcontentloaded" });
      return page;
    }

    throw new Error(
      "Could not locate Keplr register page via any strategy (existing pages, page event, or service worker)."
    );
  }

  private async discoverExtensionId(
    context: BrowserContext
  ): Promise<string | null> {
    let workers = context.serviceWorkers();
    if (workers.length === 0) {
      console.log("Waiting for Keplr service worker to register...");
      try {
        await context.waitForEvent("serviceworker", { timeout: 10_000 });
      } catch {
        console.log("No service worker event received within 10s.");
      }
      workers = context.serviceWorkers();
    }

    for (const sw of workers) {
      const match = sw.url().match(/^chrome-extension:\/\/([^/]+)/);
      if (match) {
        console.log(`Discovered extension ID: ${match[1]}`);
        return match[1];
      }
    }
    console.log("No chrome-extension service workers found.");
    return null;
  }

  /** @param secret - Hex private key or BIP39 mnemonic (12/24 words). */
  async setupWalletKeplr(
    secret: string,
    headless = process.env.HEADLESS === "true",
  ) {
    const pathToKeplrExtension = await new UnzipExtension().getPathToExtension();
    const testConfig = new TestConfig().getBrowserExtensionConfig(
      headless,
      pathToKeplrExtension
    );
    console.log("\nSetup Wallet Extensions before tests.");
    console.log(`Headless mode: ${headless}`);
    try {
      const context = await chromium.launchPersistentContext("", testConfig);
      context.setDefaultNavigationTimeout(30_000);
      const page = await this.getKeplrRegisterPage(context);
      await page.waitForURL("**/register.html#", {
        timeout: 15_000,
      });
      const walletPage = new WalletPage(page);
      await walletPage.importWallet(secret);
      return context;
    } catch (error) {
      console.error("Error in SetupKeplrWallet: ", error);
      await new UnzipExtension().deleteExtension(pathToKeplrExtension);
      fail("Error in SetupKeplrWallet: Please re-run the job.");
    }
  }

  /** @param secret - Hex private key or BIP39 mnemonic (12/24 words). */
  async setupWallet(
    secret: string,
    headless = process.env.HEADLESS === "true",
  ) {
    try {
      return await this.setupWalletKeplr(secret, headless);
    } catch (error) {
      console.error("2nd Error in setupWallet: ", error);
      return await this.setupWalletKeplr(secret, headless);
    }
  }
}
