import { Dec, Int } from "@keplr-wallet/unit";

// https://github.com/osmosis-labs/osmosis/blob/1c5f166d180ca6ffdd0a4068b97422c5c169240c/osmomath/decimal.go#L79
export const smallestDec = new Dec("1", Dec.precision);

// https://github.com/osmosis-labs/osmosis/blob/1c5f166d180ca6ffdd0a4068b97422c5c169240c/x/concentrated-liquidity/types/constants.go#L24
export const minSpotPrice = new Dec("0.000000000000000001");
export const maxSpotPrice = new Dec("100000000000000000000000000000000000000");
export const exponentAtPriceOneMax = new Int(-1);
export const exponentAtPriceOneMin = new Int(-12);
