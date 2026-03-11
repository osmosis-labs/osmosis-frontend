/**
 * @file order-utils.ts
 * @description Reusable utilities for querying and cancelling Osmosis limit orders on-chain.
 *
 * Provides address derivation from a raw secp256k1 private key, active order fetching via
 * the SQS passthrough API, a signing client factory, and cancel message builders.
 *
 * This module has no side effects and is safe to import from any script or test file.
 *
 * @example
 * ```ts
 * import { deriveAddress, fetchActiveOrders, createSigningClient, buildCancelMessages } from '../utils/order-utils'
 *
 * const { wallet, address } = await deriveAddress(process.env.PRIVATE_KEY)
 * const orders = await fetchActiveOrders(address)
 * const client = await createSigningClient(wallet)
 * const msgs = buildCancelMessages(orders)
 * const result = await client.executeMultiple(address, msgs, 'auto')
 * ```
 */

import {
  SigningCosmWasmClient,
  type ExecuteInstruction,
} from "@cosmjs/cosmwasm-stargate";
import { type OfflineDirectSigner } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";

/**
 * Osmosis mainnet RPC endpoint used for signing and broadcasting transactions.
 *
 * Resolution order:
 * 1. `OSMOSIS_RPC` env var (explicit override)
 * 2. `NEXT_PUBLIC_OSMOSIS_RPC_OVERWRITE` env var (same var the frontend uses, see packages/web/config/env.ts)
 * 3. Falls back to `https://rpc.osmosis.zone`
 */
export const OSMOSIS_RPC =
  process.env.OSMOSIS_RPC ??
  process.env.NEXT_PUBLIC_OSMOSIS_RPC_OVERWRITE ??
  "https://rpc.osmosis.zone";

/**
 * SQS endpoint used to fetch active orders.
 *
 * Resolution order:
 * 1. `SQS_URL` env var (explicit override)
 * 2. `NEXT_PUBLIC_SIDECAR_BASE_URL` env var (same var the frontend uses, see packages/server/src/env.ts)
 * 3. Falls back to `https://sqs.osmosis.zone` (default from packages/web/.env)
 */
export const SQS_BASE_URL = (
  process.env.SQS_URL ??
  process.env.NEXT_PUBLIC_SIDECAR_BASE_URL ??
  "https://sqs.osmosis.zone"
).replace(/\/+$/, "");

/**
 * Maximum number of orders to include in a single transaction.
 */
export const CANCEL_BATCH_SIZE = 20;

/**
 * Gas multiplier passed to `executeMultiple` instead of `"auto"` (which defaults to 1.4x).
 * Set to 2.0 to provide sufficient headroom for batch cancel transactions.
 */
export const CANCEL_GAS_MULTIPLIER = 2.0;

/**
 * Represents an active limit order returned by the SQS passthrough API.
 * Mirrors the shape from `packages/server/src/queries/sidecar/orderbooks.ts`.
 */
export interface SQSActiveOrder {
  /** The tick ID of the orderbook this order lives on. */
  tick_id: number;
  /** Unique identifier for this order within its orderbook. */
  order_id: number;
  /** Whether this is a buy (bid) or sell (ask) order. */
  order_direction: "bid" | "ask";
  /** Owner's bech32 address. */
  owner: string;
  /** Remaining quantity of the order (as a string integer). */
  quantity: string;
  /** ETAS value (used internally by the orderbook contract). */
  etas: string;
  /** Original placed quantity of the order. */
  placed_quantity: string;
  /** Unix timestamp when the order was placed. */
  placed_at: number;
  /** Limit price as a decimal string. */
  price: string;
  /** Percentage of the order that has been claimed. */
  percentClaimed: string;
  /** Total amount filled. */
  totalFilled: string;
  /** Percentage of the order that has been filled. */
  percentFilled: string;
  /** Bech32 address of the orderbook contract this order belongs to. */
  orderbookAddress: string;
  /** Current order status. */
  status: "open" | "partiallyFilled";
  /** Expected output amount. */
  output: string;
  /** Quote asset metadata. */
  quote_asset: { symbol: string };
  /** Base asset metadata. */
  base_asset: { symbol: string };
}

export { deriveAddress } from "./wallet-utils";

/**
 * Fetches all active (open or partially filled) limit orders for a given Osmosis address
 * via the SQS production passthrough API.
 *
 * @param address - The osmo1... bech32 address to query orders for.
 * @returns Array of active orders. Returns an empty array if the account has no open orders.
 * @throws {Error} If the HTTP request fails or the response is not valid JSON.
 *
 * @example
 * ```ts
 * const orders = await fetchActiveOrders('osmo1fapvfx64af2eperkggnwd6zmpzdvvnq4xjc2dv')
 * console.log(`${orders.length} active orders`)
 * ```
 */
export async function fetchActiveOrders(
  address: string
): Promise<SQSActiveOrder[]> {
  const url = `${SQS_BASE_URL}/passthrough/active-orders?userOsmoAddress=${address}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch active orders: ${response.status} ${response.statusText}`
    );
  }
  const data = (await response.json()) as { orders?: SQSActiveOrder[] };
  return data.orders ?? [];
}

/**
 * Creates a `SigningCosmWasmClient` connected to the Osmosis mainnet RPC,
 * configured with the given wallet and a default gas price.
 *
 * @param wallet - An `OfflineDirectSigner` instance (e.g. from `deriveAddress`).
 * @returns A connected `SigningCosmWasmClient` ready to broadcast transactions.
 * @throws {Error} If the RPC connection cannot be established.
 *
 * @example
 * ```ts
 * const { wallet } = await deriveAddress(privateKey)
 * const client = await createSigningClient(wallet)
 * ```
 */
export async function createSigningClient(
  wallet: OfflineDirectSigner
): Promise<SigningCosmWasmClient> {
  return SigningCosmWasmClient.connectWithSigner(OSMOSIS_RPC, wallet, {
    gasPrice: GasPrice.fromString("0.035uosmo"),
  });
}

/**
 * Builds `claim_limit` instructions for orders that have unclaimed fills.
 *
 * Must be sent in a SEPARATE transaction before cancel messages because
 * fully-filled orders are removed from the contract after claiming, which
 * would cause a subsequent `cancel_limit` in the same atomic tx to revert
 * the entire batch with "Order not found".
 */
export function buildClaimMessages(
  orders: SQSActiveOrder[]
): ExecuteInstruction[] {
  return orders
    .filter(
      (o) => parseFloat(o.percentFilled) > parseFloat(o.percentClaimed)
    )
    .map((order) => ({
      contractAddress: order.orderbookAddress,
      msg: {
        claim_limit: {
          order_id: order.order_id,
          tick_id: order.tick_id,
        },
      },
      funds: [],
    }));
}

/**
 * Builds `cancel_limit` instructions for the given orders.
 */
export function buildCancelMessages(
  orders: SQSActiveOrder[]
): ExecuteInstruction[] {
  return orders.map((order) => ({
    contractAddress: order.orderbookAddress,
    msg: {
      cancel_limit: {
        order_id: order.order_id,
        tick_id: order.tick_id,
      },
    },
    funds: [],
  }));
}

/**
 * Splits an array into chunks of a given size.
 * Used to batch cancel messages into groups of `CANCEL_BATCH_SIZE`.
 *
 * @param arr - The array to chunk.
 * @param size - Maximum number of elements per chunk.
 * @returns Array of chunks.
 *
 * @example
 * ```ts
 * chunk([1,2,3,4,5], 2) // [[1,2],[3,4],[5]]
 * ```
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}
