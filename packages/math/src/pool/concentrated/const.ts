import { Dec, Int } from "@keplr-wallet/unit";

// https://github.com/osmosis-labs/osmosis/blob/1c5f166d180ca6ffdd0a4068b97422c5c169240c/osmomath/decimal.go#L79
export const smallestDec = new Dec("1", Dec.precision);

// https://github.com/osmosis-labs/osmosis/blob/1c5f166d180ca6ffdd0a4068b97422c5c169240c/x/concentrated-liquidity/types/constants.go#L24
export const minSpotPrice = new Dec("0.000000000001");
export const maxSpotPrice = new Dec("100000000000000000000000000000000000000");

// https://github.com/osmosis-labs/osmosis/blob/0f9eb3c1259078035445b3e3269659469b95fd9f/x/concentrated-liquidity/types/constants.go#L22
export const exponentAtPriceOne = -6;

// https://github.com/osmosis-labs/osmosis/blob/0f9eb3c1259078035445b3e3269659469b95fd9f/x/concentrated-liquidity/types/constants.go#L11
export const minTick = new Int(-108000000);
export const maxTick = new Int(342000000);
