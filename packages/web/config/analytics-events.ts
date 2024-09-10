/** # User Events Constants
 *  Logged to Amplitude at https://analytics.amplitude.com/osmosis-zone/
 */

import { AllocationOptions } from "~/components/complex/portfolio/types";

// Should be in sync with: https://docs.google.com/spreadsheets/d/18w8VwJmmRdb_E-XkE1UjkqhLxCyhqVVhWlzDgTtbRWo/edit?usp=sharing
// For maintainability - all event logs should be in high level component

export type AmountDefault = "half" | "max" | "input";

export type EventPage = "Swap Page" | "Token Info Page" | "Pool Details Page";

export type EventProperties = {
  fromToken: string;
  toToken: string;
  isOnHome: boolean;
  percentage: string;
  isMultiHop: boolean;
  isMultiRoute: boolean;
  poolId: string;
  poolName: string;
  poolWeight: string;
  filteredBy: string;
  isFilterOn: boolean;
  sortedBy: string;
  sortedOn: "table-head" | "dropdown" | "table";
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
  hasExternalUrl: boolean;
  avatar: "ammelia" | "wosmongton";
  strategy: string;
  strategyId: string;
  liquidityUSD: number;
  positionId: string;
  rewardAmountUSD: number;
  sourcePage: "Trade" | "Pool Details" | "Pools";
  title: "Stake" | "Explore Pools";
  page: EventPage;
  volatilityType: string;
  rangeHigh: number;
  rangeLow: number;
  completed: boolean;
  quoteTimeMilliseconds: number;
  amountDefault: AmountDefault;
  amount: number;
  amountUSD: string | undefined;
  type: string;
  router: string;
  errorMessage: string | undefined;
  valueUsd: number;
  feeValueUsd: number;
  assetCategory: string;
  highlight: string;
  source: string;
  spendLimit: number;
  sessionPeriod: string;
  network: string;
  bridgeProviderName: string;
  hasMultipleVariants: boolean;
  isRecommendedVariant: boolean;
  walletName: string;
  transferDirection: "deposit" | "withdraw";
  coinDenom: string;
  appName: string;
  isFeatured: boolean;
  isBanner: boolean;
  position: number;
  allocationType: AllocationOptions;
  section: string;
  tokenIn: string;
  tokenOut: string;
  option: string;
  numberOfValidators: number;
  validatorNames: string[];
  squadSize: number;
};

