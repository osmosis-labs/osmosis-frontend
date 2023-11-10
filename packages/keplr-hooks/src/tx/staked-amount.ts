import { IFeeConfig } from "./types";
import {
  ChainGetter,
  CosmosQueries,
  IQueriesStore,
} from "@osmosis-labs/keplr-stores";
import { override } from "mobx";

import { Dec } from "@keplr-wallet/unit";
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
  get balance(): any {
    const cosmosQueries = this.queriesStore.get(this.chainId).cosmos;
    console.log("cosmosQueries", cosmosQueries);

    const address = this.sender;
    console.log("address", address);

    const delegationQuery =
      cosmosQueries.queryDelegations.getQueryBech32Address(address);
    console.log("delegationQuery", delegationQuery);

    const userValidatorDelegations = delegationQuery.delegations;
    console.log("userValidatorDelegations", userValidatorDelegations);

    const summedStakeBalance = userValidatorDelegations.reduce(
      (acc: Dec, delegation: StakingType.Delegation) =>
        new Dec(delegation.balance.amount).add(acc),
      new Dec(0)
    );

    console.log("summedStakeBalance", summedStakeBalance);

    return summedStakeBalance;
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
