import { createNodeQuery } from "../../base-utils";

export type AccountUnlockingCoins = {
  coins: {
    denom: string;
    amount: string;
  }[];
};

export const queryAccountUnlockingCoins = createNodeQuery<
  AccountUnlockingCoins,
  {
    bech32Address: string;
  }
>({
  path: ({ bech32Address }) =>
    `/osmosis/lockup/v1beta1/account_unlocking_coins/${bech32Address}`,
});
