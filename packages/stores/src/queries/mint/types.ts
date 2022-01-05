export type MintParmas = {
  params: {
    mint_denom: string;
    genesis_epoch_provisions: string;
    epoch_identifier: string;
    reduction_period_in_epochs: string;
    reduction_factor: string;
    distribution_proportions: {
      staking: string;
      pool_incentives: string;
      developer_rewards: string;
    };
    developer_rewards_receiver: string;
  };
};

export type EpochProvisions = {
  epoch_provisions: string;
};
