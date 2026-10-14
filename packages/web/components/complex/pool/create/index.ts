export * from "./select-type";
export * from "./step1-set-ratios";
export * from "./step2-add-liquidity";
export * from "./step3-confirm";
export * from "./types";

export const POOL_CREATION_FEE = "20 USDC";

/**
 * The poolmanager `pool_creation_fee` that POOL_CREATION_FEE describes, as a
 * minimal-denom coin (20 allUSDC, 6 decimals), for balance prechecks. Kept in
 * step with the display string; update both if governance changes the fee.
 */
export const POOL_CREATION_FEE_COIN = {
  denom:
    "factory/osmo147h5x9pcj7lm0cttlaefx6sqq5vdfnmwfcqxkmjd7exqm9gc7grqhr75m0/alloyed/allUSDC",
  amount: "20000000",
};
