import { Currency } from "@keplr-wallet/types";

import { BaseCell } from "~/components/table";

export type AssetCell = BaseCell & {
  currency: Currency;
  chainName?: string;
  chainId?: string;
  coinDenom: string;
  coinImageUrl?: string;
  amount: string;
  fiatValue?: string;
  /** Used by `useFilteredData` to provide user query terms to help users find this cell in the table.
   *  Be sure to add `"queryTags"` to the keys param.
   */
  queryTags?: string[];
  isUnstable?: boolean;
  isFavorite?: boolean;
  isVerified?: boolean;
  onWithdraw?: (
    chainId: string,
    coinDenom: string,
    externalUrl?: string
  ) => void;
  onDeposit?: (
    chainId: string,
    coinDenom: string,
    externalUrl?: string
  ) => void;
  onToggleFavorite?: () => void;
};

export interface ValidatorInfo extends BaseCell {
  imgSrc?: string;
}
