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
  data: LimitOrder[];
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
