import { observable, autorun, makeObservable, runInAction } from "mobx";
import { ObservableQuery } from "@keplr-wallet/stores";

/** Wraps an ordered list of similar query stores and falls back to the first store that returns a valid response. */
export class FallbackStore<TStore extends ObservableQuery> {
  @observable.ref
  protected _responsiveStore: TStore;

  constructor(readonly orderedStores: TStore[]) {
    if (orderedStores.length === 0) {
      throw new Error("Must provide at least one store.");
    }

    this._responsiveStore = orderedStores[0];

    // Runs any time error changes in current store.
    autorun(() => {
      if (this._responsiveStore.error) {
        // If the current store has an error, fallback to the next store.
        const index = orderedStores.indexOf(this._responsiveStore);
        if (index < orderedStores.length - 1) {
          runInAction(() => (this._responsiveStore = orderedStores[index + 1]));
        } else {
          console.warn(
            "FallbackStore ran out of fallback stores. Last store error:",
            this._responsiveStore.error
          );
        }
      }
    });

    makeObservable(this);
  }

  get responsiveStore(): TStore {
    return this._responsiveStore;
  }
}
