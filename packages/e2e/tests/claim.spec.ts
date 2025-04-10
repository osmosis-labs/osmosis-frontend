import { type BrowserContext, test } from '@playwright/test'
import { TradePage } from '../pages/trade-page'
import { TransactionsPage } from '../pages/transactions-page'
import { SetupKeplr } from '../setup-keplr'

test.describe('Test Claim All Orders feature', () => {
  let context: BrowserContext
  const privateKey = process.env.PRIVATE_KEY ?? 'private_key'
  let tradePage: TradePage

  test.beforeAll(async () => {
    context = await new SetupKeplr().setupWallet(privateKey)
    tradePage = new TradePage(context.pages()[0])
    await tradePage.goto()
    await tradePage.connectWallet()
  })

  test('User should be able to Claim All filled limit orders', async () => {
    await tradePage.goto()
    await tradePage.gotoOrdersHistory(10)
    const p = context.pages()[0]
    const trxPage = new TransactionsPage(p)
    await trxPage.claimAllIfPresent(context)
  })

  test('User should be able to Claim and Close partialy filled limit orders', async () => {
    await tradePage.goto()
    await tradePage.gotoOrdersHistory(10)
    const p = context.pages()[0]
    const trxPage = new TransactionsPage(p)
    await trxPage.claimAndCloseAny(context)
  })
})
