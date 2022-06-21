import { Dec } from "@keplr-wallet/unit";
export declare function pow(base: Dec, exp: Dec): Dec;
export declare function absDifferenceWithSign(a: Dec, b: Dec): [Dec, boolean];
export declare function powApprox(base: Dec, exp: Dec, precision: Dec): Dec;
