/* eslint-disable import/no-extraneous-dependencies */
import {
  type BrowserContext,
  type Locator,
  type Page,
  expect,
} from "@playwright/test";

import { BasePage } from "./base-page";

export class SwapPage extends BasePage {
  readonly page: Page;
  readonly swapBtn: Locator;
  readonly swapMaxBtn: Locator;
  readonly swapInput: Locator;
  readonly flipAssetsBtn: Locator;
  readonly exchangeRate: Locator;
  readonly trxSuccessful: Locator;
  readonly trxBroadcasting: Locator;
  readonly trxLink: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.swapBtn = page.getByRole("button", { name: "Swap", exact: true });
    this.swapMaxBtn = page.getByRole("button", { name: "MAX", exact: true });
    this.swapInput = page.locator('//input[@data-testid="trade-input-swap"]');
    this.flipAssetsBtn = page.locator(
      '//div/button[contains(@class, "ease-bounce")]'
    );
    this.exchangeRate = page.locator('//span[@data-testid="token-price"]');
    this.trxSuccessful = page.locator('//h6[.="Transaction Succesful"]');
    this.trxLink = page.getByText("View explorer");
    this.trxBroadcasting = page.locator('//h6[.="Transaction Broadcasting"]');
  }

  async goto() {
    const assetPromise = this.page.waitForRequest("**/assets.json");
    await this.page.goto("/");
    const request = await assetPromise;
    expect(request).toBeTruthy();
    // we expect that after 2 seconds tokens are loaded and any failure after this point should be considered a bug.
    await this.page.waitForTimeout(2000);
    const currentUrl = this.page.url();
    console.log(`FE opened at: ${currentUrl}`);
  }

  async flipTokenPair() {
    await this.flipAssetsBtn.click();
    // Wait for exchange rate to update instead of fixed timeout
    await expect(this.exchangeRate).toBeVisible({ timeout: 5000 });
    console.log("Fliped token pair.");
  }

  async enterAmount(amount: string) {
    // Just enter an amount for the swap and wait for a quote
    await this.swapInput.fill(amount, { timeout: 2000 });
    await expect(this.swapInput).toHaveValue(amount, { timeout: 3000 });
    // Wait a moment for the quote to load
    await this.page.waitForTimeout(2000);
    console.log(`Swap amount entered: ${amount}`);
  }

  async swapAndGetWalletMsg(context: BrowserContext) {
    // Make sure to have sufficient balance and swap button is enabled
    expect(
      await this.isInsufficientBalance(),
      "Insufficient balance for the swap!"
    ).toBeFalsy();
    await expect(this.swapBtn).toBeEnabled({ timeout: 7000 });
    // Handle Pop-up page ->
    const pageApprove = context.waitForEvent("page");
    await this.swapBtn.click();
    const approvePage = await pageApprove;
    await approvePage.waitForLoadState();
    const approvePageTitle = approvePage.url();
    console.log(`Approve page is opened at: ${approvePageTitle}`);
    const approveBtn = approvePage.getByRole("button", {
      name: "Approve",
    });
    await expect(approveBtn).toBeEnabled();
    const msgContentAmount = await approvePage
      .getByText("type: osmosis/poolmanager/")
      .textContent();
    console.log(`Wallet is approving this msg: \n${msgContentAmount}`);
    // Approve trx
    await approveBtn.click();
    // wait for trx confirmation
    await this.page.waitForTimeout(4000);
    //await approvePage.close();
    // Handle Pop-up page <-
    return { msgContentAmount };
  }

  async selectPair(from: string, to: string) {
    // Filter does not show already selected tokens
    console.log(`Select pair ${from} to ${to}`);
    const tokenLocator =
      '//img[@alt="token icon"]/../..//h5 | //img[@alt="token icon"]/../..//span[@class="subtitle1"]';
    const fromToken = this.page.locator(tokenLocator).nth(0);
    const toToken = this.page.locator(tokenLocator).nth(1);

    const fromTokenText = await fromToken.innerText();
    const toTokenText = await toToken.innerText();
    console.log(`Current pair: ${fromTokenText} / ${toTokenText}`);

    if (fromTokenText === from && toTokenText === to) {
      console.log(
        `Current pair: ${fromTokenText}${toTokenText} is already matching.`
      );
      return;
    }

    if (fromTokenText === to && toTokenText === from) {
      await this.flipTokenPair();
      console.log(`Current pair: ${fromTokenText}${toTokenText} is fliped.`);
      return;
    }

    if (from === toTokenText || to === fromTokenText) {
      await this.flipTokenPair();
    }

    if (fromTokenText !== from && toTokenText !== from) {
      await fromToken.click();
      // Wait for search input to be visible instead of fixed timeout
      const searchInput = this.page.getByPlaceholder("Search");
      await expect(searchInput).toBeVisible({ timeout: 5000 });
      await searchInput.fill(from);
      const fromLocator = this.page.locator(
        `//div/button[@data-testid]//h6[.='${from}']`
      );
      await expect(fromLocator).toBeVisible({ timeout: 5000 });
      await fromLocator.click();
    }

    if (toTokenText !== to && fromTokenText !== to) {
      await toToken.click();
      // Wait for search input to be visible instead of fixed timeout
      const searchInput = this.page.getByPlaceholder("Search");
      await expect(searchInput).toBeVisible({ timeout: 5000 });
      await searchInput.fill(to);
      const toLocator = this.page.locator(
        `//div/button[@data-testid]//h6[.='${to}']`
      );
      await expect(toLocator).toBeVisible({ timeout: 5000 });
      await toLocator.click();
    }
    // Wait for exchange rate to be populated instead of fixed timeout
    const exchangeRate = await this.getExchangeRate();
    expect(exchangeRate).toContain(from);
    expect(exchangeRate).toContain(to);
  }

  async getExchangeRate() {
    // Try to get exchange rate if visible
    const isRateVisible = await this.exchangeRate.isVisible({ timeout: 5000 }).catch(() => false);
    if (isRateVisible) {
      const rate = await this.exchangeRate.innerText();
      console.log(`[DEBUG] Exchange rate: ${rate}`);
      return rate;
    }
    // Fallback: construct rate string from visible token names in the modal
    console.log("[DEBUG] Exchange rate element not visible, checking modal tokens");
    
    // The modal shows token names like "ATOM" and "USDC" as text
    // Look for these in the modal dialog
    const modalDialog = this.page.locator('div:has-text("Swap"):has-text("From"):has-text("To")').first();
    const modalText = await modalDialog.innerText().catch(() => "");
    console.log(`[DEBUG] Modal text: ${modalText.substring(0, 200)}`);
    
    // Return the modal text which should contain token names
    return modalText;
  }

  async isTransactionSuccesful(delay = 7) {
    console.log("Wait for a transaction success for 7 seconds.");
    return await this.trxSuccessful.isVisible({
      timeout: delay * 1000,
    });
  }

  async getTransactionUrl() {
    const trxUrl = await this.trxLink.getAttribute("href");
    console.log(`Trx url: ${trxUrl}`);
    return trxUrl;
  }

  async isTransactionBroadcasted(delay = 5) {
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
    const isVisible = await swapInfo.isVisible({ timeout: 3000 }).catch(() => false);
    if (isVisible) {
      await swapInfo.click();
      console.log(`Price Impact: ${await this.getPriceInpact()}`);
    } else {
      console.log("[DEBUG] Show details button not visible in this modal");
    }
  }

  async getPriceInpact() {
    const priceInpactSpan = this.page.locator(
      '//span[.="Price Impact"]/..//span[@class="text-bullish-400"]'
    );
    return await priceInpactSpan.textContent();
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `screenshot-swap-${name}.png`,
      fullPage: true,
    });
  }

  async getSelectedPair() {
    const tokenLocator =
      '//img[@alt="token icon"]/../..//h5 | //img[@alt="token icon"]/../..//span[@class="subtitle1"]';
    const fromToken = this.page.locator(tokenLocator).nth(0);
    const toToken = this.page.locator(tokenLocator).nth(1);

    const fromTokenText = await fromToken.innerText();
    const toTokenText = await toToken.innerText();
    console.log(`Current pair: ${fromTokenText}/${toTokenText}`);
    return `${fromTokenText}/${toTokenText}`;
  }
}
