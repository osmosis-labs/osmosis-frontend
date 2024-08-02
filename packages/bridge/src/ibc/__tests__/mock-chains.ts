import { Chain } from "@osmosis-labs/server";

export const MockGeneratedChains: Chain[] = [
  {
    chain_name: "osmosis",
    status: "live",
    networkType: "mainnet",
    prettyName: "Osmosis",
    chain_id: "osmosis-1",
    bech32Prefix: "osmo",
    bech32Config: {
      bech32PrefixAccAddr: "osmo",
      bech32PrefixAccPub: "osmopub",
      bech32PrefixValAddr: "osmovaloper",
      bech32PrefixValPub: "osmovaloperpub",
      bech32PrefixConsAddr: "osmovalcons",
      bech32PrefixConsPub: "osmovalconspub",
    },
    slip44: 118,
    stakeCurrency: {
      coinDenom: "OSMO",
      chainSuggestionDenom: "uosmo",
      coinMinimalDenom: "uosmo",
      coinDecimals: 6,
      coinGeckoId: "osmosis",
      coinImageUrl:
        "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png",
    },
    feeCurrencies: [
      {
        coinDenom: "OSMO",
        chainSuggestionDenom: "uosmo",
        coinMinimalDenom: "uosmo",
        coinDecimals: 6,
        coinGeckoId: "osmosis",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png",
        gasPriceStep: { low: 0.0025, average: 0.025, high: 0.04 },
      },
    ],
    currencies: [
      {
        coinDenom: "OSMO",
        chainSuggestionDenom: "uosmo",
        coinMinimalDenom: "uosmo",
        coinDecimals: 6,
        coinGeckoId: "osmosis",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png",
      },
      {
        coinDenom: "ION",
        chainSuggestionDenom: "uion",
        coinMinimalDenom: "uion",
        coinDecimals: 6,
        coinGeckoId: "ion",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/ion.png",
      },
      {
        coinDenom: "USDC.axl",
        chainSuggestionDenom:
          "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        coinMinimalDenom:
          "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        coinDecimals: 6,
        coinGeckoId: "axlusdc",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdc.axl.png",
      },
      {
        coinDenom: "ETH",
        chainSuggestionDenom:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        coinMinimalDenom:
          "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5",
        coinDecimals: 18,
        coinGeckoId: "weth",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.png",
      },
      {
        coinDenom: "WBTC.axl",
        chainSuggestionDenom:
          "ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F",
        coinMinimalDenom:
          "ibc/D1542AA8762DB13087D8364F3EA6509FD6F009A34F00426AF9E4F9FA85CBBF1F",
        coinDecimals: 8,
        coinGeckoId: "axlwbtc",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/wbtc.axl.png",
      },
      {
        coinDenom: "USDT.axl",
        chainSuggestionDenom:
          "ibc/8242AD24008032E457D2E12D46588FD39FB54FB29680C6C7663D296B383C37C4",
        coinMinimalDenom:
          "ibc/8242AD24008032E457D2E12D46588FD39FB54FB29680C6C7663D296B383C37C4",
        coinDecimals: 6,
        coinGeckoId: "axelar-usdt",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/usdt.png",
      },
      {
        coinDenom: "DAI",
        chainSuggestionDenom:
          "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
        coinMinimalDenom:
          "ibc/0CD3A0285E1341859B5E86B6AB7682F023D03E97607CCC1DC95706411D866DF7",
        coinDecimals: 18,
        coinGeckoId: "dai",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/dai.svg",
      },
      {
        coinDenom: "BUSD",
        chainSuggestionDenom:
          "ibc/6329DD8CF31A334DD5BE3F68C846C9FE313281362B37686A62343BAC1EB1546D",
        coinMinimalDenom:
          "ibc/6329DD8CF31A334DD5BE3F68C846C9FE313281362B37686A62343BAC1EB1546D",
        coinDecimals: 18,
        coinGeckoId: "binance-usd",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/busd.png",
      },
      {
        coinDenom: "ATOM",
        chainSuggestionDenom:
          "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        coinMinimalDenom:
          "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png",
      },
      {
        coinDenom: "CRO",
        chainSuggestionDenom:
          "ibc/E6931F78057F7CC5DA0FD6CEF82FF39373A6E0452BF1FD76910B93292CF356C1",
        coinMinimalDenom:
          "ibc/E6931F78057F7CC5DA0FD6CEF82FF39373A6E0452BF1FD76910B93292CF356C1",
        coinDecimals: 8,
        coinGeckoId: "crypto-com-chain",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/cronos/images/cro.svg",
      },
      {
        coinDenom: "BNB",
        chainSuggestionDenom:
          "ibc/F4A070A6D78496D53127EA85C094A9EC87DFC1F36071B8CCDDBD020F933D213D",
        coinMinimalDenom:
          "ibc/F4A070A6D78496D53127EA85C094A9EC87DFC1F36071B8CCDDBD020F933D213D",
        coinDecimals: 18,
        coinGeckoId: "wbnb",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/bnb.png",
      },
      {
        coinDenom: "MATIC",
        chainSuggestionDenom:
          "ibc/AB589511ED0DD5FA56171A39978AFBF1371DB986EC1C3526CE138A16377E39BB",
        coinMinimalDenom:
          "ibc/AB589511ED0DD5FA56171A39978AFBF1371DB986EC1C3526CE138A16377E39BB",
        coinDecimals: 18,
        coinGeckoId: "wmatic",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polygon/images/matic-purple.png",
      },
      {
        coinDenom: "AVAX",
        chainSuggestionDenom:
          "ibc/6F62F01D913E3FFE472A38C78235B8F021B511BC6596ADFF02615C8F83D3B373",
        coinMinimalDenom:
          "ibc/6F62F01D913E3FFE472A38C78235B8F021B511BC6596ADFF02615C8F83D3B373",
        coinDecimals: 18,
        coinGeckoId: "wrapped-avax",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/avalanche/images/avax.png",
      },
      {
        coinDenom: "LUNC",
        chainSuggestionDenom:
          "ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0",
        coinMinimalDenom:
          "ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0",
        coinDecimals: 6,
        coinGeckoId: "terra-luna",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/luna.png",
      },
      {
        coinDenom: "JUNO",
        chainSuggestionDenom:
          "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED",
        coinMinimalDenom:
          "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED",
        coinDecimals: 6,
        coinGeckoId: "juno-network",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.png",
      },
      {
        coinDenom: "moonbeam.DOT.axl",
        chainSuggestionDenom:
          "ibc/3FF92D26B407FD61AE95D975712A7C319CDE28DE4D80BDC9978D935932B991D7",
        coinMinimalDenom:
          "ibc/3FF92D26B407FD61AE95D975712A7C319CDE28DE4D80BDC9978D935932B991D7",
        coinDecimals: 10,
        coinGeckoId: "polkadot",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.png",
      },
      {
        coinDenom: "EVMOS",
        chainSuggestionDenom:
          "ibc/6AE98883D4D5D5FF9E50D7130F1305DA2FFA0C652D1DD9C123657C6B4EB2DF8A",
        coinMinimalDenom:
          "ibc/6AE98883D4D5D5FF9E50D7130F1305DA2FFA0C652D1DD9C123657C6B4EB2DF8A",
        coinDecimals: 18,
        coinGeckoId: "evmos",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/evmos.png",
      },
      {
        coinDenom: "KAVA",
        chainSuggestionDenom:
          "ibc/57AA1A70A4BC9769C525EBF6386F7A21536E04A79D62E1981EFCEF9428EBB205",
        coinMinimalDenom:
          "ibc/57AA1A70A4BC9769C525EBF6386F7A21536E04A79D62E1981EFCEF9428EBB205",
        coinDecimals: 6,
        coinGeckoId: "kava",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/kava.png",
      },
      {
        coinDenom: "SCRT",
        chainSuggestionDenom:
          "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A",
        coinMinimalDenom:
          "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A",
        coinDecimals: 6,
        coinGeckoId: "secret",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.png",
      },
      {
        coinDenom: "USTC",
        chainSuggestionDenom:
          "ibc/BE1BB42D4BE3C30D50B68D7C41DB4DFCE9678E8EF8C539F6E6A9345048894FCC",
        coinMinimalDenom:
          "ibc/BE1BB42D4BE3C30D50B68D7C41DB4DFCE9678E8EF8C539F6E6A9345048894FCC",
        coinDecimals: 6,
        coinGeckoId: "terrausd",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/ust.png",
      },
      {
        coinDenom: "STARS",
        chainSuggestionDenom:
          "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4",
        coinMinimalDenom:
          "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4",
        coinDecimals: 6,
        coinGeckoId: "stargaze",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.png",
      },
      {
        coinDenom: "HUAHUA",
        chainSuggestionDenom:
          "ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228",
        coinMinimalDenom:
          "ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228",
        coinDecimals: 6,
        coinGeckoId: "chihuahua-token",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/huahua.png",
      },
      {
        coinDenom: "XPRT",
        chainSuggestionDenom:
          "ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293",
        coinMinimalDenom:
          "ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293",
        coinDecimals: 6,
        coinGeckoId: "persistence",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/xprt.png",
      },
      {
        coinDenom: "PSTAKE",
        chainSuggestionDenom:
          "ibc/8061A06D3BD4D52C4A28FFECF7150D370393AF0BA661C3776C54FF32836C3961",
        coinMinimalDenom:
          "ibc/8061A06D3BD4D52C4A28FFECF7150D370393AF0BA661C3776C54FF32836C3961",
        coinDecimals: 18,
        coinGeckoId: "pstake-finance",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/pstake.png",
      },
      {
        coinDenom: "AKT",
        chainSuggestionDenom:
          "ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4",
        coinMinimalDenom:
          "ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4",
        coinDecimals: 6,
        coinGeckoId: "akash-network",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/akash/images/akt.png",
      },
      {
        coinDenom: "REGEN",
        chainSuggestionDenom:
          "ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076",
        coinMinimalDenom:
          "ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076",
        coinDecimals: 6,
        coinGeckoId: "regen",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/regen.png",
      },
      {
        coinDenom: "DVPN",
        chainSuggestionDenom:
          "ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84",
        coinMinimalDenom:
          "ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84",
        coinDecimals: 6,
        coinGeckoId: "sentinel",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/sentinel/images/dvpn.png",
      },
      {
        coinDenom: "IRIS",
        chainSuggestionDenom:
          "ibc/7C4D60AA95E5A7558B0A364860979CA34B7FF8AAF255B87AF9E879374470CEC0",
        coinMinimalDenom:
          "ibc/7C4D60AA95E5A7558B0A364860979CA34B7FF8AAF255B87AF9E879374470CEC0",
        coinDecimals: 6,
        coinGeckoId: "iris-network",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/irisnet/images/iris.png",
      },
      {
        coinDenom: "IOV",
        chainSuggestionDenom:
          "ibc/52B1AA623B34EB78FD767CEA69E8D7FA6C9CFE1FBF49C5406268FD325E2CC2AC",
        coinMinimalDenom:
          "ibc/52B1AA623B34EB78FD767CEA69E8D7FA6C9CFE1FBF49C5406268FD325E2CC2AC",
        coinDecimals: 6,
        coinGeckoId: "starname",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/starname/images/iov.png",
      },
      {
        coinDenom: "NGM",
        chainSuggestionDenom:
          "ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59",
        coinMinimalDenom:
          "ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59",
        coinDecimals: 6,
        coinGeckoId: "e-money",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/ngm.png",
      },
      {
        coinDenom: "EEUR",
        chainSuggestionDenom:
          "ibc/5973C068568365FFF40DEDCF1A1CB7582B6116B731CD31A12231AE25E20B871F",
        coinMinimalDenom:
          "ibc/5973C068568365FFF40DEDCF1A1CB7582B6116B731CD31A12231AE25E20B871F",
        coinDecimals: 6,
        coinGeckoId: "e-money-eur",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/emoney/images/eeur.png",
      },
      {
        coinDenom: "LIKE",
        chainSuggestionDenom:
          "ibc/9989AD6CCA39D1131523DB0617B50F6442081162294B4795E26746292467B525",
        coinMinimalDenom:
          "ibc/9989AD6CCA39D1131523DB0617B50F6442081162294B4795E26746292467B525",
        coinDecimals: 9,
        coinGeckoId: "likecoin",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/likecoin/images/like.png",
      },
      {
        coinDenom: "IXO",
        chainSuggestionDenom:
          "ibc/F3FF7A84A73B62921538642F9797C423D2B4C4ACB3C7FCFFCE7F12AA69909C4B",
        coinMinimalDenom:
          "ibc/F3FF7A84A73B62921538642F9797C423D2B4C4ACB3C7FCFFCE7F12AA69909C4B",
        coinDecimals: 6,
        coinGeckoId: "ixo",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/impacthub/images/ixo.png",
      },
      {
        coinDenom: "BCNA",
        chainSuggestionDenom:
          "ibc/D805F1DA50D31B96E4282C1D4181EDDFB1A44A598BFF5666F4B43E4B8BEA95A5",
        coinMinimalDenom:
          "ibc/D805F1DA50D31B96E4282C1D4181EDDFB1A44A598BFF5666F4B43E4B8BEA95A5",
        coinDecimals: 6,
        coinGeckoId: "bitcanna",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitcanna/images/bcna.png",
      },
      {
        coinDenom: "BTSG",
        chainSuggestionDenom:
          "ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452",
        coinMinimalDenom:
          "ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452",
        coinDecimals: 6,
        coinGeckoId: "bitsong",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/bitsong/images/btsg.png",
      },
      {
        coinDenom: "XKI",
        chainSuggestionDenom:
          "ibc/B547DC9B897E7C3AA5B824696110B8E3D2C31E3ED3F02FF363DCBAD82457E07E",
        coinMinimalDenom:
          "ibc/B547DC9B897E7C3AA5B824696110B8E3D2C31E3ED3F02FF363DCBAD82457E07E",
        coinDecimals: 6,
        coinGeckoId: "ki",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/kichain/images/xki.png",
      },
      {
        coinDenom: "MED",
        chainSuggestionDenom:
          "ibc/3BCCC93AD5DF58D11A6F8A05FA8BC801CBA0BA61A981F57E91B8B598BF8061CB",
        coinMinimalDenom:
          "ibc/3BCCC93AD5DF58D11A6F8A05FA8BC801CBA0BA61A981F57E91B8B598BF8061CB",
        coinDecimals: 6,
        coinGeckoId: "medibloc",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/panacea/images/med.png",
      },
      {
        coinDenom: "BOOT",
        chainSuggestionDenom:
          "ibc/FE2CD1E6828EC0FAB8AF39BAC45BC25B965BA67CCBC50C13A14BD610B0D1E2C4",
        coinMinimalDenom:
          "ibc/FE2CD1E6828EC0FAB8AF39BAC45BC25B965BA67CCBC50C13A14BD610B0D1E2C4",
        coinDecimals: 0,
        coinGeckoId: "bostrom",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/boot.png",
      },
      {
        coinDenom: "CMDX",
        chainSuggestionDenom:
          "ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0",
        coinMinimalDenom:
          "ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0",
        coinDecimals: 6,
        coinGeckoId: "comdex",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmdx.png",
      },
      {
        coinDenom: "CHEQ",
        chainSuggestionDenom:
          "ibc/7A08C6F11EF0F59EB841B9F788A87EC9F2361C7D9703157EC13D940DC53031FA",
        coinMinimalDenom:
          "ibc/7A08C6F11EF0F59EB841B9F788A87EC9F2361C7D9703157EC13D940DC53031FA",
        coinDecimals: 9,
        coinGeckoId: "cheqd-network",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/cheqd/images/cheq.png",
      },
      {
        coinDenom: "LUM",
        chainSuggestionDenom:
          "ibc/8A34AF0C1943FD0DFCDE9ADBF0B2C9959C45E87E6088EA2FC6ADACD59261B8A2",
        coinMinimalDenom:
          "ibc/8A34AF0C1943FD0DFCDE9ADBF0B2C9959C45E87E6088EA2FC6ADACD59261B8A2",
        coinDecimals: 6,
        coinGeckoId: "lum-network",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumnetwork/images/lum.png",
      },
      {
        coinDenom: "VDL",
        chainSuggestionDenom:
          "ibc/E7B35499CFBEB0FF5778127ABA4FB2C4B79A6B8D3D831D4379C4048C238796BD",
        coinMinimalDenom:
          "ibc/E7B35499CFBEB0FF5778127ABA4FB2C4B79A6B8D3D831D4379C4048C238796BD",
        coinDecimals: 6,
        coinGeckoId: "vidulum",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/vidulum/images/vdl.png",
      },
      {
        coinDenom: "DSM",
        chainSuggestionDenom:
          "ibc/EA4C0A9F72E2CEDF10D0E7A9A6A22954DB3444910DB5BE980DF59B05A46DAD1C",
        coinMinimalDenom:
          "ibc/EA4C0A9F72E2CEDF10D0E7A9A6A22954DB3444910DB5BE980DF59B05A46DAD1C",
        coinDecimals: 6,
        coinGeckoId: "desmos",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/desmos/images/dsm.png",
      },
      {
        coinDenom: "DIG",
        chainSuggestionDenom:
          "ibc/307E5C96C8F60D1CBEE269A9A86C0834E1DB06F2B3788AE4F716EDB97A48B97D",
        coinMinimalDenom:
          "ibc/307E5C96C8F60D1CBEE269A9A86C0834E1DB06F2B3788AE4F716EDB97A48B97D",
        coinDecimals: 6,
        coinGeckoId: "dig-chain",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/dig/images/dig.png",
      },
      {
        coinDenom: "SOMM",
        chainSuggestionDenom:
          "ibc/9BBA9A1C257E971E38C1422780CE6F0B0686F0A3085E2D61118D904BFE0F5F5E",
        coinMinimalDenom:
          "ibc/9BBA9A1C257E971E38C1422780CE6F0B0686F0A3085E2D61118D904BFE0F5F5E",
        coinDecimals: 6,
        coinGeckoId: "sommelier",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/sommelier/images/somm.png",
      },
      {
        coinDenom: "BAND",
        chainSuggestionDenom:
          "ibc/F867AE2112EFE646EC71A25CD2DFABB8927126AC1E19F1BBF0FF693A4ECA05DE",
        coinMinimalDenom:
          "ibc/F867AE2112EFE646EC71A25CD2DFABB8927126AC1E19F1BBF0FF693A4ECA05DE",
        coinDecimals: 6,
        coinGeckoId: "band-protocol",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/bandchain/images/band.png",
      },
      {
        coinDenom: "DARC",
        chainSuggestionDenom:
          "ibc/346786EA82F41FE55FAD14BF69AD8BA9B36985406E43F3CB23E6C45A285A9593",
        coinMinimalDenom:
          "ibc/346786EA82F41FE55FAD14BF69AD8BA9B36985406E43F3CB23E6C45A285A9593",
        coinDecimals: 6,
        coinGeckoId: "darcmatter-coin",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/konstellation/images/darc.png",
      },
      {
        coinDenom: "UMEE",
        chainSuggestionDenom:
          "ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C",
        coinMinimalDenom:
          "ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C",
        coinDecimals: 6,
        coinGeckoId: "umee",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/umee/images/umee.png",
      },
      {
        coinDenom: "GRAV",
        chainSuggestionDenom:
          "ibc/E97634A40119F1898989C2A23224ED83FDD0A57EA46B3A094E287288D1672B44",
        coinMinimalDenom:
          "ibc/E97634A40119F1898989C2A23224ED83FDD0A57EA46B3A094E287288D1672B44",
        coinDecimals: 6,
        coinGeckoId: "graviton",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/gravitybridge/images/grav.png",
      },
      {
        coinDenom: "DEC",
        chainSuggestionDenom:
          "ibc/9BCB27203424535B6230D594553F1659C77EC173E36D9CF4759E7186EE747E84",
        coinMinimalDenom:
          "ibc/9BCB27203424535B6230D594553F1659C77EC173E36D9CF4759E7186EE747E84",
        coinDecimals: 6,
        coinGeckoId: "decentr",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/decentr/images/dec.png",
      },
      {
        coinDenom: "MARBLE",
        chainSuggestionDenom:
          "ibc/F6B691D5F7126579DDC87357B09D653B47FDCE0A3383FF33C8D8B544FE29A8A6",
        coinMinimalDenom:
          "ibc/F6B691D5F7126579DDC87357B09D653B47FDCE0A3383FF33C8D8B544FE29A8A6",
        coinDecimals: 3,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/marble.png",
      },
      {
        coinDenom: "SWTH",
        chainSuggestionDenom:
          "ibc/8FEFAE6AECF6E2A255585617F781F35A8D5709A545A804482A261C0C9548A9D3",
        coinMinimalDenom:
          "ibc/8FEFAE6AECF6E2A255585617F781F35A8D5709A545A804482A261C0C9548A9D3",
        coinDecimals: 8,
        coinGeckoId: "switcheo",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/carbon/images/swth.png",
      },
      {
        coinDenom: "CRBRUS",
        chainSuggestionDenom:
          "ibc/41999DF04D9441DAC0DF5D8291DF4333FBCBA810FFD63FDCE34FDF41EF37B6F7",
        coinMinimalDenom:
          "ibc/41999DF04D9441DAC0DF5D8291DF4333FBCBA810FFD63FDCE34FDF41EF37B6F7",
        coinDecimals: 6,
        coinGeckoId: "cerberus-2",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/cerberus/images/crbrus.png",
      },
      {
        coinDenom: "FET",
        chainSuggestionDenom:
          "ibc/5D1F516200EE8C6B2354102143B78A2DEDA25EDE771AC0F8DC3C1837C8FD4447",
        coinMinimalDenom:
          "ibc/5D1F516200EE8C6B2354102143B78A2DEDA25EDE771AC0F8DC3C1837C8FD4447",
        coinDecimals: 18,
        coinGeckoId: "fetch-ai",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/fetchhub/images/fet.png",
      },
      {
        coinDenom: "MNTL",
        chainSuggestionDenom:
          "ibc/CBA34207E969623D95D057D9B11B0C8B32B89A71F170577D982FDDE623813FFC",
        coinMinimalDenom:
          "ibc/CBA34207E969623D95D057D9B11B0C8B32B89A71F170577D982FDDE623813FFC",
        coinDecimals: 6,
        coinGeckoId: "assetmantle",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/assetmantle/images/mntl.png",
      },
      {
        coinDenom: "NETA",
        chainSuggestionDenom:
          "ibc/297C64CC42B5A8D8F82FE2EBE208A6FE8F94B86037FA28C4529A23701C228F7A",
        coinMinimalDenom:
          "ibc/297C64CC42B5A8D8F82FE2EBE208A6FE8F94B86037FA28C4529A23701C228F7A",
        coinDecimals: 6,
        coinGeckoId: "neta",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/neta.png",
      },
      {
        coinDenom: "INJ",
        chainSuggestionDenom:
          "ibc/64BA6E31FE887D66C6F8F31C7B1A80C7CA179239677B4088BB55F5EA07DBE273",
        coinMinimalDenom:
          "ibc/64BA6E31FE887D66C6F8F31C7B1A80C7CA179239677B4088BB55F5EA07DBE273",
        coinDecimals: 18,
        coinGeckoId: "injective-protocol",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.png",
      },
      {
        coinDenom: "KRTC",
        chainSuggestionDenom:
          "ibc/204A582244FC241613DBB50B04D1D454116C58C4AF7866C186AA0D6EEAD42780",
        coinMinimalDenom:
          "ibc/204A582244FC241613DBB50B04D1D454116C58C4AF7866C186AA0D6EEAD42780",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra/images/krt.png",
      },
      {
        coinDenom: "TICK",
        chainSuggestionDenom:
          "ibc/655BCEF3CDEBE32863FF281DBBE3B06160339E9897DC9C9C9821932A5F8BA6F8",
        coinMinimalDenom:
          "ibc/655BCEF3CDEBE32863FF281DBBE3B06160339E9897DC9C9C9821932A5F8BA6F8",
        coinDecimals: 6,
        coinGeckoId: "microtick",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/microtick/images/tick.png",
      },
      {
        coinDenom: "ROWAN",
        chainSuggestionDenom:
          "ibc/8318FD63C42203D16DDCAF49FE10E8590669B3219A3E87676AC9DA50722687FB",
        coinMinimalDenom:
          "ibc/8318FD63C42203D16DDCAF49FE10E8590669B3219A3E87676AC9DA50722687FB",
        coinDecimals: 18,
        coinGeckoId: "sifchain",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/sifchain/images/rowan.png",
      },
      {
        coinDenom: "CTK",
        chainSuggestionDenom:
          "ibc/7ED954CFFFC06EE8419387F3FC688837FF64EF264DE14219935F724EEEDBF8D3",
        coinMinimalDenom:
          "ibc/7ED954CFFFC06EE8419387F3FC688837FF64EF264DE14219935F724EEEDBF8D3",
        coinDecimals: 6,
        coinGeckoId: "certik",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/shentu/images/ctk.png",
      },
      {
        coinDenom: "HOPE",
        chainSuggestionDenom:
          "ibc/C2A2E9CA95DDD4828B75124B5E27B8401C7D8493BC48353D418CBFC04565899B",
        coinMinimalDenom:
          "ibc/C2A2E9CA95DDD4828B75124B5E27B8401C7D8493BC48353D418CBFC04565899B",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hope.png",
      },
      {
        coinDenom: "juno.RAC",
        chainSuggestionDenom:
          "ibc/6BDB4C8CCD45033F9604E4B93ED395008A753E01EECD6992E7D1EA23D9D3B788",
        coinMinimalDenom:
          "ibc/6BDB4C8CCD45033F9604E4B93ED395008A753E01EECD6992E7D1EA23D9D3B788",
        coinDecimals: 6,
        coinGeckoId: "racoon",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/rac.png",
      },
      {
        coinDenom: "FRAX",
        chainSuggestionDenom:
          "ibc/0E43EDE2E2A3AFA36D0CD38BDDC0B49FECA64FA426A82E102F304E430ECF46EE",
        coinMinimalDenom:
          "ibc/0E43EDE2E2A3AFA36D0CD38BDDC0B49FECA64FA426A82E102F304E430ECF46EE",
        coinDecimals: 18,
        coinGeckoId: "frax",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/frax.svg",
      },
      {
        coinDenom: "WBTC.grv",
        chainSuggestionDenom:
          "ibc/C9B0D48FD2C5B91135F118FF2484551888966590D7BDC20F6A87308DBA670796",
        coinMinimalDenom:
          "ibc/C9B0D48FD2C5B91135F118FF2484551888966590D7BDC20F6A87308DBA670796",
        coinDecimals: 8,
        coinGeckoId: "wrapped-bitcoin",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wbtc.png",
      },
      {
        coinDenom: "WETH.grv",
        chainSuggestionDenom:
          "ibc/65381C5F3FD21442283D56925E62EA524DED8B6927F0FF94E21E0020954C40B5",
        coinMinimalDenom:
          "ibc/65381C5F3FD21442283D56925E62EA524DED8B6927F0FF94E21E0020954C40B5",
        coinDecimals: 18,
        coinGeckoId: "weth",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/weth.svg",
      },
      {
        coinDenom: "USDC.grv",
        chainSuggestionDenom:
          "ibc/9F9B07EF9AD291167CF5700628145DE1DEB777C2CFC7907553B24446515F6D0E",
        coinMinimalDenom:
          "ibc/9F9B07EF9AD291167CF5700628145DE1DEB777C2CFC7907553B24446515F6D0E",
        coinDecimals: 6,
        coinGeckoId: "gravity-bridge-usdc",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
      },
      {
        coinDenom: "DAI.grv",
        chainSuggestionDenom:
          "ibc/F292A17CF920E3462C816CBE6B042E779F676CAB59096904C4C1C966413E3DF5",
        coinMinimalDenom:
          "ibc/F292A17CF920E3462C816CBE6B042E779F676CAB59096904C4C1C966413E3DF5",
        coinDecimals: 18,
        coinGeckoId: "dai",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/dai.svg",
      },
      {
        coinDenom: "USDT.grv",
        chainSuggestionDenom:
          "ibc/71B441E27F1BBB44DD0891BCD370C2794D404D60A4FFE5AECCD9B1E28BC89805",
        coinMinimalDenom:
          "ibc/71B441E27F1BBB44DD0891BCD370C2794D404D60A4FFE5AECCD9B1E28BC89805",
        coinDecimals: 6,
        coinGeckoId: "tether",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.png",
      },
      {
        coinDenom: "BLOCK",
        chainSuggestionDenom:
          "ibc/DB9755CB6FE55192948AE074D18FA815E1429D3D374D5BDA8D89623C6CF235C3",
        coinMinimalDenom:
          "ibc/DB9755CB6FE55192948AE074D18FA815E1429D3D374D5BDA8D89623C6CF235C3",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/block.png",
      },
      {
        coinDenom: "HASH",
        chainSuggestionDenom:
          "ibc/CE5BFF1D9BADA03BB5CCA5F56939392A761B53A10FBD03B37506669C3218D3B2",
        coinMinimalDenom:
          "ibc/CE5BFF1D9BADA03BB5CCA5F56939392A761B53A10FBD03B37506669C3218D3B2",
        coinDecimals: 9,
        coinGeckoId: "provenance-blockchain",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/provenance/images/prov.png",
      },
      {
        coinDenom: "GLX",
        chainSuggestionDenom:
          "ibc/F49DE040EBA5AB2FAD5F660C2A1DDF98A68470FAE82229818BE775EBF3EE79F2",
        coinMinimalDenom:
          "ibc/F49DE040EBA5AB2FAD5F660C2A1DDF98A68470FAE82229818BE775EBF3EE79F2",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/galaxy/images/glx.png",
      },
      {
        coinDenom: "DHK",
        chainSuggestionDenom:
          "ibc/52E12CF5CA2BB903D84F5298B4BFD725D66CAB95E09AA4FC75B2904CA5485FEB",
        coinMinimalDenom:
          "ibc/52E12CF5CA2BB903D84F5298B4BFD725D66CAB95E09AA4FC75B2904CA5485FEB",
        coinDecimals: 0,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/dhk.png",
      },
      {
        coinDenom: "RAW",
        chainSuggestionDenom:
          "ibc/00B6E60AD3D65CBEF5579AC8AF609527C0B57535B6E32D96C80A735344FD9DCC",
        coinMinimalDenom:
          "ibc/00B6E60AD3D65CBEF5579AC8AF609527C0B57535B6E32D96C80A735344FD9DCC",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/raw.png",
      },
      {
        coinDenom: "MEME",
        chainSuggestionDenom:
          "ibc/67C89B8B0A70C08F093C909A4DD996DD10E0494C87E28FD9A551697BF173D4CA",
        coinMinimalDenom:
          "ibc/67C89B8B0A70C08F093C909A4DD996DD10E0494C87E28FD9A551697BF173D4CA",
        coinDecimals: 6,
        coinGeckoId: "meme-network",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/meme/images/meme.png",
      },
      {
        coinDenom: "ASVT",
        chainSuggestionDenom:
          "ibc/AA1C80225BCA7B32ED1FC6ABF8B8E899BEB48ECDB4B417FD69873C6D715F97E7",
        coinMinimalDenom:
          "ibc/AA1C80225BCA7B32ED1FC6ABF8B8E899BEB48ECDB4B417FD69873C6D715F97E7",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/asvt.png",
      },
      {
        coinDenom: "JOE",
        chainSuggestionDenom:
          "ibc/0CB9DB3441D0D50F35699DEE22B9C965487E83FB2D9F483D1CC5CA34E856C484",
        coinMinimalDenom:
          "ibc/0CB9DB3441D0D50F35699DEE22B9C965487E83FB2D9F483D1CC5CA34E856C484",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/joe.png",
      },
      {
        coinDenom: "LUNA",
        chainSuggestionDenom:
          "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
        coinMinimalDenom:
          "ibc/785AFEC6B3741100D15E7AF01374E3C4C36F24888E96479B1C33F5C71F364EF9",
        coinDecimals: 6,
        coinGeckoId: "terra-luna-2",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/luna.png",
      },
      {
        coinDenom: "ATOLO",
        chainSuggestionDenom:
          "ibc/2716E3F2E146664BEFA9217F1A03BFCEDBCD5178B3C71CACB1A0D7584451D219",
        coinMinimalDenom:
          "ibc/2716E3F2E146664BEFA9217F1A03BFCEDBCD5178B3C71CACB1A0D7584451D219",
        coinDecimals: 6,
        coinGeckoId: "rizon",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/rizon/images/atolo.png",
      },
      {
        coinDenom: "HARD",
        chainSuggestionDenom:
          "ibc/D6C28E07F7343360AC41E15DDD44D79701DDCA2E0C2C41279739C8D4AE5264BC",
        coinMinimalDenom:
          "ibc/D6C28E07F7343360AC41E15DDD44D79701DDCA2E0C2C41279739C8D4AE5264BC",
        coinDecimals: 6,
        coinGeckoId: "kava-lend",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/hard.png",
      },
      {
        coinDenom: "SWP",
        chainSuggestionDenom:
          "ibc/70CF1A54E23EA4E480DEDA9E12082D3FD5684C3483CBDCE190C5C807227688C5",
        coinMinimalDenom:
          "ibc/70CF1A54E23EA4E480DEDA9E12082D3FD5684C3483CBDCE190C5C807227688C5",
        coinDecimals: 6,
        coinGeckoId: "kava-swap",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/swp.png",
      },
      {
        coinDenom: "LINK",
        chainSuggestionDenom:
          "ibc/D3327A763C23F01EC43D1F0DB3CEFEC390C362569B6FD191F40A5192F8960049",
        coinMinimalDenom:
          "ibc/D3327A763C23F01EC43D1F0DB3CEFEC390C362569B6FD191F40A5192F8960049",
        coinDecimals: 18,
        coinGeckoId: "chainlink",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/link.png",
      },
      {
        coinDenom: "L1",
        chainSuggestionDenom:
          "ibc/F16FDC11A7662B86BC0B9CE61871CBACF7C20606F95E86260FD38915184B75B4",
        coinMinimalDenom:
          "ibc/F16FDC11A7662B86BC0B9CE61871CBACF7C20606F95E86260FD38915184B75B4",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/genesisl1/images/l1.png",
      },
      {
        coinDenom: "AAVE",
        chainSuggestionDenom:
          "ibc/384E5DD50BDE042E1AAF51F312B55F08F95BC985C503880189258B4D9374CBBE",
        coinMinimalDenom:
          "ibc/384E5DD50BDE042E1AAF51F312B55F08F95BC985C503880189258B4D9374CBBE",
        coinDecimals: 18,
        coinGeckoId: "aave",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/aave.svg",
      },
      {
        coinDenom: "APE",
        chainSuggestionDenom:
          "ibc/F83CC6471DA4D4B508F437244F10B9E4C68975344E551A2DEB6B8617AB08F0D4",
        coinMinimalDenom:
          "ibc/F83CC6471DA4D4B508F437244F10B9E4C68975344E551A2DEB6B8617AB08F0D4",
        coinDecimals: 18,
        coinGeckoId: "apecoin",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/ape.svg",
      },
      {
        coinDenom: "MKR",
        chainSuggestionDenom:
          "ibc/D27DDDF34BB47E5D5A570742CC667DE53277867116CCCA341F27785E899A70F3",
        coinMinimalDenom:
          "ibc/D27DDDF34BB47E5D5A570742CC667DE53277867116CCCA341F27785E899A70F3",
        coinDecimals: 18,
        coinGeckoId: "maker",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/mkr.svg",
      },
      {
        coinDenom: "RAI",
        chainSuggestionDenom:
          "ibc/BD796662F8825327D41C96355DF62045A5BA225BAE31C0A86289B9D88ED3F44E",
        coinMinimalDenom:
          "ibc/BD796662F8825327D41C96355DF62045A5BA225BAE31C0A86289B9D88ED3F44E",
        coinDecimals: 18,
        coinGeckoId: "rai",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/rai.svg",
      },
      {
        coinDenom: "SHIB",
        chainSuggestionDenom:
          "ibc/19305E20681911F14D1FB275E538CDE524C3BF88CF9AE5D5F78F4D4DA05E85B2",
        coinMinimalDenom:
          "ibc/19305E20681911F14D1FB275E538CDE524C3BF88CF9AE5D5F78F4D4DA05E85B2",
        coinDecimals: 18,
        coinGeckoId: "shiba-inu",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/shib.svg",
      },
      {
        coinDenom: "KUJI",
        chainSuggestionDenom:
          "ibc/BB6BCDB515050BAE97516111873CCD7BCF1FD0CCB723CC12F3C4F704D6C646CE",
        coinMinimalDenom:
          "ibc/BB6BCDB515050BAE97516111873CCD7BCF1FD0CCB723CC12F3C4F704D6C646CE",
        coinDecimals: 6,
        coinGeckoId: "kujira",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/kuji.png",
      },
      {
        coinDenom: "TGD",
        chainSuggestionDenom:
          "ibc/1E09CB0F506ACF12FDE4683FB6B34DA62FB4BE122641E0D93AAF98A87675676C",
        coinMinimalDenom:
          "ibc/1E09CB0F506ACF12FDE4683FB6B34DA62FB4BE122641E0D93AAF98A87675676C",
        coinDecimals: 6,
        coinGeckoId: "tgrade",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/tgrade/images/tgrade-symbol-gradient.png",
      },
      {
        coinDenom: "ECH",
        chainSuggestionDenom:
          "ibc/47EE224A9B33CF0ABEAC82106E52F0F6E8D8CEC5BA80B9D9A6F55172CBB0177D",
        coinMinimalDenom:
          "ibc/47EE224A9B33CF0ABEAC82106E52F0F6E8D8CEC5BA80B9D9A6F55172CBB0177D",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/echelon/images/ech.svg",
      },
      {
        coinDenom: "ODIN",
        chainSuggestionDenom:
          "ibc/C360EF34A86D334F625E4CBB7DA3223AEA97174B61F35BB3758081A8160F7D9B",
        coinMinimalDenom:
          "ibc/C360EF34A86D334F625E4CBB7DA3223AEA97174B61F35BB3758081A8160F7D9B",
        coinDecimals: 6,
        coinGeckoId: "odin-protocol",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/odin.png",
      },
      {
        coinDenom: "GEO",
        chainSuggestionDenom:
          "ibc/9B6FBABA36BB4A3BF127AE5E96B572A5197FD9F3111D895D8919B07BC290764A",
        coinMinimalDenom:
          "ibc/9B6FBABA36BB4A3BF127AE5E96B572A5197FD9F3111D895D8919B07BC290764A",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/geo.png",
      },
      {
        coinDenom: "O9W",
        chainSuggestionDenom:
          "ibc/0CD46223FEABD2AEAAAF1F057D01E63BCA79B7D4BD6B68F1EB973A987344695D",
        coinMinimalDenom:
          "ibc/0CD46223FEABD2AEAAAF1F057D01E63BCA79B7D4BD6B68F1EB973A987344695D",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/o9w.png",
      },
      {
        coinDenom: "kichain.LVN",
        chainSuggestionDenom:
          "ibc/AD185F62399F770CCCE8A36A180A77879FF6C26A0398BD3D2A74E087B0BFA121",
        coinMinimalDenom:
          "ibc/AD185F62399F770CCCE8A36A180A77879FF6C26A0398BD3D2A74E087B0BFA121",
        coinDecimals: 6,
        coinGeckoId: "lvn",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/kichain/images/lvn.png",
      },
      {
        coinDenom: "GLMR",
        chainSuggestionDenom:
          "ibc/1E26DB0E5122AED464D98462BD384FCCB595732A66B3970AE6CE0B58BAE0FC49",
        coinMinimalDenom:
          "ibc/1E26DB0E5122AED464D98462BD384FCCB595732A66B3970AE6CE0B58BAE0FC49",
        coinDecimals: 18,
        coinGeckoId: "wrapped-moonbeam",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/moonbeam/images/glmr.png",
      },
      {
        coinDenom: "GLTO",
        chainSuggestionDenom:
          "ibc/52C57FCA7D6854AA178E7A183DDBE4EF322B904B1D719FC485F6FFBC1F72A19E",
        coinMinimalDenom:
          "ibc/52C57FCA7D6854AA178E7A183DDBE4EF322B904B1D719FC485F6FFBC1F72A19E",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.png",
      },
      {
        coinDenom: "GKEY",
        chainSuggestionDenom:
          "ibc/7C781B4C2082CD62129A972D47486D78EC17155C299270E3C89348EA026BEAF8",
        coinMinimalDenom:
          "ibc/7C781B4C2082CD62129A972D47486D78EC17155C299270E3C89348EA026BEAF8",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/gkey.png",
      },
      {
        coinDenom: "CRE",
        chainSuggestionDenom:
          "ibc/5A7C219BA5F7582B99629BA3B2A01A61BFDA0F6FD1FE95B5366F7334C4BC0580",
        coinMinimalDenom:
          "ibc/5A7C219BA5F7582B99629BA3B2A01A61BFDA0F6FD1FE95B5366F7334C4BC0580",
        coinDecimals: 6,
        coinGeckoId: "crescent-network",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/crescent/images/cre.png",
      },
      {
        coinDenom: "LUMEN",
        chainSuggestionDenom:
          "ibc/FFA652599C77E853F017193E36B5AB2D4D9AFC4B54721A74904F80C9236BF3B7",
        coinMinimalDenom:
          "ibc/FFA652599C77E853F017193E36B5AB2D4D9AFC4B54721A74904F80C9236BF3B7",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/lumenx/images/lumen.png",
      },
      {
        coinDenom: "ORAI",
        chainSuggestionDenom:
          "ibc/161D7D62BAB3B9C39003334F1671208F43C06B643CC9EDBBE82B64793C857F1D",
        coinMinimalDenom:
          "ibc/161D7D62BAB3B9C39003334F1671208F43C06B643CC9EDBBE82B64793C857F1D",
        coinDecimals: 6,
        coinGeckoId: "oraichain-token",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/oraichain/images/orai-token.png",
      },
      {
        coinDenom: "CUDOS",
        chainSuggestionDenom:
          "ibc/E09ED39F390EC51FA9F3F69BEA08B5BBE6A48B3057B2B1C3467FAAE9E58B021B",
        coinMinimalDenom:
          "ibc/E09ED39F390EC51FA9F3F69BEA08B5BBE6A48B3057B2B1C3467FAAE9E58B021B",
        coinDecimals: 18,
        coinGeckoId: "cudos",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/cudos/images/cudos.png",
      },
      {
        coinDenom: "USDX",
        chainSuggestionDenom:
          "ibc/C78F65E1648A3DFE0BAEB6C4CDA69CC2A75437F1793C0E6386DFDA26393790AE",
        coinMinimalDenom:
          "ibc/C78F65E1648A3DFE0BAEB6C4CDA69CC2A75437F1793C0E6386DFDA26393790AE",
        coinDecimals: 6,
        coinGeckoId: "usdx",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/kava/images/usdx.png",
      },
      {
        coinDenom: "BLD",
        chainSuggestionDenom:
          "ibc/2DA9C149E9AD2BD27FEFA635458FB37093C256C1A940392634A16BEA45262604",
        coinMinimalDenom:
          "ibc/2DA9C149E9AD2BD27FEFA635458FB37093C256C1A940392634A16BEA45262604",
        coinDecimals: 6,
        coinGeckoId: "agoric",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/bld.png",
      },
      {
        coinDenom: "IST",
        chainSuggestionDenom:
          "ibc/92BE0717F4678905E53F4E45B2DED18BC0CB97BF1F8B6A25AFEDF3D5A879B4D5",
        coinMinimalDenom:
          "ibc/92BE0717F4678905E53F4E45B2DED18BC0CB97BF1F8B6A25AFEDF3D5A879B4D5",
        coinDecimals: 6,
        coinGeckoId: "inter-stable-token",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/agoric/images/ist.png",
      },
      {
        coinDenom: "SEJUNO",
        chainSuggestionDenom:
          "ibc/C6B6BFCB6EE49A7CAB1A7E7B021DE35B99D525AC660844952F0F6C78DCB2A57B",
        coinMinimalDenom:
          "ibc/C6B6BFCB6EE49A7CAB1A7E7B021DE35B99D525AC660844952F0F6C78DCB2A57B",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sejuno.png",
      },
      {
        coinDenom: "BJUNO",
        chainSuggestionDenom:
          "ibc/C2DF5C3949CA835B221C575625991F09BAB4E48FB9C11A4EE357194F736111E3",
        coinMinimalDenom:
          "ibc/C2DF5C3949CA835B221C575625991F09BAB4E48FB9C11A4EE357194F736111E3",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/bjuno.png",
      },
      {
        coinDenom: "STRD",
        chainSuggestionDenom:
          "ibc/A8CA5EE328FA10C9519DF6057DA1F69682D28F7D0F5CCC7ECB72E3DCA2D157A4",
        coinMinimalDenom:
          "ibc/A8CA5EE328FA10C9519DF6057DA1F69682D28F7D0F5CCC7ECB72E3DCA2D157A4",
        coinDecimals: 6,
        coinGeckoId: "stride",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/strd.png",
      },
      {
        coinDenom: "stATOM",
        chainSuggestionDenom:
          "ibc/C140AFD542AE77BD7DCC83F13FDD8C5E5BB8C4929785E6EC2F4C636F98F17901",
        coinMinimalDenom:
          "ibc/C140AFD542AE77BD7DCC83F13FDD8C5E5BB8C4929785E6EC2F4C636F98F17901",
        coinDecimals: 6,
        coinGeckoId: "stride-staked-atom",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/statom.png",
      },
      {
        coinDenom: "stSTARS",
        chainSuggestionDenom:
          "ibc/5DD1F95ED336014D00CE2520977EC71566D282F9749170ADC83A392E0EA7426A",
        coinMinimalDenom:
          "ibc/5DD1F95ED336014D00CE2520977EC71566D282F9749170ADC83A392E0EA7426A",
        coinDecimals: 6,
        coinGeckoId: "stride-staked-stars",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/ststars.png",
      },
      {
        coinDenom: "SOLAR",
        chainSuggestionDenom:
          "ibc/C3FC4DED273E7D1DD2E7BAA3317EC9A53CD3252B577AA33DC00D9DF2BDF3ED5C",
        coinMinimalDenom:
          "ibc/C3FC4DED273E7D1DD2E7BAA3317EC9A53CD3252B577AA33DC00D9DF2BDF3ED5C",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/solar.png",
      },
      {
        coinDenom: "SEASY",
        chainSuggestionDenom:
          "ibc/18A676A074F73B9B42DA4F9DFC8E5AEF334C9A6636DDEC8D34682F52F1DECDF6",
        coinMinimalDenom:
          "ibc/18A676A074F73B9B42DA4F9DFC8E5AEF334C9A6636DDEC8D34682F52F1DECDF6",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/seasy.png",
      },
      {
        coinDenom: "AXL",
        chainSuggestionDenom:
          "ibc/903A61A498756EA560B85A85132D3AEE21B5DEDD41213725D22ABF276EA6945E",
        coinMinimalDenom:
          "ibc/903A61A498756EA560B85A85132D3AEE21B5DEDD41213725D22ABF276EA6945E",
        coinDecimals: 6,
        coinGeckoId: "axelar",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/axelar/images/axl.png",
      },
      {
        coinDenom: "REBUS",
        chainSuggestionDenom:
          "ibc/A1AC7F9EE2F643A68E3A35BCEB22040120BEA4059773BB56985C76BDFEBC71D9",
        coinMinimalDenom:
          "ibc/A1AC7F9EE2F643A68E3A35BCEB22040120BEA4059773BB56985C76BDFEBC71D9",
        coinDecimals: 18,
        coinGeckoId: "rebus",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/rebus/images/rebus.png",
      },
      {
        coinDenom: "TORI",
        chainSuggestionDenom:
          "ibc/EB7FB9C8B425F289B63703413327C2051030E848CE4EAAEA2E51199D6D39D3EC",
        coinMinimalDenom:
          "ibc/EB7FB9C8B425F289B63703413327C2051030E848CE4EAAEA2E51199D6D39D3EC",
        coinDecimals: 6,
        coinGeckoId: "teritori",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/teritori/images/utori.png",
      },
      {
        coinDenom: "stJUNO",
        chainSuggestionDenom:
          "ibc/84502A75BCA4A5F68D464C00B3F610CE2585847D59B52E5FFB7C3C9D2DDCD3FE",
        coinMinimalDenom:
          "ibc/84502A75BCA4A5F68D464C00B3F610CE2585847D59B52E5FFB7C3C9D2DDCD3FE",
        coinDecimals: 6,
        coinGeckoId: "stride-staked-juno",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stjuno.png",
      },
      {
        coinDenom: "stOSMO",
        chainSuggestionDenom:
          "ibc/D176154B0C63D1F9C6DCFB4F70349EBF2E2B5A87A05902F57A6AE92B863E9AEC",
        coinMinimalDenom:
          "ibc/D176154B0C63D1F9C6DCFB4F70349EBF2E2B5A87A05902F57A6AE92B863E9AEC",
        coinDecimals: 6,
        coinGeckoId: "stride-staked-osmo",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stosmo.png",
      },
      {
        coinDenom: "MUSE",
        chainSuggestionDenom:
          "ibc/6B982170CE024689E8DD0E7555B129B488005130D4EDA426733D552D10B36D8F",
        coinMinimalDenom:
          "ibc/6B982170CE024689E8DD0E7555B129B488005130D4EDA426733D552D10B36D8F",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/muse.png",
      },
      {
        coinDenom: "LAMB",
        chainSuggestionDenom:
          "ibc/80825E8F04B12D914ABEADB1F4D39C04755B12C8402F6876EE3168450C0A90BB",
        coinMinimalDenom:
          "ibc/80825E8F04B12D914ABEADB1F4D39C04755B12C8402F6876EE3168450C0A90BB",
        coinDecimals: 18,
        coinGeckoId: "lambda",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/lambda/images/lambda.png",
      },
      {
        coinDenom: "USK",
        chainSuggestionDenom:
          "ibc/44492EAB24B72E3FB59B9FA619A22337FB74F95D8808FE6BC78CC0E6C18DC2EC",
        coinMinimalDenom:
          "ibc/44492EAB24B72E3FB59B9FA619A22337FB74F95D8808FE6BC78CC0E6C18DC2EC",
        coinDecimals: 6,
        coinGeckoId: "usk",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/usk.png",
      },
      {
        coinDenom: "FUND",
        chainSuggestionDenom:
          "ibc/608EF5C0CE64FEA097500DB39657BDD36CA708CC5DCC2E250A024B6981DD36BC",
        coinMinimalDenom:
          "ibc/608EF5C0CE64FEA097500DB39657BDD36CA708CC5DCC2E250A024B6981DD36BC",
        coinDecimals: 9,
        coinGeckoId: "unification",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/unification/images/fund.png",
      },
      {
        coinDenom: "JKL",
        chainSuggestionDenom:
          "ibc/8E697BDABE97ACE8773C6DF7402B2D1D5104DD1EEABE12608E3469B7F64C15BA",
        coinMinimalDenom:
          "ibc/8E697BDABE97ACE8773C6DF7402B2D1D5104DD1EEABE12608E3469B7F64C15BA",
        coinDecimals: 6,
        coinGeckoId: "jackal-protocol",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/jackal/images/jkl.png",
      },
      {
        coinDenom: "ALTER",
        chainSuggestionDenom:
          "ibc/A6383B6CF5EA23E067666C06BC34E2A96869927BD9744DC0C1643E589C710AA3",
        coinMinimalDenom:
          "ibc/A6383B6CF5EA23E067666C06BC34E2A96869927BD9744DC0C1643E589C710AA3",
        coinDecimals: 6,
        coinGeckoId: "alter",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/alter.png",
      },
      {
        coinDenom: "BUTT",
        chainSuggestionDenom:
          "ibc/1FBA9E763B8679BEF7BAAAF2D16BCA78C3B297D226C3F31312C769D7B8F992D8",
        coinMinimalDenom:
          "ibc/1FBA9E763B8679BEF7BAAAF2D16BCA78C3B297D226C3F31312C769D7B8F992D8",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/butt.png",
      },
      {
        coinDenom: "SHD(old)",
        chainSuggestionDenom:
          "ibc/71055835C7639739EAE03AACD1324FE162DBA41D09F197CB72D966D014225B1C",
        coinMinimalDenom:
          "ibc/71055835C7639739EAE03AACD1324FE162DBA41D09F197CB72D966D014225B1C",
        coinDecimals: 8,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/shdold.svg",
      },
      {
        coinDenom: "SIENNA",
        chainSuggestionDenom:
          "ibc/9A8A93D04917A149C8AC7C16D3DA8F470D59E8D867499C4DA97450E1D7363213",
        coinMinimalDenom:
          "ibc/9A8A93D04917A149C8AC7C16D3DA8F470D59E8D867499C4DA97450E1D7363213",
        coinDecimals: 18,
        coinGeckoId: "sienna",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/sienna.png",
      },
      {
        coinDenom: "stkd-SCRT",
        chainSuggestionDenom:
          "ibc/D0E5BF2940FB58D9B283A339032DE88111407AAD7D94A7F1F3EB78874F8616D4",
        coinMinimalDenom:
          "ibc/D0E5BF2940FB58D9B283A339032DE88111407AAD7D94A7F1F3EB78874F8616D4",
        coinDecimals: 6,
        coinGeckoId: "stkd-scrt",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/stkd-scrt.png",
      },
      {
        coinDenom: "BZE",
        chainSuggestionDenom:
          "ibc/C822645522FC3EECF817609AA38C24B64D04F5C267A23BCCF8F2E3BC5755FA88",
        coinMinimalDenom:
          "ibc/C822645522FC3EECF817609AA38C24B64D04F5C267A23BCCF8F2E3BC5755FA88",
        coinDecimals: 6,
        coinGeckoId: "bzedge",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/beezee/images/bze.png",
      },
      {
        coinDenom: "FURY.legacy",
        chainSuggestionDenom:
          "ibc/7CE5F388D661D82A0774E47B5129DA51CC7129BD1A70B5FA6BCEBB5B0A2FAEAF",
        coinMinimalDenom:
          "ibc/7CE5F388D661D82A0774E47B5129DA51CC7129BD1A70B5FA6BCEBB5B0A2FAEAF",
        coinDecimals: 6,
        coinGeckoId: "fanfury",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/fanfury.png",
      },
      {
        coinDenom: "ACRE",
        chainSuggestionDenom:
          "ibc/BB936517F7E5D77A63E0ADB05217A6608B0C4CF8FBA7EA2F4BAE4107A7238F06",
        coinMinimalDenom:
          "ibc/BB936517F7E5D77A63E0ADB05217A6608B0C4CF8FBA7EA2F4BAE4107A7238F06",
        coinDecimals: 18,
        coinGeckoId: "arable-protocol",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/acre.png",
      },
      {
        coinDenom: "CMST",
        chainSuggestionDenom:
          "ibc/23CA6C8D1AB2145DD13EB1E089A2E3F960DC298B468CCE034E19E5A78B61136E",
        coinMinimalDenom:
          "ibc/23CA6C8D1AB2145DD13EB1E089A2E3F960DC298B468CCE034E19E5A78B61136E",
        coinDecimals: 6,
        coinGeckoId: "composite",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/cmst.png",
      },
      {
        coinDenom: "IMV",
        chainSuggestionDenom:
          "ibc/92B223EBFA74DB99BEA92B23DEAA6050734FEEAABB84689CB8E1AE8F9C9F9AF4",
        coinMinimalDenom:
          "ibc/92B223EBFA74DB99BEA92B23DEAA6050734FEEAABB84689CB8E1AE8F9C9F9AF4",
        coinDecimals: 18,
        coinGeckoId: "imv",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/imversed/images/imversed.png",
      },
      {
        coinDenom: "MEDAS",
        chainSuggestionDenom:
          "ibc/01E94A5FF29B8DDEFC86F412CC3927F7330E9B523CC63A6194B1108F5276025C",
        coinMinimalDenom:
          "ibc/01E94A5FF29B8DDEFC86F412CC3927F7330E9B523CC63A6194B1108F5276025C",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/medasdigital/images/medas.png",
      },
      {
        coinDenom: "PHMN",
        chainSuggestionDenom:
          "ibc/D3B574938631B0A1BA704879020C696E514CFADAA7643CDE4BD5EB010BDE327B",
        coinMinimalDenom:
          "ibc/D3B574938631B0A1BA704879020C696E514CFADAA7643CDE4BD5EB010BDE327B",
        coinDecimals: 6,
        coinGeckoId: "posthuman",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/phmn.png",
      },
      {
        coinDenom: "AMBER",
        chainSuggestionDenom:
          "ibc/18A1B70E3205A48DE8590C0D11030E7146CDBF1048789261D53FFFD7527F8B55",
        coinMinimalDenom:
          "ibc/18A1B70E3205A48DE8590C0D11030E7146CDBF1048789261D53FFFD7527F8B55",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/amber.png",
      },
      {
        coinDenom: "NOM",
        chainSuggestionDenom:
          "ibc/B9606D347599F0F2FDF82BA3EE339000673B7D274EA50F59494DC51EFCD42163",
        coinMinimalDenom:
          "ibc/B9606D347599F0F2FDF82BA3EE339000673B7D274EA50F59494DC51EFCD42163",
        coinDecimals: 18,
        coinGeckoId: "onomy-protocol",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/onomy/images/nom.png",
      },
      {
        coinDenom: "stkATOM",
        chainSuggestionDenom:
          "ibc/CAA179E40F0266B0B29FB5EAA288FB9212E628822265D4141EBD1C47C3CBFCBC",
        coinMinimalDenom:
          "ibc/CAA179E40F0266B0B29FB5EAA288FB9212E628822265D4141EBD1C47C3CBFCBC",
        coinDecimals: 6,
        coinGeckoId: "stkatom",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/stkatom.png",
      },
      {
        coinDenom: "DYS",
        chainSuggestionDenom:
          "ibc/E27CD305D33F150369AB526AEB6646A76EC3FFB1A6CA58A663B5DE657A89D55D",
        coinMinimalDenom:
          "ibc/E27CD305D33F150369AB526AEB6646A76EC3FFB1A6CA58A663B5DE657A89D55D",
        coinDecimals: 0,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/dyson/images/dys.png",
      },
      {
        coinDenom: "HOPERS",
        chainSuggestionDenom:
          "ibc/D3ADAF73F84CDF205BCB72C142FDAEEA2C612AB853CEE6D6C06F184FA38B1099",
        coinMinimalDenom:
          "ibc/D3ADAF73F84CDF205BCB72C142FDAEEA2C612AB853CEE6D6C06F184FA38B1099",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/hopers.png",
      },
      {
        coinDenom: "arUSD",
        chainSuggestionDenom:
          "ibc/5D270A584B1078FBE07D14570ED5E88EC1FEDA8518B76C322606291E6FD8286F",
        coinMinimalDenom:
          "ibc/5D270A584B1078FBE07D14570ED5E88EC1FEDA8518B76C322606291E6FD8286F",
        coinDecimals: 18,
        coinGeckoId: "arable-usd",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/arusd.png",
      },
      {
        coinDenom: "PLQ",
        chainSuggestionDenom:
          "ibc/B1E0166EA0D759FDF4B207D1F5F12210D8BFE36F2345CEFC76948CE2B36DFBAF",
        coinMinimalDenom:
          "ibc/B1E0166EA0D759FDF4B207D1F5F12210D8BFE36F2345CEFC76948CE2B36DFBAF",
        coinDecimals: 18,
        coinGeckoId: "planq",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/planq/images/planq.png",
      },
      {
        coinDenom: "FTM",
        chainSuggestionDenom:
          "ibc/5E2DFDF1734137302129EA1C1BA21A580F96F778D4F021815EA4F6DB378DA1A4",
        coinMinimalDenom:
          "ibc/5E2DFDF1734137302129EA1C1BA21A580F96F778D4F021815EA4F6DB378DA1A4",
        coinDecimals: 18,
        coinGeckoId: "fantom",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/fantom/images/ftm.png",
      },
      {
        coinDenom: "CANTO",
        chainSuggestionDenom:
          "ibc/47CAF2DB8C016FAC960F33BC492FD8E454593B65CC59D70FA9D9F30424F9C32F",
        coinMinimalDenom:
          "ibc/47CAF2DB8C016FAC960F33BC492FD8E454593B65CC59D70FA9D9F30424F9C32F",
        coinDecimals: 18,
        coinGeckoId: "canto",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/canto/images/canto.png",
      },
      {
        coinDenom: "qSTARS",
        chainSuggestionDenom:
          "ibc/46C83BB054E12E189882B5284542DB605D94C99827E367C9192CF0579CD5BC83",
        coinMinimalDenom:
          "ibc/46C83BB054E12E189882B5284542DB605D94C99827E367C9192CF0579CD5BC83",
        coinDecimals: 6,
        coinGeckoId: "stargaze",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qstars.png",
      },
      {
        coinDenom: "WYND",
        chainSuggestionDenom:
          "ibc/2FBAC4BF296D7844796844B35978E5899984BA5A6314B2DD8F83C215550010B3",
        coinMinimalDenom:
          "ibc/2FBAC4BF296D7844796844B35978E5899984BA5A6314B2DD8F83C215550010B3",
        coinDecimals: 6,
        coinGeckoId: "wynd",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/wynd.png",
      },
      {
        coinDenom: "polygon.USDC.axl",
        chainSuggestionDenom:
          "ibc/231FD77ECCB2DB916D314019DA30FE013202833386B1908A191D16989AD80B5A",
        coinMinimalDenom:
          "ibc/231FD77ECCB2DB916D314019DA30FE013202833386B1908A191D16989AD80B5A",
        coinDecimals: 6,
        coinGeckoId: "bridged-usdc-polygon-pos-bridge",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
      },
      {
        coinDenom: "avalanche.USDC.axl",
        chainSuggestionDenom:
          "ibc/F17C9CA112815613C5B6771047A093054F837C3020CBA59DFFD9D780A8B2984C",
        coinMinimalDenom:
          "ibc/F17C9CA112815613C5B6771047A093054F837C3020CBA59DFFD9D780A8B2984C",
        coinDecimals: 6,
        coinGeckoId: "usd-coin",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
      },
      {
        coinDenom: "MARS",
        chainSuggestionDenom:
          "ibc/573FCD90FACEE750F55A8864EF7D38265F07E5A9273FA0E8DAFD39951332B580",
        coinMinimalDenom:
          "ibc/573FCD90FACEE750F55A8864EF7D38265F07E5A9273FA0E8DAFD39951332B580",
        coinDecimals: 6,
        coinGeckoId: "mars-protocol-a7fcbcfb-fd61-4017-92f0-7ee9f9cc6da3",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/mars/images/mars-token.png",
      },
      {
        coinDenom: "CNTO",
        chainSuggestionDenom:
          "ibc/D38BB3DD46864694F009AF01DA5A815B3A875F8CC52FF5679BFFCC35DC7451D5",
        coinMinimalDenom:
          "ibc/D38BB3DD46864694F009AF01DA5A815B3A875F8CC52FF5679BFFCC35DC7451D5",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/acrechain/images/cnto.png",
      },
      {
        coinDenom: "stLUNA",
        chainSuggestionDenom:
          "ibc/C491E7582E94AE921F6A029790083CDE1106C28F3F6C4AD7F1340544C13EC372",
        coinMinimalDenom:
          "ibc/C491E7582E94AE921F6A029790083CDE1106C28F3F6C4AD7F1340544C13EC372",
        coinDecimals: 6,
        coinGeckoId: "stride-staked-luna",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stluna.png",
      },
      {
        coinDenom: "stEVMOS",
        chainSuggestionDenom:
          "ibc/C5579A9595790017C600DD726276D978B9BF314CF82406CE342720A9C7911A01",
        coinMinimalDenom:
          "ibc/C5579A9595790017C600DD726276D978B9BF314CF82406CE342720A9C7911A01",
        coinDecimals: 18,
        coinGeckoId: "stride-staked-evmos",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stevmos.png",
      },
      {
        coinDenom: "NRIDE",
        chainSuggestionDenom:
          "ibc/E750D31033DC1CF4A044C3AA0A8117401316DC918FBEBC4E3D34F91B09D5F54C",
        coinMinimalDenom:
          "ibc/E750D31033DC1CF4A044C3AA0A8117401316DC918FBEBC4E3D34F91B09D5F54C",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/nride.png",
      },
      {
        coinDenom: "EBL",
        chainSuggestionDenom:
          "ibc/8BE73A810E22F80E5E850531A688600D63AE7392E7C2770AE758CAA4FD921B7F",
        coinMinimalDenom:
          "ibc/8BE73A810E22F80E5E850531A688600D63AE7392E7C2770AE758CAA4FD921B7F",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/8ball/images/8ball.png",
      },
      {
        coinDenom: "qATOM",
        chainSuggestionDenom:
          "ibc/FA602364BEC305A696CBDF987058E99D8B479F0318E47314C49173E8838C5BAC",
        coinMinimalDenom:
          "ibc/FA602364BEC305A696CBDF987058E99D8B479F0318E47314C49173E8838C5BAC",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qatom.png",
      },
      {
        coinDenom: "HARBOR",
        chainSuggestionDenom:
          "ibc/AD4DEA52408EA07C0C9E19444EC8DA84A274A70AD2687A710EFDDEB28BB2986A",
        coinMinimalDenom:
          "ibc/AD4DEA52408EA07C0C9E19444EC8DA84A274A70AD2687A710EFDDEB28BB2986A",
        coinDecimals: 6,
        coinGeckoId: "harbor-2",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/comdex/images/harbor.png",
      },
      {
        coinDenom: "qREGEN",
        chainSuggestionDenom:
          "ibc/79A676508A2ECA1021EDDC7BB9CF70CEEC9514C478DA526A5A8B3E78506C2206",
        coinMinimalDenom:
          "ibc/79A676508A2ECA1021EDDC7BB9CF70CEEC9514C478DA526A5A8B3E78506C2206",
        coinDecimals: 6,
        coinGeckoId: "regen",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qregen.png",
      },
      {
        coinDenom: "FOX",
        chainSuggestionDenom:
          "ibc/4F24D904BAB5FFBD3524F2DE3EC3C7A9E687A2408D9A985E57B356D9FA9201C6",
        coinMinimalDenom:
          "ibc/4F24D904BAB5FFBD3524F2DE3EC3C7A9E687A2408D9A985E57B356D9FA9201C6",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/fox.png",
      },
      {
        coinDenom: "QCK",
        chainSuggestionDenom:
          "ibc/635CB83EF1DFE598B10A3E90485306FD0D47D34217A4BE5FD9977FA010A5367D",
        coinMinimalDenom:
          "ibc/635CB83EF1DFE598B10A3E90485306FD0D47D34217A4BE5FD9977FA010A5367D",
        coinDecimals: 6,
        coinGeckoId: "quicksilver",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qck.png",
      },
      {
        coinDenom: "ARKH",
        chainSuggestionDenom:
          "ibc/0F91EE8B98AAE3CF393D94CD7F89A10F8D7758C5EC707E721899DFE65C164C28",
        coinMinimalDenom:
          "ibc/0F91EE8B98AAE3CF393D94CD7F89A10F8D7758C5EC707E721899DFE65C164C28",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/arkh/images/arkh.png",
      },
      {
        coinDenom: "qOSMO",
        chainSuggestionDenom:
          "ibc/42D24879D4569CE6477B7E88206ADBFE47C222C6CAD51A54083E4A72594269FC",
        coinMinimalDenom:
          "ibc/42D24879D4569CE6477B7E88206ADBFE47C222C6CAD51A54083E4A72594269FC",
        coinDecimals: 6,
        coinGeckoId: "osmosis",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qosmo.png",
      },
      {
        coinDenom: "FRNZ",
        chainSuggestionDenom:
          "ibc/7FA7EC64490E3BDE5A1A28CBE73CC0AD22522794957BC891C46321E3A6074DB9",
        coinMinimalDenom:
          "ibc/7FA7EC64490E3BDE5A1A28CBE73CC0AD22522794957BC891C46321E3A6074DB9",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/frnz.png",
      },
      {
        coinDenom: "WHALE",
        chainSuggestionDenom:
          "ibc/EDD6F0D66BCD49C1084FB2C35353B4ACD7B9191117CE63671B61320548F7C89D",
        coinMinimalDenom:
          "ibc/EDD6F0D66BCD49C1084FB2C35353B4ACD7B9191117CE63671B61320548F7C89D",
        coinDecimals: 6,
        coinGeckoId: "white-whale",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/white-whale.png",
      },
      {
        coinDenom: "GRDN",
        chainSuggestionDenom:
          "ibc/BAC9C6998F1F5C316D3353622EAEDAF8BD00FAABEB374FECDF8C9BC475172CFA",
        coinMinimalDenom:
          "ibc/BAC9C6998F1F5C316D3353622EAEDAF8BD00FAABEB374FECDF8C9BC475172CFA",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/guardian.png",
      },
      {
        coinDenom: "MNPU",
        chainSuggestionDenom:
          "ibc/DC0D3303BBE739E073224D0314385B88B247F56D71D726A91414CCA244FFFE7E",
        coinMinimalDenom:
          "ibc/DC0D3303BBE739E073224D0314385B88B247F56D71D726A91414CCA244FFFE7E",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/mnpu.png",
      },
      {
        coinDenom: "SHIBAC",
        chainSuggestionDenom:
          "ibc/447A0DCE83691056289503DDAB8EB08E52E167A73629F2ACC59F056B92F51CE8",
        coinMinimalDenom:
          "ibc/447A0DCE83691056289503DDAB8EB08E52E167A73629F2ACC59F056B92F51CE8",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/shibacosmos.png",
      },
      {
        coinDenom: "SKOJ",
        chainSuggestionDenom:
          "ibc/71066B030D8FC6479E638580E1BA9C44925E8C1F6E45036669D22017CFDC8C5E",
        coinMinimalDenom:
          "ibc/71066B030D8FC6479E638580E1BA9C44925E8C1F6E45036669D22017CFDC8C5E",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sikoba.png",
      },
      {
        coinDenom: "NCT",
        chainSuggestionDenom:
          "ibc/A76EB6ECF4E3E2D4A23C526FD1B48FDD42F171B206C9D2758EF778A7826ADD68",
        coinMinimalDenom:
          "ibc/A76EB6ECF4E3E2D4A23C526FD1B48FDD42F171B206C9D2758EF778A7826ADD68",
        coinDecimals: 6,
        coinGeckoId: "toucan-protocol-nature-carbon-tonne",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/nct.png",
      },
      {
        coinDenom: "CLST",
        chainSuggestionDenom:
          "ibc/0E4FA664327BD40B32803EE84A77F145834C0281B7F82B65521333B3669FA0BA",
        coinMinimalDenom:
          "ibc/0E4FA664327BD40B32803EE84A77F145834C0281B7F82B65521333B3669FA0BA",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/celestims.png",
      },
      {
        coinDenom: "OSDOGE",
        chainSuggestionDenom:
          "ibc/8AEEA9B9304392070F72611076C0E328CE3F2DECA1E18557E36F9DB4F09C0156",
        coinMinimalDenom:
          "ibc/8AEEA9B9304392070F72611076C0E328CE3F2DECA1E18557E36F9DB4F09C0156",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/osdoge.png",
      },
      {
        coinDenom: "APEMOS",
        chainSuggestionDenom:
          "ibc/1EB03F13F29FEA73444586FC4E88A8C14ACE9291501E9658E3BEF951EA4AC85D",
        coinMinimalDenom:
          "ibc/1EB03F13F29FEA73444586FC4E88A8C14ACE9291501E9658E3BEF951EA4AC85D",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/apemos.png",
      },
      {
        coinDenom: "INVDRS",
        chainSuggestionDenom:
          "ibc/3DB1721541C94AD19D7735FECED74C227E13F925BDB814392980B40A19C1ED54",
        coinMinimalDenom:
          "ibc/3DB1721541C94AD19D7735FECED74C227E13F925BDB814392980B40A19C1ED54",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/invdrs.png",
      },
      {
        coinDenom: "DOGA",
        chainSuggestionDenom:
          "ibc/04BE4E9C825ED781F9684A1226114BB49607500CAD855F1E3FEEC18532297250",
        coinMinimalDenom:
          "ibc/04BE4E9C825ED781F9684A1226114BB49607500CAD855F1E3FEEC18532297250",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/doga.png",
      },
      {
        coinDenom: "CATMOS",
        chainSuggestionDenom:
          "ibc/F4A07138CAEF0BFB4889E03C44C57956A48631061F1C8AB80421C1F229C1B835",
        coinMinimalDenom:
          "ibc/F4A07138CAEF0BFB4889E03C44C57956A48631061F1C8AB80421C1F229C1B835",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/catmos.png",
      },
      {
        coinDenom: "SUMMIT",
        chainSuggestionDenom:
          "ibc/56B988C4D934FB7503F5EA9B440C75D489C8AD5D193715B477BEC4F84B8BBA2A",
        coinMinimalDenom:
          "ibc/56B988C4D934FB7503F5EA9B440C75D489C8AD5D193715B477BEC4F84B8BBA2A",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/summit.png",
      },
      {
        coinDenom: "FLIX",
        chainSuggestionDenom:
          "ibc/CEE970BB3D26F4B907097B6B660489F13F3B0DA765B83CC7D9A0BC0CE220FA6F",
        coinMinimalDenom:
          "ibc/CEE970BB3D26F4B907097B6B660489F13F3B0DA765B83CC7D9A0BC0CE220FA6F",
        coinDecimals: 6,
        coinGeckoId: "omniflix-network",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/omniflixhub/images/flix.png",
      },
      {
        coinDenom: "SPACER",
        chainSuggestionDenom:
          "ibc/7A496DB7C2277D4B74EC4428DDB5AC8A62816FBD0DEBE1CFE094935D746BE19C",
        coinMinimalDenom:
          "ibc/7A496DB7C2277D4B74EC4428DDB5AC8A62816FBD0DEBE1CFE094935D746BE19C",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/spacer.png",
      },
      {
        coinDenom: "LIGHT",
        chainSuggestionDenom:
          "ibc/3DC08BDF2689978DBCEE28C7ADC2932AA658B2F64B372760FBC5A0058669AD29",
        coinMinimalDenom:
          "ibc/3DC08BDF2689978DBCEE28C7ADC2932AA658B2F64B372760FBC5A0058669AD29",
        coinDecimals: 9,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/light.png",
      },
      {
        coinDenom: "SILK",
        chainSuggestionDenom:
          "ibc/8A025A1E70101E39DE0C0F153E582A30806D3DA16795F6D868A3AA247D2DEDF7",
        coinMinimalDenom:
          "ibc/8A025A1E70101E39DE0C0F153E582A30806D3DA16795F6D868A3AA247D2DEDF7",
        coinDecimals: 6,
        coinGeckoId: "silk-bcec1136-561c-4706-a42c-8b67d0d7f7d2",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/silk.png",
      },
      {
        coinDenom: "MILE",
        chainSuggestionDenom:
          "ibc/912275A63A565BFD80734AEDFFB540132C51E446EAC41483B26EDE8A557C71CF",
        coinMinimalDenom:
          "ibc/912275A63A565BFD80734AEDFFB540132C51E446EAC41483B26EDE8A557C71CF",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/mille.png",
      },
      {
        coinDenom: "MANNA",
        chainSuggestionDenom:
          "ibc/980A2748F37C938AD129B92A51E2ABA8CFFC6862ADD61EC1B291125535DBE30B",
        coinMinimalDenom:
          "ibc/980A2748F37C938AD129B92A51E2ABA8CFFC6862ADD61EC1B291125535DBE30B",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/manna.png",
      },
      {
        coinDenom: "FIL",
        chainSuggestionDenom:
          "ibc/18FB5C09D9D2371F659D4846A956FA56225E377EE3C3652A2BF3542BF809159D",
        coinMinimalDenom:
          "ibc/18FB5C09D9D2371F659D4846A956FA56225E377EE3C3652A2BF3542BF809159D",
        coinDecimals: 18,
        coinGeckoId: "filecoin",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/filecoin/images/fil.png",
      },
      {
        coinDenom: "VOID",
        chainSuggestionDenom:
          "ibc/593F820ECE676A3E0890C734EC4F3A8DE16EC10A54EEDFA8BDFEB40EEA903960",
        coinMinimalDenom:
          "ibc/593F820ECE676A3E0890C734EC4F3A8DE16EC10A54EEDFA8BDFEB40EEA903960",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/void.png",
      },
      {
        coinDenom: "SHD",
        chainSuggestionDenom:
          "ibc/0B3D528E74E3DEAADF8A68F393887AC7E06028904D02173561B0D27F6E751D0A",
        coinMinimalDenom:
          "ibc/0B3D528E74E3DEAADF8A68F393887AC7E06028904D02173561B0D27F6E751D0A",
        coinDecimals: 8,
        coinGeckoId: "shade-protocol",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/shd.png",
      },
      {
        coinDenom: "BLZ",
        chainSuggestionDenom:
          "ibc/63CDD51098FD99E04E5F5610A3882CBE7614C441607BA6FCD7F3A3C1CD5325F8",
        coinMinimalDenom:
          "ibc/63CDD51098FD99E04E5F5610A3882CBE7614C441607BA6FCD7F3A3C1CD5325F8",
        coinDecimals: 6,
        coinGeckoId: "bluzelle",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/bluzelle/images/bluzelle.png",
      },
      {
        coinDenom: "ARB",
        chainSuggestionDenom:
          "ibc/10E5E5B06D78FFBB61FD9F89209DEE5FD4446ED0550CBB8E3747DA79E10D9DC6",
        coinMinimalDenom:
          "ibc/10E5E5B06D78FFBB61FD9F89209DEE5FD4446ED0550CBB8E3747DA79E10D9DC6",
        coinDecimals: 18,
        coinGeckoId: "arbitrum",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/arbitrum/images/arb.png",
      },
      {
        coinDenom: "SLCA",
        chainSuggestionDenom:
          "ibc/5164ECF584AD7DC27DA9E6A89E75DAB0F7C4FCB0A624B69215B8BC6A2C40CD07",
        coinMinimalDenom:
          "ibc/5164ECF584AD7DC27DA9E6A89E75DAB0F7C4FCB0A624B69215B8BC6A2C40CD07",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/silica.png",
      },
      {
        coinDenom: "PEPEC",
        chainSuggestionDenom:
          "ibc/C00B17F74C94449A62935B4C886E6F0F643249A270DEF269D53CE6741ECCDB93",
        coinMinimalDenom:
          "ibc/C00B17F74C94449A62935B4C886E6F0F643249A270DEF269D53CE6741ECCDB93",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/pepec.png",
      },
      {
        coinDenom: "PEPE",
        chainSuggestionDenom:
          "ibc/E47F4E97C534C95B942729E1B25DBDE111EA791411CFF100515050BEA0AC0C6B",
        coinMinimalDenom:
          "ibc/E47F4E97C534C95B942729E1B25DBDE111EA791411CFF100515050BEA0AC0C6B",
        coinDecimals: 18,
        coinGeckoId: "pepe",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/pepe.png",
      },
      {
        coinDenom: "IBCX",
        chainSuggestionDenom:
          "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
        coinMinimalDenom:
          "factory/osmo14klwqgkmackvx2tqa0trtg69dmy0nrg4ntq4gjgw2za4734r5seqjqm4gm/uibcx",
        coinDecimals: 6,
        coinGeckoId: "ibc-index",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/ibcx.svg",
      },
      {
        coinDenom: "cbETH",
        chainSuggestionDenom:
          "ibc/4D7A6F2A7744B1534C984A21F9EDFFF8809FC71A9E9243FFB702073E7FCA513A",
        coinMinimalDenom:
          "ibc/4D7A6F2A7744B1534C984A21F9EDFFF8809FC71A9E9243FFB702073E7FCA513A",
        coinDecimals: 18,
        coinGeckoId: "coinbase-wrapped-staked-eth",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/cbeth.png",
      },
      {
        coinDenom: "rETH",
        chainSuggestionDenom:
          "ibc/E610B83FD5544E00A8A1967A2EB3BEF25F1A8CFE8650FE247A8BD4ECA9DC9222",
        coinMinimalDenom:
          "ibc/E610B83FD5544E00A8A1967A2EB3BEF25F1A8CFE8650FE247A8BD4ECA9DC9222",
        coinDecimals: 18,
        coinGeckoId: "rocket-pool-eth",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/reth.png",
      },
      {
        coinDenom: "sfrxETH",
        chainSuggestionDenom:
          "ibc/81F578C39006EB4B27FFFA9460954527910D73390991B379C03B18934D272F46",
        coinMinimalDenom:
          "ibc/81F578C39006EB4B27FFFA9460954527910D73390991B379C03B18934D272F46",
        coinDecimals: 18,
        coinGeckoId: "staked-frax-ether",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/sfrxeth.svg",
      },
      {
        coinDenom: "wstETH.axl",
        chainSuggestionDenom:
          "ibc/B2BD584CD2A0A9CE53D4449667E26160C7D44A9C41AF50F602C201E5B3CCA46C",
        coinMinimalDenom:
          "ibc/B2BD584CD2A0A9CE53D4449667E26160C7D44A9C41AF50F602C201E5B3CCA46C",
        coinDecimals: 18,
        coinGeckoId: "wrapped-steth",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wsteth.svg",
      },
      {
        coinDenom: "LORE",
        chainSuggestionDenom:
          "ibc/B1C1806A540B3E165A2D42222C59946FB85BA325596FC85662D7047649F419F3",
        coinMinimalDenom:
          "ibc/B1C1806A540B3E165A2D42222C59946FB85BA325596FC85662D7047649F419F3",
        coinDecimals: 6,
        coinGeckoId: "gitopia",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/gitopia/images/lore.png",
      },
      {
        coinDenom: "ROAR",
        chainSuggestionDenom:
          "ibc/98BCD43F190C6960D0005BC46BB765C827403A361C9C03C2FF694150A30284B0",
        coinMinimalDenom:
          "ibc/98BCD43F190C6960D0005BC46BB765C827403A361C9C03C2FF694150A30284B0",
        coinDecimals: 6,
        coinGeckoId: "lion-dao",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/roar.png",
      },
      {
        coinDenom: "stUMEE",
        chainSuggestionDenom:
          "ibc/02F196DA6FD0917DD5FEA249EE61880F4D941EE9059E7964C5C9B50AF103800F",
        coinMinimalDenom:
          "ibc/02F196DA6FD0917DD5FEA249EE61880F4D941EE9059E7964C5C9B50AF103800F",
        coinDecimals: 6,
        coinGeckoId: "stride-staked-umee",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stumee.png",
      },
      {
        coinDenom: "stIBCX",
        chainSuggestionDenom:
          "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
        coinMinimalDenom:
          "factory/osmo1xqw2sl9zk8a6pch0csaw78n4swg5ws8t62wc5qta4gnjxfqg6v2qcs243k/stuibcx",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/stibcx.png",
      },
      {
        coinDenom: "NLS",
        chainSuggestionDenom:
          "ibc/D9AFCECDD361D38302AA66EB3BAC23B95234832C51D12489DC451FA2B7C72782",
        coinMinimalDenom:
          "ibc/D9AFCECDD361D38302AA66EB3BAC23B95234832C51D12489DC451FA2B7C72782",
        coinDecimals: 6,
        coinGeckoId: "nolus",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/nolus/images/nolus.png",
      },
      {
        coinDenom: "CUB",
        chainSuggestionDenom:
          "ibc/6F18EFEBF1688AA77F7EAC17065609494DC1BA12AFC78E9AEC832AF70A11BEF3",
        coinMinimalDenom:
          "ibc/6F18EFEBF1688AA77F7EAC17065609494DC1BA12AFC78E9AEC832AF70A11BEF3",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/cub.png",
      },
      {
        coinDenom: "BLUE",
        chainSuggestionDenom:
          "ibc/DA961FE314B009C38595FFE3AF41225D8894D663B8C3F6650DCB5B6F8435592E",
        coinMinimalDenom:
          "ibc/DA961FE314B009C38595FFE3AF41225D8894D663B8C3F6650DCB5B6F8435592E",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/blue.png",
      },
      {
        coinDenom: "NTRN",
        chainSuggestionDenom:
          "ibc/126DA09104B71B164883842B769C0E9EC1486C0887D27A9999E395C2C8FB5682",
        coinMinimalDenom:
          "ibc/126DA09104B71B164883842B769C0E9EC1486C0887D27A9999E395C2C8FB5682",
        coinDecimals: 6,
        coinGeckoId: "neutron-3",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/ntrn.png",
      },
      {
        coinDenom: "CASA",
        chainSuggestionDenom:
          "ibc/2F5C084037D951B24D100F15CC013A131DF786DCE1B1DBDC48F018A9B9A138DE",
        coinMinimalDenom:
          "ibc/2F5C084037D951B24D100F15CC013A131DF786DCE1B1DBDC48F018A9B9A138DE",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/casa.png",
      },
      {
        coinDenom: "PICA",
        chainSuggestionDenom:
          "ibc/56D7C03B8F6A07AD322EEE1BEF3AE996E09D1C1E34C27CF37E0D4A0AC5972516",
        coinMinimalDenom:
          "ibc/56D7C03B8F6A07AD322EEE1BEF3AE996E09D1C1E34C27CF37E0D4A0AC5972516",
        coinDecimals: 12,
        coinGeckoId: "picasso",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/composable/images/pica.svg",
      },
      {
        coinDenom: "KSM",
        chainSuggestionDenom:
          "ibc/6727B2F071643B3841BD535ECDD4ED9CAE52ABDD0DCD07C3630811A7A37B215C",
        coinMinimalDenom:
          "ibc/6727B2F071643B3841BD535ECDD4ED9CAE52ABDD0DCD07C3630811A7A37B215C",
        coinDecimals: 12,
        coinGeckoId: "kusama",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/kusama/images/ksm.svg",
      },
      {
        coinDenom: "DOT",
        chainSuggestionDenom:
          "ibc/6B2B19D874851F631FF0AF82C38A20D4B82F438C7A22F41EDA33568345397244",
        coinMinimalDenom:
          "ibc/6B2B19D874851F631FF0AF82C38A20D4B82F438C7A22F41EDA33568345397244",
        coinDecimals: 10,
        coinGeckoId: "polkadot",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/polkadot/images/dot.png",
      },
      {
        coinDenom: "QSR",
        chainSuggestionDenom:
          "ibc/1B708808D372E959CD4839C594960309283424C775F4A038AAEBE7F83A988477",
        coinMinimalDenom:
          "ibc/1B708808D372E959CD4839C594960309283424C775F4A038AAEBE7F83A988477",
        coinDecimals: 6,
        coinGeckoId: "quasar-2",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/quasar/images/quasar.png",
      },
      {
        coinDenom: "ARCH",
        chainSuggestionDenom:
          "ibc/23AB778D694C1ECFC59B91D8C399C115CC53B0BD1C61020D8E19519F002BDD85",
        coinMinimalDenom:
          "ibc/23AB778D694C1ECFC59B91D8C399C115CC53B0BD1C61020D8E19519F002BDD85",
        coinDecimals: 18,
        coinGeckoId: "archway",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/archway/images/archway.png",
      },
      {
        coinDenom: "MPWR",
        chainSuggestionDenom:
          "ibc/DD3938D8131F41994C1F01F4EB5233DEE9A0A5B787545B9A07A321925655BF38",
        coinMinimalDenom:
          "ibc/DD3938D8131F41994C1F01F4EB5233DEE9A0A5B787545B9A07A321925655BF38",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/empowerchain/images/mpwr.svg",
      },
      {
        coinDenom: "WATR",
        chainSuggestionDenom:
          "ibc/AABCB14ACAFD53A5C455BAC01EA0CA5AE18714895846681A52BFF1E3B960B44E",
        coinMinimalDenom:
          "ibc/AABCB14ACAFD53A5C455BAC01EA0CA5AE18714895846681A52BFF1E3B960B44E",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/watr.png",
      },
      {
        coinDenom: "KYVE",
        chainSuggestionDenom:
          "ibc/613BF0BF2F2146AE9941E923725745E931676B2C14E9768CD609FA0849B2AE13",
        coinMinimalDenom:
          "ibc/613BF0BF2F2146AE9941E923725745E931676B2C14E9768CD609FA0849B2AE13",
        coinDecimals: 6,
        coinGeckoId: "kyve-network",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/kyve/images/kyve-token.png",
      },
      {
        coinDenom: "USDT",
        chainSuggestionDenom:
          "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
        coinMinimalDenom:
          "ibc/4ABBEF4C8926DDDB320AE5188CFD63267ABBCEFC0583E4AE05D6E5AA2401DDAB",
        coinDecimals: 6,
        coinGeckoId: "tether",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.png",
      },
      {
        coinDenom: "ampOSMO",
        chainSuggestionDenom:
          "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
        coinMinimalDenom:
          "factory/osmo1dv8wz09tckslr2wy5z86r46dxvegylhpt97r9yd6qc3kyc6tv42qa89dr9/ampOSMO",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/amposmo.png",
      },
      {
        coinDenom: "SEI",
        chainSuggestionDenom:
          "ibc/71F11BC0AF8E526B80E44172EBA9D3F0A8E03950BB882325435691EBC9450B1D",
        coinMinimalDenom:
          "ibc/71F11BC0AF8E526B80E44172EBA9D3F0A8E03950BB882325435691EBC9450B1D",
        coinDecimals: 6,
        coinGeckoId: "sei-network",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/sei.png",
      },
      {
        coinDenom: "qSOMM",
        chainSuggestionDenom:
          "ibc/EAF76AD1EEF7B16D167D87711FB26ABE881AC7D9F7E6D0CF313D5FA530417208",
        coinMinimalDenom:
          "ibc/EAF76AD1EEF7B16D167D87711FB26ABE881AC7D9F7E6D0CF313D5FA530417208",
        coinDecimals: 6,
        coinGeckoId: "sommelier",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qsomm.png",
      },
      {
        coinDenom: "PASG",
        chainSuggestionDenom:
          "ibc/208B2F137CDE510B44C41947C045CFDC27F996A9D990EA64460BDD5B3DBEB2ED",
        coinMinimalDenom:
          "ibc/208B2F137CDE510B44C41947C045CFDC27F996A9D990EA64460BDD5B3DBEB2ED",
        coinDecimals: 6,
        coinGeckoId: "passage",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/passage/images/pasg.png",
      },
      {
        coinDenom: "stSOMM",
        chainSuggestionDenom:
          "ibc/5A0060579D24FBE5268BEA74C3281E7FE533D361C41A99307B4998FEC611E46B",
        coinMinimalDenom:
          "ibc/5A0060579D24FBE5268BEA74C3281E7FE533D361C41A99307B4998FEC611E46B",
        coinDecimals: 6,
        coinGeckoId: "stride-staked-sommelier",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stsomm.png",
      },
      {
        coinDenom: "SOL",
        chainSuggestionDenom:
          "ibc/1E43D59E565D41FB4E54CA639B838FFD5BCFC20003D330A56CB1396231AA1CBA",
        coinMinimalDenom:
          "ibc/1E43D59E565D41FB4E54CA639B838FFD5BCFC20003D330A56CB1396231AA1CBA",
        coinDecimals: 8,
        coinGeckoId: "wrapped-solana",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/sol.svg",
      },
      {
        coinDenom: "BONK",
        chainSuggestionDenom:
          "ibc/CA3733CB0071F480FAE8EF0D9C3D47A49C6589144620A642BBE0D59A293D110E",
        coinMinimalDenom:
          "ibc/CA3733CB0071F480FAE8EF0D9C3D47A49C6589144620A642BBE0D59A293D110E",
        coinDecimals: 5,
        coinGeckoId: "bonk",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/bonk.png",
      },
      {
        coinDenom: "USDT.wh",
        chainSuggestionDenom:
          "ibc/2108F2D81CBE328F371AD0CEF56691B18A86E08C3651504E42487D9EE92DDE9C",
        coinMinimalDenom:
          "ibc/2108F2D81CBE328F371AD0CEF56691B18A86E08C3651504E42487D9EE92DDE9C",
        coinDecimals: 6,
        coinGeckoId: "tether",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.png",
      },
      {
        coinDenom: "SUI",
        chainSuggestionDenom:
          "ibc/B1C287C2701774522570010EEBCD864BCB7AB714711B3AA218699FDD75E832F5",
        coinMinimalDenom:
          "ibc/B1C287C2701774522570010EEBCD864BCB7AB714711B3AA218699FDD75E832F5",
        coinDecimals: 8,
        coinGeckoId: "sui",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/sui/images/sui.svg",
      },
      {
        coinDenom: "APT",
        chainSuggestionDenom:
          "ibc/A4D176906C1646949574B48C1928D475F2DF56DE0AC04E1C99B08F90BC21ABDE",
        coinMinimalDenom:
          "ibc/A4D176906C1646949574B48C1928D475F2DF56DE0AC04E1C99B08F90BC21ABDE",
        coinDecimals: 8,
        coinGeckoId: "aptos",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/aptos/images/aptos.svg",
      },
      {
        coinDenom: "MNTA",
        chainSuggestionDenom:
          "ibc/51D893F870B7675E507E91DA8DB0B22EA66333207E4F5C0708757F08EE059B0B",
        coinMinimalDenom:
          "ibc/51D893F870B7675E507E91DA8DB0B22EA66333207E4F5C0708757F08EE059B0B",
        coinDecimals: 6,
        coinGeckoId: "mantadao",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/mnta.png",
      },
      {
        coinDenom: "DGL",
        chainSuggestionDenom:
          "ibc/D69F6D787EC649F4E998161A9F0646F4C2DCC64748A2AB982F14CAFBA7CC0EC9",
        coinMinimalDenom:
          "ibc/D69F6D787EC649F4E998161A9F0646F4C2DCC64748A2AB982F14CAFBA7CC0EC9",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/dgl.png",
      },
      {
        coinDenom: "USDC.wh",
        chainSuggestionDenom:
          "ibc/6B99DB46AA9FF47162148C1726866919E44A6A5E0274B90912FD17E19A337695",
        coinMinimalDenom:
          "ibc/6B99DB46AA9FF47162148C1726866919E44A6A5E0274B90912FD17E19A337695",
        coinDecimals: 6,
        coinGeckoId: "usd-coin",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
      },
      {
        coinDenom: "wETH.wh",
        chainSuggestionDenom:
          "ibc/62F82550D0B96522361C89B0DA1119DE262FBDFB25E5502BC5101B5C0D0DBAAC",
        coinMinimalDenom:
          "ibc/62F82550D0B96522361C89B0DA1119DE262FBDFB25E5502BC5101B5C0D0DBAAC",
        coinDecimals: 8,
        coinGeckoId: "weth",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.png",
      },
      {
        coinDenom: "USDC",
        chainSuggestionDenom:
          "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        coinMinimalDenom:
          "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4",
        coinDecimals: 6,
        coinGeckoId: "usd-coin",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/USDCoin.png",
      },
      {
        coinDenom: "YieldETH",
        chainSuggestionDenom:
          "ibc/FBB3FEF80ED2344D821D4F95C31DBFD33E4E31D5324CAD94EF756E67B749F668",
        coinMinimalDenom:
          "ibc/FBB3FEF80ED2344D821D4F95C31DBFD33E4E31D5324CAD94EF756E67B749F668",
        coinDecimals: 18,
        coinGeckoId: "yieldeth-sommelier",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/yieldeth.png",
      },
      {
        coinDenom: "XPLA",
        chainSuggestionDenom:
          "ibc/95C9B5870F95E21A242E6AF9ADCB1F212EE4A8855087226C36FBE43FC41A77B8",
        coinMinimalDenom:
          "ibc/95C9B5870F95E21A242E6AF9ADCB1F212EE4A8855087226C36FBE43FC41A77B8",
        coinDecimals: 18,
        coinGeckoId: "xpla",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/xpla/images/xpla.png",
      },
      {
        coinDenom: "OIN",
        chainSuggestionDenom:
          "ibc/98B3DBF1FA79C4C14CC5F08F62ACD5498560FCB515F677526FD200D54EA048B6",
        coinMinimalDenom:
          "ibc/98B3DBF1FA79C4C14CC5F08F62ACD5498560FCB515F677526FD200D54EA048B6",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/oin.png",
      },
      {
        coinDenom: "NEOK",
        chainSuggestionDenom:
          "ibc/DEE262653B9DE39BCEF0493D47E0DFC4FE62F7F046CF38B9FDEFEBE98D149A71",
        coinMinimalDenom:
          "ibc/DEE262653B9DE39BCEF0493D47E0DFC4FE62F7F046CF38B9FDEFEBE98D149A71",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/neok.png",
      },
      {
        coinDenom: "RIO",
        chainSuggestionDenom:
          "ibc/1CDF9C7D073DD59ED06F15DB08CC0901F2A24759BE70463570E8896F9A444ADF",
        coinMinimalDenom:
          "ibc/1CDF9C7D073DD59ED06F15DB08CC0901F2A24759BE70463570E8896F9A444ADF",
        coinDecimals: 18,
        coinGeckoId: "realio-network",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/realio/images/rio.png",
      },
      {
        coinDenom: "CDT",
        chainSuggestionDenom:
          "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
        coinMinimalDenom:
          "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/ucdt",
        coinDecimals: 6,
        coinGeckoId: "collateralized-debt-token",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/CDT.svg",
      },
      {
        coinDenom: "MBRN",
        chainSuggestionDenom:
          "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
        coinMinimalDenom:
          "factory/osmo1s794h9rxggytja3a4pmwul53u98k06zy2qtrdvjnfuxruh7s8yjs6cyxgd/umbrn",
        coinDecimals: 6,
        coinGeckoId: "membrane",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/MBRN.svg",
      },
      {
        coinDenom: "SGE",
        chainSuggestionDenom:
          "ibc/A1830DECC0B742F0B2044FF74BE727B5CF92C9A28A9235C3BACE4D24A23504FA",
        coinMinimalDenom:
          "ibc/A1830DECC0B742F0B2044FF74BE727B5CF92C9A28A9235C3BACE4D24A23504FA",
        coinDecimals: 6,
        coinGeckoId: "six-sigma",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/sge/images/sge.png",
      },
      {
        coinDenom: "FIS",
        chainSuggestionDenom:
          "ibc/01D2F0C4739C871BFBEE7E786709E6904A55559DC1483DD92ED392EF12247862",
        coinMinimalDenom:
          "ibc/01D2F0C4739C871BFBEE7E786709E6904A55559DC1483DD92ED392EF12247862",
        coinDecimals: 6,
        coinGeckoId: "stafi",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/stafihub/images/fis.svg",
      },
      {
        coinDenom: "rATOM",
        chainSuggestionDenom:
          "ibc/B66CE615C600ED0A8B5AF425ECFE0D57BE2377587F66C45934A76886F34DC9B7",
        coinMinimalDenom:
          "ibc/B66CE615C600ED0A8B5AF425ECFE0D57BE2377587F66C45934A76886F34DC9B7",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/stafihub/images/ratom.svg",
      },
      {
        coinDenom: "STRDST",
        chainSuggestionDenom:
          "ibc/CFF40564FDA3E958D9904B8B479124987901168494655D9CC6B7C0EC0416020B",
        coinMinimalDenom:
          "ibc/CFF40564FDA3E958D9904B8B479124987901168494655D9CC6B7C0EC0416020B",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/dust.png",
      },
      {
        coinDenom: "DORA",
        chainSuggestionDenom:
          "ibc/672406ADE4EDFD8C5EA7A0D0DD0C37E431DA7BD8393A15CD2CFDE3364917EB2A",
        coinMinimalDenom:
          "ibc/672406ADE4EDFD8C5EA7A0D0DD0C37E431DA7BD8393A15CD2CFDE3364917EB2A",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/doravota/images/dora.svg",
      },
      {
        coinDenom: "COREUM",
        chainSuggestionDenom:
          "ibc/F3166F4D31D6BA1EC6C9F5536F5DDDD4CC93DBA430F7419E7CDC41C497944A65",
        coinMinimalDenom:
          "ibc/F3166F4D31D6BA1EC6C9F5536F5DDDD4CC93DBA430F7419E7CDC41C497944A65",
        coinDecimals: 6,
        coinGeckoId: "coreum",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/coreum/images/coreum.png",
      },
      {
        coinDenom: "TIA",
        chainSuggestionDenom:
          "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877",
        coinMinimalDenom:
          "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877",
        coinDecimals: 6,
        coinGeckoId: "celestia",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/celestia/images/celestia.png",
      },
      {
        coinDenom: "DYDX",
        chainSuggestionDenom:
          "ibc/831F0B1BBB1D08A2B75311892876D71565478C532967545476DF4C2D7492E48C",
        coinMinimalDenom:
          "ibc/831F0B1BBB1D08A2B75311892876D71565478C532967545476DF4C2D7492E48C",
        coinDecimals: 18,
        coinGeckoId: "dydx-chain",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/dydx/images/dydx.png",
      },
      {
        coinDenom: "FX",
        chainSuggestionDenom:
          "ibc/2B30802A0B03F91E4E16D6175C9B70F2911377C1CAE9E50FF011C821465463F9",
        coinMinimalDenom:
          "ibc/2B30802A0B03F91E4E16D6175C9B70F2911377C1CAE9E50FF011C821465463F9",
        coinDecimals: 18,
        coinGeckoId: "fx-coin",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/fxcore/images/fx.png",
      },
      {
        coinDenom: "nBTC",
        chainSuggestionDenom:
          "ibc/75345531D87BD90BF108BE7240BD721CB2CB0A1F16D4EBA71B09EC3C43E15C8F",
        coinMinimalDenom:
          "ibc/75345531D87BD90BF108BE7240BD721CB2CB0A1F16D4EBA71B09EC3C43E15C8F",
        coinDecimals: 14,
        coinGeckoId: "bitcoin",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/nomic/images/nbtc.png",
      },
      {
        coinDenom: "NOIS",
        chainSuggestionDenom:
          "ibc/6928AFA9EA721938FED13B051F9DBF1272B16393D20C49EA5E4901BB76D94A90",
        coinMinimalDenom:
          "ibc/6928AFA9EA721938FED13B051F9DBF1272B16393D20C49EA5E4901BB76D94A90",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/nois/images/nois.png",
      },
      {
        coinDenom: "sqOSMO",
        chainSuggestionDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
        coinMinimalDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/squosmo",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/sqosmo.svg",
      },
      {
        coinDenom: "NSTK",
        chainSuggestionDenom:
          "ibc/F74225B0AFD2F675AF56E9BE3F235486BCDE5C5E09AA88A97AFD2E052ABFE04C",
        coinMinimalDenom:
          "ibc/F74225B0AFD2F675AF56E9BE3F235486BCDE5C5E09AA88A97AFD2E052ABFE04C",
        coinDecimals: 6,
        coinGeckoId: "unstake-fi",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/nstk.svg",
      },
      {
        coinDenom: "BRNCH",
        chainSuggestionDenom:
          "ibc/71DAA4CAFA4FE2F9803ABA0696BA5FC0EFC14305A2EA8B4E01880DB851B1EC02",
        coinMinimalDenom:
          "ibc/71DAA4CAFA4FE2F9803ABA0696BA5FC0EFC14305A2EA8B4E01880DB851B1EC02",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/brnch.png",
      },
      {
        coinDenom: "wstETH",
        chainSuggestionDenom:
          "ibc/2F21E6D4271DE3F561F20A02CD541DAF7405B1E9CB3B9B07E3C2AC7D8A4338A5",
        coinMinimalDenom:
          "ibc/2F21E6D4271DE3F561F20A02CD541DAF7405B1E9CB3B9B07E3C2AC7D8A4338A5",
        coinDecimals: 18,
        coinGeckoId: "wrapped-steth",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wsteth.svg",
      },
      {
        coinDenom: "sqATOM",
        chainSuggestionDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom",
        coinMinimalDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqatom",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/sqatom.svg",
      },
      {
        coinDenom: "sqBTC",
        chainSuggestionDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqbtc",
        coinMinimalDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqbtc",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/sqbtc.svg",
      },
      {
        coinDenom: "QWOYN",
        chainSuggestionDenom:
          "ibc/09FAF1E04435E14C68DE7AB0D03C521C92975C792DB12B2EA390BAA2E06B3F3D",
        coinMinimalDenom:
          "ibc/09FAF1E04435E14C68DE7AB0D03C521C92975C792DB12B2EA390BAA2E06B3F3D",
        coinDecimals: 6,
        coinGeckoId: "qwoyn",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/qwoyn/images/qwoyn.png",
      },
      {
        coinDenom: "HYDROGEN",
        chainSuggestionDenom:
          "ibc/4F3B0EC2FE2D370D10C3671A1B7B06D2A964C721470C305CBB846ED60E6CAA20",
        coinMinimalDenom:
          "ibc/4F3B0EC2FE2D370D10C3671A1B7B06D2A964C721470C305CBB846ED60E6CAA20",
        coinDecimals: 0,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/hydrogen.png",
      },
      {
        coinDenom: "TOCYB",
        chainSuggestionDenom:
          "ibc/BCDB35B7390806F35E716D275E1E017999F8281A81B6F128F087EF34D1DFA761",
        coinMinimalDenom:
          "ibc/BCDB35B7390806F35E716D275E1E017999F8281A81B6F128F087EF34D1DFA761",
        coinDecimals: 0,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/tocyb.png",
      },
      {
        coinDenom: "V",
        chainSuggestionDenom:
          "ibc/D3A1900B2B520E45608B5671ADA461E1109628E89B4289099557C6D3996F7DAA",
        coinMinimalDenom:
          "ibc/D3A1900B2B520E45608B5671ADA461E1109628E89B4289099557C6D3996F7DAA",
        coinDecimals: 3,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/volt.png",
      },
      {
        coinDenom: "A",
        chainSuggestionDenom:
          "ibc/020F5162B7BC40656FC5432622647091F00D53E82EE8D21757B43D3282F25424",
        coinMinimalDenom:
          "ibc/020F5162B7BC40656FC5432622647091F00D53E82EE8D21757B43D3282F25424",
        coinDecimals: 3,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/bostrom/images/ampere.png",
      },
      {
        coinDenom: "SOURCE",
        chainSuggestionDenom:
          "ibc/E7905742CE2EA4EA5D592527DC89220C59B617DE803939FE7293805A64B484D7",
        coinMinimalDenom:
          "ibc/E7905742CE2EA4EA5D592527DC89220C59B617DE803939FE7293805A64B484D7",
        coinDecimals: 6,
        coinGeckoId: "source",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/source/images/source.png",
      },
      {
        coinDenom: "PYTH",
        chainSuggestionDenom:
          "ibc/E42006ED917C769EDE1B474650EEA6BFE3F97958912B9206DD7010A28D01D9D5",
        coinMinimalDenom:
          "ibc/E42006ED917C769EDE1B474650EEA6BFE3F97958912B9206DD7010A28D01D9D5",
        coinDecimals: 6,
        coinGeckoId: "pyth-network",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/pyth.svg",
      },
      {
        coinDenom: "stkOSMO",
        chainSuggestionDenom:
          "ibc/ECBE78BF7677320A93E7BA1761D144BCBF0CBC247C290C049655E106FE5DC68E",
        coinMinimalDenom:
          "ibc/ECBE78BF7677320A93E7BA1761D144BCBF0CBC247C290C049655E106FE5DC68E",
        coinDecimals: 6,
        coinGeckoId: "pstake-staked-osmo",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/persistence/images/stkosmo.png",
      },
      {
        coinDenom: "LVN",
        chainSuggestionDenom:
          "factory/osmo1mlng7pz4pnyxtpq0akfwall37czyk9lukaucsrn30ameplhhshtqdvfm5c/ulvn",
        coinMinimalDenom:
          "factory/osmo1mlng7pz4pnyxtpq0akfwall37czyk9lukaucsrn30ameplhhshtqdvfm5c/ulvn",
        coinDecimals: 6,
        coinGeckoId: "levana-protocol",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/levana.png",
      },
      {
        coinDenom: "PUPPY",
        chainSuggestionDenom:
          "ibc/46AC07DBFF1352EC94AF5BD4D23740D92D9803A6B41F6E213E77F3A1143FB963",
        coinMinimalDenom:
          "ibc/46AC07DBFF1352EC94AF5BD4D23740D92D9803A6B41F6E213E77F3A1143FB963",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/puppyhuahua_logo.png",
      },
      {
        coinDenom: "NEWT",
        chainSuggestionDenom:
          "ibc/BF685448E564B5A4AC8F6E0493A0B979D0E0BF5EC11F7E15D25A0A2160C944DD",
        coinMinimalDenom:
          "ibc/BF685448E564B5A4AC8F6E0493A0B979D0E0BF5EC11F7E15D25A0A2160C944DD",
        coinDecimals: 6,
        coinGeckoId: "newt",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/newt.png",
      },
      {
        coinDenom: "milkTIA",
        chainSuggestionDenom:
          "factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA",
        coinMinimalDenom:
          "factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0/umilkTIA",
        coinDecimals: 6,
        coinGeckoId: "milkyway-staked-tia",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/milktia.png",
      },
      {
        coinDenom: "ASH",
        chainSuggestionDenom:
          "ibc/4976049456D261659D0EC499CC9C2391D3C7D1128A0B9FB0BBF2842D1B2BC7BC",
        coinMinimalDenom:
          "ibc/4976049456D261659D0EC499CC9C2391D3C7D1128A0B9FB0BBF2842D1B2BC7BC",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/ash.svg",
      },
      {
        coinDenom: "RAC",
        chainSuggestionDenom:
          "ibc/DDF1CD4CDC14AE2D6A3060193624605FF12DEE71CF1F8C19EEF35E9447653493",
        coinMinimalDenom:
          "ibc/DDF1CD4CDC14AE2D6A3060193624605FF12DEE71CF1F8C19EEF35E9447653493",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/rac.png",
      },
      {
        coinDenom: "GUPPY",
        chainSuggestionDenom:
          "ibc/42A9553A7770F3D7B62F3A82AF04E7719B4FD6EAF31BE5645092AAC4A6C2201D",
        coinMinimalDenom:
          "ibc/42A9553A7770F3D7B62F3A82AF04E7719B4FD6EAF31BE5645092AAC4A6C2201D",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/guppy.png",
      },
      {
        coinDenom: "ISLM",
        chainSuggestionDenom:
          "ibc/69110FF673D70B39904FF056CFDFD58A90BEC3194303F45C32CB91B8B0A738EA",
        coinMinimalDenom:
          "ibc/69110FF673D70B39904FF056CFDFD58A90BEC3194303F45C32CB91B8B0A738EA",
        coinDecimals: 18,
        coinGeckoId: "islamic-coin",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/haqq/images/islm.png",
      },
      {
        coinDenom: "AUTISM",
        chainSuggestionDenom:
          "ibc/9DDF52A334F92BC57A9E0D59DFF9984EAC61D2A14E5162605DF601AA58FDFC6D",
        coinMinimalDenom:
          "ibc/9DDF52A334F92BC57A9E0D59DFF9984EAC61D2A14E5162605DF601AA58FDFC6D",
        coinDecimals: 6,
        coinGeckoId: "autism",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/autism.png",
      },
      {
        coinDenom: "PAGE",
        chainSuggestionDenom:
          "ibc/23A62409E4AD8133116C249B1FA38EED30E500A115D7B153109462CD82C1CD99",
        coinMinimalDenom:
          "ibc/23A62409E4AD8133116C249B1FA38EED30E500A115D7B153109462CD82C1CD99",
        coinDecimals: 8,
        coinGeckoId: "page",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/page.png",
      },
      {
        coinDenom: "PURSE",
        chainSuggestionDenom:
          "ibc/6FD2938076A4C1BB3A324A676E76B0150A4443DAE0E002FB62AC0E6B604B1519",
        coinMinimalDenom:
          "ibc/6FD2938076A4C1BB3A324A676E76B0150A4443DAE0E002FB62AC0E6B604B1519",
        coinDecimals: 18,
        coinGeckoId: "pundi-x-purse",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/pundix/images/purse-token-logo.png",
      },
      {
        coinDenom: "NINJA",
        chainSuggestionDenom:
          "ibc/183C0BB962D2F57C957E0B134CFA0AC9D6F755C02DE9DC2A59089BA23009DEC3",
        coinMinimalDenom:
          "ibc/183C0BB962D2F57C957E0B134CFA0AC9D6F755C02DE9DC2A59089BA23009DEC3",
        coinDecimals: 6,
        coinGeckoId: "dog-wif-nuchucks",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/ninja.png",
      },
      {
        coinDenom: "KLEO",
        chainSuggestionDenom:
          "ibc/5F5B7DA5ECC80F6C7A8702D525BB0B74279B1F7B8EFAE36E423D68788F7F39FF",
        coinMinimalDenom:
          "ibc/5F5B7DA5ECC80F6C7A8702D525BB0B74279B1F7B8EFAE36E423D68788F7F39FF",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/kleomedes.png",
      },
      {
        coinDenom: "NYX",
        chainSuggestionDenom:
          "ibc/1A611E8A3E4248106A1A5A80A64BFA812739435E8B9888EB3F652A21F029F317",
        coinMinimalDenom:
          "ibc/1A611E8A3E4248106A1A5A80A64BFA812739435E8B9888EB3F652A21F029F317",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/nyx/images/nyx.png",
      },
      {
        coinDenom: "NYM",
        chainSuggestionDenom:
          "ibc/37CB3078432510EE57B9AFA8DBE028B33AE3280A144826FEAC5F2334CF2C5539",
        coinMinimalDenom:
          "ibc/37CB3078432510EE57B9AFA8DBE028B33AE3280A144826FEAC5F2334CF2C5539",
        coinDecimals: 6,
        coinGeckoId: "nym",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/nyx/images/nym.png",
      },
      {
        coinDenom: "BADDOG",
        chainSuggestionDenom:
          "ibc/2FFE07C4B4EFC0DDA099A16C6AF3C9CCA653CC56077E87217A585D48794B0BC7",
        coinMinimalDenom:
          "ibc/2FFE07C4B4EFC0DDA099A16C6AF3C9CCA653CC56077E87217A585D48794B0BC7",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/baddog.png",
      },
      {
        coinDenom: "CIRCUS",
        chainSuggestionDenom:
          "ibc/8C8F6349F656C943543C6B040377BE44123D01F712277815C3C13098BB98818C",
        coinMinimalDenom:
          "ibc/8C8F6349F656C943543C6B040377BE44123D01F712277815C3C13098BB98818C",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/circus.png",
      },
      {
        coinDenom: "JAPE",
        chainSuggestionDenom:
          "ibc/176DD560277BB0BD676260BE02EBAB697725CA85144D8A2BF286C6B5323DB5FE",
        coinMinimalDenom:
          "ibc/176DD560277BB0BD676260BE02EBAB697725CA85144D8A2BF286C6B5323DB5FE",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/jape.png",
      },
      {
        coinDenom: "WOOF",
        chainSuggestionDenom:
          "ibc/9B8EC667B6DF55387DC0F3ACC4F187DA6921B0806ED35DE6B04DE96F5AB81F53",
        coinMinimalDenom:
          "ibc/9B8EC667B6DF55387DC0F3ACC4F187DA6921B0806ED35DE6B04DE96F5AB81F53",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/chihuahua/images/woof.png",
      },
      {
        coinDenom: "SNEAKY",
        chainSuggestionDenom:
          "ibc/94ED1F172BC633DFC56D7E26551D8B101ADCCC69052AC44FED89F97FF658138F",
        coinMinimalDenom:
          "ibc/94ED1F172BC633DFC56D7E26551D8B101ADCCC69052AC44FED89F97FF658138F",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/sneaky.png",
      },
      {
        coinDenom: "WBTC",
        chainSuggestionDenom:
          "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
        coinMinimalDenom:
          "factory/osmo1z0qrq605sjgcqpylfl4aa6s90x738j7m58wyatt0tdzflg2ha26q67k743/wbtc",
        coinDecimals: 8,
        coinGeckoId: "wrapped-bitcoin",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wbtc.png",
      },
      {
        coinDenom: "BAD",
        chainSuggestionDenom:
          "ibc/442A08C33AE9875DF90792FFA73B5728E1CAECE87AB4F26AE9B422F1E682ED23",
        coinMinimalDenom:
          "ibc/442A08C33AE9875DF90792FFA73B5728E1CAECE87AB4F26AE9B422F1E682ED23",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/bad.png",
      },
      {
        coinDenom: "SGNL",
        chainSuggestionDenom:
          "ibc/4BDADBEDA31899036AB286E9901116496A9D85FB87B35A408C9D67C0DCAC660A",
        coinMinimalDenom:
          "ibc/4BDADBEDA31899036AB286E9901116496A9D85FB87B35A408C9D67C0DCAC660A",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/sgnl.png",
      },
      {
        coinDenom: "WOSMO",
        chainSuggestionDenom:
          "factory/osmo1pfyxruwvtwk00y8z06dh2lqjdj82ldvy74wzm3/WOSMO",
        coinMinimalDenom:
          "factory/osmo1pfyxruwvtwk00y8z06dh2lqjdj82ldvy74wzm3/WOSMO",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/wosmo.png",
      },
      {
        coinDenom: "sqTIA",
        chainSuggestionDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqtia",
        coinMinimalDenom:
          "factory/osmo1g8qypve6l95xmhgc0fddaecerffymsl7kn9muw/sqtia",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/sqtia.svg",
      },
      {
        coinDenom: "APOLLO",
        chainSuggestionDenom:
          "ibc/73BB20AF857D1FE6E061D01CA13870872AD0C979497CAF71BEA25B1CBF6879F1",
        coinMinimalDenom:
          "ibc/73BB20AF857D1FE6E061D01CA13870872AD0C979497CAF71BEA25B1CBF6879F1",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/apollo.svg",
      },
      {
        coinDenom: "stDYDX",
        chainSuggestionDenom:
          "ibc/980E82A9F8E7CA8CD480F4577E73682A6D3855A267D1831485D7EBEF0E7A6C2C",
        coinMinimalDenom:
          "ibc/980E82A9F8E7CA8CD480F4577E73682A6D3855A267D1831485D7EBEF0E7A6C2C",
        coinDecimals: 18,
        coinGeckoId: "dydx-chain",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stdydx.png",
      },
      {
        coinDenom: "stTIA",
        chainSuggestionDenom:
          "ibc/698350B8A61D575025F3ED13E9AC9C0F45C89DEFE92F76D5838F1D3C1A7FF7C9",
        coinMinimalDenom:
          "ibc/698350B8A61D575025F3ED13E9AC9C0F45C89DEFE92F76D5838F1D3C1A7FF7C9",
        coinDecimals: 6,
        coinGeckoId: "celestia",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/sttia.png",
      },
      {
        coinDenom: "stSAGA",
        chainSuggestionDenom:
          "ibc/2CD9F8161C3FC332E78EF0C25F6E684D09379FB2F56EF9267E7EC139642EC57B",
        coinMinimalDenom:
          "ibc/2CD9F8161C3FC332E78EF0C25F6E684D09379FB2F56EF9267E7EC139642EC57B",
        coinDecimals: 6,
        coinGeckoId: "saga-2",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stsaga.png",
      },
      {
        coinDenom: "stINJ",
        chainSuggestionDenom:
          "ibc/C04DFC9BCD893E57F2BEFE40F63EFD18D2768514DBD5F63ABD2FF7F48FC01D36",
        coinMinimalDenom:
          "ibc/C04DFC9BCD893E57F2BEFE40F63EFD18D2768514DBD5F63ABD2FF7F48FC01D36",
        coinDecimals: 18,
        coinGeckoId: "injective-protocol",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stinj.png",
      },
      {
        coinDenom: "injective.GLTO",
        chainSuggestionDenom:
          "ibc/072E5B3D6F278B3E6A9C51D7EAD1A737148609512C5EBE8CBCB5663264A0DDB7",
        coinMinimalDenom:
          "ibc/072E5B3D6F278B3E6A9C51D7EAD1A737148609512C5EBE8CBCB5663264A0DDB7",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/glto.png",
      },
      {
        coinDenom: "DYM",
        chainSuggestionDenom:
          "ibc/9A76CDF0CBCEF37923F32518FA15E5DC92B9F56128292BC4D63C4AEA76CBB110",
        coinMinimalDenom:
          "ibc/9A76CDF0CBCEF37923F32518FA15E5DC92B9F56128292BC4D63C4AEA76CBB110",
        coinDecimals: 18,
        coinGeckoId: "dymension",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/dymension/images/dymension-logo.png",
      },
      {
        coinDenom: "RAPTR",
        chainSuggestionDenom:
          "factory/osmo1279xudevmf5cw83vkhglct7jededp86k90k2le/RAPTR",
        coinMinimalDenom:
          "factory/osmo1279xudevmf5cw83vkhglct7jededp86k90k2le/RAPTR",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/RAPTR.png",
      },
      {
        coinDenom: "ASTRO.cw20",
        chainSuggestionDenom:
          "ibc/C25A2303FE24B922DAFFDCE377AC5A42E5EF746806D32E2ED4B610DE85C203F7",
        coinMinimalDenom:
          "ibc/C25A2303FE24B922DAFFDCE377AC5A42E5EF746806D32E2ED4B610DE85C203F7",
        coinDecimals: 6,
        coinGeckoId: "astroport-fi",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/astro-cw20.svg",
      },
      {
        coinDenom: "BADKID",
        chainSuggestionDenom:
          "factory/osmo10n8rv8npx870l69248hnp6djy6pll2yuzzn9x8/BADKID",
        coinMinimalDenom:
          "factory/osmo10n8rv8npx870l69248hnp6djy6pll2yuzzn9x8/BADKID",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/badkid.png",
      },
      {
        coinDenom: "solana.USDC.wh",
        chainSuggestionDenom:
          "ibc/F08DE332018E8070CC4C68FE06E04E254F527556A614F5F8F9A68AF38D367E45",
        coinMinimalDenom:
          "ibc/F08DE332018E8070CC4C68FE06E04E254F527556A614F5F8F9A68AF38D367E45",
        coinDecimals: 6,
        coinGeckoId: "usd-coin",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.svg",
      },
      {
        coinDenom: "HEART",
        chainSuggestionDenom:
          "ibc/35CECC330D11DD00FACB555D07687631E0BC7D226260CC5F015F6D7980819533",
        coinMinimalDenom:
          "ibc/35CECC330D11DD00FACB555D07687631E0BC7D226260CC5F015F6D7980819533",
        coinDecimals: 18,
        coinGeckoId: "humans-ai",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/humans/images/heart-dark-mode.png",
      },
      {
        coinDenom: "BERLIN-legacy",
        chainSuggestionDenom:
          "ibc/2BF9656CAB0384A31167DB9B0254F0FB1CB4346A229BD7E5CBDCBB911C3740F7",
        coinMinimalDenom:
          "ibc/2BF9656CAB0384A31167DB9B0254F0FB1CB4346A229BD7E5CBDCBB911C3740F7",
        coinDecimals: 18,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/evmos/images/berlin.png",
      },
      {
        coinDenom: "SCR",
        chainSuggestionDenom:
          "ibc/178248C262DE2E141EE6287EE7AB0854F05F25B0A3F40C4B912FA1C7E51F466E",
        coinMinimalDenom:
          "ibc/178248C262DE2E141EE6287EE7AB0854F05F25B0A3F40C4B912FA1C7E51F466E",
        coinDecimals: 9,
        coinGeckoId: "scorum",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/scorum/images/scr.png",
      },
      {
        coinDenom: "C4E",
        chainSuggestionDenom:
          "ibc/62118FB4D5FEDD5D2B18DC93648A745CD5E5B01D420E9B7A5FED5381CB13A7E8",
        coinMinimalDenom:
          "ibc/62118FB4D5FEDD5D2B18DC93648A745CD5E5B01D420E9B7A5FED5381CB13A7E8",
        coinDecimals: 6,
        coinGeckoId: "chain4energy",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/chain4energy/images/c4e.png",
      },
      {
        coinDenom: "BMOS",
        chainSuggestionDenom:
          "ibc/7D389F0ABF1E4D45BE6D7BBE36A2C50EA0559C01E076B02F8E381E685EC1F942",
        coinMinimalDenom:
          "ibc/7D389F0ABF1E4D45BE6D7BBE36A2C50EA0559C01E076B02F8E381E685EC1F942",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/bitmos.png",
      },
      {
        coinDenom: "SRCX",
        chainSuggestionDenom:
          "ibc/C97473CD237EBA2F94FDFA6ABA5EC0E22FA140655D73D2A2754F03A347BBA40B",
        coinMinimalDenom:
          "ibc/C97473CD237EBA2F94FDFA6ABA5EC0E22FA140655D73D2A2754F03A347BBA40B",
        coinDecimals: 9,
        coinGeckoId: "source-protocol",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/binancesmartchain/images/srcx.png",
      },
      {
        coinDenom: "ROCK",
        chainSuggestionDenom:
          "ibc/0835781EF3F3ADD053874323AB660C75B50B18B16733CAB783CA6BBD78244EDF",
        coinMinimalDenom:
          "ibc/0835781EF3F3ADD053874323AB660C75B50B18B16733CAB783CA6BBD78244EDF",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/pylons/images/pylons.png",
      },
      {
        coinDenom: "BSKT",
        chainSuggestionDenom:
          "ibc/CDD1E59BD5034C1B2597DD199782204EB397DB93200AA2E99C0AF3A66B2915FA",
        coinMinimalDenom:
          "ibc/CDD1E59BD5034C1B2597DD199782204EB397DB93200AA2E99C0AF3A66B2915FA",
        coinDecimals: 5,
        coinGeckoId: "basket",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/bskt.png",
      },
      {
        coinDenom: "AIOZ",
        chainSuggestionDenom:
          "ibc/BB0AFE2AFBD6E883690DAE4B9168EAC2B306BCC9C9292DACBB4152BBB08DB25F",
        coinMinimalDenom:
          "ibc/BB0AFE2AFBD6E883690DAE4B9168EAC2B306BCC9C9292DACBB4152BBB08DB25F",
        coinDecimals: 18,
        coinGeckoId: "aioz-network",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/aioz/images/aioz.png",
      },
      {
        coinDenom: "stDYM",
        chainSuggestionDenom:
          "ibc/D53E785DC9C5C2CA50CADB1EFE4DE5D0C30418BE0E9C6F2AF9F092A247E8BC22",
        coinMinimalDenom:
          "ibc/D53E785DC9C5C2CA50CADB1EFE4DE5D0C30418BE0E9C6F2AF9F092A247E8BC22",
        coinDecimals: 18,
        coinGeckoId: "dymension",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/stdym.png",
      },
      {
        coinDenom: "DOKI",
        chainSuggestionDenom:
          "ibc/C12C353A83CD1005FC38943410B894DBEC5F2ABC97FC12908F0FB03B970E8E1B",
        coinMinimalDenom:
          "ibc/C12C353A83CD1005FC38943410B894DBEC5F2ABC97FC12908F0FB03B970E8E1B",
        coinDecimals: 6,
        coinGeckoId: "doki",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/odin/images/doki_Logo.png",
      },
      {
        coinDenom: "SAIL",
        chainSuggestionDenom:
          "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail",
        coinMinimalDenom:
          "factory/osmo1rckme96ptawr4zwexxj5g5gej9s2dmud8r2t9j0k0prn5mch5g4snzzwjv/sail",
        coinDecimals: 6,
        coinGeckoId: "sail-dao",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/sail.png",
      },
      {
        coinDenom: "SHARK",
        chainSuggestionDenom:
          "ibc/64D56DF9EC69BE554F49EBCE0199611062FF1137EF105E2F645C1997344F3834",
        coinMinimalDenom:
          "ibc/64D56DF9EC69BE554F49EBCE0199611062FF1137EF105E2F645C1997344F3834",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/shark.png",
      },
      {
        coinDenom: "XRP.core",
        chainSuggestionDenom:
          "ibc/63A7CA0B6838AD8CAD6B5103998FF9B9B6A6F06FBB9638BFF51E63E0142339F3",
        coinMinimalDenom:
          "ibc/63A7CA0B6838AD8CAD6B5103998FF9B9B6A6F06FBB9638BFF51E63E0142339F3",
        coinDecimals: 6,
        coinGeckoId: "ripple",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/xrpl/images/xrp.png",
      },
      {
        coinDenom: "SEIYAN",
        chainSuggestionDenom:
          "ibc/86074B8DF625A75C25D52FA6112E3FD5446BA41FE418880C168CA99D10E22F05",
        coinMinimalDenom:
          "ibc/86074B8DF625A75C25D52FA6112E3FD5446BA41FE418880C168CA99D10E22F05",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/sei/images/SEIYAN.png",
      },
      {
        coinDenom: "NIBI",
        chainSuggestionDenom:
          "ibc/4017C65CEA338196ECCEC3FE3FE8258F23D1DE88F1D95750CC912C7A1C1016FF",
        coinMinimalDenom:
          "ibc/4017C65CEA338196ECCEC3FE3FE8258F23D1DE88F1D95750CC912C7A1C1016FF",
        coinDecimals: 6,
        coinGeckoId: "nibiru",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/nibiru/images/nibiru.png",
      },
      {
        coinDenom: "BEAST",
        chainSuggestionDenom:
          "ibc/B84F8CC583A54DA8173711C0B66B22FDC1954FEB1CA8DBC66C89919DAFE02000",
        coinMinimalDenom:
          "ibc/B84F8CC583A54DA8173711C0B66B22FDC1954FEB1CA8DBC66C89919DAFE02000",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/beast.png",
      },
      {
        coinDenom: "CVN",
        chainSuggestionDenom:
          "ibc/044B7B28AFE93CEC769CF529ADC626DA09EA0EFA3E0E3284D540E9E00E01E24A",
        coinMinimalDenom:
          "ibc/044B7B28AFE93CEC769CF529ADC626DA09EA0EFA3E0E3284D540E9E00E01E24A",
        coinDecimals: 18,
        coinGeckoId: "consciousdao",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/conscious/images/cvn.png",
      },
      {
        coinDenom: "TORO",
        chainSuggestionDenom:
          "factory/osmo1nr8zfakf6jauye3uqa9lrmr5xumee5n42lv92z/toro",
        coinMinimalDenom:
          "factory/osmo1nr8zfakf6jauye3uqa9lrmr5xumee5n42lv92z/toro",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/toro.png",
      },
      {
        coinDenom: "SAYVE",
        chainSuggestionDenom:
          "ibc/06EF575844982382F4D1BC3830D294557A30EDB3CD223153AFC8DFEF06349C56",
        coinMinimalDenom:
          "ibc/06EF575844982382F4D1BC3830D294557A30EDB3CD223153AFC8DFEF06349C56",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/terra2/images/sayve.png",
      },
      {
        coinDenom: "LAB",
        chainSuggestionDenom:
          "factory/osmo17fel472lgzs87ekt9dvk0zqyh5gl80sqp4sk4n/LAB",
        coinMinimalDenom:
          "factory/osmo17fel472lgzs87ekt9dvk0zqyh5gl80sqp4sk4n/LAB",
        coinDecimals: 6,
        coinGeckoId: "mad-scientists",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/LAB.png",
      },
      {
        coinDenom: "bOSMO",
        chainSuggestionDenom:
          "factory/osmo1s3l0lcqc7tu0vpj6wdjz9wqpxv8nk6eraevje4fuwkyjnwuy82qsx3lduv/boneOsmo",
        coinMinimalDenom:
          "factory/osmo1s3l0lcqc7tu0vpj6wdjz9wqpxv8nk6eraevje4fuwkyjnwuy82qsx3lduv/boneOsmo",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/bOSMO.png",
      },
      {
        coinDenom: "PUNDIX",
        chainSuggestionDenom:
          "ibc/46D8D1A6E2A80ECCB7CA6663086A2E749C508B68DA56A077CD26E6F4F9691EEE",
        coinMinimalDenom:
          "ibc/46D8D1A6E2A80ECCB7CA6663086A2E749C508B68DA56A077CD26E6F4F9691EEE",
        coinDecimals: 18,
        coinGeckoId: "pundi-x-2",
      },
      {
        coinDenom: "TNKR",
        chainSuggestionDenom:
          "ibc/3A0A392E610A8D477851ABFEA74F3D828F36C015AB8E93B0FBB7566A6D13C4D6",
        coinMinimalDenom:
          "ibc/3A0A392E610A8D477851ABFEA74F3D828F36C015AB8E93B0FBB7566A6D13C4D6",
        coinDecimals: 12,
        coinGeckoId: "tinkernet",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/tinkernet/images/tnkr.svg",
      },
      {
        coinDenom: "W",
        chainSuggestionDenom:
          "ibc/AC6EE43E608B5A7EEE460C960480BC1C3708010E32B2071C429DA259836E10C3",
        coinMinimalDenom:
          "ibc/AC6EE43E608B5A7EEE460C960480BC1C3708010E32B2071C429DA259836E10C3",
        coinDecimals: 6,
        coinGeckoId: "wormhole",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/solana/images/w.png",
      },
      {
        coinDenom: "DHP",
        chainSuggestionDenom:
          "ibc/FD506CCA1FC574F2A8175FB574C981E9F6351E194AA48AC219BD67FF934E2F33",
        coinMinimalDenom:
          "ibc/FD506CCA1FC574F2A8175FB574C981E9F6351E194AA48AC219BD67FF934E2F33",
        coinDecimals: 6,
        coinGeckoId: "dhealth",
      },
      {
        coinDenom: "FURY",
        chainSuggestionDenom:
          "ibc/E4C60B9F95BF54CC085A5E39F6057ABD4DF92793D330EB884A36530F7E6804DE",
        coinMinimalDenom:
          "ibc/E4C60B9F95BF54CC085A5E39F6057ABD4DF92793D330EB884A36530F7E6804DE",
        coinDecimals: 6,
        coinGeckoId: "fanfury",
      },
      {
        coinDenom: "SAGA",
        chainSuggestionDenom:
          "ibc/094FB70C3006906F67F5D674073D2DAFAFB41537E7033098F5C752F211E7B6C2",
        coinMinimalDenom:
          "ibc/094FB70C3006906F67F5D674073D2DAFAFB41537E7033098F5C752F211E7B6C2",
        coinDecimals: 6,
        coinGeckoId: "saga-2",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/saga/images/saga.png",
      },
      {
        coinDenom: "ATOM1KLFG",
        chainSuggestionDenom:
          "ibc/0E77E090EC04C476DE2BC0A7056580AC47660DAEB7B0D4701C085E3A046AC7B7",
        coinMinimalDenom:
          "ibc/0E77E090EC04C476DE2BC0A7056580AC47660DAEB7B0D4701C085E3A046AC7B7",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/ATOM1KLFGc.png",
      },
      {
        coinDenom: "SHIDO",
        chainSuggestionDenom:
          "ibc/62B50BB1DAEAD2A92D6C6ACAC118F4ED8CBE54265DCF5688E8D0A0A978AA46E7",
        coinMinimalDenom:
          "ibc/62B50BB1DAEAD2A92D6C6ACAC118F4ED8CBE54265DCF5688E8D0A0A978AA46E7",
        coinDecimals: 18,
        coinGeckoId: "shido-2",
      },
      {
        coinDenom: "CIF",
        chainSuggestionDenom:
          "ibc/EFC1776BEFB7842F2DC7BABD9A3050E188145C99007ECC5F3526FED45A68D5F5",
        coinMinimalDenom:
          "ibc/EFC1776BEFB7842F2DC7BABD9A3050E188145C99007ECC5F3526FED45A68D5F5",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/cifer/images/cif.png",
      },
      {
        coinDenom: "HAVA",
        chainSuggestionDenom:
          "ibc/884EBC228DFCE8F1304D917A712AA9611427A6C1ECC3179B2E91D7468FB091A2",
        coinMinimalDenom:
          "ibc/884EBC228DFCE8F1304D917A712AA9611427A6C1ECC3179B2E91D7468FB091A2",
        coinDecimals: 6,
        coinGeckoId: "hava-coin",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/hava.png",
      },
      {
        coinDenom: "IBC",
        chainSuggestionDenom:
          "factory/osmo1kqdw6pvn0xww6tyfv2sqvkkencdz0qw406x54r/IBC",
        coinMinimalDenom:
          "factory/osmo1kqdw6pvn0xww6tyfv2sqvkkencdz0qw406x54r/IBC",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/ibc.png",
      },
      {
        coinDenom: "CROWDP",
        chainSuggestionDenom:
          "ibc/B87F0F5255CC658408F167C2F7B987A8D914622E1F73BCC267406360588F2B1E",
        coinMinimalDenom:
          "ibc/B87F0F5255CC658408F167C2F7B987A8D914622E1F73BCC267406360588F2B1E",
        coinDecimals: 18,
      },
      {
        coinDenom: "ASTRO",
        chainSuggestionDenom:
          "ibc/B8C608CEE08C4F30A15A7955306F2EDAF4A02BB191CABC4185C1A57FD978DA1B",
        coinMinimalDenom:
          "ibc/B8C608CEE08C4F30A15A7955306F2EDAF4A02BB191CABC4185C1A57FD978DA1B",
        coinDecimals: 6,
        coinGeckoId: "astroport-fi",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/astro.png",
      },
      {
        coinDenom: "xASTRO",
        chainSuggestionDenom:
          "ibc/2ED09B03AA396BC2F35B741F4CA4A82D33A24A1007BFC1973299842DD626F564",
        coinMinimalDenom:
          "ibc/2ED09B03AA396BC2F35B741F4CA4A82D33A24A1007BFC1973299842DD626F564",
        coinDecimals: 6,
        coinGeckoId: "astroport-fi",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/xAstro.svg",
      },
      {
        coinDenom: "PAXG.grv",
        chainSuggestionDenom:
          "ibc/A5CCD24BA902843B1003A7EEE5F937C632808B9CF4925601241B15C5A0A51A53",
        coinMinimalDenom:
          "ibc/A5CCD24BA902843B1003A7EEE5F937C632808B9CF4925601241B15C5A0A51A53",
        coinDecimals: 18,
        coinGeckoId: "pax-gold",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/paxg.grv.png",
      },
      {
        coinDenom: "RSTK",
        chainSuggestionDenom:
          "ibc/04FAC73DFF7F1DD59395948F2F043B0BBF978AD4533EE37E811340F501A08FFB",
        coinMinimalDenom:
          "ibc/04FAC73DFF7F1DD59395948F2F043B0BBF978AD4533EE37E811340F501A08FFB",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/rstk.png",
      },
      {
        coinDenom: "BERNESE",
        chainSuggestionDenom:
          "factory/osmo1s6ht8qrm8x0eg8xag5x3ckx9mse9g4se248yss/BERNESE",
        coinMinimalDenom:
          "factory/osmo1s6ht8qrm8x0eg8xag5x3ckx9mse9g4se248yss/BERNESE",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/bernese.png",
      },
      {
        coinDenom: "ETH.pica",
        chainSuggestionDenom:
          "ibc/A23E590BA7E0D808706FB5085A449B3B9D6864AE4DDE7DAF936243CEBB2A3D43",
        coinMinimalDenom:
          "ibc/A23E590BA7E0D808706FB5085A449B3B9D6864AE4DDE7DAF936243CEBB2A3D43",
        coinDecimals: 18,
        coinGeckoId: "ethereum",
      },
      {
        coinDenom: "DAI.pica",
        chainSuggestionDenom:
          "ibc/37DFAFDA529FF7D513B0DB23E9728DF9BF73122D38D46824C78BB7F91E6A736B",
        coinMinimalDenom:
          "ibc/37DFAFDA529FF7D513B0DB23E9728DF9BF73122D38D46824C78BB7F91E6A736B",
        coinDecimals: 18,
        coinGeckoId: "dai",
      },
      {
        coinDenom: "FXS.pica",
        chainSuggestionDenom:
          "ibc/5435437A8C9416B650DDA49C338B63CCFC6465123B715F6BAA9B1B2071E27913",
        coinMinimalDenom:
          "ibc/5435437A8C9416B650DDA49C338B63CCFC6465123B715F6BAA9B1B2071E27913",
        coinDecimals: 18,
        coinGeckoId: "frax-share",
      },
      {
        coinDenom: "FRAX.pica",
        chainSuggestionDenom:
          "ibc/9A8CBC029002DC5170E715F93FBF35011FFC9796371F59B1F3C3094AE1B453A9",
        coinMinimalDenom:
          "ibc/9A8CBC029002DC5170E715F93FBF35011FFC9796371F59B1F3C3094AE1B453A9",
        coinDecimals: 18,
        coinGeckoId: "frax",
      },
      {
        coinDenom: "USDT.pica",
        chainSuggestionDenom:
          "ibc/078AD6F581E8115CDFBD8FFA29D8C71AFE250CE952AFF80040CBC64868D44AD3",
        coinMinimalDenom:
          "ibc/078AD6F581E8115CDFBD8FFA29D8C71AFE250CE952AFF80040CBC64868D44AD3",
        coinDecimals: 6,
        coinGeckoId: "tether",
      },
      {
        coinDenom: "sFRAX.pica",
        chainSuggestionDenom:
          "ibc/0EFA07F312E05258A56AE1DD600E39B9151CF7A91C8A94EEBCF4F03ECFE5DD98",
        coinMinimalDenom:
          "ibc/0EFA07F312E05258A56AE1DD600E39B9151CF7A91C8A94EEBCF4F03ECFE5DD98",
        coinDecimals: 18,
        coinGeckoId: "staked-frax",
      },
      {
        coinDenom: "frxETH.pica",
        chainSuggestionDenom:
          "ibc/688E70EF567E5D4BA1CF4C54BAD758C288BC1A6C8B0B12979F911A2AE95E27EC",
        coinMinimalDenom:
          "ibc/688E70EF567E5D4BA1CF4C54BAD758C288BC1A6C8B0B12979F911A2AE95E27EC",
        coinDecimals: 18,
        coinGeckoId: "frax-ether",
      },
      {
        coinDenom: "sfrxETH.pica",
        chainSuggestionDenom:
          "ibc/F17CCB4F07948CC2D8B72952C2D0A84F2B763962F698774BB121B872AE4611B5",
        coinMinimalDenom:
          "ibc/F17CCB4F07948CC2D8B72952C2D0A84F2B763962F698774BB121B872AE4611B5",
        coinDecimals: 18,
        coinGeckoId: "staked-frax-ether",
      },
      {
        coinDenom: "CLAY",
        chainSuggestionDenom:
          "ibc/7ABF696369EFB3387DF22B6A24204459FE5EFD010220E8E5618DC49DB877047B",
        coinMinimalDenom:
          "ibc/7ABF696369EFB3387DF22B6A24204459FE5EFD010220E8E5618DC49DB877047B",
        coinDecimals: 6,
      },
      {
        coinDenom: "404DR",
        chainSuggestionDenom:
          "ibc/B797E4F42CD33C50511B341E50C5CC0E8EF0D93B1E1247ABAA071583B8619202",
        coinMinimalDenom:
          "ibc/B797E4F42CD33C50511B341E50C5CC0E8EF0D93B1E1247ABAA071583B8619202",
        coinDecimals: 6,
      },
      {
        coinDenom: "wLIBRA",
        chainSuggestionDenom:
          "factory/osmo19hdqma2mj0vnmgcxag6ytswjnr8a3y07q7e70p/wLIBRA",
        coinMinimalDenom:
          "factory/osmo19hdqma2mj0vnmgcxag6ytswjnr8a3y07q7e70p/wLIBRA",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/0l/images/libra.png",
      },
      {
        coinDenom: "NIM",
        chainSuggestionDenom:
          "ibc/279D69A6EF8E37456C8D2DC7A7C1C50F7A566EC4758F6DE17472A9FDE36C4426",
        coinMinimalDenom:
          "ibc/279D69A6EF8E37456C8D2DC7A7C1C50F7A566EC4758F6DE17472A9FDE36C4426",
        coinDecimals: 18,
        coinGeckoId: "nim-network",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/nim/images/nim.png",
      },
      {
        coinDenom: "SEDA",
        chainSuggestionDenom:
          "ibc/956AEF1DA92F70584266E87978C3F30A43B91EE6ABC62F03D097E79F6B99C4D8",
        coinMinimalDenom:
          "ibc/956AEF1DA92F70584266E87978C3F30A43B91EE6ABC62F03D097E79F6B99C4D8",
        coinDecimals: 18,
        coinGeckoId: "seda-2",
      },
      {
        coinDenom: "CAC",
        chainSuggestionDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/cac",
        coinMinimalDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/cac",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/CAC.png",
      },
      {
        coinDenom: "WEIRD",
        chainSuggestionDenom:
          "ibc/38ADC6FFDDDB7D70B72AD0322CEA8844CB18FAA0A23400DBA8A99D43E18B3748",
        coinMinimalDenom:
          "ibc/38ADC6FFDDDB7D70B72AD0322CEA8844CB18FAA0A23400DBA8A99D43E18B3748",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/WEIRD.png",
      },
      {
        coinDenom: "PBB",
        chainSuggestionDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/pbb",
        coinMinimalDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/pbb",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/PBB.png",
      },
      {
        coinDenom: "BWH",
        chainSuggestionDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/bwh",
        coinMinimalDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/bwh",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/BWH.png",
      },
      {
        coinDenom: "AFA",
        chainSuggestionDenom:
          "ibc/0D62E47FDEBBC199D4E1853C0708F0F9337AC62D95B719585C9700E466060995",
        coinMinimalDenom:
          "ibc/0D62E47FDEBBC199D4E1853C0708F0F9337AC62D95B719585C9700E466060995",
        coinDecimals: 0,
      },
      {
        coinDenom: "SHITMOS",
        chainSuggestionDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/shitmos",
        coinMinimalDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/shitmos",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/shitmos.png",
      },
      {
        coinDenom: "qJUNO",
        chainSuggestionDenom:
          "ibc/B4E18E61E1505C2F371B621E49B09E983F6A138F251A7B5286A6BDF739FD0D54",
        coinMinimalDenom:
          "ibc/B4E18E61E1505C2F371B621E49B09E983F6A138F251A7B5286A6BDF739FD0D54",
        coinDecimals: 6,
        coinGeckoId: "juno-network",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qjuno.png",
      },
      {
        coinDenom: "qSAGA",
        chainSuggestionDenom:
          "ibc/F2D400F2728E9DA06EAE2AFAB289931A69EDDA5A661578C66A3177EDFE3C0D13",
        coinMinimalDenom:
          "ibc/F2D400F2728E9DA06EAE2AFAB289931A69EDDA5A661578C66A3177EDFE3C0D13",
        coinDecimals: 6,
        coinGeckoId: "saga-2",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qsaga.png",
      },
      {
        coinDenom: "qDYDX",
        chainSuggestionDenom:
          "ibc/273C593E51ACE56F1F2BDB3E03A5CB81BB208B894BCAA642676A32C3454E8C27",
        coinMinimalDenom:
          "ibc/273C593E51ACE56F1F2BDB3E03A5CB81BB208B894BCAA642676A32C3454E8C27",
        coinDecimals: 18,
        coinGeckoId: "dydx-chain",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qdydx.png",
      },
      {
        coinDenom: "qBLD",
        chainSuggestionDenom:
          "ibc/C1C106D915C8E8C59E5DC69BF30FEF64729A6F788060B184C86A315DBB762EF7",
        coinMinimalDenom:
          "ibc/C1C106D915C8E8C59E5DC69BF30FEF64729A6F788060B184C86A315DBB762EF7",
        coinDecimals: 6,
        coinGeckoId: "agoric",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qbld.png",
      },
      {
        coinDenom: "PEPE.pica",
        chainSuggestionDenom:
          "ibc/5B5BFCC8A9F0D554A4245117F7798E85BE25B6C73DBFA2D6F369BD9DD6CACC6D",
        coinMinimalDenom:
          "ibc/5B5BFCC8A9F0D554A4245117F7798E85BE25B6C73DBFA2D6F369BD9DD6CACC6D",
        coinDecimals: 18,
        coinGeckoId: "pepe",
      },
      {
        coinDenom: "CRV.pica",
        chainSuggestionDenom:
          "ibc/080CE38C1E49595F2199E88BE7281F93FAEEF3FE354EECED0640625E8311C9CF",
        coinMinimalDenom:
          "ibc/080CE38C1E49595F2199E88BE7281F93FAEEF3FE354EECED0640625E8311C9CF",
        coinDecimals: 18,
        coinGeckoId: "curve-dao-token",
      },
      {
        coinDenom: "ezETH.pica",
        chainSuggestionDenom:
          "ibc/39AAE0F5F918B731BEF1E02E9BAED33C242805F668B0A941AC509FB569FE51CB",
        coinMinimalDenom:
          "ibc/39AAE0F5F918B731BEF1E02E9BAED33C242805F668B0A941AC509FB569FE51CB",
        coinDecimals: 18,
        coinGeckoId: "renzo-restaked-eth",
      },
      {
        coinDenom: "USDe.pica",
        chainSuggestionDenom:
          "ibc/BFFE212A23384C4EB055CF6F95A1F5EC1BE0F9BD286FAA66C3748F0444E67D63",
        coinMinimalDenom:
          "ibc/BFFE212A23384C4EB055CF6F95A1F5EC1BE0F9BD286FAA66C3748F0444E67D63",
        coinDecimals: 18,
        coinGeckoId: "ethena-usde",
      },
      {
        coinDenom: "ENA.pica",
        chainSuggestionDenom:
          "ibc/257FF64F160106F6EE43CEE7C761DA64C1346221895373CC810FFA1BFAC5A7CD",
        coinMinimalDenom:
          "ibc/257FF64F160106F6EE43CEE7C761DA64C1346221895373CC810FFA1BFAC5A7CD",
        coinDecimals: 18,
        coinGeckoId: "ethena",
      },
      {
        coinDenom: "eETH.pica",
        chainSuggestionDenom:
          "ibc/8D0FFEA4EDB04E3C1738C9599B66AE49683E0540FC4C1214AC84534C200D818B",
        coinMinimalDenom:
          "ibc/8D0FFEA4EDB04E3C1738C9599B66AE49683E0540FC4C1214AC84534C200D818B",
        coinDecimals: 18,
        coinGeckoId: "ether-fi-staked-eth",
      },
      {
        coinDenom: "pxETH.pica",
        chainSuggestionDenom:
          "ibc/D09BB89B2187EF13EF006B44510749B0F02FD0B34F8BB55C70D812A1FF6148C7",
        coinMinimalDenom:
          "ibc/D09BB89B2187EF13EF006B44510749B0F02FD0B34F8BB55C70D812A1FF6148C7",
        coinDecimals: 18,
        coinGeckoId: "dinero-staked-eth",
      },
      {
        coinDenom: "crvUSD.pica",
        chainSuggestionDenom:
          "ibc/63551E7BB24008F0AFC1CB051A423A5104F781F035F8B1A191264B7086A0A0F6",
        coinMinimalDenom:
          "ibc/63551E7BB24008F0AFC1CB051A423A5104F781F035F8B1A191264B7086A0A0F6",
        coinDecimals: 18,
        coinGeckoId: "crvusd",
      },
      {
        coinDenom: "WIHA",
        chainSuggestionDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/wiha",
        coinMinimalDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/wiha",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/WIHA.png",
      },
      {
        coinDenom: "CRAZYHORSE",
        chainSuggestionDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/crazyhorse",
        coinMinimalDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/crazyhorse",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/CrazyHorse.png",
      },
      {
        coinDenom: "COCA",
        chainSuggestionDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/coca",
        coinMinimalDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/coca",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/COCA.png",
      },
      {
        coinDenom: "solana.USDT.pica",
        chainSuggestionDenom:
          "ibc/0233A3F2541FD43DBCA569B27AF886E97F5C03FC0305E4A8A3FAC6AC26249C7A",
        coinMinimalDenom:
          "ibc/0233A3F2541FD43DBCA569B27AF886E97F5C03FC0305E4A8A3FAC6AC26249C7A",
        coinDecimals: 6,
        coinGeckoId: "tether",
      },
      {
        coinDenom: "edgeSOL.pica",
        chainSuggestionDenom:
          "ibc/B83F9E20B4A07FA8846880000BD9D8985D89567A090F5E9390C64E81C39B4607",
        coinMinimalDenom:
          "ibc/B83F9E20B4A07FA8846880000BD9D8985D89567A090F5E9390C64E81C39B4607",
        coinDecimals: 9,
        coinGeckoId: "edgevana-staked-sol",
      },
      {
        coinDenom: "LST.pica",
        chainSuggestionDenom:
          "ibc/F618D130A2B8203D169811658BD0361F18DC2453085965FA0E5AEB8018DD54EE",
        coinMinimalDenom:
          "ibc/F618D130A2B8203D169811658BD0361F18DC2453085965FA0E5AEB8018DD54EE",
        coinDecimals: 9,
        coinGeckoId: "liquid-staking-token",
      },
      {
        coinDenom: "jitoSOL.pica",
        chainSuggestionDenom:
          "ibc/9A83BDF4C8C5FFDDE735533BC8CD4363714A6474AED1C2C492FB003BB77C7982",
        coinMinimalDenom:
          "ibc/9A83BDF4C8C5FFDDE735533BC8CD4363714A6474AED1C2C492FB003BB77C7982",
        coinDecimals: 9,
        coinGeckoId: "jito-staked-sol",
      },
      {
        coinDenom: "wSOL.pica",
        chainSuggestionDenom:
          "ibc/0F9E9277B61A78CB31014D541ACA5BF6AB06DFC4524C4C836490B131DAAECD78",
        coinMinimalDenom:
          "ibc/0F9E9277B61A78CB31014D541ACA5BF6AB06DFC4524C4C836490B131DAAECD78",
        coinDecimals: 9,
        coinGeckoId: "wrapped-solana",
      },
      {
        coinDenom: "allUSDT",
        chainSuggestionDenom:
          "factory/osmo1em6xs47hd82806f5cxgyufguxrrc7l0aqx7nzzptjuqgswczk8csavdxek/alloyed/allUSDT",
        coinMinimalDenom:
          "factory/osmo1em6xs47hd82806f5cxgyufguxrrc7l0aqx7nzzptjuqgswczk8csavdxek/alloyed/allUSDT",
        coinDecimals: 6,
      },
      {
        coinDenom: "WHINE",
        chainSuggestionDenom:
          "ibc/A8C568580D613F16F7E9075EA9FAD69FEBE0CC1F4AF46C60255FEC4459C166F1",
        coinMinimalDenom:
          "ibc/A8C568580D613F16F7E9075EA9FAD69FEBE0CC1F4AF46C60255FEC4459C166F1",
        coinDecimals: 6,
      },
      {
        coinDenom: "BAG",
        chainSuggestionDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/bag",
        coinMinimalDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/bag",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/BAG.png",
      },
      {
        coinDenom: "allBTC",
        chainSuggestionDenom:
          "factory/osmo1z6r6qdknhgsc0zeracktgpcxf43j6sekq07nw8sxduc9lg0qjjlqfu25e3/alloyed/allBTC",
        coinMinimalDenom:
          "factory/osmo1z6r6qdknhgsc0zeracktgpcxf43j6sekq07nw8sxduc9lg0qjjlqfu25e3/alloyed/allBTC",
        coinDecimals: 8,
      },
      {
        coinDenom: "FURY",
        chainSuggestionDenom:
          "ibc/42D0FBF9DDC72D7359D309A93A6DF9F6FDEE3987EA1C5B3CDE95C06FCE183F12",
        coinMinimalDenom:
          "ibc/42D0FBF9DDC72D7359D309A93A6DF9F6FDEE3987EA1C5B3CDE95C06FCE183F12",
        coinDecimals: 6,
        coinGeckoId: "fanfury",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/furya/images/fury.png",
      },
      {
        coinDenom: "PUNDIX",
        chainSuggestionDenom:
          "ibc/2EB516F83C9FF44AB6826F269CA98A5622608C6C955E12112E58F23A324FEE07",
        coinMinimalDenom:
          "ibc/2EB516F83C9FF44AB6826F269CA98A5622608C6C955E12112E58F23A324FEE07",
        coinDecimals: 18,
        coinGeckoId: "pundi-x-2",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/pundix.png",
      },
      {
        coinDenom: "DHP",
        chainSuggestionDenom:
          "ibc/320F8D6EC17E14436D19C6D844BB9A5AE9B9A209F6D18364A2191FF08E8732A9",
        coinMinimalDenom:
          "ibc/320F8D6EC17E14436D19C6D844BB9A5AE9B9A209F6D18364A2191FF08E8732A9",
        coinDecimals: 6,
        coinGeckoId: "dhealth",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/dhealth/images/dhp.png",
      },
      {
        coinDenom: "SHIDO",
        chainSuggestionDenom:
          "ibc/BBE825F7D1673E1EBF05AB02000E23E6077967B79547A3733B60AE4ED62C4D32",
        coinMinimalDenom:
          "ibc/BBE825F7D1673E1EBF05AB02000E23E6077967B79547A3733B60AE4ED62C4D32",
        coinDecimals: 18,
        coinGeckoId: "shido-2",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/shido/images/shido.png",
      },
      {
        coinDenom: "NSTK",
        chainSuggestionDenom:
          "ibc/690EB0A0CA0DA2DC1E9CF62FB23C935AE5C7E9F57919CF89690521D5D70948A7",
        coinMinimalDenom:
          "ibc/690EB0A0CA0DA2DC1E9CF62FB23C935AE5C7E9F57919CF89690521D5D70948A7",
        coinDecimals: 6,
        coinGeckoId: "unstake-fi",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/kujira/images/nstk.svg",
      },
      {
        coinDenom: "avalanche.USDC.wh",
        chainSuggestionDenom:
          "ibc/0B3C3D06228578334B66B57FBFBA4033216CEB8119B27ACDEE18D92DA5B28D43",
        coinMinimalDenom:
          "ibc/0B3C3D06228578334B66B57FBFBA4033216CEB8119B27ACDEE18D92DA5B28D43",
        coinDecimals: 6,
        coinGeckoId: "usd-coin",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/usdc.hole.png",
      },
      {
        coinDenom: "nomic.NOM",
        chainSuggestionDenom:
          "ibc/F49DFB3BC8105C57EE7F17EC2402438825B31212CFDD81681EB87911E934F32C",
        coinMinimalDenom:
          "ibc/F49DFB3BC8105C57EE7F17EC2402438825B31212CFDD81681EB87911E934F32C",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/nomic/images/nom.png",
      },
      {
        coinDenom: "YMOS",
        chainSuggestionDenom:
          "factory/osmo1vdvnznwg597qngrq9mnfcfk0am9jdc9y446jewhcqdreqz4r75xq5j5zvy/ymos",
        coinMinimalDenom:
          "factory/osmo1vdvnznwg597qngrq9mnfcfk0am9jdc9y446jewhcqdreqz4r75xq5j5zvy/ymos",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/ymos.png",
      },
      {
        coinDenom: "BRNZ",
        chainSuggestionDenom:
          "factory/osmo13gu58hzw3e9aqpj25h67m7snwcjuccd7v4p55w/brnz",
        coinMinimalDenom:
          "factory/osmo13gu58hzw3e9aqpj25h67m7snwcjuccd7v4p55w/brnz",
        coinDecimals: 0,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/BRNZ.svg",
      },
      {
        coinDenom: "ashLAB",
        chainSuggestionDenom:
          "factory/osmo1svj5kd8kzj7xxtrd6ftjk0856ffpyj4egz7f9pd9dge5wr4kwansmefq07/lab.ash",
        coinMinimalDenom:
          "factory/osmo1svj5kd8kzj7xxtrd6ftjk0856ffpyj4egz7f9pd9dge5wr4kwansmefq07/lab.ash",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/ashLAB.png",
      },
      {
        coinDenom: "GRAC",
        chainSuggestionDenom:
          "ibc/58E4261D2E21FE3A459C290A9F97F3DCD257B28F48AAE828298B38E048804829",
        coinMinimalDenom:
          "ibc/58E4261D2E21FE3A459C290A9F97F3DCD257B28F48AAE828298B38E048804829",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/migaloo/images/grac.png",
      },
      {
        coinDenom: "N43",
        chainSuggestionDenom:
          "ibc/E4FFAACCDB7D55CE2D257DF637C00158CB841F11D0013B2D03E31FF7800A2C58",
        coinMinimalDenom:
          "ibc/E4FFAACCDB7D55CE2D257DF637C00158CB841F11D0013B2D03E31FF7800A2C58",
        coinDecimals: 6,
      },
      {
        coinDenom: "MAND",
        chainSuggestionDenom:
          "ibc/739D70CB432FE1C6D94AF306B68C14F4CFB0B9EDD1238D3A8718B1B0E84E8547",
        coinMinimalDenom:
          "ibc/739D70CB432FE1C6D94AF306B68C14F4CFB0B9EDD1238D3A8718B1B0E84E8547",
        coinDecimals: 18,
        coinGeckoId: "mande-network",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/mande/images/mande.png",
      },
      {
        coinDenom: "TURD",
        chainSuggestionDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/turd",
        coinMinimalDenom:
          "factory/osmo1q77cw0mmlluxu0wr29fcdd0tdnh78gzhkvhe4n6ulal9qvrtu43qtd0nh8/turd",
        coinDecimals: 6,
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/TURD.png",
      },
      {
        coinDenom: "allETH",
        chainSuggestionDenom:
          "factory/osmo1k6c8jln7ejuqwtqmay3yvzrg3kueaczl96pk067ldg8u835w0yhsw27twm/alloyed/allETH",
        coinMinimalDenom:
          "factory/osmo1k6c8jln7ejuqwtqmay3yvzrg3kueaczl96pk067ldg8u835w0yhsw27twm/alloyed/allETH",
        coinDecimals: 18,
      },
      {
        coinDenom: "allSOL",
        chainSuggestionDenom:
          "factory/osmo1n3n75av8awcnw4jl62n3l48e6e4sxqmaf97w5ua6ddu4s475q5qq9udvx4/alloyed/allSOL",
        coinMinimalDenom:
          "factory/osmo1n3n75av8awcnw4jl62n3l48e6e4sxqmaf97w5ua6ddu4s475q5qq9udvx4/alloyed/allSOL",
        coinDecimals: 9,
      },
    ],
    description:
      "Osmosis (OSMO) is the premier DEX and cross-chain DeFi hub within the Cosmos ecosystem, a network of over 50 sovereign, interoperable blockchains seamlessly connected through the Inter-Blockchain Communication Protocol (IBC). Pioneering in its approach, Osmosis offers a dynamic trading and liquidity provision experience, integrating non-IBC assets from other ecosystems, including Ethereum, Solana, Avalanche, and Polkadot. Initially adopting Balancer-style pools, Osmosis now also features a concentrated liquidity model that is orders of magnitude more capital efficient, meaning that significantly less liquidity is required to handle the same amount of trading volume with minimal slippage.\n\nAs a true appchain, Osmosis has greater control over the full blockchain stack than traditional smart contract DEXs, which must follow the code of the parent chain that it is built on. This fine-grained control has enabled, for example, the development of Superfluid Staking, an extension of Proof of Stake that allows assets at the application layer to be staked to secure the chain. The customizability of appchains also allows implementing features like the Protocol Revenue module, which enables Osmosis to conduct on-chain arbitrage on behalf of OSMO stakers, balancing prices across pools while generating real yield revenue from this volume. Additionally, as a sovereign appchain, Osmosis governance can vote on upgrades to the protocol. One example of this was the introduction of a Taker Fee, which switched on the collection of exchange fees to generate diverse yield from Osmosis volume and distribute it to OSMO stakers.\n\nOsmosis is bringing the full centralized exchange experience to the decentralized world by building a cross-chain native DEX and trading suite that connects all chains over IBC, including Ethereum and Bitcoin. To reach this goal, Osmosis hosts an ever-expanding suite of DeFi applications aimed at providing a one-stop experience that includes lending, credit, margin, DeFi strategy vaults, power perps, fiat on-ramps, NFTs, stablecoins, and more — all of the functionalities that centralized exchange offer and more, in the trust-minimized environment of decentralized finance.",
    apis: {
      rpc: [{ address: "https://rpc-osmosis.keplr.app" }],
      rest: [{ address: "https://lcd-osmosis.keplr.app" }],
    },
    explorers: [{ txPage: "https://www.mintscan.io/osmosis/txs/${txHash}" }],
    features: [
      "ibc-go",
      "ibc-transfer",
      "cosmwasm",
      "wasmd_0.24+",
      "osmosis-txfees",
    ],
  },
  {
    chain_name: "cosmoshub",
    status: "live",
    networkType: "mainnet",
    prettyName: "Cosmos Hub",
    chain_id: "cosmoshub-4",
    bech32Prefix: "cosmos",
    bech32Config: {
      bech32PrefixAccAddr: "cosmos",
      bech32PrefixAccPub: "cosmospub",
      bech32PrefixValAddr: "cosmosvaloper",
      bech32PrefixValPub: "cosmosvaloperpub",
      bech32PrefixConsAddr: "cosmosvalcons",
      bech32PrefixConsPub: "cosmosvalconspub",
    },
    slip44: 118,
    stakeCurrency: {
      coinDenom: "ATOM",
      chainSuggestionDenom: "uatom",
      coinMinimalDenom:
        "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
      sourceDenom: "uatom",
      coinDecimals: 6,
      coinGeckoId: "cosmos",
      coinImageUrl:
        "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png",
    },
    feeCurrencies: [
      {
        coinDenom: "ATOM",
        chainSuggestionDenom: "uatom",
        coinMinimalDenom:
          "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        sourceDenom: "uatom",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png",
        gasPriceStep: { low: 0.01, average: 0.025, high: 0.03 },
      },
    ],
    currencies: [
      {
        coinDenom: "ATOM",
        chainSuggestionDenom: "uatom",
        coinMinimalDenom:
          "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        sourceDenom: "uatom",
        coinDecimals: 6,
        coinGeckoId: "cosmos",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png",
      },
      {
        coinDenom: "USDt",
        chainSuggestionDenom:
          "ibc/F04D72CF9B5D9C849BB278B691CDFA2241813327430EC9CDC83F8F4CA4CDC2B0",
        sourceDenom:
          "ibc/F04D72CF9B5D9C849BB278B691CDFA2241813327430EC9CDC83F8F4CA4CDC2B0",
        coinDecimals: 6,
        coinGeckoId: "tether",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdt.png",
      },
      {
        coinDenom: "FX",
        chainSuggestionDenom:
          "ibc/4925E6ABA571A44D2BE0286D2D29AF42A294D0FF2BB16490149A1B26EAD33729",
        sourceDenom:
          "ibc/4925E6ABA571A44D2BE0286D2D29AF42A294D0FF2BB16490149A1B26EAD33729",
        coinDecimals: 0,
        coinGeckoId: "fx-coin",
        coinImageUrl:
          "https://raw.githubusercontent.com/cosmos/chain-registry/master/fxcore/images/fx.png",
      },
    ],
    description:
      "In a nutshell, Cosmos Hub bills itself as a project that solves some of the hardest problems facing the blockchain industry. It aims to offer an antidote to slow, expensive, unscalable and environmentally harmful proof-of-work protocols, like those used by Bitcoin, by offering an ecosystem of connected blockchains.\n\nThe project’s other goals include making blockchain technology less complex and difficult for developers thanks to a modular framework that demystifies decentralized apps. Last but not least, an Inter-blockchain Communication protocol makes it easier for blockchain networks to communicate with each other — preventing fragmentation in the industry.\n\nCosmos Hub's origins can be dated back to 2014, when Tendermint, a core contributor to the network, was founded. In 2016, a white paper for Cosmos was published — and a token sale was held the following year. ATOM tokens are earned through a hybrid proof-of-stake algorithm, and they help to keep the Cosmos Hub, the project’s flagship blockchain, secure. This cryptocurrency also has a role in the network’s governance.",
    apis: {
      rpc: [{ address: "https://rpc-cosmoshub.keplr.app" }],
      rest: [{ address: "https://lcd-cosmoshub.keplr.app" }],
    },
    explorers: [{ txPage: "https://www.mintscan.io/cosmos/txs/${txHash}" }],
    features: ["ibc-go", "ibc-transfer"],
  },
];
