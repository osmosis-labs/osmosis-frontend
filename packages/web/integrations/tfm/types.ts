export type GetSwapRouteResponse = {
  returnAmount: number;
  askToken: string;
  offerToken: string;
  routes: {
    inputAmount: number;
    returnAmount: number;
    inputPercentage: number;
    operations: {
      askToken: string;
      offerToken: string;
      poolId: number;
    }[];
  }[];
};
