import {
  type BrowserContext,
  type Locator,
  type Page,
  expect,
} from '@playwright/test'

import { BasePage } from './base-page'

export class TradePage extends BasePage {
  readonly page: Page
  readonly swapBtn: Locator
  readonly swapMaxBtn: Locator
  readonly flipAssetsBtn: Locator
  readonly exchangeRate: Locator
  readonly trxSuccessful: Locator
  readonly trxBroadcasting: Locator
  readonly trxLink: Locator
  readonly inputAmount: Locator
  readonly confirmSwapBtn: Locator
  readonly buyTabBtn: Locator
  readonly buyBtn: Locator
  readonly sellTabBtn: Locator
  readonly sellBtn: Locator
  readonly limitTabBtn: Locator
  readonly orderHistoryLink: Locator
  readonly limitPrice: Locator

  constructor(page: Page) {
    super(page)
    this.page = page
    this.swapBtn = page.locator('//button[@data-testid="trade-button-swap"]')
    this.buyTabBtn = page.locator('//div[@class]/button[.="Buy"]/p[@class]/..')
    this.buyBtn = page.locator('//div[@class]/button[@class]/h6[.="Buy"]/..')
    this.sellBtn = page.locator('//div[@class]/button[@class]/h6[.="Sell"]/..')
    this.sellTabBtn = page.locator(
      '//div[@class]/button[.="Sell"]/p[@class]/..',
    )
    this.confirmSwapBtn = page.locator('//div[@class]/button[.="Confirm"]')
    this.swapMaxBtn = page.locator('//span[.="Max"]')
    this.flipAssetsBtn = page.locator(
      '//div/button[contains(@class, "ease-bounce")]',
    )
    this.exchangeRate = page.locator('//span[@data-testid="token-price"]')
    this.trxSuccessful = page.getByText('Transaction Successful')
    this.trxLink = page.getByText('View explorer')
    this.trxBroadcasting = page.locator('//h6[.="Transaction Broadcasting"]')
    this.inputAmount = page.locator(
      "//input[contains(@data-testid, 'trade-input')]",
    )
    this.limitTabBtn = page.locator('//div[@class="w-full"]/button[.="Limit"]')
    this.orderHistoryLink = page.getByText('Order history')
    this.limitPrice = page.locator("//div/input[@type='text']")
  }

  async goto() {
    const assetPromise = this.page.waitForRequest('**/assets.json')
    await this.page.goto('/')
    const request = await assetPromise
    expect(request).toBeTruthy()
    // we expect that after 2 seconds tokens are loaded and any failure after this point should be considered a bug.
    await this.page.waitForTimeout(2000)
    const currentUrl = this.page.url()
    console.log(`FE opened at: ${currentUrl}`)
  }

  async gotoOrdersHistory(timeout = 1) {
    await this.page.waitForTimeout(1000)
    await this.orderHistoryLink.click()
    await this.page.waitForTimeout(1000)
    await new Promise((f) => setTimeout(f, timeout * 1000))
    const currentUrl = this.page.url()
    console.log(`FE opened at: ${currentUrl}`)
  }

  async openBuyTab() {
    await this.buyTabBtn.click()
  }

  async openSellTab() {
    await this.sellTabBtn.click()
  }

  async openLimit() {
    await this.limitTabBtn.click()
    await this.page.waitForTimeout(1000)
  }

  async getLimitPrice() {
    const lp = await this.limitPrice.inputValue()
    console.log(`Current limit price is: ${lp}`)
    return lp
  }

  async setLimitPriceChange(change: string) {
    const locator = `//button/span[contains(@class, "body2") and .="${change}"]`
    await this.page.locator(locator).click()
    await this.page.waitForTimeout(1000)
  }

  async setLimitPrice(price: string) {
    console.log(`Set Order Limit Price to: ${price}`)
    await this.limitPrice.fill(price, { timeout: 2000 })
  }

  async flipTokenPair() {
    await this.flipAssetsBtn.click()
    await this.page.waitForTimeout(2000)
    console.log('Fliped token pair.')
  }

  async clickMaxAmountButton() {
    await this.swapMaxBtn.click({ timeout: 2000 })
    await this.page.waitForTimeout(1000)
    console.log('Clicked Max token amount button.')
  }

  async enterAmount(amount: string) {
    // Just enter an amount for the swap and wait for a quote
    await this.inputAmount.fill(amount, { timeout: 2000 })
    await this.page.waitForTimeout(1000)
    await expect(this.inputAmount).toHaveValue(amount, { timeout: 1000 })
    const exchangeRate = await this.getExchangeRate()
    console.log(`Swap ${amount} with rate: ${exchangeRate}`)
  }

