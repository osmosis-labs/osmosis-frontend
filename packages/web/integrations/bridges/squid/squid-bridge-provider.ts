import { Squid, StatusResponse } from "@0xsquid/sdk";
import { ITxStatusSource } from "@osmosis-labs/stores";

import { BridgeAsset, BridgeChain, BridgeProvider } from "../base";

export const createSquidClient = async () => {
  const squid = new Squid();
  await squid.init();
  return squid;
};

export class SquidBridgeProvider implements BridgeProvider {
  constructor(
    readonly squid: Squid,
    readonly txStatusSource?: ITxStatusSource
  ) {}

  async getQuote(): Promise<any> {}

  async executeRoute(): Promise<any> {
    console.log(this.txStatusSource);
  }

  getAssets(): Promise<BridgeAsset[]> {
    return Promise.resolve(
      this.squid.tokens.map(({ symbol }) => ({ denom: symbol }))
    );
  }

  getChains(): Promise<BridgeChain[]> {
    return Promise.resolve(
      this.squid.chains.map(
        ({ networkName, chainId, chainName, chainType }) => ({
          networkName,
          chainId,
          chainName: chainName as string,
          chainType: chainType,
        })
      )
    );
  }

  static async getTransferStatus(params: {
    sendTxHash: string;
    origin?: string;
  }): Promise<StatusResponse> {
    const { sendTxHash, origin = "https://api.0xsquid.com" } = params;

    const response = await fetch(
      `${origin}/v1/status?transactionId=${sendTxHash}`
    );
    const data: StatusResponse = await response.json();

    return data;
  }
}
