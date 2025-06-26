import {
  getInt3BCHMinimalDenom,
  getInt3DOGEMinimalDenom,
  getInt3LTCMinimalDenom,
  getInt3SOLMinimalDenom,
  getInt3TONMinimalDenom,
  getInt3XRPMinimalDenom,
} from "@osmosis-labs/utils";

type Int3faceChainType =
  | "doge"
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
    allTokenMinimalDenom:
      env === "mainnet"
        ? "factory/osmo1qnglc04tmhg32uc4kxlxh55a5cmhj88cpa3rmtly484xqu82t79sfv94w0/alloyed/allXRP"
        : undefined,
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
    allTokenMinimalDenom:
      env === "mainnet"
        ? "factory/osmo12lnwf54yd30p6amzaged2atln8k0l32n7ncxf04ctg7u7ymnsy7qkqgsw4/alloyed/allTON"
        : undefined,
    denom: "TON",
    address: "ton",
  };

  const solConfig: Int3faceSupportedToken = {
    chainId: "solana",
    chainName: "Solana",
    chainType: "solana",
    int3MinimalDenom: getInt3SOLMinimalDenom({ env }),
    int3TokenSymbol: "SOL.int3",
    allTokenMinimalDenom:
      env === "mainnet"
        ? "factory/osmo1n3n75av8awcnw4jl62n3l48e6e4sxqmaf97w5ua6ddu4s475q5qq9udvx4/alloyed/allSOL"
        : undefined,
    denom: "SOL",
    address: "solana",
  };

  return {
    DOGE: dogeConfig,
    "DOGE.int3": dogeConfig,

    BCH: bchConfig,
    "BCH.int3": bchConfig,

    LTC: ltcConfig,
    "LTC.int3": ltcConfig,

    XRP: xrpConfig,
    "XRP.int3": xrpConfig,

    TON: tonConfig,
    "TON.int3": tonConfig,

    SOL: solConfig,
    "SOL.int3": solConfig,
  };
};
