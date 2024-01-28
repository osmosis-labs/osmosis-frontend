import { CoinPretty } from "@keplr-wallet/unit";

/** Combines coins of the same denom into the same CoinPretty object by sum. */
export function aggregateCoinsByDenom<TCoin extends CoinPretty>(
  coins: TCoin[]
): TCoin[] {
  const aggregate = coins.reduce((coinMap, coin) => {
    const existingCoin = coinMap.get(coin.currency.coinMinimalDenom);
    if (existingCoin) {
      coinMap.set(
        coin.currency.coinMinimalDenom,
        existingCoin.add(coin) as TCoin
      );
    } else {
      coinMap.set(coin.currency.coinMinimalDenom, coin);
    }
    return coinMap;
  }, new Map<string, TCoin>());
  return Array.from(aggregate.values());
}
