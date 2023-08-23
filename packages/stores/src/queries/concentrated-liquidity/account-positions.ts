import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
  QueryResponse,
} from "@keplr-wallet/stores";
import { CoinPretty } from "@keplr-wallet/unit";
import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

import {
  ObservableQueryLiquidityPositionById,
  ObservableQueryLiquidityPositionsById,
} from "./position-by-id";
import { LiquidityPosition } from "./types";

const URL_BASE = "/osmosis/concentratedliquidity/v1beta1";

export class ObservableQueryAccountPositions extends ObservableChainQuery<{
  positions: LiquidityPosition[];
}> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly queryPositionsById: ObservableQueryLiquidityPositionsById,
    protected readonly bech32Address: string
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `${URL_BASE}/positions/${bech32Address}?pagination.limit=10000`
    );

    makeObservable(this);
  }

  protected canFetch() {
    return this.bech32Address !== "";
  }

  protected setResponse(
    response: Readonly<QueryResponse<{ positions: LiquidityPosition[] }>>
  ) {
    super.setResponse(response);
    for (const position of response.data.positions) {
      this.queryPositionsById.setWithPosition(position);
    }
  }

  /** IDs of all of user's CL positions. */
  @computed
  get positionIds(): string[] {
    return (
      this.response?.data.positions.map(({ position }) => {
        return position.position_id;
      }) ?? []
    );
  }

  /** List of CL positions for account. */
  @computed
  get positions(): ObservableQueryLiquidityPositionById[] {
    return this.positionIds.map((id) => {
      return this.queryPositionsById.getForPositionId(id);
    });
  }

  /** Aggregate of all coins in a user's list of CL positions. */
  @computed
  get totalPositionsAssets() {
    return this.getPositionsAssets(this.positions);
  }

  /** Aggregated list of coins for a user's pool's positions. */
  readonly totalPositionsAssetsInPool = computedFn((poolId: string) => {
    return this.getPositionsAssets(this.positionsInPool(poolId));
  });

  /** User account positions in a given pool of ID. */
  readonly positionsInPool = computedFn((poolId: string) => {
    return this.positions.filter((position) => position.poolId === poolId);
  });

  /** Aggregates the coins in the given positions array. */
  protected readonly getPositionsAssets = computedFn(
    (positions: ObservableQueryLiquidityPositionById[]) => {
      return Array.from(
        positions
          .reduce((balances, position) => {
            const addToMap = (coin: CoinPretty) => {
              const existingCoinBalance = balances.get(
                coin.currency.coinMinimalDenom
              );
              if (existingCoinBalance) {
                balances.set(
                  coin.currency.coinMinimalDenom,
                  existingCoinBalance.add(coin)
                );
              } else {
                balances.set(coin.currency.coinMinimalDenom, coin);
              }
            };
            if (position.baseAsset) {
              addToMap(position.baseAsset);
            }
            if (position.quoteAsset) {
              addToMap(position.quoteAsset);
            }
            position.totalClaimableRewards.forEach(addToMap);
            return balances;
          }, new Map<string, CoinPretty>())
          .values()
      );
    }
  );
}

export class ObservableQueryAccountsPositions extends ObservableChainQueryMap<{
  positions: LiquidityPosition[];
}> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    protected readonly queryPositionsById: ObservableQueryLiquidityPositionsById,
    chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (bech32Address: string) => {
      return new ObservableQueryAccountPositions(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        queryPositionsById,
        bech32Address
      );
    });
  }

  get(bech32Address: string) {
    return super.get(bech32Address) as ObservableQueryAccountPositions;
  }
}
