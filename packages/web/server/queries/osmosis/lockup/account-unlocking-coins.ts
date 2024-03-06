import { createNodeQuery } from "../../base-utils";
import { AccountCoins } from "./types";

export const queryAccountUnlockingCoins = createNodeQuery<
  AccountCoins,
  {
    bech32Address: string;
  }
>({
  path: ({ bech32Address }) =>
    `/osmosis/lockup/v1beta1/account_unlocking_coins/${bech32Address}`,
});
