import { DenomHelper } from "@keplr-wallet/common";
import { IntermediateRoute } from "@osmosis-labs/stores";

/** Used to map pool IDs to spot price info from CoinGecko or local Osmosis pools' spot prices. */
export const PoolPriceRoutes: IntermediateRoute[] = [
  {
    alternativeCoinId: "pool:uosmo",
    poolId: "678",
    spotPriceSourceDenom: "uosmo",
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-208" }],
      "uusdc"
    ),
    destCoinId: "usd-coin",
  },
  {
    alternativeCoinId: "pool:uion",
    poolId: "2",
    spotPriceSourceDenom: "uion",
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:uatom",
    poolId: "1",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-0" }],
      "uatom"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:uscrt",
    poolId: "584",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-88" }],
      "uscrt"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:uakt",
    poolId: "3",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-1" }],
      "uakt"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:uregen",
    poolId: "42",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-8" }],
      "uregen"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:nct",
    poolId: "956",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-8" }],
      "eco.uC.NCT"
    ),
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-8" }],
      "uregen"
    ),
    destCoinId: "pool:uregen",
  },
  {
    alternativeCoinId: "pool:udvpn",
    poolId: "5",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-2" }],
      "udvpn"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:uxprt",
    poolId: "15",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-4" }],
      "uxprt"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:stk/uatom",
    poolId: "886",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-4" }],
      "stk/uatom"
    ),
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-0" }],
      "uatom"
    ),
    destCoinId: "pool:uatom",
  },
  {
    alternativeCoinId: "pool:uiris",
    poolId: "7",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-6" }],
      "uiris"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:basecro",
    poolId: "9",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-5" }],
      "basecro"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:uiov",
    poolId: "197",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-15" }],
      "uiov"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:eeur",
    poolId: "481",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-37" }],
      "eeur"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:ungm",
    poolId: "463",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-37" }],
      "ungm"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:ujuno",
    poolId: "497",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-42" }],
      "ujuno"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:nanolike",
    poolId: "553",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-53" }],
      "nanolike"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:ubcna",
    poolId: "571",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-51" }],
      "ubcna"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:uixo",
    poolId: "557",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-38" }],
      "uixo"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:ubtsg",
    poolId: "573",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-73" }],
      "ubtsg"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
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
    alternativeCoinId: "pool:lvn",
    poolId: "774",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-77" }],
      "cw20:ki1dt3lk455ed360pna38fkhqn0p8y44qndsr77qu73ghyaz2zv4whq83mwdy"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:umed",
    poolId: "586",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-82" }],
      "umed"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:boot",
    poolId: "597",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-95" }],
      "boot"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:ucmdx",
    poolId: "601",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-87" }],
      "ucmdx"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:ucmst",
    poolId: "857",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-87" }],
      "ucmst"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:ncheq",
    poolId: "602",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-108" }],
      "ncheq"
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
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:uhuahua",
    poolId: "605",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-113" }],
      "uhuahua"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:ulum",
    poolId: "608",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-115" }],
      "ulum"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:uvdl",
    poolId: "613",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-124" }],
      "uvdl"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:udsm",
    poolId: "619",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-135" }],
      "udsm"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:udig",
    poolId: "621",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-128" }],
      "udig"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:ugraviton",
    poolId: "625",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-144" }],
      "ugraviton"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:usomm",
    poolId: "627",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-165" }],
      "usomm"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:uband",
    poolId: "626",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-148" }],
      "uband"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:udarc",
    poolId: "637",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-171" }],
      "udarc"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:neta",
    poolId: "631",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno168ctmpyppk90d34p3jjy658zf5a5l3w8wk35wht6ccqj4mr0yv8s4j5awr"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:marble",
    poolId: "649",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1g2g7ucurum66d42g8k5twk34yegdq8c82858gz0tq2fc75zy7khssgnhjl"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:uumee",
    poolId: "641",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-184" }],
      "uumee"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:udec",
    poolId: "644",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-181" }],
      "udec"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:swth",
    poolId: "651",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-188" }],
      "swth"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:inj",
    poolId: "725",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-122" }],
      "inj"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
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
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:ucrbrus",
    poolId: "662",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-212" }],
      "ucrbrus"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:afet",
    poolId: "681",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-229" }],
      "afet"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:uustc",
    poolId: "560",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-72" }],
      "uusd"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:ulunc",
    poolId: "800",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-72" }],
      "uluna"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:umntl",
    poolId: "690",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-232" }],
      "umntl"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:umeme",
    poolId: "701",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-238" }],
      "umeme"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
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
    destCoinId: "pool:uatom",
  },
  {
    alternativeCoinId: "pool:hope",
    poolId: "653",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1re3x67ppxap48ygndmrc7har2cnc7tcxtm9nplcas4v0gc3wnmvs3s807z"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:rac",
    poolId: "669",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1r4pzw8f9z0sypct5l9j906d47z998ulwvhvqe5xdwgy8wf84583sxwh0pa"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:block",
    poolId: "691",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1y9rf7ql6ffwkv02hsgd4yruz23pn4w97p75e2slsnkm0mnamhzysvqnxaq"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:nhash",
    poolId: "693",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-222" }],
      "nhash"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:uglx",
    poolId: "697",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-236" }],
      "uglx"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:aevmos",
    poolId: "722",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-204" }],
      "aevmos"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:uluna",
    poolId: "726",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-251" }],
      "uluna"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:ukava",
    poolId: "730",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-143" }],
      "ukava"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:el1",
    poolId: "732",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-253" }],
      "el1"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:ukuji",
    poolId: "744",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-259" }],
      "ukuji"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:ulumen",
    poolId: "788",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-286" }],
      "ulumen"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:acudos",
    poolId: "796",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-298" }],
      "acudos"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:dhk",
    poolId: "695",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1tdjwrqmnztn2j3sj2ln9xnyps5hs48q3ddwjrz7jpv6mskappjys5czd49"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:raw",
    poolId: "700",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno15u3dt79t6sxxa3x3kpkhzsy56edaa5a66wvt3kxmukqjz2sx0hes5sn38g"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
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
    destCoinId: "pool:rowan",
  },
  {
    alternativeCoinId: "pool:joe",
    poolId: "718",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1n7n7d5088qlzlj37e9mgmkhx6dfgtvt02hqxq66lcap4dxnzdhwqfmgng3"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:glto",
    poolId: "778",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1j0a9ymgngasfn3l5me8qpd53l5zlm9wurfdk7r65s5mg6tkxal3qpgf5se"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:gkey",
    poolId: "790",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1gz8cf86zr4vw9cjcyyv432vgdaecvr9n254d3uwwkx9rermekddsxzageh"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:odin",
    poolId: "777",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-258" }],
      "loki"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:utgd",
    poolId: "769",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-263" }],
      "utgd"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:aechelon",
    poolId: "848",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-403" }],
      "aechelon"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:ucre",
    poolId: "786",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-297" }],
      "ucre"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:geo",
    poolId: "787",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-258" }],
      "mGeo"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
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
    destCoinId: "pool:uatom",
  },
  {
    alternativeCoinId: "pool:o9w",
    poolId: "805",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-258" }],
      "mO9W"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:ustrd",
    poolId: "806",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-326" }],
      "ustrd"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
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
    destCoinId: "pool:ustars",
  },
  {
    alternativeCoinId: "pool:sejuno",
    poolId: "793",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1dd0k0um5rqncfueza62w9sentdfh3ec4nw4aq4lk5hkjl63vljqscth9gv"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:seasy",
    poolId: "808",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno19rqljkh95gh40s7qdx40ksx3zq5tm4qsmsrdz9smw668x9zdr3lqtg33mf"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:arebus",
    poolId: "813",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-355" }],
      "arebus"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:uaxl",
    poolId: "812",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-208" }],
      "uaxl"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:utori",
    poolId: "816",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-362" }],
      "utori"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:stujuno",
    poolId: "817",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-326" }],
      "stujuno"
    ),
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-42" }],
      "ujuno"
    ),
    destCoinId: "pool:ujuno",
  },
  {
    alternativeCoinId: "pool:stuosmo",
    poolId: "833",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-326" }],
      "stuosmo"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:stuluna",
    poolId: "913",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-326" }],
      "stuluna"
    ),
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-251" }],
      "uluna"
    ),
    destCoinId: "pool:uluna",
  },
  {
    alternativeCoinId: "pool:staevmos",
    poolId: "922",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-326" }],
      "staevmos"
    ),
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-204" }],
      "aevmos"
    ),
    destCoinId: "pool:aevmos",
  },
  {
    alternativeCoinId: "pool:rowan",
    poolId: "629",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-47" }],
      "rowan"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:lambda",
    poolId: "826",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-378" }],
      "ulamb"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:nund",
    poolId: "830",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-382" }],
      "nund"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:jkl",
    poolId: "832",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-412" }],
      "ujkl"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:ubld",
    poolId: "795",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-320" }],
      "ubld"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:uist",
    poolId: "837",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-320" }],
      "uist"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:uusdc.grv",
    poolId: "633",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-144" }],
      "gravity0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:uusdt.grv",
    poolId: "818",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-144" }],
      "gravity0xdAC17F958D2ee523a2206206994597C13D831ec7"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:dai-wei",
    poolId: "674",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-208" }],
      "dai-wei"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:weth-wei",
    poolId: "704",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-208" }],
      "weth-wei"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:weth-wei.grv",
    poolId: "634",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-144" }],
      "gravity0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:wbtc-satoshi",
    poolId: "712",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-208" }],
      "wbtc-satoshi"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:link-wei",
    poolId: "731",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-208" }],
      "link-wei"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:mkr-wei",
    poolId: "733",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-208" }],
      "mkr-wei"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:ubze",
    poolId: "856",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-340" }],
      "ubze"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:aimv",
    poolId: "866",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-517" }],
      "aimv"
    ),
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-208" }],
      "uusdc"
    ),
    destCoinId: "usd-coin",
  },
  {
    alternativeCoinId: "pool:umedas",
    poolId: "859",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-519" }],
      "umedas"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:aacre",
    poolId: "858",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-490" }],
      "aacre"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:anom",
    poolId: "882",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-525" }],
      "anom"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:dys",
    poolId: "905",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-526" }],
      "dys"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c",
    poolId: "895",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-490" }],
      "erc20/0x2Cbea61fdfDFA520Ee99700F104D5b75ADf50B0c"
    ),
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-208" }],
      "uusdc"
    ),
    destCoinId: "usd-coin",
  },
  {
    alternativeCoinId: "pool:aplanq",
    poolId: "898",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-492" }],
      "aplanq"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:acanto",
    poolId: "901",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-550" }],
      "acanto"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:uqck",
    poolId: "952",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-522" }],
      "uqck"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:uqstars",
    poolId: "903",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-522" }],
      "uqstars"
    ),
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-75" }],
      "ustars"
    ),
    destCoinId: "pool:ustars",
  },
  {
    alternativeCoinId: "pool:uqatom",
    poolId: "944",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-522" }],
      "uqatom"
    ),
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-0" }],
      "uatom"
    ),
    destCoinId: "pool:uatom",
  },
  {
    alternativeCoinId: "pool:uqregen",
    poolId: "948",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-522" }],
      "uqregen"
    ),
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-8" }],
      "uregen"
    ),
    destCoinId: "pool:uregen",
  },
  {
    alternativeCoinId: "pool:wftm-wei",
    poolId: "900",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-208" }],
      "wftm-wei"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:hopers",
    poolId: "894",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1u45shlp0q4gcckvsj06ss4xuvsu0z24a0d0vr9ce6r24pht4e5xq7q995n"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:wynd",
    poolId: "902",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:mars",
    poolId: "907",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-557" }],
      "umars"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:erc20/0xAE6D3334989a22A65228732446731438672418F2",
    poolId: "909",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-490" }],
      "erc20/0xAE6D3334989a22A65228732446731438672418F2"
    ),
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-208" }],
      "uusdc"
    ),
    destCoinId: "usd-coin",
  },
  {
    alternativeCoinId: "pool:wbnbwei.axl",
    poolId: "840",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-208" }],
      "wbnb-wei"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:wavaxwei.axl",
    poolId: "899",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-208" }],
      "wavax-wei"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:busdwei.axl",
    poolId: "877",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-208" }],
      "busd-wei"
    ),
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-208" }],
      "uusdc"
    ),
    destCoinId: "usd-coin",
  },
  {
    alternativeCoinId: "pool:dotplanck.axl",
    poolId: "773",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-208" }],
      "dot-planck"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:wmaticwei.axl",
    poolId: "789",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-208" }],
      "wmatic-wei"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:alter",
    poolId: "845",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-476" }],
      "cw20:secret12rcvz0umvk875kd6a803txhtlu7y0pnd73kcej"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:orai",
    poolId: "799",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-216" }],
      "orai"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:phmn",
    poolId: "867",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1rws84uz7969aaa7pej303udhlkt3j9ca0l3egpcae98jwak9quzq8szn2l"
    ),
    spotPriceDestDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-0" }],
      "uatom"
    ),
    destCoinId: "pool:uatom",
  },
  {
    alternativeCoinId: "pool:shd",
    poolId: "846",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-476" }],
      "cw20:secret1qfql357amn448duf5gvp9gr48sxx9tsnhupu3d"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:nride",
    poolId: "924",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno1qmlchtmjpvu0cr7u0tad2pq8838h6farrrjzp39eqa9xswg7teussrswlq"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:solar",
    poolId: "941",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-169" }],
      "cw20:juno159q8t5g02744lxq8lfmcn6f78qqulq9wn3y9w7lxjgkz4e0a6kvsfvapse"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:uharbor",
    poolId: "947",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
      [{ portId: "transfer", channelId: "channel-87" }],
      "uharbor"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:fox",
    poolId: "949",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
        [{ portId: "transfer", channelId: "channel-169" }],
        "cw20:juno1u8cr3hcjvfkzxcaacv9q75uw9hwjmn8pucc93pmy6yvkzz79kh3qncca8x"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
  {
    alternativeCoinId: "pool:arkh",
    poolId: "954",
    spotPriceSourceDenom: DenomHelper.ibcDenom(
        [{ portId: "transfer", channelId: "channel-648" }],
        "arkh"
    ),
    spotPriceDestDenom: "uosmo",
    destCoinId: "pool:uosmo",
  },
];
