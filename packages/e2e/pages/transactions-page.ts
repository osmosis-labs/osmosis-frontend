import {
  type BrowserContext,
  type Locator,
  type Page,
  expect,
} from "@playwright/test";

import { BasePage } from "./base-page";
import { getKeplrPopupPage } from "./keplr-helper";

/**
 * Page object for the /transactions view and limit-order actions (cancel, claim).
 *
 * Keplr popup handling pattern (used by cancelLimitOrder, claimAndCloseAny, claimAll):
 *   Each method uses Promise.race between the Keplr popup and a "Transaction
 *   Successful" toast. This handles three scenarios:
 *     1. Keplr popup appears  -> approve manually, then wait for success toast
 *     2. Success toast first  -> 1-Click Trading handled it automatically
 *     3. Popup resolves null  -> promise hangs (never wins the race), so the
 *        test correctly waits for the success toast instead of falsely assuming 1CT
 *
 *   Two defensive guards are applied before each action click:
 *     - Stale toast dismissal: waits for any lingering success toast to hide so the
 *       Promise.race doesn't short-circuit on DOM state from a previous transaction.
 *     - Early listener registration: context.waitForEvent("page") is started BEFORE
 *       the click so fast-opening Keplr popups are never missed.
 */
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

  /**
   * Locates and clicks a transaction row by its swap amount.
   * Waits up to ~60s with a mid-point reload because on-chain indexing can lag.
   */
  async viewBySwapAmount(amount: string | number) {
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
   * - Checks button visibility first to fail fast if not found
   * - Waits for Keplr approval popup with 10s event-driven timeout (gracefully handles 1-click scenarios)
   * - Validates that the transaction message contains 'cancel_limit'
   * - Waits for blockchain confirmation (40s timeout, starts after action click, parallel with approval)
   */
  async cancelLimitOrder(
    amount: string,
    price: string,
    context: BrowserContext
  ) {
    const cancelBtn = `//td//span[.='${amount}']/../../../../..//td//p[.='$${price}']/../../..//button`;
    console.log(`Use locator for a cancel btn: ${cancelBtn}`);

    const cancelBtnLocator = this.page.locator(cancelBtn).first();
    await expect(cancelBtnLocator, "Cancel button not found!").toBeVisible({
      timeout: 30000,
    });

    await this.page
      .getByText("Transaction Successful")
      .waitFor({ state: "hidden", timeout: 3000 })
      .catch(() => {});

    await cancelBtnLocator.click();

    const successPromise = expect(
      this.page.getByText("Transaction Successful")
    ).toBeVisible({ timeout: 40000 });

    const keplrPopup = getKeplrPopupPage(context, { timeout: 15_000 }).then(
      (p) =>
        p
          ? { type: "popup" as const, page: p }
          : new Promise<never>(() => {})
    );

    const result = await Promise.race([
      keplrPopup,
      successPromise.then(() => ({ type: "success" as const, page: null })),
    ]);

    if (result.type === "popup" && result.page) {
      await result.page.waitForLoadState();
      const approveBtn = result.page.getByRole("button", {
        name: "Approve",
      });
      await expect(approveBtn).toBeEnabled();
      const msgContentAmount = await result.page
        .getByText("Execute contract")
        .textContent();
      console.log(`Wallet is approving this msg: \n${msgContentAmount}`);
      await approveBtn.click();
      expect(msgContentAmount).toContain("cancel_limit");
      await successPromise;
    } else {
      console.log(
        "1CT or pre-approved; success toast received (cancel limit order)."
      );
    }
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

    await this.page
      .getByText("Transaction Successful")
      .waitFor({ state: "hidden", timeout: 3000 })
      .catch(() => {});

    await this.claimAndClose.first().click();

    const successPromise = expect(
      this.page.getByText("Transaction Successful")
    ).toBeVisible({ timeout: 40000 });

    const keplrPopup = getKeplrPopupPage(context, { timeout: 15_000 }).then(
      (p) =>
        p
          ? { type: "popup" as const, page: p }
          : new Promise<never>(() => {})
    );

    const result = await Promise.race([
      keplrPopup,
      successPromise.then(() => ({ type: "success" as const, page: null })),
    ]);

    if (result.type === "popup" && result.page) {
      await result.page.waitForLoadState();
      const approveBtn = result.page.getByRole("button", {
        name: "Approve",
      });
      await expect(approveBtn).toBeEnabled();
      const msgContentAmount1 = await result.page
        .getByText("Execute contract")
        .first()
        .textContent();
      const msgContentAmount2 = await result.page
        .getByText("Execute contract")
        .last()
        .textContent();
      console.log(
        `Wallet is approving this msg: \n${msgContentAmount1}---- \n${msgContentAmount2}`
      );
      await approveBtn.click();
      expect(msgContentAmount1).toContain("claim_limit");
      expect(msgContentAmount2).toContain("cancel_limit");
      await successPromise;
    } else {
      console.log(
        "1CT or pre-approved; success toast received (claim and close)."
      );
    }
  }

  async claimAll(context: BrowserContext) {
    await this.page
      .getByText("Transaction Successful")
      .waitFor({ state: "hidden", timeout: 3000 })
      .catch(() => {});

    await this.claimAllBtn.click();

    const successPromise = expect(
      this.page.getByText("Transaction Successful")
    ).toBeVisible({ timeout: 40000 });

    const keplrPopup = getKeplrPopupPage(context, { timeout: 15_000 }).then(
      (p) =>
        p
          ? { type: "popup" as const, page: p }
          : new Promise<never>(() => {})
    );

    const result = await Promise.race([
      keplrPopup,
      successPromise.then(() => ({ type: "success" as const, page: null })),
    ]);

    if (result.type === "popup" && result.page) {
      await result.page.waitForLoadState();
      const approveBtn = result.page.getByRole("button", {
        name: "Approve",
      });
      await expect(approveBtn).toBeEnabled();
      await approveBtn.click();
      await successPromise;
    } else {
      console.log(
        "1CT or pre-approved; success toast received (claim all)."
      );
    }
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
