import { apiClient } from "@osmosis-labs/utils";
import { CacheEntry, cachified } from "cachified";
import { LRUCache } from "lru-cache";

import { BridgeProviderContext } from "../interface";

export type TransferStep = {
  id: string;
  type:
    | "evm_transfer"
    | "ConfirmERC20Deposit"
    | "axelar"
    | "Vote"
    | "RouteIBCTransfersRequest"
    | "evm"
    | string;
  status: "executed" | string;
  created_at: {
    ms: number;
  };
  /** Min denom. i.e. "uusdc". Axelar defined. */
  denom: string;
};

/** Exclude `sign_batch` steps as we're only querying EVM->COSMOS transfers.
 *  `send asset => confirm deposit => vote confirm => ibc transfer`
 */
export type TransferStatus = Array<{
  id: string;
  type?: "wrap" | "deposit_address";
  /** Axelarscan: SEND ASSET */
  wrap?: TransferStep & {
    tx_hash: string;
    source_chain: string;
    destination_chain: string;
    ts_hash_wrap: string;
    sender_address: string;
  };
  send?: TransferStep & {
    /** Decimal amount. Displayed by Axelarscan (doesn't sub fees). */
    amount: number;
    /** Decimal fee in `denom` denom. Displayed by Axelarscan. */
    fee: number;
    /** i.e. `"polygon"` */
    sender_chain: string;
    /** i.e. `"osmosis"` */
    recipient_chain: string;
    /** Transferring a balance at or below fee const.
     *  Calculate fee constants here: https://docs.axelar.dev/resources/mainnet#cross-chain-relayer-gas-fee
     */
    insufficient_fee?: true;
  };
  /** Axelarscan: VOTE CONFIRM */
  vote?: TransferStep;
  link?: Omit<TransferStep, "status" | "created_at"> & {
    /** Hash on Axelar chain. `/axelar.evm.v1beta1.LinkRequest` */
    txHash: string;
    price: number;
  };
  /** Axelarscan: CONFIRM DEPOSIT */
  confirm_deposit?: TransferStep & {
    /** Whole amount. */
    amount: string;
  };
  /** Missing if pending IBC transfer. */
  ibc_send?: TransferStep & {
    /** Decimal amount. */
    amount: number;
    /** i.e. `axelar...` */
    sender_address: string;
    /** i.e. `osmo...` */
    recipient_address: string;
  };
  status: "executed";
}>;

/** Fetch data about a deposit-address transfer.
 *  @param sendTxHash Tx hash from send-to-generated-deposit-address tx on source chain.
 *  @param origin API origin, default: "https://api.axelarscan.io"
 */
export async function getTransferStatus(
  sendTxHash: string,
  origin = "https://api.axelarscan.io"
): Promise<TransferStatus> {
  try {
    const url = new URL("/cross-chain/transfers-status", origin);
    url.searchParams.set("txHash", sendTxHash);

    return apiClient<TransferStatus>(url.toString());
  } catch {
    console.error("Failed to fetch transfer status for tx hash: ", sendTxHash);
    return [];
  }
}

interface AxelarChain {
  id: string;
  chain_id: number | string;
  chain_name: string;
  maintainer_id: string;
  endpoints: {
    rpc: string[];
    lcd: string[];
  };
  native_token: {
    symbol: string;
    name: string;
    decimals: number;
  };
  name: string;
  short_name: string;
  image: string;
  color: string;
  explorer: {
    name: string;
    url: string;
    icon: string;
    block_path: string;
    address_path: string;
    contract_path: string;
    contract_0_path: string;
    transaction_path: string;
    asset_path: string;
  };
  prefix_address: string;
  prefix_chain_ids: string[];
  chain_type: string;
  provider_params: object[];
}

const cache = new LRUCache<string, CacheEntry>({
  max: 5,
});

export async function getAxelarChains({
  env,
}: {
  env: BridgeProviderContext["env"];
}) {
  return cachified({
    key: `axelar-chains`,
    cache,
    ttl: 1000 * 60 * 30, // 30 minutes
    getFreshValue: () =>
      apiClient<AxelarChain[]>(
        env === "mainnet"
          ? "https://api.axelarscan.io/api/getChains"
          : "https://testnet.api.axelarscan.io/api/getChains"
      ),
  });
}

interface AxelarAsset {
  id: string; // ID using in general purpose
  denom: string;
  denoms: string[];
  native_chain: string; // general ID of chain that asset is native on
  name: string; // display name
  symbol: string;
  decimals: number; // token decimals
  image: string; // logo path
  coingecko_id: string; // asset identifier on coingecko service
  addresses: {
    [chain: string]: {
      address: string; // EVM token address
      ibc_denom: string; // Cosmos token address (denom)
      symbol: string; // symbol of asset on each chain
    };
  };
}

export async function getAxelarAssets({
  env,
}: {
  env: BridgeProviderContext["env"];
}) {
  return cachified({
    key: "axelar-assets",
    cache,
    ttl: 1000 * 60 * 30, // 30 minutes
    getFreshValue: () =>
      apiClient<AxelarAsset[]>(
        env === "mainnet"
          ? "https://api.axelarscan.io/api/getAssets"
          : "https://testnet.api.axelarscan.io/api/getAssets"
      ),
  });
}
