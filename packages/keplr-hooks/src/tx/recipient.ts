import { IRecipientConfig } from "./types";
import { TxChainSetter } from "./chain";
import { ChainGetter } from "@osmosis-labs/keplr-stores";
import { action, computed, makeObservable, observable } from "mobx";
import {
  EmptyAddressError,
  InvalidBech32Error,
  InvalidHexError,
} from "./errors";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { useState } from "react";
import { isAddress } from "@ethersproject/address";

export class RecipientConfig extends TxChainSetter implements IRecipientConfig {
  @observable
  protected _rawRecipient: string = "";

  @observable
  protected _bech32Prefix: string | undefined = undefined;

  constructor(chainGetter: ChainGetter, initialChainId: string) {
    super(chainGetter, initialChainId);

    makeObservable(this);
  }

  @computed
  get bech32Prefix(): string {
    if (!this._bech32Prefix) {
      return this.chainInfo.bech32Config.bech32PrefixAccAddr;
    }

    return this._bech32Prefix;
  }

  @action
  setBech32Prefix(prefix: string) {
    this._bech32Prefix = prefix;
  }

  get recipient(): string {
    const rawRecipient = this.rawRecipient.trim();

    return rawRecipient;
  }

  @computed
  get error(): Error | undefined {
    const rawRecipient = this.rawRecipient.trim();

    if (!rawRecipient) {
      return new EmptyAddressError("Address is empty");
    }

    const hasEthereumAddress =
      this.chainInfo.features?.includes("eth-address-gen");
    if (hasEthereumAddress && rawRecipient.startsWith("0x")) {
      if (isAddress(rawRecipient)) {
        return;
      }
      return new InvalidHexError("Invalid hex address for chain");
    }

    try {
      Bech32Address.validate(this.recipient, this.bech32Prefix);
    } catch (e) {
      return new InvalidBech32Error(
        `Invalid bech32: ${e.message || e.toString()}`
      );
    }
    return;
  }

  get rawRecipient(): string {
    return this._rawRecipient;
  }

  @action
  setRawRecipient(recipient: string): void {
    this._rawRecipient = recipient;
  }
}

export const useRecipientConfig = (
  chainGetter: ChainGetter,
  chainId: string
) => {
  const [config] = useState(() => new RecipientConfig(chainGetter, chainId));
  config.setChain(chainId);

  return config;
};
