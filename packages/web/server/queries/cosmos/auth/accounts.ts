import { ChainList } from "~/config/generated/chain-list";
import { apiClient } from "~/utils/api-client";

export async function queryAccount(address: string): Promise<any> {
  return await apiClient<any>(
    ChainList[0].apis.rest[0].address +
      `cosmos/auth/v1beta1/accounts/${address}`
  );
}
