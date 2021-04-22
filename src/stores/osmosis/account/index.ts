import {
  ChainGetter,
  QueriesStore,
  HasMapStore,
  AccountStore,
  AccountStoreInner
} from "@keplr-wallet/stores";
import { Dec, DecUtils } from "@keplr-wallet/unit";
import { Currency } from "@keplr-wallet/types";

export class OsmosisAccountStoreInner {
  constructor(
    protected readonly account: AccountStoreInner,
    protected readonly chainGetter: ChainGetter,
    protected readonly chainId: string,
    protected readonly queriesStore: QueriesStore
  ) {}

  /**
   *
   * @param swapFee The swap fee of the pool. Should set as the percentage. (Ex. 10% -> 10)
   * @param assets Assets that will be provided pool initially. Token can be parsed as to primitive by convenience.
   */
  async sendCreatePoolMsg(
    swapFee: string,
    assets: {
      // Int
      weight: string;
      // Ex) 10 atom.
      token: {
        currency: Currency;
        amount: string;
      };
    }[],
    memo: string = "",
    onFulfill?: (tx: any) => void
  ) {
    const poolParams = {
      swapFee: new Dec(swapFee).quo(DecUtils.getPrecisionDec(2)).toString(),
      exitFee: new Dec(0).toString()
    };

    const poolAssets: {
      weight: string;
      token: {
        denom: string;
        amount: string;
      };
    }[] = [];

    for (const asset of assets) {
      poolAssets.push({
        weight: asset.weight,
        token: {
          denom: asset.token.currency.coinMinimalDenom,
          amount: new Dec(asset.token.amount)
            .mul(DecUtils.getPrecisionDec(asset.token.currency.coinDecimals))
            .truncate()
            .toString()
        }
      });
    }

    const msg = {
      type: "osmosis/gamm/create-pool",
      value: {
        sender: this.account.bech32Address,
        poolParams,
        poolAssets
      }
    };

    await this.account.sendMsgs(
      // TODO: Currently, can't add the custom type.
      "unknown",
      [msg],
      {
        amount: [],
        // TODO: Add the opts for osmosis txs.
        gas: (10000000).toString()
      },
      memo,
      tx => {
        if (tx.code == null || tx.code === 0) {
          // TODO: Refresh the pools list.

          // Refresh the balances
          const queries = this.queriesStore.get(this.chainId);
          queries
            .getQueryBalances()
            .getQueryBech32Address(this.account.bech32Address)
            .balances.forEach(bal => {
              if (
                assets.find(
                  asset =>
                    asset.token.currency.coinMinimalDenom ===
                    bal.currency.coinMinimalDenom
                )
              ) {
                bal.fetch();
              }
            });
        }

        if (onFulfill) {
          onFulfill(tx);
        }
      }
    );
  }
}

export class OsmosisAccountStore extends HasMapStore<OsmosisAccountStoreInner> {
  constructor(
    protected readonly accountStore: AccountStore,
    protected readonly chainGetter: ChainGetter,
    protected readonly queriesStore: QueriesStore
  ) {
    super((chainId: string) => {
      return new OsmosisAccountStoreInner(
        this.accountStore.getAccount(chainId),
        this.chainGetter,
        chainId,
        this.queriesStore
      );
    });
  }

  getAccount(chainId: string): OsmosisAccountStoreInner {
    return this.get(chainId);
  }

  hasAccount(chainId: string): boolean {
    return this.has(chainId);
  }
}
