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
  const url = new URL(
    `osmosis/authenticator/authenticators/${address}`,
    ChainList[0].apis.rest[0].address
  );
  const result = await apiClient<{ account_authenticators: Authenticator[] }>(
    url.toString()
  );

  return { authenticators: result.account_authenticators };
}
