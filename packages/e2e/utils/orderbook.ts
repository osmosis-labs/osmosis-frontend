/**
 * @file orderbook.ts
 * @description Live orderbook reads for limit order tests.
 *
 * The trade tool's limit price presets are relative to the asset's market
 * price, not to the orderbook. A thin orderbook can hold resting bids above
 * market, so a "market + 10%" ask can cross them and fill at placement. Tests
 * that need an order to stay open read the book's best bid from here.
 */

import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";

import { SQS_BASE_URL } from "./config";
import { OSMOSIS_RPC } from "./order-utils";

interface CanonicalOrderbook {
  base: string;
  quote: string;
  pool_id: number;
  contract_address: string;
}

async function fetchCanonicalOrderbooks(): Promise<CanonicalOrderbook[]> {
  const response = await fetch(`${SQS_BASE_URL}/pools/canonical-orderbooks`, {
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    throw new Error(`canonical-orderbooks: ${response.status}`);
  }
  return (await response.json()) as CanonicalOrderbook[];
}

/**
 * First of `candidateDenoms` whose only canonical orderbook is base/`quoteDenom`
 * (and which isn't the quote of any book), or `undefined` if none qualifies.
 * Anyone can create an orderbook, so a pair that has a single book today can
 * gain another later; tests read it live rather than hardcoding the asset.
 * Throws if SQS can't be read.
 */
export async function findAssetWithOnlyOrderbookQuote(
  candidateDenoms: string[],
  quoteDenom: string
): Promise<string | undefined> {
  const orderbooks = await fetchCanonicalOrderbooks();
  return candidateDenoms.find((denom) => {
    const books = orderbooks.filter(
      (o) => o.base === denom || o.quote === denom
    );
    return (
      books.length > 0 &&
      books.every((o) => o.base === denom && o.quote === quoteDenom)
    );
  });
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
    const orderbooks = await fetchCanonicalOrderbooks();
    const orderbook = orderbooks.find(
      (o) => o.base === baseDenom && o.quote === quoteDenom
    );
    if (!orderbook) {
      throw new Error(`no canonical orderbook for ${baseDenom}/${quoteDenom}`);
    }

    // With the quote as `quote_asset_denom`, the contract's spot price is the
    // price a seller of the base gets now, i.e. the best bid. Queried over RPC
    // because lcd.osmosis.zone rejects CosmWasm smart queries with a 403.
    // CosmJS 0.32 has no request timeout, so race it to keep a stalled RPC
    // from blocking the test past the fallback.
    const rpcTimeout = AbortSignal.timeout(15_000);
    const { spot_price } = (await Promise.race([
      CosmWasmClient.connect(OSMOSIS_RPC).then((client) =>
        client.queryContractSmart(orderbook.contract_address, {
          spot_price: {
            quote_asset_denom: quoteDenom,
            base_asset_denom: baseDenom,
          },
        })
      ),
      new Promise<never>((_, reject) =>
        rpcTimeout.addEventListener("abort", () =>
          reject(new Error("spot_price: RPC timed out after 15s"))
        )
      ),
    ])) as { spot_price?: string };
    const rawPrice = Number(spot_price);
    if (!Number.isFinite(rawPrice) || rawPrice <= 0) {
      throw new Error(`unexpected spot_price: ${spot_price}`);
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
