import { Client } from "../wallets";

export type Transaction =
  | {
      /** Hex address. */
      to?: string;
      /** Amount in gwei. To be converted to hex. Use a big number lib to do operations on amounts. */
      value?: string;
      data?: string | unknown[];
    }
  | unknown[];

export type Method = "eth_getBalance" | "eth_sendTransaction" | "eth_call";

export interface EthClient
  extends Client<{ method: Method; params: Transaction }> {}

/** Ethereum chains: https://docs.metamask.io/guide/ethereum-provider.html#chain-ids */
export const ChainNames: { [chainId: string]: string } = {
  "0x1": "Ethereum",
  "0x3": "Ropsten Test Network",
  "0x4": "Rinkeby Test Network",
  "0x5": "Goerli Test Network",
  "0x2a": "Kovan Test Network",

  // manually searched and added. Source: https://chainlist.org/
  "0x38": "Binance Smart Chain",
  "0x64": "Gnosis",
  "0x89": "Polygon",
  "0x504": "Moonbeam",
  "0x2329": "Evmos",
  "0xa86a": "Avalance C-Chain",
};
