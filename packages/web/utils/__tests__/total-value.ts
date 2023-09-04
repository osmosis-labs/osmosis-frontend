// eslint-disable-next-line import/no-extraneous-dependencies
import cases from "jest-in-case";

import { coinsToFiatPricePretty } from "../total-value";
import { PriceStoreMock, MockFiatCurrencies } from "@osmosis-labs/stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { AppCurrency } from "@keplr-wallet/types";

const CoinPrices = {
  BTC: 20000,
  ETH: 1000,
  ATOM: 5,
  ION: 100,
  USDX: 1,
  BNB: 30,
  OSMO: .5,
};

const AppCurrencies: AppCurrency[] = [
  {
    coinDenom: "OSMO",
    coinMinimalDenom: "uosmo",
    coinDecimals: 6,
    coinGeckoId: "pool:uosmo",
  },
  {
    coinDenom: "mATOM",
    coinMinimalDenom: "matom",
    coinDecimals: 3,
    coinGeckoId: "pool:uatom",
  },
  {
    coinDenom: "ION",
    coinMinimalDenom: "uion",
    coinDecimals: 6,
    coinGeckoId: "pool:uion",
  },
];

const priceStore = new PriceStoreMock(CoinPrices);

cases(
  "coinsToFiatPricePretty",
  (opts) => {
    expect(
      coinsToFiatPricePretty(
        priceStore,
        MockFiatCurrencies[opts.fiat as string],
        opts.coins as CoinPretty[]
      )
    ).toEqual(opts.result);
  },
  [
    {
      name: "should return correct magnitude for large positive number",
      fiat: "USD",
      coins: [
        new CoinPretty(
          AppCurrencies.find((cur) => cur.coinDenom === "OSMO")!,
          10
        ),
      ],
      result: 5,
    },
  ]
);
