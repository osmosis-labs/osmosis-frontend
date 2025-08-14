import { AccountData, OfflineAminoSigner } from "@cosmjs/amino";
import { OfflineDirectSigner } from "@cosmjs/proto-signing";
import { ChainRecord, ChainWalletBase, State, Wallet } from "@cosmos-kit/core";
import type { CosmosEWallet } from "@keplr-ewallet/ewallet-sdk-cosmos";

import { EWalletMainWallet } from "./main-wallet";

export class EWalletChainWallet extends ChainWalletBase {
  mainWallet!: EWalletMainWallet;
  private _accountData: AccountData | undefined;

  constructor(walletInfo: Wallet, chainInfo: ChainRecord) {
    super(walletInfo, chainInfo);
  }

  get address() {
    return this._accountData?.address;
  }

  get username() {
    return undefined;
  }

  connect = async (_sync?: boolean) => {
    console.log(`[EWallet] Connect called for chain: ${this.chainId}`);

    try {
      this.setState(State.Pending);

      // Ensure mainWallet is properly initialized
      await this.mainWallet.initClient();

      const cosmosEWallet = this.mainWallet.getCosmosEWallet();
      if (!cosmosEWallet) {
        throw new Error("Cosmos EWallet not available");
      }

      // Check login status and handle login if needed
      await this.ensureLogin(cosmosEWallet);

      // Get account information for this chain
      const chainId = this.chainRecord.chain?.chain_id;
      if (!chainId) {
        throw new Error("Chain ID not available");
      }

      // Get account key
      const account = await cosmosEWallet.getKey(chainId);

      this._accountData = {
        address: account.bech32Address,
        algo: account.algo as any,
        pubkey: account.pubKey,
      };

      console.log(
        `[EWallet] Connected successfully to chain: ${chainId}, address: ${account.bech32Address}`
      );
      this.setState(State.Done);
    } catch (error) {
      console.error(`[EWallet] Connect failed:`, error);
      this.setState(State.Error);
      throw error;
    }
  };

  private async ensureLogin(cosmosEWallet: CosmosEWallet): Promise<void> {
    console.log("[EWallet] Checking login status...");

    // 현재 로그인 상태 확인
    const publicKey = await cosmosEWallet.getPublicKey();

    if (!publicKey) {
      console.log("[EWallet] User not logged in, triggering login...");

      // Get core EWallet for login
      const coreEWallet = (cosmosEWallet as any).eWallet;
      if (coreEWallet && typeof coreEWallet.signIn === "function") {
        await coreEWallet.signIn("google");
        console.log("[EWallet] Login successful");

        // 로그인 후 다시 확인
        const newPublicKey = await cosmosEWallet.getPublicKey();
        if (!newPublicKey) {
          throw new Error("Login verification failed");
        }
      } else {
        throw new Error("Please login to EWallet first");
      }
    } else {
      console.log("[EWallet] User already logged in");
    }
  }

  async getAccount() {
    if (!this._accountData) {
      await this.connect();
    }
    return this._accountData;
  }

  async signAmino(signerAddress: string, signDoc: any, signOptions?: any) {
    console.log(`[EWallet] SignAmino called for address: ${signerAddress}`);

    // Ensure wallet is connected
    if (!this._accountData) {
      await this.connect();
    }

    const cosmosEWallet = this.mainWallet.getCosmosEWallet();
    if (!cosmosEWallet) {
      throw new Error("Cosmos EWallet not available");
    }

    const chainId = this.chainRecord.chain?.chain_id;
    if (!chainId) {
      throw new Error("Chain ID not available");
    }

    return await cosmosEWallet.signAmino(
      chainId,
      signerAddress,
      signDoc,
      signOptions
    );
  }

  async signDirect(signerAddress: string, signDoc: any, signOptions?: any) {
    console.log(`[EWallet] SignDirect called for address: ${signerAddress}`);

    // Ensure wallet is connected
    if (!this._accountData) {
      await this.connect();
    }

    const cosmosEWallet = this.mainWallet.getCosmosEWallet();
    if (!cosmosEWallet) {
      throw new Error("Cosmos EWallet not available");
    }

    const chainId = this.chainRecord.chain?.chain_id;
    if (!chainId) {
      throw new Error("Chain ID not available");
    }

    return await cosmosEWallet.signDirect(
      chainId,
      signerAddress,
      signDoc,
      signOptions
    );
  }

  async signArbitrary(signerAddress: string, data: string | Uint8Array) {
    console.log(`[EWallet] SignArbitrary called for address: ${signerAddress}`);

    // Ensure wallet is connected
    if (!this._accountData) {
      await this.connect();
    }

    const cosmosEWallet = this.mainWallet.getCosmosEWallet();
    if (!cosmosEWallet) {
      throw new Error("Cosmos EWallet not available");
    }

    const chainId = this.chainRecord.chain?.chain_id;
    if (!chainId) {
      throw new Error("Chain ID not available");
    }

    return await cosmosEWallet.signArbitrary(chainId, signerAddress, data);
  }

