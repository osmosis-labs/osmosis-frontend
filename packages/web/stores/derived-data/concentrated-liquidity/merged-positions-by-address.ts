import { HasMapStore, IQueriesStore } from "@keplr-wallet/stores";
import { CoinPretty, Dec, Int } from "@keplr-wallet/unit";
import { maxTick, minTick } from "@osmosis-labs/math";
import {
  ObservableQueryLiquidityPositionsByAddress,
  ObservableQueryLiquidityPositionsById,
  ObservableQueryPoolGetter,
  OsmosisQueries,
} from "@osmosis-labs/stores";
import { computed, makeObservable } from "mobx";
import { computedFn } from "mobx-utils";

export class ObservableMergedPositionByAddress {
  protected mergedPositionsByRange: { [rangeId: string]: string[] } = {};

  constructor(
    protected readonly queryPools: ObservableQueryPoolGetter,
    protected readonly queryPositionsById: ObservableQueryLiquidityPositionsById,
    protected readonly queryPositionsByAddress: ObservableQueryLiquidityPositionsByAddress,
    protected readonly bech32Address: string
  ) {
    makeObservable(this);
  }

  @computed
  get mergedRanges(): string[] {
    const map: {
      [rangeId: string]: string[];
    } = {};

    this.queryPositionsByAddress
      .getForAddress(this.bech32Address)
      ?.positionIds.forEach((positionId) => {
        const queryPositionById =
          this.queryPositionsById.getForPositionId(positionId);
        const rangeId =
          queryPositionById?.poolId +
          "_" +
          queryPositionById?.lowerTick +
          "_" +
          queryPositionById?.upperTick;
        map[rangeId] = map[rangeId] || [];
        map[rangeId].push(positionId);
      });

    this.mergedPositionsByRange = map;

    return Object.keys(this.mergedPositionsByRange);
  }

  /** Merges positions based on the pool and integer lower and upper tick values. */
  readonly calculateMergedPosition = computedFn(
    (poolId: string, lowerTick: string, upperTick: string) => {
      const rangeId = poolId + "_" + lowerTick + "_" + upperTick;

      const mergedPositionIds = this.mergedPositionsByRange[rangeId];
      const queryPool = this.queryPools.getPool(poolId);

      if (!queryPool || queryPool?.type !== "concentrated") return;

      let totalBaseAmount = new CoinPretty(
        queryPool.poolAssets[0].amount.currency,
        0
      );
      let totalQuoteAmount = new CoinPretty(
        queryPool.poolAssets[1].amount.currency,
        0
      );
      let totalLiquidity = new Dec(0);

      for (const positionId of mergedPositionIds) {
        const position = this.queryPositionsById.getForPositionId(positionId);
        const { baseAsset, quoteAsset } = position;
        if (!baseAsset || !quoteAsset) continue;
        totalBaseAmount = totalBaseAmount.add(baseAsset);
        totalQuoteAmount = totalQuoteAmount.add(quoteAsset);
        totalLiquidity = totalLiquidity.add(position.liquidity || new Dec(0));
      }

      return {
        lowerTick: new Int(lowerTick),
        upperTick: new Int(upperTick),
        poolId: poolId,
        liquidity: totalLiquidity,
        baseAmount: totalBaseAmount,
        quoteAmount: totalQuoteAmount,
        positionIds: mergedPositionIds || [],
        passive:
          minTick.equals(new Int(lowerTick)) &&
          maxTick.equals(new Int(upperTick)),
      };
    }
  );
}

export class ObservableMergedPositionsByAddress extends HasMapStore<ObservableMergedPositionByAddress> {
  constructor(
    protected readonly osmosisChainId: string,
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>
  ) {
    super(
      (address: string) =>
        new ObservableMergedPositionByAddress(
          this.queriesStore.get(this.osmosisChainId).osmosis!.queryGammPools,
          this.queriesStore.get(
            this.osmosisChainId
          ).osmosis!.queryLiquidityPositionsById,
          this.queriesStore.get(
            this.osmosisChainId
          ).osmosis!.queryLiquidityPositionsByAddress,
          address
        )
    );
  }

  get(address: string): ObservableMergedPositionByAddress {
    return super.get(address);
  }
}
