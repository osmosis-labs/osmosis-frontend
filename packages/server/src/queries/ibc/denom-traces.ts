import { createNodeQuery } from "../create-node-query";

export type DenomTraces = { denom_trace: { path: string; base_denom: string } };

export const queryDenomTraces = createNodeQuery<
  DenomTraces,
  {
    ibcHash: string;
  }
>({
  path: ({ ibcHash }) =>
    `/ibc/apps/transfer/v1/denom_traces/${
      ibcHash.startsWith("ibc/") ? ibcHash.replace("ibc/", "") : ibcHash
    }`,
});
