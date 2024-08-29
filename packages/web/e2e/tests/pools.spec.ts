/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, chromium, expect, Page, test } from "@playwright/test";

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
    poolsPage = new PoolsPage(page);
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("User should be able to see at least 10 pools", async () => {
    await poolsPage.goto();
    expect(await poolsPage.getPoolsNumber()).toBeGreaterThan(10);
    const topLiquidity = await poolsPage.getTopTenPoolsByLiquidity();
    topLiquidity.every(function (element) {
      expect(element).toBeGreaterThan(10_000);
    });
    const topVolume = await poolsPage.getTopTenPoolsByVolume();
    topVolume.every(function (element) {
      expect(element).toBeGreaterThan(10_000);
    });
  });

  test("User should be able to select ATOM/USDC pool", async () => {
    const poolName = "ATOM/USDC";
    await poolsPage.goto();
    await poolsPage.searchForPool(poolName);
    const poolPage = await poolsPage.viewPool(1282, poolName);
    const balance = await poolPage.getBalance();
    expect(balance).toEqual("$0");
    const tradeModal = await poolPage.getTradeModal();
    await tradeModal.enterAmount("1");
    const rate = await tradeModal.getExchangeRate();
    await tradeModal.showSwapInfo();
    expect(rate).toContain("ATOM");
    expect(rate).toContain("USDC");
  });

  test("User should be able to select OSMO/USDC pool", async () => {
    const poolName = "OSMO/USDC";
    await poolsPage.goto();
    await poolsPage.searchForPool(poolName);
    const poolPage = await poolsPage.viewPool(1464, poolName);
    const balance = await poolPage.getBalance();
    expect(balance).toEqual("$0");
    const tradeModal = await poolPage.getTradeModal();
    await tradeModal.enterAmount("1");
    const rate = await tradeModal.getExchangeRate();
    await tradeModal.showSwapInfo();
    expect(rate).toContain("OSMO");
    expect(rate).toContain("USDC");
  });
});
