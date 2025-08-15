import { type BrowserContext, expect, test } from '@playwright/test'
import { TradePage } from '../pages/trade-page'
import { TransactionsPage } from '../pages/transactions-page'
import { SetupKeplr } from '../setup-keplr'

test.describe('Test Trade feature', () => {
  let context: BrowserContext
  const privateKey = process.env.PRIVATE_KEY ?? 'private_key'
  let tradePage: TradePage
  const USDC =
    'ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4'
  const ATOM =
    'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2'

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

  test('User should be able to Buy ATOM', async () => {
    await tradePage.goto()
    await tradePage.openBuyTab()
    await tradePage.selectAsset('ATOM')
    await tradePage.enterAmount('1.12')
    const { msgContentAmount } = await tradePage.buyAndGetWalletMsg(context)
    expect(msgContentAmount).toBeTruthy()
    expect(msgContentAmount).toContain(`denom: ${ATOM}`)
    expect(msgContentAmount).toContain('type: osmosis/poolmanager/')
    expect(msgContentAmount).toContain(`denom: ${USDC}`)
    await tradePage.isTransactionSuccesful()
    await tradePage.getTransactionUrl()
  })

  test('User should be able to Sell ATOM', async () => {
    await tradePage.goto()
    await tradePage.openSellTab()
    await tradePage.selectAsset('ATOM')
    await tradePage.enterAmount('1.11')
    const { msgContentAmount } = await tradePage.sellAndGetWalletMsg(context)
    expect(msgContentAmount).toBeTruthy()
    expect(msgContentAmount).toContain(`denom: ${USDC}`)
    expect(msgContentAmount).toContain('type: osmosis/poolmanager/')
    expect(msgContentAmount).toContain(`denom: ${ATOM}`)
    await tradePage.isTransactionSuccesful()
    await tradePage.getTransactionUrl()
  })

  test('User should be able to limit sell ATOM', async () => {
    await tradePage.goto()
    const amount = '1.01'
    await tradePage.openSellTab()
    await tradePage.openLimit()
    await tradePage.selectAsset('ATOM')
    await tradePage.enterAmount(amount)
    await tradePage.setLimitPriceChange('5%')
    const limitPrice = await tradePage.getLimitPrice()
    const { msgContentAmount } = await tradePage.sellAndGetWalletMsg(
      context,
      true,
    )
    expect(msgContentAmount).toBeTruthy()
    //expect(msgContentAmount).toContain(amount + " ATOM (Cosmos Hub/channel-0)");
    expect(msgContentAmount).toContain('place_limit')
    expect(msgContentAmount).toContain('"order_direction": "ask"')
    await tradePage.isTransactionSuccesful()
    await tradePage.getTransactionUrl()
    await tradePage.gotoOrdersHistory()
    const trxPage = new TransactionsPage(context.pages()[0])
    await trxPage.cancelLimitOrder(`Sell $${amount} of`, limitPrice, context)
    await tradePage.isTransactionSuccesful()
    await tradePage.getTransactionUrl()
  })

  test('User should be able to cancel limit sell OSMO', async () => {
    await tradePage.goto()
    const amount = '1.01'
    await tradePage.openSellTab()
    await tradePage.openLimit()
    await tradePage.selectAsset('OSMO')
    await tradePage.enterAmount(amount)
    await tradePage.setLimitPriceChange('10%')
    const limitPrice = await tradePage.getLimitPrice()
    const { msgContentAmount } = await tradePage.sellAndGetWalletMsg(
      context,
      true,
    )
    expect(msgContentAmount).toBeTruthy()
    //expect(msgContentAmount).toContain(`${amount} OSMO`);
    expect(msgContentAmount).toContain('place_limit')
    expect(msgContentAmount).toContain('"order_direction": "ask"')
    await tradePage.isTransactionSuccesful()
    await tradePage.getTransactionUrl()
    await tradePage.gotoOrdersHistory()
    const trxPage = new TransactionsPage(context.pages()[0])
    await trxPage.cancelLimitOrder(`Sell $${amount} of`, limitPrice, context)
    await tradePage.isTransactionSuccesful()
    await tradePage.getTransactionUrl()
  })
})
