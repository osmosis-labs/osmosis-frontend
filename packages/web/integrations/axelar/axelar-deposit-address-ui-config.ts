import { AxelarAssetTransfer, Environment } from "@axelar-network/axelarjs-sdk";
import { action, makeObservable, observable } from "mobx";
import { fromPromise, IPromiseBasedObservable } from "mobx-utils";

/** Manages a cache of Axelar requests for deposit addresses */
export class ObservableAxelarUIConfig {
  private readonly className = "ObservableAxelarUIConfig";

  private readonly _AxelarAssetTransfer: AxelarAssetTransfer;

  @observable
  private observablePromiseCache = new Map<
    string,
    IPromiseBasedObservable<string | undefined>
  >();

  constructor(environment = Environment.MAINNET) {
    makeObservable(this);
    this._AxelarAssetTransfer = new AxelarAssetTransfer({ environment });
  }

  getGeneratedAddress(
    sourceChain: string,
    destChain: string,
    destinationAddress: string,
    coinMinimalDenom: string,
    shouldUnwrapIntoNative: boolean | undefined
  ) {
    const cacheKey = `${sourceChain}/${destChain}/${destinationAddress}/${coinMinimalDenom}/${Boolean(
      shouldUnwrapIntoNative
    )}`;
    if (!this.observablePromiseCache.has(cacheKey)) {
      const requestGeneratedAddress = async () => {
        try {
          return await this._AxelarAssetTransfer.getDepositAddress({
            fromChain: sourceChain,
            toChain: destChain,
            destinationAddress: destinationAddress,
            asset: coinMinimalDenom,
            options: { shouldUnwrapIntoNative },
          });
        } catch (e: unknown) {
          if (e instanceof Error) {
            console.error(`${this.className}: ${e.message}`);
          } else {
            console.error(
              `${this.className}: Unknown error in getGeneratedAddress`
            );
          }
          throw e;
        }
      };

      this.setCacheRecord(cacheKey, requestGeneratedAddress());
    }
    return this.observablePromiseCache.get(cacheKey);
  }

  // Move the set into an action to avoid having a lookup in the action
  @action
  private setCacheRecord(
    cacheKey: string,
    promiseToObserver: Promise<string | undefined>
  ) {
    const observablePromise = fromPromise(promiseToObserver);
    this.observablePromiseCache.set(cacheKey, observablePromise);
  }
}
