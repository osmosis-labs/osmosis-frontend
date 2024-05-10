/* eslint-disable import/no-extraneous-dependencies */
import { test } from "playwright-test-coverage";

import { SwapPage } from "../pages/swap-page";

test.describe("Test Coverage", () => {
  let swapPage: SwapPage;

  test("User should be able to Test Coverage", async ({ page }) => {
    swapPage = new SwapPage(page);
    await swapPage.goto();
    await swapPage.selectPair("USDC", "USDC.axl");
    await swapPage.flipTokenPair();
  });
});
