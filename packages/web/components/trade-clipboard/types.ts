import { AppCurrency } from "@keplr-wallet/types";
import { RoutePathWithAmount } from "@osmosis-labs/pools";

export interface TradeRouteProps {
  sendCurrency: AppCurrency;
  outCurrency: AppCurrency;
  path: RoutePathWithAmount;
}
