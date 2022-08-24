# Axelar Integration

This folder contains all files related to the user transfer of assets via Axelar via the frontend.

## Testing

> 💡 Complete the following steps to use the frontend to bridge a particular test asset between Ethereum (Ropsten), Axelar (testnet1), and Osmosis (osmo-test-4) testnets. Testnet config values should be commented next to the mainnet values.

1. **Configure test chain infos:** in chain-infos.ts: set Osmosis and [Axelar endpoints](https://docs.axelar.dev/resources) and chain IDs to test values.
2. **Configure the root store**: in web/root.ts:
   1. Change the second arg of the `ChainStore` construction to be the Osmosis testnet ID (likely "osmo-test-4").
   2. Pass in the test Axelarscan and Axelar API endpoints in the constructor of `AxelarTransferStatusSource` respectively:
   - `"https://testnet.axelarscan.io/"`
   - `"https://testnet.api.axelarscan.io/"`.
3. **Configure test IBC assets:** in ibc-assets.ts:
   1. On the relevant asset(s): `counterpartyChainId`, `sourceChannelId`, and `destChannelId` to the relevant test values found [here](https://docs.axelar.dev/resources/testnet#ibc-channels).
   2. On `originBridgeInfo`, set `tokenMinDenom` to the test denom. [[Axelar test assets]](https://testnet.axelarscan.io/assets)
   3. Comment out any other Axelar asset configs you haven't updated to test values.
4. **Configure the UI and Axelar SDK:** in axelar/transfer.tsx: set `isTestNet` prop to default to `true`.
5. **Configure the source Axelar network info:** in axelar/types.ts:`SourceChainConfigs`, set network ids (`id`) and `erc20ContractAddress`s to test values for relevant asset and source network combos you are testing.
