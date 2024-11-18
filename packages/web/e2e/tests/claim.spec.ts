/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, chromium, test } from "@playwright/test";
import process from "process";

import { TransactionsPage } from "~/e2e/pages/transactions-page";
import { TestConfig } from "~/e2e/test-config";
import { UnzipExtension } from "~/e2e/unzip-extension";

import { TradePage } from "../pages/trade-page";
import { WalletPage } from "../pages/wallet-page";

test.describe("Test Claim All Orders feature", () => {
  let context: BrowserContext;
  const privateKey = process.env.PRIVATE_KEY ?? "private_key";
  let tradePage: TradePage;

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
    await walletPage.setWalletNameAndPassword("Claim All Orders");
    await walletPage.selectChainsAndSave();
    await walletPage.finish();
    // Switch to Application
    tradePage = new TradePage(context.pages()[0]);
    await tradePage.goto();
    await tradePage.connectWallet();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("User should be able to Claim All filled limit orders", async () => {
    await tradePage.goto();
    await tradePage.gotoOrdersHistory(10);
    const p = context.pages()[0];
    const trxPage = new TransactionsPage(p);
    await trxPage.claimAllIfPresent(context);
  });

  test("User should be able to Claim and Close partialy filled limit orders", async () => {
    await tradePage.goto();
    await tradePage.gotoOrdersHistory(10);
    const p = context.pages()[0];
    const trxPage = new TransactionsPage(p);
    await trxPage.claimAndCloseAny(context);
  });
});
