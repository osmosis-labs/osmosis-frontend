/* eslint-disable import/no-extraneous-dependencies */
import { Locator, Page } from "@playwright/test";

import { BasePage } from "~/e2e/pages/base-page";

import { SwapPage } from "./swap-page";

export class PoolPage extends BasePage {
  readonly page: Page;
  readonly viewMore: Locator;
  readonly poolsLink: Locator;
  readonly balance: Locator;
  readonly tradeBtn: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.viewMore = page.getByText("View more");
    this.poolsLink = page.locator('//a//div[contains(text(), "Pools")]');
    this.balance = page.locator(
      '//span[.="Total balance"]/..//h4[contains(@class, "text-osmoverse-100")]'
    );
    this.tradeBtn = page.locator('//button/span[.="Trade Pair"]');
  }

  async getBalance() {
    let totalBalance: string = await this.balance.innerText();
    console.log(`Total Balance for a Pool [${totalBalance}]`);
    return totalBalance;
  }

  async getTradeModal() {
    await this.tradeBtn.click();
    return new SwapPage(this.page);
  }
}
