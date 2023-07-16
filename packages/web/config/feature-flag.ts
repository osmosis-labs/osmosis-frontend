import { IS_FRONTIER } from "./env";

/** UI will go into "halt mode" if `true`. */
export const IS_HALTED = false;

export const UserAction: { [key: string]: boolean } = {
  CreateNewPool: true,
};

/** Banner below nav bar: mapping of inclusion (.includes()) in page routes to message in banner. */
export const Announcement:
  | {
      localStorageKey?: string;
      /** Leave undefined to include all pages. */
      pageRoute?: string;
      /** English text or key into localization jsons. */
      enTextOrLocalizationPath: string;
      /** Link to external page. */
      link?: {
        /** Default: "Click here to learn more" in english-us */
        enTextOrLocalizationKey?: string;
        url: string;
        /** External to Osmosis. Show disclaimer before linking out of app. */
        isExternal?: boolean;
      };
      /** Use orange styling, persist on page reloads. */
      isWarning?: boolean;
      /** Will always show on page reload. Use with caution. (Warnings persist) */
      persistent?: boolean;
      /** Custom Background color. */
      bg?: string;
    }
  | undefined = IS_HALTED
  ? {
      enTextOrLocalizationPath:
        "Chain is halted, transactions are temporarily disabled",
      isWarning: true,
    }
  : {
      enTextOrLocalizationPath: "tally.description",
      link: {
        enTextOrLocalizationKey: "tally.link",
        url: "http://app.osmosis.zone/pool/1066",
        isExternal: false,
      },
    };

// Past localstorage keys:
// * "feedback_wQ1KR7": "Help us shape the future of Osmosis." Give us feedback -> https://tally.so/r/wQ1KR7

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
