import { KVStore } from "@keplr-wallet/common";
import { ChainGetter, ObservableChainQuery } from "@keplr-wallet/stores";
import { Dec, Int } from "@keplr-wallet/unit";
import { maxTick, minTick, tickToSqrtPrice } from "@osmosis-labs/math";
import { computed, makeObservable } from "mobx";

import { LiquidityPosition, PositionAsset, PositionData } from "./types";

type QueryStoreParams = {
  positionId: string;
  position?: LiquidityPosition;
};

const URL_BASE = "/osmosis/concentratedliquidity/v1beta1";

export class ObservableQueryLiquidityPosition {
  protected readonly _position?: LiquidityPosition;

  protected readonly _query?: ObservableChainQuery<{
    position: LiquidityPosition;
  }>;

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly params: QueryStoreParams
  ) {
    if (params.position) {
      this._position = params.position;
    } else {
      this._query = new ObservableChainQuery<{
        position: LiquidityPosition;
      }>(
        kvStore,
        chainId,
        chainGetter,
        `${URL_BASE}/position_by_id?position_id=${params.positionId}`
      );
    }

    makeObservable(this);
  }

  get response() {
    return this._query?.response;
  }

  @computed
  get position(): PositionData | undefined {
    let position;

    if (this.response) {
      position = this.response.data.position.position;
    } else if (this._position) {
      position = this._position.position;
    }

    if (!position) return undefined;

    return mapPositionFromPayload(position);
  }

  @computed
  get baseAsset(): PositionAsset | undefined {
    let asset0;

    if (this.response) {
      asset0 = this.response.data.position.asset0;
    } else if (this._position) {
      asset0 = this._position.asset0;
    }

    return asset0;
  }

  @computed
  get baseDenom(): string {
    return this.baseAsset?.denom ?? "";
  }

  @computed
  get baseAmount(): Dec {
    return new Dec(this.baseAsset?.amount ?? "0");
  }

  @computed
  get quoteAsset(): PositionAsset | undefined {
    let asset1;

    if (this.response) {
      asset1 = this.response.data.position.asset1;
    } else if (this._position) {
      asset1 = this._position.asset1;
    }

    return asset1;
  }

  @computed
  get quoteDenom(): string {
    return this.quoteAsset?.denom ?? "";
  }

  @computed
  get quoteAmount(): Dec {
    return new Dec(this.quoteAsset?.amount ?? "0");
  }
}

export class ObservableQueryLiquidityPositionsByAddress extends ObservableChainQuery<{
  positions: LiquidityPosition[];
}> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly params: {
      address: string;
    }
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `${URL_BASE}/positions/${params.address}`
    );

    makeObservable(this);
  }

  @computed
  get positionIds(): string[] {
    return (
      this.response?.data.positions.map(({ position }) => {
        return position.position_id;
      }) ?? []
    );
  }

  @computed
  get mergedPositionIds(): string[][] {
    const map: {
      [rangeId: string]: string[];
    } = {};

    this.response?.data.positions.forEach(({ position }) => {
      const rangeId = position.lower_tick + "_" + position.upper_tick;
      map[rangeId] = map[rangeId] || [];
      map[rangeId].push(position.position_id);
    });

    return Object.values(map);
  }
}

class ObservableMergedPositions {
  constructor(
    protected readonly positionsIds: string[],
    protected readonly getForPositionId: (
      positionId: string
    ) => ObservableQueryLiquidityPosition
  ) {}

  @computed
  get address(): string {
    const pos = this.getForPositionId(this.positionsIds[0]);
    return pos.position?.address ?? "";
  }

  @computed
  get poolId(): string {
    const pos = this.getForPositionId(this.positionsIds[0]);
    return pos.position?.poolId ?? "";
  }

  @computed
  get baseDenom(): string {
    return this.getForPositionId(this.positionsIds[0]).baseDenom;
  }

  @computed
  get quoteDenom(): string {
    return this.getForPositionId(this.positionsIds[0]).quoteDenom;
  }

  @computed
  get passive(): boolean {
    const [lowerTick, upperTick] = this.tickRange;

    if (!lowerTick || !upperTick) return false;

    return lowerTick.equals(minTick) && upperTick.equals(maxTick);
  }

  @computed
  get tickRange(): [Int, Int] | [] {
    const pos = this.getForPositionId(this.positionsIds[0]);
    return pos.position ? [pos.position.lowerTick, pos.position.upperTick] : [];
  }

