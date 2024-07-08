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
    this.viewExplorerLink = page.locator('//a/span["View on explorer"]');
    this.closeTransactionBtn = page.locator('//button[@aria-label="Close"]');
  }

  async viewTransactionByNumber(number: number) {
    await this.transactionRow.nth(number).click();
    await this.page.waitForTimeout(1000);
  }

  async closeTransaction() {
    await this.closeTransactionBtn.click();
  }

  async viewOnExplorerIsVisible() {
    expect(this.viewExplorerLink.isVisible).toBeTruthy();
  }
}
