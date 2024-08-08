/* eslint-disable import/no-extraneous-dependencies */
import { BrowserContext, expect, Locator, Page } from "@playwright/test";

import { BasePage } from "~/e2e/pages/base-page";
import { TransactionsPage } from "~/e2e/pages/transactions-page";

export class TradePage extends BasePage {
  readonly page: Page;
  readonly swapBtn: Locator;
  readonly swapMaxBtn: Locator;
  readonly flipAssetsBtn: Locator;
  readonly exchangeRate: Locator;
  readonly trxSuccessful: Locator;
  readonly trxBroadcasting: Locator;
  readonly trxLink: Locator;
  readonly inputAmount: Locator;
  readonly confirmSwapBtn: Locator;
  readonly buyTabBtn: Locator;
  readonly buyBtn: Locator;
  readonly sellTabBtn: Locator;
  readonly sellBtn: Locator;
  readonly limit10Percent: Locator;
  readonly limit2Percent: Locator;
  readonly limitTabBtn: Locator;
  readonly orderHistoryLink: Locator;
  readonly limitPrice: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.swapBtn = page.locator(
      '//div[@class="flex w-full pb-3"]/button[.="Swap"]'
    );
    this.buyTabBtn = page.locator('//div[@class]/button[.="Buy"]/p[@class]/..');
    this.buyBtn = page.locator('//div[@class]/button[@class]/h6[.="Buy"]/..');
    this.sellBtn = page.locator('//div[@class]/button[@class]/h6[.="Sell"]/..');
    this.sellTabBtn = page.locator(
      '//div[@class]/button[.="Sell"]/p[@class]/..'
    );
    this.confirmSwapBtn = page.locator('//div[@class]/button[.="Confirm"]');
    this.swapMaxBtn = page.getByRole("button", { name: "MAX", exact: true });
    this.flipAssetsBtn = page.locator(
      '//div/button[contains(@class, "ease-bounce")]'
    );
    this.exchangeRate = page.locator(
      '//div[@data-headlessui-state]//span[@class="body2 text-osmoverse-300"]'
    );
    this.trxSuccessful = page.locator('//h6[.="Transaction Succesful"]');
    this.trxLink = page.getByText("View explorer");
    this.trxBroadcasting = page.locator('//h6[.="Transaction Broadcasting"]');
    this.inputAmount = page.locator(
      "//div[contains(@class, 'transiiton-all')]/input[@placeholder]"
    );
    this.limit10Percent = page.locator('//span[@class="body2" and .="10%"]');
    this.limit2Percent = page.locator('//span[@class="body2" and .="2%"]');
    this.limitTabBtn = page.locator('//div[@class="w-full"]/button[.="Limit"]');
    this.orderHistoryLink = page.getByText("Order history");
    this.limitPrice = page.locator("//div/input[@type='text']");
  }

  async goto() {
    const assetPromise = this.page.waitForRequest("**/assets.json");
    await this.page.goto("/");
    const request = await assetPromise;
    expect(request).toBeTruthy();
    // we expect that after 2 seconds tokens are loaded and any failure after this point should be considered a bug.
    await this.page.waitForTimeout(2000);
    const currentUrl = this.page.url();
    console.log("FE opened at: " + currentUrl);
  }

  async gotoOrdersHistory() {
    await this.orderHistoryLink.click();
    await this.page.waitForTimeout(1000);
    return new TransactionsPage(this.page);
  }

  async openBuyTab() {
    await this.buyTabBtn.click();
  }

  async openSellTab() {
    await this.sellTabBtn.click();
  }

  async openLimit() {
    await this.limitTabBtn.click();
    await this.page.waitForTimeout(1000);
  }

  async getLimitPrice() {
    const lp = await this.limitPrice.inputValue();
    console.log("Current limit price is: " + lp);
    return lp;
  }

  async setLimit10PercentChange() {
    await this.limit10Percent.click();
    await this.page.waitForTimeout(1000);
  }

  async setLimit2PercentChange() {
    await this.limit2Percent.click();
    await this.page.waitForTimeout(1000);
  }

  async flipTokenPair() {
    await this.flipAssetsBtn.click();
    await this.page.waitForTimeout(2000);
    console.log("Fliped token pair.");
  }

  async enterAmount(amount: string) {
    // Just enter an amount for the swap and wait for a quote
    await this.inputAmount.fill(amount, { timeout: 2000 });
    await this.page.waitForTimeout(2000);
    await expect(this.inputAmount).toHaveValue(amount, { timeout: 3000 });
    const exchangeRate = await this.getExchangeRate();
    console.log("Swap " + amount + " with rate: " + exchangeRate);
  }

  async swapAndGetWalletMsg(context: BrowserContext) {
    // Make sure to have sufficient balance and swap button is enabled
    expect(
      await this.isInsufficientBalance(),
      "Insufficient balance for the swap!"
    ).toBeFalsy();
    await expect(this.swapBtn).toBeEnabled({ timeout: 7000 });
    // Handle Pop-up page ->
    await this.swapBtn.click();
    const pageApprove = context.waitForEvent("page");
    await this.confirmSwapBtn.click();
    const approvePage = await pageApprove;
    await approvePage.waitForLoadState();
    const approvePageTitle = approvePage.url();
    console.log("Approve page is opened at: " + approvePageTitle);
    const approveBtn = approvePage.getByRole("button", {
      name: "Approve",
    });
    await expect(approveBtn).toBeEnabled();
    const msgContentAmount = await approvePage
      .getByText("type: osmosis/poolmanager/")
      .textContent();
    console.log("Wallet is approving this msg: \n" + msgContentAmount);
    // Approve trx
    await approveBtn.click();
    // wait for trx confirmation
    await this.page.waitForTimeout(4000);
    //await approvePage.close();
    // Handle Pop-up page <-
    return { msgContentAmount };
  }

  async selectAsset(token: string) {
    const tokenLocator = "//div//button[@type]//img[@alt]";
    const fromToken = this.page.locator(tokenLocator).nth(0);
    await fromToken.click();
    // we expect that after 1 second token filter is displayed.
    await this.page.waitForTimeout(1000);
    await this.page.getByPlaceholder("Search").fill(token);
    const fromLocator = this.page.locator(
      "//div/button[@data-testid='token-select-asset']//span[.='" + token + "']"
    );
    await fromLocator.click();
  }

  async selectPair(from: string, to: string) {
    // Filter does not show already selected tokens
    console.log("Select pair " + from + " to " + to);
    const tokenLocator = "//div//button[@type]//img[@alt]";
    const fromToken = this.page.locator(tokenLocator).nth(0);
    const toToken = this.page.locator(tokenLocator).nth(1);

    let fromTokenText = await fromToken.innerText();
    let toTokenText = await toToken.innerText();
    console.log("Current pair: " + fromTokenText + " / " + toTokenText);

    if (fromTokenText == from && toTokenText == to) {
      console.log(
        "Current pair: " + fromTokenText + toTokenText + " is already matching."
      );
      return;
    }

    if (fromTokenText == to && toTokenText == from) {
      await this.flipTokenPair();
      console.log(
        "Current pair: " + fromTokenText + toTokenText + " is fliped."
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
        "//div/button[@data-testid='token-select-asset']//span[.='" +
          from +
          "']"
      );
      await fromLocator.click();
    }

    if (toTokenText != to && fromTokenText != to) {
      await toToken.click();
      // we expect that after 1 second token filter is displayed.
      await this.page.waitForTimeout(1000);
      await this.page.getByPlaceholder("Search").fill(to);
      const toLocator = this.page.locator(
        "//div/button[@data-testid='token-select-asset']//span[.='" + to + "']"
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
    return await this.trxSuccessful.isVisible({
      timeout: delay * 1000,
    });
  }

  async getTransactionUrl() {
    const trxUrl = await this.trxLink.getAttribute("href");
    console.log("Trx url: " + trxUrl);
    return trxUrl;
  }

  async isTransactionBroadcasted(delay: number = 5) {
    console.log("Wait for a transaction broadcasting for 5 seconds.");
    return await this.trxBroadcasting.isVisible({ timeout: delay * 1000 });
  }

  async isInsufficientBalance() {
    const issufBalanceBtn = this.page.locator(
      '//button[.="Insufficient balance"]'
    );
    return await issufBalanceBtn.isVisible({ timeout: 2000 });
  }

  async isError() {
    const errorBtn = this.page.locator('//button[.="Error"]');
    return await errorBtn.isVisible({ timeout: 2000 });
  }

  async showSwapInfo() {
    const swapInfo = this.page.locator("//button//span[.='Show details']");
    await swapInfo.click();
    console.log("Price Impact: " + (await this.getPriceInpact()));
  }

  async getPriceInpact() {
    const priceInpactSpan = this.page.locator(
      '//span[.="Price Impact"]/..//span[@class="text-bullish-400"]'
    );
    return await priceInpactSpan.textContent();
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `screenshot-trade-${name}.png`,
      fullPage: true,
    });
  }

  async getSelectedSwapPair() {
    const tokenLocator = "//div//button[@type]//img[@alt]/../h5";
    const fromToken = this.page.locator(tokenLocator).nth(0);
    const toToken = this.page.locator(tokenLocator).nth(1);
    await expect(fromToken).toBeVisible({ timeout: 2000 });
    let fromTokenText = await fromToken.innerText();
    let toTokenText = await toToken.innerText();
    console.log("Current pair: " + `${fromTokenText}/${toTokenText}`);
    return `${fromTokenText}/${toTokenText}`;
  }

  async buyAndGetWalletMsg(context: BrowserContext) {
    // Make sure to have sufficient balance and swap button is enabled
    expect(
      await this.isInsufficientBalance(),
      "Insufficient balance for the swap!"
    ).toBeFalsy();
    await expect(this.buyBtn).toBeEnabled({ timeout: 7000 });
    // Handle Pop-up page ->
    await this.buyBtn.click();
    const pageApprove = context.waitForEvent("page");
    await this.confirmSwapBtn.click();
    await this.page.waitForTimeout(200);
    const approvePage = await pageApprove;
    await approvePage.waitForLoadState();
    const approvePageTitle = approvePage.url();
    console.log("Approve page is opened at: " + approvePageTitle);
    const approveBtn = approvePage.getByRole("button", {
      name: "Approve",
    });
    await expect(approveBtn).toBeEnabled();
    const msgContentAmount = await approvePage
      .getByText("type: osmosis/poolmanager/")
      .textContent();
    console.log("Wallet is approving this msg: \n" + msgContentAmount);
    // Approve trx
    await approveBtn.click();
    // wait for trx confirmation
    await this.page.waitForTimeout(2000);
    // Handle Pop-up page <-
    return { msgContentAmount };
  }

  async sellAndGetWalletMsg(context: BrowserContext) {
    // Make sure to have sufficient balance and swap button is enabled
    expect(
      await this.isInsufficientBalance(),
      "Insufficient balance for the swap!"
    ).toBeFalsy();
    await expect(this.sellBtn).toBeEnabled({ timeout: 7000 });
    // Handle Pop-up page ->
    await this.sellBtn.click();
    const pageApprove = context.waitForEvent("page");
    await this.confirmSwapBtn.click();
    await this.page.waitForTimeout(200);
    const approvePage = await pageApprove;
    await approvePage.waitForLoadState();
    const approvePageTitle = approvePage.url();
    console.log("Approve page is opened at: " + approvePageTitle);
    const approveBtn = approvePage.getByRole("button", {
      name: "Approve",
    });
    await expect(approveBtn).toBeEnabled();
    const msgContentAmount = await approvePage
      .getByText("type: osmosis/poolmanager/")
      .textContent();
    console.log("Wallet is approving this msg: \n" + msgContentAmount);
    // Approve trx
    await approveBtn.click();
    // wait for trx confirmation
    await this.page.waitForTimeout(2000);
    // Handle Pop-up page <-
    return { msgContentAmount };
  }

  async limitBuyAndGetWalletMsg(context: BrowserContext) {
    // Make sure to have sufficient balance and swap button is enabled
    expect(
      await this.isInsufficientBalance(),
      "Insufficient balance for the swap!"
    ).toBeFalsy();
    await expect(this.buyBtn).toBeEnabled({ timeout: 7000 });
    // Handle Pop-up page ->
    await this.buyBtn.click();
    const pageApprove = context.waitForEvent("page");
    await this.confirmSwapBtn.click();
    await this.page.waitForTimeout(200);
    const approvePage = await pageApprove;
    await approvePage.waitForLoadState();
    const approvePageTitle = approvePage.url();
    console.log("Approve page is opened at: " + approvePageTitle);
    const approveBtn = approvePage.getByRole("button", {
      name: "Approve",
    });
    await expect(approveBtn).toBeEnabled();
    const msgContentAmount = await approvePage
      .getByText("Execute contract")
      .textContent();
    console.log("Wallet is approving this msg: \n" + msgContentAmount);
    // Approve trx
    await approveBtn.click();
    // wait for trx confirmation
    await this.page.waitForTimeout(2000);
    // Handle Pop-up page <-
    return { msgContentAmount };
  }

  async limitSellAndGetWalletMsg(context: BrowserContext) {
    // Make sure to have sufficient balance and swap button is enabled
    expect(
      await this.isInsufficientBalance(),
      "Insufficient balance for the swap!"
    ).toBeFalsy();
    await expect(this.sellBtn).toBeEnabled({ timeout: 7000 });
    // Handle Pop-up page ->
    await this.sellBtn.click();
    const pageApprove = context.waitForEvent("page");
    await this.confirmSwapBtn.click();
    await this.page.waitForTimeout(200);
    const approvePage = await pageApprove;
    await approvePage.waitForLoadState();
    const approvePageTitle = approvePage.url();
    console.log("Approve page is opened at: " + approvePageTitle);
    const approveBtn = approvePage.getByRole("button", {
      name: "Approve",
    });
    await expect(approveBtn).toBeEnabled();
    const msgContentAmount = await approvePage
      .getByText("Execute contract")
      .textContent();
    console.log("Wallet is approving this msg: \n" + msgContentAmount);
    // Approve trx
    await approveBtn.click();
    // wait for trx confirmation
    await this.page.waitForTimeout(2000);
    // Handle Pop-up page <-
    return { msgContentAmount };
  }
}
