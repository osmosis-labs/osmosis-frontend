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
    await newPage.waitForLoadState("load", { timeout: 10000 });
    const pageTitle = await newPage.title();
    console.log("Title of the new page: " + pageTitle);
    await newPage.getByRole("button", { name: "Approve" }).click();
    // PopUp page is auto-closed
    // Handle Pop-up page <-
    const wallet = this.page.locator("//button/div/span[@title]");
    await this.page.waitForTimeout(4000);
    // Verify that wallet modal loaded correctly
    const isWalletVisible = await wallet.isVisible({ timeout: 5000 });
    expect(isWalletVisible).toBeTruthy();
    console.log("Wallet is connected.");
  }

  async gotoPortfolio() {
    await this.portfolioLink.click();
    // we expect that after 2 seconds tokens are loaded and any failure after this point should be considered a bug.
    await this.page.waitForTimeout(2000);
    await this.printUrl();
  }

  async gotoPools() {
    await this.poolsLink.click();
  }

  async printUrl() {
    const currentUrl = this.page.url();
    console.log("FE opened at: " + currentUrl);
  }
}
