import { TxEvent } from "@osmosis-labs/server";
import { Int } from "@osmosis-labs/unit";

/** Reliably use the bank module's `coin_spent` event attribute to extract the combined
 *  sum of coins spent in a transaction for a given spender.  */
export function getSumTotalSpenderCoinsSpent(
  spenderBech32Address: string,
  txEvents: TxEvent[]
): { denom: string; amount: string }[] {
  // denom => sum amount
  const coinsSpentMap = new Map<string, Int>();

  const tokenSwapEvent = txEvents.find(({ type }) => type === "token_swapped");

  /**
   * If the transaction is a token swap, we need to extract the coins spent from the
   * "tokens_in" attribute.
   */
  if (tokenSwapEvent) {
    const tokenSwapEventAttribute = tokenSwapEvent.attributes.find(
      ({ key }) => key === "tokens_in"
    );
    if (tokenSwapEventAttribute) {
      const coinsSpentRaw = tokenSwapEventAttribute.value.split(",");

      coinsSpentRaw.forEach((coinSpentRaw) => {
        const coin = matchRawCoinValue(coinSpentRaw);

        if (coin) {
          const existingCoin = coinsSpentMap.get(coin.denom);
          if (existingCoin) {
            coinsSpentMap.set(
              coin.denom,
              existingCoin.add(new Int(coin.amount))
            );
          } else {
            coinsSpentMap.set(coin.denom, new Int(coin.amount));
          }
        }
      });

      return Array.from(coinsSpentMap, ([denom, amount]) => ({
        denom,
        amount: amount.toString(),
      }));
    }
  }

  txEvents.forEach(({ type, attributes }) => {
    // validate that it's a spend event affecting the spender
    if (type !== "coin_spent") return;
    if (attributes.length === 0) return;
    const spendAttribute = attributes.find((attr) => attr.key === "spender");
    if (!spendAttribute || spendAttribute.value !== spenderBech32Address)
      return;

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

/**
 * An event attribute's value by name, whether the node returned attributes
 * plain (SDK 0.47+) or base64-encoded (older gateways). Detection keys off the
 * attribute KEY: names like "amount0" and "tokens_out" are never themselves
 * meaningful base64, while VALUES like "1234ibc/HASH" are entirely base64
 * alphabet and would decode to garbage, so never guess from the value.
 */
export function getEventAttributeValue(
  attributes: { key: string; value: string }[],
  name: string
): string | undefined {
  const plain = attributes.find((attr) => attr.key === name);
  if (plain) return plain.value;
  const encoded = attributes.find((attr) => {
    try {
      return Buffer.from(attr.key, "base64").toString() === name;
    } catch {
      return false;
    }
  });
  if (!encoded) return undefined;
  try {
    return Buffer.from(encoded.value, "base64").toString();
  } catch {
    return undefined;
  }
}

/**
 * The `amount0`/`amount1` of the LAST event of the given type in a simulated
 * or executed transaction, e.g. `create_position` or `withdraw_position`.
 *
 * These amounts are indexed by the POOL's token0/token1 (fixed at pool
 * creation), which is exactly the order `tokenMinAmount0/1` expect, so the
 * caller needs no denom mapping. Do NOT derive deposits from
 * `getSumTotalSpenderCoinsSpent` for a transaction that also swaps: that
 * helper short-circuits to the swap's `tokens_in` and drops every other
 * spend.
 */
export function getLastPositionEventAmounts(
  txEvents: TxEvent[],
  eventType: "create_position" | "withdraw_position"
): { amount0: Int; amount1: Int } | undefined {
  const event = txEvents.filter(({ type }) => type === eventType).pop();
  if (!event) return undefined;
  const read = (name: string) => {
    const value = getEventAttributeValue(event.attributes ?? [], name);
    if (value === undefined) return undefined;
    return new Int(value.replace(/^-/, ""));
  };
  const amount0 = read("amount0");
  const amount1 = read("amount1");
  if (amount0 === undefined || amount1 === undefined) return undefined;
  return { amount0, amount1 };
}
