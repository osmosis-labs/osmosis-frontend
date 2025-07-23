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
    { name: 'OSMO', minimalDenom: 'uosmo' },
    {
      name: 'ATOM',
      minimalDenom:
        'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
    },
    {
      name: 'USDT',
      minimalDenom:
        'factory/osmo1em6xs47hd82806f5cxgyufguxrrc7l0aqx7nzzptjuqgswczk8csavdxek/alloyed/allUSDT',
    },
    {
      name: 'USDC',
      minimalDenom:
        'ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4',
    },
    {
      name: 'TIA',
      minimalDenom:
        'ibc%2FD79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877',
    },
    {
      name: 'DAI',
      minimalDenom:
        'ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7',
    },
  ].forEach(({ name, minimalDenom }) => {
    test(`User should be able to see native balances for ${name}`, async () => {
      await portfolioPage.searchForToken(name)
      const osmoBalance = await portfolioPage.getBalanceFor({
        name,
        minimalDenom,
      })
      expect(osmoBalance).toMatch(dollarBalanceRegEx)
    })
  })
  // biome-ignore lint/complexity/noForEach: <explanation>
  ;[
    {
      name: 'INJ',
      minimalDenom:
        'ibc/64BA6E31FE887D66C6F8F31C7B1A80C7CA179239677B4088BB55F5EA07DBE273',
    },
    {
      name: 'ETH.axl',
      minimalDenom:
        'ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5',
    },
    {
      name: 'SOL',
      minimalDenom:
        'factory/osmo1n3n75av8awcnw4jl62n3l48e6e4sxqmaf97w5ua6ddu4s475q5qq9udvx4/alloyed/allSOL',
    },
    {
      name: 'milkTIA',
      minimalDenom:
        'factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA',
    },
    {
      name: 'BTC',
      minimalDenom:
        'factory/osmo1z6r6qdknhgsc0zeracktgpcxf43j6sekq07nw8sxduc9lg0qjjlqfu25e3/alloyed/allBTC',
    },
    {
      name: 'WBTC',
      minimalDenom:
        'factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc',
    },
    {
      name: 'ETH',
      minimalDenom:
        'factory/osmo1k6c8jln7ejuqwtqmay3yvzrg3kueaczl96pk067ldg8u835w0yhsw27twm/alloyed/allETH',
    },
  ].forEach(({ name, minimalDenom }) => {
    test(`User should be able to see bridged balances for ${name}`, async () => {
      await portfolioPage.searchForToken(name)
      const osmoBalance = await portfolioPage.getBalanceFor({
        name,
        minimalDenom,
      })
      expect(osmoBalance).toMatch(dollarBalanceRegEx)
    })
  })
})
