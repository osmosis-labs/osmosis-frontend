import {
  type BrowserContext,
  chromium,
  expect,
  type Page,
  test,
} from "@playwright/test";

import { BasePage } from "../pages/base-page";
import { TestConfig } from "../test-config";
import { findAssetWithOnlyOrderbookQuote } from "../utils/orderbook";

// Assets whose limit orders must switch away from the default Alloyed USDC
// quote because their only orderbook is USDC.noble-quoted. Anyone can create
// an orderbook, so the tests use the first candidate that still qualifies.
// ATOM has an Alloyed USDC one.
const USDC_NOBLE_ONLY_CANDIDATES = [
  "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED", // JUNO
  "ibc/903A61A498756EA560B85A85132D3AEE21B5DEDD41213725D22ABF276EA6945E", // AXL
  "ibc/126DA09104B71B164883842B769C0E9EC1486C0887D27A9999E395C2C8FB5682", // NTRN
  "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A", // SCRT
  "ibc/57AA1A70A4BC9769C525EBF6386F7A21536E04A79D62E1981EFCEF9428EBB205", // KAVA
  "ibc/BB6BCDB515050BAE97516111873CCD7BCF1FD0CCB723CC12F3C4F704D6C646CE", // KUJI
];
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

  /** Opens the page of an asset whose only orderbook is USDC.noble-quoted. */
  async function openUsdcNobleOnlyAssetPage() {
    const denom = await findAssetWithOnlyOrderbookQuote(
      USDC_NOBLE_ONLY_CANDIDATES,
      USDC_NOBLE
    );
    test.skip(
      !denom,
      "Every candidate asset now has an orderbook with another quote."
    );
    await openAssetPage(`/assets/${encodeURIComponent(denom!)}`);
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

  test("Limit switches to the asset's only orderbook, USDC.noble", async () => {
    await openUsdcNobleOnlyAssetPage();
    await selectLimit();

    await expect(page).toHaveURL(new RegExp(`quote=${USDC_NOBLE}`));
    await expect(quoteMenuButton()).toContainText("USDC.noble");
  });

  test("Limit offers to create an orderbook for quotes without one", async () => {
    await openUsdcNobleOnlyAssetPage();
    await selectLimit();

    await quoteMenuButton().click({ timeout: 10_000 });
    const quotes = page
      .getByRole("menu")
      .getByRole("menuitem")
      .filter({ hasNotText: "another asset" });
    await expect(quotes.first()).toBeVisible();
    // Rows stay disabled until the pair's verification confirms there is no
    // orderbook yet, then offer creation instead of switching the quote.
    for (const quote of await quotes.all()) {
      await expect(quote).toContainText(
        "Click to create an orderbook for this pair.",
        { timeout: 30_000 }
      );
      await expect(quote).toBeEnabled();
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
