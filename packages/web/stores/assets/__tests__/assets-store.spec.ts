import {
  CosmosQueries,
  CosmwasmQueries,
  QueriesStore,
} from "@osmosis-labs/keplr-stores";
import {
  AccountStore,
  ChainStore,
  OsmosisQueries,
  PoolFallbackPriceStore,
} from "@osmosis-labs/stores";

import {
  BlacklistedPoolIds,
  TransmuterPoolCodeIds,
} from "~/config/feature-flag";
import { AssetLists } from "~/config/mock-asset-lists";
import { MockChains } from "~/config/mock-chains";
import { ObservableAssets } from "~/stores/assets/assets-store";
import { mockChainInfos, mockIbcAssets } from "~/stores/assets/test-mock-data";
import { makeLocalStorageKVStore } from "~/stores/kv-store";
import { UnverifiedAssetsUserSetting } from "~/stores/user-settings/unverified-assets";
import { UserSettings } from "~/stores/user-settings/user-settings-store";

function makeAssetsStore() {
  const osmosisChainId = mockChainInfos[0].chainId;
  const chainStore = new ChainStore(mockChainInfos, osmosisChainId);
  const webApiBaseUrl =
    typeof window !== "undefined" ? window.origin : "https://app.osmosis.zone";
  const queriesStore = new QueriesStore<
    [CosmosQueries, CosmwasmQueries, OsmosisQueries]
  >(
    makeLocalStorageKVStore("store_web_queries_v12"),
    chainStore,
    CosmosQueries.use(),
    CosmwasmQueries.use(),
    OsmosisQueries.use(
      osmosisChainId,
      webApiBaseUrl,
      BlacklistedPoolIds,
      TransmuterPoolCodeIds
    )
  );
  const accountStore = new AccountStore(
    MockChains,
    osmosisChainId,
    AssetLists,
    [],
    queriesStore,
    chainStore
  );
  const priceStore = new PoolFallbackPriceStore(
    osmosisChainId,
    chainStore,
    makeLocalStorageKVStore("store_web_prices"),
    {
      usd: {
        currency: "usd",
        symbol: "$",
        maxDecimals: 2,
        locale: "en-US",
      },
    },
    "usd",
    queriesStore.get(osmosisChainId).osmosis!.queryPools,
    []
  );
  const userSettingKvStore = makeLocalStorageKVStore("user_setting");
  const userSettings = new UserSettings(userSettingKvStore, [
    new UnverifiedAssetsUserSetting(),
  ]);
  return new ObservableAssets(
    mockIbcAssets,
    chainStore,
    accountStore,
    queriesStore,
    priceStore,
    osmosisChainId,
    userSettings
  );
}

