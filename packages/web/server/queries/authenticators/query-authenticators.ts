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

export async function queryAuthenticators({
  address,
}: {
  address: string;
}): Promise<any> {
  return await apiClient<Authenticator[]>(
    ChainList[0].apis.rest[0].address +
      `osmosis/authenticator/authenticators/${address}`
  );
}