  async verifyArbitrary(
    signerAddress: string,
    data: string | Uint8Array,
    signature: any
  ): Promise<boolean> {
    // Ensure wallet is connected
    if (!this._accountData) {
      await this.connect();
    }

    const cosmosEWallet = this.mainWallet.getCosmosEWallet();
    if (!cosmosEWallet) {
      throw new Error("Cosmos EWallet not available");
    }

    const chainId = this.chainRecord.chain?.chain_id;
    if (!chainId) {
      throw new Error("Chain ID not available");
    }

    return (await cosmosEWallet.verifyArbitrary(
      chainId,
      signerAddress,
      data,
      signature
    )) as boolean;
  }

  on() {
    // Event handling placeholder
  }

  off() {
    // Event handling placeholder
  }

  removeAllListeners() {
    // Event handling placeholder
  }

  async initOfflineSigner(): Promise<void> {
    console.log("[EWallet] InitOfflineSigner called");

    // Ensure wallet is connected
    if (!this._accountData) {
      await this.connect();
    }

    const cosmosEWallet = this.mainWallet.getCosmosEWallet();
    if (!cosmosEWallet) {
      throw new Error("Cosmos EWallet not available");
    }

    const chainId = this.chainRecord.chain?.chain_id;
    if (!chainId) {
      throw new Error("Chain ID not available");
    }

    // Get the offline signer and set it
    const [aminoSigner, directSigner] = await Promise.all([
      cosmosEWallet.getOfflineSignerOnlyAmino(chainId),
      cosmosEWallet.getOfflineSigner(chainId),
    ]);

    // Create a combined signer that satisfies both interfaces
    const combinedSigner = {
      getAccounts: () => directSigner.getAccounts(),
      signDirect: directSigner.signDirect.bind(directSigner),
      signAmino: aminoSigner.signAmino.bind(aminoSigner),
    };

    // Set the offline signer and client property for downstream checks
    this.offlineSigner = combinedSigner as unknown as OfflineAminoSigner &
      OfflineDirectSigner;

    // Set client property safely
    if (!(this as any).client) {
      Object.defineProperty(this, "client", {
        value: combinedSigner,
        writable: true,
        configurable: true,
      });
    } else {
      (this as any).client = combinedSigner;
    }

    console.log("[EWallet] OfflineSigner initialized successfully");
  }

  async getOfflineSigner(): Promise<OfflineAminoSigner & OfflineDirectSigner> {
    console.log("[EWallet] GetOfflineSigner called");

    // Ensure wallet is connected
    if (!this._accountData) {
      await this.connect();
    }

    const cosmosEWallet = this.mainWallet.getCosmosEWallet();
    if (!cosmosEWallet) {
      throw new Error("Cosmos EWallet not available");
    }

    const chainId = this.chainRecord.chain?.chain_id;
    if (!chainId) {
      throw new Error("Chain ID not available");
    }

    const [aminoSigner, directSigner] = await Promise.all([
      cosmosEWallet.getOfflineSignerOnlyAmino(chainId),
      cosmosEWallet.getOfflineSigner(chainId),
    ]);

    return {
      getAccounts: () => directSigner.getAccounts(),
      signDirect: directSigner.signDirect.bind(directSigner),
      signAmino: aminoSigner.signAmino.bind(aminoSigner),
    };
  }

  async getOfflineSignerAuto(): Promise<
    OfflineAminoSigner | OfflineDirectSigner
  > {
    console.log("[EWallet] GetOfflineSignerAuto called");

    // Ensure wallet is connected
    if (!this._accountData) {
      await this.connect();
    }

    const cosmosEWallet = this.mainWallet.getCosmosEWallet();
    if (!cosmosEWallet) {
      throw new Error("Cosmos EWallet not available");
    }

    const chainId = this.chainRecord.chain?.chain_id;
    if (!chainId) {
      throw new Error("Chain ID not available");
    }

    return await cosmosEWallet.getOfflineSignerAuto(chainId);
  }

  async getOfflineSignerOnlyAmino(): Promise<OfflineAminoSigner> {
    console.log("[EWallet] GetOfflineSignerOnlyAmino called");

    // Ensure wallet is connected
    if (!this._accountData) {
      await this.connect();
    }

    const cosmosEWallet = this.mainWallet.getCosmosEWallet();
    if (!cosmosEWallet) {
      throw new Error("Cosmos EWallet not available");
    }

    const chainId = this.chainRecord.chain?.chain_id;
    if (!chainId) {
      throw new Error("Chain ID not available");
    }

    return await cosmosEWallet.getOfflineSignerOnlyAmino(chainId);
  }

  async sendTx(tx: Uint8Array, mode?: any) {
    console.log("[EWallet] SendTx called");

    // Ensure wallet is connected
    if (!this._accountData) {
      await this.connect();
    }

    const cosmosEWallet = this.mainWallet.getCosmosEWallet();
    if (!cosmosEWallet) {
      throw new Error("Cosmos EWallet not available");
    }

    const chainId = this.chainRecord.chain?.chain_id;
    if (!chainId) {
      throw new Error("Chain ID not available");
    }

    // Default to sync mode if not specified
    const txMode = mode || "sync";

    return await cosmosEWallet.sendTx(chainId, tx, txMode);
  }
}
