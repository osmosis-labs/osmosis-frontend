export type GetSwapRouteResponse = {
  returnAmount: number;
  askToken: string;
  offerToken: string;
  routes: {
    inputAmount: number;
    returnAmount: number;
    priceImpact: number;
    inputPercentage: number;
    routes: {
      inputAmount: number;
      returnAmount: number;
      priceImpact: number;
      inputPercentage: number;
      operations: {
        askToken: string;
        offerToken: string;
        poolId: number;
      }[];
    }[];
  }[];
};

export type GetTokensResponse = {
  name: string;
  symbol: string;
  contractAddr: string;
  decimals: number;
  numberOfPools: number;
  imageUrl: string | null;
  isTrading: boolean;
}[];
