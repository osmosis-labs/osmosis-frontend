import { type BrowserContext, type Page } from "@playwright/test";

/**
 * Resolves the Keplr extension ID from the browser context's service workers.
 * Returns null if no Keplr service worker is found.
 *
 * @param swTimeout - How long to wait for a service worker to register (ms).
 *   Default 5s is fine for popup helpers; callers like SetupKeplr that run
 *   during initial browser launch may want a longer timeout (e.g. 10_000).
 */
export async function getKeplrExtensionId(
  context: BrowserContext,
  opts: { swTimeout?: number } = {}
): Promise<string | null> {
  const { swTimeout = 5_000 } = opts;
  let workers = context.serviceWorkers();
  if (workers.length === 0) {
    console.log("Waiting for Keplr service worker to register...");
    try {
      await context.waitForEvent("serviceworker", { timeout: swTimeout });
    } catch {
      console.log(
        `No service worker event received within ${swTimeout / 1000}s.`
      );
    }
    workers = context.serviceWorkers();
  }

  for (const sw of workers) {
    const match = sw.url().match(/^chrome-extension:\/\/([^/]+)/);
    if (match) {
      console.log(`Discovered extension ID: ${match[1]}`);
      return match[1];
    }
  }
  console.log("No chrome-extension service workers found.");
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
 * Returns the Keplr popup Page without clicking anything.
 *
 * Strategy order:
 *   1. Check `context.pages()` for an already-open Keplr popup (handles
 *      fast-opening popups when the helper is called after the click).
 *   2. `context.waitForEvent("page")` (headed mode on macOS).
 *   3. Direct `chrome-extension://` navigation (headless Linux fallback).
 *
 * Returns null if no popup could be obtained.
 *
 * Use this when caller code needs to inspect popup content (e.g. read
 * transaction message) before clicking Approve.
 */
export async function getKeplrPopupPage(
  context: BrowserContext,
  opts: { timeout?: number } = {}
): Promise<Page | null> {
  const { timeout = 15_000 } = opts;

  const existing = context
    .pages()
    .find(
      (p) =>
        p.url().includes("chrome-extension://") &&
        p.url().includes("/popup.html")
    );
  if (existing) {
    console.log(`Found already-open Keplr popup: ${existing.url()}`);
    return existing;
  }

  try {
    return await context.waitForEvent("page", { timeout });
  } catch {
    console.log(
      "Keplr popup did not appear as page event; trying direct navigation."
    );
  }

  const extensionId = await getKeplrExtensionId(context);
  if (extensionId) {
    try {
      return await openKeplrPopupDirect(context, extensionId);
    } catch (e) {
      console.log(`Failed to open Keplr popup directly: ${e}`);
    }
  }

  return null;
}

// Per-step budgets for acting on a popup that has already been acquired.
// Kept separate from the popup-acquisition timeout so a failure can name the
// step that actually timed out (popup load vs Approve button).
const APPROVE_LOAD_TIMEOUT_MS = 10_000;
const APPROVE_BUTTON_TIMEOUT_MS = 10_000;

/**
 * Waits for a Keplr approval popup and clicks "Approve".
 *
 * Delegates to `getKeplrPopupPage()` (which checks existing pages, waits
 * for event, then falls back to direct navigation) to acquire the popup.
 *
 * The popup frequently comes up blank or renders the Approve button late in
 * headless CI, so a single `waitFor` is flaky. We retry the load + button
 * steps with a reload in between: a reload makes the popup re-read the still
 * -pending approval from the background service worker (the request is queued
 * there, so it survives the reload). Each failed attempt logs which step timed
 * out, so a hard failure points at the real cause instead of a generic
 * "Approve not visible".
 *
 * Returns the popup Page, or null if no approval was needed (1CT / auto-approve).
 * Throws only if a popup was found but Approve never became actionable after
 * all attempts (prevents silent failures that would surface as misleading
 * timeouts later).
 */
export async function waitForKeplrApproval(
  context: BrowserContext,
  opts: { timeout?: number; attempts?: number } = {}
): Promise<Page | null> {
  const { timeout = 15_000, attempts = 3 } = opts;

  const isPopup = (p: Page) =>
    p.url().includes("chrome-extension://") && p.url().includes("/popup.html");

  // A null result here means no approval popup ever appeared (1CT /
  // pre-approved) — a no-op success, not a failure.
  let popupPage = await getKeplrPopupPage(context, { timeout });
  if (!popupPage) {
    console.log(
      "No Keplr approval popup appeared; assuming 1-click trading or auto-approval."
    );
    return null;
  }

  let lastError = "unknown error";
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const loaded = await popupPage
      .waitForLoadState("load", { timeout: APPROVE_LOAD_TIMEOUT_MS })
      .then(() => true)
      .catch(() => false);

    if (loaded) {
      const approveBtn = popupPage.getByRole("button", { name: "Approve" });
      try {
        await approveBtn.waitFor({
          state: "visible",
          timeout: APPROVE_BUTTON_TIMEOUT_MS,
        });
        await approveBtn.click();
        console.log(
          `Clicking Approve in Keplr popup${
            attempt > 1 ? ` (attempt ${attempt}/${attempts})` : ""
          }.`
        );
        return popupPage;
      } catch (err) {
        lastError = `"Approve" button not visible within ${
          APPROVE_BUTTON_TIMEOUT_MS / 1_000
        }s: ${err instanceof Error ? err.message : String(err)}`;
      }
    } else {
      lastError = `popup did not reach "load" within ${
        APPROVE_LOAD_TIMEOUT_MS / 1_000
      }s`;
    }

    console.warn(
      `waitForKeplrApproval attempt ${attempt}/${attempts} failed: ${lastError}`
    );

    if (attempt < attempts) {
      // Reload to re-render a blank/stuck popup; the pending request persists
      // in the service worker. If the popup was re-emitted as a new page,
      // switch to the freshest open popup.
      await popupPage.reload({ waitUntil: "domcontentloaded" }).catch(() => {});
      await popupPage.waitForTimeout(1_500);
      const popups = context.pages().filter(isPopup);
      const fresh = popups[popups.length - 1];
      if (fresh) popupPage = fresh;
    }
  }

  throw new Error(
    `waitForKeplrApproval: popup appeared but Approve was not actionable after ` +
      `${attempts} attempts. Last error: ${lastError}`
  );
}
