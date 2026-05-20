import { createNodeQuery } from "../create-node-query";

export type DcaTimeInterval =
  | "Hourly"
  | "HalfDaily"
  | "Daily"
  | "Weekly"
  | "Fortnightly"
  | "Monthly"
  | { Custom: { seconds: number } };

export type DcaVaultStatus = "Scheduled" | "Active" | "Inactive" | "Cancelled";

export interface DcaVaultRaw {
  id: number;
  owner: string;
  label: string | null;
  target_denom: string;
  swap_amount: string;
  time_interval: DcaTimeInterval;
  status: DcaVaultStatus;
  balance: { denom: string; amount: string };
  swapped_amount: { denom: string; amount: string };
  received_amount: { denom: string; amount: string };
}

interface GetVaultsByOwnerResponse {
  data: { vaults: DcaVaultRaw[] };
}

export const queryDcaVaultsByOwner = createNodeQuery<
  GetVaultsByOwnerResponse,
  { contractAddress: string; ownerAddress: string; limit?: number }
>({
  path: ({ contractAddress, ownerAddress, limit = 50 }) => {
    const msg = JSON.stringify({
      get_vaults_by_owner: {
        owner: ownerAddress,
        start_after: null,
        limit,
      },
    });
    const encodedMsg = Buffer.from(msg).toString("base64");
    return `/cosmwasm/wasm/v1/contract/${contractAddress}/smart/${encodedMsg}`;
  },
});
