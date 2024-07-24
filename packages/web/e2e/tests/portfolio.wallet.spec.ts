/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, chromium, expect, Page, test } from "@playwright/test";
import { addCoverageReport, attachCoverageReport } from "monocart-reporter";
import process from "process";

import { UnzipExtension } from "~/e2e/unzip-extension";

import { PortfolioPage } from "../pages/portfolio-page";
import { WalletPage } from "../pages/wallet-page";

test.describe("Test Portfolio feature", () => {
  let context: BrowserContext;
  const privateKey = process.env.PRIVATE_KEY ?? "pk";
  const password = process.env.PASSWORD ?? "TestPassword2024.";
  let portfolioPage: PortfolioPage;
  let dollarBalanceRegEx = /\$\d+/;
  let digitBalanceRegEx = /\d+\.\d+/;
  let page: Page;

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
      viewport: { width: 1440, height: 1280 },
      slowMo: 300,
    });
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
    const osmoBalance = await portfolioPage.getBalanceFor("OSMO");
    expect(osmoBalance).toMatch(dollarBalanceRegEx);
    const atomBalance = await portfolioPage.getBalanceFor("ATOM");
    expect(atomBalance).toMatch(dollarBalanceRegEx);
    const usdtBalance = await portfolioPage.getBalanceFor("USDT");
    expect(usdtBalance).toMatch(dollarBalanceRegEx);
    const usdcBalance = await portfolioPage.getBalanceFor("USDC");
    expect(usdcBalance).toMatch(dollarBalanceRegEx);
    const tiaBalance = await portfolioPage.getBalanceFor("TIA");
    expect(tiaBalance).toMatch(dollarBalanceRegEx);
    const daiBalance = await portfolioPage.getBalanceFor("DAI");
    expect(daiBalance).toMatch(dollarBalanceRegEx);
  });

  test("User should be able to see bridged balances", async () => {
    const injBalance = await portfolioPage.getBalanceFor("INJ");
    expect(injBalance).toMatch(dollarBalanceRegEx);
    const ethBalance = await portfolioPage.getBalanceFor("ETH");
    expect(ethBalance).toMatch(dollarBalanceRegEx);
    const kujiBalance = await portfolioPage.getBalanceFor("KUJI");
    expect(kujiBalance).toMatch(dollarBalanceRegEx);
    const solBalance = await portfolioPage.getBalanceFor("SOL");
    expect(solBalance).toMatch(dollarBalanceRegEx);
    const milkTIABalance = await portfolioPage.getBalanceFor("milkTIA");
    expect(milkTIABalance).toMatch(dollarBalanceRegEx);
    const abtcBalance = await portfolioPage.getBalanceFor("allBTC");
    // allBTC has not $ price atm
    expect(abtcBalance).toMatch(digitBalanceRegEx);
  });
});
