import { KVStore } from "@keplr-wallet/common";
import { IBCCurrency } from "@keplr-wallet/types";
import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { ComponentProps } from "react";

import { displayToast, ToastType } from "~/components/alert";
import { FiatRampKey, ObservableWallet, SourceChainKey } from "~/integrations";
import { EthWallet, ObservableMetamask } from "~/integrations/ethereum";
import {
  BridgeTransferModal,
  FiatRampsModal,
  IbcTransferModal,
  SelectAssetSourceModal,
  TransferAssetSelectModal,
} from "~/modals";
import { IBCBalance, ObservableAssets } from "~/stores/assets";
import { makeLocalStorageKVStore } from "~/stores/kv-store";

type TransferDir = "withdraw" | "deposit";

/** Coordinates user preference for transfer (IBC or non-IBC) of asset, network, and asset custodian via display of modals. */
export class ObservableTransferUIConfig {
  // stores prop state for each modal and handles transferring state between them, including:
  // * requesting to switch wallet from bespoke bridge transfer modal
  // * clicking back button
  // * transferring from the global deposit/withdraw buttons
  // * transferring by clicking on an asset table row
  // * launching fiat on/off ramps

  @observable
  protected _ibcTransferModal: ComponentProps<typeof IbcTransferModal> | null =
    null;
  get ibcTransferModal(): ComponentProps<typeof IbcTransferModal> | null {
    return this._ibcTransferModal;
  }

  @observable
  protected _assetSelectModal: ComponentProps<
    typeof TransferAssetSelectModal
  > | null = null;
  get assetSelectModal(): ComponentProps<
    typeof TransferAssetSelectModal
  > | null {
    return this._assetSelectModal;
  }

  @observable
  protected _selectAssetSourceModal: ComponentProps<
    typeof SelectAssetSourceModal
  > | null = null;
  get selectAssetSourceModal(): ComponentProps<
    typeof SelectAssetSourceModal
  > | null {
    return this._selectAssetSourceModal;
  }

  @observable
  protected _bridgeTransferModal: ComponentProps<
    typeof BridgeTransferModal
  > | null = null;
  get bridgeTransferModal(): ComponentProps<typeof BridgeTransferModal> | null {
    return this._bridgeTransferModal;
  }

  @observable
  protected _fiatRampsModal: ComponentProps<typeof FiatRampsModal> | null =
    null;
  get fiatRampsModal(): ComponentProps<typeof FiatRampsModal> | null {
    return this._fiatRampsModal;
  }

  @observable
  protected _isMobile: boolean = false;

  constructor(
    protected readonly assetsStore: ObservableAssets,
    protected readonly kvStore: KVStore
  ) {
    makeObservable(this);
  }

  @action
  public setIsMobile(isMobile: boolean) {
    this._isMobile = isMobile;
  }

  @observable
  readonly metamask = new ObservableMetamask(
    makeLocalStorageKVStore("metamask")
  );
  /**
   * Disabled for now. WalletConnect V1 is no longer available.
   * // TODO: WalletConnect V2
   */
  // @observable
  // readonly walletConnectEth = new ObservableWalletConnect(
  //   makeLocalStorageKVStore("wc-eth")
  // );

  @computed
  protected get _ethClientWallets(): EthWallet[] {
    return [this.metamask].filter((wallet) =>
      this._isMobile ? wallet.mobileEnabled : true
    );
  }

  /** ### GLOBAL DEPOSIT/WITHDRAW BUTTONS AT TOP
   *  User wants to transfer asset, but the counterparty IBC chain and coinDenom are TBD. */
  @action
  startTransfer(direction: TransferDir) {
    this.launchAssetSelectModal(direction, (denom, sourceChainKey) => {
      if (sourceChainKey) {
        // bridge integration
        const bridgedBalance = this.assetsStore.ibcBalances.find(
          (bal) =>
            typeof bal.originBridgeInfo !== "undefined" &&
            bal.originBridgeInfo.sourceChainTokens
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

        this.transferAsset(direction, bridgedBalance.chainInfo.chainId, denom);
      } else {
        // ibc transfer
        const ibcBalance = this.assetsStore.ibcBalances.find(
          (bal) => bal.balance.denom === denom
        );
        if (!ibcBalance) {
          console.error(`IBC asset for ${denom} not found`);
          return;
        }

        this.launchIbcTransferModal(direction, ibcBalance);
      }
    });
  }

  /** ### DEPOSIT/WITHDRAW FROM TABLE ROW
   *  User wants to transfer asset with counterparty IBC chain and coinDenom known. */
  @action
  async transferAsset(
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
      const sourceChainKey: SourceChainKey =
        (await this.kvStore.get(makeAssetSrcNetworkPreferredKey(coinDenom))) ||
        balance.originBridgeInfo?.defaultSourceChainId ||
        balance.originBridgeInfo.sourceChainTokens[0].id;

      // bridge integration
      const applicableWallets = this._ethClientWallets.filter(({ key }) =>
        balance.originBridgeInfo!.wallets.includes(key)
      ) as ObservableWallet[];
      const alreadyConnectedWallet = applicableWallets.find(
        (wallet) => wallet.isConnected
      );

      if (
        alreadyConnectedWallet &&
        alreadyConnectedWallet.chainId &&
        (direction === "withdraw" ||
          !balance.fiatRamps ||
          balance.fiatRamps.length === 0)
      ) {
        this.launchBridgeTransferModal(
          direction,
          balance,
          alreadyConnectedWallet,
          sourceChainKey,
          () => {
            this.closeAllModals();
            this.launchSelectAssetSourceModal(
              direction,
              balance,
              sourceChainKey
            );
          }
        );
      } else {
        this.launchSelectAssetSourceModal(direction, balance, sourceChainKey);
      }
    } else {
      this.launchIbcTransferModal(direction, balance);
    }
  }

