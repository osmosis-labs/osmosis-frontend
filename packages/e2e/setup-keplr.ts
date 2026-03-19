import { UnzipExtension } from "./unzip-extension";
import { TestConfig } from "./test-config";
import { chromium } from "playwright";
import { fail } from "assert";
import { WalletPage } from "./pages/keplr-page";

export class SetupKeplr {
  /** @param secret - Hex private key or BIP39 mnemonic (12/24 words). */
  async setupWalletKeplr(secret: string, headless = false) {
    const pathToKeplrExtension = await new UnzipExtension().getPathToExtension();
    const testConfig = new TestConfig().getBrowserExtensionConfig(
      headless,
      pathToKeplrExtension
    );
    console.log("\nSetup Wallet Extensions before tests.");
    try {
      const context = await chromium.launchPersistentContext("", testConfig);
      context.setDefaultNavigationTimeout(30_000);
      const existingPages = context.pages();
      const page =
        existingPages[1] ??
        (await context.waitForEvent("page", { timeout: 15_000 }));
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
  async setupWallet(secret: string, headless = false) {
    try {
      return await this.setupWalletKeplr(secret, headless);
    } catch (error) {
      console.error("2nd Error in setupWallet: ", error);
      return await this.setupWalletKeplr(secret, headless);
    }
  }
}
