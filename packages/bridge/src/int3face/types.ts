import {
  getInt3BCHMinimalDenom,
  getInt3BTCMinimalDenom,
  getInt3DOGEMinimalDenom,
  getInt3LTCMinimalDenom,
  getInt3PENGUMinimalDenom,
  getInt3SOLMinimalDenom,
  getInt3TONMinimalDenom,
  getInt3TRUMPMinimalDenom,
  getInt3XRPMinimalDenom,
} from "@osmosis-labs/utils";

type Int3faceChainType =
  | "doge"
  | "bitcoin"
  | "bitcoin-cash"
  | "xrpl"
  | "litecoin"
  | "ton"
  | "solana";

export interface Int3faceSupportedToken {
  chainId: string;
  chainName: string;
  chainType: Int3faceChainType;
  int3MinimalDenom: string;
  int3TokenSymbol: string;
  allTokenMinimalDenom?: string;
  denom: string;
  address: string;
}

export type Int3faceSupportedTokensConfig = Record<
  string,
  Int3faceSupportedToken
>;

export const getInt3faceBridgeConfig = (
  env: "testnet" | "mainnet"
): Int3faceSupportedTokensConfig => {
  const btcConfig: Int3faceSupportedToken = {
    chainId: "bitcoin",
    chainName: "Bitcoin",
    chainType: "bitcoin",
    int3MinimalDenom: getInt3BTCMinimalDenom({ env }),
    int3TokenSymbol: "BTC.int3",
    // BTC.int3 was force-exited from the allBTC transmuter pool (2026-06-15), so
    // an alloy holder can no longer redeem allBTC into BTC.int3. Advertising the
    // alloy withdraw route would be a dead end. The standalone BTC.int3 variant
    // route is unaffected.
    allTokenMinimalDenom: undefined,
    denom: "BTC",
    address: "btc",
  };

  const dogeConfig: Int3faceSupportedToken = {
    chainId: "dogecoin",
    chainName: "Dogecoin",
    chainType: "doge",
    int3MinimalDenom: getInt3DOGEMinimalDenom({ env }),
    int3TokenSymbol: "DOGE.int3",
    allTokenMinimalDenom:
      env === "mainnet"
        ? "factory/osmo10pk4crey8fpdyqd62rsau0y02e3rk055w5u005ah6ly7k849k5tsf72x40/alloyed/allDOGE"
        : undefined,
    denom: "DOGE",
    address: "koinu",
  };

  const bchConfig: Int3faceSupportedToken = {
    chainId: "bitcoin-cash",
    chainName: "Bitcoin Cash",
    chainType: "bitcoin-cash",
    int3MinimalDenom: getInt3BCHMinimalDenom({ env }),
    int3TokenSymbol: "BCH.int3",
    allTokenMinimalDenom:
      env === "mainnet"
        ? "factory/osmo1cranx3twqxfrgeqvgsu262gy54vafpc9xap6scye99v244zl970s7kw2sz/alloyed/allBCH"
        : undefined,
    denom: "BCH",
    address: "bch",
  };

  const xrpConfig: Int3faceSupportedToken = {
    chainId: "xrpl",
    chainName: "Xrpl",
    chainType: "xrpl",
    int3MinimalDenom: getInt3XRPMinimalDenom({ env }),
    int3TokenSymbol: "XRP.int3",
    // XRP.xrpl.int3 was force-exited from the allXRP transmuter pool (2026-06-15)
    // (get_corrupted_denoms now empty). No alloy redemption path remains, so the
    // alloy withdraw route is a dead end. Standalone XRP.int3 route unaffected.
    allTokenMinimalDenom: undefined,
    denom: "XRP",
    address: "xrp",
  };

  const ltcConfig: Int3faceSupportedToken = {
    chainId: "litecoin",
    chainName: "Litecoin",
    chainType: "litecoin",
    int3MinimalDenom: getInt3LTCMinimalDenom({ env }),
    int3TokenSymbol: "LTC.int3",
    allTokenMinimalDenom:
      env === "mainnet"
        ? "factory/osmo1csp8fk353hnq2tmulklecxpex43qmjvrkxjcsh4c3eqcw2vjcslq5jls9v/alloyed/allLTC"
        : undefined,
    denom: "LTC",
    address: "litecoin",
  };

  const tonConfig: Int3faceSupportedToken = {
    chainId: "ton",
    chainName: "Ton",
    chainType: "ton",
    int3MinimalDenom: getInt3TONMinimalDenom({ env }),
    int3TokenSymbol: "TON.int3",
    // TON.int3 was force-exited from the allTON transmuter pool (2026-06-15). No
    // alloy redemption path remains, so the alloy withdraw route is a dead end.
    // Standalone TON.int3 route unaffected.
    allTokenMinimalDenom: undefined,
    denom: "TON",
    address: "ton",
  };

  const solConfig: Int3faceSupportedToken = {
    chainId: "solana",
    chainName: "Solana",
    chainType: "solana",
    int3MinimalDenom: getInt3SOLMinimalDenom({ env }),
    int3TokenSymbol: "SOL.int3",
    // SOL.int3 was force-exited from the allSOL transmuter pool (2026-06-15). No
    // alloy redemption path remains, so the alloy withdraw route is a dead end.
    // Standalone SOL.int3 route unaffected.
    allTokenMinimalDenom: undefined,
    denom: "SOL",
    address: "solana",
  };

  const trumpConfig: Int3faceSupportedToken = {
    chainId: "solana",
    chainName: "Solana",
    chainType: "solana",
    int3MinimalDenom: getInt3TRUMPMinimalDenom({ env }),
    int3TokenSymbol: "TRUMP.int3",
    allTokenMinimalDenom:
      env === "mainnet"
        ? "factory/osmo1524q4dt7ckx25daydfd0ya0hyu6t26ch5509nvmxm4gcvuhk0fvs8qzl5q/alloyed/allTRUMP"
        : undefined,
    denom: "TRUMP",
    address: "solana",
  };

  const penguConfig: Int3faceSupportedToken = {
    chainId: "solana",
    chainName: "Solana",
    chainType: "solana",
    int3MinimalDenom: getInt3PENGUMinimalDenom({ env }),
    int3TokenSymbol: "PENGU.int3",
    allTokenMinimalDenom:
      env === "mainnet"
        ? "factory/osmo10nu66efsxxkdgh70xs8xur9mygrg79m5ht7zcmzsrdzxkhz7hpssz9hg9k/alloyed/allPENGU"
        : undefined,
    denom: "PENGU",
    address: "solana",
  };

  return {
    DOGE: dogeConfig,
    "DOGE.int3": dogeConfig,

    BTC: btcConfig,
    "BTC.int3": btcConfig,

    BCH: bchConfig,
    "BCH.int3": bchConfig,

    LTC: ltcConfig,
    "LTC.int3": ltcConfig,

    XRP: xrpConfig,
    "XRP.int3": xrpConfig,
    "XRP.xrpl.int3": xrpConfig,

    TON: tonConfig,
    "TON.int3": tonConfig,

    SOL: solConfig,
    "SOL.int3": solConfig,

    TRUMP: trumpConfig,
    "TRUMP.int3": trumpConfig,

    PENGU: penguConfig,
    "PENGU.int3": penguConfig,
  };
};
