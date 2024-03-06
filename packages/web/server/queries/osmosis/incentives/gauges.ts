import { createNodeQuery } from "~/server/queries/base-utils";

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

export const queryGauges = createNodeQuery<{ data: Gauge[] }>({
  path: "/osmosis/incentives/v1beta1/gauges?pagination.limit=100000",
});
