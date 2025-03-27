import { UnzipExtension } from "./unzip-extension";
import { TestConfig } from "./test-config";
import { chromium } from "playwright";
import { fail } from "assert";
import { WalletPage } from "./pages/keplr-page";

export class SetupKeplr {
  async setupWalletKeplr(privateKey: string, headless = false) {
    const pathToKeplrExtension = new UnzipExtension().getPathToExtension();
    const testConfig = new TestConfig().getBrowserExtensionConfig(
      headless,
      pathToKeplrExtension
    );
    console.log("\nSetup Wallet Extensions before tests.");
    try {
      const context = await chromium.launchPersistentContext("", testConfig);
      context.setDefaultNavigationTimeout(30_000);
      const pagePromise = context.waitForEvent("page", { timeout: 10_000 });
      const emptyPage = await pagePromise;
      // Playwright is too fast to decide that page is not opened.
      await emptyPage.waitForTimeout(4000);
      const page = context.pages()[1];
      await page.waitForURL("**/register.html#", {
        timeout: 5000,
      });
      const walletPage = new WalletPage(page);
      await walletPage.importWalletWithPrivateKey(privateKey);
      return context;
    } catch (error) {
      console.error("Error in SetupKeplrWallet: ", error);
      await new UnzipExtension().deleteExtension(pathToKeplrExtension);
      fail("Error in SetupKeplrWallet: Please re-run the job.");
    }
  }

  async setupWallet(testSeed: string, headless = true) {
    try {
      return await this.setupWalletKeplr(testSeed, headless);
    } catch (error) {
      console.error("2nd Error in setupWallet: ", error);
      return await this.setupWalletKeplr(testSeed, headless);
    }
  }
}
