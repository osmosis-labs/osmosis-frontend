import { KVStore } from "@keplr-wallet/common";
import { QueriesStore } from "@keplr-wallet/stores";
import { makeObservable, observable, runInAction } from "mobx";

interface ICNSInfo {
  readonly chainId: string;
  readonly resolverContractAddress: string;
}

QueriesStore;

export class ICNSConfig {
  @observable.struct
  protected _icnsInfo?: ICNSInfo = undefined;

  private readonly _icnsInfoKVKey = "icns-info-kv";

  constructor(protected readonly kvStore: KVStore, _icnsInfo?: ICNSInfo) {
    this._icnsInfo = _icnsInfo;

    makeObservable(this);

    this.init();
  }

  protected async init() {
    /**
     *   Temporal solution for ICNS updates dynamically.
     * Follow Keplr's ICNS implementation.
     * @see https://github.com/chainapsis/keplr-wallet/blob/ed877e39c3e80b46ace91da088772a56f3bbb0b5/packages/extension/src/stores/ui-config/index.ts
     */
    try {
      const data = await this.kvStore.get<{
        readonly chainId: string;
        readonly resolverContractAddress: string;
      }>(this._icnsInfoKVKey);

      if (data) {
        runInAction(() => {
          this._icnsInfo = data;
        });
      }

      const icnsInfoFetched = await fetch(
        "https://icns-updates.s3.us-west-2.amazonaws.com/icns-info.json"
      );

      if (icnsInfoFetched.ok) {
        const icnsInfo = await icnsInfoFetched.json();

        if (
          icnsInfo &&
          typeof icnsInfo.chainId === "string" &&
          typeof icnsInfo.resolverContractAddress === "string"
        ) {
          runInAction(() => {
            this._icnsInfo = {
              chainId: icnsInfo.chainId,
              resolverContractAddress: icnsInfo.resolverContractAddress,
            };
          });

          await this.kvStore.set(this._icnsInfoKVKey, {
            chainId: icnsInfo.chainId,
            resolverContractAddress: icnsInfo.resolverContractAddress,
          });
        } else {
          runInAction(() => {
            this._icnsInfo = undefined;
          });

          await this.kvStore.set(this._icnsInfoKVKey, null);
        }
      }
    } catch (e) {
      // TODO: Error monitoring
      console.error(e);
    }
  }

  get icnsInfo() {
    return this._icnsInfo;
  }
}
