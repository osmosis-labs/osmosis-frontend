import { AppCurrency } from "@keplr-wallet/types";
/** Uses regex matching to map less readable chain errors to a less technical user-friendly string.
 *  @param message Error message from chain.
 *  @param currencies Currencies used to map to human-readable coin denoms (e.g. ATOM)
 *  @returns Human readable error message if possible.
 */
export declare function prettifyTxError(message: string, currencies: AppCurrency[]): string | undefined;
