import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
  QueryResponse,
} from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";

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

  @computed
  get positionIds(): string[] {
    return (
      this.response?.data.positions.map(({ position }) => {
        return position.position_id;
      }) ?? []
    );
  }

  @computed
  get positions(): ObservableQueryLiquidityPositionById[] {
    return this.positionIds.map((id) => {
      return this.queryPositionsById.getForPositionId(id);
    });
  }
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
