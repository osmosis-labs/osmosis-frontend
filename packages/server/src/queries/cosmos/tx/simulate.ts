import { createNodeQuery } from "../../create-node-query";

export type GasInfo = {
  gas_info: {
    /** Int */
    gas_used: string;
  };
};

export const sendTxSimulate = createNodeQuery<
  GasInfo,
  {
    /** Likely from a `Uint8Array` buffer,
     *  like `Buffer.from(unsignedTx).toString("base64")` */
    txBytes: string;
  }
>({
  path: "/cosmos/tx/v1beta1/simulate",
  options: ({ txBytes }) => ({ data: { tx_bytes: txBytes } }),
});
