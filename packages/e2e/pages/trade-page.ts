import {
  type BrowserContext,
  type Locator,
  type Page,
  expect,
} from "@playwright/test";

import { BasePage } from "./base-page";

export class TradePage extends BasePage {
  readonly page: Page;
  readonly swapBtn: Locator;
  readonly swapMaxBtn: Locator;
  readonly flipAssetsBtn: Locator;
  readonly exchangeRate: Locator;
  readonly trxSuccessful: Locator;
  readonly trxFailed: Locator;
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
    this.trxFailed = page.getByRole("heading", { name: "Transaction Failed" });
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
    // we expect that after 4 seconds tokens are loaded and any failure after this point should be considered a bug.
    await this.page.waitForTimeout(4000);
    const currentUrl = this.page.url();
    console.log(`FE opened at: ${currentUrl}`);
  }

  /**
   * Waits for asset data to be fully loaded and rendered.
   * Verifies token selector UI elements are visible and properly initialized.
   * Call this after goto() or connectWallet() before performing asset-dependent actions.
   */
  async waitForAssetsToLoad() {
    console.log("⏳ Waiting for assets to fully load...");

    // Wait for token selector buttons to have proper image elements (assets loaded)
    const tokenButtons = this.page.locator("//div//button[@type]//img[@alt]");

    // Wait for at least one token button to be visible (From token)
    await expect(tokenButtons.first()).toBeVisible({ timeout: 10000 });

    // Additional wait for asset metadata to finish processing
    // This ensures token names are not truncated and quotes can be fetched
    await this.page.waitForTimeout(2000);

    console.log("✓ Assets loaded and ready");
  }

  /**
   * Waits for either transaction success or failure, whichever comes first.
   * Throws detailed error if transaction fails or times out.
   * @param timeoutMs - Maximum time to wait (default 60s)
   * @returns Promise that resolves on success, rejects on failure
   */
  private async waitForTransactionResult(
    timeoutMs: number = 60000
  ): Promise<void> {
    console.log(
      `⏰ Waiting for transaction confirmation (${timeoutMs / 1000}s timeout)...`
    );

    const startTime = Date.now();

    try {
      // Race between success and failure
      await Promise.race([
        // Success path
        expect(this.trxSuccessful)
          .toBeVisible({ timeout: timeoutMs })
          .then(() => {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`✓ Transaction successful after ${elapsed}s`);
          }),

        // Failure path
        this.trxFailed.waitFor({ state: "visible", timeout: timeoutMs }).then(() => {
          throw new Error("Transaction failed on blockchain");
        }),
      ]);
    } catch (error: any) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      // Check if it's a failure vs timeout
      const isFailed = await this.trxFailed
        .isVisible({ timeout: 100 })
        .catch(() => false);
      if (isFailed) {
        const errorText = await this.trxFailed.textContent();
        throw new Error(
          `Transaction failed after ${elapsed}s: ${errorText}`
        );
      }

      // Otherwise it's a timeout
      throw new Error(
        `Transaction status unknown after ${elapsed}s. ` +
          `Neither success nor failure message appeared. ` +
          `Original error: ${error.message}`
      );
    }
  }

  /**
   * Checks for error messages in toast notifications or alerts.
   * Call this after transaction submission but before waiting for result.
   */
  async checkForTransactionErrors(): Promise<void> {
    // Check for error toasts/alerts
    const errorIndicators = [
      this.page
        .locator('[role="alert"]')
        .filter({ hasText: /error|failed/i }),
      this.page.getByText(/transaction error/i),
      this.page.getByText(/insufficient/i),
    ];

    for (const indicator of errorIndicators) {
      const isVisible = await indicator
        .isVisible({ timeout: 1000 })
        .catch(() => false);
      if (isVisible) {
        const errorText = await indicator.textContent();
        console.warn(`⚠️ Error indicator detected: ${errorText}`);
        throw new Error(`Transaction error: ${errorText}`);
      }
    }
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

  private async approveInKeplrAndGetMsg(context: BrowserContext) {
    console.log("Wait for 5 seconds for any popup");
    await this.page.waitForTimeout(5_000);
    const pages = context.pages();
    console.log(`Number of Open Pages: ${pages.length}`);
    if (pages.length === 2) {
      const approvePage = pages[1];
      const approvePageTitle = approvePage.url();
      console.log(`Approve page is opened at: ${approvePageTitle}`);
      const msgContent = await approvePage
        .getByText("type: osmosis/poolmanager/")
        .textContent();
      console.log(`Wallet is approving this msg: \n${msgContent}`);
      await approvePage
        .getByRole("button", { name: "Approve" })
        .click({ timeout: 4000 });
      return msgContent;
    }
    console.log("Second page was not opened in 5 seconds.");
  }

  async justApproveIfNeeded(context: BrowserContext) {
    console.log("Wait for 7 seconds for any popup");
    await this.page.waitForTimeout(7_000);
    const pages = context.pages();
    console.log(`Number of Open Pages: ${pages.length}`);
    if (pages.length === 2) {
      const approvePage = pages[1];
      const approvePageTitle = approvePage.url();
      console.log(`Approve page is opened at: ${approvePageTitle}`);
      await approvePage
        .getByRole("button", { name: "Approve" })
        .click({ timeout: 4000 });
    }
    console.log("Second page was not opened in 7 seconds.");
  }

  async swapAndGetWalletMsg(context: BrowserContext) {
    // Make sure to have sufficient balance and swap button is enabled
    expect(
      await this.isInsufficientBalanceForSwap(),
      "Insufficient balance for the swap!"
    ).toBeFalsy();
    console.log("Swap and Sign now..");
    await expect(this.swapBtn, "Swap button is disabled!").toBeEnabled({
      timeout: 15000,
    });
    await this.swapBtn.click({ timeout: 4000 });
    // Handle 1-click by default
    const oneClick = '//div[@role="dialog"]//button[@data-state="checked"]';
    if (await this.page.locator(oneClick).isVisible({ timeout: 2000 })) {
      await this.page.locator(oneClick).click({ timeout: 3000 });
    }
    await this.confirmSwapBtn.click({ timeout: 5000 });
    return await this.approveInKeplrAndGetMsg(context);
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
    const trxUrl = await this.trxLink.getAttribute("href");
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

  async isError() {
    const errorBtn = this.page.locator('//button[.="Error"]');
    return await errorBtn.isVisible({ timeout: 2000 });
  }

  async showSwapInfo() {
    const swapInfo = this.page.locator("//button//span[.='Show details']");
    await expect(swapInfo, "Show Swap Info button not visible!").toBeVisible({
      timeout: 4000,
    });
    await swapInfo.click({ timeout: 2000 });
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

        // Start listening for transaction result (success or failure)
        const resultPromise = this.waitForTransactionResult(60000);

        // Handle Pop-up page ->
        // IMPORTANT: waitForEvent MUST have a timeout to prevent hanging indefinitely
        // If Keplr popup doesn't appear (1-click trading enabled), this will timeout gracefully
        const pageApprovePromise = context.waitForEvent("page", {
          timeout: 20000,
        });
        await this.buyBtn.click();
        // Small wait to let UI settle before triggering popup
        await this.page.waitForTimeout(500);

        // Set slippage tolerance if specified (after buy clicked, before confirm)
        if (slippagePercent) {
          await this.setSlippageTolerance(slippagePercent);
        }

        await this.confirmSwapBtn.click();

        let msgContentAmount: string | undefined;

        try {
          const approvePage = await pageApprovePromise;
          await approvePage.waitForLoadState();
          const approveBtn = approvePage.getByRole("button", {
            name: "Approve",
          });
          await expect(approveBtn).toBeEnabled();
          let msgTextLocator = "type: osmosis/poolmanager/";
          if (limit) {
            msgTextLocator = "Execute contract";
          }
          msgContentAmount =
            (await approvePage.getByText(msgTextLocator).textContent()) ??
            undefined;
          console.log(`Wallet is approving this msg: \n${msgContentAmount}`);
          // Approve trx
          await approveBtn.click();
          // Handle Pop-up page <-
        } catch (error: any) {
          // IMPORTANT: Gracefully handle timeout errors for 1-click trading scenarios
          // When 1-click trading is enabled, no Keplr popup appears and waitForEvent times out
          // This is expected behavior, not an error - transaction is still submitted on-chain
          if (
            error.name === "TimeoutError" ||
            (error instanceof Error && /timeout/i.test(error.message))
          ) {
            console.log(
              "✓ Keplr approval popup did not appear within 20s; assuming 1-click trading is enabled or transaction was pre-approved."
            );
            msgContentAmount = undefined;
          } else {
            // Other errors (button not found, page closed, etc.) should be retried
            console.error(
              "Failed to get Keplr approval popup:",
              error.message ?? "Unknown error"
            );
            throw error; // Re-throw to be caught by outer try-catch
          }
        }

        // Successfully submitted! Now wait for transaction success
        if (attempt > 0) {
          console.log(
            `✓ Buy transaction submitted after ${attempt} retry(ies)`
          );
        }

        console.log("✓ Transaction submitted to blockchain");
        await this.page.waitForTimeout(1000);

        // Check for immediate error indicators
        await this.checkForTransactionErrors();

        // Wait for result (success or failure)
        // Each retry gets a fresh 60s timeout to avoid timeout exhaustion
        await resultPromise;

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

        // Wait before retry to let things settle
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

        // Start listening for transaction result (success or failure)
        const resultPromise = this.waitForTransactionResult(60000);

        // Handle Pop-up page ->
        // IMPORTANT: waitForEvent MUST have a timeout to prevent hanging indefinitely
        // If Keplr popup doesn't appear (1-click trading enabled), this will timeout gracefully
        const pageApprovePromise = context.waitForEvent("page", {
          timeout: 20000,
        });
        await this.sellBtn.click();
        // Small wait to let UI settle before triggering popup
        await this.page.waitForTimeout(500);

        // Set slippage tolerance if specified (after sell clicked, before confirm)
        if (slippagePercent) {
          await this.setSlippageTolerance(slippagePercent);
        }

        await this.confirmSwapBtn.click();

        let msgContentAmount: string | undefined;

        try {
          const approvePage = await pageApprovePromise;
          await approvePage.waitForLoadState();
          const approveBtn = approvePage.getByRole("button", {
            name: "Approve",
          });
          await expect(approveBtn).toBeEnabled();
          let msgTextLocator = "type: osmosis/poolmanager/";
          if (limit) {
            msgTextLocator = "Execute contract";
          }
          msgContentAmount =
            (await approvePage.getByText(msgTextLocator).textContent()) ??
            undefined;
          console.log(`Wallet is approving this msg: \n${msgContentAmount}`);
          // Approve trx
          await approveBtn.click();
          // Handle Pop-up page <-
        } catch (error: any) {
          // IMPORTANT: Gracefully handle timeout errors for 1-click trading scenarios
          // When 1-click trading is enabled, no Keplr popup appears and waitForEvent times out
          // This is expected behavior, not an error - transaction is still submitted on-chain
          if (
            error.name === "TimeoutError" ||
            (error instanceof Error && /timeout/i.test(error.message))
          ) {
            console.log(
              "✓ Keplr approval popup did not appear within 20s; assuming 1-click trading is enabled or transaction was pre-approved."
            );
            msgContentAmount = undefined;
          } else {
            // Other errors (button not found, page closed, etc.) should be retried
            console.error(
              "Failed to get Keplr approval popup:",
              error.message ?? "Unknown error"
            );
            throw error; // Re-throw to be caught by outer try-catch
          }
        }

        // Successfully submitted! Now wait for transaction success
        if (attempt > 0) {
          console.log(
            `✓ Sell transaction submitted after ${attempt} retry(ies)`
          );
        }

        console.log("✓ Transaction submitted to blockchain");
        await this.page.waitForTimeout(1000);

        // Check for immediate error indicators
        await this.checkForTransactionErrors();

        // Wait for result (success or failure)
        // Each retry gets a fresh 60s timeout to avoid timeout exhaustion
        await resultPromise;

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

        // Wait before retry to let things settle
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
   * - Automatically approves transaction in Keplr if popup appears (7s timeout)
   * - Gracefully handles 1-click trading (no popup scenario)
   * - Waits for blockchain confirmation before returning (60s timeout)
   * - Detects both success and failure states with detailed error messages
   * - No retry logic - for retry support, use sellAndGetWalletMsg()
   */
  async sellAndApprove(
    context: BrowserContext,
    options?: { slippagePercent?: string }
  ) {
    const slippagePercent = options?.slippagePercent;

    // Make sure Sell button is enabled
    await expect(this.sellBtn, "Sell button is disabled!").toBeEnabled({
      timeout: this.buySellTimeout,
    });

    // Start listening for transaction result
    const resultPromise = this.waitForTransactionResult(60000);

    await this.sellBtn.click();

    // Set slippage tolerance if specified (after sell clicked, before confirm)
    if (slippagePercent) {
      await this.setSlippageTolerance(slippagePercent);
    }

    await this.confirmSwapBtn.click();
    await this.justApproveIfNeeded(context);
    console.log("✓ Transaction submitted to blockchain");
    await this.page.waitForTimeout(1000);

    // Check for immediate error indicators
    await this.checkForTransactionErrors();

    // Wait for result (success or failure)
    await resultPromise;
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
   * - Automatically approves transaction in Keplr if popup appears (7s timeout)
   * - Gracefully handles 1-click trading (no popup scenario)
   * - Waits for blockchain confirmation before returning (60s timeout)
   * - Detects both success and failure states with detailed error messages
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

    // Start listening for transaction result
    const resultPromise = this.waitForTransactionResult(60000);

    await this.buyBtn.click();

    // Set slippage tolerance if specified (after buy clicked, before confirm)
    if (slippagePercent) {
      await this.setSlippageTolerance(slippagePercent);
    }

    await this.confirmSwapBtn.click();
    await this.justApproveIfNeeded(context);
    console.log("✓ Transaction submitted to blockchain");
    await this.page.waitForTimeout(1000);

    // Check for immediate error indicators
    await this.checkForTransactionErrors();

    // Wait for result (success or failure)
    await resultPromise;
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
   * - Automatically approves transaction in Keplr if popup appears (7s timeout)
   * - Gracefully handles 1-click trading (no popup scenario)
   * - Waits for blockchain confirmation before returning (40s timeout)
   * - Retries only on swap button disabled errors; other errors fail immediately
   */
  async swapAndApprove(
    context: BrowserContext,
    options?: { maxRetries?: number; slippagePercent?: string }
  ) {
    const maxRetries = options?.maxRetries ?? 3;
    const slippagePercent = options?.slippagePercent;

    // Retry logic to handle race conditions where quote refreshes and temporarily disables swap button
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Make sure to have sufficient balance and swap button is enabled
        expect(
          await this.isInsufficientBalanceForSwap(),
          "Insufficient balance for the swap!"
        ).toBeFalsy();
        console.log("Swap and Sign now..");
        await expect(this.swapBtn, "Swap button is disabled!").toBeEnabled({
          timeout: this.buySellTimeout,
        });

        // IMPORTANT: Start listening for transaction success BEFORE any UI interactions
        // This ensures we don't miss immediate confirmations (1-click trading can be very fast)
        // The promise runs in parallel with subsequent operations to minimize total wait time
        const successPromise = expect(this.trxSuccessful).toBeVisible({
          timeout: 40000,
        });

        await this.swapBtn.click({ timeout: 4000 });

        // Set slippage tolerance if specified (after swap clicked, before confirm)
        if (slippagePercent) {
          await this.setSlippageTolerance(slippagePercent);
        }

        await this.confirmSwapBtn.click({ timeout: 5000 });
        await this.justApproveIfNeeded(context);

        // Successfully submitted! Now wait for transaction success
        if (attempt > 0) {
          console.log(
            `✓ Swap transaction submitted after ${attempt} retry(ies)`
          );
        }

        // IMPORTANT: Wait for actual blockchain confirmation instead of arbitrary timeout
        // This ensures transaction is actually confirmed on-chain (or fails) before proceeding
        // Each retry gets a fresh 40s timeout to avoid timeout exhaustion
        await successPromise;

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

          // Wait for quote/route to finish refreshing
          await this.page.waitForTimeout(1500);

          // Log exchange rate to see if it changed
          const rate = await this.getExchangeRate().catch(() => "N/A");
          console.log(`Exchange rate after wait: ${rate}`);

          continue; // Retry
        }

        // Final attempt failed or different error - throw it
        throw error;
      }
    }
  }
}
