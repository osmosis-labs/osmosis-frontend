import { apiClient } from "@osmosis-labs/utils";

import {
  SkipAsset,
  SkipChain,
  SkipMsgsRequest,
  SkipMsgsResponse,
  SkipRouteRequest,
  SkipRouteResponse,
  SkipTxStatusResponse,
} from "./types";

class SkipApiClient {
  async assets({ chainID }: { chainID?: string } = {}) {
    const url = new URL("/v1/fungible/assets", "https://api.skip.money");

    url.searchParams.append("include_evm_assets", "true");

    if (chainID) {
      url.searchParams.set("chain_id", chainID);
    }

    const data = await apiClient<{
      chain_to_assets_map: Record<string, { assets: SkipAsset[] }>;
    }>(url.toString());

    return data.chain_to_assets_map;
  }

  async chains() {
    const url = new URL("/v1/info/chains", "https://api.skip.money");

    url.searchParams.append("include_evm", "true");

    const data = await apiClient<{
      chains: SkipChain[];
    }>(url.toString());

    return data.chains;
  }

  async route(options: SkipRouteRequest) {
    return apiClient<SkipRouteResponse>(
      "https://api.skip.money/v2/fungible/route",
      {
        method: "POST",
        body: JSON.stringify({
          ...options,
          cumulative_affiliate_fee_bps:
            options.cumulative_affiliate_fee_bps ?? "0",
        }),
      }
    );
  }

  async messages(options: SkipMsgsRequest) {
    return apiClient<SkipMsgsResponse>(
      `https://api.skip.money/v2/fungible/msgs`,
      {
        method: "POST",
        body: JSON.stringify({
          ...options,
          slippage_tolerance_percent: options.slippage_tolerance_percent ?? "0",
        }),
      }
    );
  }

  async transactionStatus({
    chainID,
    txHash,
  }: {
    chainID: string;
    txHash: string;
  }) {
    const url = new URL("/v2/tx/status", "https://api.skip.money");

    url.searchParams.append("chain_id", chainID);
    url.searchParams.append("tx_hash", txHash);

    return apiClient<SkipTxStatusResponse>(url.toString());
  }
}

export default SkipApiClient;
