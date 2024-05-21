import { AminoSignResponse, StdSignDoc } from "@cosmjs/amino";
import { DirectSignResponse } from "@cosmjs/proto-signing";
import { DirectSignDoc, SignOptions, Wallet } from "@cosmos-kit/core";

import {
  WCClient,
  WCSignDirectResponse,
} from "~/integrations/core-walletconnect";

export class TrustClient extends WCClient {
  constructor(walletInfo: Wallet) {
    super(walletInfo);
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions?: SignOptions
  ): Promise<AminoSignResponse> {
    const result = (await this._signAmino(
      chainId,
      signer,
      signDoc,
      signOptions
    )) as AminoSignResponse;
    return result;
  }

  async signDirect(
    chainId: string,
    signer: string,
    signDoc: DirectSignDoc,
    signOptions?: SignOptions
  ): Promise<DirectSignResponse> {
    const { signed, signature } = (await this._signDirect(
      chainId,
      signer,
      signDoc,
      signOptions
    )) as WCSignDirectResponse;
    return {
      signed: {
        chainId: signed.chainId,
        accountNumber: BigInt(signed.accountNumber),
        authInfoBytes: new Uint8Array(
          Buffer.from(signed.authInfoBytes, this.wcEncoding)
        ),
        bodyBytes: new Uint8Array(
          Buffer.from(signed.bodyBytes, this.wcEncoding)
        ),
      },
      signature,
    };
  }
}
