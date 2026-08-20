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

/** True for any Keplr popup page — including Home, which is not a sign request. */
export const isKeplrPopupPage = (p: Page) =>
  p.url().includes("chrome-extension://") && p.url().includes("/popup.html");

/**
 * Opens the Keplr extension popup directly via chrome-extension:// URL.
 *
 * In headed mode Keplr opens approval popups as new windows, captured by
 * `context.waitForEvent("page")`. In headless mode on Linux these popups
 * often don't fire that event. This function opens the popup page manually
 * so the pending approval request can be acted on.
 *
 * Only meaningful when an approval is actually pending: with no queued request
 * this URL renders Keplr Home, which has no Approve button.
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
 *   3. Re-scan `context.pages()` once that wait times out, since the predicate
 *      can miss a popup whose URL was not set yet when the event fired.
 *   4. Direct `chrome-extension://` navigation (headless Linux fallback).
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

  const existing = context.pages().find(isKeplrPopupPage);
  if (existing) {
    console.log(`Found already-open Keplr popup: ${existing.url()}`);
    return existing;
  }

  try {
    // The predicate matters: Keplr re-opens `register.html` tabs of its own
    // accord, and an unfiltered wait hands one back as though it were the popup.
    return await context.waitForEvent("page", {
      timeout,
      predicate: isKeplrPopupPage,
    });
  } catch {
    console.log("Keplr popup did not appear as a page event.");
  }

  // The page event can fire before the popup has navigated, so the predicate
  // gets an empty URL and rejects a real sign popup; Playwright tests the
  // predicate once per event and never re-checks. Loosening it is not the fix —
  // Keplr's self-opened `register.html` tabs are equally URL-less at that
  // moment, which is exactly what the predicate is there to reject. By the time
  // the wait has timed out the navigation has committed, so a re-scan is
  // unambiguous.
  const late = context.pages().find(isKeplrPopupPage);
  if (late) {
    console.log(`Found Keplr popup on re-scan after timeout: ${late.url()}`);
    return late;
  }

  // Headless-only by design. Bare `popup.html` renders Keplr Home whether or not
  // a request is pending, so in headed mode this fallback manufactures a popup
  // with no Approve button and hides the real one — a slow sign popup becomes a
  // hard failure. Headed Chrome fires the page event reliably, so if we got here
  // without one, there is genuinely no approval to act on.
  if (process.env.HEADLESS !== "true") {
    console.log(
      "Headed mode: no Keplr popup appeared, treating as no approval needed."
    );
    return null;
  }

  console.log("Headless mode: trying direct navigation.");
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
// Short window to catch a genuine sign popup that lost the race to the
// direct-navigation fallback. Kept well under the per-attempt budgets so a
// re-acquisition attempt cannot dominate the retry loop.
const REACQUIRE_TIMEOUT_MS = 5_000;

/** Non-blocking probe: is this page currently showing a sign request? */
const hasApproveButton = (p: Page) =>
  p
    .getByRole("button", { name: "Approve" })
    .isVisible()
    .catch(() => false);

/**
 * Finds a better Keplr popup to retry the approval against.
 *
 * Bare `popup.html` renders Keplr Home, which never grows an "Approve" button.
 * So when the direct-navigation fallback beats a slow sign popup, reloading it
 * just yields Home again — the only useful move is to go find the real popup.
 * Prefers an already-open popup showing Approve. Failing that, returns the next
 * Keplr popup to arrive as a page event — or, if that wait times out, one found
 * by re-scanning afterwards — without re-checking it: this is only
 * called once the current popup has already failed, so any other popup is at
 * worst an equal starting point, and the retry loop re-tests Approve anyway.
 * Callers must not treat the result as guaranteed to be a sign request.
 * Returns null if nothing turns up.
 */
async function reacquireSignPopup(
  context: BrowserContext,
  current: Page
): Promise<Page | null> {
  for (const p of context.pages()) {
    if (p === current || p.isClosed() || !isKeplrPopupPage(p)) continue;
    if (await hasApproveButton(p)) {
      console.log("Re-acquired an open Keplr popup showing a sign request.");
      return p;
    }
  }

  const arrived = await context
    .waitForEvent("page", {
      timeout: REACQUIRE_TIMEOUT_MS,
      predicate: isKeplrPopupPage,
    })
    .catch(() => null);
  if (arrived) {
    console.log("Sign popup arrived late as a page event.");
    return arrived;
  }

  // Same blind spot as `getKeplrPopupPage`, and it bites hardest here: the scan
  // at the top of the next call would catch a popup this wait rejected, but only
  // while a next attempt remains. On the final re-acquisition there is none, so
  // the miss costs the whole spec.
  const late = context
    .pages()
    .find((p) => p !== current && !p.isClosed() && isKeplrPopupPage(p));
  if (late) console.log(`Re-acquired Keplr popup on re-scan: ${late.url()}`);
  return late ?? null;
}

/**
 * Waits for a Keplr approval popup and clicks "Approve".
 *
 * Delegates to `getKeplrPopupPage()` (which checks existing pages, waits
 * for event, then falls back to direct navigation) to acquire the popup.
 *
 * The popup frequently comes up blank or renders the Approve button late in
 * headless CI, so a single `waitFor` is flaky. We retry the load + button
 * steps with a reload in between: a reload makes the popup re-read the
 * still-pending approval from the background service worker (the request is queued
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
        await approveBtn.click({ timeout: APPROVE_BUTTON_TIMEOUT_MS });
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
      const fresh = await reacquireSignPopup(context, popupPage);
      if (fresh) {
        popupPage = fresh;
      } else {
        // No better popup to switch to, so fall back to reloading this one:
        // a blank/stuck popup re-reads the still-pending approval from the
        // background service worker, which survives the reload.
        await popupPage
          .reload({ waitUntil: "domcontentloaded" })
          .catch(() => {});
        await popupPage.waitForTimeout(1_500);
      }
    }
  }

  throw new Error(
    `waitForKeplrApproval: popup appeared but Approve was not actionable after ` +
      `${attempts} attempts. Last error: ${lastError}`
  );
}
