/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, chromium, test } from "@playwright/test";
import process from "process";

import { TransactionsPage } from "~/e2e/pages/transactions-page";
import { UnzipExtension } from "~/e2e/unzip-extension";

import { PortfolioPage } from "../pages/portfolio-page";
import { WalletPage } from "../pages/wallet-page";

test.describe("Test Transactions feature", () => {
  let context: BrowserContext;
  const privateKey = process.env.PRIVATE_KEY ?? "private_key";
  const password = process.env.PASSWORD ?? "TestPassword2024.";
  let portfolioPage: PortfolioPage;
  let transactionsPage: TransactionsPage;

  test.beforeAll(async () => {
    const pathToExtension = new UnzipExtension().getPathToExtension();
    console.log("\nSetup Wallet Extension before tests.");
    // Launch Chrome with a Keplr wallet extension
    context = await chromium.launchPersistentContext("", {
      headless: false,
      args: [
        "--headless=new",
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
      viewport: { width: 1280, height: 1024 },
      slowMo: 300,
    });
    // Get all new pages (including Extension) in the context and wait
    const emptyPage = context.pages()[0];
    await emptyPage.waitForTimeout(2000);
    const page = context.pages()[1];
    const walletPage = new WalletPage(page);
    // Import existing Wallet (could be aggregated in one function).
    await walletPage.importWalletWithPrivateKey(privateKey);
    await walletPage.setWalletNameAndPassword("Test Transactions", password);
    await walletPage.selectChainsAndSave();
    await walletPage.finish();
    // Switch to Application
    portfolioPage = new PortfolioPage(context.pages()[0]);
    await portfolioPage.goto();
    await portfolioPage.connectWallet();
    transactionsPage = await portfolioPage.viewTransactionsPage();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("User should be able to see a transaction", async () => {
    await transactionsPage.viewTransactionByNumber(10);
    await transactionsPage.viewOnExplorerIsVisible();
    await transactionsPage.closeTransaction();
    await transactionsPage.viewTransactionByNumber(20);
    await transactionsPage.viewOnExplorerIsVisible();
    await transactionsPage.closeTransaction();
    await transactionsPage.viewTransactionByNumber(55);
    await transactionsPage.viewOnExplorerIsVisible();
    await transactionsPage.closeTransaction();
  });
});
