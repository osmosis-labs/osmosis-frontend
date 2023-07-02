import { MsgData } from "cosmjs-types/cosmos/base/abci/v1beta1/abci";

export type TxEvent = {
  type: string;
  attributes: {
    key: string;
    value: string;
  }[];
};

export interface DeliverTxResponse {
  readonly height?: number;
  /** Error code. The transaction suceeded if code is 0. */
  readonly code: number;
  readonly transactionHash: string;
  readonly rawLog?: string;
  readonly data?: readonly MsgData[];
  readonly gasUsed: string;
  readonly gasWanted: string;
}
