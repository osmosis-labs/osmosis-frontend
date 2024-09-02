# @osmosis-labs/web/e2e

This package contains the Playwright E2E tests and a Keplr wallet

## Environment Variables

By default, configuration is pointing to the [Stage](https://stage.osmosis.zone) environment. Tests will automatically install a wallet.
All you need to add is a private keys for wallets that are being used:

- Frontend tests are using `osmo1ka7q9tykdundaanr07taz3zpt5k72c0ut5r4xa` wallet
- Monitoring tests are using `osmo1dkmsds5j6q9l9lv4dkhas68767tlqfx8ls5j0c` and `osmo1fapvfx64af2eperkggnwd6zmpzdvvnq4xjc2dv` wallets
- example command `export PRIVATE_KEY=0x....` for the frontend tests.

### Run E2E Tests

To install Playwright, please execute `npx playwright install --with-deps chromium` from the /web folder.

To run a Select pair tests, please execute `npx playwright test -g "Test Select Swap Pair feature"` from the /web folder.
To run a Swap E2E tests, please execute `npx playwright test -g "Test Swap feature"` from the /web folder.
To run a Monitoring E2E tests, please execute `npx playwright test monitoring --timeout 180000` from the /web folder.

Tests can be executed locally in a browser by changing `headless: true` to `headless: false`.

In CI secrets frontend test private key is referenced as:
TEST_PRIVATE_KEY for `osmo1ka7q9tykdundaanr07taz3zpt5k72c0ut5r4xa`

Frontend e2e test wallet must contain following tokens:

- OSMO > 10
- ATOM > 1
- INJ > 0.4
- TIA > 0.5
- AKT > 1
- BTC > 0
- WBTC > 0
- SOL > 0
- SOL.wh > 0
- ETH.axl > 0
- DAI > 0
- milkTIA > 0
- KUJI > 0
- USDC > 5
- USDT > 2
- USDC.eth.axl > 2

Tokens marked as `> 0` are needed for a portfolio balances test.

### Synthetic Geo Monitoring Frontend tests

Monitoring tests are using `osmo1dkmsds5j6q9l9lv4dkhas68767tlqfx8ls5j0c` and `osmo1fapvfx64af2eperkggnwd6zmpzdvvnq4xjc2dv` wallets for a different regions.
In CI secrets they are referenced as:
TEST_PRIVATE_KEY_1 for `osmo1dkmsds5j6q9l9lv4dkhas68767tlqfx8ls5j0c`
TEST_PRIVATE_KEY_2 for `osmo1fapvfx64af2eperkggnwd6zmpzdvvnq4xjc2dv`

Each monitoring test wallet must contain following tokens:

- OSMO > 10
- USDC > 10
- USDT > 2
- USDC.eth.axl > 2

The USDC is used to buy OSMO and WBTC and must be kept above 5$ at all times, so it is better to have some buffer.
