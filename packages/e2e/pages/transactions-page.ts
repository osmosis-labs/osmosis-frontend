import {
  type BrowserContext,
  type Locator,
  type Page,
  expect,
} from "@playwright/test";

import { BasePage } from "./base-page";
const TRANSACTION_CONFIRMATION_TIMEOUT = 2000;

export class TransactionsPage extends BasePage {
  readonly transactionRow: Locator;
  readonly viewExplorerLink: Locator;
  readonly closeTransactionBtn: Locator;
  readonly page: Page;
  readonly claimAndClose: Locator;
  readonly claimAllBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.transactionRow = page.locator('//div/p[.="Swapped"]');
    this.viewExplorerLink = page.locator('//a/span["View on explorer"]/..');
    this.closeTransactionBtn = page.locator('//button[@data-testid="close"]');
    this.claimAndClose = page.getByRole("button", {
      name: "Claim and close",
      exact: true,
    });
    this.claimAllBtn = page.getByRole("button", {
      name: "Claim all",
      exact: true,
    });
  }

  async open() {
    await this.page.goto("/transactions");
    return this;
  }

  async viewTransactionByNumber(number: number) {
    await this.transactionRow.nth(number).click();
    await this.page.waitForTimeout(1000);
  }

  async viewBySwapAmount(amount: string | number) {
    // Transactions need some time to get loaded, wait for 30 seconds.
    await this.page.waitForTimeout(30000);
    await this.page.reload();
    const loc = `//div/div[@class="subtitle1 text-osmoverse-100" and contains(text(), "${amount}")]`;
    const isTransactionVisible = await this.page
      .locator(loc)
      .isVisible({ timeout: 3000 });
    if (!isTransactionVisible) {
      await this.page.waitForTimeout(30000);
      await this.page.reload();
    }
    await this.page.waitForTimeout(1000);
    await this.page.locator(loc).click({ timeout: 3000 });
  }

  async closeTransaction() {
    await this.closeTransactionBtn.click();
  }

  async viewOnExplorerIsVisible() {
    await expect(this.viewExplorerLink).toBeVisible();
  }

  async getOnExplorerLink() {
    const trxUrl = await this.viewExplorerLink.getAttribute("href");
    console.log(`Trx url: ${trxUrl}`);
    return trxUrl;
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `screenshot-transactions-${name}.png`,
      fullPage: true,
    });
  }

  /**
   * Cancels a limit order by locating and clicking the cancel button, then approving in Keplr.
   * Automatically waits for transaction confirmation on blockchain.
   *
   * @param amount - The order amount to locate (e.g., "Sell $1.01 of")
   * @param price - The limit price to locate (e.g., "5.234")
   * @param context - Browser context to handle Keplr popup window
   *
   * @remarks
   * - Locates cancel button using xpath with amount and price selectors
   * - Checks button visibility first to fail fast if not found (avoids hanging promises)
   * - Starts success listener BEFORE clicking to catch immediate confirmations (1-click trading)
   * - Waits for Keplr approval popup with 20s timeout (gracefully handles 1-click scenarios)
   * - Validates that the transaction message contains 'cancel_limit'
   * - Waits for actual blockchain confirmation (40s timeout) instead of arbitrary delays
   */
  async cancelLimitOrder(
    amount: string,
    price: string,
    context: BrowserContext
  ) {
    const cancelBtn = `//td//span[.='${amount}']/../../../../..//td//p[.='$${price}']/../../..//button`;
    console.log(`Use locator for a cancel btn: ${cancelBtn}`);

    // IMPORTANT: Check button exists first before starting success listener
    // This prevents hanging promises if button is not found (fail-fast pattern)
    const cancelBtnLocator = this.page.locator(cancelBtn).first();
    await expect(cancelBtnLocator, "Cancel button not found!").toBeVisible({
      timeout: 5000,
    });

    // IMPORTANT: Start listening for transaction success BEFORE clicking cancel button
    // This ensures we don't miss immediate confirmations (1-click trading can be very fast)
    // The promise runs in parallel with subsequent operations to minimize total wait time
    const successPromise = expect(
      this.page.getByText("Transaction Successful")
    ).toBeVisible({
      timeout: 40000,
    });

    await cancelBtnLocator.click();

    // IMPORTANT: waitForEvent MUST have a timeout to prevent hanging indefinitely
    // If Keplr popup doesn't appear (1-click trading enabled), this will timeout gracefully
    const pageApprovePromise = context.waitForEvent("page", {
      timeout: 20000,
    });

    try {
      const approvePage = await pageApprovePromise;
      await approvePage.waitForLoadState();
      const approveBtn = approvePage.getByRole("button", {
        name: "Approve",
      });
      await expect(approveBtn).toBeEnabled();
      const msgContentAmount = await approvePage
        .getByText("Execute contract")
        .textContent();
      console.log(`Wallet is approving this msg: \n${msgContentAmount}`);
      // Approve trx
      await approveBtn.click();
      // Expect that this is a cancel limit call
      expect(msgContentAmount).toContain("cancel_limit");
    } catch (error: any) {
      // IMPORTANT: Gracefully handle timeout errors for 1-click trading scenarios
      // When 1-click trading is enabled, no Keplr popup appears and waitForEvent times out
      // This is expected behavior, not an error - transaction is still submitted on-chain
      if (
        error.name === "TimeoutError" ||
        error.message?.includes("Timeout") ||
        error.message?.includes("timeout")
      ) {
        console.log(
          "✓ Keplr approval popup did not appear within 20s for cancel operation; assuming 1-click trading is enabled or transaction was pre-approved."
        );
      } else {
        // Other errors (button not found, page closed, etc.) should fail the test
        console.error(
          "Failed to get Keplr approval popup for cancel:",
          error.message ?? "Unknown error"
        );
        throw error;
      }
    }

    // IMPORTANT: Wait for actual blockchain confirmation instead of arbitrary timeout
    // This ensures transaction is actually confirmed on-chain (or fails) before proceeding
    // Replaces old pattern: await this.page.waitForTimeout(2000)
    await successPromise;
  }

  async isFilledByLimitPrice(price: string | number) {
    const loc = `//td//span[.='Filled']/../../..//td//p[.='$${price}']`;
    console.log(`Use Limit Order locator: ${loc}`);
    await expect(this.page.locator(loc).first()).toBeVisible({
      timeout: 120_000,
      visible: true,
    });
  }

  async claimAndCloseAny(context: BrowserContext) {
    const isClaimable = await this.claimAndClose
      .first()
      .isVisible({ timeout: 3000 });
    if (!isClaimable) {
      console.log("No partially filled orders to claim.");
      return;
    }

    // IMPORTANT: Start listening for transaction success BEFORE clicking button
    // This ensures we don't miss immediate confirmations (1-click trading can be very fast)
    // The promise runs in parallel with subsequent operations to minimize total wait time
    const successPromise = expect(
      this.page.getByText("Transaction Successful")
    ).toBeVisible({
      timeout: 40000,
    });

    await this.claimAndClose.first().click();

    // IMPORTANT: waitForEvent MUST have a timeout to prevent hanging indefinitely
    // If Keplr popup doesn't appear (1-click trading enabled), this will timeout gracefully
    const pageApprovePromise = context.waitForEvent("page", {
      timeout: 20000,
    });

    try {
      const approvePage = await pageApprovePromise;
      await approvePage.waitForLoadState();
      const approveBtn = approvePage.getByRole("button", {
        name: "Approve",
      });
      await expect(approveBtn).toBeEnabled();
      const msgContentAmount1 = await approvePage
        .getByText("Execute contract")
        .first()
        .textContent();
      const msgContentAmount2 = await approvePage
        .getByText("Execute contract")
        .last()
        .textContent();
      console.log(
        `Wallet is approving this msg: \n${msgContentAmount1}---- \n${msgContentAmount2}`
      );
      // Approve trx
      await approveBtn.click();
      expect(msgContentAmount1).toContain("claim_limit");
      expect(msgContentAmount2).toContain("cancel_limit");
    } catch (error: any) {
      // IMPORTANT: Gracefully handle timeout errors for 1-click trading scenarios
      // When 1-click trading is enabled, no Keplr popup appears and waitForEvent times out
      // This is expected behavior, not an error - transaction is still submitted on-chain
      if (
        error.name === "TimeoutError" ||
        error.message?.includes("Timeout") ||
        error.message?.includes("timeout")
      ) {
        console.log(
          "✓ Keplr approval popup did not appear within 20s for claim and close; assuming 1-click trading is enabled or transaction was pre-approved."
        );
      } else {
        // Other errors (button not found, page closed, etc.) should fail the test
        console.error(
          "Failed to get Keplr approval popup for claim and close:",
          error.message ?? "Unknown error"
        );
        throw error;
      }
    }

    // IMPORTANT: Wait for actual blockchain confirmation instead of arbitrary timeout
    // This ensures transaction is actually confirmed on-chain (or fails) before proceeding
    // Replaces old pattern: await this.page.waitForTimeout(TRANSACTION_CONFIRMATION_TIMEOUT)
    await successPromise;
  }

  async claimAll(context: BrowserContext) {
    // IMPORTANT: Start listening for transaction success BEFORE clicking button
    // This ensures we don't miss immediate confirmations (1-click trading can be very fast)
    // The promise runs in parallel with subsequent operations to minimize total wait time
    const successPromise = expect(
      this.page.getByText("Transaction Successful")
    ).toBeVisible({
      timeout: 40000,
    });

    await this.claimAllBtn.click();

    // IMPORTANT: waitForEvent MUST have a timeout to prevent hanging indefinitely
    // If Keplr popup doesn't appear (1-click trading enabled), this will timeout gracefully
    const pageApprovePromise = context.waitForEvent("page", {
      timeout: 20000,
    });

    try {
      const approvePage = await pageApprovePromise;
      await approvePage.waitForLoadState();
      const approveBtn = approvePage.getByRole("button", {
        name: "Approve",
      });
      await expect(approveBtn).toBeEnabled();
      // Approve trx
      await approveBtn.click();
    } catch (error: any) {
      // IMPORTANT: Gracefully handle timeout errors for 1-click trading scenarios
      // When 1-click trading is enabled, no Keplr popup appears and waitForEvent times out
      // This is expected behavior, not an error - transaction is still submitted on-chain
      if (
        error.name === "TimeoutError" ||
        error.message?.includes("Timeout") ||
        error.message?.includes("timeout")
      ) {
        console.log(
          "✓ Keplr approval popup did not appear within 20s for claim all; assuming 1-click trading is enabled or transaction was pre-approved."
        );
      } else {
        // Other errors (button not found, page closed, etc.) should fail the test
        console.error(
          "Failed to get Keplr approval popup for claim all:",
          error.message ?? "Unknown error"
        );
        throw error;
      }
    }

    // IMPORTANT: Wait for actual blockchain confirmation instead of arbitrary timeout
    // This ensures transaction is actually confirmed on-chain (or fails) before proceeding
    // Replaces old pattern: await this.page.waitForTimeout(TRANSACTION_CONFIRMATION_TIMEOUT)
    await successPromise;
  }

  async claimAllIfPresent(context: BrowserContext) {
    const isClaimable = await this.claimAllBtn.isVisible({ timeout: 4000 });
    if (isClaimable) {
      console.log("Claim All filled limit orders!");
      await this.claimAll(context);
    } else {
      console.log("No Claim All button.");
    }
  }
}
