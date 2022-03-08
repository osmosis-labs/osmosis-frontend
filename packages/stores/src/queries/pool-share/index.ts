import { ObservableQueryBalances } from "@keplr-wallet/stores";
import {
  CoinPretty,
  Dec,
  DecUtils,
  Int,
  IntPretty,
  PricePretty,
} from "@keplr-wallet/unit";
import { AppCurrency, Currency, FiatCurrency } from "@keplr-wallet/types";
import { ObservableQueryPools } from "../pools";
import { computedFn } from "mobx-utils";
import {
  ObservableQueryAccountLockedCoins,
  ObservableQueryAccountUnlockingCoins,
} from "../lockup";

export class ObservableQueryGammPoolShare {
  static getShareCurrency(poolId: string): Currency {
    return {
      coinDenom: `GAMM/${poolId}`,
      coinMinimalDenom: `gamm/pool/${poolId}`,
      coinDecimals: 18,
    };
  }

  constructor(
    protected readonly queryPools: ObservableQueryPools,
    protected readonly queryBalances: ObservableQueryBalances,
    protected readonly queryLockedCoins: ObservableQueryAccountLockedCoins,
    protected readonly queryUnlockingCoins: ObservableQueryAccountUnlockingCoins
  ) {}

  /**
   * Returns the pool id arrangement of all shares owned by a particular address.
   */
  readonly getOwnPools = computedFn((bech32Address: string): string[] => {
    const balances: {
      currency: AppCurrency;
    }[] =
      this.queryBalances.getQueryBech32Address(bech32Address).positiveBalances;
    const locked = this.queryLockedCoins.get(bech32Address).lockedCoins;
    let result: string[] = [];

    for (const bal of balances.concat(locked)) {
      // The pool share token is in the form of 'gamm/pool/${poolId}'.
      if (bal.currency.coinMinimalDenom.startsWith("gamm/pool/")) {
        result.push(bal.currency.coinMinimalDenom.replace("gamm/pool/", ""));
      }
    }

    // Remove the duplicates.
    result = [...new Set(result)];

    result.sort((e1, e2) => {
      return parseInt(e1) >= parseInt(e2) ? 1 : -1;
    });

    return result;
  });

  readonly getShareCurrency = computedFn((poolId: string): Currency => {
    return ObservableQueryGammPoolShare.getShareCurrency(poolId);
  });

  readonly getLockedGammShare = computedFn(
    (bech32Address: string, poolId: string): CoinPretty => {
      const currency = this.getShareCurrency(poolId);

      const locked = this.queryLockedCoins
        .get(bech32Address)
        .lockedCoins.find(
          (coin) => coin.currency.coinMinimalDenom === currency.coinMinimalDenom
        );
      if (locked) {
        return locked;
      }
      return new CoinPretty(currency, new Dec(0));
    }
  );

  readonly getLockedGammShareRatio = computedFn(
    (bech32Address: string, poolId: string): IntPretty => {
      const pool = this.queryPools.getPool(poolId);
      if (!pool) {
        return new IntPretty(new Int(0)).ready(false);
      }

      const share = this.getLockedGammShare(bech32Address, poolId);
      // Remember that the unlockings are included in the locked.
      // So, no need to handle the unlockings here

      const totalShare = pool.totalShare;

      // To make it a percentage, multiply it by 10^2 at the end.
      return new IntPretty(
        share.quo(totalShare).mul(DecUtils.getTenExponentNInPrecisionRange(2))
      )
        .maxDecimals(2)
        .trim(true);
    }
  );

  readonly getLockedGammShareValue = computedFn(
    (
      bech32Address: string,
      poolId: string,
      poolLiqudity: PricePretty,
      fiatCurrency: FiatCurrency
    ): PricePretty => {
      const pool = this.queryPools.getPool(poolId);
      if (!pool) {
        return new PricePretty(fiatCurrency, new Dec(0));
      }

      const share = this.getLockedGammShare(bech32Address, poolId);
      // Remember that the unlockings are included in the locked.
      // So, no need to handle the unlockings here

      const totalShare = pool.totalShare;

      return poolLiqudity.mul(new IntPretty(share.quo(totalShare))).trim(true);
    }
  );

  readonly getUnlockingGammShare = computedFn(
    (bech32Address: string, poolId: string): CoinPretty => {
      const currency = this.getShareCurrency(poolId);

      const locked = this.queryUnlockingCoins
        .get(bech32Address)
        .unlockingCoins.find(
          (coin) => coin.currency.coinMinimalDenom === currency.coinMinimalDenom
        );
      if (locked) {
        return locked;
      }
      return new CoinPretty(currency, new Dec(0));
    }
  );

  readonly getAvailableGammShare = computedFn(
    (bech32Address: string, poolId: string): CoinPretty => {
      const currency = this.getShareCurrency(poolId);

      return this.queryBalances
        .getQueryBech32Address(bech32Address)
        .getBalanceFromCurrency(currency);
    }
  );

  /**
   * It also includes locked, unlocked, and unlocked shares.
   * @param bech32Address
   * @param poolId
   */
  readonly getAllGammShare = computedFn(
    (bech32Address: string, poolId: string): CoinPretty => {
      const available = this.getAvailableGammShare(bech32Address, poolId);
      // Note that Unlocking is also included in locked because it is not currently fluidized.
      const locked = this.getLockedGammShare(bech32Address, poolId);

      return available.add(locked);
    }
  );

  readonly getAllGammShareRatio = computedFn(
    (bech32Address: string, poolId: string): IntPretty => {
      const pool = this.queryPools.getPool(poolId);
      if (!pool) {
        return new IntPretty(new Int(0)).ready(false);
      }

      const share = this.getAllGammShare(bech32Address, poolId);

      const totalShare = pool.totalShare;

      totalShare.toDec().isZero();

      // To make it a percentage, multiply it by 10^2 at the end.
      return totalShare.toDec().isZero()
        ? new IntPretty(totalShare)
        : new IntPretty(
            share
              .quo(totalShare)
              .mul(DecUtils.getTenExponentNInPrecisionRange(2))
          )
            .maxDecimals(2)
            .trim(true);
    }
  );
}
