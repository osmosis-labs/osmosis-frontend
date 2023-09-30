import type {
  ChainsResponse,
  GetRoute as SquidGetRouteParams,
  RouteResponse,
  SdkInfoResponse,
  StatusResponse,
  TokensResponse,
} from "@0xsquid/sdk";

import {
  BridgeAsset,
  BridgeChain,
  BridgeProvider,
  BridgeStatus,
  GetBridgeQuoteParams,
} from "../base";

export class SquidBridgeProvider implements BridgeProvider {
  constructor(
    readonly integratorId: string,
    readonly apiURL = "https://api.0xsquid.com"
  ) {}

  async getQuote({
    fromAmount,
    fromAsset,
    fromChain,
    fromAddress,
    toAddress,
    toAsset,
    toChain,
    slippage = 1,
  }: GetBridgeQuoteParams): Promise<any> {
    const url = new URL(`${this.apiURL}/v1/route`);

    const getRouteParams: SquidGetRouteParams = {
      fromChain: fromChain.chainId.toString(),
      toChain: toChain.chainId.toString(),
      fromAddress,
      toAddress,
      fromAmount: fromAmount.toString(),
      fromToken: fromAsset.address,
      toToken: toAsset.address,
      slippage,
      quoteOnly: false,
    };

    Object.entries(getRouteParams).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });

    const response = await fetch(url.toString(), {
      headers: {
        "x-integrator-id": this.integratorId,
      },
    });
    const data: RouteResponse = await response.json();

    return data;
  }

  async getStatus(): Promise<BridgeStatus> {
    const response = await fetch(`${this.apiURL}/v1/sdk-info`);
    const data: SdkInfoResponse = await response.json();
    return {
      isInMaintenanceMode: data.isInMaintenanceMode,
      maintenanceMessage: data.maintenanceMessage,
    };
  }

  async executeRoute(): Promise<any> {}

  async getAssets(): Promise<BridgeAsset[]> {
    const response = await fetch(`${this.apiURL}/v1/tokens`);
    const data: TokensResponse = await response.json();
    return data.tokens.map(({ symbol, address }) => ({
      denom: symbol,
      address,
    }));
  }

  async getChains(): Promise<BridgeChain[]> {
    const response = await fetch(`${this.apiURL}/v1/chains`);
    const data: ChainsResponse = await response.json();

    return data.chains.map(
      ({ networkName, chainId, chainType, chainName }) => ({
        networkName,
        chainId,
        chainName,
        chainType,
      })
    );
  }

  async getTransferStatus(params: {
    sendTxHash: string;
  }): Promise<StatusResponse> {
    const { sendTxHash } = params;

    const response = await fetch(
      `${this.apiURL}/v1/status?transactionId=${sendTxHash}`
    );
    const data: StatusResponse = await response.json();

    return data;
  }
}
