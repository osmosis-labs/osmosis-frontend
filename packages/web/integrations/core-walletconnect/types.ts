import { StdSignature } from "@cosmjs/amino";
import { ChainRecord, Wallet } from "@cosmos-kit/core";

import { ChainWC } from "~/integrations/core-walletconnect/chain-wallet";
import { WCClient } from "~/integrations/core-walletconnect/client";

export interface IChainWC {
  new (walletInfo: Wallet, chainInfo: ChainRecord): ChainWC;
}

export interface IWCClient {
  new (walletInfo: Wallet): WCClient;
}

export interface WCDirectSignDoc {
  chainId: string;
  accountNumber: string;
  authInfoBytes: string;
  bodyBytes: string;
}

export interface WCSignDirectRequest {
  signerAddress: string;
  signDoc: WCDirectSignDoc;
}

export interface WCSignDirectResponse {
  signature: StdSignature;
  signed: WCDirectSignDoc;
}

export interface WCAccount {
  address: string;
  algo: string;
  pubkey: string;
}
