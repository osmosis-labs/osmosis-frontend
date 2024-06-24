/* eslint-disable import/no-extraneous-dependencies */
import { Locator, Page } from "@playwright/test";

import { BasePage } from "~/e2e/pages/base-page";

export class PortfolioPage extends BasePage {
  readonly page: Page;
  readonly hideZeros: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.hideZeros = page.locator(
      '//label[.="Hide zero balances"]/following-sibling::button'
    );
  }

  async goto() {
    await this.page.goto("/portfolio");
    // we expect that after 2 seconds tokens are loaded and any failure after this point should be considered a bug.
    await this.page.waitForTimeout(2000);
    const currentUrl = this.page.url();
    console.log("FE opened at: " + currentUrl);
  }

  async hideZeroBalances() {
    await this.hideZeros.click();
    await this.page.waitForTimeout(1000);
  }

  async getBalanceFor(token: string) {
    const bal = this.page
      .locator(`//tbody/tr//a[@href="/assets/${token}"]`)
      .nth(1);
    let tokenBalance: string = await bal.innerText();
    console.log(`Balance for ${token}: ${tokenBalance}`);
    return tokenBalance;
  }
}
