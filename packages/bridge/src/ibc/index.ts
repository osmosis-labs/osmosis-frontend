import {
  BridgeProvider,
  BridgeProviderContext,
  BridgeQuote,
  BridgeTransactionRequest,
  GetBridgeQuoteParams,
} from "../interface";

export const ibcProviderId = "IBC";

export class IbcBridgeProvider implements BridgeProvider {
  readonly providerName = ibcProviderId;

  constructor(protected readonly ctx: BridgeProviderContext) {}

  getQuote(params: GetBridgeQuoteParams): Promise<BridgeQuote> {
    const fromChainId = params.fromChain.chainId;
    const toChainId = params.toChain.chainId;
    if (typeof fromChainId !== "string") throw new Error("Invalid fromChainId");
    if (typeof toChainId !== "string") throw new Error("Invalid toChainId");

    const fromChain = this.ctx.chainList.find(
      (chain) => chain.chain_id === fromChainId
    );
    const toChain = this.ctx.chainList.find(
      (chain) => chain.chain_id === toChainId
    );

    if (!fromChain || !toChain) {
      throw new Error("Invalid chainIds");
    }

    throw new Error("Method not implemented.");
  }

  getTransactionData(
    _params: GetBridgeQuoteParams
  ): Promise<BridgeTransactionRequest> {
    throw new Error("Method not implemented.");
  }
}
