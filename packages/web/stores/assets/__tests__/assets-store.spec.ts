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
              "coinDecimals": 8,
              "coinDenom": "SHD",
              "coinGeckoId": "shade-protocol",
              "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/shd.svg",
              "coinMinimalDenom": "ibc/0B3D528E74E3DEAADF8A68F393887AC7E06028904D02173561B0D27F6E751D0A",
              "originChainId": "secret-4",
              "originCurrency": {
                "coinDecimals": 8,
                "coinDenom": "SHD",
                "coinGeckoId": "shade-protocol",
                "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/shd.svg",
                "coinMinimalDenom": "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm:SHD",
              },
              "paths": [
                {
                  "channelId": "channel-476",
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
                "maxDecimals": 8,
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
                "bech32PrefixAccAddr": "secret",
                "bech32PrefixAccPub": "secretpub",
                "bech32PrefixConsAddr": "secretvalcons",
                "bech32PrefixConsPub": "secretvalconspub",
                "bech32PrefixValAddr": "secretvaloper",
                "bech32PrefixValPub": "secretvaloperpub",
              },
              "bip44": {
                "coinType": 529,
              },
              "chainId": "secret-4",
              "chainName": "secretnetwork",
              "currencies": [
                {
                  "coinDecimals": 6,
                  "coinDenom": "SCRT",
                  "coinGeckoId": "secret",
                  "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.svg",
                  "coinMinimalDenom": "uscrt",
                },
                {
                  "coinDecimals": 6,
                  "coinDenom": "ALTER",
                  "coinGeckoId": "alter",
                  "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/alter.svg",
                  "coinMinimalDenom": "cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej:ALTER",
                },
                {
                  "coinDecimals": 6,
                  "coinDenom": "BUTT",
                  "coinGeckoId": "buttcoin-2",
                  "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/butt.svg",
                  "coinMinimalDenom": "cw20:secret1yxcexylwyxlq58umhgsjgstgcg2a0ytfy4d9lt:BUTT",
                },
                {
                  "coinDecimals": 8,
                  "coinDenom": "SHD(old)",
                  "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/shdold.svg",
                  "coinMinimalDenom": "cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d:SHD(old)",
                },
                {
                  "coinDecimals": 18,
                  "coinDenom": "SIENNA",
                  "coinGeckoId": "sienna",
                  "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/sienna.svg",
                  "coinMinimalDenom": "cw20:secret1rgm2m5t530tdzyd99775n6vzumxa5luxcllml4:SIENNA",
                },
                {
                  "coinDecimals": 6,
                  "coinDenom": "stkd-SCRT",
                  "coinGeckoId": "stkd-scrt",
                  "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/stkd-scrt.svg",
                  "coinMinimalDenom": "cw20:secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4:stkd-SCRT",
                },
                {
                  "coinDecimals": 6,
                  "coinDenom": "AMBER",
                  "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/amber.svg",
                  "coinMinimalDenom": "cw20:secret1s09x2xvfd2lp2skgzm29w2xtena7s8fq98v852:AMBER",
                },
                {
                  "coinDecimals": 6,
                  "coinDenom": "SILK",
                  "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/silk.svg",
                  "coinMinimalDenom": "cw20:secret1fl449muk5yq8dlad7a22nje4p5d2pnsgymhjfd:SILK",
                },
                {
                  "coinDecimals": 8,
                  "coinDenom": "SHD",
                  "coinGeckoId": "shade-protocol",
                  "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/shd.svg",
                  "coinMinimalDenom": "cw20:secret153wu605vvp934xhd4k9dtd640zsep5jkesstdm:SHD",
                },
              ],
              "explorerUrlToTx": "",
              "features": [
                "ibc-transfer",
                "ibc-go",
                "secretwasm",
                "cosmwasm",
                "wasmd_0.24+",
              ],
              "feeCurrencies": [
                {
                  "coinDecimals": 6,
                  "coinDenom": "SCRT",
                  "coinGeckoId": "secret",
                  "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.svg",
                  "coinMinimalDenom": "uscrt",
                },
              ],
              "prettyChainName": "Secret Network",
              "rest": "https://lcd-secret.keplr.app",
              "rpc": "https://rpc-secret.keplr.app",
              "stakeCurrency": {
                "coinDecimals": 6,
                "coinDenom": "SCRT",
                "coinGeckoId": "secret",
                "coinImageUrl": "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.svg",
                "coinMinimalDenom": "uscrt",
              },
            },
            "currencyRegistrars": [],
            "registeredCurrencies": [],
            "unknownDenoms": [],
          },
          "depositUrlOverride": "https://dash.scrt.network/ibc",
          "depositingSrcMinDenom": undefined,
          "destChannelId": "channel-44",
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
          "ics20ContractAddress": "secret1tqmms5awftpuhalcv5h5mg76fa0tkdz4jv9ex4",
          "isUnstable": false,
          "isVerified": true,
          "sourceChannelId": "channel-476",
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
