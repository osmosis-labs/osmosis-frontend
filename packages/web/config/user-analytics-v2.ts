export type EventProperties = {
  fromToken: string;
  toToken: string;
  isOnHome: boolean;
  percentage: string;
  poolId: string;
  poolName: string;
  poolWeight: string;
  filteredBy: string;
  isFilterOn: boolean;
  sortedBy: string;
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
  totalAssetsPrice: string;
  unbondedAssetsPrice: string;
  bondedAssetsPrice: string;
  stakedOsmoPrice: string;
  osmoBalance: string;
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
    slippageToleranceSet: "Swap: Slippage tolerance set",
    switchClicked: "Swap: Switch clicked",
    swapClicked: "Swap: Swap clicked",
  },
  // Events in Sidebar UI
  Sidebar: {
    stakeClicked: "Sidebar: Stake clicked",
    voteClicked: "Sidebar: Vote clicked",
    infoClicked: "Sidebar: Info clicked",
    connectWalletClicked: "Sidebar: Connect wallet clicked",
    signOutClicked: "Sidebar: Sign out clicked",
    twitterClicked: "Sidebar: Twitter clicked",
    mediumClicked: "Sidebar: Medium clicked",
    commonwealthClicked: "Sidebar: Commonwealth clicked",
    discordClicked: "Sidebar: Discord clicked",
    telegramClicked: "Sidebar: Telegram clicked",
    supportClicked: "Sidebar: Support clicked",
  },
  // Events in Pools page
  Pools: {
    pageViewed: "Pools: Page viewed",
    createNewPoolClicked: "Pools: Create new pool clicked",
    myPoolsCardClicked: "Pools: My pools card clicked",
    superfluidPoolsCardClicked: "Pools: Superfluid pools card clicked",
    allPoolsListFiltered: "Pools: All pools list filtered",
    allPoolsListSorted: "Pools: All pools list sorted",
    allPoolsTableSorted: "Pools All pools table sorted",
    incentivizedPoolsItemClicked: "Pools: Incentivized pools item clicked",
    allPoolsItemClicked: "Pools: All pools item clicked",
    externalIncentivePoolsListSorted:
      "Pools: External incentive pools item sorted",
    externalIncentivePoolsTableSorted:
      "Pools: External incentive pools table sorted",
    externalIncentivePoolsItemClicked:
      "Pools: External incentive pools item clicked",
  },
  // Events in Pool detail page
  PoolDetail: {
    pageViewed: "Pool detail: Page viewed",
    addOrRemoveLiquidityClicked: "Pool detail: Add/Remove liquidity clicked",
    swapTokensClicked: "Pool detail: Swap tokens clicked",
    startEarningClicked: "Pool detail: Start earning clicked",
    unbondAllStarted: "Pool detail: Unbond all started",
    unbondAllCompleted: "Pool detail: Unbond all completed",
    singleAssetClicked: "Manage liquidity: Single asset clicked",
    addLiquidityStarted: "Manage liquidity: Add liquidity started",
    addLiquidityCompleted: "Manage liquidity: Add liquidity completed",
    removeLiquidityStarted: "Manage liquidity: Remove liquidity started",
    removeLiquidityCompleted: "Manage liquidity: Remove liquidity completed",
    bondStarted: "Liquidity bonding: Bond started",
    bondCompleted: "Liquidity bonding: Bond completed",
    superfluidStakeStarted: "Liquidity bonding: Superfluid stake started",
    superfluidStakeCompleted: "Liquidity bonding: Superfluid stake completed",
  },
  // Events in assets page
  Assets: {
    pageViewed: "Assets: Page viewed",
    depositClicked: "Assets: Deposit clicked",
    withdrawClicked: "Assets: Deposit clicked",
    myPoolsCardClicked: "Assets: My pools card clicked",
    myPoolsMoreClicked: "Assets: My pools more clicked",
    assetsListFiltered: "Assets: Assets list filtered",
    assetsListSorted: "Assets: Assets list sorted",
    assetsTableSorted: "Assets: Assets table sorted",
    assetsListMoreClicked: "Assets: Assets list more clicked",
    assetsItemDepositClicked: "Assets: Assets item deposit clicked",
    assetsItemWithdrawClicked: "Assets: Assets item withdraw clicked",
    depositAssetStarted: "Deposit asset: Deposit started",
    depositAssetCompleted: "Deposit asset: Deposit completed",
    withdrawAssetStarted: "Withdraw asset: Withdraw started",
    withdrawAssetCompleted: "Withdraw asset: Withdraw completed",
  },
};
