/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, chromium, expect, test } from "@playwright/test";
import path from "path";
import process from "process";

import { PortfolioPage } from "../pages/portfolio-page";
import { WalletPage } from "../pages/wallet-page";

test.describe("Test Portfolio feature", () => {
  let context: BrowserContext;
  const privateKey = process.env.PRIVATE_KEY ?? "private_key";
  const password = process.env.PASSWORD ?? "TestPassword2024.";
  let portfolioPage: PortfolioPage;

  test.beforeAll(async () => {
    console.log("\nBefore test setup Wallet Extension.");
    // Launch Chrome with a Keplr wallet extension
    const pathToExtension = path.join(__dirname, "../keplr-extension");
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
    await walletPage.setWalletNameAndPassword("Test Portfolio", password);
    await walletPage.selectChainsAndSave();
    await walletPage.finish();
    // Switch to Application
    portfolioPage = new PortfolioPage(context.pages()[0]);
    await portfolioPage.goto();
    await portfolioPage.connectWallet();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("User should be able to see balances", async () => {
    await portfolioPage.hideZeroBalances();
    const osmoBalance = await portfolioPage.getBalanceFor("OSMO");
    expect(osmoBalance).toBeTruthy();
    expect(osmoBalance).toContain("$");
    const usdtBalance = await portfolioPage.getBalanceFor("USDT");
    expect(usdtBalance).toBeTruthy();
    expect(usdtBalance).toContain("$");
  });
});
