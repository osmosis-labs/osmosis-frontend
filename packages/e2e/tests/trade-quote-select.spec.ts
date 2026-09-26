import {
  type BrowserContext,
  chromium,
  expect,
  type Page,
  test,
} from "@playwright/test";

import { BasePage } from "../pages/base-page";
import { TestConfig } from "../test-config";

// HASH only has a USDC.noble-quoted orderbook, so its limit orders must switch
// away from the default Alloyed USDC quote. ATOM has an Alloyed USDC one.
const HASH_ASSET_PAGE =
  "/assets/ibc%2FCE5BFF1D9BADA03BB5CCA5F56939392A761B53A10FBD03B37506669C3218D3B2";
const ATOM_ASSET_PAGE =
  "/assets/ibc%2F27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";
const USDC_NOBLE =
  "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4";

/**
 * Fails when the page's main thread is stuck. Changing the trade tool's quote
 * used to send the asset page into an endless render loop, where every
 * later action just times out.
 */
async function expectResponsive(page: Page) {
  const responded = await Promise.race([
    page.evaluate(() => true),
    new Promise<false>((resolve) => setTimeout(() => resolve(false), 10_000)),
  ]);
  expect(responded, "Page stopped responding.").toBe(true);
}

// No wallet and a fresh browser per test, so there is no stored previous
// trade to pre-select a quote.
test.describe("Test trade tool quote selection on asset pages", () => {
  let context: BrowserContext;
  let page: Page;

  const visibleButton = (name: string) =>
    page.getByRole("button", { name, exact: true }).filter({ visible: true });
  const quoteMenuButton = () =>
    page.locator("button", { hasText: "Pay with" }).filter({ visible: true });

  async function openAssetPage(path: string) {
    await page.goto(path, { timeout: 30_000 });
    await expect(visibleButton("Buy")).toBeVisible({ timeout: 30_000 });
    await new BasePage(page).dismissVariantsPopupIfPresent();
  }

  async function selectLimit() {
    await visibleButton("Buy").click({ timeout: 10_000 });
    // Limit stays hidden until the orderbooks have loaded.
    await expect(visibleButton("Limit")).toBeEnabled({ timeout: 30_000 });
    await visibleButton("Limit").click({ timeout: 10_000 });
    await expectResponsive(page);
  }

  test.beforeEach(async () => {
    context = await chromium.launchPersistentContext(
      "",
      new TestConfig().getBrowserConfig(true)
    );
    page = context.pages()[0];
  });

  test.afterEach(async () => {
    await context.close();
  });

  test("Limit on HASH switches to its USDC.noble orderbook", async () => {
    await openAssetPage(HASH_ASSET_PAGE);
    await selectLimit();

    await expect(page).toHaveURL(new RegExp(`quote=${USDC_NOBLE}`));
    await expect(quoteMenuButton()).toContainText("USDC.noble");
  });

  test("HASH limit orders can't pick a quote without an orderbook", async () => {
    await openAssetPage(HASH_ASSET_PAGE);
    await selectLimit();

    await quoteMenuButton().click({ timeout: 10_000 });
    const quotes = page
      .getByRole("menu")
      .getByRole("menuitem")
      .filter({ hasNotText: "another asset" });
    await expect(quotes.first()).toBeVisible();
    for (const quote of await quotes.all()) {
      await expect(quote).toBeDisabled();
    }
    await expectResponsive(page);
  });

  test("ATOM asset page opens Buy without a stored previous trade", async () => {
    await openAssetPage(ATOM_ASSET_PAGE);
    await visibleButton("Buy").click({ timeout: 10_000 });
    await expectResponsive(page);

    await expect(quoteMenuButton()).toBeVisible();
  });
});
