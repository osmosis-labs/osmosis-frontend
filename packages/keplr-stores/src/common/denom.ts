// Adapted from @keplr-wallet/common@0.10.24 (Apache-2.0).

/**
 * Splits a currency's minimal denom into its token type and contract address.
 * Contract-based tokens use the form `type:contractAddress:denom` (e.g. `cw20:osmo1…:foo`);
 * anything else is a native denom.
 */
export class DenomHelper {
  protected readonly _type: string;
  protected readonly _contractAddress: string;

  constructor(protected readonly _denom: string) {
    const split = this.denom.split(/(\w+):(\w+):(.+)/).filter(Boolean);
    if (split.length !== 1 && split.length !== 3) {
      throw new Error(`Invalid denom: ${this.denom}`);
    }

    this._type = split.length === 3 ? split[0] : "";
    this._contractAddress = split.length === 3 ? split[1] : "";
  }

  get denom(): string {
    return this._denom;
  }

  get type(): string {
    return this._type || "native";
  }

  get contractAddress(): string {
    return this._contractAddress;
  }
}
