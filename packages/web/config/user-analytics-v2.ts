/** # User Events Constants
 *  Logged to Amplitude at https://analytics.amplitude.com/osmosis-zone/
 */

// Should be in sync with: https://docs.google.com/spreadsheets/d/18w8VwJmmRdb_E-XkE1UjkqhLxCyhqVVhWlzDgTtbRWo/edit?usp=sharing
// For maintainability - all event logs should be in high level component

export type EventProperties = {
  fromToken: string;
  toToken: string;
  isOnHome: boolean;
  percentage: string;
  isMultiHop: boolean;
  poolId: string;
  poolName: string;
  poolWeight: string;
  filteredBy: string;
  isFilterOn: boolean;
  sortedBy: string;
  sortedOn: "table-head" | "dropdown";
  sortDirection: string;
  isSuperfluidPool: boolean;
  isSuperfluidEnabled: boolean;
  isSingleAsset: boolean;
  providingLiquidity: {
    [denom: string]: number;
  };
  poolSharePercentage: number;
  unbondingPeriod: number;
  validatorName: string;
  validatorCommission: number;
  isOn: boolean;
  tokenName: string;
  tokenAmount: number;
  bridge: string;
  hasExternalUrl: boolean;
};

export type UserProperties = {
  isWalletConnected: boolean;
  connectedWallet: string;
  totalAssetsPrice: number;
  unbondedAssetsPrice: number;
  bondedAssetsPrice: number;
  stakedOsmoPrice: number;
  osmoBalance: number;
  myPoolsCount: number;
};

export type AmplitudeEvent =
  | [
      eventName: string,
      eventProperties: Partial<Record<keyof EventProperties, any>> | undefined
    ]
  | [eventName: string];

export const EventName = {
  // Events in Swap UI and page
  Swap: {
    pageViewed: "Swap: Page viewed",
    maxClicked: "Swap: Max clicked",
    halfClicked: "Swap: Half clicked",
    inputEntered: "Swap: Input entered",
    slippageToleranceSet: "Swap: Slippage tolerance set",
    switchClicked: "Swap: Switch clicked",
    swapStarted: "Swap: Swap started",
    swapCompleted: "Swap: Swap completed",
    dropdownAssetSelected: "Swap: Dropdown asset selected",
  },
  // Events in Sidebar UI
  Sidebar: {
    stakeClicked: "Sidebar: Stake clicked",
    voteClicked: "Sidebar: Vote clicked",
    infoClicked: "Sidebar: Info clicked",
    supportClicked: "Sidebar: Support clicked",
    buyOsmoClicked: "Sidebar: Buy OSMO clicked",
    buyOsmoStarted: "Sidebar: Buy OSMO started",
    buyOsmoCompleted: "Sidebar: Buy OSMO completed",
  },
  // Events in Topnav UI
  Topnav: {
    connectWalletClicked: "Topnav: Connect wallet clicked",
    signOutClicked: "Topnav: Sign out clicked",
  },
  // Events in Pools page
  Pools: {
    pageViewed: "Pools: Page viewed",
    createNewPoolClicked: "Pools: Create new pool clicked",
    myPoolsCardClicked: "Pools: My pools card clicked",
    superfluidPoolsCardClicked: "Pools: Superfluid pools card clicked",
    allPoolsListFiltered: "Pools: All pools list filtered",
    allPoolsListSorted: "Pools: All pools list sorted",
    incentivizedPoolsItemClicked: "Pools: Incentivized pools item clicked",
    allPoolsItemClicked: "Pools: All pools item clicked",
    externalIncentivePoolsListSorted:
      "Pools: External incentive pools list sorted",
    externalIncentivePoolsItemClicked:
      "Pools: External incentive pools item clicked",
  },
  // Events in Pool detail page
  PoolDetail: {
    pageViewed: "Pool detail: Page viewed",
    swapTokensClicked: "Pool detail: Swap tokens clicked",
    bondSharesClicked: "Pool detail: Bond Shares clicked",
    unbondAllStarted: "Pool detail: Unbond all started",
    unbondAllCompleted: "Pool detail: Unbond all completed",
    addLiquidityClicked: "Pool detail: Add liquidity clicked",
    addLiquidityStarted: "Pool detail: Add liquidity started",
    addLiquidityCompleted: "Pool detail: Add liquidity completed",
    removeLiquidityClicked: "Pool detail: Remove liquidity clicked",
    removeLiquidityStarted: "Pool detail: Remove liquidity started",
    removeLiquidityCompleted: "Pool detail: Remove liquidity completed",
    bondingStarted: "Pool detail: Bonding started",
    bondingCompleted: "Pool detail: Bonding completed",
    superfluidStakeStarted: "Liquidity bonding: Superfluid stake started",
    superfluidStakeCompleted: "Liquidity bonding: Superfluid stake completed",
    cardDetailsExpanded: "Pool detail: Card details expanded",
    earnMoreByBondingClicked: "Pool detail: Earn more by bonding clicked",
    goSuperfluidClicked: "Pool detail: Go Superfluid clicked",
    unbondClicked: "Pool detail: Unbond clicked",
    showHidePoolDetails: "Pool detail: Show/Hide pool details",
    CardDetail: {
      swapFeesLinkOutClicked: "Card detail: swap fees link-out clicked",
    },
    PutYourAssetsToWork: {
      learnMoreClicked: "Put your assets to work: Learn more clicked",
    },
  },
  // Events in assets page
  Assets: {
    pageViewed: "Assets: Page viewed",
    depositClicked: "Assets: Deposit clicked",
    withdrawClicked: "Assets: Withdraw clicked",
    myPoolsCardClicked: "Assets: My pools card clicked",
    myPoolsMoreClicked: "Assets: My pools more clicked",
    assetsListFiltered: "Assets: Assets list filtered",
    assetsListSorted: "Assets: Assets list sorted",
    assetsListMoreClicked: "Assets: Assets list more clicked",
    assetsItemDepositClicked: "Assets: Assets item deposit clicked",
    assetsItemWithdrawClicked: "Assets: Assets item withdraw clicked",
    depositAssetStarted: "Deposit asset: Deposit started",
    depositAssetCompleted: "Deposit asset: Deposit completed",
    withdrawAssetStarted: "Withdraw asset: Withdraw started",
    withdrawAssetCompleted: "Withdraw asset: Withdraw completed",
    buyOsmoClicked: "Assets: Buy OSMO clicked",
    buyOsmoStarted: "Assets: Buy OSMO started",
    buyOsmoCompleted: "Assets: Buy OSMO completed",
  },
};
