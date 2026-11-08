/* eslint-disable import-compat/no-extraneous-dependencies */
import { type Locator, type Page, expect } from '@playwright/test'

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
    // Wait for any pool row to appear (previously hard-coded pool/1464 which can
    // drop off the first page when liquidity rankings shift).
    const anyPoolRow = '//tr/td//a[contains(@href, "/pool/")]/../..'
    await this.page.locator(anyPoolRow).first().waitFor({ timeout: 10000 })
    await super.printUrl()
    await this.dismissVariantsPopupIfPresent()
  }

  async viewPool(id: number, pair: string) {
    // The pool id is the stable identity, so pin the row on the href and treat
    // the pair only as a guard that we are clicking the pool we meant to.
    // Matching the label exactly is what broke here: the USDC identity handover
    // renamed the Noble-backed pools from "ATOM/USDC" to "ATOM/USDC.noble",
    // because plain "USDC" now denotes the alloy, and an exact-text locator
    // simply never resolved — the click waited out the whole test timeout
    // rather than failing with something readable. A substring match spans both
    // sides of the handover, so this does not need revisiting when the rest of
    // the rename lands.
    const poolLink = this.page
      .locator(`//table//td/a[@href="/pool/${id}"]`)
      .filter({ hasText: pair })
    // Bounded so a row that never resolves fails here, naming the pool, instead
    // of stalling the click until the 90s test timeout with nothing to read.
    await poolLink.waitFor({ timeout: 10000 })
    await poolLink.click()
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

  /** Numeric values of one column across the first ten pool rows. */
  private async getTopTenColumnValues(column: number) {
    const loc = '//tr/td//a[contains(@href, "/pool/")]/../..'
    const values: number[] = []
    for (let i = 0; i < 10; i++) {
      const tt = this.page.locator(loc).nth(i).locator('//td').nth(column)
      const text: string = await tt.innerText()
      values.push(Number(text.replace(/[^0-9.-]+/g, '')))
    }
    return values
  }

  /** Clicks a column's sort header, then waits until its first ten rows are in
   *  descending order. Only for a column that is not the current sort, since a
   *  second click on the active column flips it to ascending. */
  private async sortDescendingBy(headerLabel: string, column: number) {
    await this.page
      .locator(`//thead//button[normalize-space()="${headerLabel}"]`)
      .click()
    await expect
      .poll(
        async () => {
          const values = await this.getTopTenColumnValues(column)
          return values.every((n, i) => i === 0 || n <= values[i - 1])
        },
        { timeout: 15000 },
      )
      .toBe(true)
  }

  async getTopTenPoolsByLiquidity() {
    // The table opens sorted by 24h volume, where a small pool with a busy day
    // can rank in the top ten, so sort by liquidity before reading the column.
    await this.sortDescendingBy('Liquidity', 2)
    const liquidityList = await this.getTopTenColumnValues(2)
    console.log(`Top 10 pools Liquidity: ${liquidityList}`)
    // Restore the default volume sort for the volume check that follows.
    await this.sortDescendingBy('Volume (24H)', 1)
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
    const readAprs = async () => {
      const aprList: string[] = []
      for (let i = 0; i < 10; i++) {
        const tt = this.page.locator(loc).nth(i).locator('//td').nth(3)
        aprList.push(await tt.innerText())
      }
      return aprList
    }
    // Sort by APR (descending on first click) so the rows read are the top ten
    // by APR. Pools with no APR data sort last, so they are never read here.
    // The table sorts on the upper bound, the last percentage in a range cell
    // such as "3.1% - 77.2%"; an empty cell parses as NaN and fails the check.
    await this.page
      .locator('//thead//button[normalize-space()="APR"]')
      .click()
    const upperBound = (apr: string) =>
      Number([...apr.matchAll(/([\d.]+)%/g)].pop()?.[1] ?? NaN)
    await expect
      .poll(
        async () => {
          const values = (await readAprs()).map(upperBound)
          return values.every(
            (n, i) => !Number.isNaN(n) && (i === 0 || n <= values[i - 1]),
          )
        },
        { timeout: 15000 },
      )
      .toBe(true)
    const aprList = await readAprs()
    console.log(`Top 10 pools APRs: ${aprList}`)
    return aprList
  }
}
