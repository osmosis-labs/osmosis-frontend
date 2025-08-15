import * as core from '@actions/core'
import { type BrowserContext, expect, test } from '@playwright/test'
import { TradePage } from '../pages/trade-page'
import { SetupKeplr } from '../setup-keplr'

test.describe('Test Market Buy/Sell Order feature', () => {
  let context: BrowserContext
  const privateKey = process.env.PRIVATE_KEY ?? 'private_key'
  let tradePage: TradePage
  const TRX_SUCCESS_TIMEOUT = 10000

  test.beforeAll(async () => {
    context = await new SetupKeplr().setupWallet(privateKey)
    tradePage = new TradePage(context.pages()[0])
    await tradePage.goto()
  })

  test.afterAll(async () => {
    await context.close()
  })

  test.beforeEach(async () => {
    await tradePage.connectWallet()
    expect(await tradePage.isError(), 'Swap is not available!').toBeFalsy()
  })

  test.afterEach(async () => {
    await tradePage.logOut()
  })

  // biome-ignore lint/correctness/noEmptyPattern: <explanation>
  test.afterEach(async ({}, testInfo) => {
    console.log(`Test [${testInfo.title}] status: ${testInfo.status}`)
    if (testInfo.status === 'failed') {
      const name = testInfo.title
      core.notice(`Test ${name} failed.`)
    }
  })

  // biome-ignore lint/complexity/noForEach: <explanation>
  ;[{ name: 'BTC' }, { name: 'OSMO' }].forEach(({ name }) => {
    test(`User should be able to Market Buy ${name}`, async () => {
      await tradePage.goto()
      await tradePage.openBuyTab()
      await tradePage.selectAsset(name)
      await tradePage.enterAmount('1.55')
      await tradePage.isSufficientBalanceForTrade()
      await tradePage.showSwapInfo()
      await tradePage.buyAndApprove(context)
      await tradePage.isTransactionSuccesful(TRX_SUCCESS_TIMEOUT)
      await tradePage.getTransactionUrl()
    })
  })

  // unwrapped market sell tests just in case this affects anything.
  test('User should be able to Market Sell BTC', async () => {
    await tradePage.goto()
    await tradePage.openSellTab()
    await tradePage.selectAsset('BTC')
    await tradePage.enterAmount('1.54')
    await tradePage.isSufficientBalanceForTrade()
    await tradePage.showSwapInfo()
    await tradePage.sellAndApprove(context)
    await tradePage.isTransactionSuccesful(TRX_SUCCESS_TIMEOUT)
    await tradePage.getTransactionUrl()
  })

  test('User should be able to Market Sell OSMO', async () => {
    await tradePage.goto()
    await tradePage.openSellTab()
    await tradePage.selectAsset('OSMO')
    await tradePage.enterAmount('1.54')
    await tradePage.isSufficientBalanceForTrade()
    await tradePage.showSwapInfo()
    await tradePage.sellAndApprove(context)
    await tradePage.isTransactionSuccesful(TRX_SUCCESS_TIMEOUT)
    await tradePage.getTransactionUrl()
  })
})
