import { Int } from "@keplr-wallet/unit";
import { TxEvent } from "@osmosis-labs/server";

/** Reliably use the bank module's `coin_spent` event attribute to extract the combined
 *  sum of coins spent in a transaction for a given spender.  */
export function getSumTotalSpenderCoinsSpent(
  spenderBech32Address: string,
  txEvents: TxEvent[]
): { denom: string; amount: string }[] {
  // denom => sum amount
  const coinsSpentMap = new Map<string, Int>();

  txEvents.forEach(({ type, attributes }) => {
    // validate that it's a spend event affecting the spender
    if (type !== "coin_spent") return;
    if (attributes.length === 0) return;
    const spendAttribute = attributes.find((attr) => attr.key === "spender");
    if (spendAttribute && spendAttribute.value !== spenderBech32Address) return;

    // a comma separated list of coins spent
    const coinsSpentRawAttribute = attributes.find(
      ({ key }) => key === "amount"
    );
    if (!coinsSpentRawAttribute) return;
    const coinsSpentRaw = coinsSpentRawAttribute.value.split(",");

    coinsSpentRaw.forEach((coinSpentRaw) => {
      const coin = matchRawCoinValue(coinSpentRaw);

      if (coin) {
        const existingCoin = coinsSpentMap.get(coin.denom);
        if (existingCoin) {
          coinsSpentMap.set(coin.denom, existingCoin.add(new Int(coin.amount)));
        } else {
          coinsSpentMap.set(coin.denom, new Int(coin.amount));
        }
      }
    });
  });

  return Array.from(coinsSpentMap, ([denom, amount]) => ({
    denom,
    amount: amount.toString(),
  }));
}

export function matchRawCoinValue(
  value: string
): { denom: string; amount: string } | undefined {
  const regex = /(\d+)([a-zA-Z0-9/]+)/;
  const match = value.match(regex);

  if (match) {
    return { denom: match[2], amount: match[1] };
  }
}
