import { DenomHelper } from "@keplr-wallet/common";
import { IntermediateRoute } from "@osmosis-labs/stores";

/** Used to map pool IDs to spot price info from CoinGecko. */
export const PoolPriceRoutes: IntermediateRoute[] = [
  {
    alternativeCoinId: "pool:uosmo",
    poolId: "1",
    spotPriceSourceDenom: "uosmo",
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-0" }],
      "uatom"
    ),
    destCoinId: "cosmos",
  },
  {
    alternativeCoinId: "pool:uion",
    poolId: "2",
    spotPriceSourceDenom: "uion",
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:uregen",
    poolId: "21",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-8" }],
      "uregen"
    ),
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-0" }],
      "uatom"
    ),
    destCoinId: "cosmos",
  },
  {
    alternativeCoinId: "pool:ujuno",
    poolId: "498",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-42" }],
      "ujuno"
    ),
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-0" }],
      "uatom"
    ),
    destCoinId: "cosmos",
  },
  {
    alternativeCoinId: "pool:uixo",
    poolId: "558",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-38" }],
      "uixo"
    ),
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-0" }],
      "uatom"
    ),
    destCoinId: "cosmos",
  },
  {
    alternativeCoinId: "pool:ubtsg",
    poolId: "573",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-73" }],
      "ubtsg"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:uxki",
    poolId: "577",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-77" }],
      "uxki"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:ustars",
    poolId: "604",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-75" }],
      "ustars"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:uhuahua",
    poolId: "606",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-113" }],
      "uhuahua"
    ),
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-0" }],
      "uatom"
    ),
    destCoinId: "cosmos",
  },
  {
    alternativeCoinId: "pool:ulum",
    poolId: "608",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-115" }],
      "ulum"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:udsm",
    poolId: "618",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-135" }],
      "udsm"
    ),
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-0" }],
      "uatom"
    ),
    destCoinId: "cosmos",
  },
  {
    alternativeCoinId: "pool:udig",
    poolId: "621",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-128" }],
      "udig"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:ugraviton",
    poolId: "625",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-144" }],
      "ugraviton"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:usomm",
    poolId: "627",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-165" }],
      "usomm"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:udarc",
    poolId: "637",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-171" }],
      "udarc"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:neta",
    poolId: "631",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:marble",
    poolId: "649",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:uumee",
    poolId: "641",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-184" }],
      "uumee"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:pstake",
    poolId: "648",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [
        { portId: "transfer", channelId: "channel-4" },
        { portId: "transfer", channelId: "channel-38" },
      ],
      "gravity0xfB5c6815cA3AC72Ce9F5006869AE67f18bF77006"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:crbrus",
    poolId: "662",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-212" }],
      "ucrbrus"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:uustc",
    poolId: "560",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-72" }],
      "uusd"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:ulunc",
    poolId: "561",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-72" }],
      "uluna"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:umntl",
    poolId: "690",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-232" }],
      "umntl"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:umeme",
    poolId: "701",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-238" }],
      "umeme"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:utick",
    poolId: "547",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-39" }],
      "utick"
    ),
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-0" }],
      "uatom"
    ),
    destCoinId: "cosmos",
  },
  {
    alternativeCoinId: "pool:hope",
    poolId: "653",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:rac",
    poolId: "669",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:block",
    poolId: "691",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:nhash",
    poolId: "693",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-222" }],
      "nhash"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:uglx",
    poolId: "697",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-236" }],
      "uglx"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:dhk",
    poolId: "695",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:raw",
    poolId: "700",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:asvt",
    poolId: "716",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno17wzaxtfdw5em7lc94yed4ylgjme63eh73lm3lutp2rhcxttyvpwsypjm4w"
    ),
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-47" }],
      "rowan"
    ),
    destCoinId: "sifchain",
  },
  {
    alternativeCoinId: "pool:joe",
    poolId: "718",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:glto",
    poolId: "778",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:gkey",
    poolId: "790",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1gz8cf86zr4vw9cjcyyv432vgdaecvr9n254d3uwwkx9rermekddsxzageh"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:odin",
    poolId: "777",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-258" }],
      "loki"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:utgd",
    poolId: "769",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-263" }],
      "utgd"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:ucre",
    poolId: "786",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-297" }],
      "ucre"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:geo",
    poolId: "787",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-258" }],
      "mGeo"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:gkey",
    poolId: "790",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1gz8cf86zr4vw9cjcyyv432vgdaecvr9n254d3uwwkx9rermekddsxzageh"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:stuatom",
    poolId: "803",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-326" }],
      "stuatom"
    ),
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-0" }],
      "uatom"
    ),
    destCoinId: "cosmos",
  },
  {
    alternativeCoinId: "pool:o9w",
    poolId: "805",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-258" }],
      "mO9W"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:ustrd",
    poolId: "806",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-326" }],
      "ustrd"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:stustars",
    poolId: "810",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-326" }],
      "stustars"
    ),
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-75" }],
      "ustars"
    ),
    destCoinId: "stargaze",
  },
  {
    alternativeCoinId: "pool:sejuno",
    poolId: "793",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1dd0k0um5rqncfueza62w9sentdfh3ec4nw4aq4lk5hkjl63vljqscth9gv"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:seasy",
    poolId: "808",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno19rqljkh95gh40s7qdx40ksx3zq5tm4qsmsrdz9smw668x9zdr3lqtg33mf"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:arebus",
    poolId: "813",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-355" }],
      "arebus"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:uaxl",
    poolId: "812",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-208" }],
      "uaxl"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },
  {
    alternativeCoinId: "pool:utori",
    poolId: "816",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-362" }],
      "utori"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "osmosis",
  },

];
