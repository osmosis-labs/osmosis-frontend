import { AminoSignResponse, StdSignDoc } from "@cosmjs/amino";
import { DirectSignResponse } from "@cosmjs/proto-signing";
import { DirectSignDoc, SignOptions, Wallet } from "@cosmos-kit/core";

import {
  WCClient,
  WCSignDirectRequest,
  WCSignDirectResponse,
} from "~/integrations/core-walletconnect";

export class TrustClient extends WCClient {
  constructor(walletInfo: Wallet) {
    super(walletInfo);
  }

  protected async _signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    _signOptions?: SignOptions
  ) {
    const session = this.getSession("cosmos", chainId);
    if (!session) {
      throw new Error(`Session for ${chainId} not established yet.`);
    }

    const resp = await this.signClient?.request<AminoSignResponse>({
      topic: session.topic,
      chainId: `cosmos:${chainId}`,
      request: {
        method: "cosmos_signAmino",
        params: {
          signerAddress: signer,
          signDoc,
        },
      },
    });
    this.logger?.debug(`Response of cosmos_signAmino`, resp);
    return resp;
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

  protected async _signDirect(
    chainId: string,
    signer: string,
    signDoc: DirectSignDoc,
    _signOptions?: SignOptions
  ) {
    const session = this.getSession("cosmos", chainId);

    if (!session) {
      throw new Error(`Session for ${chainId} not established yet.`);
    }

    if (
      !signDoc.accountNumber ||
      !signDoc.chainId ||
      !signDoc.authInfoBytes ||
      !signDoc.bodyBytes
    ) {
      throw new Error(`Malformed signDoc`);
    }

    const signDocValue: WCSignDirectRequest = {
      signerAddress: signer,
      signDoc: {
        chainId: signDoc.chainId,
        bodyBytes: Buffer.from(signDoc.bodyBytes).toString(this.wcEncoding),
        authInfoBytes: Buffer.from(signDoc.authInfoBytes).toString(
          this.wcEncoding
        ),
        accountNumber: signDoc.accountNumber.toString(),
      },
    };

    const resp = await this.signClient?.request({
      topic: session.topic,
      chainId: `cosmos:${chainId}`,
      request: {
        method: "cosmos_signDirect",
        params: signDocValue,
      },
    });
    this.logger?.debug(`Response of cosmos_signDirect`, resp);
    return resp;
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
