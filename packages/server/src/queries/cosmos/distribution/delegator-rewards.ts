import { createNodeQuery } from "../../create-node-query";

export type DelegatorRewards = {
  rewards: DelegatorValidatorReward[] | null;
  total: { denom: string; amount: string }[];
};

export type DelegatorValidatorReward = {
  validator_address: string;
  reward: { denom: string; amount: string }[] | null;
};

export const queryDelegatorRewards = createNodeQuery<
  DelegatorRewards,
  {
    bech32Address: string;
  }
>({
  path: ({ bech32Address }) =>
    `/cosmos/distribution/v1beta1/delegators/${bech32Address}/rewards`,
});
