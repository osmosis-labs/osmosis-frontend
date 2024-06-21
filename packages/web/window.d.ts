import { Window as KeplrWindow } from "@keplr-wallet/types";

import type { widget } from "~/public/tradingview";

declare global {
  interface Window extends KeplrWindow {
    ethereum: EthereumProvider;
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
