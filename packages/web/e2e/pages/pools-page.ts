/* eslint-disable import/no-extraneous-dependencies */
import { Locator, Page } from "@playwright/test";

import { BasePage } from "~/e2e/pages/base-page";

import { PoolPage } from "./pool-page";

export class PoolsPage extends BasePage {
  readonly page: Page;
  readonly viewMore: Locator;
  readonly poolsLink: Locator;
  readonly balance: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.viewMore = page.getByText("View more");
    this.poolsLink = page.locator('//a//div[contains(text(), "Pools")]');
    this.balance = page.locator(
      '//span[.="Total balance"]/..//h4[contains(@class, "text-osmoverse-100")]'
    );
    this.searchInput = page.locator('//input[@id="search-input"]');
  }

  async goto() {
    await this.page.goto("/");
    await this.page.waitForTimeout(2000);
    await this.poolsLink.click();
    // we expect that after 4 seconds tokens are loaded and any failure after this point should be considered a bug.
    await this.page.waitForTimeout(4000);
    await super.printUrl();
  }

  async viewPool(id: number, pair: string) {
    await this.page
      .locator(`//table//td/a[@href="/pool/${id}"]//span[.="${pair}"]`)
      .click();
    // we expect that after 2 seconds tokens are loaded and any failure after this point should be considered a bug.
    await this.page.waitForTimeout(2000);
    await super.printUrl();
    return new PoolPage(this.page);
  }

  async searchForPool(poolName: string) {
    await this.searchInput.fill(poolName);
    // we expect that after 2 seconds tokens are loaded and any failure after this point should be considered a bug.
    await this.page.waitForTimeout(2000);
  }
}
