import { HasMapStore, IQueriesStore } from "@keplr-wallet/stores";
import { Dec, Int } from "@keplr-wallet/unit";
import { maxTick, minTick } from "@osmosis-labs/math";
import {
  ObservableQueryLiquidityPositionsByAddress,
  ObservableQueryLiquidityPositionsById,
  OsmosisQueries,
} from "@osmosis-labs/stores";
import { computed, makeObservable } from "mobx";

export class ObservableMergedPositionByAddress {
  protected mergedPositionsByRange: { [rangeId: string]: string[] } = {};

  constructor(
    protected readonly queryPositionsById: ObservableQueryLiquidityPositionsById,
    protected readonly queryPositionsByAddress: ObservableQueryLiquidityPositionsByAddress,
    protected readonly address: string
  ) {
    makeObservable(this);
  }

  @computed
  get mergedRanges(): string[] {
    const map: {
      [rangeId: string]: string[];
    } = {};

    this.queryPositionsByAddress
      .getForAddress(this.address)
      ?.positionIds.forEach((positionId) => {
        const queryPositionById =
          this.queryPositionsById.getForPositionId(positionId);
        const rangeId =
          queryPositionById.position?.poolId +
          "_" +
          queryPositionById.position?.lowerTick +
          "_" +
          queryPositionById.position?.upperTick;
        map[rangeId] = map[rangeId] || [];
        map[rangeId].push(positionId);
      });

    this.mergedPositionsByRange = map;

    return Object.keys(this.mergedPositionsByRange);
  }

  calculateMergedPosition(
    poolId: string,
    lowerTick: string,
    upperTick: string
  ) {
    const rangeId = poolId + "_" + lowerTick + "_" + upperTick;

    const mergedPositionIds = this.mergedPositionsByRange[rangeId];

    let totalBaseAmount = new Dec(0);
    let totalQuoteAmount = new Dec(0);
    let totalLiquidity = new Dec(0);

    for (const positionId of mergedPositionIds) {
      const position = this.queryPositionsById.getForPositionId(positionId);
      const { baseAmount, quoteAmount } = position;
      totalBaseAmount = totalBaseAmount.add(baseAmount);
      totalQuoteAmount = totalQuoteAmount.add(quoteAmount);
      totalLiquidity = totalLiquidity.add(
        position.position?.liquidity || new Dec(0)
      );
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
}

export class ObservableMergedPositionsByAddress extends HasMapStore<ObservableMergedPositionByAddress> {
  constructor(
    protected readonly osmosisChainId: string,
    protected readonly queriesStore: IQueriesStore<OsmosisQueries>
  ) {
    super(
      (address: string) =>
        new ObservableMergedPositionByAddress(
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
