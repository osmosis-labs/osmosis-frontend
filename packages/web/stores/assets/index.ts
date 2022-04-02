import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";
import { Dec, PricePretty, CoinPretty } from "@keplr-wallet/unit";
import {
  CoinGeckoPriceStore,
  CosmosQueries,
  CosmwasmQueries,
  QueriesStore,
} from "@keplr-wallet/stores";
import { ChainStore } from "../chain";
import { OsmosisQueries } from "@osmosis-labs/stores";
import { makeIBCMinimalDenom } from "./utils";
import {
  IBCAsset,
  IBCBalance,
  IBCCW20ContractBalance,
  CoinBalance,
} from "./types";

/**
 * Wrapper around IBC asset config and stores to provide memoized metrics about osmosis assets.
 */
export class ObservableAssets {
  constructor(
    protected readonly ibcAssets: IBCAsset[],
    protected readonly chainStore: ChainStore,
    protected readonly accountStore: {
      getAccount: (chainId: string) => {
        bech32Address: string;
      };
    },
    protected readonly queriesStore: QueriesStore<
      [CosmosQueries, CosmwasmQueries, OsmosisQueries]
    >,
    protected readonly priceStore: CoinGeckoPriceStore,
    protected readonly chainId: string = "osmosis"
  ) {
    makeObservable(this);
  }

  @computed
  get queries() {
    return this.queriesStore.get(this.chainId);
  }

  @computed
  get account() {
    return this.accountStore.getAccount(this.chainId);
  }

  @computed
  get chain() {
    return this.chainStore.getChain(this.chainId);
  }

  @computed
  get nativeBalances(): CoinBalance[] {
    return this.chain.currencies
      .filter((currency) => !currency.coinMinimalDenom.includes("/"))
      .map((currency) => {
        const bal = this.queries.queryBalances
          .getQueryBech32Address(this.account.bech32Address)
          .getBalanceFromCurrency(currency);

        return {
          balance: bal,
          fiatValue: this.priceStore.calculatePrice(bal),
        };
      });
  }

  @computed
  get ibcBalances(): (IBCBalance | IBCCW20ContractBalance)[] {
    return this.ibcAssets.map((ibcAsset) => {
      const chainInfo = this.chainStore.getChain(ibcAsset.counterpartyChainId);
      const ibcDenom = makeIBCMinimalDenom(
        ibcAsset.sourceChannelId,
        ibcAsset.coinMinimalDenom
      );

      const originCurrency = chainInfo.currencies.find((cur) => {
        if (ibcAsset.coinMinimalDenom.startsWith("cw20:")) {
          return cur.coinMinimalDenom.startsWith(ibcAsset.coinMinimalDenom);
        }

        return cur.coinMinimalDenom === ibcAsset.coinMinimalDenom;
      });

      if (!originCurrency) {
        throw new Error(
          `Unknown currency ${ibcAsset.coinMinimalDenom} for ${ibcAsset.counterpartyChainId}`
        );
      }

      // TODO: support multihop IBC denoms-
      // Reimplement: https://github.com/osmosis-labs/osmosis-frontend/pull/275/

      const balance = this.queries.queryBalances
        .getQueryBech32Address(this.account.bech32Address)
        .getBalanceFromCurrency({
          coinDecimals: originCurrency.coinDecimals,
          coinGeckoId: originCurrency.coinGeckoId,
          coinImageUrl: originCurrency.coinImageUrl,
          coinDenom: originCurrency.coinDenom,
          coinMinimalDenom: ibcDenom,
          paths: [
            {
              portId: "transfer",
              channelId: ibcAsset.sourceChannelId,
            },
          ],
          originChainId: chainInfo.chainId,
          originCurrency,
        });

      const ibcBalance: IBCBalance = {
        chainInfo: chainInfo,
        balance,
        fiatValue: this.priceStore.calculatePrice(balance),
        sourceChannelId: ibcAsset.sourceChannelId,
        destChannelId: ibcAsset.destChannelId,
        isUnstable: ibcAsset.isUnstable,
      };

      if (ibcAsset.ics20ContractAddress) {
        return {
          ...ibcBalance,
          ics20ContractAddress: ibcAsset.ics20ContractAddress,
        } as IBCCW20ContractBalance;
      } else {
        return ibcBalance;
      }
    });
  }

  @computed
  get availableBalance(): CoinPretty[] {
    return this.queries.queryBalances
      .getQueryBech32Address(this.account.bech32Address)
      .balances.map((queryBalance) => queryBalance.balance);
  }

  @computed
  get lockedCoins(): CoinPretty[] {
    return this.queries.osmosis.queryLockedCoins.get(this.account.bech32Address)
      .lockedCoins;
  }

  @computed
  get stakedBalance(): CoinPretty {
    return this.queries.cosmos.queryDelegations.getQueryBech32Address(
      this.account.bech32Address
    ).total;
  }

  @computed
  get unstakingBalance(): CoinPretty {
    const { chainId } = this.chainStore.getChain(this.chainId);
    const { bech32Address } = this.accountStore.getAccount(chainId);
    return this.queries.cosmos.queryUnbondingDelegations.getQueryBech32Address(
      bech32Address
    ).total;
  }

  public calcValueOf = computedFn((balances: CoinPretty[]): PricePretty => {
    const fiat = this.priceStore.getFiatCurrency(
      this.priceStore.defaultVsCurrency
    )!;
    let fiatValue = new PricePretty(fiat, new Dec(0));
    for (const balance of balances) {
      if (balance.currency.coinMinimalDenom.startsWith("gamm/pool/")) {
        const poolId = balance.currency.coinMinimalDenom.replace(
          "gamm/pool/",
          ""
        );
        const pool = this.queries.osmosis.queryGammPools.getPool(poolId);
        if (pool) {
          const tvl = pool.computeTotalValueLocked(this.priceStore);
          const totalShare = pool.totalShare;
          if (tvl.toDec().gt(new Dec(0)) && totalShare.toDec().gt(new Dec(0))) {
            const value = tvl.mul(balance.quo(totalShare));
            fiatValue = fiatValue.add(value);
          }
        }
      } else {
        const price = this.priceStore.calculatePrice(balance);
        if (price) {
          fiatValue = fiatValue.add(price);
        }
      }
    }
    return fiatValue;
  });
}

export * from "./types";
