import { Dec, Int } from "@keplr-wallet/unit";

export type TickWithNetLiquidity = {
  tickIndex: Int;
  netLiquidity: Dec;
};
