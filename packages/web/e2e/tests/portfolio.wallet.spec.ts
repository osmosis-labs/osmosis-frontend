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
  const password = process.env.PASSWORD ?? "TestPassword2024.";
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
    await walletPage.setWalletNameAndPassword("Test Portfolio", password);
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

  test("User should be able to see native balances", async () => {
    await portfolioPage.searchForToken("OSMO");
    const osmoBalance = await portfolioPage.getBalanceFor("OSMO");
    expect(osmoBalance).toMatch(dollarBalanceRegEx);
    await portfolioPage.searchForToken("ATOM");
    const atomBalance = await portfolioPage.getBalanceFor("ATOM");
    expect(atomBalance).toMatch(dollarBalanceRegEx);
    await portfolioPage.searchForToken("USDT");
    const usdtBalance = await portfolioPage.getBalanceFor("USDT");
    expect(usdtBalance).toMatch(dollarBalanceRegEx);
    await portfolioPage.searchForToken("USDC");
    const usdcBalance = await portfolioPage.getBalanceFor("USDC");
    expect(usdcBalance).toMatch(dollarBalanceRegEx);
    await portfolioPage.searchForToken("TIA");
    const tiaBalance = await portfolioPage.getBalanceFor("TIA");
    expect(tiaBalance).toMatch(dollarBalanceRegEx);
    await portfolioPage.searchForToken("DAI");
    const daiBalance = await portfolioPage.getBalanceFor("DAI");
    expect(daiBalance).toMatch(dollarBalanceRegEx);
  });

  test("User should be able to see bridged balances", async () => {
    await portfolioPage.searchForToken("INJ");
    const injBalance = await portfolioPage.getBalanceFor("INJ");
    expect(injBalance).toMatch(dollarBalanceRegEx);
    await portfolioPage.searchForToken("ETH.axl");
    const ethBalance = await portfolioPage.getBalanceFor("ETH.axl");
    expect(ethBalance).toMatch(dollarBalanceRegEx);
    await portfolioPage.searchForToken("KUJI");
    const kujiBalance = await portfolioPage.getBalanceFor("KUJI");
    expect(kujiBalance).toMatch(dollarBalanceRegEx);
    await portfolioPage.searchForToken("SOL");
    const solBalance = await portfolioPage.getBalanceFor("SOL");
    expect(solBalance).toMatch(dollarBalanceRegEx);
    await portfolioPage.searchForToken("milkTIA");
    const milkTIABalance = await portfolioPage.getBalanceFor("milkTIA");
    expect(milkTIABalance).toMatch(dollarBalanceRegEx);
    await portfolioPage.searchForToken("BTC");
    const abtcBalance = await portfolioPage.getBalanceFor("BTC");
    expect(abtcBalance).toMatch(dollarBalanceRegEx);
    await portfolioPage.searchForToken("WBTC");
    const wbtcBalance = await portfolioPage.getBalanceFor("WBTC");
    expect(wbtcBalance).toMatch(dollarBalanceRegEx);
  });
});
