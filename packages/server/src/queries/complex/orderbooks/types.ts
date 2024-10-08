import type { Dec } from "@keplr-wallet/unit";
import { getAssetFromAssetList } from "@osmosis-labs/utils";

import type { LimitOrder } from "../../osmosis";

export type OrderStatus =
  | "open"
  | "partiallyFilled"
  | "filled"
  | "fullyClaimed"
  | "cancelled";

export type MappedLimitOrder = Omit<
  LimitOrder,
  "quantity" | "placed_quantity" | "placed_at"
> & {
  quantity: number;
  placed_quantity: number;
  percentClaimed: Dec;
  totalFilled: number;
  percentFilled: Dec;
  orderbookAddress: string;
  price: Dec;
  status: OrderStatus;
  output: Dec;
  quoteAsset: ReturnType<typeof getAssetFromAssetList>;
  baseAsset: ReturnType<typeof getAssetFromAssetList>;
  placed_at: number;
  placed_tx?: string;
};
