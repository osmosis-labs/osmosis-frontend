/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, expect, Locator, Page } from "@playwright/test";

import { BasePage } from "~/e2e/pages/base-page";

export class TransactionsPage extends BasePage {
  readonly transactionRow: Locator;
  readonly viewExplorerLink: Locator;
  readonly closeTransactionBtn: Locator;
  readonly page: Page;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.transactionRow = page.locator('//div/p[.="Swapped"]');
    this.viewExplorerLink = page.locator('//a/span["View on explorer"]/..');
    this.closeTransactionBtn = page.getByLabel("Close").nth(1);
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
    await this.page.locator(cancelBtn).click();
    const pageApprove = context.waitForEvent("page");
    const approvePage = await pageApprove;
    await approvePage.waitForLoadState();
    const approvePageTitle = approvePage.url();
    console.log("Approve page is opened at: " + approvePageTitle);
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
    await this.page.waitForTimeout(2000);
  }

  async viewFilledByLimitPrice(price: any) {
    const loc = `//td//span[.='Filled']/../../..//td//p[.='$${price}']`;
    console.log("Use Limit Order locator: " + loc);
    await expect(this.page.locator(loc).first()).toBeVisible({
      timeout: 90000,
      visible: true,
    });
  }
}
