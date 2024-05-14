/* eslint-disable import/no-extraneous-dependencies */
import { Locator } from "@playwright/test";
import { addCoverageReport, attachCoverageReport } from "monocart-reporter";
import { expect, test } from "playwright-test-coverage";

import { SwapPage } from "../pages/swap-page";
test.describe("Test Coverage", () => {
  let swapPage: SwapPage;

  test("User should be able to Test Coverage", async ({ page }) => {
    const exchangeRate: Locator = page.locator(
      '//span[contains(@class, "subtitle2")]'
    );
    await page.coverage.startJSCoverage({
      resetOnNavigation: false,
    });
    swapPage = new SwapPage(page);
    await swapPage.goto();
    await swapPage.selectPair("USDC", "USDC.axl");
    await swapPage.flipTokenPair();
    expect(await exchangeRate.innerText()).toContain("USDC");
    const assetsTab = page.getByText("Assets");
    await assetsTab.click();
    await page.waitForURL("**/assets", { timeout: 15000 });
    expect(page.url()).toContain("/assets");
    await page.getByText("Stake").click();
    await page.waitForURL("**/stake", { timeout: 15000 });
    expect(page.url()).toContain("/stake");
    await page.getByText("Pools").click();
    await page.waitForURL("**/pools", { timeout: 15000 });
    expect(page.url()).toContain("/pools");
    await page.getByText("Liquidity", { exact: true }).click();
    const coverage = await page.coverage.stopJSCoverage();
    // coverage report
    const report = await attachCoverageReport(coverage, test.info());
    console.log(report.summary);

    await addCoverageReport(coverage, test.info());
  });
});
