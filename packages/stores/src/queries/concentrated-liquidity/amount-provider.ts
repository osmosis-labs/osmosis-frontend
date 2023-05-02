import {
  ObservableQueryBalances,
  ObservableQueryBalancesInner,
} from "@keplr-wallet/stores";
import { Int } from "@keplr-wallet/unit";
import {
  AmountsDataProvider,
  ConcentratedLiquidityPoolRaw,
} from "@osmosis-labs/pools";

/** Default implementation of AmountsDataProvider for constructing a ConcentratedLiquidityPool. */
export class ConcentratedLiquidityPoolAmountProvider
  implements AmountsDataProvider
{
  protected readonly _queryBalance: ObservableQueryBalancesInner;

  constructor(
    protected readonly poolRaw: ConcentratedLiquidityPoolRaw,
    protected readonly queryBalances: ObservableQueryBalances
  ) {
    this._queryBalance = this.queryBalances.getQueryBech32Address(
      poolRaw.address
    );
  }

  async getPoolAmounts(): Promise<{ token0Amount: Int; token1Amount: Int }> {
    await Promise.all(
      this._queryBalance.balances.map((bal) => bal.waitResponse())
    );
    const token0Amount = this._queryBalance.balances
      .find((bal) => bal.currency.coinMinimalDenom === this.poolRaw.token0)
      ?.balance.toCoin().amount;
    const token1Amount = this._queryBalance.balances
      .find((bal) => bal.currency.coinMinimalDenom === this.poolRaw.token1)
      ?.balance.toCoin().amount;
    if (!token0Amount || !token1Amount)
      throw Error("CL token balances not found");

    return {
      token0Amount: new Int(token0Amount),
      token1Amount: new Int(token1Amount),
    };
  }
}
