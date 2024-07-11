/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, chromium, expect, test } from "@playwright/test";

import { PoolsPage } from "../pages/pools-page";

test.describe("Test Select Pool feature", () => {
  let context: BrowserContext;
  let poolsPage: PoolsPage;

  test.beforeAll(async () => {
    context = await chromium.launchPersistentContext("", {
      headless: true,
      viewport: { width: 1280, height: 1024 },
    });
    poolsPage = new PoolsPage(context.pages()[0]);
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("User should be able to select ATOM/USDC", async () => {
    await poolsPage.goto();
    const poolPage = await poolsPage.viewPool(1282, "ATOM/USDC");
    const balance = await poolPage.getBalance();
    expect(balance).toEqual("$0");
    const tradeModal = await poolPage.getTradeModal();
    const pair = await tradeModal.getSelectedPair();
    expect(pair).toEqual("ATOM/USDC");
    await tradeModal.enterAmount("1");
    await tradeModal.showSwapInfo();
  });

  test("User should be able to select OSMO/USDC Pool", async () => {
    await poolsPage.goto();
    const poolPage = await poolsPage.viewPool(1464, "OSMO/USDC");
    const balance = await poolPage.getBalance();
    expect(balance).toEqual("$0");
    const tradeModal = await poolPage.getTradeModal();
    const pair = await tradeModal.getSelectedPair();
    expect(pair).toEqual("OSMO/USDC");
    await tradeModal.enterAmount("1");
    await tradeModal.showSwapInfo();
  });
});
