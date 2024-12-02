import {
  type BrowserContext,
  type Page,
  chromium,
  expect,
  test,
} from '@playwright/test'

import { TestConfig } from '../test-config'
import { UnzipExtension } from '../unzip-extension'

import { WalletPage } from '../pages/keplr-page'
import { PortfolioPage } from '../pages/portfolio-page'

test.describe('Test Portfolio feature', () => {
  let context: BrowserContext
  const privateKey = process.env.PRIVATE_KEY ?? 'pk'
  let portfolioPage: PortfolioPage
  const dollarBalanceRegEx = /\$\d+/
  let page: Page

  test.beforeAll(async () => {
    const pathToExtension = new UnzipExtension().getPathToExtension()
    console.log('\nSetup Wallet Extension before tests.')
    // Launch Chrome with a Keplr wallet extension
    context = await chromium.launchPersistentContext(
      '',
      new TestConfig().getBrowserExtensionConfig(false, pathToExtension),
    )
    // Get all new pages (including Extension) in the context and wait
    const emptyPage = context.pages()[0]
    await emptyPage.waitForTimeout(2000)
    page = context.pages()[1]
    const walletPage = new WalletPage(page)
    // Import existing Wallet (could be aggregated in one function).
    await walletPage.importWalletWithPrivateKey(privateKey)
    await walletPage.setWalletNameAndPassword('Test Portfolio')
    await walletPage.selectChainsAndSave()
    await walletPage.finish()
    // Switch to Application
    page = context.pages()[0]
    portfolioPage = new PortfolioPage(page)
    await portfolioPage.goto()
    await portfolioPage.connectWallet()
    await portfolioPage.hideZeroBalances()
    await portfolioPage.viewMoreBalances()
  })

  test.afterAll(async () => {
    await context.close()
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
