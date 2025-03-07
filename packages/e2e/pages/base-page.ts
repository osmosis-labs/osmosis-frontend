import { type Locator, type Page, expect } from '@playwright/test'

export class BasePage {
  readonly page: Page
  readonly connectWalletBtn: Locator
  readonly kepltWalletBtn: Locator
  readonly portfolioLink: Locator
  readonly poolsLink: Locator
  readonly walletBalance: Locator
  readonly connectedWalletBtn: Locator

  constructor(page: Page) {
    this.page = page
    this.connectWalletBtn = page
      .getByRole('button', { name: 'Connect wallet', exact: true })
      .first()
    this.kepltWalletBtn = page.locator('button').filter({ hasText: /^Keplr$/ })
    this.portfolioLink = page.getByText('Portfolio')
    this.poolsLink = page.getByText('Pools')
    this.walletBalance = page.locator('//span[@data-testid="wallet-balance"]')
    this.connectedWalletBtn = page.locator('//button/div/span[@title]')
  }

  async connectWallet() {
    await this.connectWalletBtn.click()
    // This is needed to handle a wallet popup
    const pagePromise = this.page.context().waitForEvent('page')
    await this.kepltWalletBtn.click()
    await this.page.waitForTimeout(1000)
    // Handle Pop-up page ->
    const newPage = await pagePromise
    await newPage.waitForLoadState('load', { timeout: 10000 })
    const pageTitle = await newPage.title()
    console.log(`Title of the new page: ${pageTitle}`)
    await newPage.getByRole('button', { name: 'Approve' }).click()
    // PopUp page is auto-closed
    // Handle Pop-up page <-
    await expect(
      this.connectedWalletBtn,
      'Wallet should be connected.',
    ).toBeVisible({
      timeout: 5000,
    })
    console.log('Wallet is connected.')
    //Need to be merged to Master first
    //await this.getWalletBalance();
  }

  async gotoPortfolio() {
    await this.portfolioLink.click()
    // we expect that after 2 seconds tokens are loaded and any failure after this point should be considered a bug.
    await this.page.waitForTimeout(2000)
    await this.printUrl()
  }

  async gotoPools() {
    await this.poolsLink.click()
  }

  async printUrl() {
    const currentUrl = this.page.url()
    console.log(`FE opened at: ${currentUrl}`)
  }

  async getWalletBalance() {
    await expect(this.walletBalance, 'Wallet should be connected.').toBeVisible(
      { timeout: 4000 },
    )
    const balance = await this.walletBalance.textContent({ timeout: 2000 })
    console.log(`Wallet balance: ${balance}`)
    return balance
  }

  async logOut() {
    // open the wallet menu
    await expect(
      this.connectedWalletBtn,
      'Wallet should be connected.',
    ).toBeVisible({ timeout: 4000 })
    await this.connectedWalletBtn.click({ timeout: 2000 })
    const logoutBtn = this.page.locator('//button[@title="Log Out"]')
    await logoutBtn.click({ timeout: 2000 })
    await this.page.waitForTimeout(2000)
    await expect(this.connectWalletBtn).toBeVisible({ timeout: 4000 })
  }
}
