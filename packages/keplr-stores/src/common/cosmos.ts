// Adapted from @keplr-wallet/cosmos@0.10.24 (Apache-2.0).
import { Int } from "@osmosis-labs/unit";
import type { AxiosInstance } from "axios";

export class ChainIdHelper {
  /** Matches chain IDs of the form `{identifier}-{version}`, e.g. `osmosis-1`. */
  static readonly VersionFormatRegExp = /(.+)-([\d]+)/;

  static parse(chainId: string): { identifier: string; version: number } {
    const split = chainId
      .split(ChainIdHelper.VersionFormatRegExp)
      .filter(Boolean);
    if (split.length !== 2) {
      return { identifier: chainId, version: 0 };
    }
    return { identifier: split[0], version: parseInt(split[1]) };
  }

  static hasChainVersion(chainId: string): boolean {
    return ChainIdHelper.parse(chainId).identifier !== chainId;
  }
}

/**
 * The account number and sequence of an `x/auth` account, parsed from the
 * `/cosmos/auth/v1beta1/accounts/{address}` response. These values feed every
 * sign doc, so parsing must stay tolerant of the account wrappers chains use.
 */
export class BaseAccount {
  static async fetchFromRest(
    instance: AxiosInstance,
    address: string,
    // A nonexistent account returns 404 with no address. When set, fall back to
    // `address` and zero account number/sequence instead of throwing.
    defaultBech32Address = false
  ): Promise<BaseAccount> {
    const result = await instance.get(
      `/cosmos/auth/v1beta1/accounts/${address}`,
      {
        validateStatus: (status) =>
          (status >= 200 && status < 300) || status === 404,
      }
    );

    return BaseAccount.fromProtoJSON(
      result.data,
      defaultBech32Address ? address : ""
    );
  }

  static fromProtoJSON(
    obj: { account?: any },
    defaultBech32Address = ""
  ): BaseAccount {
    if (!obj.account) {
      if (!defaultBech32Address) {
        throw new Error(`Account's address is unknown: ${JSON.stringify(obj)}`);
      }
      return new BaseAccount("", defaultBech32Address, new Int(0), new Int(0));
    }

    let value = obj.account;
    const type: string = value["@type"] || "";

    // Some account types embed the base account (e.g. ethermint's EthAccount).
    const baseAccount =
      value.BaseAccount || value.baseAccount || value.base_account;
    if (baseAccount) {
      value = baseAccount;
    }

    // Some account types embed the whole account (e.g. desmos profiles).
    if (value.account) {
      value = value.account;
    }

    // Vesting accounts nest the base account under the base vesting account;
    // the field casing depends on the cosmos-sdk version.
    const baseVestingAccount =
      value.BaseVestingAccount ||
      value.baseVestingAccount ||
      value.base_vesting_account;
    if (baseVestingAccount) {
      value = baseVestingAccount;
      const nestedBaseAccount =
        value.BaseAccount || value.baseAccount || value.base_account;
      if (nestedBaseAccount) {
        value = nestedBaseAccount;
      }
    }

    let address: string = value.address;
    if (!address) {
      if (!defaultBech32Address) {
        throw new Error(`Account's address is unknown: ${JSON.stringify(obj)}`);
      }
      address = defaultBech32Address;
    }

    return new BaseAccount(
      type,
      address,
      new Int(value.account_number || "0"),
      new Int(value.sequence || "0")
    );
  }

  constructor(
    protected readonly type: string,
    protected readonly address: string,
    protected readonly accountNumber: Int,
    protected readonly sequence: Int
  ) {}

  getType(): string {
    return this.type;
  }

  getAddress(): string {
    return this.address;
  }

  getAccountNumber(): Int {
    return this.accountNumber;
  }

  getSequence(): Int {
    return this.sequence;
  }
}
