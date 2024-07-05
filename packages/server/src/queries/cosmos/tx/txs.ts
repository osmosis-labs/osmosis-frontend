import { createNodeQuery } from "../../create-node-query";
import { TxEvent } from "./simulate";

export type TxMessages = Array<{ "@type": string } & any>;

export type TxBody = {
  messages: TxMessages;
  memo: string;
  timeout_height: string;
  extension_options: TxMessages;
  non_critical_extension_options: TxMessages;
};

export type Tx = {
  tx: {
    body: TxBody;
    auth_info: {
      signer_infos: Array<{
        public_key: {
          type_url: string;
          value: string;
        };
        mode_info: {
          single?: {
            mode: "SIGN_MODE_UNSPECIFIED";
          };
          multi?: {
            bitarray: {
              extra_bits_stored: number;
              elems: string;
            };
            mode_infos: Array<null>;
          };
        };
        sequence: string;
      }>;
      fee: {
        amount: Array<{
          denom: string;
          amount: string;
        }>;
        gas_limit: string;
        payer: string;
        granter: string;
      };
      tip?: {
        amount: Array<{
          denom: string;
          amount: string;
        }>;
        tipper: string;
      };
    };
    signatures: string[];
  };
  tx_response: {
    height: string;
    txhash: string;
    codespace: string;
    code: number;
    data: string;
    raw_log: string;
    logs: Array<{
      msg_index: number;
      log: string;
      events: TxEvent[];
    }>;
    info: string;
    gas_wanted: string;
    gas_used: string;
    tx: { "@type": string; body: TxBody };
    timestamp: string;
    events: TxEvent[];
  };
};

export const queryTx = createNodeQuery<
  Tx,
  {
    /** Hex encoded transaction hash.*/
    txHash: string;
  }
>({
  path: ({ txHash }) => `/cosmos/tx/v1beta1/txs/${txHash}`,
});
