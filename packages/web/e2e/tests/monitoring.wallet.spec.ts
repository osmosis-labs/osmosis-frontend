/* eslint-disable import/no-extraneous-dependencies */
import { type BrowserContext, chromium, expect, test } from "@playwright/test";
import process from "process";

import { TransactionsPage } from "~/e2e/pages/transactions-page";
import { TestConfig } from "~/e2e/test-config";
import { UnzipExtension } from "~/e2e/unzip-extension";

import { TradePage } from "../pages/trade-page";
import { WalletPage } from "../pages/wallet-page";

test.describe("Test Filled Limit Order feature", () => {
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

  test("User should be able to limit sell OSMO", async () => {
    await tradePage.goto();
    await tradePage.openSellTab();
    await tradePage.openLimit();
    await tradePage.selectAsset("OSMO");
    await tradePage.enterAmount("1.01");
    await tradePage.setLimitPriceChange("Market");
    const { msgContentAmount } = await tradePage.sellAndGetWalletMsg(
      context,
      true
    );
    expect(msgContentAmount).toBeTruthy();
    // now this is converted from USDC
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
    await tradePage.enterAmount("1.01");
    await tradePage.setLimitPriceChange("Market");
    const limitPrice = Number(await tradePage.getLimitPrice());
    const highLimitPrice = (limitPrice * 1.07).toFixed(4);
    await tradePage.setLimitPrice(String(highLimitPrice));
    const { msgContentAmount } = await tradePage.buyAndGetWalletMsg(
      context,
      true
    );
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain('"quantity": "1010000"');
    expect(msgContentAmount).toContain("place_limit");
    expect(msgContentAmount).toContain('"order_direction": "bid"');
    await tradePage.isTransactionSuccesful();
    await tradePage.getTransactionUrl();
    await tradePage.gotoOrdersHistory(30);
    const p = context.pages()[0];
    const trxPage = new TransactionsPage(p);
    await trxPage.isFilledByLimitPrice(highLimitPrice);
  });

  // biome-ignore lint/complexity/noForEach: <explanation>
  [{ name: "WBTC" }, { name: "OSMO" }].forEach(({ name }) => {
    test(`User should be able to Market Buy ${name}`, async () => {
      await tradePage.goto();
      await tradePage.openBuyTab();
      await tradePage.selectAsset(name);
      await tradePage.enterAmount("0.52");
      const { msgContentAmount } = await tradePage.buyAndGetWalletMsg(context);
      expect(msgContentAmount).toBeTruthy();
      expect(msgContentAmount).toContain("type: osmosis/poolmanager/");
      await tradePage.isTransactionSuccesful(TRX_SUCCESS_TIMEOUT);
      await tradePage.getTransactionUrl();
    });
  });

  // unwrapped market sell tests just in case this affects anything.
  test.skip("User should be able to Market Sell WBTC", async () => {
    await tradePage.goto();
    await tradePage.openSellTab();
    await tradePage.selectAsset("WBTC");
    await tradePage.enterAmount("0.51");
    await tradePage.isSufficientBalanceForTrade();
    await tradePage.showSwapInfo();
    const { msgContentAmount } = await tradePage.sellAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("type: osmosis/poolmanager/");
    await tradePage.isTransactionSuccesful(TRX_SUCCESS_TIMEOUT);
    await tradePage.getTransactionUrl();
  });

  test("User should be able to Market Sell OSMO", async () => {
    await tradePage.goto();
    await tradePage.openSellTab();
    await tradePage.selectAsset("OSMO");
    await tradePage.enterAmount("0.51");
    await tradePage.isSufficientBalanceForTrade();
    await tradePage.showSwapInfo();
    const { msgContentAmount } = await tradePage.sellAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain("type: osmosis/poolmanager/");
    await tradePage.isTransactionSuccesful(TRX_SUCCESS_TIMEOUT);
    await tradePage.getTransactionUrl();
  });
});
