/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, chromium, expect, Page, test } from "@playwright/test";
import { addCoverageReport, attachCoverageReport } from "monocart-reporter";

import { TestConfig } from "~/e2e/test-config";

import { PoolsPage } from "../pages/pools-page";

test.describe("Test Select Pool feature", () => {
  let context: BrowserContext;
  let poolsPage: PoolsPage;
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
    poolsPage = new PoolsPage(page);
  });

  test.afterAll(async () => {
    const coverage = await page.coverage.stopJSCoverage();
    // coverage report
    const report = await attachCoverageReport(coverage, test.info());
    console.log(report.summary);

    await addCoverageReport(coverage, test.info());
    await context.close();
  });

  test("User should be able to select ATOM/USDC pool", async () => {
    const poolName = "ATOM/USDC";
    await poolsPage.goto();
    await poolsPage.searchForPool(poolName);
    const poolPage = await poolsPage.viewPool(1282, poolName);
    const balance = await poolPage.getBalance();
    expect(balance).toEqual("$0");
    const tradeModal = await poolPage.getTradeModal();
    //const pair = await tradeModal.getSelectedPair();
    //expect(pair).toEqual("ATOM/USDC");
    //await tradeModal.enterAmount("1");
    //await tradeModal.showSwapInfo();
  });

  test("User should be able to select OSMO/USDC pool", async () => {
    const poolName = "OSMO/USDC";
    await poolsPage.goto();
    await poolsPage.searchForPool(poolName);
    const poolPage = await poolsPage.viewPool(1464, poolName);
    const balance = await poolPage.getBalance();
    expect(balance).toEqual("$0");
    const tradeModal = await poolPage.getTradeModal();
    //const pair = await tradeModal.getSelectedPair();
    //expect(pair).toEqual("OSMO/USDC");
    //await tradeModal.enterAmount("1");
    //await tradeModal.showSwapInfo();
  });
});
