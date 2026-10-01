import type { widget } from "~/public/tradingview";

declare global {
  interface Window {
    ethereum: EthereumProvider;
    /** Injected by the Keplr extension and in-app browser. Wallet calls go through cosmos-kit. */
    keplr?: {
      readonly mode: "core" | "extension" | "mobile-web" | "walletconnect";
    };
  }

  interface TradingView {
    widget: typeof widget;
  }
}

interface RequestArguments {
  method: string;
  params?: unknown[] | object;
}

interface EthereumProvider {
  _state: {
    accounts: string[];
  };
  isMetaMask: boolean;
  on(
    event: "disconnect" | "accountsChanged" | "chainChanged" | "networkChanged",
    callback: (payload: any) => void
  ): void;
  once(
    event: "disconnect" | "accountsChanged" | "chainChanged" | "networkChanged",
    callback: (payload: any) => void
  ): void;
  removeAllListeners(): void;
  request(args: RequestArguments): Promise<unknown>;
}
