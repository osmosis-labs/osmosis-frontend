import { createNodeQuery } from "../../base-utils";

export type AccountLockedCoins = {
  coins: {
    denom: string;
    amount: string;
  }[];
};

export const queryAccountLockedCoins = createNodeQuery<
  AccountLockedCoins,
  {
    bech32Address: string;
  }
>({
  path: ({ bech32Address }) =>
    `/osmosis/lockup/v1beta1/account_locked_coins/${bech32Address}`,
});
