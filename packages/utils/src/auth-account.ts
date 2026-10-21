// Adapted from @keplr-wallet/cosmos@0.10.24 (Apache-2.0).
import { Int } from "@osmosis-labs/unit";

/**
 * The account number and sequence of an `x/auth` account, parsed from the
 * `/cosmos/auth/v1beta1/accounts/{address}` response. These values feed every
 * sign doc, so parsing must stay tolerant of the account wrappers chains use.
 */
export class BaseAccount {
  static async fetchFromRest(
    instance: {
      get: (
        path: string,
        options: { validateStatus: (status: number) => boolean }
      ) => Promise<{ data: { account?: any } }>;
    },
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

    // Unset until the account's first signed tx.
    const rawPubKey = value.pub_key || value.pubKey;
    const pubKey =
      rawPubKey?.["@type"] && rawPubKey?.key
        ? { typeUrl: String(rawPubKey["@type"]), key: String(rawPubKey.key) }
        : undefined;

    return new BaseAccount(
      type,
      address,
      new Int(value.account_number || "0"),
      new Int(value.sequence || "0"),
      pubKey
    );
  }

  constructor(
    protected readonly type: string,
    protected readonly address: string,
    protected readonly accountNumber: Int,
    protected readonly sequence: Int,
    /** Base64 `key` of a single-key pubkey; multisig keys have no `key` and stay unset. */
    protected readonly pubKey?: { typeUrl: string; key: string }
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

  getPubKey(): { typeUrl: string; key: string } | undefined {
    return this.pubKey;
  }
}
