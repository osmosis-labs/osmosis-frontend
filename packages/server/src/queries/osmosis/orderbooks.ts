import { createNodeQuery } from "../create-node-query";

interface OrderbookMakerFeeResponse {
  data: string;
}

export const queryOrderbookMakerFee = createNodeQuery<
  OrderbookMakerFeeResponse,
  {
    orderbookAddress: string;
  }
>({
  path: ({ orderbookAddress }: { orderbookAddress: string }) => {
    const msg = JSON.stringify({
      get_maker_fee: {},
    });
    const encodedMsg = Buffer.from(msg).toString("base64");

    return `/cosmwasm/wasm/v1/contract/${orderbookAddress}/smart/${encodedMsg}`;
  },
});

export interface LimitOrder {
  tick_id: number;
  order_id: number;
  order_direction: "ask" | "bid";
  owner: string;
  quantity: string;
  etas: string;
  claim_bounty?: string;
  placed_quantity: string;
}

interface OrderbookActiveOrdersResponse {
  data: { orders: LimitOrder[]; count: number };
}

export const queryOrderbookActiveOrders = createNodeQuery<
  OrderbookActiveOrdersResponse,
  {
    orderbookAddress: string;
    userAddress: string;
  }
>({
  path: ({ orderbookAddress, userAddress }) => {
    const msg = JSON.stringify({
      orders_by_owner: {
        owner: userAddress,
      },
    });
    const encodedMsg = Buffer.from(msg).toString("base64");
    return `/cosmwasm/wasm/v1/contract/${orderbookAddress}/smart/${encodedMsg}`;
  },
});

interface TickValues {
  total_amount_of_liquidity: string;
  cumulative_total_value: string;
  effective_total_amount_swapped: string;
  cumulative_realized_cancels: string;
  last_tick_sync_etas: string;
}

export interface TickState {
  ask_values: TickValues;
  bid_values: TickValues;
}

interface OrderbookTicksResponse {
  data: {
    ticks: { tick_id: number; tick_state: TickState }[];
  };
}

export const queryOrderbookTicks = createNodeQuery<
  OrderbookTicksResponse,
  {
    orderbookAddress: string;
    tickIds: number[];
  }
>({
  path: ({ tickIds, orderbookAddress }) => {
    const msg = JSON.stringify({
      ticks_by_id: {
        tick_ids: tickIds,
      },
    });
    const encodedMsg = Buffer.from(msg).toString("base64");
    return `/cosmwasm/wasm/v1/contract/${orderbookAddress}/smart/${encodedMsg}`;
  },
});

export interface TickUnrealizedCancelsState {
  ask_unrealized_cancels: string;
  bid_unrealized_cancels: string;
}
interface OrderbookTickUnrealizedCancelsResponse {
  data: {
    ticks: {
      tick_id: number;
      unrealized_cancels: TickUnrealizedCancelsState;
    }[];
  };
}

export const queryOrderbookTickUnrealizedCancelsById = createNodeQuery<
  OrderbookTickUnrealizedCancelsResponse,
  {
    orderbookAddress: string;
    tickIds: number[];
  }
>({
  path: ({ tickIds, orderbookAddress }) => {
    const msg = JSON.stringify({
      tick_unrealized_cancels_by_id: {
        tick_ids: tickIds,
      },
    });
    const encodedMsg = Buffer.from(msg).toString("base64");
    return `/cosmwasm/wasm/v1/contract/${orderbookAddress}/smart/${encodedMsg}`;
  },
});