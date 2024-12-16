import { type BrowserContext, chromium, expect, test } from "@playwright/test";

import { TestConfig } from "../test-config";
import { UnzipExtension } from "../unzip-extension";

import { WalletPage } from "../pages/keplr-page";
import { TradePage } from "../pages/trade-page";

test.describe("Test Market Buy/Sell Order feature", () => {
  let context: BrowserContext;
  const privateKey = process.env.PRIVATE_KEY ?? "private_key";
  let tradePage: TradePage;
  const TRX_SUCCESS_TIMEOUT = 10000;

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
    const page = context.pages()[1];
    const walletPage = new WalletPage(page);
    // Import existing Wallet (could be aggregated in one function).
    await walletPage.importWalletWithPrivateKey(privateKey);
    await walletPage.setWalletNameAndPassword("Monitoring E2E Tests");
    await walletPage.selectChainsAndSave();
    await walletPage.finish();
    // Switch to Application
    tradePage = new TradePage(context.pages()[0]);
    await tradePage.goto();
    await tradePage.connectWallet();
    expect(await tradePage.isError(), "Swap is not available!").toBeFalsy();
  });

  test.afterAll(async () => {
    await context.close();
  });

  // biome-ignore lint/correctness/noEmptyPattern: <explanation>
  test.afterEach(async ({}, testInfo) => {
    console.log(`Test [${testInfo.title}] status: ${testInfo.status}`);
    if (testInfo.status === "failed") {
      const name = testInfo.title;
      process.env.GITHUB_STEP_SUMMARY = `Test ${name} failed.`;
      console.log(`GITHUB_STEP_SUMMARY: ${process.env.GITHUB_STEP_SUMMARY}`);
    }
  });

  // biome-ignore lint/complexity/noForEach: <explanation>
  [{ name: "BTC" }, { name: "OSMO" }].forEach(({ name }) => {
    test(`User should be able to Market Buy ${name}`, async () => {
      await tradePage.goto();
      await tradePage.openBuyTab();
      await tradePage.selectAsset(name);
      await tradePage.enterAmount("1.55");
      await tradePage.isSufficientBalanceForTrade();
      await tradePage.showSwapInfo();
      await tradePage.buyAndApprove(context);
      await tradePage.isTransactionSuccesful(TRX_SUCCESS_TIMEOUT);
      await tradePage.getTransactionUrl();
    });
  });

  // unwrapped market sell tests just in case this affects anything.
  test("User should be able to Market Sell BTC", async () => {
    await tradePage.goto();
    await tradePage.openSellTab();
    await tradePage.selectAsset("BTC");
    await tradePage.enterAmount("1.54");
    await tradePage.isSufficientBalanceForTrade();
    await tradePage.showSwapInfo();
    await tradePage.sellAndApprove(context);
    await tradePage.isTransactionSuccesful(TRX_SUCCESS_TIMEOUT);
    await tradePage.getTransactionUrl();
  });

  test("User should be able to Market Sell OSMO", async () => {
    await tradePage.goto();
    await tradePage.openSellTab();
    await tradePage.selectAsset("OSMO");
    await tradePage.enterAmount("1.54");
    await tradePage.isSufficientBalanceForTrade();
    await tradePage.showSwapInfo();
    await tradePage.sellAndApprove(context);
    await tradePage.isTransactionSuccesful(TRX_SUCCESS_TIMEOUT);
    await tradePage.getTransactionUrl();
  });
});
