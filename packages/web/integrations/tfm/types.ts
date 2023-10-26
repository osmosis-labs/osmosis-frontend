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
