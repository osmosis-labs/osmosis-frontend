/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, chromium, expect, test } from "@playwright/test";
import path from "path";
import process from "process";

import { PortfolioPage } from "../pages/portfolio-page";
import { WalletPage } from "../pages/wallet-page";

test.describe("Test Portfolio feature", () => {
  let context: BrowserContext;
  const privateKey =
    process.env.PRIVATE_KEY ??
    "0x9866a7f11faf50d5ccc36b0ce57e6fa72c5032367c44279b9ca829713c78bab8";
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
    await portfolioPage.hideZeroBalances();
    await portfolioPage.viewMoreBalances();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("User should be able to see native balances", async () => {
    const osmoBalance = await portfolioPage.getBalanceFor("OSMO");
    expect(osmoBalance).toMatch(/\$\d+\.\d+/);
    const atomBalance = await portfolioPage.getBalanceFor("ATOM");
    expect(atomBalance).toMatch(/\$\d+\.\d+/);
    const usdtBalance = await portfolioPage.getBalanceFor("USDT");
    expect(usdtBalance).toMatch(/\$\d+\.\d+/);
    const usdcBalance = await portfolioPage.getBalanceFor("USDC");
    expect(usdcBalance).toMatch(/\$\d+\.\d+/);
    const tiaBalance = await portfolioPage.getBalanceFor("TIA");
    expect(tiaBalance).toMatch(/\$\d+\.\d+/);
    const daiBalance = await portfolioPage.getBalanceFor("DAI");
    expect(daiBalance).toMatch(/\$\d+\.\d/);
  });

  test("User should be able to see bridged balances", async () => {
    const injBalance = await portfolioPage.getBalanceFor("INJ");
    expect(injBalance).toMatch(/\$\d+\.\d+/);
    const ethBalance = await portfolioPage.getBalanceFor("ETH");
    expect(ethBalance).toMatch(/\$\d+\.\d+/);
    const kujiBalance = await portfolioPage.getBalanceFor("KUJI");
    expect(kujiBalance).toMatch(/\$\d+\.\d/);
    const abtcBalance = await portfolioPage.getBalanceFor("allBTC");
    expect(abtcBalance).toMatch(/\d+\.\d+/);
  });
});
