import { KVStore } from "@keplr-wallet/common";
import {
  ChainGetter,
  ObservableChainQuery,
  ObservableChainQueryMap,
  QueryResponse,
} from "@keplr-wallet/stores";
import { computed, makeObservable } from "mobx";

import { ObservableQueryLiquidityPositionsById } from "./positions-by-id";
import { LiquidityPosition } from "./types";

type QueryStoreParams = {
  address: string;
};

const URL_BASE = "/osmosis/concentratedliquidity/v1beta1";

export class ObservableQueryLiquidityPositionByAddress extends ObservableChainQuery<{
  positions: LiquidityPosition[];
}> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    chainGetter: ChainGetter,
    protected readonly queryPositionsById: ObservableQueryLiquidityPositionsById,
    protected readonly params: QueryStoreParams
  ) {
    super(
      kvStore,
      chainId,
      chainGetter,
      `${URL_BASE}/positions/${params.address}`
    );

    makeObservable(this);
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
}

export class ObservableQueryLiquidityPositionsByAddress extends ObservableChainQueryMap<{
  positions: LiquidityPosition[];
}> {
  constructor(
    kvStore: KVStore,
    chainId: string,
    protected readonly queryPositionsById: ObservableQueryLiquidityPositionsById,
    chainGetter: ChainGetter
  ) {
    super(kvStore, chainId, chainGetter, (address: string) => {
      return new ObservableQueryLiquidityPositionByAddress(
        this.kvStore,
        this.chainId,
        this.chainGetter,
        queryPositionsById,
        { address }
      );
    });
  }

  getForAddress(address: string) {
    return super.get(address) as ObservableQueryLiquidityPositionByAddress;
  }
}
