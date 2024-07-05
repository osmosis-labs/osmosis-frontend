/* eslint-disable import/no-extraneous-dependencies */
import { expect, Locator, Page } from "@playwright/test";

export class BasePage {
  readonly page: Page;
  readonly connectWalletBtn: Locator;
  readonly kepltWalletBtn: Locator;
  readonly portfolioLink: Locator;
  readonly poolsLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.connectWalletBtn = page
      .getByRole("button", { name: "Connect wallet", exact: true })
      .first();
    this.kepltWalletBtn = page.locator("button").filter({ hasText: /^Keplr$/ });
    this.portfolioLink = page.getByText("Portfolio");
    this.poolsLink = page.getByText("Pools");
  }

  async connectWallet() {
    await this.connectWalletBtn.click();
    // This is needed to handle a wallet popup
    const pagePromise = this.page.context().waitForEvent("page");
    await this.kepltWalletBtn.click();
    await this.page.waitForTimeout(1000);
    // Handle Pop-up page ->
    const newPage = await pagePromise;
    await newPage.waitForLoadState();
    const pageTitle = await newPage.title();
    console.log("Title of the new page: " + pageTitle);
    await newPage.getByRole("button", { name: "Approve" }).click();
    // PopUp page is auto-closed
    // Handle Pop-up page <-
    const wallet = this.page.locator(
      '//button//span[contains(text(), "osmo")]'
    );
    await this.page.waitForTimeout(2000);
    expect(wallet).toBeTruthy();
    console.log("Wallet is connected.");
  }

  async gotoPortfolio() {
    await this.portfolioLink.click();
  }

  async gotoPools() {
    await this.portfolioLink.click();
  }

  async printUrl() {
    const currentUrl = this.page.url();
    console.log("FE opened at: " + currentUrl);
  }
}
