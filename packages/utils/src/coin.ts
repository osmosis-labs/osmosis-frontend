import { CoinPretty } from "@keplr-wallet/unit";

import { sum } from "./math";

/** Combines coins of the same denom into the same CoinPretty object by sum. */
export function aggregateCoinsByDenom<Coin extends CoinPretty>(
  coins: Coin[]
): Coin[] {
  const aggregate = coins.reduce((coinMap, coin) => {
    const existingCoin = coinMap.get(coin.currency.coinMinimalDenom);
    if (existingCoin) {
      coinMap.set(
        coin.currency.coinMinimalDenom,
        existingCoin.add(coin) as Coin
      );
    } else {
      coinMap.set(coin.currency.coinMinimalDenom, coin);
    }
    return coinMap;
  }, new Map<string, Coin>());
  return Array.from(aggregate.values());
}

export function aggregateRawCoinsByDenom(
  coins: { denom: string; amount: string }[]
): { denom: string; amount: string }[] {
  const aggregate = coins.reduce((coinMap, coin) => {
    const existingCoin = coinMap.get(coin.denom);
    if (existingCoin) {
      coinMap.set(coin.denom, {
        denom: coin.denom,
        amount: sum([existingCoin.amount, coin.amount]).toString(),
      });
    } else {
      coinMap.set(coin.denom, coin);
    }
    return coinMap;
  }, new Map<string, { denom: string; amount: string }>());
  return Array.from(aggregate.values());
}
