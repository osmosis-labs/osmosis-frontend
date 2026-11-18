import { createNodeQuery } from "../../create-node-query";

export declare type Gauge = {
  id: string;
  is_perpetual: boolean;
  distribute_to: {
    lock_query_type: "ByDuration" | "ByTime";
    denom: string;
    duration: string;
    timestamp: string;
  };
  coins: {
    denom: string;
    amount: string;
  }[];
  start_time: string;
  num_epochs_paid_over: string;
  filled_epochs: string;
  distributed_coins: {
    denom: string;
    amount: string;
  }[];
};

/** Every gauge on chain in one response (over 15 MB). The download takes about as long as
 *  the default 3 s per-attempt timeout, so it gets the whole request budget instead. */
export const queryGauges = createNodeQuery<{ data: Gauge[] }>({
  path: "/osmosis/incentives/v1beta1/gauges?pagination.limit=100000",
  timeout: 8000,
});