describe("ObservableAssets", () => {
  it.only("should return unverified assets", () => {
    const assetsStore = makeAssetsStore();

    expect(assetsStore.unverifiedIbcBalances).toMatchInlineSnapshot(`
      [
        {
          "balance": CoinPretty {
            "_currency": {
              "coinDecimals": 6,
              "coinDenom": "ATOM",
              "coinGeckoId": "pool:uatom",
              "coinImageUrl": undefined,
              "coinMinimalDenom": "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
              "originChainId": "cosmoshub-4",
              "originCurrency": {
                "coinDecimals": 6,
                "coinDenom": "ATOM",
                "coinGeckoId": "pool:uatom",
                "coinMinimalDenom": "uatom",
              },
              "paths": [
                {
                  "channelId": "channel-0",
                  "portId": "transfer",
                },
              ],
            },
            "_options": {
              "hideDenom": false,
              "lowerCase": false,
              "separator": " ",
              "upperCase": false,
            },
            "amount": Dec {
              "int": "0",
            },
            "intPretty": IntPretty {
              "_options": {
                "inequalitySymbol": false,
                "inequalitySymbolSeparator": " ",
                "locale": true,
                "maxDecimals": 6,
                "ready": true,
                "shrink": false,
                "trim": false,
              },
              "dec": Dec {
                "int": "0",
              },
              "floatingDecimalPointRight": 0,
            },
          },
          "chainInfo": ChainInfoInner {
            "_chainInfo": {
              "bech32Config": {
                "bech32PrefixAccAddr": "cosmos",
                "bech32PrefixAccPub": "cosmospub",
                "bech32PrefixConsAddr": "cosmosvalcons",
                "bech32PrefixConsPub": "cosmosvalconspub",
                "bech32PrefixValAddr": "cosmosvaloper",
                "bech32PrefixValPub": "cosmosvaloperpub",
              },
              "bip44": {
                "coinType": 118,
              },
              "chainId": "cosmoshub-4",
              "chainName": "Cosmos Hub",
              "currencies": [
                {
                  "coinDecimals": 6,
                  "coinDenom": "ATOM",
                  "coinGeckoId": "pool:uatom",
                  "coinMinimalDenom": "uatom",
                },
                {
                  "coinDecimals": 18,
                  "coinDenom": "PSTAKE",
                  "coinGeckoId": "pool:pstake",
                  "coinMinimalDenom": "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
                },
                {
                  "coinDecimals": 8,
                  "coinDenom": "SHD",
                  "coinGeckoId": "pool:shd",
                  "coinImageUrl": "/tokens/shd.svg",
                  "coinMinimalDenom": "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm:SHD",
                  "contractAddress": "secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm",
                  "type": "cw20",
                },
              ],
              "explorerUrlToTx": "",
              "features": [
                "ibc-transfer",
                "ibc-go",
              ],
              "feeCurrencies": [
                {
                  "coinDecimals": 6,
                  "coinDenom": "ATOM",
                  "coinGeckoId": "pool:uatom",
                  "coinMinimalDenom": "uatom",
                },
              ],
              "prettyChainName": "Cosmos Hub",
              "rest": "https://lcd-cosmoshub.keplr.app",
              "rpc": "https://rpc-cosmoshub.keplr.app",
              "stakeCurrency": {
                "coinDecimals": 6,
                "coinDenom": "ATOM",
                "coinGeckoId": "pool:uatom",
                "coinMinimalDenom": "uatom",
              },
            },
            "currencyRegistrars": [],
            "registeredCurrencies": [],
            "unknownDenoms": [],
          },
          "depositingSrcMinDenom": undefined,
          "destChannelId": "channel-141",
          "fiatValue": PricePretty {
            "_fiatCurrency": {
              "currency": "usd",
              "locale": "en-US",
              "maxDecimals": 2,
              "symbol": "$",
            },
            "_options": {
              "locale": "en-US",
              "lowerCase": false,
              "separator": "",
              "upperCase": false,
            },
            "amount": 0,
            "intPretty": IntPretty {
              "_options": {
                "inequalitySymbol": true,
                "inequalitySymbolSeparator": " ",
                "locale": false,
                "maxDecimals": 2,
                "ready": true,
                "shrink": true,
                "trim": true,
              },
              "dec": Dec {
                "int": "0",
              },
              "floatingDecimalPointRight": 0,
            },
          },
          "isUnstable": false,
          "isVerified": true,
          "sourceChannelId": "channel-0",
        },
        {
          "balance": CoinPretty {
            "_currency": {
              "coinDecimals": 18,
              "coinDenom": "PSTAKE",
              "coinGeckoId": undefined,
              "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.svg",
              "coinMinimalDenom": "ibc/8061A06D3BD4D52C4A28FFECF7150D370393AF0BA661C3776C54FF32836C3961",
              "originChainId": "core-1",
              "originCurrency": {
                "coinDecimals": 18,
                "coinDenom": "PSTAKE",
                "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.svg",
                "coinMinimalDenom": "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
              },
              "paths": [
                {
                  "channelId": "channel-4",
                  "portId": "transfer",
                },
              ],
            },
            "_options": {
              "hideDenom": false,
              "lowerCase": false,
              "separator": " ",
              "upperCase": false,
            },
            "amount": Dec {
              "int": "0",
            },
            "intPretty": IntPretty {
              "_options": {
                "inequalitySymbol": false,
                "inequalitySymbolSeparator": " ",
                "locale": true,
                "maxDecimals": 18,
                "ready": true,
                "shrink": false,
                "trim": false,
              },
              "dec": Dec {
                "int": "0",
              },
              "floatingDecimalPointRight": 0,
            },
          },
          "chainInfo": ChainInfoInner {
            "_chainInfo": {
              "bech32Config": {
                "bech32PrefixAccAddr": "persistence",
                "bech32PrefixAccPub": "persistencepub",
                "bech32PrefixConsAddr": "persistencevalcons",
                "bech32PrefixConsPub": "persistencevalconspub",
                "bech32PrefixValAddr": "persistencevaloper",
                "bech32PrefixValPub": "persistencevaloperpub",
              },
              "bip44": {
                "coinType": 118,
              },
              "chainId": "core-1",
              "chainName": "persistence",
              "currencies": [
                {
                  "coinDecimals": 6,
                  "coinDenom": "XPRT",
                  "coinGeckoId": "persistence",
                  "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/xprt.svg",
                  "coinMinimalDenom": "uxprt",
                },
                {
                  "coinDecimals": 18,
                  "coinDenom": "PSTAKE",
                  "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.svg",
                  "coinMinimalDenom": "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
                },
                {
                  "coinDecimals": 6,
                  "coinDenom": "stkATOM",
                  "coinGeckoId": "stkatom",
                  "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/stkatom.svg",
                  "coinMinimalDenom": "stk/uatom",
                },
              ],
              "explorerUrlToTx": "",
              "features": [
                "ibc-transfer",
                "ibc-go",
              ],
              "feeCurrencies": [
                {
                  "coinDecimals": 6,
                  "coinDenom": "XPRT",
                  "coinGeckoId": "persistence",
                  "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/xprt.svg",
                  "coinMinimalDenom": "uxprt",
                },
              ],
              "prettyChainName": "Persistence",
              "rest": "https://lcd-persistence.keplr.app",
              "rpc": "https://rpc-persistence.keplr.app",
              "stakeCurrency": {
                "coinDecimals": 6,
                "coinDenom": "XPRT",
                "coinGeckoId": "persistence",
                "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/xprt.svg",
                "coinMinimalDenom": "uxprt",
              },
            },
            "currencyRegistrars": [],
            "registeredCurrencies": [],
            "unknownDenoms": [],
          },
          "depositingSrcMinDenom": "ibc/A6E3AF63B3C906416A9AF7A556C59EA4BD50E617EFFE6299B99700CCB780E444",
          "destChannelId": "channel-6",
          "fiatValue": PricePretty {
            "_fiatCurrency": {
              "currency": "usd",
              "locale": "en-US",
              "maxDecimals": 2,
              "symbol": "$",
            },
            "_options": {
              "locale": "en-US",
              "lowerCase": false,
              "separator": "",
              "upperCase": false,
            },
            "amount": 0,
            "intPretty": IntPretty {
              "_options": {
                "inequalitySymbol": true,
                "inequalitySymbolSeparator": " ",
                "locale": false,
                "maxDecimals": 2,
                "ready": true,
                "shrink": true,
                "trim": true,
              },
              "dec": Dec {
                "int": "0",
              },
              "floatingDecimalPointRight": 0,
            },
          },
          "isUnstable": false,
          "isVerified": true,
          "sourceChannelId": "channel-4",
        },
      ]
    `);
  });
});