  private async approveInKeplrAndGetMsg(context: BrowserContext) {
    console.log('Wait for 5 seconds for any popup')
    await this.page.waitForTimeout(5_000)
    const pages = context.pages()
    console.log(`Number of Open Pages: ${pages.length}`)
    if (pages.length === 2) {
      const approvePage = pages[1]
      const approvePageTitle = approvePage.url()
      console.log(`Approve page is opened at: ${approvePageTitle}`)
      const msgContent = await approvePage
        .getByText('type: osmosis/poolmanager/')
        .textContent()
      console.log(`Wallet is approving this msg: \n${msgContent}`)
      await approvePage
        .getByRole('button', { name: 'Approve' })
        .click({ timeout: 4000 })
      return msgContent
    }
    console.log('Second page was not opened in 5 seconds.')
  }

  async justApproveIfNeeded(context: BrowserContext) {
    console.log('Wait for 7 seconds for any popup')
    await this.page.waitForTimeout(7_000)
    const pages = context.pages()
    console.log(`Number of Open Pages: ${pages.length}`)
    if (pages.length === 2) {
      const approvePage = pages[1]
      const approvePageTitle = approvePage.url()
      console.log(`Approve page is opened at: ${approvePageTitle}`)
      await approvePage
        .getByRole('button', { name: 'Approve' })
        .click({ timeout: 4000 })
    }
    console.log('Second page was not opened in 7 seconds.')
  }

  async swapAndGetWalletMsg(context: BrowserContext) {
    // Make sure to have sufficient balance and swap button is enabled
    expect(
      await this.isInsufficientBalanceForSwap(),
      'Insufficient balance for the swap!',
    ).toBeFalsy()
    console.log('Swap and Sign now..')
    await expect(this.swapBtn, 'Swap button is disabled!').toBeEnabled({
      timeout: 7000,
    })
    await this.swapBtn.click({ timeout: 4000 })
    // Handle 1-click by default
    const oneClick = '//div[@role="dialog"]//button[@data-state="checked"]'
    if (await this.page.locator(oneClick).isVisible({ timeout: 2000 })) {
      await this.page.locator(oneClick).click({ timeout: 3000 })
    }
    await this.confirmSwapBtn.click({ timeout: 5000 })
    return await this.approveInKeplrAndGetMsg(context)
  }

  async selectAsset(token: string) {
    const tokenLocator = '//div//button[@type]//img[@alt]'
    const fromToken = this.page.locator(tokenLocator).nth(0)
    await fromToken.click()
    // we expect that after 1 second token filter is displayed.
    await this.page.waitForTimeout(1000)
    await this.page.getByPlaceholder('Search').fill(token)
    const fromLocator = this.page.locator(
      `//div/button[@data-testid='token-select-asset']//span[.='${token}']`,
    )
    await fromLocator.click()
  }

  async selectPair(from: string, to: string) {
    // Filter does not show already selected tokens
    console.log(`Select pair ${from} to ${to}`)
    const fromToken = this.page.locator(
      "//div//button[@data-testid='token-in']//img[@alt]",
    )
    const toToken = this.page.locator(
      "//div//button[@data-testid='token-out']//img[@alt]",
    )
    // Select From Token
    await fromToken.click({ timeout: 4000 })
    // we expect that after 1 second token filter is displayed.
    await this.page.waitForTimeout(1000)
    await this.page.getByPlaceholder('Search').fill(from)
    const fromLocator = this.page
      .locator(
        `//div/button[@data-testid='token-select-asset']//span[.='${from}']`,
      )
      .first()
    await fromLocator.click({ timeout: 4000 })
    // Select To Token
    await toToken.click({ timeout: 4000 })
    // we expect that after 1 second token filter is displayed.
    await this.page.waitForTimeout(1000)
    await this.page.getByPlaceholder('Search').fill(to)
    const toLocator = this.page
      .locator(
        `//div/button[@data-testid='token-select-asset']//span[.='${to}']`,
      )
      .first()
    await toLocator.click()
    // we expect that after 2 seconds exchange rate is populated.
    await this.page.waitForTimeout(2000)
    expect(await this.getExchangeRate()).toContain(from)
    expect(await this.getExchangeRate()).toContain(to)
  }

  async getExchangeRate() {
    return await this.exchangeRate.innerText()
  }

  async isTransactionSuccesful(delay = 7) {
    console.log(`Wait for a transaction success for ${delay} seconds.`)
    await expect(this.trxSuccessful).toBeVisible({
      timeout: delay * 1000,
      visible: true,
    })
  }

  async getTransactionUrl() {
    const trxUrl = await this.trxLink.getAttribute('href')
    console.log(`Trx url: ${trxUrl}`)
    await this.page.reload()
    return trxUrl
  }

  async isTransactionBroadcasted(delay = 5) {
    console.log(`Wait for a transaction broadcasting for ${delay} seconds.`)
    return await this.trxBroadcasting.isVisible({ timeout: delay * 1000 })
  }

  async isInsufficientBalance() {
    const issufBalanceBtn = this.page.locator(
      '//span[.="Insufficient balance"]',
    )
    return await issufBalanceBtn.isVisible({ timeout: 2000 })
  }

  async isInsufficientBalanceForSwap() {
    const issufBalanceBtn = this.page.locator(
      '//button[.="Insufficient balance"]',
    )
    return await issufBalanceBtn.isVisible({ timeout: 2000 })
  }

