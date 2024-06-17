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
