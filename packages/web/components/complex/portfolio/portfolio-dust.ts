import { Dec, PricePretty } from "@keplr-wallet/unit";

export const PORTFOLIO_HIDE_DUST_KEY = "portfolio-hide-dust";
export const DUST_THRESHOLD = new Dec(0.02);

export const getIsDust = (value: PricePretty) =>
  value.toDec().lt(DUST_THRESHOLD);
