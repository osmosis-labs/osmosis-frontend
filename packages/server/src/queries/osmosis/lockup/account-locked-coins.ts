import { createNodeQuery } from "../../base-utils";
import { AccountCoins } from "./types";

/** Includes locked and unlocking coins.
 *
 *  To query for *just unlocking* coins, use `queryAccountUnlockingCoins`. */
export const queryAccountLockedCoins = createNodeQuery<
  AccountCoins,
  {
    bech32Address: string;
  }
>({
  path: ({ bech32Address }) =>
    `/osmosis/lockup/v1beta1/account_locked_coins/${bech32Address}`,
});
