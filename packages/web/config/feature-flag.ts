import { IS_FRONTIER } from "./ibc-assets";

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

/** Gauges to be rendered in pool's respective pool detail page. */
export const ExternalIncentiveGaugeAllowList: {
  [poolId: string]: {
    gaugeId: string;
    denom: string;
  }[];
} = {
  "1": [
    {
      gaugeId: "4301",
      denom:
        "ibc/AA1C80225BCA7B32ED1FC6ABF8B8E899BEB48ECDB4B417FD69873C6D715F97E7",
    },
  ],
  "3": [
    {
      gaugeId: "3178",
      denom:
        "ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4",
    },
  ],
  "15": [
    {
      gaugeId: "4521",
      denom:
        "ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293",
    },
  ],
  "461": [
    {
      gaugeId: "1774",
      denom:
        "ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59",
    },
    {
      gaugeId: "1775",
      denom:
        "ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59",
    },
    {
      gaugeId: "1776",
      denom:
        "ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59",
    },
  ],
  "482": [
    {
      gaugeId: "1771",
      denom:
        "ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59",
    },
    {
      gaugeId: "1772",
      denom:
        "ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59",
    },
    {
      gaugeId: "1773",
      denom:
        "ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59",
    },
  ],
  "497": [
    {
      gaugeId: "1679",
      denom:
        "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED",
    },
    {
      gaugeId: "1680",
      denom:
        "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED",
    },
    {
      gaugeId: "1681",
      denom:
        "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED",
    },
  ],
  "498": [
    {
      gaugeId: "1682",
      denom:
        "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED",
    },
    {
      gaugeId: "1683",
      denom:
        "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED",
    },
    {
      gaugeId: "1684",
      denom:
        "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED",
    },
  ],
  "547": [
    {
      gaugeId: "2021",
      denom:
        "ibc/655BCEF3CDEBE32863FF281DBBE3B06160339E9897DC9C9C9821932A5F8BA6F8",
    },
    {
      gaugeId: "2022",
      denom:
        "ibc/655BCEF3CDEBE32863FF281DBBE3B06160339E9897DC9C9C9821932A5F8BA6F8",
    },
    {
      gaugeId: "2023",
      denom:
        "ibc/655BCEF3CDEBE32863FF281DBBE3B06160339E9897DC9C9C9821932A5F8BA6F8",
    },
  ],
  "548": [
    {
      gaugeId: "1676",
      denom:
        "ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59",
    },
    {
      gaugeId: "1677",
      denom:
        "ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59",
    },
    {
      gaugeId: "1678",
      denom:
        "ibc/1DC495FCEFDA068A3820F903EDBD78B942FBD204D7E93D3BA2B432E9669D1A59",
    },
  ],
  "553": [
    {
      gaugeId: "29762",
      denom:
        "ibc/9989AD6CCA39D1131523DB0617B50F6442081162294B4795E26746292467B525",
    },
  ],
  "557": [
    {
      gaugeId: "1736",
      denom:
        "ibc/F3FF7A84A73B62921538642F9797C423D2B4C4ACB3C7FCFFCE7F12AA69909C4B",
    },
  ],
  "558": [
    {
      gaugeId: "1737",
      denom:
        "ibc/F3FF7A84A73B62921538642F9797C423D2B4C4ACB3C7FCFFCE7F12AA69909C4B",
    },
  ],
  "560": [
    {
      gaugeId: "1948",
      denom:
        "ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0",
    },
    {
      gaugeId: "1949",
      denom:
        "ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0",
    },
    {
      gaugeId: "1950",
      denom:
        "ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0",
    },
  ],
  "562": [
    {
      gaugeId: "1951",
      denom:
        "ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0",
    },
    {
      gaugeId: "1952",
      denom:
        "ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0",
    },
    {
      gaugeId: "1953",
      denom:
        "ibc/0EF15DF2F02480ADE0BB6E85D9EBB5DAEA2836D3860E9F97F9AADE4F57A31AA0",
    },
  ],
  "571": [
    {
      gaugeId: "1759",
      denom:
        "ibc/D805F1DA50D31B96E4282C1D4181EDDFB1A44A598BFF5666F4B43E4B8BEA95A5",
    },
    {
      gaugeId: "1760",
      denom:
        "ibc/D805F1DA50D31B96E4282C1D4181EDDFB1A44A598BFF5666F4B43E4B8BEA95A5",
    },
    {
      gaugeId: "1761",
      denom:
        "ibc/D805F1DA50D31B96E4282C1D4181EDDFB1A44A598BFF5666F4B43E4B8BEA95A5",
    },
  ],
  "572": [
    {
      gaugeId: "1762",
      denom:
        "ibc/D805F1DA50D31B96E4282C1D4181EDDFB1A44A598BFF5666F4B43E4B8BEA95A5",
    },
    {
      gaugeId: "1763",
      denom:
        "ibc/D805F1DA50D31B96E4282C1D4181EDDFB1A44A598BFF5666F4B43E4B8BEA95A5",
    },
    {
      gaugeId: "1764",
      denom:
        "ibc/D805F1DA50D31B96E4282C1D4181EDDFB1A44A598BFF5666F4B43E4B8BEA95A5",
    },
  ],
  "573": [
    {
      gaugeId: "4362",
      denom:
        "ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452",
    },
    {
      gaugeId: "4363",
      denom:
        "ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452",
    },
    {
      gaugeId: "4364",
      denom:
        "ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452",
    },
  ],
  "574": [
    {
      gaugeId: "4365",
      denom:
        "ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452",
    },
    {
      gaugeId: "4366",
      denom:
        "ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452",
    },
    {
      gaugeId: "4367",
      denom:
        "ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452",
    },
  ],
  "577": [
    {
      gaugeId: "2088",
      denom:
        "ibc/B547DC9B897E7C3AA5B824696110B8E3D2C31E3ED3F02FF363DCBAD82457E07E",
    },
    {
      gaugeId: "2089",
      denom:
        "ibc/B547DC9B897E7C3AA5B824696110B8E3D2C31E3ED3F02FF363DCBAD82457E07E",
    },
    {
      gaugeId: "2090",
      denom:
        "ibc/B547DC9B897E7C3AA5B824696110B8E3D2C31E3ED3F02FF363DCBAD82457E07E",
    },
  ],
  "578": [
    {
      gaugeId: "2091",
      denom:
        "ibc/B547DC9B897E7C3AA5B824696110B8E3D2C31E3ED3F02FF363DCBAD82457E07E",
    },
    {
      gaugeId: "2092",
      denom:
        "ibc/B547DC9B897E7C3AA5B824696110B8E3D2C31E3ED3F02FF363DCBAD82457E07E",
    },
    {
      gaugeId: "2093",
      denom:
        "ibc/B547DC9B897E7C3AA5B824696110B8E3D2C31E3ED3F02FF363DCBAD82457E07E",
    },
  ],
  "584": [
    {
      gaugeId: "1861",
      denom:
        "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A",
    },
    {
      gaugeId: "1862",
      denom:
        "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A",
    },
    {
      gaugeId: "1863",
      denom:
        "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A",
    },
  ],
  "585": [
    {
      gaugeId: "1864",
      denom:
        "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A",
    },
    {
      gaugeId: "1865",
      denom:
        "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A",
    },
    {
      gaugeId: "1866",
      denom:
        "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A",
    },
  ],
  "586": [
    {
      gaugeId: "1885",
      denom:
        "ibc/3BCCC93AD5DF58D11A6F8A05FA8BC801CBA0BA61A981F57E91B8B598BF8061CB",
    },
    {
      gaugeId: "1886",
      denom:
        "ibc/3BCCC93AD5DF58D11A6F8A05FA8BC801CBA0BA61A981F57E91B8B598BF8061CB",
    },
    {
      gaugeId: "1887",
      denom:
        "ibc/3BCCC93AD5DF58D11A6F8A05FA8BC801CBA0BA61A981F57E91B8B598BF8061CB",
    },
  ],
  "587": [
    {
      gaugeId: "1888",
      denom:
        "ibc/3BCCC93AD5DF58D11A6F8A05FA8BC801CBA0BA61A981F57E91B8B598BF8061CB",
    },
    {
      gaugeId: "1889",
      denom:
        "ibc/3BCCC93AD5DF58D11A6F8A05FA8BC801CBA0BA61A981F57E91B8B598BF8061CB",
    },
    {
      gaugeId: "1890",
      denom:
        "ibc/3BCCC93AD5DF58D11A6F8A05FA8BC801CBA0BA61A981F57E91B8B598BF8061CB",
    },
  ],
  "592": [
    {
      gaugeId: "2588",
      denom:
        "ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452",
    },
    {
      gaugeId: "2589",
      denom:
        "ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452",
    },
    {
      gaugeId: "2590",
      denom:
        "ibc/4E5444C35610CC76FC94E7F7886B93121175C28262DDFDDE6F84E82BF2425452",
    },
  ],
  "600": [
    {
      gaugeId: "2278",
      denom:
        "ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0",
    },
    {
      gaugeId: "2279",
      denom:
        "ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0",
    },
  ],
  "601": [
    {
      gaugeId: "2276",
      denom:
        "ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0",
    },
    {
      gaugeId: "2277",
      denom:
        "ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0",
    },
  ],
  "5": [
    {
      gaugeId: "1900",
      denom:
        "ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84",
    },
    {
      gaugeId: "1901",
      denom:
        "ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84",
    },
    {
      gaugeId: "1902",
      denom:
        "ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84",
    },
  ],
  "6": [
    {
      gaugeId: "1903",
      denom:
        "ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84",
    },
    {
      gaugeId: "1904",
      denom:
        "ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84",
    },
    {
      gaugeId: "1905",
      denom:
        "ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84",
    },
  ],
  "602": [
    {
      gaugeId: "29713",
      denom:
        "ibc/7A08C6F11EF0F59EB841B9F788A87EC9F2361C7D9703157EC13D940DC53031FA",
    },
    {
      gaugeId: "29715",
      denom:
        "ibc/7A08C6F11EF0F59EB841B9F788A87EC9F2361C7D9703157EC13D940DC53031FA",
    },
  ],
  "604": [
    {
      gaugeId: "30130",
      denom:
        "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4",
    },
  ],
  "605": [
    {
      gaugeId: "1960",
      denom:
        "ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228",
    },
    {
      gaugeId: "1961",
      denom:
        "ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228",
    },
    {
      gaugeId: "1962",
      denom:
        "ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228",
    },
  ],
  "606": [
    {
      gaugeId: "1963",
      denom:
        "ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228",
    },
    {
      gaugeId: "1964",
      denom:
        "ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228",
    },
    {
      gaugeId: "1965",
      denom:
        "ibc/B9E0A1A524E98BB407D3CED8720EFEFD186002F90C1B1B7964811DD0CCC12228",
    },
  ],
  "611": [
    {
      gaugeId: "30131",
      denom:
        "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4",
    },
  ],
  "612": [
    {
      gaugeId: "2109",
      denom:
        "ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293",
    },
  ],
  "613": [
    {
      gaugeId: "29538",
      denom:
        "ibc/E7B35499CFBEB0FF5778127ABA4FB2C4B79A6B8D3D831D4379C4048C238796BD",
    },
    {
      gaugeId: "29537",
      denom:
        "ibc/E7B35499CFBEB0FF5778127ABA4FB2C4B79A6B8D3D831D4379C4048C238796BD",
    },
  ],
  "617": [
    {
      gaugeId: "29716",
      denom:
        "ibc/7A08C6F11EF0F59EB841B9F788A87EC9F2361C7D9703157EC13D940DC53031FA",
    },
    {
      gaugeId: "29717",
      denom:
        "ibc/7A08C6F11EF0F59EB841B9F788A87EC9F2361C7D9703157EC13D940DC53031FA",
    },
  ],
  "618": [
    {
      gaugeId: "2004",
      denom:
        "ibc/EA4C0A9F72E2CEDF10D0E7A9A6A22954DB3444910DB5BE980DF59B05A46DAD1C",
    },
    {
      gaugeId: "2005",
      denom:
        "ibc/EA4C0A9F72E2CEDF10D0E7A9A6A22954DB3444910DB5BE980DF59B05A46DAD1C",
    },
    {
      gaugeId: "2006",
      denom:
        "ibc/EA4C0A9F72E2CEDF10D0E7A9A6A22954DB3444910DB5BE980DF59B05A46DAD1C",
    },
  ],
  "619": [
    {
      gaugeId: "2007",
      denom:
        "ibc/EA4C0A9F72E2CEDF10D0E7A9A6A22954DB3444910DB5BE980DF59B05A46DAD1C",
    },
    {
      gaugeId: "2008",
      denom:
        "ibc/EA4C0A9F72E2CEDF10D0E7A9A6A22954DB3444910DB5BE980DF59B05A46DAD1C",
    },
    {
      gaugeId: "2009",
      denom:
        "ibc/EA4C0A9F72E2CEDF10D0E7A9A6A22954DB3444910DB5BE980DF59B05A46DAD1C",
    },
  ],
  "621": [
    {
      gaugeId: "2020",
      denom:
        "ibc/307E5C96C8F60D1CBEE269A9A86C0834E1DB06F2B3788AE4F716EDB97A48B97D",
    },
  ],
  "625": [
    {
      gaugeId: "29858",
      denom:
        "ibc/E97634A40119F1898989C2A23224ED83FDD0A57EA46B3A094E287288D1672B44",
    },
  ],
  "629": [
    {
      gaugeId: "2067",
      denom:
        "ibc/8318FD63C42203D16DDCAF49FE10E8590669B3219A3E87676AC9DA50722687FB",
    },
    {
      gaugeId: "2068",
      denom:
        "ibc/8318FD63C42203D16DDCAF49FE10E8590669B3219A3E87676AC9DA50722687FB",
    },
    {
      gaugeId: "2069",
      denom:
        "ibc/8318FD63C42203D16DDCAF49FE10E8590669B3219A3E87676AC9DA50722687FB",
    },
  ],
  "633": [
    {
      gaugeId: "29857",
      denom:
        "ibc/E97634A40119F1898989C2A23224ED83FDD0A57EA46B3A094E287288D1672B44",
    },
  ],
  "634": [
    {
      gaugeId: "29856",
      denom:
        "ibc/E97634A40119F1898989C2A23224ED83FDD0A57EA46B3A094E287288D1672B44",
    },
  ],
  "637": [
    {
      gaugeId: "2258",
      denom:
        "ibc/346786EA82F41FE55FAD14BF69AD8BA9B36985406E43F3CB23E6C45A285A9593",
    },
    {
      gaugeId: "2259",
      denom:
        "ibc/346786EA82F41FE55FAD14BF69AD8BA9B36985406E43F3CB23E6C45A285A9593",
    },
    {
      gaugeId: "2260",
      denom:
        "ibc/346786EA82F41FE55FAD14BF69AD8BA9B36985406E43F3CB23E6C45A285A9593",
    },
  ],
  "638": [
    {
      gaugeId: "2261",
      denom:
        "ibc/346786EA82F41FE55FAD14BF69AD8BA9B36985406E43F3CB23E6C45A285A9593",
    },
    {
      gaugeId: "2262",
      denom:
        "ibc/346786EA82F41FE55FAD14BF69AD8BA9B36985406E43F3CB23E6C45A285A9593",
    },
    {
      gaugeId: "2263",
      denom:
        "ibc/346786EA82F41FE55FAD14BF69AD8BA9B36985406E43F3CB23E6C45A285A9593",
    },
  ],
  "641": [
    {
      gaugeId: "2925",
      denom:
        "ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C",
    },
    {
      gaugeId: "2926",
      denom:
        "ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C",
    },
    {
      gaugeId: "2927",
      denom:
        "ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C",
    },
  ],
  "642": [
    {
      gaugeId: "2269",
      denom:
        "ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C",
    },
    {
      gaugeId: "2270",
      denom:
        "ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C",
    },
    {
      gaugeId: "2271",
      denom:
        "ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C",
    },
  ],
  "643": [
    {
      gaugeId: "2928",
      denom:
        "ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C",
    },
    {
      gaugeId: "2929",
      denom:
        "ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C",
    },
    {
      gaugeId: "2930",
      denom:
        "ibc/67795E528DF67C5606FC20F824EA39A6EF55BA133F4DC79C90A8C47A0901E17C",
    },
  ],
  "648": [
    {
      gaugeId: "3352",
      denom:
        "ibc/8061A06D3BD4D52C4A28FFECF7150D370393AF0BA661C3776C54FF32836C3961",
    },
  ],
  "649": [
    {
      gaugeId: "3304",
      denom:
        "ibc/F6B691D5F7126579DDC87357B09D653B47FDCE0A3383FF33C8D8B544FE29A8A6",
    },
    {
      gaugeId: "3303",
      denom:
        "ibc/DB9755CB6FE55192948AE074D18FA815E1429D3D374D5BDA8D89623C6CF235C3",
    },
  ],
  "651": [
    {
      gaugeId: "2547",
      denom:
        "ibc/8FEFAE6AECF6E2A255585617F781F35A8D5709A545A804482A261C0C9548A9D3",
    },
    {
      gaugeId: "2548",
      denom:
        "ibc/8FEFAE6AECF6E2A255585617F781F35A8D5709A545A804482A261C0C9548A9D3",
    },
    {
      gaugeId: "2549",
      denom:
        "ibc/8FEFAE6AECF6E2A255585617F781F35A8D5709A545A804482A261C0C9548A9D3",
    },
  ],
  "653": [
    {
      gaugeId: "3048",
      denom:
        "ibc/C2A2E9CA95DDD4828B75124B5E27B8401C7D8493BC48353D418CBFC04565899B",
    },
  ],
  "662": [
    {
      gaugeId: "29666",
      denom:
        "ibc/41999DF04D9441DAC0DF5D8291DF4333FBCBA810FFD63FDCE34FDF41EF37B6F7",
    },
    {
      gaugeId: "29667",
      denom:
        "ibc/41999DF04D9441DAC0DF5D8291DF4333FBCBA810FFD63FDCE34FDF41EF37B6F7",
    },
  ],
  "669": [
    {
      gaugeId: "2962",
      denom:
        "ibc/6BDB4C8CCD45033F9604E4B93ED395008A753E01EECD6992E7D1EA23D9D3B788",
    },
    {
      gaugeId: "2963",
      denom:
        "ibc/6BDB4C8CCD45033F9604E4B93ED395008A753E01EECD6992E7D1EA23D9D3B788",
    },
    {
      gaugeId: "2964",
      denom:
        "ibc/6BDB4C8CCD45033F9604E4B93ED395008A753E01EECD6992E7D1EA23D9D3B788",
    },
  ],
  "670": [
    {
      gaugeId: "4374",
      denom:
        "ibc/E97634A40119F1898989C2A23224ED83FDD0A57EA46B3A094E287288D1672B44",
    },
    {
      gaugeId: "4375",
      denom:
        "ibc/E97634A40119F1898989C2A23224ED83FDD0A57EA46B3A094E287288D1672B44",
    },
  ],
  "678": [
    {
      gaugeId: "3013",
      denom: "uosmo",
    },
  ],
  "679": [
    {
      gaugeId: "3016",
      denom: "uosmo",
    },
  ],
  "690": [
    {
      gaugeId: "4350",
      denom:
        "ibc/CBA34207E969623D95D057D9B11B0C8B32B89A71F170577D982FDDE623813FFC",
    },
    {
      gaugeId: "4349",
      denom:
        "ibc/CBA34207E969623D95D057D9B11B0C8B32B89A71F170577D982FDDE623813FFC",
    },
  ],
  "701": [
    {
      gaugeId: "3916",
      denom:
        "ibc/67C89B8B0A70C08F093C909A4DD996DD10E0494C87E28FD9A551697BF173D4CA",
    },
    {
      gaugeId: "3915",
      denom:
        "ibc/67C89B8B0A70C08F093C909A4DD996DD10E0494C87E28FD9A551697BF173D4CA",
    },
    {
      gaugeId: "3910",
      denom:
        "ibc/67C89B8B0A70C08F093C909A4DD996DD10E0494C87E28FD9A551697BF173D4CA",
    },
  ],
  "716": [
    {
      gaugeId: "4303",
      denom:
        "ibc/AA1C80225BCA7B32ED1FC6ABF8B8E899BEB48ECDB4B417FD69873C6D715F97E7",
    },
  ],
  "717": [
    {
      gaugeId: "4302",
      denom:
        "ibc/AA1C80225BCA7B32ED1FC6ABF8B8E899BEB48ECDB4B417FD69873C6D715F97E7",
    },
  ],
  "719": [
    {
      gaugeId: "3528",
      denom:
        "ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293",
    },
    {
      gaugeId: "4520",
      denom:
        "ibc/A0CC0CF735BFB30E730C70019D4218A1244FF383503FF7579C9201AB93CA9293",
    },
  ],
  "747": [
    {
      gaugeId: "4700",
      denom:
        "ibc/49C2B2C444B7C5F0066657A4DBF19D676E0D185FF721CFD3E14FA253BCB9BC04",
    },
  ],
  "748": [
    {
      gaugeId: "21736",
      denom:
        "ibc/49C2B2C444B7C5F0066657A4DBF19D676E0D185FF721CFD3E14FA253BCB9BC04",
    },
  ],
  "722": [
    {
      gaugeId: "29822",
      denom:
        "ibc/6AE98883D4D5D5FF9E50D7130F1305DA2FFA0C652D1DD9C123657C6B4EB2DF8A",
    },
  ],
  "769": [
    {
      gaugeId: "29464",
      denom:
        "ibc/1E09CB0F506ACF12FDE4683FB6B34DA62FB4BE122641E0D93AAF98A87675676C",
    },
  ],
  "777": [
    {
      gaugeId: "21813",
      denom:
        "ibc/C360EF34A86D334F625E4CBB7DA3223AEA97174B61F35BB3758081A8160F7D9B",
    },
    {
      gaugeId: "21814",
      denom:
        "ibc/C360EF34A86D334F625E4CBB7DA3223AEA97174B61F35BB3758081A8160F7D9B",
    },
    {
      gaugeId: "29459",
      denom:
        "ibc/9B6FBABA36BB4A3BF127AE5E96B572A5197FD9F3111D895D8919B07BC290764A",
    },
    {
      gaugeId: "29460",
      denom:
        "ibc/9B6FBABA36BB4A3BF127AE5E96B572A5197FD9F3111D895D8919B07BC290764A",
    },
    {
      gaugeId: "29461",
      denom:
        "ibc/9B6FBABA36BB4A3BF127AE5E96B572A5197FD9F3111D895D8919B07BC290764A",
    },
    {
      gaugeId: "29611",
      denom:
        "ibc/0CD46223FEABD2AEAAAF1F057D01E63BCA79B7D4BD6B68F1EB973A987344695D",
    },
  ],
  "778": [
    {
      gaugeId: "21818",
      denom:
        "ibc/52C57FCA7D6854AA178E7A183DDBE4EF322B904B1D719FC485F6FFBC1F72A19E",
    },
    {
      gaugeId: "21820",
      denom:
        "ibc/52C57FCA7D6854AA178E7A183DDBE4EF322B904B1D719FC485F6FFBC1F72A19E",
    },
    {
      gaugeId: "21821",
      denom:
        "ibc/52C57FCA7D6854AA178E7A183DDBE4EF322B904B1D719FC485F6FFBC1F72A19E",
    },
    {
      gaugeId: "21818",
      denom:
        "ibc/7C781B4C2082CD62129A972D47486D78EC17155C299270E3C89348EA026BEAF8",
    },
    {
      gaugeId: "21820",
      denom:
        "ibc/7C781B4C2082CD62129A972D47486D78EC17155C299270E3C89348EA026BEAF8",
    },
    {
      gaugeId: "21821",
      denom:
        "ibc/7C781B4C2082CD62129A972D47486D78EC17155C299270E3C89348EA026BEAF8",
    },
  ],
  "787": [
    {
      gaugeId: "29462",
      denom:
        "ibc/9B6FBABA36BB4A3BF127AE5E96B572A5197FD9F3111D895D8919B07BC290764A",
    },
  ],
  "788": [
    {
      gaugeId: "29872",
      denom:
        "ibc/FFA652599C77E853F017193E36B5AB2D4D9AFC4B54721A74904F80C9236BF3B7",
    },
    {
      gaugeId: "29892",
      denom:
        "ibc/FFA652599C77E853F017193E36B5AB2D4D9AFC4B54721A74904F80C9236BF3B7",
    },
    {
      gaugeId: "29893",
      denom:
        "ibc/FFA652599C77E853F017193E36B5AB2D4D9AFC4B54721A74904F80C9236BF3B7",
    },
  ],
  "790": [
    {
      gaugeId: "29508",
      denom:
        "ibc/7C781B4C2082CD62129A972D47486D78EC17155C299270E3C89348EA026BEAF8",
    },
    {
      gaugeId: "29509",
      denom:
        "ibc/7C781B4C2082CD62129A972D47486D78EC17155C299270E3C89348EA026BEAF8",
    },
    {
      gaugeId: "29510",
      denom:
        "ibc/7C781B4C2082CD62129A972D47486D78EC17155C299270E3C89348EA026BEAF8",
    },
    {
      gaugeId: "29508",
      denom:
        "ibc/52C57FCA7D6854AA178E7A183DDBE4EF322B904B1D719FC485F6FFBC1F72A19E",
    },
    {
      gaugeId: "29509",
      denom:
        "ibc/52C57FCA7D6854AA178E7A183DDBE4EF322B904B1D719FC485F6FFBC1F72A19E",
    },
    {
      gaugeId: "29510",
      denom:
        "ibc/52C57FCA7D6854AA178E7A183DDBE4EF322B904B1D719FC485F6FFBC1F72A19E",
    },
  ],
  "793": [
    {
      gaugeId: "29949",
      denom:
        "ibc/18A676A074F73B9B42DA4F9DFC8E5AEF334C9A6636DDEC8D34682F52F1DECDF6",
    },
  ],
  "796": [
    {
      gaugeId: "29545",
      denom:
        "ibc/E09ED39F390EC51FA9F3F69BEA08B5BBE6A48B3057B2B1C3467FAAE9E58B021B",
    },
  ],
  "803": [
    {
      gaugeId: "30074",
      denom:
        "ibc/A8CA5EE328FA10C9519DF6057DA1F69682D28F7D0F5CCC7ECB72E3DCA2D157A4",
    },
    {
      gaugeId: "30230",
      denom:
        "ibc/A8CA5EE328FA10C9519DF6057DA1F69682D28F7D0F5CCC7ECB72E3DCA2D157A4",
    },
  ],
  "805": [
    {
      gaugeId: "29615",
      denom:
        "ibc/0CD46223FEABD2AEAAAF1F057D01E63BCA79B7D4BD6B68F1EB973A987344695D",
    },
  ],
  "810": [
    {
      gaugeId: "30231",
      denom:
        "ibc/A8CA5EE328FA10C9519DF6057DA1F69682D28F7D0F5CCC7ECB72E3DCA2D157A4",
    },
    {
      gaugeId: "30104",
      denom:
        "ibc/A8CA5EE328FA10C9519DF6057DA1F69682D28F7D0F5CCC7ECB72E3DCA2D157A4",
    },
  ],
  "807": [
    {
      gaugeId: "29950",
      denom:
        "ibc/18A676A074F73B9B42DA4F9DFC8E5AEF334C9A6636DDEC8D34682F52F1DECDF6",
    },
  ],
  "808": [
    {
      gaugeId: "29951",
      denom:
        "ibc/18A676A074F73B9B42DA4F9DFC8E5AEF334C9A6636DDEC8D34682F52F1DECDF6",
    },
  ],
  "812": [
    {
      gaugeId: "29675",
      denom:
        "ibc/903A61A498756EA560B85A85132D3AEE21B5DEDD41213725D22ABF276EA6945E",
    },
    {
      gaugeId: "29674",
      denom: "uosmo",
    },
  ],
  "806": [
    {
      gaugeId: "29683",
      denom: "uosmo",
    },
  ],
  "813": [
    {
      gaugeId: "29945",
      denom:
        "ibc/A1AC7F9EE2F643A68E3A35BCEB22040120BEA4059773BB56985C76BDFEBC71D9",
    },
    {
      gaugeId: "29946",
      denom:
        "ibc/A1AC7F9EE2F643A68E3A35BCEB22040120BEA4059773BB56985C76BDFEBC71D9",
    },
    {
      gaugeId: "29947",
      denom:
        "ibc/A1AC7F9EE2F643A68E3A35BCEB22040120BEA4059773BB56985C76BDFEBC71D9",
    },
  ],
  "816": [
    {
      gaugeId: "29758",
      denom:
        "ibc/EB7FB9C8B425F289B63703413327C2051030E848CE4EAAEA2E51199D6D39D3EC",
    },
    {
      gaugeId: "29759",
      denom:
        "ibc/EB7FB9C8B425F289B63703413327C2051030E848CE4EAAEA2E51199D6D39D3EC",
    },
    {
      gaugeId: "29760",
      denom:
        "ibc/EB7FB9C8B425F289B63703413327C2051030E848CE4EAAEA2E51199D6D39D3EC",
    },
  ],
  "817": [
    {
      gaugeId: "29965",
      denom:
        "ibc/A8CA5EE328FA10C9519DF6057DA1F69682D28F7D0F5CCC7ECB72E3DCA2D157A4",
    },
    {
      gaugeId: "30144",
      denom:
        "ibc/A8CA5EE328FA10C9519DF6057DA1F69682D28F7D0F5CCC7ECB72E3DCA2D157A4",
    },
  ],
  "818": [
    {
      gaugeId: "29853",
      denom:
        "ibc/E97634A40119F1898989C2A23224ED83FDD0A57EA46B3A094E287288D1672B44",
    },
  ],
  "826": [
    {
      gaugeId: "30102",
      denom:
        "ibc/80825E8F04B12D914ABEADB1F4D39C04755B12C8402F6876EE3168450C0A90BB",
    },
    {
      gaugeId: "30103",
      denom:
        "ibc/80825E8F04B12D914ABEADB1F4D39C04755B12C8402F6876EE3168450C0A90BB",
    },
  ],
  "830": [
    {
      gaugeId: "29891",
      denom:
        "ibc/608EF5C0CE64FEA097500DB39657BDD36CA708CC5DCC2E250A024B6981DD36BC",
    },
  ],
  "832": [
    {
      gaugeId: "29882",
      denom:
        "ibc/8E697BDABE97ACE8773C6DF7402B2D1D5104DD1EEABE12608E3469B7F64C15BA",
    },
  ],
  "833": [
    {
      gaugeId: "29900",
      denom:
        "ibc/A8CA5EE328FA10C9519DF6057DA1F69682D28F7D0F5CCC7ECB72E3DCA2D157A4",
    },
    {
      gaugeId: "30124",
      denom:
        "ibc/A8CA5EE328FA10C9519DF6057DA1F69682D28F7D0F5CCC7ECB72E3DCA2D157A4",
    },
  ],
  "837": [
    {
      gaugeId: "29948",
      denom:
        "ibc/2DA9C149E9AD2BD27FEFA635458FB37093C256C1A940392634A16BEA45262604",
    },
  ],
  "856": [
    {
      gaugeId: "30210",
      denom:
        "ibc/C822645522FC3EECF817609AA38C24B64D04F5C267A23BCCF8F2E3BC5755FA88",
    },
    {
      gaugeId: "30246",
      denom:
        "ibc/C822645522FC3EECF817609AA38C24B64D04F5C267A23BCCF8F2E3BC5755FA88",
    },
    {
      gaugeId: "30247",
      denom:
        "ibc/C822645522FC3EECF817609AA38C24B64D04F5C267A23BCCF8F2E3BC5755FA88",
    }
  ],
  "858": [
    {
      gaugeId: "30150",
      denom:
        "ibc/BB936517F7E5D77A63E0ADB05217A6608B0C4CF8FBA7EA2F4BAE4107A7238F06",
    },
    {
      gaugeId: "30151",
      denom:
        "ibc/BB936517F7E5D77A63E0ADB05217A6608B0C4CF8FBA7EA2F4BAE4107A7238F06",
    },
    {
      gaugeId: "30152",
      denom:
        "ibc/BB936517F7E5D77A63E0ADB05217A6608B0C4CF8FBA7EA2F4BAE4107A7238F06",
    },
  ],
};
