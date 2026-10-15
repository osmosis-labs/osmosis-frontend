import type { KVStore } from "@osmosis-labs/utils";
import { makeObservable, observable, runInAction } from "mobx";
import { DeepReadonly, UnionToIntersection } from "utility-types";

import {
  ChainedFunctionifyTuple,
  ChainGetter,
  IObject,
  mergeStores,
} from "../common";
import { ObservableQueryBalances } from "./balances";

export interface QueriesSetBase {
  readonly queryBalances: DeepReadonly<ObservableQueryBalances>;
}

export const createQueriesSetBase = (
  kvStore: KVStore,
  chainId: string,
  chainGetter: ChainGetter
): QueriesSetBase => {
  return {
    queryBalances: new ObservableQueryBalances(kvStore, chainId, chainGetter),
  };
};

export interface IQueriesStore<T extends IObject = {}> {
  get(chainId: string): DeepReadonly<QueriesSetBase & T>;
}

export class QueriesStore<Injects extends Array<IObject>> {
  @observable.shallow
  protected queriesMap: Map<
    string,
    QueriesSetBase & UnionToIntersection<Injects[number]>
  > = new Map();

  protected readonly queriesCreators: ChainedFunctionifyTuple<
    QueriesSetBase,
    // kvStore: KVStore,
    // chainId: string,
    // chainGetter: ChainGetter
    [KVStore, string, ChainGetter],
    Injects
  >;

  constructor(
    protected readonly kvStore: KVStore,
    protected readonly chainGetter: ChainGetter,
    ...queriesCreators: ChainedFunctionifyTuple<
      QueriesSetBase,
      // kvStore: KVStore,
      // chainId: string,
      // chainGetter: ChainGetter
      [KVStore, string, ChainGetter],
      Injects
    >
  ) {
    this.queriesCreators = queriesCreators;

    makeObservable(this);
  }

  get(
    chainId: string
  ): DeepReadonly<QueriesSetBase & UnionToIntersection<Injects[number]>> {
    if (!this.queriesMap.has(chainId)) {
      const queriesSetBase = createQueriesSetBase(
        this.kvStore,
        chainId,
        this.chainGetter
      );
      runInAction(() => {
        const merged = mergeStores(
          queriesSetBase,
          [this.kvStore, chainId, this.chainGetter],
          // @ts-ignore
          ...this.queriesCreators
        );

        // @ts-ignore
        this.queriesMap.set(chainId, merged);
      });
    }

    return this.queriesMap.get(chainId)! as DeepReadonly<
      QueriesSetBase & UnionToIntersection<Injects[number]>
    >;
  }
}