  @computed
  get priceRange(): [Dec, Dec] {
    const lowerTick = this.tickRange[0];
    const upperTick = this.tickRange[1];

    if (!lowerTick || !upperTick) return [new Dec(0), new Dec(0)];

    const lowerSqrt = tickToSqrtPrice(lowerTick);
    const upperSqrt = tickToSqrtPrice(upperTick);

    return [lowerSqrt.mul(lowerSqrt), upperSqrt.mul(upperSqrt)];
  }

  @computed
  get baseAmount() {
    let amt = new Dec(0);
    for (const positionId of this.positionsIds) {
      const { baseAmount } = this.getForPositionId(positionId);
      amt = amt.add(baseAmount);
    }
    return amt;
  }

  @computed
  get quoteAmount() {
    let amt = new Dec(0);
    for (const positionId of this.positionsIds) {
      const { quoteAmount } = this.getForPositionId(positionId);
      amt = amt.add(quoteAmount);
    }
    return amt;
  }

  @computed
  get position() {
    const [lowerTick, upperTick] = this.tickRange;

    if (!lowerTick || !upperTick) return;

    let liquidity = new Dec(0);

    for (const positionId of this.positionsIds) {
      const { position } = this.getForPositionId(positionId);

      if (!position) return;
      if (!position.lowerTick.equals(lowerTick))
        throw new Error("tick ranges must the same");
      if (!position.upperTick.equals(upperTick))
        throw new Error("tick ranges must the same");
      if (position.poolId !== this.poolId)
        throw new Error("pool id must the same");
      if (position.address !== this.address)
        throw new Error("address must the same");

      liquidity = liquidity.add(position.liquidity);
    }

    return {
      liquidity,
      poolId: this.poolId,
      address: this.address,
      lowerTick,
      upperTick,
    };
  }
}

export class ObservableQueryLiquidityPositions {
  protected readonly _addressQueries: Map<
    string,
    ObservableQueryLiquidityPositionsByAddress
  > = new Map<string, ObservableQueryLiquidityPositionsByAddress>();

  protected readonly _positionQueries: Map<
    string,
    ObservableQueryLiquidityPosition
  > = new Map<string, ObservableQueryLiquidityPosition>();

  protected readonly _mergedPositions: Map<string, ObservableMergedPositions> =
    new Map<string, ObservableMergedPositions>();

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainId: string,
    protected readonly chainGetter: ChainGetter
  ) {}

  async getForAddress(
    address: string
  ): Promise<ObservableQueryLiquidityPositionsByAddress> {
    if (!this._addressQueries.has(address)) {
      const addressQuery = new ObservableQueryLiquidityPositionsByAddress(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        { address }
      );
      this._addressQueries.set(address, addressQuery);

      await addressQuery.waitResponse();
      addressQuery.response?.data.positions.forEach((liquidityPosition) => {
        const positionId = liquidityPosition.position.position_id;
        if (!this._positionQueries.has(positionId)) {
          this._positionQueries.set(
            positionId,
            new ObservableQueryLiquidityPosition(
              this.kvStore,
              this.chainId,
              this.chainGetter,
              { positionId, position: liquidityPosition }
            )
          );
        }
      });
    }

    return this._addressQueries.get(
      address
    ) as ObservableQueryLiquidityPositionsByAddress;
  }

  getForPositionId = (positionId: string): ObservableQueryLiquidityPosition => {
    if (!this._positionQueries.has(positionId)) {
      this._positionQueries.set(
        positionId,
        new ObservableQueryLiquidityPosition(
          this.kvStore,
          this.chainId,
          this.chainGetter,
          { positionId }
        )
      );
    }

    return this._positionQueries.get(
      positionId
    ) as ObservableQueryLiquidityPosition;
  };

  getMergedPositions(positionIds: string[]): ObservableMergedPositions {
    const key = positionIds.join("_");
    if (!this._mergedPositions.has(key)) {
      this._mergedPositions.set(
        key,
        new ObservableMergedPositions(positionIds, this.getForPositionId)
      );
    }

    return this._mergedPositions.get(key) as ObservableMergedPositions;
  }
}

function mapPositionFromPayload(
  position: LiquidityPosition["position"]
): PositionData {
  return {
    positionId: position.position_id,
    poolId: position.pool_id,
    address: position.address,
    lowerTick: new Int(position.lower_tick),
    upperTick: new Int(position.upper_tick),
    joinTime: new Date(position.join_time),
    liquidity: new Dec(position.liquidity),
  };
}
