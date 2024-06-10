import { createNodeQuery } from "../../create-node-query";
import { Tx } from "./txs";

export type Block = {
  txs: Tx["tx"][];
  header: {
    version: {
      block: string;
      app: string;
    };
    chain_id: string;
    height: string;
    time: string;
    last_block_id: {
      hash: string;
      part_set_header: {
        total: number;
        hash: string;
      };
    };
    last_commit_hash: string;
    data_hash: string;
    validators_hash: string;
    next_validators_hash: string;
    consensus_hash: string;
    app_hash: string;
    last_results_hash: string;
    evidence_hash: string;
    proposer_address: string;
  };
  data: {
    txs: string[];
  };
  evidence: {
    evidence: any[];
  };
  last_commit: {
    height: string;
    round: number;
    block_id: {
      hash: string;
      part_set_header: {
        total: number;
        hash: string;
      };
    };
    signatures: {
      block_id_flag: string;
      validator_address: string;
      timestamp: string;
      signature: string;
    }[];
  };
};

export const queryBlock = createNodeQuery<
  Block,
  {
    blockHeight: string;
  }
>({
  path: ({ blockHeight }) => `/cosmos/tx/v1beta1/txs/block/${blockHeight}`,
});
