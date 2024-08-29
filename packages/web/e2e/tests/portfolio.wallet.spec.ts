/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, chromium, expect, Page, test } from "@playwright/test";
import { addCoverageReport, attachCoverageReport } from "monocart-reporter";
import process from "process";

import { TestConfig } from "~/e2e/test-config";
import { UnzipExtension } from "~/e2e/unzip-extension";

import { PortfolioPage } from "../pages/portfolio-page";
import { WalletPage } from "../pages/wallet-page";

test.describe("Test Portfolio feature", () => {
  let context: BrowserContext;
  const privateKey = process.env.PRIVATE_KEY ?? "pk";
  let portfolioPage: PortfolioPage;
  let dollarBalanceRegEx = /\$\d+/;
  let page: Page;

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
    await walletPage.setWalletNameAndPassword("Test Portfolio");
    await walletPage.selectChainsAndSave();
    await walletPage.finish();
    // Switch to Application
    page = context.pages()[0];
    await page.coverage.startJSCoverage({
      resetOnNavigation: false,
    });
    portfolioPage = new PortfolioPage(page);
    await portfolioPage.goto();
    await portfolioPage.connectWallet();
    await portfolioPage.hideZeroBalances();
    await portfolioPage.viewMoreBalances();
  });

  test.afterAll(async () => {
    const coverage = await page.coverage.stopJSCoverage();
    // coverage report
    const report = await attachCoverageReport(coverage, test.info());
    console.log(report.summary);

    await addCoverageReport(coverage, test.info());
    await context.close();
  });

  [
    { name: "OSMO" },
    { name: "ATOM" },
    { name: "USDT" },
    { name: "USDC" },
    { name: "TIA" },
    { name: "DAI" },
  ].forEach(({ name }) => {
    test(`User should be able to see native balances for ${name}`, async () => {
      await portfolioPage.searchForToken(name);
      const osmoBalance = await portfolioPage.getBalanceFor(name);
      expect(osmoBalance).toMatch(dollarBalanceRegEx);
    });
  });

  [
    { name: "INJ" },
    { name: "ETH.axl" },
    { name: "KUJI" },
    { name: "SOL" },
    { name: "milkTIA" },
    { name: "BTC" },
    { name: "WBTC" },
  ].forEach(({ name }) => {
    test(`User should be able to see bridged balances for ${name}`, async () => {
      await portfolioPage.searchForToken(name);
      const osmoBalance = await portfolioPage.getBalanceFor(name);
      expect(osmoBalance).toMatch(dollarBalanceRegEx);
    });
  });
});
