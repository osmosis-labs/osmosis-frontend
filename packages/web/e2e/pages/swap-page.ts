/* eslint-disable import/no-extraneous-dependencies */
import { expect, Locator, Page } from "@playwright/test";

export class SwapPage {
  readonly page: Page;
  readonly connectWalletBtn: Locator;
  readonly swapBtn: Locator;
  readonly swapHalfBtn: Locator;
  readonly swapMaxBtn: Locator;
  readonly swapInput: Locator;
  readonly kepltWalletBtn: Locator;
  readonly flipAssetsBtn: Locator;
  readonly exchangeRate: Locator;
  readonly trxSuccessful: Locator;
  readonly trxBroadcasting: Locator;

  constructor(page: Page) {
    this.page = page;
    this.connectWalletBtn = page
      .getByRole("button", { name: "Connect wallet", exact: true })
      .first();
    this.swapBtn = page.getByRole("button", { name: "Swap", exact: true });
    this.swapHalfBtn = page.getByRole("button", { name: "HALF", exact: true });
    this.swapMaxBtn = page.getByRole("button", { name: "MAX", exact: true });
    this.swapInput = page.locator('input[type="number"]');
    this.kepltWalletBtn = page.locator("button").filter({ hasText: /^Keplr$/ });
    this.flipAssetsBtn = page.locator(
      '//div/button[contains(@class, "ease-bounce")]'
    );
    this.exchangeRate = page.locator('//span[contains(@class, "subtitle2")]');
    this.trxSuccessful = page.locator('//h6[.="Transaction Succesful"]');
    this.trxBroadcasting = page.locator('//h6[.="Transaction Broadcasting"]');
  }

  async goto() {
    const assetPromise = this.page.waitForRequest("**/assets.json");
    await this.page.goto("/");
    const request = await assetPromise;
    expect(request).toBeTruthy();
    // we expect that after 2 seconds tokens are loaded and any failure after this point should be considered a bug.
    await this.page.waitForTimeout(2000);
  }

  async connectWallet(promise: Promise<Page>) {
    await this.connectWalletBtn.click();
    await this.kepltWalletBtn.click();
    // Handle Pop-up page ->
    const newPage = await promise;
    await newPage.waitForLoadState();
    await newPage.getByRole("button", { name: "Approve" }).click();
    // PopUp page is auto-closed
    // Handle Pop-up page <-
    const wallet = this.page.getByRole("button", {
      name: "Wosmongton profile osmo1k...",
    });
    await this.page.waitForTimeout(2000);
    expect(wallet).toBeTruthy();
    console.log("Wallet is connected.");
  }

  async flipTokenPair() {
    await this.flipAssetsBtn.click();
    await this.page.waitForTimeout(2000);
    console.log("Fliped token pair.");
  }

  async getWalletMsg(promise: Promise<Page>) {
    // Handle Pop-up page ->
    const approvePage = await promise;
    await approvePage.waitForLoadState();
    console.log(approvePage.url());
    const approveBtn = approvePage.getByRole("button", {
      name: "Approve",
    });
    await expect(approveBtn).toBeEnabled();
    const msgContentAmount = await approvePage
      .getByText("type: osmosis/poolmanager/")
      .textContent();
    console.log("Wallet is approving: " + msgContentAmount);
    // Approve trx
    await approveBtn.click();
    // wait for trx confirmation
    await this.page.waitForTimeout(4000);
    //await approvePage.close();
    // Handle Pop-up page <-
    return { msgContentAmount };
  }

  async swap(amount: string) {
    console.log("Swap " + amount);
    await this.swapInput.fill(amount, { timeout: 4000 });
    await this.page.waitForTimeout(2000);
    await expect(this.swapInput).toHaveValue(amount);
    await this.swapBtn.click();
  }

  async selectPair(from: string, to: string) {
    // Filter does not show already selected tokens
    console.log("Select pair " + from + " to " + to);
    const tokenLocator =
      '//img[@alt="token icon"]/../..//h5 | //img[@alt="token icon"]/../..//span[@class="subtitle1"]';
    const fromToken = this.page.locator(tokenLocator).nth(0);
    const toToken = this.page.locator(tokenLocator).nth(1);

    let fromTokenText = await fromToken.innerText();
    let toTokenText = await toToken.innerText();
    console.log("Current pair: " + fromTokenText + " / " + toTokenText);

    if (fromTokenText == from && toTokenText == to) {
      console.log(
        "Current pair:" + fromTokenText + toTokenText + " is already matching."
      );
      return;
    }

    if (fromTokenText == to && toTokenText == from) {
      await this.flipTokenPair();
      console.log(
        "Current pair:" + fromTokenText + toTokenText + " is fliped."
      );
      return;
    }

    if (from == toTokenText || to == fromTokenText) {
      await this.flipTokenPair();
    }

    if (fromTokenText != from && toTokenText != from) {
      await fromToken.click();
      // we expect that after 1 second token filter is displayed.
      await this.page.waitForTimeout(1000);
      await this.page.getByPlaceholder("Search").fill(from);
      const fromLocator = this.page.locator(
        "//div/button[@data-token-id]//h6[.='" + from + "']"
      );
      await fromLocator.click();
    }

    if (toTokenText != to && fromTokenText != to) {
      await toToken.click();
      // we expect that after 1 second token filter is displayed.
      await this.page.waitForTimeout(1000);
      await this.page.getByPlaceholder("Search").fill(to);
      const toLocator = this.page.locator(
        "//div/button[@data-token-id]//h6[.='" + to + "']"
      );
      await toLocator.click();
    }
    // we expect that after 2 seconds exchange rate is populated.
    await this.page.waitForTimeout(2000);
    expect(await this.getExchangeRate()).toContain(from);
    expect(await this.getExchangeRate()).toContain(to);
  }

  async getExchangeRate() {
    return await this.exchangeRate.innerText();
  }

  async isTransactionSuccesful(delay: number = 7) {
    console.log("Wait for a transaction success for 7 seconds.");
    return await this.trxSuccessful.isVisible({ timeout: delay * 1000 });
  }

  async isTransactionBroadcasted(delay: number = 5) {
    console.log("Wait for a transaction broadcasting for 5 seconds.");
    return await this.trxBroadcasting.isVisible({ timeout: delay * 1000 });
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `screenshot-swap-${name}.png`,
      fullPage: true,
    });
  }
}
