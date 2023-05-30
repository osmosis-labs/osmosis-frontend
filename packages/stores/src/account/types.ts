export type TxEvent = {
  type: string;
  attributes: {
    key: string;
    value: string;
  }[];
};
