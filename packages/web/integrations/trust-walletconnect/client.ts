import { AminoSignResponse } from "@cosmjs/amino";
import { DirectSignResponse } from "@cosmjs/proto-signing";
import { DirectSignDoc, SignOptions, Wallet } from "@cosmos-kit/core";

import { WCClient } from "~/integrations/core-walletconnect";

export class TrustClient extends WCClient {
  constructor(walletInfo: Wallet) {
    super(walletInfo);
  }

  async signAmino(): Promise<AminoSignResponse> {
    throw new Error("Trust doesn't support `signAmino` method.");
  }

  async signDirect(
    chainId: string,
    signer: string,
    signDoc: DirectSignDoc,
    signOptions?: SignOptions
  ): Promise<DirectSignResponse> {
    // Trust doesn't return signed, using signDoc instead
    const result = (await this._signDirect(
      chainId,
      signer,
      signDoc,
      signOptions
    )) as any;
    return {
      signed: signDoc as DirectSignResponse["signed"],
      signature: result,
    };
  }
}
