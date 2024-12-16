import { type BrowserContext, chromium, expect, test } from "@playwright/test";

import { WalletPage } from "../pages/keplr-page";
import { TradePage } from "../pages/trade-page";
import { TestConfig } from "../test-config";
import { UnzipExtension } from "../unzip-extension";

test.describe("Test Swap Stables feature", () => {
  let context: BrowserContext;
  const privateKey = process.env.PRIVATE_KEY ?? "private_key";
  let tradePage: TradePage;
  const swapAmount = "0.55";

  test.beforeAll(async () => {
    const pathToExtension = new UnzipExtension().getPathToExtension();
    console.log("\nSetup Wallet Extension before tests.");
    // Launch Chrome with a Keplr wallet extension
    context = await chromium.launchPersistentContext(
      "",
      new TestConfig().getBrowserExtensionConfig(false, pathToExtension)
    );
    // Get all new pages (including Extension) in the context and wait
    const emptyPage = context.pages()[0];
    await emptyPage.waitForTimeout(2000);
    let page = context.pages()[1];
    const walletPage = new WalletPage(page);
    // Import existing Wallet (could be aggregated in one function).
    await walletPage.importWalletWithPrivateKey(privateKey);
    await walletPage.setWalletNameAndPassword("Test Stables");
    await walletPage.selectChainsAndSave();
    await walletPage.finish();
    page = context.pages()[0];
    tradePage = new TradePage(page);

    await tradePage.goto();
    await tradePage.connectWallet();
    expect(await tradePage.isError(), "Swap is not available!").toBeFalsy();
  });

  test.afterAll(async () => {
    await context.close();
  });

  // biome-ignore lint/complexity/noForEach: <explanation>
  [
    { from: "USDC", to: "USDC.eth.axl" },
    { from: "USDC.eth.axl", to: "USDC" },
    { from: "USDC", to: "USDT" },
    { from: "USDT", to: "USDC" },
  ].forEach(({ from, to }) => {
    test(`User should be able to swap ${from} to ${to}`, async () => {
      await tradePage.goto();
      await tradePage.selectPair(from, to);
      await tradePage.enterAmount(swapAmount);
      await tradePage.showSwapInfo();
      await tradePage.swapAndApprove(context);
      await tradePage.isTransactionSuccesful();
      await tradePage.getTransactionUrl();
    });
  });
});
