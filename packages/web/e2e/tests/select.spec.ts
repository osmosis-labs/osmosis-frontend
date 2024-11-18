/* eslint-disable import/no-extraneous-dependencies */
import {
  type BrowserContext,
  chromium,
  type Page,
  test,
} from "@playwright/test";
import { addCoverageReport, attachCoverageReport } from "monocart-reporter";

import { TradePage } from "~/e2e/pages/trade-page";
import { TestConfig } from "~/e2e/test-config";

// Pairs are selected from top 10
test.describe("Test Select Swap Pair feature", () => {
  let context: BrowserContext;
  let swapPage: TradePage;
  let page: Page;

  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext(
      "",
      new TestConfig().getBrowserConfig(true)
    );
    page = context.pages()[0];
    await page.coverage.startJSCoverage({
      resetOnNavigation: false,
    });
    swapPage = new TradePage(page);
    await swapPage.goto();
  });

  test.afterAll(async () => {
    const coverage = await page.coverage.stopJSCoverage();
    // coverage report
    const report = await attachCoverageReport(coverage, test.info());
    console.log(report.summary);

    await addCoverageReport(coverage, test.info());
    await context.close();
  });

  // Price Impact-54.768% -> no liquidity
  test("User should be able to select nBTC/USDC", async () => {
    await swapPage.goto();
    await swapPage.selectPair("nBTC", "USDC");
    await swapPage.enterAmount("0.01");
    await swapPage.showSwapInfo();
  });

  test("User should be able to select WBTC/USDC", async () => {
    await swapPage.goto();
    await swapPage.selectPair("WBTC", "USDC");
    await swapPage.enterAmount("0.1");
    await swapPage.showSwapInfo();
  });

  test("User should be able to select OSMO/USDC", async () => {
    await swapPage.goto();
    await swapPage.selectPair("OSMO", "USDC");
    await swapPage.enterAmount("1");
    await swapPage.showSwapInfo();
  });

  test("User should be able to select INJ/USDC", async () => {
    await swapPage.goto();
    await swapPage.selectPair("INJ", "USDC");
    await swapPage.enterAmount("10");
    await swapPage.showSwapInfo();
  });

  test("User should be able to select TIA/USDC", async () => {
    await swapPage.goto();
    await swapPage.selectPair("TIA", "USDC");
    await swapPage.enterAmount("100");
    await swapPage.showSwapInfo();
  });

  test("User should be able to select ATOM/USDC", async () => {
    await swapPage.selectPair("ATOM", "USDC");
    await swapPage.enterAmount("100");
  });

  test("User should be able to select USDT/USDC", async () => {
    await swapPage.selectPair("USDT", "USDC");
    await swapPage.enterAmount("10000");
  });

  test("User should be able to select TIA/OSMO", async () => {
    await swapPage.selectPair("TIA", "OSMO");
    await swapPage.enterAmount("100");
  });

  test("User should be able to select AKT/OSMO", async () => {
    await swapPage.selectPair("AKT", "OSMO");
    await swapPage.enterAmount("100");
  });

  test("User should be able to select PICA/OSMO", async () => {
    await swapPage.selectPair("PICA", "OSMO");
    await swapPage.enterAmount("100");
  });

  test("User should be able to select USDT/OSMO", async () => {
    await swapPage.selectPair("USDT", "OSMO");
    await swapPage.enterAmount("100");
  });

  test("User should be able to select TIA/BOOT", async () => {
    // Just to verify some odd pair
    await swapPage.selectPair("TIA", "BOOT");
    await swapPage.enterAmount("100");
  });

  test("User should be able to select stATOM/USDC", async () => {
    await swapPage.selectPair("stATOM", "USDC");
    await swapPage.enterAmount("100");
  });
});
