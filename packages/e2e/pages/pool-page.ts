/* eslint-disable import/no-extraneous-dependencies */
import { expect, type Locator, type Page } from "@playwright/test";

import { BasePage } from "./base-page";

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
    const totalBalance: string = await this.balance.innerText();
    console.log(`Total Balance for a Pool [${totalBalance}]`);
    return totalBalance;
  }

  async getTradeModal() {
    await this.tradeBtn.click();
    // Wait for swap input to be visible to ensure modal is open
    const swapPage = new SwapPage(this.page);
    await expect(swapPage.swapInput).toBeVisible({ timeout: 5000 });
    return swapPage;
  }
}
