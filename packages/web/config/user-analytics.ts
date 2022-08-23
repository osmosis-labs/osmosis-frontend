import { UserEvent } from "../hooks";

/** # User Events Constants
 *  Logged to Matomo analytics at https://analyze.osmosis.zone/
 */

export const INIT_CONFIG = {
  url: "https://analyze.osmosis.zone/",
  siteId: "4",
};

// Should be in sync with: https://www.notion.so/osmosiszone/8bbbabce67fa4c4289989632633b9052?v=7123ab7319054d9aa63ba9e40b6d6c51
// For maintainability - all event logs should be in high level component

type EventsConfig = {
  [key: string]: UserEvent;
};

type EventConfigMakers = {
  [key: string]: (...any: any) => UserEvent;
};

// assets page
const AssetsCategory = "Assets";
export const AssetsPageEvents: EventsConfig = {
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
  sortAssets: [AssetsCategory, "SortAssets"],
};

// pool detail page
const PoolCategory = "Pool";
export const PoolDetailEvents: EventsConfig = {
  startManageLiquidity: [PoolCategory, "StartManageLiquidity"],
  setSingleAssetLiquidity: [PoolCategory, "SetSingleAssetLiquidity"],
  addLiquiditySuccess: [PoolCategory, "AddLiquidity", "success"],
  addLiquidityFailure: [PoolCategory, "AddLiquidity", "failure"],
  addSingleLiquiditySuccess: [PoolCategory, "AddSingleLiquidity", "success"],
  addSingleLiquidityFailure: [PoolCategory, "AddSingleLiquidity", "failure"],
  removeLiquiditySuccess: [PoolCategory, "RemoveLiquidity", "success"],
  removeLiquidityFailure: [PoolCategory, "RemoveLiquidity", "failure"],
  startSwapTokens: [PoolCategory, "StartsSwapPool"],
  poolSwapSuccess: [PoolCategory, "SwapPool", "success"],
  poolSwapFailure: [PoolCategory, "SwapPool", "failure"],
  gammTokenUnlockSuccess: [PoolCategory, "GAMMUnlock", "success"],
  gammTokenUnlockFailure: [PoolCategory, "GAMMUnlock", "failure"],
  startLockTokens: [PoolCategory, "StartLockTokens"],
  gammTokenLockSuccess: [PoolCategory, "GAMMLock", "success"],
  gammTokenLockFailure: [PoolCategory, "GAMMLock", "failure"],
  goSuperfluid: [PoolCategory, "ElectSuperfluid"],
  superfluidStakeSuccess: [PoolCategory, "SuperfluidStake", "success"],
  superfluidStakeFailure: [PoolCategory, "SuperfluidStake", "failure"],
  unpoolSuccess: [PoolCategory, "UnPool", "success"],
  unpoolFailure: [PoolCategory, "UnPool", "failure"],
};

// swap page
const SwapCategory = "Swap";
export const SwapPageEvents: EventsConfig = {
  multiHopSwap: [SwapCategory, "MultiHopSwap"],
  openSwapDetails: [SwapCategory, "OpenSwapDetails"],
  swapMaxAmount: [SwapCategory, "SwapMaxAmount"],
  swapHalfAmount: [SwapCategory, "SwapHalfAmount"],
};
export const MakeSwapPageEvents: EventConfigMakers = {
  swapSuccess(denom: string, amount: string) {
    return [SwapCategory, "Swap", "success", amount + " " + denom];
  },
  swapFailure(denom: string, amount: string) {
    return [SwapCategory, "Swap", "failure", amount + " " + denom];
  },
  setSlippageTolerance(poolIds: string[], toleranceDec: string) {
    return [
      SwapCategory,
      "SetSlippageTolerance",
      poolIds.join(" ") + " " + toleranceDec,
    ];
  },
};

// pools page
const PoolsCategory = "Pools";
export const PoolsPageEvents: EventsConfig = {
  startCreatePool: [PoolsCategory, "StartCreatePool"],
  createPoolSuccess: [PoolsCategory, "CreatePoolSuccess", "success"],
  createPoolFailure: [PoolsCategory, "CreatePool", "failure"],
  showLowTvlPools: [PoolsCategory, "ShowLowTVLPools"],
  showAllPools: [PoolsCategory, "ShowAllPools"],
  sortPools: [PoolsCategory, "SortPools"],
  startPoolsSearch: [PoolsCategory, "StartPoolsSearch"],
};

// nav bar
const NavBarCategory = "NavBar";
export const NavBarEvents: EventsConfig = {
  startConnectWallet: [NavBarCategory, "StartConnectWallet"],
  cancelConnectWallet: [NavBarCategory, "CancelConnectWallet"],
  disconnectWallet: [NavBarCategory, "DisconnectWallet"],
  installKeplrLink: [NavBarCategory, "InstallKeplrLink"],
  connectKeplrSuccess: [NavBarCategory, "ConnectKeplrSuccess"],
  connectWalletConnectSuccess: [NavBarCategory, "ConnectWalletConnectSuccess"],
  supportLabLink: [NavBarCategory, "SupportLabLink"],
  twitterLink: [NavBarCategory, "TwitterLink"],
  mediumLink: [NavBarCategory, "MediumLink"],
  commonwealthLink: [NavBarCategory, "CommonwealthLink"],
  discordLink: [NavBarCategory, "DiscordLink"],
  telegramLink: [NavBarCategory, "TelegramLink"],
  stakeLink: [NavBarCategory, "StakeLink"],
  voteLink: [NavBarCategory, "VoteLink"],
  infoLink: [NavBarCategory, "InfoLink"],
};
