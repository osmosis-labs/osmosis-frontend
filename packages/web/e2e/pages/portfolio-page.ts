/* eslint-disable import/no-extraneous-dependencies */
import { Locator, Page } from "@playwright/test";

import { BasePage } from "~/e2e/pages/base-page";
import { TransactionsPage } from "~/e2e/pages/transactions-page";

export class PortfolioPage extends BasePage {
  readonly hideZeros: Locator;
  readonly viewMore: Locator;
  readonly portfolioLink: Locator;
  readonly viewTransactions: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.hideZeros = page.locator(
      '//label[.="Hide zero balances"]/following-sibling::button'
    );
    this.viewMore = page.getByText("View more");
    this.portfolioLink = page.locator(
      '//a//div[contains(text(), "Portfolio")]'
    );
    this.viewTransactions = page.locator('//div/a[.="View all"]');
    this.searchInput = page.locator('//input[@id="search-input"]');
  }

  async goto() {
    await this.page.goto("/");
    await this.portfolioLink.click();
    // we expect that after 2 seconds tokens are loaded and any failure after this point should be considered a bug.
    await this.page.waitForTimeout(2000);
    const currentUrl = this.page.url();
    console.log("FE opened at: " + currentUrl);
  }

  async getBalanceFor(token: string) {
    await this.page.evaluate(() => window.scrollBy(0, 250));
    const bal = this.page
      .locator(`//tbody/tr//a[contains(@href, "/assets/${token}")]`)
      .nth(1);
    let tokenBalance: string = await bal.innerText();
    console.log(`Balance for ${token}: ${tokenBalance}`);
    return tokenBalance;
  }

  async viewTransactionsPage() {
    await this.viewTransactions.click();
    await this.page.waitForTimeout(1000);
    return new TransactionsPage(this.page);
  }

  async hideZeroBalances() {
    const isVisible = await this.hideZeros.isVisible({ timeout: 2000 });
    if (isVisible) {
      await this.hideZeros.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async viewMoreBalances() {
    const isVisible = await this.viewMore.isVisible({ timeout: 2000 });
    if (isVisible) {
      await this.viewMore.click();
      await this.page.waitForTimeout(1000);
    }
  }

  async searchForToken(tokenName: string) {
    await this.searchInput.fill(tokenName);
    // we expect that after 2 seconds tokens are loaded and any failure after this point should be considered a bug.
    await this.page.waitForTimeout(2000);
  }
}
