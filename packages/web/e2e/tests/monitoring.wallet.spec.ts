/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, chromium, expect, test } from "@playwright/test";
import process from "process";

import { TransactionsPage } from "~/e2e/pages/transactions-page";
import { TestConfig } from "~/e2e/test-config";
import { UnzipExtension } from "~/e2e/unzip-extension";

import { TradePage } from "../pages/trade-page";
import { WalletPage } from "../pages/wallet-page";

test.describe("Test Filled Order feature", () => {
  let context: BrowserContext;
  const privateKey = process.env.PRIVATE_KEY ?? "private_key";
  const password = process.env.PASSWORD ?? "TestPassword2024.";
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
    await walletPage.setWalletNameAndPassword("Monitoring E2E Tests", password);
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

  test("User should be able to limit sell OSMO", async () => {
    await tradePage.goto();
    await tradePage.openSellTab();
    await tradePage.openLimit();
    await tradePage.selectAsset("OSMO");
    await tradePage.enterAmount("2.99");
    await tradePage.setLimitPriceChange("Market");
    const { msgContentAmount } = await tradePage.limitSellAndGetWalletMsg(
      context
    );
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("2.99 OSMO");
    expect(msgContentAmount).toContain("place_limit");
    expect(msgContentAmount).toContain('"order_direction": "ask"');
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
  });

  test("User should be able to limit buy OSMO", async () => {
    await tradePage.goto();
    await tradePage.openBuyTab();
    await tradePage.openLimit();
    await tradePage.selectAsset("OSMO");
    await tradePage.enterAmount("1.05");
    await tradePage.setLimitPriceChange("Market");
    const limitPrice = Number(await tradePage.getLimitPrice());
    const highLimitPrice = (limitPrice * 1.1).toFixed(4);
    await tradePage.setLimitPrice(String(highLimitPrice));
    const { msgContentAmount } = await tradePage.limitBuyAndGetWalletMsg(
      context
    );
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain('"quantity": "1050000"');
    expect(msgContentAmount).toContain("place_limit");
    expect(msgContentAmount).toContain('"order_direction": "bid"');
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
    await tradePage.gotoOrdersHistory(30);
    const p = context.pages()[0];
    const trxPage = new TransactionsPage(p);
    await trxPage.isFilledByLimitPrice(highLimitPrice);
  });
});
