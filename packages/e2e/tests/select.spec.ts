/* eslint-disable import/no-extraneous-dependencies */
import {
  type BrowserContext,
  type Page,
  chromium,
  test,
} from "@playwright/test";

import { TradePage } from "../pages/trade-page";
import { TestConfig } from "../test-config";

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
    swapPage = new TradePage(page);
    await swapPage.goto();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test("User should be able to select BTC/USDC", async () => {
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
