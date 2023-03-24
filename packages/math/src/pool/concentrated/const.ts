import { Dec, Int } from "@keplr-wallet/unit";

export const maxSpotPrice = new Dec("100000000000000000000000000000000000000");
export const minSpotPrice = new Dec("0.000000000000000001");
export const smallestDec = new Dec("1", Dec.precision);

export const exponentAtPriceOneMax = new Int(-1);
export const exponentAtPriceOneMin = new Int(-12);
