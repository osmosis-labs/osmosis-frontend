import dayjs from "dayjs";

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
  placed_at: string;
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
      get_unrealized_cancels: {
        tick_ids: tickIds,
      },
    });
    const encodedMsg = Buffer.from(msg).toString("base64");
    return `/cosmwasm/wasm/v1/contract/${orderbookAddress}/smart/${encodedMsg}`;
  },
});

interface OrderbookSpotPriceResponse {
  data: {
    spot_price: string;
  };
}

export const queryOrderbookSpotPrice = createNodeQuery<
  OrderbookSpotPriceResponse,
  {
    orderbookAddress: string;
    quoteAssetDenom: string;
    baseAssetDenom: string;
  }
>({
  path: ({ orderbookAddress, quoteAssetDenom, baseAssetDenom }) => {
    const msg = JSON.stringify({
      spot_price: {
        quote_asset_denom: quoteAssetDenom,
        base_asset_denom: baseAssetDenom,
      },
    });
    const encodedMsg = Buffer.from(msg).toString("base64");
    return `/cosmwasm/wasm/v1/contract/${orderbookAddress}/smart/${encodedMsg}`;
  },
});

interface OrderbookDenomsResponse {
  data: {
    quote_denom: string;
    base_denom: string;
  };
}

export const queryOrderbookDenoms = createNodeQuery<
  OrderbookDenomsResponse,
  {
    orderbookAddress: string;
  }
>({
  path: ({ orderbookAddress }) => {
    const msg = JSON.stringify({
      denoms: {},
    });
    const encodedMsg = Buffer.from(msg).toString("base64");
    return `/cosmwasm/wasm/v1/contract/${orderbookAddress}/smart/${encodedMsg}`;
  },
});

export interface HistoricalLimitOrder {
  place_timestamp: string;
  place_tx_hash: string;
  order_denom: string;
  output_denom: string;
  quantity: string;
  tick_id: string;
  order_id: string;
  order_direction: "ask" | "bid";
  price: string;
  status: string;
  contract: string;
}

export function queryHistoricalOrders(
  userOsmoAddress: string
): Promise<HistoricalLimitOrder[]> {
  // const url = new URL(
  //   `/users/limit_orders/history/closed?address=${userOsmoAddress}`,
  //   NUMIA_BASE_URL
  // );
  // return apiClient<HistoricalLimitOrder[]>(url.toString());
  const placedholders: HistoricalLimitOrder[] = [
    {
      place_timestamp: (dayjs().unix() * 1_000_000).toString(),
      place_tx_hash: "123123",
      order_denom:
        "ibc/DE6792CF9E521F6AD6E9A4BDF6225C9571A3B74ACC0A529F92BC5122A39D2E58",
      output_denom: "uosmo",
      quantity: "1000000",
      tick_id: "1",
      order_id: '1"',
      order_direction: "bid",
      price: "1",
      status: "fullyClaimed",
      contract:
        "osmo1kgvlc4gmd9rvxuq2e63m0fn4j58cdnzdnrxx924mrzrjclcgqx5qxn3dga",
    },
    {
      place_timestamp: (dayjs().unix() * 1_000_000).toString(),
      place_tx_hash: "123123",
      output_denom:
        "ibc/DE6792CF9E521F6AD6E9A4BDF6225C9571A3B74ACC0A529F92BC5122A39D2E58",
      order_denom: "uosmo",
      quantity: "123123",
      tick_id: "1",
      order_id: '1"',
      order_direction: "ask",
      price: "0.5",
      status: "fullyClaimed",
      contract:
        "osmo1kgvlc4gmd9rvxuq2e63m0fn4j58cdnzdnrxx924mrzrjclcgqx5qxn3dga",
    },
    {
      place_timestamp: (dayjs().unix() * 1_000_000).toString(),
      place_tx_hash: "123123",
      output_denom:
        "ibc/DE6792CF9E521F6AD6E9A4BDF6225C9571A3B74ACC0A529F92BC5122A39D2E58",
      order_denom: "uosmo",
      quantity: "123123",
      tick_id: "1",
      order_id: '1"',
      order_direction: "ask",
      price: "2.5",
      status: "cancelled",
      contract:
        "osmo1kgvlc4gmd9rvxuq2e63m0fn4j58cdnzdnrxx924mrzrjclcgqx5qxn3dga",
    },
  ];

  return new Promise((resolve) => resolve(placedholders));
}
