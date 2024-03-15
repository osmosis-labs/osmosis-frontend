export type SidecarQuoteResponse = {
  amount_in: {
    denom: string;
    amount: string;
  };
  amount_out: string;
  effective_fee: string;
  price_impact: string;
  in_out_spot_price: string;
  route: {
    in_amount: string;
    out_amount: string;
    "has-cw-pool": boolean;
    pools: {
      id: number;
      type: number;
      balances: {
        denom: string;
        amount: string;
      };
      spread_factor: string;
      taker_fee: string;
      token_out_denom: string;
    }[];
  }[];
};
