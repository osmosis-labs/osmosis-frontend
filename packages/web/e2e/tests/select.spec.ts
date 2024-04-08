import { BrowserContext, chromium, expect, test } from "@playwright/test";

import { SwapPage } from "../pages/swap-page";

test.describe("Test Select feature", () => {
  let context: BrowserContext;
  let swapPage: SwapPage;

  test.beforeEach(async () => {
    context = await chromium.launchPersistentContext("", {
      headless: true,
    });
    swapPage = new SwapPage(await context.newPage());
    await swapPage.goto();
  });

  test.afterEach(async () => {
    await context.close();
  });

  test("User should be able to select OSMO/USDC", async () => {
    const from = "OSMO";
    const to = "USDC";
    await swapPage.selectPair(from, to);
  });

  test("User should be able to select INJ/USDC", async () => {
    const from = "INJ";
    const to = "USDC";
    await swapPage.selectPair(from, to);
    expect(await swapPage.getExchangeRate()).toContain(from);
    expect(await swapPage.getExchangeRate()).toContain(to);
  });

  test("User should be able to select TIA/USDC", async () => {
    const from = "TIA";
    const to = "USDC";
    await swapPage.selectPair(from, to);
    expect(await swapPage.getExchangeRate()).toContain(from);
    expect(await swapPage.getExchangeRate()).toContain(to);
  });

  test("User should be able to select ATOM/USDC", async () => {
    const from = "ATOM";
    const to = "USDC";
    await swapPage.selectPair(from, to);
    expect(await swapPage.getExchangeRate()).toContain(from);
    expect(await swapPage.getExchangeRate()).toContain(to);
  });

  test("User should be able to select USDC.axl/USDC", async () => {
    const from = "USDC.axl";
    const to = "USDC";
    await swapPage.selectPair(from, to);
    expect(await swapPage.getExchangeRate()).toContain(from);
    expect(await swapPage.getExchangeRate()).toContain(to);
  });

  test("User should be able to select TIA/OSMO", async () => {
    const from = "TIA";
    const to = "OSMO";
    await swapPage.selectPair(from, to);
    expect(await swapPage.getExchangeRate()).toContain(from);
    expect(await swapPage.getExchangeRate()).toContain(to);
  });

  test("User should be able to select AKT/OSMO", async () => {
    const from = "AKT";
    const to = "OSMO";
    await swapPage.selectPair(from, to);
    expect(await swapPage.getExchangeRate()).toContain(from);
    expect(await swapPage.getExchangeRate()).toContain(to);
  });

  test("User should be able to select PICA/OSMO", async () => {
    const from = "PICA";
    const to = "OSMO";
    await swapPage.selectPair(from, to);
    expect(await swapPage.getExchangeRate()).toContain(from);
    expect(await swapPage.getExchangeRate()).toContain(to);
  });

  test("User should be able to select WBTC/USDC", async () => {
    const from = "WBTC";
    const to = "USDC";
    await swapPage.selectPair(from, to);
    expect(await swapPage.getExchangeRate()).toContain(from);
    expect(await swapPage.getExchangeRate()).toContain(to);
  });

  test("User should be able to select USDC.axl/OSMO", async () => {
    const from = "USDC.axl";
    const to = "OSMO";
    await swapPage.selectPair(from, to);
    expect(await swapPage.getExchangeRate()).toContain(from);
    expect(await swapPage.getExchangeRate()).toContain(to);
  });

  test("User should be able to select TIA/BOOT", async () => {
    const from = "TIA";
    const to = "BOOT";
    await swapPage.selectPair(from, to);
    expect(await swapPage.getExchangeRate()).toContain(from);
    expect(await swapPage.getExchangeRate()).toContain(to);
  });

  test("User should be able to select stATOM/USDC", async () => {
    await swapPage.selectPair("stATOM", "USDC");
  });
});
