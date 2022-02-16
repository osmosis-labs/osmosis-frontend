import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";
import { Dec, PricePretty, CoinPretty } from "@keplr-wallet/unit";
import {
  CoinGeckoPriceStore,
  QueriesStore,
  QueriesWithCosmos,
} from "@keplr-wallet/stores";
import { ChainStore } from "../chain";
import { QueriesOsmosisStore } from "@osmosis-labs/stores";
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
    protected readonly cosmosStore: QueriesStore<QueriesWithCosmos>,
    protected readonly osmosisStore: QueriesOsmosisStore,
    protected readonly priceStore: CoinGeckoPriceStore,
    protected readonly chainName: string = "osmosis",
    protected readonly fiatCurrencyKey: string = "usd"
  ) {
    makeObservable(this);
  }

  @computed
  get nativeBalances(): CoinBalance[] {
    const { chainId, currencies } = this.chainStore.getChain(this.chainName);
    const { bech32Address } = this.accountStore.getAccount(chainId);
    const queries = this.cosmosStore.get(chainId);
    return currencies
      .filter((currency) => !currency.coinMinimalDenom.includes("/"))
      .map((currency) => {
        const bal = queries.queryBalances
          .getQueryBech32Address(bech32Address)
          .getBalanceFromCurrency(currency);

        return {
          balance: bal,
          fiatValue: this.priceStore.calculatePrice(bal, this.fiatCurrencyKey),
        };
      });
  }

  @computed
  get ibcBalances(): (IBCBalance | IBCCW20ContractBalance)[] {
    const { chainId } = this.chainStore.getChain(this.chainName);

    const account = this.accountStore.getAccount(chainId);
    const queries = this.cosmosStore.get(chainId);

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

      const balance = queries.queryBalances
        .getQueryBech32Address(account.bech32Address)
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
        fiatValue: this.priceStore.calculatePrice(
          balance,
          this.fiatCurrencyKey
        ),
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
    const { chainId } = this.chainStore.getChain(this.chainName);
    const account = this.accountStore.getAccount(chainId);
    return this.cosmosStore
      .get(chainId)
      .queryBalances.getQueryBech32Address(account.bech32Address)
      .balances.map((queryBalance) => queryBalance.balance);
  }

  @computed
  get lockedCoins(): CoinPretty[] {
    const { chainId } = this.chainStore.getChain(this.chainName);
    const { bech32Address } = this.accountStore.getAccount(chainId);
    return this.osmosisStore.get(chainId).queryLockedCoins.get(bech32Address)
      .lockedCoins;
  }

  @computed
  get stakedBalance(): CoinPretty {
    const { chainId } = this.chainStore.getChain(this.chainName);
    const { bech32Address } = this.accountStore.getAccount(chainId);
    return this.cosmosStore
      .get(chainId)
      .cosmos.queryDelegations.getQueryBech32Address(bech32Address).total;
  }

  @computed
  get unstakingBalance(): CoinPretty {
    const { chainId } = this.chainStore.getChain(this.chainName);
    const { bech32Address } = this.accountStore.getAccount(chainId);
    return this.cosmosStore
      .get(chainId)
      .cosmos.queryUnbondingDelegations.getQueryBech32Address(bech32Address)
      .total;
  }

  public calcValueOf = computedFn((balances: CoinPretty[]): PricePretty => {
    const { chainId } = this.chainStore.getChain(this.chainName);
    const fiat = this.priceStore.getFiatCurrency(this.fiatCurrencyKey)!;
    let fiatValue = new PricePretty(fiat, new Dec(0));
    for (const balance of balances) {
      if (balance.currency.coinMinimalDenom.startsWith("gamm/pool/")) {
        const poolId = balance.currency.coinMinimalDenom.replace(
          "gamm/pool/",
          ""
        );
        const pool = this.osmosisStore
          .get(chainId)
          .queryGammPools.getPool(poolId);
        if (pool) {
          const tvl = pool.computeTotalValueLocked(this.priceStore, fiat);
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
