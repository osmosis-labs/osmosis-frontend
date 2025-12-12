/* eslint-disable import/no-extraneous-dependencies */
import { expect, type Locator, type Page } from "@playwright/test";

import { BasePage } from "./base-page";

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
    // Wait for pools link to be visible instead of fixed timeout
    await expect(this.poolsLink).toBeVisible({ timeout: 5000 });
    await this.poolsLink.click();
    // Wait for pools table to load instead of fixed timeout
    // 1464 is an OSMO/USDC pool - use it as indicator that pools are loaded
    const locRows = '//tr/td/a[contains(@href, "pool/1464")]/../..';
    await expect(this.page.locator(locRows)).toBeVisible({ timeout: 10000 });
    await super.printUrl();
  }

  async viewPool(id: number, pair: string) {
    // Navigate directly to the pool page URL
    // Click-based navigation is unreliable due to nested links and client-side routing
    console.log(`[DEBUG] viewPool: navigating to pool ${id} (${pair})`);
    
    await this.page.goto(`/pool/${id}`);
    
    // Wait for pool page content to load
    const poolPage = new PoolPage(this.page);
    await expect(poolPage.tradeBtn).toBeVisible({ timeout: 15000 });
    console.log(`[DEBUG] viewPool: pool page loaded at ${this.page.url()}`);
    
    await super.printUrl();
    return poolPage;
  }

  async searchForPool(poolName: string) {
    await this.searchInput.fill(poolName);
    // Wait for search results to appear instead of fixed timeout
    const poolRowLocator = '//tr/td//a[contains(@href, "/pool/")]/../..';
    await expect(this.page.locator(poolRowLocator).first()).toBeVisible({
      timeout: 5000,
    });
    console.log(`[DEBUG] searchForPool: found results for "${poolName}"`);
  }

  async getPoolsNumber() {
    const loc = '//tr/td//a[contains(@href, "/pool/")]/../..';
    const num = await this.page.locator(loc).count();
    console.log(`Pools Count: ${num}`);
    return num;
  }

  async getTopTenPoolsByLiquidity() {
    const loc = '//tr/td//a[contains(@href, "/pool/")]/../..';
    const liquidityList = [];
    for (let i = 0; i < 10; i++) {
      const tt = this.page.locator(loc).nth(i).locator("//td").nth(2);
      const text: string = await tt.innerText();
      const n: number = Number(text.replace(/[^0-9.-]+/g, ""));
      liquidityList.push(n);
    }
    console.log(`Top 10 pools Liquidity: ${liquidityList}`);
    return liquidityList;
  }

  async getTopTenPoolsByVolume() {
    const loc = '//tr/td//a[contains(@href, "/pool/")]/../..';
    const volumeList = [];
    for (let i = 0; i < 10; i++) {
      const tt = this.page.locator(loc).nth(i).locator("//td").nth(1);
      const text: string = await tt.innerText();
      const n: number = Number(text.replace(/[^0-9.-]+/g, ""));
      volumeList.push(n);
    }
    console.log(`Top 10 pools Volume: ${volumeList}`);
    return volumeList;
  }

  async getTopTenPoolsByAPR() {
    const loc = '//tr/td//a[contains(@href, "/pool/")]/../..';
    const aprList = [];
    for (let i = 0; i < 10; i++) {
      const tt = this.page.locator(loc).nth(i).locator("//td").nth(3);
      const text: string = await tt.innerText();
      aprList.push(text);
    }
    console.log(`Top 10 pools APRs: ${aprList}`);
    return aprList;
  }
}
