import { apiClient } from "@osmosis-labs/utils";

import { BridgeEnvironment } from "../interface";
import {
  SkipAsset,
  SkipChain,
  SkipMsgsRequest,
  SkipMsgsResponse,
  SkipRouteRequest,
  SkipRouteResponse,
  SkipTxStatusResponse,
} from "./types";

export class SkipApiClient {
  constructor(
    readonly env: BridgeEnvironment,
    readonly baseUrl = "https://api.skip.money"
  ) {}

  async assets({ chainID }: { chainID?: string } = {}) {
    const url = new URL("/v2/fungible/assets", this.baseUrl);

    url.searchParams.append("include_evm_assets", "true");
    url.searchParams.append("include_cw20_assets", "true");

    if (chainID) {
      url.searchParams.set("chain_id", chainID);
    }

    if (this.env === "testnet") {
      url.searchParams.append("only_testnets", "true");
    }

    const data = await this.authorizedApiClient<{
      chain_to_assets_map: Record<string, { assets: SkipAsset[] }>;
    }>(url.toString());

    return data.chain_to_assets_map;
  }

  async chains() {
    const url = new URL("/v2/info/chains", this.baseUrl);

    url.searchParams.append("include_evm", "true");

    if (this.env === "testnet") {
      url.searchParams.append("only_testnets", "true");
    }

    const data = await this.authorizedApiClient<{
      chains: SkipChain[];
    }>(url.toString());

    return data.chains;
  }

  async route(options: SkipRouteRequest) {
    return this.authorizedApiClient<SkipRouteResponse>(
      `${this.baseUrl}/v2/fungible/route`,
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
    return this.authorizedApiClient<SkipMsgsResponse>(
      `${this.baseUrl}/v2/fungible/msgs`,
      {
        method: "POST",
        body: JSON.stringify({
          ...options,
          slippage_tolerance_percent: options.slippage_tolerance_percent ?? "0",
        }),
      }
    );
  }

  async trackTransaction({
    chainID,
    txHash,
  }: {
    chainID: string;
    txHash: string;
  }) {
    return this.authorizedApiClient<{ tx_id: string }>(
      `${this.baseUrl}/v2/tx/track`,
      {
        method: "POST",
        body: JSON.stringify({
          chain_id: chainID,
          tx_hash: txHash,
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
    const url = new URL("/v2/tx/status", this.baseUrl);

    url.searchParams.append("chain_id", chainID);
    url.searchParams.append("tx_hash", txHash);

    return this.authorizedApiClient<SkipTxStatusResponse>(url.toString());
  }

  protected authorizedApiClient<Response>(
    ...args: Parameters<typeof apiClient>
  ) {
    if (process.env.NODE_ENV === "test") {
      return apiClient<Response>(args[0], args[1]);
    }

    const key = process.env.SKIP_API_KEY;
    if (!key) throw new Error("SKIP_API_KEY is not set");

    return apiClient<Response>(args[0], {
      ...args[1],
      headers: {
        ...args[1]?.headers,
        // This is the format confirmed by Skip team
        Authorization: key,
      },
    });
  }
}
