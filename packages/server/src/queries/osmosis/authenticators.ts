import { RawAuthenticator } from "@osmosis-labs/types";

import { SPEND_LIMIT_CONTRACT_ADDRESS } from "../../env";
import { createNodeQuery } from "../base-utils";

export const queryAuthenticators = createNodeQuery<
  {
    account_authenticators: RawAuthenticator[];
  },
  { address: string }
>({
  path: ({ address }) => `osmosis/authenticator/authenticators/${address}`,
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
    const msg = JSON.stringify({
      spending: {
        account: address,
        authenticator_id: `${authenticatorId}.1`,
      },
    });
    const encodedMsg = Buffer.from(msg).toString("base64");

    return `/cosmwasm/wasm/v1/contract/${SPEND_LIMIT_CONTRACT_ADDRESS}/smart/${encodedMsg}`;
  },
});
