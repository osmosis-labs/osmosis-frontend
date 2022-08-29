import { makeObservable, observable, action } from "mobx";
import { ComponentProps } from "react";
import { WalletStatus } from "@keplr-wallet/stores";
import { AccountSetBase } from "@keplr-wallet/stores";
import { IBCCurrency } from "@keplr-wallet/types";
import {
  IbcTransferModal,
  BridgeTransferModal,
  ConnectNonIbcWallet,
  TransferAssetSelectModal,
} from "../../modals";
import {
  ObservableMetamask,
  ObservableWalletConnect,
  EthWallet,
} from "../../integrations/ethereum";
import { Wallet, SourceChainKey } from "../../integrations";
import { makeLocalStorageKVStore } from "../../stores/kv-store";
import { IBCBalance, ObservableAssets } from ".";

type TransferDir = "withdraw" | "deposit";

/** Coordinates user preference for transfer (IBC or non-IBC) of asset, network, and asset custodian via display of modals. */
export class ObservableTransferUIConfig {
  // stores prop state for each modal and handles transferring state between them, including:
  // * requesting to switch wallet from bespoke bridge transfer modal
  // * clicking back button
  // * transferring from the global deposit/withdraw buttons
  // * transferring by clicking on an asset table row

  @observable
  protected _ibcTransferModal:
    | ComponentProps<typeof IbcTransferModal>
    | undefined;
  get ibcTransferModal(): ComponentProps<typeof IbcTransferModal> | undefined {
    return this._ibcTransferModal;
  }

  @observable
  protected _assetSelectModal:
    | ComponentProps<typeof TransferAssetSelectModal>
    | undefined;
  get assetSelectModal():
    | ComponentProps<typeof TransferAssetSelectModal>
    | undefined {
    return this._assetSelectModal;
  }

  @observable
  protected _connectNonIbcWalletModal:
    | ComponentProps<typeof ConnectNonIbcWallet>
    | undefined;
  get connectNonIbcWalletModal():
    | ComponentProps<typeof ConnectNonIbcWallet>
    | undefined {
    return this._connectNonIbcWalletModal;
  }

  @observable
  protected _bridgeTransferModal:
    | ComponentProps<typeof BridgeTransferModal>
    | undefined;
  get bridgeTransferModal():
    | ComponentProps<typeof BridgeTransferModal>
    | undefined {
    return this._bridgeTransferModal;
  }

  constructor(
    protected readonly assetsStore: ObservableAssets,
    protected readonly account: AccountSetBase
  ) {
    makeObservable(this);
  }

  @observable
  readonly metamask = new ObservableMetamask(
    makeLocalStorageKVStore("metamask")
  );
  readonly walletConnectEth = new ObservableWalletConnect(
    makeLocalStorageKVStore("wc-eth")
  );

  protected get _ethClientWallets(): EthWallet[] {
    return [this.metamask, this.walletConnectEth];
  }

  /** User wants to transfer asset, but the counterparty IBC chain and coinDenom are TBD. */
  @action
  startTransfer(direction: TransferDir) {
    this.setupAssetSelectModal(direction, (denom, sourceChainKey) => {
      if (sourceChainKey) {
        // bridge integration
        const bridgedBalance = this.assetsStore.ibcBalances.find(
          (bal) =>
            typeof bal.originBridgeInfo !== "undefined" &&
            bal.originBridgeInfo.sourceChains
              .map((sc) => sc.id)
              .flat()
              .includes(sourceChainKey) &&
            bal.balance.currency.coinDenom === denom
        );
        if (!bridgedBalance) {
          console.error(
            `IBC asset for ${denom} and source network of ${sourceChainKey} not found`
          );
          return;
        }

        this.handleTransferIntent(
          direction,
          bridgedBalance.chainInfo.chainId,
          denom
        );
      } else {
        // ibc transfer
        const ibcBalance = this.assetsStore.ibcBalances.find(
          (bal) => bal.balance.denom === denom
        );
        if (!ibcBalance) {
          console.error(`IBC asset for ${denom} not found`);
          return;
        }

        this.setupIbcTransferModal(direction, ibcBalance);
      }
    });
  }

  /** User wants to transfer asset with counterparty IBC chain and coinDenom known. */
  @action
  handleTransferIntent(
    direction: TransferDir,
    chainId: string,
    coinDenom: string
  ) {
    const balance = this.assetsStore.ibcBalances.find(
      (bal) =>
        bal.chainInfo.chainId === chainId &&
        bal.balance.currency.coinDenom === coinDenom
    );

    if (!balance) {
      console.error(
        "Chain ID and coin denom couldn't be used to find IBC asset"
      );
      return;
    }

    if (balance.originBridgeInfo) {
      // bridge integration
      const applicableWallets = this._ethClientWallets.filter(({ key }) =>
        balance.originBridgeInfo!.wallets.includes(key)
      ) as Wallet[];
      const alreadyConnectedWallet = applicableWallets.find(
        (wallet) => wallet.isConnected
      );

      if (
        alreadyConnectedWallet &&
        alreadyConnectedWallet.chainId &&
        this.account.walletStatus === WalletStatus.Loaded
      ) {
        this.setupBridgeTransferModal(
          direction,
          balance,
          alreadyConnectedWallet,
          () => {
            this.closeAllModals();
            this.setupSelectNonIbcWalletModal(direction, balance);
          }
        );
      } else if (applicableWallets.length > 0) {
        this.setupSelectNonIbcWalletModal(direction, balance);
      } else {
        console.warn(
          "No non-Keplr wallets found for this bridged asset:",
          balance.balance.currency.coinDenom
        );
      }
    } else {
      this.setupIbcTransferModal(direction, balance);
    }
  }

