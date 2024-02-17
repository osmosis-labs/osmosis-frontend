import { OneClickTradingAuthenticatorType } from "@osmosis-labs/types";
import { apiClient } from "@osmosis-labs/utils";

import { ChainList } from "~/config/generated/chain-list";

export interface Authenticator {
  type: OneClickTradingAuthenticatorType;
  data: string;
  id: string;
}

export async function queryAuthenticators({ address }: { address: string }) {
  const url = new URL(
    `osmosis/authenticator/authenticators/${address}`,
    ChainList[0].apis.rest[0].address
  );
  const result = await apiClient<{ account_authenticators: Authenticator[] }>(
    url.toString()
  );

  return { authenticators: result.account_authenticators };
}
