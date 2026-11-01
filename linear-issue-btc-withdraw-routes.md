# Bridge: BTC / cbBTC withdrawals offer networks with no route ("WBTC withdrawals are unavailable")

## Summary

A user reported that cbBTC "can't be withdrawn": the app said there were no routes, but the error heading read **"WBTC withdrawals are unavailable"**.

Cause: Skip's supported-assets lookup lists withdrawal destinations from the whole allBTC family. On some Cosmos networks WBTC is listed but Skip has no route to it. Picking one of those networks auto-selects WBTC, Skip returns "no routes found", and the app shows "WBTC withdrawals are unavailable / no available routes".

## How the flow behaves (checked against production on 2026-10-31)

**Withdrawing BTC (allBTC alloy)**
- Default network is **Bitcoin** (via Nomic), because Bitcoin networks sort first in `use-bridges-supported-assets.ts`.
- Changing network resets the token to the first one on that network (`amount-screen.tsx` ~L1430 `resetAssets()`, then the seed effect ~L704 picks `counterpartyAssets[0]`):
  - Base → cbBTC
  - Ethereum → WBTC
  - Axelar, Cosmos Hub, Gravity Bridge, Wormhole Gateway → WBTC
- **Holding cbBTC.axl:** the withdraw list doesn't group BTC variants, so cbBTC.axl shows as its own row. It gets the same network list, including the dead WBTC entries.

**Skip results for allBTC, 0.02 BTC**

| Network | Token picked | Result |
|---|---|---|
| Base | cbBTC | Works (failed at 0.1 BTC, "USD value difference too large") |
| Ethereum | WBTC | Works |
| Axelar | WBTC | Fails as "amount too low", which shows the fee warning, not "unavailable" |
| **Cosmos Hub** | **WBTC** | **no routes found** → "WBTC withdrawals are unavailable" |
| **Gravity Bridge** | **WBTC** | **no routes found** |
| **Wormhole Gateway** | **WBTC** | **no routes found** |
| Dungeon | dnBTC | no routes found |
| Neutron, Terra, Secret, Persistence, etc. | allBTC | Works |

Only `NoQuotesError` ("no routes found") produces the "{toAsset.denom} withdrawals are unavailable" heading (`use-bridge-quotes.ts` ~L1726). A too-small amount (`InsufficientAmountError`) shows the fee warning instead. So the user's message means they picked Cosmos Hub, Gravity Bridge or Wormhole Gateway. **To do: confirm which network the user had selected.**

## Root cause

`packages/bridge/src/skip/index.ts` ~L845–857 (`getSupportedAssets`) adds every asset-list counterparty of every asset with the same `variantGroupKey`. It only checks that the token exists in Skip's registry on that network, not that Skip can route there from the source token. Skip's `/v2/fungible/assets_from_source` doesn't help: for cbBTC.axl it returns only Axelar.

## Other things found

1. **Skip routes BTC badly to Base and Ethereum.** allBTC is swapped into allUSDC on Osmosis, sent as USDC over Axelar, then swapped back into WBTC/cbBTC on the EVM side. That costs about 5.5%, and at 0.1 BTC it fails to Base. The alloy (pool 1868) could release WBTC.eth.axl (11.40) or cbBTC.axl (3.98) 1:1, but Skip doesn't use it.
2. **cbBTC.axl → Base cbBTC is never a direct Axelar transfer on Skip.** Every route swaps into WBTC.eth.axl via pool 1868, sends it over Axelar, then swaps on Base. Small amounts fail on fees; 0.1 BTC failed in one test with "Unable to determine if the estimated output is favorable". Squid lists Base cbBTC for cbBTC.axl and may be the better route; not tested.
3. **The default Bitcoin route is unverified.** It goes through Nomic, and nBTC is marked withdrawals-halted (`manual`) in the asset list. Need to check whether that route can quote. If it fails, the message would say "BTC".

## Possible fixes

1. **Recommended:** on withdraw, stop offering family-member networks that have no route. Either check routes before listing them, or limit the family merge to EVM destinations that share the Axelar path, so Cosmos Hub, Gravity Bridge and Wormhole WBTC disappear.
2. When there are no quotes, word the heading around the token being withdrawn and the network, not the auto-picked destination token.
3. Look at Squid, or a direct Axelar path, for cbBTC.axl → Base and allBTC → EVM to avoid the ~5.5% USDC round trip.

## Workaround for users

- Withdraw BTC to **Ethereum (WBTC)** or **Base (cbBTC)** with at least about 0.02 BTC.
- cbBTC.axl holders can also withdraw to **Axelar** (direct transfer), or use the Squid link for Base.

## Related on-chain context (2026-11-01): native WBTC wind-down

- Controller `osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743`: supply 85.95526778 WBTC, 0.0208 WBTC burned ever (3 burns; the last was 0.01 on 2026-09-07). Supply matches the mint/burn records exactly.
- Main merchant `osmo1xz85h2nvc5l5dxvjpajvdcnk4wq20nydzunvn2` holds 20.09805626 WBTC. It swapped WBTC.eth.axl into native WBTC via pool 1868 on Oct 29 (5.0) and Oct 30 (6.1).
- The allBTC alloy holds about 52.66 native WBTC, about 61% of supply.
