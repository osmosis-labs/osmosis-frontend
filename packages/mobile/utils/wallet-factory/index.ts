import { KeyInfo } from "~/stores/keyring";
import { cosmosSmartAccountWalletFactory } from "~/utils/wallet-factory/cosmos/smart-account";
import { cosmosViewOnlyWalletFactory } from "~/utils/wallet-factory/cosmos/view-only";

import { WalletFactory as BaseWalletFactory } from "./interface";

export class WalletFactory implements BaseWalletFactory {
  public async createWallet({ keyInfo }: { keyInfo: KeyInfo }): Promise<void> {
    switch (keyInfo.type) {
      case "view-only":
        cosmosViewOnlyWalletFactory.createWallet({ keyInfo });
        break;
      case "smart-account":
        cosmosSmartAccountWalletFactory.createWallet({ keyInfo });
        break;
      default:
        throw new Error("Invalid wallet type");
    }
  }

  public async deleteWallet(params: {
    index: number;
    type: KeyInfo["type"];
  }): Promise<void> {
    switch (params.type) {
      case "view-only":
        cosmosViewOnlyWalletFactory.deleteWallet({ index: params.index });
        break;
      case "smart-account":
        cosmosSmartAccountWalletFactory.deleteWallet({ index: params.index });
        break;
      default:
        throw new Error("Invalid wallet type");
    }
  }
}
