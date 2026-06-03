import {
  type BrowserContext,
  type Locator,
  type Page,
  expect,
} from "@playwright/test";

import { buildExplorerTxUrl, pollTxOnChain } from "../utils/tx-confirm";
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
  /** Hash of the most recently broadcast tx, captured for the REST fallback. */
  private lastTxHash?: string;

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

  /**
   * Navigate to the app home and wait for tokens to load.
   *
   * Retries with backoff because the EU/SG monitoring suites load the app
   * through an HTTP CONNECT proxy where the initial page load / `assets.json`
   * fetch can intermittently stall — previously this surfaced as a hard
   * `beforeAll` timeout (e.g. the 180s monitoring.limit hook on EU) instead of
   * a recoverable retry.
   */
  async goto(retries = 2) {
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 Retry goto attempt ${attempt}/${retries}...`);
        }
        // Wait for the assets.json *response* (not just the request being
        // issued) and assert it loaded successfully, so a stalled/failed load
        // surfaces as a retryable error rather than a false "ready". Using
        // Promise.all ties both promises together, so if goto() throws the
        // waitForResponse promise is still handled (no unhandled rejection).
        const [assetResponse] = await Promise.all([
          this.page.waitForResponse("**/assets.json", { timeout: 30_000 }),
          this.page.goto("/"),
        ]);
        expect(assetResponse.ok()).toBeTruthy();
        // we expect that after 2 seconds tokens are loaded and any failure after this point should be considered a bug.
        await this.page.waitForTimeout(2000);
        const currentUrl = this.page.url();
        console.log(`FE opened at: ${currentUrl}`);
        await this.dismissVariantsPopupIfPresent();
        return;
      } catch (error: any) {
        lastError = error;
        console.warn(
          `⚠️ goto attempt ${attempt + 1}/${retries + 1} failed: ${
            error?.message ?? error
          }`
        );
        if (attempt < retries) {
          await this.page.waitForTimeout(2000 * (attempt + 1));
        }
      }
    }
    throw lastError;
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
    try {
      const trxUrl = await this.trxLink.getAttribute("href", {
        timeout: 10000,
      });
      console.log(`Trx url: ${trxUrl}`);
      await this.page.reload();
      return trxUrl;
    } catch (error) {
      // The "View explorer" link lives in the same success toast that the WS
      // TxTracer drives; over the geo proxies it may never render even when the
      // tx is confirmed on-chain (see startTxConfirmation). Fall back to the
      // hash captured from the broadcast response so the test can still proceed.
      if (this.lastTxHash) {
        const fallbackUrl = buildExplorerTxUrl(this.lastTxHash);
        console.log(
          `Success-toast link absent; using captured tx hash: ${fallbackUrl}`
        );
        await this.page.reload();
        return fallbackUrl;
      }
      throw error;
    }
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
   * Captures the broadcast tx hash from the app's `/api/broadcast-transaction`
   * response. Must be armed BEFORE the Keplr approval click, since the broadcast
   * only happens after approval. Resolves with the lowercase tx hash.
   */
  private async captureBroadcastHash(timeout: number): Promise<string> {
    const resp = await this.page.waitForResponse(
      (r) =>
        r.url().includes("/api/broadcast-transaction") &&
        r.request().method() === "POST",
      { timeout }
    );
    const body = (await resp.json()) as {
      tx_response?: {
        txhash?: string;
        code?: number;
        codespace?: string;
        raw_log?: string;
      };
      code?: number;
      message?: string;
    };
    const txResponse = body?.tx_response;
    const hash = txResponse?.txhash;

    // Surface the broadcast result so a tx that is rejected at CheckTx (returns a
    // hash but is never included → LCD "tx not found") is diagnosable from CI
    // logs. `code === 0` means accepted into the mempool; a non-zero `code` +
    // `raw_log`/`codespace` is the ante-handler rejection reason (sequence, fee,
    // signature, etc.). Logged, not thrown, so the REST poll still runs.
    console.log(
      `Broadcast response: httpStatus=${resp.status()} ` +
        `code=${txResponse?.code ?? body?.code ?? "?"} ` +
        `codespace=${txResponse?.codespace ?? "-"} ` +
        `txhash=${hash ?? "none"}` +
        (txResponse?.raw_log ? ` raw_log=${txResponse.raw_log}` : "") +
        (!txResponse && body?.message ? ` message=${body.message}` : "")
    );

    if (!hash) {
      throw new Error(
        `broadcast response contained no txhash (httpStatus=${resp.status()}, ` +
          `code=${txResponse?.code ?? body?.code ?? "?"}, ` +
          `message=${body?.message ?? txResponse?.raw_log ?? "none"})`
      );
    }
    return String(hash).toLowerCase();
  }

  /**
   * Confirms a just-submitted transaction succeeded, resilient to WebSocket
   * flakiness over the EU/SG geo proxies.
   *
   * Two signals race:
   *   1. Primary (WebSocket): the in-app "Transaction Successful" toast, driven
   *      by the app's WS `TxTracer`. Fast, but over the HTTP CONNECT proxy the
   *      WebSocket often stalls/disconnects, so the toast may never render even
   *      when the tx is included on-chain.
   *   2. Fallback (REST): capture the broadcast tx hash and poll the Osmosis LCD
   *      `GET /cosmos/tx/v1beta1/txs/{hash}` directly from Node (NOT through the
   *      browser proxy), passing as soon as the tx is on-chain with code 0.
   *
   * Whichever confirms first wins; the loser is aborted. Only if BOTH fail does
   * this reject. This must be armed before the Keplr approval click (mirroring
   * the previous `expect(trxSuccessful).toBeVisible()` arm) so the broadcast
   * response isn't missed.
   */
  startTxConfirmation(timeout = 40_000): Promise<void> {
    // Clear any hash from a previous trade so getTransactionUrl can't reuse it.
    this.lastTxHash = undefined;
    const controller = new AbortController();

    const toastPromise = this.trxSuccessful
      .waitFor({ state: "visible", timeout })
      .then(() => "WebSocket toast" as const);

    const restPromise = this.captureBroadcastHash(timeout).then((hash) => {
      this.lastTxHash = hash;
      console.log(`Captured broadcast tx hash: ${hash}`);
      return pollTxOnChain(hash, { timeout, signal: controller.signal }).then(
        () => "REST LCD poll" as const
      );
    });

    return Promise.any([toastPromise, restPromise])
      .then((winner) => {
        controller.abort();
        console.log(`✓ Transaction confirmed via ${winner}.`);
      })
      .catch((err: any) => {
        controller.abort();
        const detail = err?.errors
          ? err.errors.map((e: any) => e?.message ?? String(e)).join(" | ")
          : (err?.message ?? String(err));
        throw new Error(
          `Transaction not confirmed via WebSocket toast or on-chain REST poll: ${detail}`
        );
      });
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
   * - Confirms via WebSocket toast OR proxy-safe REST poll (see startTxConfirmation)
   * - No retry logic - for retry support, use sellAndGetWalletMsg()
   */
  async sellAndApprove(
    context: BrowserContext,
    options?: { slippagePercent?: string }
  ) {
    const slippagePercent = options?.slippagePercent;

    await expect(this.sellBtn, "Sell button is disabled!").toBeEnabled({
      timeout: this.buySellTimeout,
    });

    await this.sellBtn.click();
    await this.page.waitForTimeout(500);
    await this.disable1CTIfNeeded();

    if (slippagePercent) {
      await this.setSlippageTolerance(slippagePercent);
    }

    const confirmation = this.startTxConfirmation();
    await this.confirmSwapBtn.click();
    await this.justApproveIfNeeded(context);
    await confirmation;
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

    await expect(this.buyBtn, "Buy button is disabled!").toBeEnabled({
      timeout: this.buySellTimeout,
    });

    await this.buyBtn.click();
    await this.page.waitForTimeout(500);
    await this.disable1CTIfNeeded();

    if (slippagePercent) {
      await this.setSlippageTolerance(slippagePercent);
    }

    const confirmation = this.startTxConfirmation();
    await this.confirmSwapBtn.click();
    await this.justApproveIfNeeded(context);
    await confirmation;
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
        await expect(this.swapBtn, "Swap button is disabled!").toBeEnabled({
          timeout: this.buySellTimeout,
        });

        await this.swapBtn.click({ timeout: 4000 });
        await this.page.waitForTimeout(500);
        await this.disable1CTIfNeeded();

        if (slippagePercent) {
          await this.setSlippageTolerance(slippagePercent);
        }

        const confirmation = this.startTxConfirmation();
        await this.confirmSwapBtn.click({ timeout: 5000 });
        await this.justApproveIfNeeded(context);

        if (attempt > 0) {
          console.log(
            `✓ Swap transaction submitted after ${attempt} retry(ies)`
          );
        }

        await confirmation;

        return;
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
