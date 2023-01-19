import { IS_FRONTIER } from "./env";

/** UI will go into "halt mode" if `true`. */
export const IS_HALTED = false;

export const UserAction: { [key: string]: boolean } = {
  CreateNewPool: true,
};

// Fiat ramps
export const BUY_OSMO_TRANSAK = true;

export const HiddenPoolIds: string[] = [];

export const RecommendedSwapDenoms = [
  "OSMO",
  "USDC",
  "ATOM",
  "DAI",
  "JUNO",
  "EVMOS",
];

export const UnPoolWhitelistedPoolIds: { [poolId: string]: boolean } = {
  // #560 (UST/OSMO)
  // #562 (UST/LUNA)
  // #567 (UST/EEUR)
  // #578 (UST/XKI)
  // #592 (UST/BTSG)
  // #610 (UST/CMDX)
  // #612 (UST/XPRT)
  // #615 (UST/LUM)
  // #642 (UST/UMEE)
  // #679 (UST/axl-FRAX/axl-USDT/axl-USDC)
  // #580 (UST/JUNO)
  // #635 (UST/g-USDC/g-DAI)
  "560": true,
  "562": true,
  "567": true,
  "578": true,
  "592": true,
  "610": true,
  "612": true,
  "615": true,
  "642": true,
  "679": true,
  "580": true,
  "635": true,
};

/** List of pools active in LBP to present in frontend. */
export const PromotedLBPPoolIds: {
  poolId: string;
  name: string;
  ibcHashDenom: string;
}[] = IS_FRONTIER
  ? [
      /*      {
        poolId: "813",
        name: "REBUS Liquidity Bootstrapping Pool",
        ibcHashDenom: DenomHelper.ibcDenom(
          [{ portId: "transfer", channelId: "channel-355" }],
          "arebus"
        ),
      },*/
    ]
  : [];

export const ICNSInfo = {
  resolverContractAddress:
    "osmo1xk0s8xgktn9x5vwcgtjdxqzadg88fgn33p8u9cnpdxwemvxscvast52cdd",
};
