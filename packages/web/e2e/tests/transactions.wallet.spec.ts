/* eslint-disable import/no-extraneous-dependencies */
import {
  type BrowserContext,
  chromium,
  expect,
  type Page,
  test,
} from "@playwright/test";
import process from "process";

import { SwapPage } from "~/e2e/pages/swap-page";
import { TransactionsPage } from "~/e2e/pages/transactions-page";
import { TestConfig } from "~/e2e/test-config";
import { UnzipExtension } from "~/e2e/unzip-extension";

import { PortfolioPage } from "../pages/portfolio-page";
import { WalletPage } from "../pages/wallet-page";

test.describe("Test Transactions feature", () => {
  let context: BrowserContext;
  let page: Page;
  const walletId = process.env.WALLET_ID ?? "osmo";
  const privateKey = process.env.PRIVATE_KEY ?? "pk";
  let portfolioPage: PortfolioPage;
  let transactionsPage: TransactionsPage;
  let swapPage: SwapPage;

  test.beforeAll(async () => {
    const pathToExtension = new UnzipExtension().getPathToExtension();
    console.log("\nSetup Wallet Extension before tests.");
    // Launch Chrome with a Keplr wallet extension
    context = await chromium.launchPersistentContext(
      "",
      new TestConfig().getBrowserExtensionConfig(true, pathToExtension)
    );
    // Get all new pages (including Extension) in the context and wait
    const emptyPage = context.pages()[0];
    await emptyPage.waitForTimeout(2000);
    page = context.pages()[1];
    const walletPage = new WalletPage(page);
    // Import existing Wallet (could be aggregated in one function).
    await walletPage.importWalletWithPrivateKey(privateKey);
    await walletPage.setWalletNameAndPassword("Test Transactions");
    await walletPage.selectChainsAndSave();
    await walletPage.finish();
    // Switch to Application
    page = context.pages()[0];
    portfolioPage = new PortfolioPage(page);
    await portfolioPage.goto();
    await portfolioPage.connectWallet();
    transactionsPage = await new TransactionsPage(page).open();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("User should be able to see old transactions", async () => {
    await transactionsPage.viewTransactionByNumber(10);
    await transactionsPage.viewOnExplorerIsVisible();
    await transactionsPage.closeTransaction();
    await transactionsPage.viewTransactionByNumber(20);
    await transactionsPage.viewOnExplorerIsVisible();
    await transactionsPage.closeTransaction();
    await transactionsPage.viewTransactionByNumber(35);
    await transactionsPage.viewOnExplorerIsVisible();
    await transactionsPage.closeTransaction();
  });

  test.skip("User should be able to see a new transaction", async () => {
    swapPage = new SwapPage(context.pages()[0]);
    await swapPage.goto();
    await swapPage.selectPair("USDC", "USDT");
    const rndInt = Math.floor(Math.random() * 99) + 1;
    const swapAmount = `0.1${rndInt}`;
    await swapPage.enterAmount(swapAmount);
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context);
    expect(msgContentAmount).toBeTruthy();
    expect(msgContentAmount).toContain(`sender: ${walletId}`);
    expect(msgContentAmount).toContain(
      "denom: ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4"
    );
    expect(swapPage.isTransactionBroadcasted(10));
    expect(swapPage.isTransactionSuccesful(10));
    const swapTrxUrl = await swapPage.getTransactionUrl();
    await swapPage.gotoPortfolio();
    await portfolioPage.viewTransactionsPage();
    await transactionsPage.viewBySwapAmount(swapAmount);
    await transactionsPage.viewOnExplorerIsVisible();
    const trxUrl = await transactionsPage.getOnExplorerLink();
    expect(trxUrl).toContain(swapTrxUrl);
    await transactionsPage.closeTransaction();
  });
});
