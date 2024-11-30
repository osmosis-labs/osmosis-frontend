/* eslint-disable import/no-extraneous-dependencies */
import type { Locator, Page } from '@playwright/test'

import { BasePage } from './base-page'

import { PoolPage } from './pool-page'

export class PoolsPage extends BasePage {
  readonly page: Page
  readonly viewMore: Locator
  readonly poolsLink: Locator
  readonly balance: Locator
  readonly searchInput: Locator

  constructor(page: Page) {
    super(page)
    this.page = page
    this.viewMore = page.getByText('View more')
    this.poolsLink = page.locator('//a//div[contains(text(), "Pools")]')
    this.balance = page.locator(
      '//span[.="Total balance"]/..//h4[contains(@class, "text-osmoverse-100")]',
    )
    this.searchInput = page.locator('//input[@id="search-input"]')
  }

  async goto() {
    await this.page.goto('/')
    await this.page.waitForTimeout(2000)
    await this.poolsLink.click()
    await this.page.waitForTimeout(2000)
    // Sometimes pools take longer to load
    // we expect that after 10 seconds tokens are loaded and any failure after this point should be considered a bug.
    // 1464 is an OSMO/USDC pool
    const locRows = '//tr/td/a[contains(@href, "pool/1464")]/../..'
    await this.page.locator(locRows).hover({ timeout: 10000 })
    await super.printUrl()
  }

  async viewPool(id: number, pair: string) {
    await this.page
      .locator(`//table//td/a[@href="/pool/${id}"]//span[.="${pair}"]`)
      .click()
    // we expect that after 2 seconds tokens are loaded and any failure after this point should be considered a bug.
    await this.page.waitForTimeout(2000)
    await super.printUrl()
    return new PoolPage(this.page)
  }

  async searchForPool(poolName: string) {
    await this.searchInput.fill(poolName)
    // we expect that after 2 seconds tokens are loaded and any failure after this point should be considered a bug.
    await this.page.waitForTimeout(2000)
  }

  async getPoolsNumber() {
    const loc = '//tr/td//a[contains(@href, "/pool/")]/../..'
    const num = await this.page.locator(loc).count()
    console.log(`Pools Count: ${num}`)
    return num
  }

  async getTopTenPoolsByLiquidity() {
    const loc = '//tr/td//a[contains(@href, "/pool/")]/../..'
    const liquidityList = []
    for (let i = 0; i < 10; i++) {
      const tt = this.page.locator(loc).nth(i).locator('//td').nth(2)
      const text: string = await tt.innerText()
      const n: number = Number(text.replace(/[^0-9.-]+/g, ''))
      liquidityList.push(n)
    }
    console.log(`Top 10 pools Liquidity: ${liquidityList}`)
    return liquidityList
  }

  async getTopTenPoolsByVolume() {
    const loc = '//tr/td//a[contains(@href, "/pool/")]/../..'
    const volumeList = []
    for (let i = 0; i < 10; i++) {
      const tt = this.page.locator(loc).nth(i).locator('//td').nth(1)
      const text: string = await tt.innerText()
      const n: number = Number(text.replace(/[^0-9.-]+/g, ''))
      volumeList.push(n)
    }
    console.log(`Top 10 pools Volume: ${volumeList}`)
    return volumeList
  }

  async getTopTenPoolsByAPR() {
    const loc = '//tr/td//a[contains(@href, "/pool/")]/../..'
    const aprList = []
    for (let i = 0; i < 10; i++) {
      const tt = this.page.locator(loc).nth(i).locator('//td').nth(3)
      const text: string = await tt.innerText()
      aprList.push(text)
    }
    console.log(`Top 10 pools APRs: ${aprList}`)
    return aprList
  }
}
