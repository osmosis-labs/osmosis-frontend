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
      timeout: 5000,
    });

    await cancelBtnLocator.click();

    const successPromise = expect(
      this.page.getByText("Transaction Successful")
    ).toBeVisible({ timeout: 40000 });

    let approvePage: Page | null =
      context.pages().find((p) => p !== this.page && !p.isClosed()) ?? null;

    if (!approvePage) {
      try {
        approvePage = await context.waitForEvent("page", { timeout: 10000 });
      } catch (error: any) {
        if (
          error.name === "TimeoutError" ||
          /timeout/i.test(error.message ?? "")
        ) {
          console.log(
            "Keplr popup did not appear within 10s for cancel; assuming 1-click trading."
          );
        } else {
          throw error;
        }
      }
    }

    if (approvePage) {
      await approvePage.waitForLoadState();
      const approveBtn = approvePage.getByRole("button", {
        name: "Approve",
      });
      await expect(approveBtn).toBeEnabled();
      const msgContentAmount = await approvePage
        .getByText("Execute contract")
        .textContent();
      console.log(`Wallet is approving this msg: \n${msgContentAmount}`);
      await approveBtn.click();
      expect(msgContentAmount).toContain("cancel_limit");
    }

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

    await this.claimAndClose.first().click();

    const successPromise = expect(
      this.page.getByText("Transaction Successful")
    ).toBeVisible({ timeout: 40000 });

    let approvePage: Page | null =
      context.pages().find((p) => p !== this.page && !p.isClosed()) ?? null;

    if (!approvePage) {
      try {
        approvePage = await context.waitForEvent("page", { timeout: 10000 });
      } catch (error: any) {
        if (
          error.name === "TimeoutError" ||
          /timeout/i.test(error.message ?? "")
        ) {
          console.log(
            "Keplr popup did not appear within 10s for claim and close; assuming 1-click trading."
          );
        } else {
          throw error;
        }
      }
    }

    if (approvePage) {
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
      await approveBtn.click();
      expect(msgContentAmount1).toContain("claim_limit");
      expect(msgContentAmount2).toContain("cancel_limit");
    }

    await successPromise;
  }

  async claimAll(context: BrowserContext) {
    await this.claimAllBtn.click();

    const successPromise = expect(
      this.page.getByText("Transaction Successful")
    ).toBeVisible({ timeout: 40000 });

    let approvePage: Page | null =
      context.pages().find((p) => p !== this.page && !p.isClosed()) ?? null;

    if (!approvePage) {
      try {
        approvePage = await context.waitForEvent("page", { timeout: 10000 });
      } catch (error: any) {
        if (
          error.name === "TimeoutError" ||
          /timeout/i.test(error.message ?? "")
        ) {
          console.log(
            "Keplr popup did not appear within 10s for claim all; assuming 1-click trading."
          );
        } else {
          throw error;
        }
      }
    }

    if (approvePage) {
      await approvePage.waitForLoadState();
      const approveBtn = approvePage.getByRole("button", {
        name: "Approve",
      });
      await expect(approveBtn).toBeEnabled();
      await approveBtn.click();
    }

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
