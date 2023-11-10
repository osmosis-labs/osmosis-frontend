import { IFeeConfig } from "./types";
import {
  ChainGetter,
  CosmosQueries,
  IQueriesStore,
} from "@osmosis-labs/keplr-stores";
import { override } from "mobx";
import { Dec, CoinPretty } from "@keplr-wallet/unit";
import { useState } from "react";
import { AmountConfig } from "./amount";
import { Staking as StakingType } from "@osmosis-labs/keplr-stores";

export class StakedAmountConfig extends AmountConfig {
  constructor(
    chainGetter: ChainGetter,
    protected readonly queriesStore: IQueriesStore<CosmosQueries>,
    initialChainId: string,
    sender: string,
    feeConfig: IFeeConfig | undefined
  ) {
    super(chainGetter, queriesStore, initialChainId, sender, feeConfig);
  }

  @override
  get balance(): CoinPretty {
    const cosmosQueries = this.queriesStore.get(this.chainId).cosmos;
    const address = this.sender;

    const delegationQuery =
      cosmosQueries.queryDelegations.getQueryBech32Address(address);

    const userValidatorDelegations = delegationQuery.delegations;

    const stakeBalance = userValidatorDelegations.reduce(
      (acc: Dec, delegation: StakingType.Delegation) =>
        new Dec(delegation.balance.amount).add(acc),
      new Dec(0)
    );

    const { stakeCurrency } = this.chainGetter.getChain(this.chainId);

    const stakeBalanceCoinPretty = new CoinPretty(stakeCurrency, stakeBalance);

    return stakeBalanceCoinPretty;
  }
}

export const useStakedAmountConfig = (
  chainGetter: ChainGetter,
  queriesStore: IQueriesStore<CosmosQueries>,
  chainId: string,
  sender: string
) => {
  const [txConfig] = useState(
    () =>
      new StakedAmountConfig(
        chainGetter,
        queriesStore,
        chainId,
        sender,
        undefined
      )
  );
  txConfig.setChain(chainId);
  txConfig.setSender(sender);

  return txConfig;
};
