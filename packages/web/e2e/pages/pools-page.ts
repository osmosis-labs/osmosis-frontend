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

  async getPoolsNumber() {
    const loc = '//tr/td//a[contains(@href, "/pool/")]/../..';
    const num = await this.page.locator(loc).count();
    console.log("Pools Count: " + num);
    return num;
  }

  async getTopTenLiquidity() {
    const loc = '//tr/td//a[contains(@href, "/pool/")]/../..';
    let liquidityList = [];
    for (let i = 0; i < 10; i++) {
      let tt = this.page.locator(loc).nth(i).locator("//td").nth(2);
      let text: string = await tt.innerText();
      let n: number = Number(text.replace(/[^0-9.-]+/g, ""));
      liquidityList.push(n);
    }
    console.log("Top 10 pools Liquidity: " + liquidityList);
    return liquidityList;
  }
}
