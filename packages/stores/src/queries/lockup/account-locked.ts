import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
  QueryResponse,
} from "@keplr-wallet/stores";
import { AppCurrency } from "@keplr-wallet/types";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import dayjs from "dayjs";
import { Duration } from "dayjs/plugin/duration";
import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import { AccountLockedLongerDuration } from "./types";

export class ObservableQueryAccountLockedInner extends ObservableChainQuery<AccountLockedLongerDuration> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly bech32Address: string
  ) {
    // 좀 트윅한 방식으로 밑의 rest를 duration 설정 없이 이용해서 계정의 모든 lock들을 받아온다.
    super(
      kvStore,
      chainId,
      chainGetter,
      `/osmosis/lockup/v1beta1/account_locked_longer_duration/${bech32Address}`
    );

    makeObservable(this);
  }

  protected canFetch(): boolean {
    // 위의 쿼리는 주소가 비어있을 경우 모든 계정의 해당 결과를 리턴한다.
    // 하지만 이 특징은 이 프론트엔드에서는 필요가 없으므로 주소가 비어있으면 쿼리 자체를 하지 않는다.
    return this.bech32Address !== "";
  }

  protected setResponse(
    response: Readonly<QueryResponse<AccountLockedLongerDuration>>
  ) {
    super.setResponse(response);

    const chainInfo = this.chainGetter.getChain(this.chainId);
    const unknownCurrencies: string[] = [];
    for (const lock of response.data.locks) {
      unknownCurrencies.push(...lock.coins.map((coin) => coin.denom));
    }
    // Remove duplicates.
    chainInfo.addUnknownCurrencies(...[...new Set(unknownCurrencies)]);
  }

  /** Locked coins aggregated by coin denoms. */
  @computed
  get lockedCoins(): {
    duration: Duration;
    amount: CoinPretty;
    lockIds: string[];
  }[] {
    if (!this.response) {
      return [];
    }

    const matchedLocks = this.response.data.locks.filter((lock) => {
      // Locked tokens have 0 datetime
      return (
        new Date(lock.end_time).getFullYear() === 0 ||
        new Date(lock.end_time).getFullYear() === 1
      );
    });

    const coinDenomMap: Map<
      // key: <coin denom>/<duration seconds>
      string,
      {
        amount: CoinPretty;
        lockIds: string[];
        duration: Duration;
      }
    > = new Map();

    for (const lock of matchedLocks) {
      const seconds = parseInt(lock.duration.slice(0, -1));
      const curDuration = dayjs.duration({ seconds });

      for (const { denom, amount } of lock.coins) {
        const key = `${denom}/${seconds}`;
        const currency = this.chainGetter
          .getChain(this.chainId)
          .findCurrency(denom);

        if (currency) {
          if (!coinDenomMap.has(key)) {
            coinDenomMap.set(key, {
              amount: new CoinPretty(currency, new Dec(0)),
              lockIds: [],
              duration: curDuration,
            });
          }

          const curDenomValue = coinDenomMap.get(key);

          // aggregate any locks with the same denom and duration
          if (curDenomValue) {
            curDenomValue.amount = curDenomValue.amount.add(
              new CoinPretty(currency, new Dec(amount))
            );
            curDenomValue.lockIds.push(lock.ID);

            coinDenomMap.set(key, curDenomValue);
          }
        }
      }
    }

    return [...coinDenomMap.values()].sort((v1, v2) => {
      return v1.duration.asMilliseconds() > v2.duration.asMilliseconds()
        ? 1
        : -1;
    });
  }

  @computed
  get unlockingCoins(): {
    amount: CoinPretty;
    lockIds: string[];
    endTime: Date;
    duration: Duration;
  }[] {
    if (!this.response) {
      return [];
    }

    const matchedLocks = this.response.data.locks.filter((lock) => {
      // Filter the locked.
      return new Date(lock.end_time).getTime() > 0;
    });

    // End time 별로 구분하기 위한 map. key는 end time의 getTime()의 결과이다.
    const map: Map<
      string,
      {
        amount: CoinPretty;
        lockIds: string[];
        endTime: Date;
        duration: Duration;
      }
    > = new Map();

    for (const lock of matchedLocks) {
      for (const coin of lock.coins) {
        const currency = this.chainGetter
          .getChain(this.chainId)
          .findCurrency(coin.denom);

        if (currency) {
          const time = new Date(lock.end_time).getTime();
          const key =
            time.toString() +
            "/" +
            lock.duration +
            "/" +
            currency.coinMinimalDenom;
          if (!map.has(key)) {
            const seconds = parseInt(lock.duration.slice(0, -1));

            map.set(key, {
              amount: new CoinPretty(currency, new Dec(0)),
              lockIds: [],
              endTime: new Date(lock.end_time),
              duration: dayjs.duration({ seconds }),
            });
          }

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const value = map.get(key)!;
          value.amount = value.amount.add(
            new CoinPretty(currency, new Dec(coin.amount))
          );
          value.lockIds.push(lock.ID);

          map.set(key, value);
        }
      }
    }

    return [...map.values()].sort((v1, v2) => {
      // End time이 더 적은 lock을 우선한다.
      return v1.endTime > v2.endTime ? 1 : -1;
    });
  }

  readonly getLockedCoinWithDuration = computedFn(
    (
      currency: AppCurrency,
      duration: Duration
    ): {
      amount: CoinPretty;
      lockIds: string[];
    } => {
      if (!this.response) {
        return {
          amount: new CoinPretty(currency, new Dec(0)),
          lockIds: [],
        };
      }

      const matchedLocks = this.response.data.locks
        .filter((lock) => {
          // Accepts the lock duration with jitter (~1hour 1minute)
          // see: https://github.com/osmosis-labs/osmosis-frontend/issues/771
          return (
            Math.abs(
              Number.parseInt(lock.duration.replace("s", "")) -
                duration.asSeconds()
            ) <= 3_700
          );
        })
        .filter((lock) => {
          // Filter the unlocking, unlockable locks.
          return new Date(lock.end_time).getTime() <= 0;
        })
        .filter((lock) => {
          return (
            lock.coins.find(
              (coin) => coin.denom === currency.coinMinimalDenom
            ) != null
          );
        })
        .filter(
          (lock) =>
            Number(lock.duration.replace("s", "")) === duration.asSeconds()
        );

      let coin = new CoinPretty(currency, new Dec(0));
      for (const lock of matchedLocks) {
        const matchedCoin = lock.coins.find(
          (coin) => coin.denom === currency.coinMinimalDenom
        );
        if (matchedCoin) {
          coin = coin.add(
            new CoinPretty(currency, new Dec(matchedCoin.amount))
          );
        }
      }

      return {
        amount: coin,
        lockIds: matchedLocks.map((lock) => lock.ID),
      };
    }
  );

  readonly getUnlockingCoinsWithDuration = computedFn(
    (
      duration: Duration
    ): {
      amount: CoinPretty;
      lockIds: string[];
      endTime: Date;
    }[] => {
      if (!this.response) {
        return [];
      }

      const matchedLocks = this.response.data.locks
        .filter((lock) => {
          // Accepts the lock duration with jitter (~60s)
          return (
            Math.abs(
              Number.parseInt(lock.duration.replace("s", "")) -
                duration.asSeconds()
            ) <= 60
          );
        })
        .filter((lock) => {
          // Filter the locked.
          return new Date(lock.end_time).getTime() > 0;
        })
        .filter(
          (lock) =>
            Number(lock.duration.replace("s", "")) === duration.asSeconds()
        );

      // End time 별로 구분하기 위한 map. key는 end time의 getTime()의 결과이다.
      const map: Map<
        string,
        {
          amount: CoinPretty;
          lockIds: string[];
          endTime: Date;
        }
      > = new Map();

      for (const lock of matchedLocks) {
        for (const coin of lock.coins) {
          const currency = this.chainGetter
            .getChain(this.chainId)
            .findCurrency(coin.denom);

          if (currency) {
            const time = new Date(lock.end_time).getTime();
            if (!map.has(time.toString() + "/" + currency.coinMinimalDenom)) {
              map.set(time.toString() + "/" + currency.coinMinimalDenom, {
                amount: new CoinPretty(currency, new Dec(0)),
                lockIds: [],
                endTime: new Date(lock.end_time),
              });
            }

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const value = map.get(
              time.toString() + "/" + currency.coinMinimalDenom
            )!;
            value.amount = value.amount.add(
              new CoinPretty(currency, new Dec(coin.amount))
            );
            value.lockIds.push(lock.ID);

            map.set(time.toString() + "/" + currency.coinMinimalDenom, value);
          }
        }
      }

      return [...map.values()].sort((v1, v2) => {
        // End time이 더 적은 lock을 우선한다.
        return v1.endTime > v2.endTime ? 1 : -1;
      });
    }
  );

  readonly getUnlockingCoinWithDuration = computedFn(
    (
      currency: AppCurrency,
      duration: Duration
    ): {
      amount: CoinPretty;
      lockIds: string[];
      endTime: Date;
    }[] => {
      if (!this.response) {
        return [];
      }

      const matchedLocks = this.response.data.locks
        .filter((lock) => {
          // Accepts the lock duration with jitter (~60s)
          return (
            Math.abs(
              Number.parseInt(lock.duration.replace("s", "")) -
                duration.asSeconds()
            ) <= 60
          );
        })
        .filter((lock) => {
          // Filter the locked.
          return new Date(lock.end_time).getTime() > 0;
        })
        .filter((lock) => {
          return (
            lock.coins.find(
              (coin) => coin.denom === currency.coinMinimalDenom
            ) != null
          );
        });

      // End time 별로 구분하기 위한 map. key는 end time의 getTime()의 결과이다.
      const map: Map<
        number,
        {
          amount: CoinPretty;
          lockIds: string[];
          endTime: Date;
        }
      > = new Map();

      for (const lock of matchedLocks) {
        const matchedCoin = lock.coins.find(
          (coin) => coin.denom === currency.coinMinimalDenom
        );
        if (matchedCoin) {
          const time = new Date(lock.end_time).getTime();
          if (!map.has(time)) {
            map.set(time, {
              amount: new CoinPretty(currency, new Dec(0)),
              lockIds: [],
              endTime: new Date(lock.end_time),
            });
          }

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const value = map.get(time)!;
          value.amount = value.amount.add(
            new CoinPretty(currency, new Dec(matchedCoin.amount))
          );
          value.lockIds.push(lock.ID);

          map.set(time, value);
        }
      }

      return [...map.values()].sort((v1, v2) => {
        // End time이 더 적은 lock을 우선한다.
        return v1.endTime > v2.endTime ? 1 : -1;
      });
    }
  );
}

export class ObservableQueryAccountLocked extends ObservableChainQueryMap<AccountLockedLongerDuration> {
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, (bech32Address: string) => {
      return new ObservableQueryAccountLockedInner(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        bech32Address
      );
    });
  }

  get(bech32Address: string): ObservableQueryAccountLockedInner {
    return super.get(bech32Address) as ObservableQueryAccountLockedInner;
  }
}
