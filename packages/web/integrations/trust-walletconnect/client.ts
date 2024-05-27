import type { AminoSignResponse, StdSignDoc } from "@cosmjs/amino";
import type { DirectSignResponse } from "@cosmjs/proto-signing";
import type { DirectSignDoc, SignOptions } from "@cosmos-kit/core";

import {
  WCClient,
  WCSignDirectResponse,
} from "~/integrations/core-walletconnect";

export class TrustClient extends WCClient {
  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions?: SignOptions
  ): Promise<AminoSignResponse> {
    console.log(chainId, signer, signDoc, signOptions);
    throw new Error("Trust doesn't support `signAmino` method.");
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
