/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, chromium, expect, test } from "@playwright/test";
import process from "process";

import { TransactionsPage } from "~/e2e/pages/transactions-page";
import { TestConfig } from "~/e2e/test-config";
import { UnzipExtension } from "~/e2e/unzip-extension";

import { TradePage } from "../pages/trade-page";
import { WalletPage } from "../pages/wallet-page";

test.describe("Test Trade feature", () => {
  let context: BrowserContext;
  const walletId =
    process.env.WALLET_ID ?? "osmo1ka7q9tykdundaanr07taz3zpt5k72c0ut5r4xa";
  const privateKey = process.env.PRIVATE_KEY ?? "private_key";
  const password = process.env.PASSWORD ?? "TestPassword2024.";
  let tradePage: TradePage;
  let USDC =
    "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";
  let ATOM =
    "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";

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
    await walletPage.setWalletNameAndPassword("Test Trades", password);
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

  test("User should be able to Buy OSMO", async () => {
    await tradePage.goto();
    await tradePage.openBuyTab();
    await tradePage.selectAsset("OSMO");
    await tradePage.enterAmount("0.1");
    const { msgContentAmount } = await tradePage.buyAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("token_out_denom: uosmo");
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("type: osmosis/poolmanager/");
    expect(msgContentAmount).toContain("denom: " + USDC);
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
    // https://www.mintscan.io/osmosis/txs
  });

  test("User should be able to Sell ATOM", async () => {
    await tradePage.goto();
    await tradePage.openSellTab();
    await tradePage.selectAsset("ATOM");
    await tradePage.enterAmount("0.01");
    const { msgContentAmount } = await tradePage.sellAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("token_out_denom: " + USDC);
    expect(msgContentAmount).toContain("sender: " + walletId);
    expect(msgContentAmount).toContain("type: osmosis/poolmanager/");
    expect(msgContentAmount).toContain("denom: " + ATOM);
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
  });

  test("User should be able to limit sell ATOM", async () => {
    await tradePage.goto();
    await tradePage.openSellTab();
    await tradePage.openLimit();
    await tradePage.selectAsset("ATOM");
    await tradePage.enterAmount("0.01");
    await tradePage.setLimitPriceChange("5%");
    const { msgContentAmount } = await tradePage.limitSellAndGetWalletMsg(
      context
    );
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("0.01 ATOM (Cosmos Hub/channel-0)");
    expect(msgContentAmount).toContain("place_limit");
    expect(msgContentAmount).toContain('"order_direction": "ask"');
    await tradePage.isTransactionSuccesful();
  });

  test("User should be able to cancel limit sell OSMO", async () => {
    await tradePage.goto();
    await tradePage.openSellTab();
    await tradePage.openLimit();
    await tradePage.selectAsset("OSMO");
    await tradePage.enterAmount("0.2");
    await tradePage.setLimitPriceChange("10%");
    const limitPrice = await tradePage.getLimitPrice();
    const { msgContentAmount } = await tradePage.limitSellAndGetWalletMsg(
      context
    );
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("0.2 OSMO");
    expect(msgContentAmount).toContain("place_limit");
    expect(msgContentAmount).toContain('"order_direction": "ask"');
    await tradePage.isTransactionSuccesful();
    await tradePage.gotoOrdersHistory();
    const trxPage = new TransactionsPage(context.pages()[0]);
    await trxPage.cancelLimitOrder("0.2 OSMO", limitPrice, context);
    await tradePage.isTransactionSuccesful();
  });
});