  @action
  protected setupIbcTransferModal(
    direction: TransferDir,
    balance: typeof this.assetsStore.ibcBalances[0]
  ) {
    const currency = balance.balance.currency;
    // IBC multihop currency
    const modifiedCurrency =
      direction === "deposit" && balance.depositingSrcMinDenom
        ? {
            coinDecimals: currency.coinDecimals,
            coinGeckoId: currency.coinGeckoId,
            coinImageUrl: currency.coinImageUrl,
            coinDenom: currency.coinDenom,
            coinMinimalDenom: "",
            paths: (currency as IBCCurrency).paths.slice(0, 1),
            originChainId: balance.chainInfo.chainId,
            originCurrency: {
              coinDecimals: currency.coinDecimals,
              coinImageUrl: currency.coinImageUrl,
              coinDenom: currency.coinDenom,
              coinMinimalDenom: balance.depositingSrcMinDenom,
            },
          }
        : currency;

    const {
      chainInfo: { chainId: counterpartyChainId },
      sourceChannelId,
      destChannelId,
    } = balance;

    this._ibcTransferModal = {
      isOpen: true,
      onRequestClose: () => this.closeAllModals(),
      currency: modifiedCurrency as IBCCurrency,
      counterpartyChainId: counterpartyChainId,
      sourceChannelId,
      destChannelId,
      isWithdraw: direction === "withdraw",
      ics20ContractAddress:
        "ics20ContractAddress" in balance
          ? balance.ics20ContractAddress
          : undefined,
    };
  }

  @action
  protected setupAssetSelectModal(
    direction: "deposit" | "withdraw",
    onSelectAsset: (denom: string, sourceChainKey?: SourceChainKey) => void
  ) {
    this._assetSelectModal = {
      isOpen: true,
      isWithdraw: direction === "withdraw",
      onRequestClose: () => this.closeAllModals(),
      tokens: this.assetsStore.ibcBalances.map(
        ({ balance, originBridgeInfo }) => ({
          token: balance,
          originBridgeInfo,
        })
      ),
      onSelectAsset: (denom, sourceChainKey) => {
        this.closeAllModals();
        onSelectAsset(denom, sourceChainKey);
      },
    };
  }

  @action
  protected setupSelectNonIbcWalletModal(
    direction: TransferDir,
    balanceOnOsmosis: IBCBalance
  ) {
    const applicableWalletClients = this._ethClientWallets as Wallet[];
    const applicableWallets = applicableWalletClients.filter(({ key }) =>
      balanceOnOsmosis.originBridgeInfo!.wallets.includes(key)
    );
    const alreadyConnectedWallet = applicableWallets.find(
      (wallet) => wallet.isConnected
    );

    this._connectNonIbcWalletModal = {
      isOpen: true,
      initiallySelectedSourceId: alreadyConnectedWallet?.key,
      isWithdraw: direction === "withdraw",
      onRequestClose: () => this.closeAllModals(),
      sources: applicableWalletClients.map((wallet) => ({
        id: wallet.key,
        ...wallet.displayInfo,
      })),
      onSelectSource: (key) => {
        const selectedWallet = applicableWalletClients.find(
          (wallet) => wallet.key === key
        );
        if (selectedWallet) {
          // enable then call back
          selectedWallet.enable().then(() => {
            this.setupBridgeTransferModal(
              direction,
              balanceOnOsmosis,
              selectedWallet,
              () => {
                this.closeAllModals();
                this.setupSelectNonIbcWalletModal(direction, balanceOnOsmosis);
              },
              () => {
                this.closeAllModals();
                this.setupSelectNonIbcWalletModal(direction, balanceOnOsmosis);
              }
            );
            this.closeAllModals();
          });
        } else {
          console.error("Given wallet key doesn't match any wallet");
          this._connectNonIbcWalletModal = undefined;
        }
      },
    };
  }

  @action
  protected setupBridgeTransferModal(
    direction: TransferDir,
    balanceOnOsmosis: IBCBalance,
    connectedWalletClient: Wallet,
    onRequestSwitchWallet: () => void,
    onRequestBack?: () => void
  ) {
    if (!balanceOnOsmosis.originBridgeInfo) {
      console.error("This IBC asset does not support bridge integration");
      return;
    }

    this._bridgeTransferModal = {
      isOpen: true,
      isWithdraw: direction === "withdraw",
      onRequestClose: () => this.closeAllModals(),
      onRequestSwitchWallet,
      onRequestBack,
      balance: balanceOnOsmosis,
      walletClient: connectedWalletClient,
      // assume selected chain is desired source/dest network
      sourceChainKey: connectedWalletClient.chainId as SourceChainKey,
    };
  }

  @action
  protected closeAllModals() {
    this._connectNonIbcWalletModal =
      this._assetSelectModal =
      this._bridgeTransferModal =
      this._ibcTransferModal =
        undefined;
  }
}
