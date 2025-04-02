import { type BrowserContext, type Page, expect, test } from '@playwright/test'
import { PortfolioPage } from '../pages/portfolio-page'
import { SetupKeplr } from '../setup-keplr'

test.describe('Test Portfolio feature', () => {
  let context: BrowserContext
  const privateKey = process.env.PRIVATE_KEY ?? 'pk'
  let portfolioPage: PortfolioPage
  const dollarBalanceRegEx = /\d+/
  let page: Page

  test.beforeAll(async () => {
    context = await new SetupKeplr().setupWallet(privateKey)
    page = context.pages()[0]
    portfolioPage = new PortfolioPage(page)
    await portfolioPage.goto()
    await portfolioPage.connectWallet()
    await portfolioPage.hideZeroBalances()
    await portfolioPage.viewMoreBalances()
  })

  // biome-ignore lint/complexity/noForEach: <explanation>
  ;[
    { name: 'OSMO' },
    { name: 'ATOM' },
    { name: 'USDT' },
    { name: 'USDC' },
    { name: 'TIA' },
    { name: 'DAI' },
  ].forEach(({ name }) => {
    test(`User should be able to see native balances for ${name}`, async () => {
      await portfolioPage.searchForToken(name)
      const osmoBalance = await portfolioPage.getBalanceFor(name)
      expect(osmoBalance).toMatch(dollarBalanceRegEx)
    })
  })

  // biome-ignore lint/complexity/noForEach: <explanation>
  ;[
    { name: 'INJ' },
    { name: 'ETH.axl' },
    { name: 'SOL' },
    { name: 'milkTIA' },
    { name: 'BTC' },
    { name: 'WBTC' },
    { name: 'ETH' },
  ].forEach(({ name }) => {
    test(`User should be able to see bridged balances for ${name}`, async () => {
      await portfolioPage.searchForToken(name)
      const osmoBalance = await portfolioPage.getBalanceFor(name)
      expect(osmoBalance).toMatch(dollarBalanceRegEx)
    })
  })
})
