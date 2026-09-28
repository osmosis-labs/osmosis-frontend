/**
 * @file orderbook.ts
 * @description Live orderbook reads for limit order tests.
 *
 * The trade tool's limit price presets are relative to the asset's market
 * price, not to the orderbook. A thin orderbook can hold resting bids above
 * market, so a "market + 10%" ask can cross them and fill at placement. Tests
 * that need an order to stay open read the book's best bid from here.
 */

import { REST_ENDPOINT, SQS_BASE_URL } from "./config";

interface CanonicalOrderbook {
  base: string;
  quote: string;
  pool_id: number;
  contract_address: string;
}

/**
 * Best resting bid on the canonical base/quote orderbook, in display units
 * (quote per base). Returns `undefined` if the book or the price can't be
 * read, so callers can keep their default behaviour instead of failing on a
 * query outage.
 */
export async function getOrderbookBestBid({
  baseDenom,
  quoteDenom,
  baseExponent,
  quoteExponent,
}: {
  baseDenom: string;
  quoteDenom: string;
  baseExponent: number;
  quoteExponent: number;
}): Promise<number | undefined> {
  try {
    const orderbooksResponse = await fetch(
      `${SQS_BASE_URL}/pools/canonical-orderbooks`,
      { signal: AbortSignal.timeout(15_000) }
    );
    if (!orderbooksResponse.ok) {
      throw new Error(`canonical-orderbooks: ${orderbooksResponse.status}`);
    }
    const orderbooks =
      (await orderbooksResponse.json()) as CanonicalOrderbook[];
    const orderbook = orderbooks.find(
      (o) => o.base === baseDenom && o.quote === quoteDenom
    );
    if (!orderbook) {
      throw new Error(`no canonical orderbook for ${baseDenom}/${quoteDenom}`);
    }

    // With the quote as `quote_asset_denom`, the contract's spot price is the
    // price a seller of the base gets now, i.e. the best bid.
    const query = Buffer.from(
      JSON.stringify({
        spot_price: {
          quote_asset_denom: quoteDenom,
          base_asset_denom: baseDenom,
        },
      })
    ).toString("base64");
    const spotResponse = await fetch(
      `${REST_ENDPOINT}/cosmwasm/wasm/v1/contract/${orderbook.contract_address}/smart/${query}`,
      { signal: AbortSignal.timeout(15_000) }
    );
    if (!spotResponse.ok) {
      throw new Error(`spot_price: ${spotResponse.status}`);
    }
    const { data } = (await spotResponse.json()) as {
      data?: { spot_price?: string };
    };
    const rawPrice = Number(data?.spot_price);
    if (!Number.isFinite(rawPrice) || rawPrice <= 0) {
      throw new Error(`unexpected spot_price: ${data?.spot_price}`);
    }

    const bestBid = rawPrice * 10 ** (baseExponent - quoteExponent);
    console.log(
      `Orderbook ${orderbook.pool_id} best bid: ${bestBid} (${orderbook.contract_address})`
    );
    return bestBid;
  } catch (error) {
    console.warn(`Could not read the orderbook best bid: ${error}`);
    return undefined;
  }
}
