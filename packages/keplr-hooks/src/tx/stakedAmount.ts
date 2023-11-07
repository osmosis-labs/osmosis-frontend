import { AmountConfig } from "./amount";
import { IAmountConfig, IFeeConfig } from "./types";
import { TxChainSetter } from "./chain";
import {
  ChainGetter,
  CoinPrimitive,
  IQueriesStore,
} from "@osmosis-labs/keplr-stores";
import { action, computed, makeObservable, observable, override } from "mobx";
import { AppCurrency } from "@keplr-wallet/types";
import {
  EmptyAmountError,
  InsufficientAmountError,
  InvalidNumberAmountError,
  NegativeAmountError,
  ZeroAmountError,
} from "./errors";
import { Dec, DecUtils } from "@keplr-wallet/unit";
import { useState } from "react";

export class StakedAmountConfig extends AmountConfig implements IAmountConfig {
  constructor(args: ConstructorParameters<typeof AmountConfig>) {
    super(...args);
  }

  @override
  get amount(): string {
    if (this.fraction != null) {
      // update this to unstake balance

      const cosmosQueries = this.queriesStore.get(this.chainId).cosmos;

      const delegationQuery =
        cosmosQueries.queryDelegations.getQueryBech32Address(
          account?.address ?? ""
        );

      const userValidatorDelegations = delegationQuery.delegations;

      const unbondingDelegationsQuery =
        cosmosQueries.queryUnbondingDelegations.getQueryBech32Address(
          account?.address ?? ""
        );

      const summedStakedAmount = userValidatorDelegations.reduce(
        (acc: Dec, delegation: StakingType.Delegation) =>
          new Dec(delegation.balance.amount).add(acc),
        new Dec(0)
      );

      const balance = this.queriesStore
        .get(this.chainId)
        .queryBalances.getQueryBech32Address(this.sender)
        .getBalanceFromCurrency(this.sendCurrency);

      const result = this.feeConfig?.fee
        ? balance.sub(this.feeConfig.fee)
        : balance;
      if (result.toDec().lte(new Dec(0))) {
        return "0";
      }

      // Remember that the `CoinPretty`'s sub method do nothing if the currencies are different.
      return result
        .mul(new Dec(this.fraction))
        .trim(true)
        .locale(false)
        .hideDenom(true)
        .toString();
    }

    return this._amount;

    // error don't query more than their available staked balance
  }
}
