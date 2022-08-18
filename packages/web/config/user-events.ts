import { UserEvent } from "../hooks";
import { SortDirection } from "../components/types";

// Should be in sync with: https://www.notion.so/osmosiszone/8bbbabce67fa4c4289989632633b9052?v=7123ab7319054d9aa63ba9e40b6d6c51
// For maintainability - all event logs should be in high level component

type EventConfig = {
  [key: string]: UserEvent;
};

type EventConfigMaker = {
  [key: string]: (...any: any) => UserEvent;
};

// assets page
const AssetsCategory = "Assets";
export const AssetsPageEvents: EventConfig = {
  startSearchAssets: [AssetsCategory, "StartSearch"],
  // sortAssets below w/ direction
  rowStartDeposit: [AssetsCategory, "RowTransfer", "deposit"],
  rowStartWithdraw: [AssetsCategory, "RowTransfer", "withdraw"],
  withdrawMaxAmount: [AssetsCategory, "TransferMaxAmount", "withdraw"],
  depositMaxAmount: [AssetsCategory, "TransferMaxAmount", "deposit"],
  ibcTransferSuccess: [AssetsCategory, "IbcTransfer", "success"],
  ibcTransferFailure: [AssetsCategory, "IbcTransfer", "failure"],
  editWithdrawAddress: [AssetsCategory, "EditWithdrawAddress"],
  hideZeroBalances: [AssetsCategory, "ShowZeroBalances", "false"],
  showZeroBalances: [AssetsCategory, "ShowZeroBalances", "true"],
};
export const MakeAssetsPageEvents: EventConfigMaker = {
  sortAssets(direction: SortDirection): UserEvent {
    return [AssetsCategory, "SortAssets", direction];
  },
};
