import { type BrowserContext, type Page, expect, test } from '@playwright/test'

import { PortfolioPage } from '../pages/portfolio-page'
import { SwapPage } from '../pages/swap-page'
import { TransactionsPage } from '../pages/transactions-page'
import { SetupKeplr } from '../setup-keplr'
import { deriveAddress } from '../utils/wallet-utils'

test.describe('Test Transactions feature', () => {
  let context: BrowserContext
  let page: Page
  const privateKey = process.env.PRIVATE_KEY ?? 'pk'
  let portfolioPage: PortfolioPage
  let transactionsPage: TransactionsPage
  let swapPage: SwapPage

  test.beforeAll(async () => {
    context = await new SetupKeplr().setupWallet(privateKey)
    page = context.pages()[0]
    portfolioPage = new PortfolioPage(page)
    await portfolioPage.goto()
    await portfolioPage.connectWallet()
    transactionsPage = await new TransactionsPage(page).open()
  })

  test('User should be able to see old transactions', async () => {
    await transactionsPage.viewTransactionByNumber(10)
    await transactionsPage.viewOnExplorerIsVisible()
    await transactionsPage.closeTransaction()
    await transactionsPage.viewTransactionByNumber(20)
    await transactionsPage.viewOnExplorerIsVisible()
    await transactionsPage.closeTransaction()
    await transactionsPage.viewTransactionByNumber(35)
    await transactionsPage.viewOnExplorerIsVisible()
    await transactionsPage.closeTransaction()
  })

  test.skip('User should be able to see a new transaction', async () => {
    const { address: walletId } = await deriveAddress(privateKey)
    swapPage = new SwapPage(context.pages()[0])
    await swapPage.goto()
    await swapPage.selectPair('USDC', 'USDT')
    const rndInt = Math.floor(Math.random() * 99) + 1
    const swapAmount = `0.1${rndInt}`
    await swapPage.enterAmount(swapAmount)
    const { msgContentAmount } = await swapPage.swapAndGetWalletMsg(context)
    expect(msgContentAmount).toBeTruthy()
    expect(msgContentAmount).toContain(`sender: ${walletId}`)
    expect(msgContentAmount).toContain(
      'denom: factory/osmo147h5x9pcj7lm0cttlaefx6sqq5vdfnmwfcqxkmjd7exqm9gc7grqhr75m0/alloyed/allUSDC',
    )
    expect(swapPage.isTransactionBroadcasted(10))
    expect(swapPage.isTransactionSuccesful(10))
    const swapTrxUrl = await swapPage.getTransactionUrl()
    await swapPage.gotoPortfolio()
    await portfolioPage.viewTransactionsPage()
    await transactionsPage.viewBySwapAmount(swapAmount)
    await transactionsPage.viewOnExplorerIsVisible()
    const trxUrl = await transactionsPage.getOnExplorerLink()
    expect(trxUrl).toContain(swapTrxUrl)
    await transactionsPage.closeTransaction()
  })
})