  async isSufficientBalanceForTrade() {
    // Make sure to have sufficient balance for a trade
    expect(
      await this.isInsufficientBalance(),
      'Insufficient balance for the swap!',
    ).toBeFalsy()
  }

  async isError() {
    const errorBtn = this.page.locator('//button[.="Error"]')
    return await errorBtn.isVisible({ timeout: 2000 })
  }

  async showSwapInfo() {
    const swapInfo = this.page.locator("//button//span[.='Show details']")
    await expect(swapInfo, 'Show Swap Info button not visible!').toBeVisible({
      timeout: 4000,
    })
    await swapInfo.click({ timeout: 2000 })
  }

  async getPriceInpact() {
    const priceInpactSpan = this.page.locator(
      '//span[.="Price Impact"]/..//span[@class="text-bullish-400"]',
    )
    return await priceInpactSpan.textContent()
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({
      path: `screenshot-trade-${name}.png`,
      fullPage: true,
    })
  }

  async getSelectedSwapPair() {
    const tokenLocator = '//div//button[@type]//img[@alt]/../h5'
    const fromToken = this.page.locator(tokenLocator).nth(0)
    const toToken = this.page.locator(tokenLocator).nth(1)
    await expect(fromToken).toBeVisible({ timeout: 2000 })
    const fromTokenText = await fromToken.innerText()
    const toTokenText = await toToken.innerText()
    console.log(`Current pair: ${fromTokenText}/${toTokenText}`)
    return `${fromTokenText}/${toTokenText}`
  }

  async buyAndGetWalletMsg(context: BrowserContext, limit = false) {
    await expect(this.buyBtn, 'Buy button is disabled!').toBeEnabled({
      timeout: 9000,
    })
    // Handle Pop-up page ->
    await this.buyBtn.click()
    const pageApprove = context.waitForEvent('page')
    await this.confirmSwapBtn.click()
    await this.page.waitForTimeout(200)
    const approvePage = await pageApprove
    await approvePage.waitForLoadState()
    const approveBtn = approvePage.getByRole('button', {
      name: 'Approve',
    })
    await expect(approveBtn).toBeEnabled()
    let msgTextLocator = 'type: osmosis/poolmanager/'
    if (limit) {
      msgTextLocator = 'Execute contract'
    }
    const msgContentAmount = await approvePage
      .getByText(msgTextLocator)
      .textContent()
    console.log(`Wallet is approving this msg: \n${msgContentAmount}`)
    // Approve trx
    await approveBtn.click()
    // wait for trx confirmation
    await this.page.waitForTimeout(2000)
    // Handle Pop-up page <-
    return { msgContentAmount }
  }

  async sellAndGetWalletMsg(context: BrowserContext, limit = false) {
    // Make sure Sell button is enabled
    await expect(this.sellBtn, 'Sell button is disabled!').toBeEnabled({
      timeout: 9000,
    })
    // Handle Pop-up page ->
    await this.sellBtn.click()
    const pageApprove = context.waitForEvent('page')
    await this.confirmSwapBtn.click()
    await this.page.waitForTimeout(200)
    const approvePage = await pageApprove
    await approvePage.waitForLoadState()
    const approveBtn = approvePage.getByRole('button', {
      name: 'Approve',
    })
    await expect(approveBtn).toBeEnabled()
    let msgTextLocator = 'type: osmosis/poolmanager/'
    if (limit) {
      msgTextLocator = 'Execute contract'
    }
    const msgContentAmount = await approvePage
      .getByText(msgTextLocator)
      .textContent()
    console.log(`Wallet is approving this msg: \n${msgContentAmount}`)
    // Approve trx
    await approveBtn.click()
    // wait for trx confirmation
    await this.page.waitForTimeout(2000)
    // Handle Pop-up page <-
    return { msgContentAmount }
  }

  async sellAndApprove(context: BrowserContext) {
    // Make sure Sell button is enabled
    await expect(this.sellBtn, 'Sell button is disabled!').toBeEnabled({
      timeout: 9000,
    })
    await this.sellBtn.click()
    await this.confirmSwapBtn.click()
    await this.justApproveIfNeeded(context)
    await this.page.waitForTimeout(1000)
  }

  async buyAndApprove(context: BrowserContext, _limit = false) {
    await expect(this.buyBtn, 'Buy button is disabled!').toBeEnabled({
      timeout: 9000,
    })
    await this.buyBtn.click()
    await this.confirmSwapBtn.click()
    await this.justApproveIfNeeded(context)
    await this.page.waitForTimeout(1000)
  }

  async swapAndApprove(context: BrowserContext) {
    // Make sure to have sufficient balance and swap button is enabled
    expect(
      await this.isInsufficientBalanceForSwap(),
      'Insufficient balance for the swap!',
    ).toBeFalsy()
    console.log('Swap and Sign now..')
    await expect(this.swapBtn, 'Swap button is disabled!').toBeEnabled({
      timeout: 7000,
    })
    await this.swapBtn.click({ timeout: 4000 })
    await this.confirmSwapBtn.click({ timeout: 5000 })
    await this.justApproveIfNeeded(context)
  }
}
