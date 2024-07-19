/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, chromium, Page, test } from "@playwright/test";
import { addCoverageReport, attachCoverageReport } from "monocart-reporter";

import { TestConfig } from "~/e2e/test-config";

import { SwapPage } from "../pages/swap-page";

// Pairs are selected from top 10
test.describe("Test Select Swap Pair feature", () => {
  let context: BrowserContext;
  let swapPage: SwapPage;
  let page: Page;

  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext("", {
      headless: true,
      viewport: { width: 1440, height: 1280 },
      proxy: new TestConfig().getProxyConfig(),
    });
    page = context.pages()[0];
    await page.coverage.startJSCoverage({
      resetOnNavigation: false,
    });
    swapPage = new SwapPage(page);
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
  test.skip("User should be able to select nBTC/USDC", async () => {
    await swapPage.selectPair("nBTC", "USDC");
    await swapPage.enterAmount("0.1");
    await swapPage.showSwapInfo();
  });

  test("User should be able to select WBTC/USDC", async () => {
    await swapPage.selectPair("WBTC", "USDC");
    await swapPage.enterAmount("0.1");
    await swapPage.showSwapInfo();
  });

  test("User should be able to select OSMO/USDC", async () => {
    await swapPage.selectPair("OSMO", "USDC");
    await swapPage.enterAmount("1");
    await swapPage.showSwapInfo();
  });

  test("User should be able to select INJ/USDC", async () => {
    await swapPage.selectPair("INJ", "USDC");
    await swapPage.enterAmount("10");
    await swapPage.showSwapInfo();
  });

  test("User should be able to select TIA/USDC", async () => {
    await swapPage.selectPair("TIA", "USDC");
    await swapPage.enterAmount("100");
    await swapPage.showSwapInfo();
  });

  test("User should be able to select ATOM/USDC", async () => {
    await swapPage.selectPair("ATOM", "USDC");
  });

  test("User should be able to select USDT/USDC", async () => {
    await swapPage.selectPair("USDT", "USDC");
  });

  test("User should be able to select TIA/OSMO", async () => {
    await swapPage.selectPair("TIA", "OSMO");
  });

  test("User should be able to select AKT/OSMO", async () => {
    await swapPage.selectPair("AKT", "OSMO");
  });

  test("User should be able to select PICA/OSMO", async () => {
    await swapPage.selectPair("PICA", "OSMO");
  });

  test("User should be able to select USDT/OSMO", async () => {
    await swapPage.selectPair("USDT", "OSMO");
  });

  test("User should be able to select TIA/BOOT", async () => {
    // Just to verify some odd pair
    await swapPage.selectPair("TIA", "BOOT");
  });

  test("User should be able to select stATOM/USDC", async () => {
    await swapPage.selectPair("stATOM", "USDC");
  });
});
