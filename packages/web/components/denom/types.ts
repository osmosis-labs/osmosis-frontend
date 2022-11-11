import { AppCurrency, Currency } from "@keplr-wallet/types";

export interface DenomImageProps {
  denom: AppCurrency | Currency;
  /** Size in px */
  size?: number;
}
