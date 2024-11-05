/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, expect, Locator, Page } from "@playwright/test";

import { BasePage } from "~/e2e/pages/base-page";
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
    this.closeTransactionBtn = page.locator('//button[@aria-label="Close"]');
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

  async viewBySwapAmount(amount: any) {
    // Transactions need some time to get loaded, wait for 30 seconds.
    await this.page.waitForTimeout(30000);
    await this.page.reload();
    const loc = `//div/div[@class="subtitle1 text-osmoverse-100" and contains(text(), "${amount}")]`;
    let isTransactionVisible = await this.page
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
    expect(this.viewExplorerLink.isVisible).toBeTruthy();
  }

  async getOnExplorerLink() {
    const trxUrl = await this.viewExplorerLink.getAttribute("href");
    console.log("Trx url: " + trxUrl);
    return trxUrl;
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `screenshot-transactions-${name}.png`,
      fullPage: true,
    });
  }

  async cancelLimitOrder(
    amount: string,
    price: string,
    context: BrowserContext
  ) {
    const cancelBtn = `//td//span[.='${amount}']/../../../../..//td//p[.='$${price}']/../../..//button`;
    console.log("Use locator for a cancel btn: " + cancelBtn);
    await this.page.locator(cancelBtn).first().click();
    const pageApprove = context.waitForEvent("page");
    const approvePage = await pageApprove;
    await approvePage.waitForLoadState();
    const approveBtn = approvePage.getByRole("button", {
      name: "Approve",
    });
    await expect(approveBtn).toBeEnabled();
    const msgContentAmount = await approvePage
      .getByText("Execute contract")
      .textContent();
    console.log("Wallet is approving this msg: \n" + msgContentAmount);
    // Approve trx
    await approveBtn.click();
    // Expect that this is a cancel limit call
    expect(msgContentAmount).toContain("cancel_limit");
    // wait for trx confirmation
    await this.page.waitForTimeout(TRANSACTION_CONFIRMATION_TIMEOUT);
  }

  async isFilledByLimitPrice(price: any) {
    const loc = `//td//span[.='Filled']/../../..//td//p[.='$${price}']`;
    console.log("Use Limit Order locator: " + loc);
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
    const pageApprove = context.waitForEvent("page");
    const approvePage = await pageApprove;
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
      "Wallet is approving this msg: \n" +
        msgContentAmount1 +
        "---- \n" +
        msgContentAmount2
    );
    // Approve trx
    await approveBtn.click();
    expect(msgContentAmount1).toContain("claim_limit");
    expect(msgContentAmount2).toContain("cancel_limit");
    // wait for trx confirmation
    await this.page.waitForTimeout(TRANSACTION_CONFIRMATION_TIMEOUT);
  }

  async claimAll(context: BrowserContext) {
    await this.claimAllBtn.click();
    const pageApprove = context.waitForEvent("page");
    const approvePage = await pageApprove;
    await approvePage.waitForLoadState();
    const approveBtn = approvePage.getByRole("button", {
      name: "Approve",
    });
    await expect(approveBtn).toBeEnabled();
    // Approve trx
    await approveBtn.click();
    // wait for trx confirmation
    await this.page.waitForTimeout(TRANSACTION_CONFIRMATION_TIMEOUT);
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
