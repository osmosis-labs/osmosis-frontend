import type { CosmosCounterparty, EVMCounterparty } from "@osmosis-labs/types";
import { NativeEVMTokenConstantAddress } from "@osmosis-labs/utils";

/**
 * A transfer endpoint for an alloy that none of its transmuter members lists
 * as a counterparty, but Skip can route (typically by swapping on the EVM
 * chain after the bridge leg). Offered only in `direction`, and route-checked
 * like any other family candidate before it is shown.
 */
export interface AlloyTransferEndpoint {
  direction: "withdraw" | "deposit" | "both";
  counterparty: CosmosCounterparty | EVMCounterparty;
}

const evm = (
  chainName: string,
  chainId: number,
  address: string,
  symbol: string,
  decimals: number
): EVMCounterparty => ({
  chainType: "evm",
  chainName,
  chainId,
  address,
  sourceDenom: address === NativeEVMTokenConstantAddress ? "wei" : address,
  symbol,
  decimals,
});

/**
 * Extra Skip endpoints by alloyed denom. Seeded from a sweep of every alloy's
 * Skip routes (both directions, $50 and $500): each entry is a route that
 * worked when only non-member variants of the alloy named it.
 */
export const ALLOY_TRANSFER_ENDPOINTS: Record<string, AlloyTransferEndpoint[]> =
  {
    // allUSDT
    "factory/osmo1em6xs47hd82806f5cxgyufguxrrc7l0aqx7nzzptjuqgswczk8csavdxek/alloyed/allUSDT":
      [
        {
          direction: "both",
          counterparty: {
            chainType: "cosmos",
            chainName: "kava",
            chainId: "kava_2222-10",
            sourceDenom: "erc20/tether/usdt",
            symbol: "USDT",
            decimals: 6,
          },
        },
        {
          direction: "withdraw",
          counterparty: evm(
            "optimism",
            10,
            "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
            "USDT",
            6
          ),
        },
      ],
    // allETH: Skip swaps into ETH/WETH on the destination chain after the
    // Axelar leg; it has no route the other way.
    "factory/osmo1k6c8jln7ejuqwtqmay3yvzrg3kueaczl96pk067ldg8u835w0yhsw27twm/alloyed/allETH":
      [
        {
          direction: "withdraw",
          counterparty: evm(
            "base",
            8453,
            "0x4200000000000000000000000000000000000006",
            "WETH",
            18
          ),
        },
        {
          direction: "withdraw",
          counterparty: evm(
            "base",
            8453,
            NativeEVMTokenConstantAddress,
            "ETH",
            18
          ),
        },
        {
          direction: "withdraw",
          counterparty: evm(
            "polygon",
            137,
            "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
            "WETH",
            18
          ),
        },
        {
          direction: "withdraw",
          counterparty: evm(
            "optimism",
            10,
            "0x4200000000000000000000000000000000000006",
            "WETH",
            18
          ),
        },
        {
          direction: "withdraw",
          counterparty: evm(
            "optimism",
            10,
            NativeEVMTokenConstantAddress,
            "ETH",
            18
          ),
        },
      ],
  };

/** The extra endpoint counterparties of an alloy offered in `direction`. */
export function getAlloyTransferEndpoints(
  alloyedDenom: string,
  direction: "deposit" | "withdraw"
): (CosmosCounterparty | EVMCounterparty)[] {
  return (ALLOY_TRANSFER_ENDPOINTS[alloyedDenom] ?? [])
    .filter((e) => e.direction === "both" || e.direction === direction)
    .map((e) => e.counterparty);
}
