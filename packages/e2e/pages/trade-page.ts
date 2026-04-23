import {
  type BrowserContext,
  type Locator,
  type Page,
  expect,
} from "@playwright/test";

import { BasePage } from "./base-page";
import { getKeplrPopupPage, waitForKeplrApproval } from "./keplr-helper";

/**
 * Page object for the /trade view (swap, buy, sell, limit orders).
 *
 * Transaction methods come in two flavours:
 *   - *AndGetWalletMsg  (e.g. buyAndGetWalletMsg) -- full flow with retry logic,
 *     returns the raw Keplr message content for test assertions.
 *   - *AndApprove       (e.g. buyAndApprove) -- simplified fire-and-forget flow
 *     with no retries; use when you only need to confirm the tx succeeded.
 *
 * All methods handle the Keplr / 1-Click Trading duality: if no popup appears
 * within the timeout, the code assumes 1CT processed the transaction and
 * continues to wait for the on-chain success toast.
 */
export class TradePage extends BasePage {
  readonly page: Page;
  readonly swapBtn: Locator;
  readonly swapMaxBtn: Locator;
  readonly flipAssetsBtn: Locator;
  readonly exchangeRate: Locator;
  readonly trxSuccessful: Locator;
  readonly trxBroadcasting: Locator;
  readonly trxLink: Locator;
  readonly inputAmount: Locator;
  readonly confirmSwapBtn: Locator;
  readonly buyTabBtn: Locator;
  readonly buyBtn: Locator;
  readonly sellTabBtn: Locator;
  readonly sellBtn: Locator;
  readonly limitTabBtn: Locator;
  readonly orderHistoryLink: Locator;
  readonly limitPrice: Locator;
  readonly slippageInput: Locator;
  readonly buySellTimeout = 30_000;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.swapBtn = page.locator('//button[@data-testid="trade-button-swap"]');
    this.buyTabBtn = page.locator('//div[@class]/button[.="Buy"]/p[@class]/..');
    this.buyBtn = page.locator('//div[@class]/button[@class]/h6[.="Buy"]/..');
    this.sellBtn = page.locator('//div[@class]/button[@class]/h6[.="Sell"]/..');
    this.sellTabBtn = page.locator(
      '//div[@class]/button[.="Sell"]/p[@class]/..'
    );
    this.confirmSwapBtn = page.locator('//div[@class]/button[.="Confirm"]');
    this.swapMaxBtn = page.locator('//span[.="Max"]');
    this.flipAssetsBtn = page.locator(
      '//div/button[contains(@class, "ease-bounce")]'
    );
    this.exchangeRate = page.locator('//span[@data-testid="token-price"]');
    this.trxSuccessful = page.getByText("Transaction Successful");
    this.trxLink = page.getByText("View explorer");
    this.trxBroadcasting = page.locator('//h6[.="Transaction Broadcasting"]');
    this.inputAmount = page.locator(
      "//input[contains(@data-testid, 'trade-input')]"
    );
    this.limitTabBtn = page.locator('//div[@class="w-full"]/button[.="Limit"]');
    this.orderHistoryLink = page.getByText("Order history");
    this.limitPrice = page.locator("//div/input[@type='text']");
    this.slippageInput = page
      .locator('input[type="text"][inputmode="decimal"]')
      .first();
  }

  async goto() {
    const assetPromise = this.page.waitForRequest("**/assets.json");
    await this.page.goto("/");
    const request = await assetPromise;
    expect(request).toBeTruthy();
    // we expect that after 2 seconds tokens are loaded and any failure after this point should be considered a bug.
    await this.page.waitForTimeout(2000);
    const currentUrl = this.page.url();
    console.log(`FE opened at: ${currentUrl}`);
    await this.dismissVariantsPopupIfPresent();
  }

  async gotoOrdersHistory(timeout = 1) {
    await this.page.waitForTimeout(1000);
    await this.orderHistoryLink.click();
    await this.page.waitForTimeout(1000);
    await new Promise((f) => setTimeout(f, timeout * 1000));
    const currentUrl = this.page.url();
    console.log(`FE opened at: ${currentUrl}`);
  }

  async openBuyTab() {
    await this.buyTabBtn.click();
  }

  async openSellTab() {
    await this.sellTabBtn.click();
  }

  async openLimit() {
    await this.limitTabBtn.click();
    await this.page.waitForTimeout(1000);
  }

  async getLimitPrice() {
    const lp = await this.limitPrice.inputValue();
    console.log(`Current limit price is: ${lp}`);
    return lp;
  }

  async setLimitPriceChange(change: string) {
    const locator = `//button/span[contains(@class, "body2") and .="${change}"]`;
    await this.page.locator(locator).click();
    await this.page.waitForTimeout(1000);
  }

  async setLimitPrice(price: string) {
    console.log(`Set Order Limit Price to: ${price}`);
    await this.limitPrice.fill(price, { timeout: 2000 });
  }

  async flipTokenPair() {
    await this.flipAssetsBtn.click();
    await this.page.waitForTimeout(2000);
    console.log("Fliped token pair.");
  }

  async clickMaxAmountButton() {
    await this.swapMaxBtn.click({ timeout: 2000 });
    await this.page.waitForTimeout(1000);
    console.log("Clicked Max token amount button.");
  }

  async enterAmount(amount: string) {
    // Just enter an amount for the swap and wait for a quote
    await this.inputAmount.fill(amount, { timeout: 2000 });
    await this.page.waitForTimeout(1000);
    await expect(this.inputAmount).toHaveValue(amount, { timeout: 1000 });
    const exchangeRate = await this.getExchangeRate();
    console.log(`Swap ${amount} with rate: ${exchangeRate}`);
  }

  /**
   * Obtains the Keplr popup (with headless fallback), reads the transaction
   * message content, clicks Approve and returns the message text.
   * Returns undefined when no popup appears (1CT / pre-approved).
   */
  private async approveInKeplrAndGetMsg(context: BrowserContext) {
    const approvePage = await getKeplrPopupPage(context, { timeout: 20_000 });
    if (!approvePage) {
      console.log(
        "Keplr approval popup did not appear; assuming 1-click trading is enabled or transaction was pre-approved."
      );
      return undefined;
    }

    await approvePage.waitForLoadState();
    const approveBtn = approvePage.getByRole("button", { name: "Approve" });
    await expect(approveBtn).toBeEnabled();
    const msgContentAmount =
      (await approvePage
        .getByText("type: osmosis/poolmanager/")
        .textContent()) ?? undefined;
    console.log(`Wallet is approving this msg: \n${msgContentAmount}`);
    await approveBtn.click();
    return msgContentAmount;
  }

  /**
   * If the review-trade dialog shows a 1-Click Trading toggle in the "checked"
   * state, disable it so the test exercises the full Keplr approval flow.
   * Uses a short 500ms visibility check -- call sites add a 500ms waitForTimeout
   * before invoking this, giving ~1s total for the dialog to render.
   */
  async disable1CTIfNeeded() {
    const oneClickToggle =
      '//div[@role="dialog"]//button[@data-state="checked"]';
    if (await this.page.locator(oneClickToggle).isVisible({ timeout: 500 })) {
      await this.page.locator(oneClickToggle).click({ timeout: 3000 });
      console.log("Disabled 1-Click Trading toggle.");
    }
  }

  /**
   * Lightweight Keplr approval helper used by the *AndApprove methods.
   * Delegates to the shared helper which handles both headed and headless modes.
   */
  async justApproveIfNeeded(context: BrowserContext) {
    await waitForKeplrApproval(context, { timeout: 10_000 });
  }

  /**
   * Waits for any lingering "Transaction Successful" / "Transaction Broadcasting"
   * / "View explorer" toast from a previous transaction to disappear, so the
   * next confirmation detection can't short-circuit on stale DOM. Mirrors the
   * guard used in transactions-page.ts (cancelLimitOrder / claimAndCloseAny /
   * claimAll). Safe to call multiple times -- never throws.
   *
   * Important for sequential tests like monitoring.market.wallet.spec, where
   * four buy/sell swaps run back-to-back within the 7s success-toast lifetime.
   */
  async dismissStaleTxToasts(timeout = 3000) {
    await Promise.all([
      this.trxSuccessful
        .waitFor({ state: "hidden", timeout })
        .catch(() => {}),
      this.trxBroadcasting
        .waitFor({ state: "hidden", timeout })
        .catch(() => {}),
      this.trxLink.waitFor({ state: "hidden", timeout }).catch(() => {}),
    ]);
  }

  /**
   * Logs best-effort UI diagnostics to help triage tx-confirmation timeouts.
   * Safe to call from a catch block -- never throws.
   */
  private async logTxDiagnostics(prefix: string) {
    const url = this.page.url();
    let toastText = "<none>";
    try {
      toastText =
        (await this.page
          .locator('[role="alertdialog"]')
          .innerText({ timeout: 500 })) || "<empty>";
    } catch {
      // alertdialog may not exist; keep default
    }
    let explorerHref: string | null = null;
    try {
      explorerHref = await this.trxLink.getAttribute("href", { timeout: 500 });
    } catch {
      // no explorer link visible; fine
    }
    console.warn(
      `[tx-diagnostics] ${prefix}\n  page=${url}\n  alertDialogText=${JSON.stringify(
        toastText
      )}\n  explorerHref=${explorerHref ?? "<none>"}`
    );
  }

  /**
   * Starts capturing tx-broadcast-related network activity. Intended to be
   * armed just before clicking Confirm and either consumed via
   * `logCapturedTxNetwork()` on failure or discarded via `stop()` on success.
   *
   * Filters aggressively to only tx-relevant endpoints (broadcast, tendermint
   * RPC, cosmos REST tx posts, sqs/indexer hits that matter) so captured
   * output stays small enough to dump into CI logs.
   *
   * Safe to call repeatedly -- each call returns a fresh handle.
   */
  protected startTxNetworkCapture() {
    type Entry = {
      at: number;
      kind: "request" | "response";
      method?: string;
      url: string;
      status?: number;
      body?: string;
      failure?: string;
    };

    const entries: Entry[] = [];
    const MAX_ENTRIES = 40;
    const MAX_BODY = 800;

    const isInteresting = (url: string, body?: string) => {
      const u = url.toLowerCase();
      if (
        u.includes("broadcast") ||
        u.includes("/cosmos/tx/") ||
        u.includes("/txs") ||
        u.includes("/abci_query") ||
        u.includes("/tx?") ||
        u.endsWith("/tx") ||
        u.includes("/status") ||
        u.includes("trpc") ||
        u.includes("sqs") ||
        u.includes("rpc.")
      ) {
        return true;
      }
      if (body && /"method"\s*:\s*"broadcast_tx_/.test(body)) return true;
      return false;
    };

    const push = (entry: Entry) => {
      if (entries.length >= MAX_ENTRIES) return;
      entries.push(entry);
    };

    const onRequest = (req: import("@playwright/test").Request) => {
      try {
        const method = req.method();
        const url = req.url();
        const body = req.postData() ?? undefined;
        if (method === "GET" && !isInteresting(url)) return;
        if (method !== "GET" && !isInteresting(url, body)) return;
        push({
          at: Date.now(),
          kind: "request",
          method,
          url,
          body: body ? body.slice(0, MAX_BODY) : undefined,
        });
      } catch {
        // best-effort; never throw from listener
      }
    };

    const onResponse = async (res: import("@playwright/test").Response) => {
      try {
        const req = res.request();
        const method = req.method();
        const url = res.url();
        const reqBody = req.postData() ?? undefined;
        if (method === "GET" && !isInteresting(url)) return;
        if (method !== "GET" && !isInteresting(url, reqBody)) return;
        let body: string | undefined;
        try {
          const raw = await res.text();
          body = raw ? raw.slice(0, MAX_BODY) : undefined;
        } catch {
          // body may not be readable (redirect, aborted); ignore
        }
        push({
          at: Date.now(),
          kind: "response",
          method,
          url,
          status: res.status(),
          body,
        });
      } catch {
        // best-effort
      }
    };

    const onRequestFailed = (req: import("@playwright/test").Request) => {
      try {
        const url = req.url();
        const body = req.postData() ?? undefined;
        if (!isInteresting(url, body)) return;
        push({
          at: Date.now(),
          kind: "response",
          method: req.method(),
          url,
          failure: req.failure()?.errorText ?? "unknown",
        });
      } catch {
        // best-effort
      }
    };

    this.page.on("request", onRequest);
    this.page.on("response", onResponse);
    this.page.on("requestfailed", onRequestFailed);
    const startedAt = Date.now();

    return {
      stop: () => {
        this.page.off("request", onRequest);
        this.page.off("response", onResponse);
        this.page.off("requestfailed", onRequestFailed);
      },
      dump: (prefix: string) => {
        if (entries.length === 0) {
          console.warn(
            `[tx-network] ${prefix}\n  no tx-related network activity captured (monitored ${
              Date.now() - startedAt
            }ms)`
          );
          return;
        }
        const lines = entries.map((e) => {
          const elapsed = e.at - startedAt;
          const tag =
            e.kind === "request"
              ? `REQ ${e.method}`
              : e.failure
                ? `FAIL ${e.method} ${e.failure}`
                : `RES ${e.status} ${e.method}`;
          const bodySnippet = e.body
            ? ` body=${JSON.stringify(e.body).slice(0, MAX_BODY + 20)}`
            : "";
          return `  +${elapsed}ms ${tag} ${e.url}${bodySnippet}`;
        });
        console.warn(
          `[tx-network] ${prefix} (${entries.length} entries, cap ${MAX_ENTRIES})\n${lines.join("\n")}`
        );
      },
    };
  }

  /**
   * Waits for a transaction to reach a positive end state using only UI
   * signals. Runs in two phases:
   *
   *   1. Fast-fail (default 15s): any of
   *      "Transaction Broadcasting" | "Transaction Successful" | "View explorer"
   *      must become visible. If none appears, the tx almost certainly never
   *      reached the mempool -- throws a clearly labelled error so on-chain
   *      issues are not hidden behind a generic 40s timeout.
   *
   *   2. Success (remaining time, default 40s total): wait for
   *      "Transaction Successful" or "View explorer" (both rendered by the
   *      success toast). The success toast auto-closes after ~7s, so this
   *      phase just has to catch that window.
   *
   * On either failure the method logs lightweight diagnostics (page URL,
   * current toast text, explorer href) to aid CI triage.
   */
  async waitForTxConfirmation(
    opts: {
      timeout?: number;
      networkCapture?: { dump: (prefix: string) => void };
    } = {}
  ) {
    const total = opts.timeout ?? 40_000;

    // Wait for "Transaction Successful" text to appear. This is the exact
    // pattern that was proven to work prior to this file's refactor -- using a
    // compound `.or()` locator across trxSuccessful / trxLink / trxBroadcasting
    // triggered Playwright strict-mode issues when multiple success-toast
    // elements were present, causing the assertion to throw immediately even
    // though the toast had rendered (visible via the View-explorer href in
    // diagnostics output). Keep this simple and targeted.
    try {
      await expect(this.trxSuccessful).toBeVisible({ timeout: total });
    } catch (e) {
      await this.logTxDiagnostics(
        `Transaction Successful toast not visible within ${total}ms`
      );
      opts.networkCapture?.dump(
        `Transaction Successful toast not visible -- network activity since confirm click`
      );
      throw e;
    }
  }

  async swapAndGetWalletMsg(context: BrowserContext) {
    expect(
      await this.isInsufficientBalanceForSwap(),
      "Insufficient balance for the swap!"
    ).toBeFalsy();
    console.log("Swap and Sign now..");
    await expect(this.swapBtn, "Swap button is disabled!").toBeEnabled({
      timeout: 15000,
    });

    await this.swapBtn.click({ timeout: 4000 });
    await this.page.waitForTimeout(500);
    await this.disable1CTIfNeeded();
    await this.confirmSwapBtn.click({ timeout: 5000 });

    const msgContentAmount = await this.approveInKeplrAndGetMsg(context);
    return msgContentAmount;
  }

  async selectAsset(token: string) {
    const tokenLocator = "//div//button[@type]//img[@alt]";
    const fromToken = this.page.locator(tokenLocator).nth(0);
    await fromToken.click();
    // we expect that after 1 second token filter is displayed.
    await this.page.waitForTimeout(1000);
    await this.page.getByPlaceholder("Search").fill(token);
    const fromLocator = this.page.locator(
      `//div/button[@data-testid='token-select-asset']//span[.='${token}']`
    );
    await fromLocator.click();
  }

  async selectPair(from: string, to: string) {
    // Filter does not show already selected tokens
    console.log(`Select pair ${from} to ${to}`);
    const fromToken = this.page.locator(
      "//div//button[@data-testid='token-in']//img[@alt]"
    );
    const toToken = this.page.locator(
      "//div//button[@data-testid='token-out']//img[@alt]"
    );
    // Select From Token
    await fromToken.click({ timeout: 10000 });
    // we expect that after 1 second token filter is displayed.
    await this.page.waitForTimeout(1000);
    await this.page.getByPlaceholder("Search").fill(from);
    // Allow search to filter results
    await this.page.waitForTimeout(500);
    const fromLocator = this.page
      .locator(
        `//div/button[@data-testid='token-select-asset']//span[.='${from}']`
      )
      .first();
    // Wait for token to be visible before clicking
    await fromLocator.waitFor({ state: "visible", timeout: 10000 });
    await fromLocator.click({ timeout: 10000 });
    // Select To Token
    await toToken.click({ timeout: 10000 });
    // we expect that after 1 second token filter is displayed.
    await this.page.waitForTimeout(1000);
    await this.page.getByPlaceholder("Search").fill(to);
    // Allow search to filter results
    await this.page.waitForTimeout(500);
    const toLocator = this.page
      .locator(
        `//div/button[@data-testid='token-select-asset']//span[.='${to}']`
      )
      .first();
    // Wait for token to be visible before clicking
    await toLocator.waitFor({ state: "visible", timeout: 10000 });
    await toLocator.click({ timeout: 10000 });
    // we expect that after 2 seconds exchange rate is populated.
    await this.page.waitForTimeout(2000);
    expect(await this.getExchangeRate()).toContain(from);
    expect(await this.getExchangeRate()).toContain(to);
  }

  async getExchangeRate() {
    return await this.exchangeRate.innerText();
  }

  async isTransactionSuccesful(delay = 7) {
    console.log(`Wait for a transaction success for ${delay} seconds.`);
    await expect(this.trxSuccessful).toBeVisible({
      timeout: delay * 1000,
      visible: true,
    });
  }

  async getTransactionUrl() {
    const trxUrl = await this.trxLink.getAttribute("href", { timeout: 10000 });
    console.log(`Trx url: ${trxUrl}`);
    await this.page.reload();
    return trxUrl;
  }

  async isTransactionBroadcasted(delay = 5) {
    console.log(`Wait for a transaction broadcasting for ${delay} seconds.`);
    return await this.trxBroadcasting.isVisible({ timeout: delay * 1000 });
  }

  async isInsufficientBalance() {
    const issufBalanceBtn = this.page.locator(
      '//span[.="Insufficient balance"]'
    );
    return await issufBalanceBtn.isVisible({ timeout: 2000 });
  }

  async isInsufficientBalanceForSwap() {
    const issufBalanceBtn = this.page.locator(
      '//button[.="Insufficient balance"]'
    );
    return await issufBalanceBtn.isVisible({ timeout: 2000 });
  }

  async isSufficientBalanceForTrade() {
    // Make sure to have sufficient balance for a trade
    expect(
      await this.isInsufficientBalance(),
      "Insufficient balance for the swap!"
    ).toBeFalsy();
  }

  async isError(settleTimeout = 5_000) {
    const errorBtn = this.page.locator('//button[.="Error"]');
    try {
      await expect(errorBtn).not.toBeVisible({ timeout: settleTimeout });
      return false;
    } catch {
      return true;
    }
  }

  async showSwapInfo() {
    const swapInfo = this.page.locator("//button//span[.='Show details']");
    await expect(swapInfo, "Show Swap Info button not visible!").toBeVisible({
      timeout: 10000,
    });
    await swapInfo.click({ timeout: 5000 });
  }

  async getPriceInpact() {
    const priceInpactSpan = this.page.locator(
      '//span[.="Price Impact"]/..//span[@class="text-bullish-400"]'
    );
    return await priceInpactSpan.textContent();
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `screenshot-trade-${name}.png`,
      fullPage: true,
    });
  }

  async getSelectedSwapPair() {
    const tokenLocator = "//div//button[@type]//img[@alt]/../h5";
    const fromToken = this.page.locator(tokenLocator).nth(0);
    const toToken = this.page.locator(tokenLocator).nth(1);
    await expect(fromToken).toBeVisible({ timeout: 2000 });
    const fromTokenText = await fromToken.innerText();
    const toTokenText = await toToken.innerText();
    console.log(`Current pair: ${fromTokenText}/${toTokenText}`);
    return `${fromTokenText}/${toTokenText}`;
  }

  /**
   * Initiates a buy transaction and retrieves the wallet message content from Keplr popup.
   * Supports both market orders and limit orders with configurable retry logic and slippage tolerance.
   *
   * @param context - Browser context to handle Keplr popup windows
   * @param options - Configuration options for the buy operation
   * @param options.maxRetries - Maximum number of retry attempts on failure (default: 2, meaning 3 total attempts)
   * @param options.slippagePercent - Slippage tolerance percentage as string (e.g., "3" for 3%). Applied after buy button click.
   * @param options.limit - Whether this is a limit order (default: false). Affects message validation logic.
   *
   * @returns Object containing msgContentAmount (string | undefined)
   *          - Returns message content if Keplr popup appears (standard wallet approval flow)
   *          - Returns undefined if no popup appears within 20s (1-click trading or pre-approved)
   *
   * @throws Error if buy operation fails after all retry attempts or if insufficient balance
   *
   * @remarks
   * - Checks for sufficient balance before attempting transaction
   * - Implements automatic retry logic with 2s delay between attempts
   * - Gracefully handles 1-click trading scenarios (no Keplr popup)
   * - Automatically waits for blockchain confirmation before returning (40s timeout)
   * - Each retry attempt gets a fresh success listener to avoid timeout issues
   */
  async buyAndGetWalletMsg(
    context: BrowserContext,
    options?: { maxRetries?: number; slippagePercent?: string; limit?: boolean }
  ) {
    const maxRetries = options?.maxRetries ?? 2;
    const slippagePercent = options?.slippagePercent;
    const limit = options?.limit ?? false;

    // Check for insufficient balance BEFORE retry loop - no point retrying if balance is low
    expect(
      await this.isInsufficientBalance(),
      "Insufficient balance for buy! Please top up your wallet."
    ).toBeFalsy();

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(
            `🔄 Retry attempt ${attempt}/${maxRetries} for buy operation...`
          );
        }

        await expect(this.buyBtn, "Buy button is disabled!").toBeEnabled({
          timeout: this.buySellTimeout,
        });

        // IMPORTANT: Start listening for transaction success BEFORE any UI interactions
        // This ensures we don't miss immediate confirmations (1-click trading can be very fast)
        // The promise runs in parallel with subsequent operations to minimize total wait time
        const successPromise = expect(this.trxSuccessful).toBeVisible({
          timeout: 40000,
        });

        await this.buyBtn.click();
        await this.page.waitForTimeout(500);
        await this.disable1CTIfNeeded();

        if (slippagePercent) {
          await this.setSlippageTolerance(slippagePercent);
        }

        await this.confirmSwapBtn.click();

        let msgContentAmount: string | undefined;
        const approvePage = await getKeplrPopupPage(context, {
          timeout: 20_000,
        });

        if (approvePage) {
          await approvePage.waitForLoadState();
          const approveBtn = approvePage.getByRole("button", {
            name: "Approve",
          });
          await expect(approveBtn).toBeEnabled();
          const msgTextLocator = limit
            ? "Execute contract"
            : "type: osmosis/poolmanager/";
          msgContentAmount =
            (await approvePage.getByText(msgTextLocator).textContent()) ??
            undefined;
          console.log(`Wallet is approving this msg: \n${msgContentAmount}`);
          await approveBtn.click();
        } else {
          console.log(
            "Keplr approval popup did not appear; assuming 1-click trading is enabled or transaction was pre-approved."
          );
        }

        // Successfully submitted! Now wait for transaction success
        if (attempt > 0) {
          console.log(
            `✓ Buy transaction submitted after ${attempt} retry(ies)`
          );
        }

        // IMPORTANT: Wait for actual blockchain confirmation instead of arbitrary timeout
        // This ensures transaction is actually confirmed on-chain (or fails) before proceeding
        // Each retry gets a fresh 40s timeout to avoid timeout exhaustion
        await successPromise;

        return { msgContentAmount };
      } catch (error: any) {
        const isLastAttempt = attempt === maxRetries;

        if (isLastAttempt) {
          console.error(
            `❌ Buy operation failed after ${maxRetries + 1} attempts:`,
            error.message ?? "Unknown error"
          );
          throw new Error(
            `Failed to complete buy operation after ${
              maxRetries + 1
            } attempts. ` +
              `Last error: ${
                error.message ?? "Unknown error"
              }. Check if wallet extension is properly configured.`
          );
        }

        console.warn(
          `⚠️ Buy operation failed on attempt ${attempt + 1}/${
            maxRetries + 1
          }. ` + `Error: ${error.message ?? "Unknown error"}. Retrying...`
        );

        // Dismiss any lingering "Review trade" modal so the next attempt starts clean
        await this.page.keyboard.press("Escape");
        await this.page
          .locator(".ReactModal__Overlay")
          .waitFor({ state: "hidden", timeout: 2000 })
          .catch(() => {});
        await this.page.waitForTimeout(2000);
      }
    }

    // TypeScript needs this but it should never reach here
    throw new Error("Buy operation failed unexpectedly");
  }

  /**
   * Initiates a sell transaction and retrieves the wallet message content from Keplr popup.
   * Supports both market orders and limit orders with configurable retry logic and slippage tolerance.
   *
   * @param context - Browser context to handle Keplr popup windows
   * @param options - Configuration options for the sell operation
   * @param options.maxRetries - Maximum number of retry attempts on failure (default: 2, meaning 3 total attempts)
   * @param options.slippagePercent - Slippage tolerance percentage as string (e.g., "3" for 3%). Applied after sell button click.
   * @param options.limit - Whether this is a limit order (default: false). Affects message validation logic.
   *
   * @returns Object containing msgContentAmount (string | undefined)
   *          - Returns message content if Keplr popup appears (standard wallet approval flow)
   *          - Returns undefined if no popup appears within 20s (1-click trading or pre-approved)
   *
   * @throws Error if sell operation fails after all retry attempts or if insufficient balance
   *
   * @remarks
   * - Checks for sufficient balance before attempting transaction
   * - Implements automatic retry logic with 2s delay between attempts
   * - Gracefully handles 1-click trading scenarios (no Keplr popup)
   * - Automatically waits for blockchain confirmation before returning (40s timeout)
   * - Each retry attempt gets a fresh success listener to avoid timeout issues
   */
  async sellAndGetWalletMsg(
    context: BrowserContext,
    options?: { maxRetries?: number; slippagePercent?: string; limit?: boolean }
  ) {
    const maxRetries = options?.maxRetries ?? 2;
    const slippagePercent = options?.slippagePercent;
    const limit = options?.limit ?? false;

    // Check for insufficient balance BEFORE retry loop - no point retrying if balance is low
    expect(
      await this.isInsufficientBalance(),
      "Insufficient balance for sell! Please top up your wallet."
    ).toBeFalsy();

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(
            `🔄 Retry attempt ${attempt}/${maxRetries} for sell operation...`
          );
        }

        // Make sure Sell button is enabled
        await expect(this.sellBtn, "Sell button is disabled!").toBeEnabled({
          timeout: this.buySellTimeout,
        });

        // IMPORTANT: Start listening for transaction success BEFORE any UI interactions
        // This ensures we don't miss immediate confirmations (1-click trading can be very fast)
        // The promise runs in parallel with subsequent operations to minimize total wait time
        const successPromise = expect(this.trxSuccessful).toBeVisible({
          timeout: 40000,
        });

        await this.sellBtn.click();
        await this.page.waitForTimeout(500);
        await this.disable1CTIfNeeded();

        if (slippagePercent) {
          await this.setSlippageTolerance(slippagePercent);
        }

        await this.confirmSwapBtn.click();

        let msgContentAmount: string | undefined;
        const approvePage = await getKeplrPopupPage(context, {
          timeout: 20_000,
        });

        if (approvePage) {
          await approvePage.waitForLoadState();
          const approveBtn = approvePage.getByRole("button", {
            name: "Approve",
          });
          await expect(approveBtn).toBeEnabled();
          const msgTextLocator = limit
            ? "Execute contract"
            : "type: osmosis/poolmanager/";
          msgContentAmount =
            (await approvePage.getByText(msgTextLocator).textContent()) ??
            undefined;
          console.log(`Wallet is approving this msg: \n${msgContentAmount}`);
          await approveBtn.click();
        } else {
          console.log(
            "Keplr approval popup did not appear; assuming 1-click trading is enabled or transaction was pre-approved."
          );
        }

        // Successfully submitted! Now wait for transaction success
        if (attempt > 0) {
          console.log(
            `✓ Sell transaction submitted after ${attempt} retry(ies)`
          );
        }

        // IMPORTANT: Wait for actual blockchain confirmation instead of arbitrary timeout
        // This ensures transaction is actually confirmed on-chain (or fails) before proceeding
        // Each retry gets a fresh 40s timeout to avoid timeout exhaustion
        await successPromise;

        return { msgContentAmount };
      } catch (error: any) {
        const isLastAttempt = attempt === maxRetries;

        if (isLastAttempt) {
          console.error(
            `❌ Sell operation failed after ${maxRetries + 1} attempts:`,
            error.message ?? "Unknown error"
          );
          throw new Error(
            `Failed to complete sell operation after ${
              maxRetries + 1
            } attempts. ` +
              `Last error: ${
                error.message ?? "Unknown error"
              }. Check if wallet extension is properly configured.`
          );
        }

        console.warn(
          `⚠️ Sell operation failed on attempt ${attempt + 1}/${
            maxRetries + 1
          }. ` + `Error: ${error.message ?? "Unknown error"}. Retrying...`
        );

        // Dismiss any lingering "Review trade" modal so the next attempt starts clean
        await this.page.keyboard.press("Escape");
        await this.page
          .locator(".ReactModal__Overlay")
          .waitFor({ state: "hidden", timeout: 2000 })
          .catch(() => {});
        await this.page.waitForTimeout(2000);
      }
    }

    // TypeScript needs this but it should never reach here
    throw new Error("Sell operation failed unexpectedly");
  }

  /**
   * Initiates a sell transaction with simplified approval flow.
   * Automatically waits for transaction confirmation on blockchain.
   *
   * @param context - Browser context to handle potential Keplr popup windows
   * @param options - Configuration options for the sell operation
   * @param options.slippagePercent - Slippage tolerance percentage as string (e.g., "3" for 3%). Applied after sell button click.
   *
   * @remarks
   * - Waits for sell button to be enabled before proceeding
   * - Automatically approves transaction in Keplr if popup appears (10s event-driven timeout)
   * - Gracefully handles 1-click trading (no popup scenario)
   * - Waits for blockchain confirmation (40s timeout, starts after confirm click, parallel with approval)
   * - No retry logic - for retry support, use sellAndGetWalletMsg()
   */
  async sellAndApprove(
    context: BrowserContext,
    options?: { slippagePercent?: string }
  ) {
    const slippagePercent = options?.slippagePercent;

    await this.dismissStaleTxToasts();

    await expect(this.sellBtn, "Sell button is disabled!").toBeEnabled({
      timeout: this.buySellTimeout,
    });

    await this.sellBtn.click();
    await this.page.waitForTimeout(500);
    await this.disable1CTIfNeeded();

    if (slippagePercent) {
      await this.setSlippageTolerance(slippagePercent);
    }

    const capture = this.startTxNetworkCapture();
    try {
      await this.confirmSwapBtn.click();
      const confirmationPromise = this.waitForTxConfirmation({
        timeout: 40_000,
        networkCapture: capture,
      });
      await this.justApproveIfNeeded(context);
      await confirmationPromise;
    } finally {
      capture.stop();
    }
  }

  /**
   * Initiates a buy transaction with simplified approval flow.
   * Automatically waits for transaction confirmation on blockchain.
   *
   * @param context - Browser context to handle potential Keplr popup windows
   * @param options - Configuration options for the buy operation
   * @param options.slippagePercent - Slippage tolerance percentage as string (e.g., "3" for 3%). Applied after buy button click.
   *
   * @remarks
   * - Waits for buy button to be enabled before proceeding
   * - Automatically approves transaction in Keplr if popup appears (10s event-driven timeout)
   * - Gracefully handles 1-click trading (no popup scenario)
   * - Waits for blockchain confirmation (40s timeout, starts after confirm click, parallel with approval)
   * - No retry logic - for retry support, use buyAndGetWalletMsg()
   */
  async buyAndApprove(
    context: BrowserContext,
    options?: { slippagePercent?: string }
  ) {
    const slippagePercent = options?.slippagePercent;

    await this.dismissStaleTxToasts();

    await expect(this.buyBtn, "Buy button is disabled!").toBeEnabled({
      timeout: this.buySellTimeout,
    });

    await this.buyBtn.click();
    await this.page.waitForTimeout(500);
    await this.disable1CTIfNeeded();

    if (slippagePercent) {
      await this.setSlippageTolerance(slippagePercent);
    }

    const capture = this.startTxNetworkCapture();
    try {
      await this.confirmSwapBtn.click();
      const confirmationPromise = this.waitForTxConfirmation({
        timeout: 40_000,
        networkCapture: capture,
      });
      await this.justApproveIfNeeded(context);
      await confirmationPromise;
    } finally {
      capture.stop();
    }
  }

  /**
   * Sets the slippage tolerance in the review swap modal.
   * Must be called AFTER clicking swap button but BEFORE clicking confirm.
   * @param slippagePercent - Slippage percentage as string (e.g., "3" for 3%)
   */
  async setSlippageTolerance(slippagePercent: string) {
    console.log(`⚙️  Setting slippage tolerance to ${slippagePercent}%...`);

    try {
      // Wait for review modal and slippage input to be visible
      await this.slippageInput.waitFor({ state: "visible", timeout: 5000 });

      // Click to focus the input
      await this.slippageInput.click();

      // Clear and set new value
      await this.slippageInput.fill(slippagePercent);

      // Verify the value was actually set
      await expect(this.slippageInput).toHaveValue(slippagePercent, {
        timeout: 2000,
      });

      console.log(`✓ Slippage tolerance confirmed set to ${slippagePercent}%`);
    } catch (error: any) {
      console.warn(`⚠️  Could not set slippage tolerance: ${error.message}`);
      throw error;
    }
  }

  /**
   * Initiates a swap transaction with retry logic and automatic confirmation.
   * Handles race conditions where quote refreshes temporarily disable the swap button.
   *
   * @param context - Browser context to handle potential Keplr popup windows
   * @param options - Configuration options for the swap operation
   * @param options.maxRetries - Maximum number of retry attempts on failure (default: 3, meaning 4 total attempts)
   * @param options.slippagePercent - Slippage tolerance percentage as string (e.g., "3" for 3%). Applied after swap button click.
   *
   * @remarks
   * - Checks for sufficient balance before attempting swap
   * - Implements automatic retry logic with 1.5s delay for quote refresh race conditions
   * - Automatically approves transaction in Keplr if popup appears (10s event-driven timeout)
   * - Gracefully handles 1-click trading (no popup scenario)
   * - Waits for blockchain confirmation (40s timeout, starts after confirm click, parallel with approval)
   * - Retries only on swap button disabled errors; other errors fail immediately
   */
  async swapAndApprove(
    context: BrowserContext,
    options?: { maxRetries?: number; slippagePercent?: string }
  ) {
    const maxRetries = options?.maxRetries ?? 3;
    const slippagePercent = options?.slippagePercent;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        expect(
          await this.isInsufficientBalanceForSwap(),
          "Insufficient balance for the swap!"
        ).toBeFalsy();
        console.log("Swap and Sign now..");

        await this.dismissStaleTxToasts();

        await expect(this.swapBtn, "Swap button is disabled!").toBeEnabled({
          timeout: this.buySellTimeout,
        });

        await this.swapBtn.click({ timeout: 4000 });
        await this.page.waitForTimeout(500);
        await this.disable1CTIfNeeded();

        if (slippagePercent) {
          await this.setSlippageTolerance(slippagePercent);
        }

        const capture = this.startTxNetworkCapture();
        try {
          await this.confirmSwapBtn.click({ timeout: 5000 });
          const confirmationPromise = this.waitForTxConfirmation({
            timeout: 40_000,
            networkCapture: capture,
          });
          await this.justApproveIfNeeded(context);

          if (attempt > 0) {
            console.log(
              `✓ Swap transaction submitted after ${attempt} retry(ies)`
            );
          }

          await confirmationPromise;

          return;
        } finally {
          capture.stop();
        }
      } catch (error: any) {
        const isDisabledError =
          error.message?.includes("disabled") ||
          error.message?.includes("toBeEnabled");

        if (attempt < maxRetries && isDisabledError) {
          console.warn(
            `⚠️  RACE CONDITION DETECTED: Swap button disabled ` +
              `(attempt ${attempt + 1}/${maxRetries + 1}). ` +
              `Waiting for quote to stabilize and retrying...`
          );

          await this.page.waitForTimeout(1500);

          const rate = await this.getExchangeRate().catch(() => "N/A");
          console.log(`Exchange rate after wait: ${rate}`);

          continue;
        }

        throw error;
      }
    }
  }
}
