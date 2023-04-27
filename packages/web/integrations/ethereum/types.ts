import { ObservableWallet } from "../wallets";

type Method = "eth_getBalance" | "eth_sendTransaction" | "eth_call" | string;

export interface EthWallet
  extends ObservableWallet<
    {
      method: Method;
      params:
        | {
            /** Hex address. */
            to?: string;
            /** Amount in gwei. To be converted to hex. Use a big number lib to do operations on amounts. */
            value?: string;
            data?: string | unknown[];
          }
        | unknown[];
    },
    Method | null
  > {
  /** Set source chain user selected in app. Key should be from values of `ChainNames`. */
  setPreferredSourceChain: (chainName: string) => void;
}

export type SendFn = Pick<EthWallet, "send">["send"];

export const ChainNames: { [chainId: string]: string } = {
  /** Ethereum chains: https://docs.metamask.io/guide/ethereum-provider.html#chain-ids */
  "0x1": "Ethereum Main Network",
  "0x3": "Ropsten Test Network",
  "0x4": "Rinkeby Test Network",
  "0x5": "Goerli Test Network",
  "0x2a": "Kovan Test Network",

  // manually searched and added. Source: https://chainlist.org/
  "0x38": "Binance Smart Chain Mainnet",
  "0x61": "Binance Smart Chain Testnet",
  "0x64": "Gnosis",
  "0x89": "Polygon Mainnet",
  "0x13881": "Mumbai",
  "0x13a": "Filecoin - Mainnet",
  "0xfa": "Fantom Opera",
  "0xfa2": "Fantom Testnet",
  "0x504": "Moonbeam Mainnet",
  "0x507": "Moonbase Alpha",
  "0x2329": "Evmos",
  "0xa86a": "Avalanche C-Chain",
  "0xa869": "Avalanche Fuji Testnet",
  "0x4e454152": "Aurora Mainnet",
  "0x4e454153": "Aurora Testnet",
};

export const ChainNetworkConfigs: { [chainId: string]: object } = {};
