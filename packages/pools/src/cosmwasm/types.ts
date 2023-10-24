import { PoolCommon, PoolMetricsRaw } from "../types";

export type CosmwasmPoolRaw = PoolCommon &
  Partial<PoolMetricsRaw> & {
    "@type": string;
    contract_address: string;
    pool_id: string;
    code_id: string;
    instantiate_msg: string;
    tokens: {
      denom: string;
      amount: string;
    }[];
  };
