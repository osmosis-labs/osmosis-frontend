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
    const pagePromise = this.page
      .context()
      .waitForEvent('page', { timeout: 15000 })
    await this.kepltWalletBtn.click()
    await this.page.waitForTimeout(1000)
    let newPage: Page | null = null
    try {
      newPage = await pagePromise
    } catch (error: any) {
      if (
        error.name === 'TimeoutError' ||
        /timeout/i.test(error.message ?? '')
      ) {
        console.log(
          'Keplr popup did not appear within 15s; assuming auto-approved.',
        )
      } else {
        throw error
      }
    }

    if (newPage) {
      await newPage.waitForLoadState('load', { timeout: 10000 })
      console.log(`Title of the new page: ${await newPage.title()}`)
      await newPage.getByRole('button', { name: 'Approve' }).click()
    }
    await this.getWalletBalance()
    await this.dismissVariantsPopupIfPresent()
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
    console.log('Wait for a wallet balance for 9s.')
    await expect(this.walletBalance, 'Wallet should be connected.').toBeVisible(
      { timeout: 9000 },
    )
    const balance = await this.walletBalance.textContent({ timeout: 2000 })
    console.log(`Wallet balance: ${balance}`)
    return balance
  }

  async dismissVariantsPopupIfPresent() {
    try {
      const dismissBtn = this.page.getByRole('button', { name: 'Dismiss' })
      await dismissBtn.waitFor({ state: 'visible', timeout: 4000 })
      await dismissBtn.click()
      console.log('Dismissed "Variants Detected" popup.')
    } catch {
      // Modal not present — continue normally
    }
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
