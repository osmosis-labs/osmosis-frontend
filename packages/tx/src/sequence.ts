import { Chain } from "@osmosis-labs/types";
import { Int } from "@osmosis-labs/unit";
import { apiClient, removeLastSlash } from "@osmosis-labs/utils";

export interface Account {
  getType(): string;
  getAddress(): string;
  getAccountNumber(): Int;
  getSequence(): Int;
}

export interface AccountResponse {
  account: BaseAccountJSON | null;
}

export interface BaseAccountJSON {
  "@type": string;
  address: string;
  pub_key?: {
    "@type": string;
    key: string;
  };
  account_number: string;
  sequence: string;
  base_account?: BaseAccountJSON;
  baseAccount?: BaseAccountJSON;
  BaseAccount?: BaseAccountJSON;
  account?: BaseAccountJSON;
  base_vesting_account?: BaseAccountJSON;
  baseVestingAccount?: BaseAccountJSON;
  BaseVestingAccount?: BaseAccountJSON;
}

export class BaseAccount {
  public static async fetchFromRest(
    rest: string,
    address: string,
    defaultBech32Address: boolean = false
  ): Promise<BaseAccount> {
    try {
      const result = await apiClient<AccountResponse>(
        `${removeLastSlash(rest)}/cosmos/auth/v1beta1/accounts/${address}`
      );

      return BaseAccount.fromProtoJSON(
        result,
        defaultBech32Address ? address : ""
      );
    } catch (error) {
      // Handle 404 case for non-existent accounts
      if (error instanceof Error && error.message.includes("404")) {
        return BaseAccount.fromProtoJSON(
          { account: null },
          defaultBech32Address ? address : ""
        );
      }
      throw error;
    }
  }

  public static fromProtoJSON(
    obj: AccountResponse,
    defaultBech32Address: string = ""
  ): BaseAccount {
    if (!obj.account) {
      // Case of not existing account.
      // {
      //   "code": 5,
      //   "message": "rpc error: code = NotFound desc = account {address} not found: key not found",
      //   "details": [
      //   ]
      // }
      if (!defaultBech32Address) {
        throw new Error(`Account's address is unknown: ${JSON.stringify(obj)}`);
      }

      return new BaseAccount("", defaultBech32Address, new Int(0), new Int(0));
    }

    let value = obj.account;
    const type = value["@type"] || "";

    // If the chain modifies the account type, handle the case where the account type embeds the base account.
    // (Actually, the only existent case is ethermint, and this is the line for handling ethermint)
    const baseAccount =
      value.BaseAccount || value.baseAccount || value.base_account;
    if (baseAccount) {
      value = baseAccount;
    }

    // If the chain modifies the account type, handle the case where the account type embeds the account.
    // (Actually, the only existent case is desmos, and this is the line for handling desmos)
    const embedAccount = value.account;
    if (embedAccount) {
      value = embedAccount;
    }

    // If the account is the vesting account that embeds the base vesting account,
    // the actual base account exists under the base vesting account.
    // But, this can be different according to the version of cosmos-sdk.
    // So, anyway, try to parse it by some ways...
    let baseVestingAccount =
      value.BaseVestingAccount ||
      value.baseVestingAccount ||
      value.base_vesting_account;
    while (baseVestingAccount) {
      value = baseVestingAccount;

      const baseAccount =
        value.BaseAccount || value.baseAccount || value.base_account;
      if (baseAccount) {
        value = baseAccount;
      }

      baseVestingAccount =
        value.BaseVestingAccount ||
        value.baseVestingAccount ||
        value.base_vesting_account;
    }

    let address = value.address;
    if (!address) {
      if (!defaultBech32Address) {
        throw new Error(`Account's address is unknown: ${JSON.stringify(obj)}`);
      }
      address = defaultBech32Address;
    }

    const accountNumber = value.account_number;
    const sequence = value.sequence;

    return new BaseAccount(
      type,
      address,
      new Int(accountNumber || "0"),
      new Int(sequence || "0")
    );
  }

  constructor(
    protected readonly type: string,
    protected readonly address: string,
    protected readonly accountNumber: Int,
    protected readonly sequence: Int
  ) {}

  getAccountNumber(): Int {
    return this.accountNumber;
  }

  getSequence(): Int {
    return this.sequence;
  }
}

export async function getAccountFromNode({
  chainId,
  address,
  chainList,
}: {
  chainId: string;
  address: string;
  chainList: Chain[];
}) {
  try {
    const endpoint = chainList.find(({ chain_id }) => chain_id === chainId)
      ?.apis.rest[0].address;

    if (!address) {
      throw new Error("Address is not provided");
    }

    if (!endpoint) {
      throw new Error("Endpoint is not provided");
    }

    const account = await BaseAccount.fetchFromRest(endpoint, address, true);

    return {
      accountNumber: account.getAccountNumber(),
      sequence: account.getSequence(),
    };
  } catch (error: any) {
    throw error;
  }
}