export type UserProperties = {
  isWalletConnected: boolean;
  connectedWallet: string;
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
    swapStarted: "Swap: Swap started",
    swapCompleted: "Swap: Swap completed",
    swapFailed: "Swap: Swap failed",
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
    perpsClicked: "Sidebar: Perps clicked",
    marginClicked: "Sidebar: Margin clicked",
  },
  // Events in Topnav UI
  Topnav: {
    connectWalletClicked: "Topnav: Connect wallet clicked",
    signOutClicked: "Topnav: Sign out clicked",
    tradeClicked: "Pro Trading Clicked",
  },
  // Events in Pools page
  Pools: {
    pageViewed: "Pools: Page viewed",
    myPoolsCardClicked: "Pools: My pools card clicked",
  },
  // Events in Pool detail page
  PoolDetail: {
    pageViewed: "Pool detail: Page viewed",
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
    assetClicked: "Assets: Asset clicked",
    assetsListSorted: "Assets: Assets list sorted",
    categorySelected: "Assets: Category selected",
  },
  // Events in profile modal
  ProfileModal: {
    selectAvatarClicked: "Profile Modal: Select Avatar clicked",
    qrCodeClicked: "Profile Modal: QR code clicked",
    logOutClicked: "Profile Modal: Log out clicked",
    copyWalletAddressClicked: "Profile Modal: Copy wallet address clicked",
    buyTokensClicked: "Profile Modal: Buy tokens clicked",
    blockExplorerLinkOutClicked:
      "Profile Modal: Block explorer link-out clicked",
  },
  // Events in App Store
  AppStore: {
    appClicked: "App Store: App clicked",
    applyClicked: "App Store: Apply CTA clicked",
    pageViewed: "App Store: Page Viewed",
  },
  // Events in CL
  ConcentratedLiquidity: {
    strategyPicked: "CL Create a position: Strategy picked",
    claimAllRewardsClicked: "CL: Claim All Rewards clicked",
    claimAllRewardsCompleted: "CL: Claim All Rewards completed",
    collectRewardsClicked: "CL: Collect rewards clicked",
    collectRewardsCompleted: "CL: Collect rewards completed",
    addLiquidityCompleted: "CL Create a position: Add liquidity completed",
    addLiquidityStarted: "CL Create a position: Add liquidity started",
    addMoreLiquidityStarted: "CL : Add more liquidity started",
    addMoreLiquidityCompleted: "CL : Add more liquidity completed",
    createPositionCtaClicked: "CL Tutorial: Create position CTA clicked",
    positionDetailsExpanded: "CL: Position details expanded",
    removeLiquidityClicked: "CL: Remove liquidity clicked",
    removeLiquidityCompleted: "CL: Remove liquidity completed",
  },
  // Events in stake page
  Stake: {
    pageViewed: "Stake: Page Viewed",
    stakingStarted: "Stake: Staking started",
    stakingCompleted: "Stake: Staking completed",
    unstakingStarted: "Stake: Unstaking started",
    unstakingCompleted: "Stake: Unstaking completed",
    squadOptionClicked: "Stake: Squad option clicked",
    selectSquadAndStakeClicked: "Stake: Select squad and stake clicked",
    buildSquadClicked: "Stake: Build squad clicked",
    collectRewardsStarted: "Stake: Collect rewards started",
    collectRewardsCompleted: "Stake: Collect rewards completed",
    collectAndReinvestStarted: "Stake: Collect and re-invest started",
    collectAndReinvestCompleted: "Stake: Collect and re-invest started",
  },
  TokenInfo: {
    pageViewed: "Token Info: Page view",
    viewMoreClicked: "Token Info: View more clicked",
    socialPostClicked: "Token Info: Social post clicked",
  },
  EarnPage: {
    pageViewed: "Earn Page: Page viewed",
    rewardsClaimStarted: "Earn Page: Rewards claim started",
    joinStrategyClicked: "Earn Page: Join strategy clicked",
  },
  TransactionsPage: {
    pageViewed: "Transactions: Page viewed",
    swapClicked: "Transactions: Swap clicked",
    taxReportsClicked: "Transactions: Tax reports clicked",
    explorerClicked: "Transactions: Explorer clicked",
  },
  Wormhole: {
    pageViewed: "Wormhole: Page viewed",
  },
  OneClickTrading: {
    startSession: "1CT: Start session",
    endSession: "1CT: End session",
    enableOneClickTrading: "1CT: Enable 1-Click Trading",
    accessed: "1CT: Accessed",
  },
  LimitOrder: {
    buySelected: "Buy tab selected",
    sellSelected: "Sell tab selected",
    swapSelected: "Swap tab selected",
    marketOrderSelected: "Market Order selected",
    limitOrderSelected: "Limit Order selected",
    placeOrderStarted: "Limit Order: Place order started",
    placeOrderCompleted: "Limit Order: Place order completed",
    placeOrderFailed: "Limit Order: Place order failed",
    claimOrdersStarted: "Limit Order: Claim all orders started",
    claimOrdersCompleted: "Limit Order: Claim all orders completed",
    claimOrdersFailed: "Limit Order: Claim all orders failed",
    pageViewed: "Limit Order: Order page viewed",
    addFunds: "Limit Order: Add funds button clicked",
    swapFromAnotherAsset: "Limit Order: Swap from another asset clicked",
  },
  DepositWithdraw: {
    assetSelected: "DepositWithdraw: Asset selected",
    networkSelected: "DepositWithdraw: Network selected",
    providerSelected: "DepositWithdraw: Provider selected",
    variantSelected: "DepositWithdraw: Variant selected",
    started: "DepositWithdraw: Started",
    walletSelected: "DepositWithdraw: Wallet selected",
  },
  Portfolio: {
    pageViewed: "Portfolio: Page viewed",
    chartInteraction: "Portfolio: Chart interaction",
    tabClicked: "Portfolio: Open allocation clicked",
    allocationClicked: "Portfolio: Allocation clicked",
  },
};
