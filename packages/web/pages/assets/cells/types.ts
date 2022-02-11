import { BaseCell } from "../../../components/table";

/** Data available to each cell in the assets table. */
type AssetCell = {
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
  onWithdraw?: (chainId: string) => void;
  onDeposit?: (chainId: string) => void;
};

export type Cell = BaseCell & AssetCell;
