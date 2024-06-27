import { RawAuthenticator } from "@osmosis-labs/types";

import { SPEND_LIMIT_CONTRACT_ADDRESS } from "../../env";
import { getQuerySmartContractPath } from "../cosmwasm";
import { createNodeQuery } from "../create-node-query";

export const queryAuthenticators = createNodeQuery<
  {
    account_authenticators: RawAuthenticator[];
  },
  { address: string }
>({
  path: ({ address }) => `osmosis/smartaccount/authenticators/${address}`,
});

interface AuthenticatorSpendLimitResponse {
  data: {
    spending: {
      /** Uint128 */
      value_spent_in_period: string;
      /** Timestamp */
      last_spent_at: string;
    };
  };
}

export const queryAuthenticatorSpendLimit = createNodeQuery<
  AuthenticatorSpendLimitResponse,
  {
    address: string;
    authenticatorId: string;
  }
>({
  path: ({ address, authenticatorId }) => {
    const msg = {
      spending: {
        account: address,
        authenticator_id: `${authenticatorId}.1`,
      },
    };

    return getQuerySmartContractPath({
      msg,
      contractAddress: SPEND_LIMIT_CONTRACT_ADDRESS!,
    });
  },
});
