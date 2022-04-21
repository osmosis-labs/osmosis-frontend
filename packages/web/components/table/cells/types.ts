import { BaseCell } from "../types";

export interface PoolCell extends BaseCell {
  poolId: number;
  tokenDenoms: string[];
} // TODO: remove

export type AssetCell = BaseCell & {
  chainName?: string;
  chainId?: string;
  coinDenom: string;
  coinImageUrl?: string;
  amount: string;
  fiatValue?: string;
  isCW20: boolean;
  /** Used by `useFilteredData` to provide user query terms to help users find this cell in the table.
   *  Be sure to add `"queryTags"` to the keys param.
   */
  queryTags?: string[];
  onWithdraw?: (chainId: string, coinDenom: string) => void;
  onDeposit?: (chainId: string, coinDenom: string) => void;
};

export interface ValidatorInfo extends BaseCell {
  imgSrc?: string;
}
