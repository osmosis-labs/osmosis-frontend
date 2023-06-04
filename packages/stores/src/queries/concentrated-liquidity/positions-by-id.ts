import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
  QueryResponse,
} from "@keplr-wallet/stores";
import { Dec, Int } from "@keplr-wallet/unit";
import { action, computed, makeObservable, observable } from "mobx";

import { LiquidityPosition, PositionAsset, PositionData } from "./types";

type QueryStoreParams = {
  positionId: string;
};

const URL_BASE = "/osmosis/concentratedliquidity/v1beta1";

/** Stores liquidity data for a single pool. */
export class ObservableQueryLiquidityPositionById extends ObservableChainQuery<LiquidityPosition> {
  @observable.ref
  protected _raw?: LiquidityPosition;

  @observable
  protected _canFetch = false;

  @computed
  get position(): PositionData | undefined {
    if (!this._raw) return;
    return mapPositionFromPayload(this._raw.position);
  }

  @computed
  get baseAsset(): PositionAsset | undefined {
    return this._raw?.asset0;
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
    return this._raw?.asset1;
  }

  @computed
  get quoteDenom(): string {
    return this.quoteAsset?.denom ?? "";
  }

  @computed
  get quoteAmount(): Dec {
    return new Dec(this.quoteAsset?.amount ?? "0");
  }

  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly params: QueryStoreParams
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `${URL_BASE}/position_by_id?position_id=${params.positionId}`
    );

    makeObservable(this);
  }

  get hasData() {
    return this._raw !== undefined;
  }

  @action
  allowFetch() {
    this._canFetch = true;
  }

  protected canFetch() {
    return this._canFetch;
  }

  protected setResponse(response: Readonly<QueryResponse<LiquidityPosition>>) {
    super.setResponse(response);
    this.setRaw(response.data);
  }

  @action
  setRaw(position: LiquidityPosition) {
    this._raw = position;
  }

  static makeWithRaw(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    position: LiquidityPosition
  ) {
    const queryGauge = new ObservableQueryLiquidityPositionById(
      kvStore,
      chainId,
      chainGetter,
      { positionId: position.position.position_id }
    );

    queryGauge.setRaw(position);
    return queryGauge;
  }
}

export class ObservableQueryLiquidityPositionsById extends ObservableChainQueryMap<LiquidityPosition> {
  protected _fetchingPositionIds: Set<string> = new Set();
  constructor(kvStore: KVStore, chainId: string, chainGetter: ChainGetter) {
    super(kvStore, chainId, chainGetter, (positionId: string) => {
      return new ObservableQueryLiquidityPositionById(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        { positionId }
      );
    });
  }

  getForPositionId(positionId: string) {
    return super.get(positionId) as ObservableQueryLiquidityPositionById;
  }

  @action
  setWithPosition(position: LiquidityPosition) {
    const {
      position: { position_id },
    } = position;
    const queryLiquidityPosition =
      ObservableQueryLiquidityPositionById.makeWithRaw(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        position
      );

    if (
      !queryLiquidityPosition.hasData &&
      !this._fetchingPositionIds.has(position_id)
    ) {
      this._fetchingPositionIds.add(position_id);
      queryLiquidityPosition.allowFetch();
      queryLiquidityPosition
        .waitResponse()
        .finally(() => this._fetchingPositionIds.delete(position_id));
    }

    this.map.set(position.position.position_id, queryLiquidityPosition);
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
