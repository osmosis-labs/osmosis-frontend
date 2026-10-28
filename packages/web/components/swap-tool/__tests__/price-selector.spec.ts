import { CoinPretty } from "@osmosis-labs/unit";

import {
  SELL_QUOTES,
  UI_DEFAULT_QUOTES,
  USDC_BASE_DENOM,
  USDT_BASE_DENOM,
} from "~/components/place-limit-tool/defaults";
import { getUserQuotes } from "~/components/swap-tool/price-selector";

const usdtBalance = {
  denom: USDT_BASE_DENOM,
  coin: new CoinPretty(
    {
      coinDenom: "USDT",
      coinMinimalDenom: USDT_BASE_DENOM,
      coinDecimals: 6,
    },
    "25000000"
  ),
};

describe("getUserQuotes", () => {
  it("keeps an unheld default quote listed on the buy tab", () => {
    const quotes = getUserQuotes([usdtBalance], "buy");

    expect(quotes.slice(0, 2).map((q) => q.coinMinimalDenom)).toEqual(
      UI_DEFAULT_QUOTES
    );
    expect(
      quotes.find((q) => q.coinMinimalDenom === USDC_BASE_DENOM)?.amount
    ).toBeUndefined();
    expect(
      quotes
        .find((q) => q.coinMinimalDenom === USDT_BASE_DENOM)
        ?.amount?.toDec()
        .toString()
    ).toBe("25.000000000000000000");
  });

  it("lists every sell quote on the sell tab for an empty wallet", () => {
    expect(
      getUserQuotes([], "sell")
        .map((q) => q.coinMinimalDenom)
        .sort()
    ).toEqual([...SELL_QUOTES].sort());
  });
});
