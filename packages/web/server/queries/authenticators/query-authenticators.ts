import { ChainList } from "~/config/generated/chain-list";
import { apiClient } from "~/utils/api-client";

export interface Authenticator {
  data: string;
  id: string;
  type:
    | "SignatureVerificationAuthenticator"
    | "AnyOfAuthenticator"
    | "AllOfAuthenticator"
    | "SpendLimitAuthenticator"
    | "MessageFilterAuthenticator";
}

export async function queryAuthenticators({ address }: { address: string }) {
  const result = await apiClient<{ account_authenticators: Authenticator[] }>(
    ChainList[0].apis.rest[0].address +
      `osmosis/authenticator/authenticators/${address}`
  );

  return { authenticators: result.account_authenticators };
}
