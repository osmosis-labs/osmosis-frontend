import * as core from '@actions/core'
import { type BrowserContext, expect, test } from '@playwright/test'
import { TradePage } from '../pages/trade-page'
import { SetupKeplr } from '../setup-keplr'

test.describe('Test Swap Stables feature', () => {
  let context: BrowserContext
  const privateKey = process.env.PRIVATE_KEY ?? 'private_key'
  let tradePage: TradePage
  const swapAmount = '0.55'

  test.beforeAll(async () => {
    context = await new SetupKeplr().setupWallet(privateKey)
    tradePage = new TradePage(context.pages()[0])
    await tradePage.goto()
    await tradePage.connectWallet()
    expect(await tradePage.isError(), 'Swap is not available!').toBeFalsy()
  })

  test.afterAll(async () => {
    await context.close()
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
  ;[
    { from: 'USDC', to: 'USDC.eth.axl' },
    { from: 'USDC.eth.axl', to: 'USDC' },
    { from: 'USDC', to: 'USDT' },
    { from: 'USDT', to: 'USDC' },
  ].forEach(({ from, to }) => {
    test(`User should be able to swap ${from} to ${to}`, async () => {
      await tradePage.goto()
      await tradePage.selectPair(from, to)
      await tradePage.enterAmount(swapAmount)
      await tradePage.showSwapInfo()
      await tradePage.swapAndApprove(context)
      await tradePage.isTransactionSuccesful()
      await tradePage.getTransactionUrl()
    })
  })
})
