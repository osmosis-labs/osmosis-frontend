import {
  Asset,
  Chain,
  MsgsRequest,
  MsgsResponse,
  RouteRequest,
  RouteResponse,
  TxStatusResponse,
} from "./types";

class SkipApiClient {
  async assets({ chainID }: { chainID?: string } = {}) {
    const urlParams = new URLSearchParams({
      include_evm_assets: "true",
    });

    if (chainID) {
      urlParams.set("chain_id", chainID);
    }

    const response = await fetch(
      `https://api.skip.money/v1/fungible/assets?${urlParams.toString()}`
    );

    const data = (await response.json()) as {
      chain_to_assets_map: Record<string, { assets: Asset[] }>;
    };

    return data.chain_to_assets_map;
  }

  async chains() {
    const urlParams = new URLSearchParams({
      include_evm: "true",
    });

    const response = await fetch(
      `https://api.skip.money/v1/info/chains?${urlParams.toString()}`
    );

    const data = (await response.json()) as { chains: Chain[] };

    return data.chains;
  }

  async route(options: RouteRequest) {
    const response = await fetch(`https://api.skip.money/v2/fungible/route`, {
      method: "POST",
      body: JSON.stringify({
        ...options,
        cumulative_affiliate_fee_bps:
          options.cumulative_affiliate_fee_bps ?? "0",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message ?? "failed to fetch route");
    }

    return data as RouteResponse;
  }

  async messages(options: MsgsRequest) {
    const response = await fetch(`https://api.skip.money/v2/fungible/msgs`, {
      method: "POST",
      body: JSON.stringify({
        ...options,
        slippage_tolerance_percent: options.slippage_tolerance_percent ?? "0",
      }),
    });

    const data = (await response.json()) as MsgsResponse;

    return data.msgs;
  }

  async transactionStatus({
    chainID,
    txHash,
  }: {
    chainID: string;
    txHash: string;
  }) {
    const response = await fetch(
      `https://api.skip.money/v2/tx/status?chain_id=${chainID}&tx_hash=${txHash}`
    );

    const data = await response.json();

    return data as TxStatusResponse;
  }
}

export default SkipApiClient;
