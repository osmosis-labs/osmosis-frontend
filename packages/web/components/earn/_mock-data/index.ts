import { Strategy } from "~/components/earn/table/types/strategy";

export const MOCK_tableData: Strategy[] = [
  {
    involvedTokens: ["OSMO", "MARS"],
    strategyMethod: {
      displayName: "LP",
      id: "lp",
    },
    platform: {
      displayName: "Quasar",
      id: "quasar",
    },
    strategyName: "ATOM Pro M+ Vault",
    tvl: {
      value: 10290316,
      depositCap: {
        actual: 12100290,
        total: 14000000,
      },
    },
    apy: 10.94,
    daily: 0.0008,
    reward: ["OSMO", "MARS"],
    lock: 21,
    risk: 4,
    actions: {
      externalURL: "#",
    },
    balance: {
      quantity: 36849,
      converted: "$11,548.52",
    },
    chainType: "bluechip",
    hasLockingDuration: true,
    holdsTokens: true,
  },
  {
    involvedTokens: ["OSMO"],
    strategyMethod: {
      displayName: "Perp LP",
      id: "perp_lp",
    },
    platform: {
      displayName: "Levana",
      id: "levana",
    },
    strategyName: "OSMO Levana xLP",
    tvl: {
      value: 10290316,
      fluctuation: -2.5,
    },
    apy: 10.94,
    daily: 0.0008,
    reward: ["FDAI"],
    risk: 1,
    actions: {
      onClick: () => console.log("Hey!"),
    },
    balance: {
      quantity: 36849,
      converted: "$11,548.52",
    },
    chainType: "stablecoins",
    hasLockingDuration: false,
    holdsTokens: false,
  },
  {
    involvedTokens: ["ETH", "BTC"],
    strategyMethod: {
      displayName: "Staking",
      id: "staking",
    },
    platform: {
      displayName: "Osmosis",
      id: "osmosis",
    },
    strategyName: "ETH/BTC Liquidity Pool",
    tvl: {
      value: 8000000,
      fluctuation: 1.2,
    },
    apy: 8.75,
    daily: 0.001,
    reward: ["ETH", "BTC"],
    lock: 30,
    risk: 3,
    actions: {
      externalURL: "#",
    },
    balance: {
      quantity: 50000,
      converted: "$120,000.00",
    },
    chainType: "correlated",
    hasLockingDuration: true,
    holdsTokens: true,
  },
  {
    involvedTokens: ["BTC", "ETH"],
    strategyMethod: {
      displayName: "Vaults",
      id: "vaults",
    },
    platform: {
      displayName: "Levana",
      id: "levana",
    },
    strategyName: "BTC/ETH Liquidity Pool",
    tvl: {
      value: 9500000,
      fluctuation: 2.8,
    },
    apy: 9.25,
    daily: 0.0012,
    reward: ["BTC", "ETH"],
    lock: 25,
    risk: 5,
    actions: {
      externalURL: "#",
    },
    balance: {
      quantity: 45000,
      converted: "$110,000.00",
    },
    chainType: "correlated",
    hasLockingDuration: true,
    holdsTokens: true,
  },
  {
    involvedTokens: ["LINK", "USDC"],
    strategyMethod: {
      displayName: "Lending",
      id: "lending",
    },
    platform: {
      displayName: "Mars",
      id: "mars",
    },
    strategyName: "LINK-USDC Farm",
    tvl: {
      value: 7500000,
      fluctuation: -1.5,
    },
    apy: 11.5,
    daily: 0.0015,
    reward: ["LINK"],
    risk: 3,
    actions: {
      externalURL: "#",
    },
    balance: {
      quantity: 55000,
      converted: "$85,000.00",
    },
    chainType: "stablecoins",
    hasLockingDuration: false,
    holdsTokens: true,
  },
];

export const MOCK_tokenRows = [
  {
    image: "",
    name: "MARS",
    perc: 18.87,
    platform: "Osmosis",
    strategyMethod: "Lending",
  },
  {
    image: "",
    name: "OSMO",
    perc: 22.87,
    platform: "Quasar",
    strategyMethod: "Vaults",
  },
  {
    image: "",
    name: "ETH",
    perc: 13.87,
    platform: "Osmosis Dex",
    strategyMethod: "Perp LP",
  },
  {
    image: "",
    name: "ATOM",
    perc: 23.87,
    platform: "Mars",
    strategyMethod: "Staking",
  },
  {
    image: "",
    name: "OSMO",
    perc: 22.87,
    platform: "Osmosis",
    strategyMethod: "Vaults",
  },
  {
    image: "",
    name: "MARS",
    perc: 18.87,
    platform: "Osmosis Dex",
    strategyMethod: "Lending",
  },
  {
    image: "",
    name: "ETH",
    perc: 13.87,
    platform: "Quasar",
    strategyMethod: "LP",
  },
  {
    image: "",
    name: "ATOM",
    perc: 23.87,
    platform: "Levana",
    strategyMethod: "Staking",
  },
  {
    image: "",
    name: "OSMO",
    perc: 22.87,
    platform: "Osmosis Dex",
    strategyMethod: "Perp LP",
  },
  {
    image: "",
    name: "MARS",
    perc: 18.87,
    platform: "Osmosis",
    strategyMethod: "Lending",
  },
  {
    image: "",
    name: "ETH",
    perc: 13.87,
    platform: "Mars",
    strategyMethod: "Staking",
  },
  {
    image: "",
    name: "ATOM",
    perc: 23.87,
    platform: "Quasar",
    strategyMethod: "Vaults",
  },
];
