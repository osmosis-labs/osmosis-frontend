import { Window as KeplrWindow } from "@keplr-wallet/types";
import type { JSX as ReactJSX } from "react";

import type { widget } from "~/public/tradingview";

declare global {
  // React 19 removed the global JSX namespace. Restore it for Pages Router
  // files and for deps like react-markdown that still reference JSX.Element.
  namespace JSX {
    type Element = ReactJSX.Element;
    type ElementType = ReactJSX.ElementType;
    type IntrinsicElements = ReactJSX.IntrinsicElements;
    type ElementClass = ReactJSX.ElementClass;
    type ElementAttributesProperty = ReactJSX.ElementAttributesProperty;
    type ElementChildrenAttribute = ReactJSX.ElementChildrenAttribute;
    type LibraryManagedAttributes<C, P> = ReactJSX.LibraryManagedAttributes<
      C,
      P
    >;
    type IntrinsicAttributes = ReactJSX.IntrinsicAttributes;
    type IntrinsicClassAttributes<T> = ReactJSX.IntrinsicClassAttributes<T>;
  }

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