  // SECTION - methods for launching a particular modal

  @action
  protected launchIbcTransferModal(
    direction: TransferDir,
    balance: (typeof this.assetsStore.ibcBalances)[0]
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

  protected async launchAssetSelectModal(
    direction: "deposit" | "withdraw",
    onSelectAsset: (
      denom: string,
      /** Is ibc transfer if `undefined`. */
      sourceChainKey?: SourceChainKey
    ) => void
  ) {
    const availableAssets = this.assetsStore.ibcBalances.filter(
      (asset) =>
        !asset.withdrawUrlOverride &&
        !asset.depositUrlOverride &&
        !asset.isUnstable
    );
    const tokens = await Promise.all(
      availableAssets.map(async ({ balance, originBridgeInfo }) => {
        const defaultSourceChainId = await this.kvStore.get<string | undefined>(
          makeAssetSrcNetworkPreferredKey(balance.denom)
        );

        // override default source chain if prev selected by
        if (originBridgeInfo && defaultSourceChainId)
          originBridgeInfo.defaultSourceChainId =
            (defaultSourceChainId as SourceChainKey) ?? undefined;

        return {
          token: balance,
          originBridgeInfo,
        };
      })
    );

    runInAction(() => {
      this._assetSelectModal = {
        isOpen: true,
        isWithdraw: direction === "withdraw",
        onRequestClose: () => this.closeAllModals(),
        tokens,
        onSelectAsset: (denom, sourceChainKey) => {
          this.closeAllModals();
          if (sourceChainKey)
            this.kvStore.set(
              makeAssetSrcNetworkPreferredKey(denom),
              sourceChainKey
            );

          onSelectAsset(denom, sourceChainKey);
        },
      };
    });
  }

  @action
  protected launchSelectAssetSourceModal(
    direction: TransferDir,
    balanceOnOsmosis: IBCBalance,
    sourceChainKey: SourceChainKey
  ) {
    const wallets = this._ethClientWallets as ObservableWallet[];
    const applicableWallets = wallets.filter(({ key }) =>
      balanceOnOsmosis.originBridgeInfo!.wallets.includes(key)
    );
    const alreadyConnectedWallet = applicableWallets.find(
      (wallet) => wallet.isConnected
    );

    this._selectAssetSourceModal = {
      isOpen: true,
      initiallySelectedWalletId: alreadyConnectedWallet?.key,
      isWithdraw: direction === "withdraw",
      onRequestClose: () => this.closeAllModals(),
      wallets,
      fiatRamps:
        this._isMobile || direction === "withdraw" // ramps: only show when depositing
          ? []
          : balanceOnOsmosis.fiatRamps?.map(({ rampKey }) => rampKey),
      onSelectSource: (key) => {
        const selectedWallet = wallets.find((wallet) => wallet.key === key);
        const selectedFiatRamp = balanceOnOsmosis.fiatRamps?.find(
          ({ rampKey }) => rampKey === key
        );

        if (selectedWallet !== undefined) {
          // enable then call back
          const openBridgeModal = () => {
            this.closeAllModals();
            this.launchBridgeTransferModal(
              direction,
              balanceOnOsmosis,
              selectedWallet,
              sourceChainKey,
              () => {
                this.closeAllModals();
                this.launchSelectAssetSourceModal(
                  direction,
                  balanceOnOsmosis,
                  sourceChainKey
                );
              },
              () => {
                this.closeAllModals();
                this.launchSelectAssetSourceModal(
                  direction,
                  balanceOnOsmosis,
                  sourceChainKey
                );
              }
            );
          };

          if (!selectedWallet.isConnected) {
            wallets.forEach((wallet) => wallet.disable());
            selectedWallet
              .enable()
              .then(openBridgeModal)
              .catch((e) => this.displayWalletErrorToast(selectedWallet, e));
          } else openBridgeModal();
        } else if (selectedFiatRamp !== undefined) {
          this.closeAllModals();
          this.launchFiatRampsModal(
            selectedFiatRamp.rampKey,
            selectedFiatRamp.assetKey
          );
        } else {
          console.error("Given wallet or fiat ramp key doesn't match anything");
          this.closeAllModals();
        }
      },
    };
  }

  @action
  protected launchBridgeTransferModal(
    direction: TransferDir,
    balanceOnOsmosis: IBCBalance,
    connectedWalletClient: ObservableWallet,
    sourceChainKey: SourceChainKey,
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
      sourceChainKey,
    };
  }

  @action
  launchFiatRampsModal(fiatRampKey: FiatRampKey, assetKey: string) {
    this._fiatRampsModal = {
      isOpen: true,
      onRequestClose: () => this.closeAllModals(),
      fiatRampKey,
      assetKey,
    };
  }

  @action
  protected closeAllModals() {
    this._selectAssetSourceModal =
      this._assetSelectModal =
      this._bridgeTransferModal =
      this._ibcTransferModal =
      this._fiatRampsModal =
        null;
  }

  protected displayWalletErrorToast(wallet: ObservableWallet, e: any) {
    const alert = wallet.displayError?.(e);

    if (!alert || typeof alert === "string") {
      // unknown
      displayToast(
        {
          message: "errors.generic",
          caption: "unknownError",
        },
        ToastType.ERROR
      );
      console.error(alert || e?.message || e);
    } else {
      displayToast(
        alert,
        // if we know it's a pending op, show loading toast
        e.code === -32002 ? ToastType.LOADING : ToastType.ERROR
      );
    }
  }
}

function makeAssetSrcNetworkPreferredKey(denom: string): string {
  return `asset-src-preferred-network-key--${denom}`;
}
