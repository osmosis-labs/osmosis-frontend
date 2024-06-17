import { createNodeQuery } from "../../create-node-query";

export type TxEvent = {
  type: string;
  attributes: {
    key: string;
    value: string;
  }[];
};

export type SimulationResult = {
  gas_info?: {
    /** Int */
    gas_used: string;
  };
  result?: {
    data: string;
    log: string;
    events: TxEvent[];
  };
};

export const sendTxSimulate = createNodeQuery<
  SimulationResult,
  {
    /** Likely from a `Uint8Array` buffer,
     *  like `Buffer.from(unsignedTx).toString("base64")` */
    txBytes: string;
  }
>({
  path: "/cosmos/tx/v1beta1/simulate",
  options: ({ txBytes }) => ({ data: { tx_bytes: txBytes } }),
});
