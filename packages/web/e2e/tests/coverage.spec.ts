/* eslint-disable import/no-extraneous-dependencies */
import { Locator } from "@playwright/test";
import { expect, test } from "playwright-test-coverage";

import { SwapPage } from "../pages/swap-page";

test.describe("Test Coverage", () => {
  let swapPage: SwapPage;

  test("User should be able to Test Coverage", async ({ page }) => {
    const exchangeRate: Locator = page.locator(
      '//span[contains(@class, "subtitle2")]'
    );
    swapPage = new SwapPage(page);
    await swapPage.goto();
    await swapPage.selectPair("USDC", "USDC.axl");
    await swapPage.flipTokenPair();
    expect(await exchangeRate.innerText()).toContain("USDC");
    const assetsTab = page.getByText("Assets");
    await assetsTab.click();
    await page.waitForURL("**/assets", { timeout: 15000 });
    expect(page.url()).toContain("/assets");
    await page.getByText("Portfolio").click();
    await page.waitForURL("**/portfolio", { timeout: 15000 });
    expect(page.url()).toContain("/portfolio");
    await page.getByText("Deposit").click();
    expect(
      await page.getByRole("dialog").locator("//h5").textContent()
    ).toContainEqual("Deposit");
  });
});
