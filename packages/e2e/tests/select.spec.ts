import {
  type BrowserContext,
  chromium,
  type Page,
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

  test("User should be able to select USDT/USDC", async () => {
    await swapPage.selectPair("USDT", "USDC");
    await swapPage.enterAmount("10000");
  });

  test("User should be able to select TIA/BOOT", async () => {
    // Just to verify some odd pair
    await swapPage.selectPair("TIA", "BOOT");
    await swapPage.enterAmount("100");
  });
});
