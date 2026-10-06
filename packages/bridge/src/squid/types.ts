/** Fields consumed from Squid's v2 HTTP API; no SDK runtime is required. */
export interface SquidGetRouteParams {
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  fromAddress: string;
  toAddress: string;
  slippage: number;
  quoteOnly: boolean;
  enableExpress: boolean;
  receiveGasOnDestination: boolean;
}

export interface SquidToken {
  chainId: string | number;
  address: string;
  symbol: string;
  decimals: number;
  coingeckoId?: string;
  commonKey?: string;
  ibcDenom?: string;
}

export interface SquidChain {
  chainId: string | number;
  chainType: "evm" | "cosmos";
  chainName: string;
}

export interface SquidTransactionRequest {
  target: string;
  data: string;
  value: string;
  gasLimit: string;
  gasPrice: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
}

interface SquidCost {
  amount: string;
  token: SquidToken;
}

export interface SquidRouteResponse {
  route: {
    params: { toToken: string };
    estimate: {
      fromAmount: string;
      toAmount: string;
      fromAmountUSD: string;
      toAmountUSD: string;
      aggregatePriceImpact?: string;
      estimatedRouteDuration: number;
      feeCosts: SquidCost[];
      gasCosts: SquidCost[];
    };
    transactionRequest?: SquidTransactionRequest;
  };
}

export interface SquidChainsResponse {
  chains: SquidChain[];
}

export interface SquidTokensResponse {
  tokens: SquidToken[];
}

export interface SquidStatusResponse {
  id: string;
  squidTransactionStatus: string;
}
