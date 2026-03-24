import { type BrowserContext, type Page } from "@playwright/test";

/**
 * Resolves the Keplr extension ID from the browser context's service workers.
 * Returns null if no Keplr service worker is found.
 */
export async function getKeplrExtensionId(
  context: BrowserContext
): Promise<string | null> {
  let workers = context.serviceWorkers();
  if (workers.length === 0) {
    try {
      await context.waitForEvent("serviceworker", { timeout: 5_000 });
    } catch {
      // Extension may have already registered before we started listening.
    }
    workers = context.serviceWorkers();
  }

  for (const sw of workers) {
    const match = sw.url().match(/^chrome-extension:\/\/([^/]+)/);
    if (match) return match[1];
  }
  return null;
}

/**
 * Opens the Keplr extension popup directly via chrome-extension:// URL.
 *
 * In headed mode Keplr opens approval popups as new windows, captured by
 * `context.waitForEvent("page")`. In headless mode on Linux these popups
 * often don't fire that event. This function opens the popup page manually
 * so the pending approval request can be acted on.
 */
export async function openKeplrPopupDirect(
  context: BrowserContext,
  extensionId: string
): Promise<Page> {
  const popupUrl = `chrome-extension://${extensionId}/popup.html`;
  console.log(`Opening Keplr popup directly: ${popupUrl}`);
  const popup = await context.newPage();
  await popup.goto(popupUrl, { waitUntil: "domcontentloaded" });
  await popup.waitForLoadState("load", { timeout: 10_000 });
  return popup;
}

/**
 * Waits for a Keplr approval popup and clicks "Approve".
 *
 * Tries `context.waitForEvent("page")` first (works in headed mode).
 * If that times out, falls back to opening the popup directly via the
 * extension URL (required for headless mode on Linux).
 *
 * Returns the popup Page, or null if no approval was needed (1CT / auto-approve).
 */
export async function waitForKeplrApproval(
  context: BrowserContext,
  opts: { timeout?: number; clickApprove?: boolean } = {}
): Promise<Page | null> {
  const { timeout = 15_000, clickApprove = true } = opts;

  let popupPage: Page | null = null;

  try {
    popupPage = await context.waitForEvent("page", { timeout });
  } catch {
    console.log(
      "Keplr popup did not appear as page event; trying direct navigation."
    );
    const extensionId = await getKeplrExtensionId(context);
    if (extensionId) {
      try {
        popupPage = await openKeplrPopupDirect(context, extensionId);
      } catch (e) {
        console.log(`Failed to open Keplr popup directly: ${e}`);
      }
    }
  }

  if (popupPage && clickApprove) {
    try {
      await popupPage.waitForLoadState("load", { timeout: 10_000 });
      const approveBtn = popupPage.getByRole("button", { name: "Approve" });
      await approveBtn.waitFor({ state: "visible", timeout: 10_000 });
      console.log("Clicking Approve in Keplr popup.");
      await approveBtn.click();
    } catch (e) {
      console.log(
        `Approve button not found or not clickable in Keplr popup: ${e}`
      );
    }
  }

  return popupPage;
}
