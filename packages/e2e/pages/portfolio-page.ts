/* eslint-disable import-compat/no-extraneous-dependencies */
import type { Locator, Page } from '@playwright/test'

import { BasePage } from './base-page'
import { TransactionsPage } from './transactions-page'

/** Page object for the /portfolio view -- token balances, search, and navigation to transactions. */
export class PortfolioPage extends BasePage {
  readonly hideZeros: Locator
  readonly viewMore: Locator
  readonly portfolioLink: Locator
  readonly viewTransactions: Locator
  readonly searchInput: Locator

  constructor(page: Page) {
    super(page)
    this.hideZeros = page.locator(
      '//label[.="Hide zero balances"]/following-sibling::button',
    )
    this.viewMore = page.getByText('View more')
    this.portfolioLink = page.locator('//a//div[contains(text(), "Portfolio")]')
    this.viewTransactions = page.locator('//div/a[.="View all"]')
    this.searchInput = page.locator('//input[@id="search-input"]')
  }

  async goto() {
    await this.page.goto('/')
    await this.portfolioLink.click()
    await this.page.waitForURL(/\/portfolio/, { waitUntil: 'commit' })
    const currentUrl = this.page.url()
    console.log(`FE opened at: ${currentUrl}`)
    await this.dismissVariantsPopupIfPresent()
  }

  async getBalanceFor({
    name,
    minimalDenom,
  }: {
    name: string
    minimalDenom: string
  }) {
    const row = this.page
      .locator(
        `//tbody/tr[.//a[contains(@href, "/assets/${minimalDenom}")]]`,
      )
      .first()
    await row.waitFor({ state: 'visible', timeout: 20000 })
    const bal = row.locator('td').nth(1).locator('a')
    await bal.scrollIntoViewIfNeeded()
    const tokenBalance: string = await bal.innerText()
    console.log(`Balance for ${name}: ${tokenBalance}`)
    return tokenBalance
  }

  async viewTransactionsPage() {
    await this.viewTransactions.click()
    await this.page.waitForURL(/\/transactions/, { waitUntil: 'commit' })
    return new TransactionsPage(this.page)
  }

  async hideZeroBalances() {
    const isVisible = await this.hideZeros.isVisible({ timeout: 2000 })
    if (isVisible) {
      await this.hideZeros.click()
    }
  }

  async viewMoreBalances() {
    const isVisible = await this.viewMore.isVisible({ timeout: 2000 })
    if (isVisible) {
      await this.viewMore.click()
    }
  }

  /** getBalanceFor waits for the token's row, so no settle time is needed. */
  async searchForToken(tokenName: string) {
    await this.searchInput.fill(tokenName)
  }
}
