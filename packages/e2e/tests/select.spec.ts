/* eslint-disable import-compat/no-extraneous-dependencies */
import {
  type BrowserContext,
  type Page,
  chromium,
  test,
} from "@playwright/test";

import { TradePage } from "../pages/trade-page";
import { TestConfig } from "../test-config";

// Pairs are selected from top 10. PR runs check three; the rest run in the full suite
// (@full), since each one exercises the same selector and quote path.
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

  test.beforeEach(async () => {
    await swapPage.goto();
  });

  test("User should be able to select BTC/USDC", async () => {
    await swapPage.selectPair("BTC", "USDC");
    await swapPage.enterAmount("0.01");
    await swapPage.showSwapInfo();
  });

  test("User should be able to select OSMO/USDC", async () => {
    await swapPage.selectPair("OSMO", "USDC");
    await swapPage.enterAmount("1");
    await swapPage.showSwapInfo();
  });

  test("User should be able to select INJ/USDC @full", async () => {
    await swapPage.selectPair("INJ", "USDC");
    await swapPage.enterAmount("10");
    await swapPage.showSwapInfo();
  });

  test("User should be able to select TIA/USDC @full", async () => {
    await swapPage.selectPair("TIA", "USDC");
    await swapPage.enterAmount("100");
    await swapPage.showSwapInfo();
  });

  test("User should be able to select ATOM/USDC", async () => {
    await swapPage.selectPair("ATOM", "USDC");
    await swapPage.enterAmount("100");
  });

  test("User should be able to select USDT/USDC @full", async () => {
    await swapPage.selectPair("USDT", "USDC");
    await swapPage.enterAmount("10000");
  });

  test("User should be able to select TIA/OSMO @full", async () => {
    await swapPage.selectPair("TIA", "OSMO");
    await swapPage.enterAmount("100");
  });

  test("User should be able to select AKT/OSMO @full", async () => {
    await swapPage.selectPair("AKT", "OSMO");
    await swapPage.enterAmount("100");
  });

  test("User should be able to select PICA/OSMO @full", async () => {
    await swapPage.selectPair("PICA", "OSMO");
    await swapPage.enterAmount("100");
  });

  test("User should be able to select USDT/OSMO @full", async () => {
    await swapPage.selectPair("USDT", "OSMO");
    await swapPage.enterAmount("100");
  });

  test("User should be able to select TIA/BOOT @full", async () => {
    // Just to verify some odd pair
    await swapPage.selectPair("TIA", "BOOT");
    await swapPage.enterAmount("100");
  });

  test("User should be able to select stATOM/USDC @full", async () => {
    await swapPage.selectPair("stATOM", "USDC");
    await swapPage.enterAmount("100");
  });
});
