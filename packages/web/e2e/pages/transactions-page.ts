/* eslint-disable import/no-extraneous-dependencies */
import { expect, Locator, Page } from "@playwright/test";

import { BasePage } from "~/e2e/pages/base-page";

export class TransactionsPage extends BasePage {
  readonly transactionRow: Locator;
  readonly viewExplorerLink: Locator;
  readonly closeTransactionBtn: Locator;

  constructor(page: Page) {
    super(page);
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
}
