import type {
  AminoSignResponse,
  OfflineAminoSigner,
  StdSignature,
  StdSignDoc,
} from "@cosmjs/amino";
import type {
  Algo,
  DirectSignResponse,
  OfflineDirectSigner,
} from "@cosmjs/proto-signing";
import type {
  ChainRecord,
  DirectSignDoc,
  SignOptions,
  SignType,
  SuggestToken,
  WalletAccount,
  WalletClient,
} from "@cosmos-kit/core";
import { CosmosEWalletInterface } from "@keplr-ewallet/ewallet-sdk-cosmos";

export class EWalletClient implements WalletClient {
  readonly client: CosmosEWalletInterface;
  private _defaultSignOptions: SignOptions = {
    preferNoSetFee: false,
    preferNoSetMemo: false,
    disableBalanceCheck: false,
  };

  get defaultSignOptions() {
    return this._defaultSignOptions;
  }

  setDefaultSignOptions(options: SignOptions) {
    this._defaultSignOptions = options;
  }

  constructor(client: CosmosEWalletInterface) {
    this.client = client;
  }

  async enable(_chainIds: string | string[]) {
    // Do nothing
  }

  async suggestToken(_suggestToken: SuggestToken) {
    // Do nothing
  }

  async getSimpleAccount(chainId: string) {
    const { address, username } = await this.getAccount(chainId);
    return {
      namespace: "cosmos",
      chainId,
      address,
      username,
    };
  }

  async getAccount(chainId: string): Promise<WalletAccount> {
    const key = await this.client.getKey(chainId);
    return {
      username: key.name,
      address: key.bech32Address,
      algo: key.algo as Algo,
      pubkey: key.pubKey,
      isNanoLedger: key.isNanoLedger,
    };
  }

  getOfflineSigner(chainId: string, preferredSignType?: SignType) {
    switch (preferredSignType) {
      case "amino":
        return this.getOfflineSignerAmino(chainId);
      case "direct":
        return this.getOfflineSignerDirect(chainId);
      default:
        return this.getOfflineSignerAmino(chainId);
    }
  }

  getOfflineSignerAmino(chainId: string): OfflineAminoSigner {
    return {
      getAccounts: async () => {
        return [await this.getAccount(chainId)];
      },
      signAmino: async (signerAddress, signDoc): Promise<AminoSignResponse> => {
        return this.signAmino(
          chainId,
          signerAddress,
          signDoc,
          this.defaultSignOptions
        );
      },
    };
  }

  getOfflineSignerDirect(chainId: string): OfflineDirectSigner {
    return {
      getAccounts: async () => {
        return [await this.getAccount(chainId)];
      },
      signDirect: async (
        signerAddress,
        signDoc
      ): Promise<DirectSignResponse> => {
        const resp = await this.signDirect(
          chainId,
          signerAddress,
          signDoc,
          this.defaultSignOptions
        );
        return {
          ...resp,
          signed: {
            ...resp.signed,
            accountNumber: BigInt(resp.signed.accountNumber.toString()),
          },
        };
      },
    };
  }

  async addChain(_chainInfo: ChainRecord) {
    // Do nothing
  }

  async signAmino(
    chainId: string,
    signer: string,
    signDoc: StdSignDoc,
    signOptions?: SignOptions
  ): Promise<AminoSignResponse> {
    const finalSignOptions = {
      ...this.defaultSignOptions,
      ...signOptions,
    };

    console.log("[EWallet] signAmino - Gas fee settings:", {
      chainId,
      fee: signDoc.fee,
      gasWanted: signDoc.fee?.gas,
      gasPrice: signDoc.fee?.amount,
      originalSignOptions: signOptions,
      finalSignOptions,
    });

    return await this.client.signAmino(
      chainId,
      signer,
      signDoc,
      finalSignOptions
    );
  }

  async signArbitrary(
    chainId: string,
    signer: string,
    data: string | Uint8Array
  ): Promise<StdSignature> {
    return await this.client.signArbitrary(chainId, signer, data);
  }

  async signDirect(
    chainId: string,
    signer: string,
    signDoc: DirectSignDoc,
    signOptions?: SignOptions
  ): Promise<DirectSignResponse> {
    const finalSignOptions = {
      ...this.defaultSignOptions,
      ...signOptions,
    };

    console.log("[EWallet] signDirect - Gas fee settings:", {
      chainId,
      signDoc: {
        chainId: signDoc.chainId,
        accountNumber: signDoc.accountNumber,
        authInfoBytes: signDoc.authInfoBytes?.length + " bytes",
      },
      originalSignOptions: signOptions,
      finalSignOptions,
    });

    const resp = await this.client.signDirect(
      chainId,
      signer,
      {
        ...signDoc,
        bodyBytes: signDoc.bodyBytes ?? new Uint8Array(),
        authInfoBytes: signDoc.authInfoBytes ?? new Uint8Array(),
        chainId: signDoc.chainId ?? "",
        accountNumber: BigInt(signDoc.accountNumber ?? "0"),
      },
      finalSignOptions
    );
    return {
      ...resp,
      signed: {
        ...resp.signed,
        accountNumber: BigInt(resp.signed.accountNumber.toString()),
      },
    };
  }

  async sendTx(
    chainId: string,
    tx: Uint8Array,
    mode: "block" | "async" | "sync"
  ) {
    console.log("[EWallet] sendTx - Transaction details:", {
      chainId,
      txSize: tx.length + " bytes",
      mode,
    });

    return await this.client.sendTx(chainId, tx, mode, {});
  }
}
