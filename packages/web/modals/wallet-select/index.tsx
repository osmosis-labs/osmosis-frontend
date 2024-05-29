import {
  ChainWalletBase,
  State,
  WalletRepo,
  WalletStatus,
} from "@cosmos-kit/core";
import {
  CosmosKitAccountsLocalStorageKey,
  CosmosKitWalletLocalStorageKey,
  CosmosRegistryWallet,
} from "@osmosis-labs/stores";
import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import { isNil, noop } from "@osmosis-labs/utils";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useUpdateEffect } from "react-use";
import { Connector } from "wagmi";

import { Icon } from "~/components/assets";
import ClientOnly from "~/components/client-only";
import { Button } from "~/components/ui/button";
import { CosmosWalletRegistry } from "~/config";
import { EthereumChainIds } from "~/config/wagmi";
import {
  useFeatureFlags,
  WalletSelectOption,
  WalletSelectParams,
} from "~/hooks";
import { useWindowSize } from "~/hooks";
import { useConnectEvmWallet } from "~/hooks/evm-wallet";
import {
  CreateOneClickSessionError,
  useCreateOneClickTradingSession,
} from "~/hooks/mutations/one-click-trading";
import { useOneClickTradingParams } from "~/hooks/one-click-trading/use-one-click-trading-params";
import { useHasInstalledCosmosWallets } from "~/hooks/use-has-installed-wallets";
import { ModalBase, ModalBaseProps, ModalCloseButton } from "~/modals/base";
import { CosmosWalletState } from "~/modals/wallet-select/cosmos-wallet-state";
import { EvmWalletState } from "~/modals/wallet-select/evm-wallet-state";
import { FullWalletList } from "~/modals/wallet-select/full-wallet-list";
import { SimpleWalletList } from "~/modals/wallet-select/simple-wallet-list";
import { WagmiWalletConnectType } from "~/modals/wallet-select/use-selectable-wallets";
import {
  getModalView,
  ModalView,
  OnConnectWallet,
} from "~/modals/wallet-select/utils";
import { useStore } from "~/stores";

export interface WalletSelectModalProps extends ModalBaseProps {
  /**
   * Defines what wallets to show in the modal.
   */
  walletOptions: WalletSelectParams["walletOptions"];
  layout?: WalletSelectParams["layout"];
  onConnect?: (params: { walletType: "evm" | "cosmos" }) => void;
}

export const WalletSelectModal: FunctionComponent<WalletSelectModalProps> =
  observer((props) => {
    const {
      isOpen,
      onRequestClose,
      walletOptions,
      onConnect: onConnectProp,
      layout = "full",
    } = props;
    const { isMobile } = useWindowSize();
    const { accountStore, chainStore } = useStore();
    const featureFlags = useFeatureFlags();
    const hasInstalledWallets = useHasInstalledCosmosWallets();
    const [show1CTEditParams, setShow1CTEditParams] = useState(false);
    const [hasBroadcastedTx, setHasBroadcastedTx] = useState(false);
    const {
      connectAsync: connectEvmWallet,
      variables,
      status,
      error,
      reset,
    } = useConnectEvmWallet();

    const create1CTSession = useCreateOneClickTradingSession({
      onBroadcasted: () => {
        setHasBroadcastedTx(true);
      },
      queryOptions: {
        onSuccess: () => {
          onRequestClose();
        },
        onSettled: () => {
          setIsInitializingOneClickTrading(false);
          setHasBroadcastedTx(false);
        },
      },
    });

    const [qrState, setQRState] = useState<State>(State.Init);
    const [qrMessage, setQRMessage] = useState<string>("");
    const [modalView, setModalView] = useState<ModalView>("list");
    const [isInitializingOneClickTrading, setIsInitializingOneClickTrading] =
      useState(false);
    const [lazyWalletInfo, setLazyWalletInfo] =
      useState<(typeof CosmosWalletRegistry)[number]>();
    const [show1CTConnectAWallet, setShow1CTConnectAWallet] = useState(false);

    const hasOneClickTradingError = !!create1CTSession.error;

    const {
      transaction1CTParams,
      setTransaction1CTParams,
      isLoading: isLoading1CTParams,
      spendLimitTokenDecimals,
      reset: reset1CTParams,
    } = useOneClickTradingParams();

    const cosmosOption = walletOptions.find(
      (
        option
      ): option is Extract<WalletSelectOption, { walletType: "cosmos" }> =>
        option.walletType === "cosmos"
    );

    const cosmosChainId = cosmosOption?.chainId;
    const rootWalletRepo = cosmosChainId
      ? accountStore.getWalletRepo(cosmosChainId)
      : undefined;
    const current = rootWalletRepo?.current;
    const cosmosWalletStatus = current?.walletStatus;
    const cosmosChainName = rootWalletRepo?.chainRecord.chain?.chain_name!;

    useEffect(() => {
      if (isOpen) {
        setModalView(
          getModalView({
            qrState,
            walletStatus: cosmosWalletStatus,
            isInitializingOneClickTrading,
            hasOneClickTradingError,
            hasBroadcastedTx,
          })
        );
      }
    }, [
      qrState,
      cosmosWalletStatus,
      isOpen,
      qrMessage,
      isInitializingOneClickTrading,
      hasOneClickTradingError,
      hasBroadcastedTx,
    ]);

    useUpdateEffect(() => {
      if (!isOpen) {
        setIsInitializingOneClickTrading(false);
      }
    }, [isOpen]);

    (current?.client as any)?.setActions?.({
      qrUrl: {
        state: setQRState,
        /**
         * We need this function to avoid crashing the Cosmoskit library.
         * A PR is open with a fix for this issue.
         * @see https://github.com/cosmology-tech/cosmos-kit/pull/176
         *  */
        message: setQRMessage,
      },
    });

    const onClose = () => {
      onRequestClose();
      if (
        cosmosWalletStatus === WalletStatus.Connecting ||
        cosmosWalletStatus === WalletStatus.Rejected ||
        cosmosWalletStatus === WalletStatus.Error
      ) {
        rootWalletRepo?.disconnect();
      }
    };

    const onCreate1CTSession = async ({
      walletRepo,
      transaction1CTParams,
    }: {
      walletRepo: WalletRepo;
      transaction1CTParams: OneClickTradingTransactionParams | undefined;
    }) => {
      create1CTSession.reset();
      setIsInitializingOneClickTrading(true);
      return create1CTSession.mutate({
        walletRepo,
        transaction1CTParams,
        spendLimitTokenDecimals: spendLimitTokenDecimals,
      });
    };

    const onConnectCosmosWallet = async ({
      wallet,
      walletRepo: walletRepoParam,
    }: {
      wallet: CosmosRegistryWallet | ChainWalletBase;
      walletRepo: WalletRepo;
    }) => {
      if (current) {
        await current?.disconnect(true);
      }

      const handleConnectError = (e: Error) => {
        console.error("Error while connecting to wallet. Details: ", e);
        localStorage.removeItem(CosmosKitWalletLocalStorageKey);
        localStorage.removeItem(CosmosKitAccountsLocalStorageKey);
      };

      if (!("lazyInstall" in wallet)) {
        wallet
          .connect(false)
          .then(() => {
            onConnectProp?.({ walletType: "cosmos" });
          })
          .catch(handleConnectError);
        return;
      }

      const isWalletInstalled = rootWalletRepo?.wallets.some(
        ({ walletName }) => walletName === wallet.name
      );

      let walletRepo: WalletRepo;

      // if wallet is not installed, install it
      if (!isWalletInstalled && "lazyInstall" in wallet) {
        setLazyWalletInfo(wallet);
        setModalView("connecting");

        // wallet is now walletInfo
        const walletInfo = wallet;
        const WalletClass = await wallet.lazyInstall();

        const walletManager = await accountStore.addWallet(
          new WalletClass(walletInfo)
        );
        await walletManager.onMounted().catch(handleConnectError);
        setLazyWalletInfo(undefined);

        walletRepo = walletManager.getWalletRepo(cosmosChainName!);
      } else {
        walletRepo = walletRepoParam;
      }

      const isOsmosisConnection =
        chainStore.osmosis.chainName === cosmosChainName!;
      const osmosisWalletRepo = accountStore.getWalletRepo(
        chainStore.osmosis.chainName
      );

      if (
        !isOsmosisConnection &&
        osmosisWalletRepo.walletStatus !== WalletStatus.Connected
      ) {
        await osmosisWalletRepo
          .connect(wallet.name, false)
          .catch(handleConnectError);
      }

      return walletRepo
        .connect(wallet.name, false)
        .then(async () => {
          onConnectProp?.({ walletType: "cosmos" });

          if (transaction1CTParams?.isOneClickEnabled) {
            try {
              await onCreate1CTSession({ walletRepo, transaction1CTParams });
            } catch (e) {
              const error = e as CreateOneClickSessionError | Error;

              if (error instanceof Error) {
                throw new CreateOneClickSessionError(error.message);
              }

              throw e;
            }
          }
        })
        .catch((e: Error | unknown) => {
          if (e instanceof CreateOneClickSessionError) throw e;
          handleConnectError(
            e instanceof Error ? e : new Error("Unknown error.")
          );
        });
    };

    const onConnectWagmiWallet = async ({
      wallet,
      chainId,
    }: {
      wallet: Connector;
      chainId: EthereumChainIds | undefined;
    }) => {
      // Close modal to show WalletConnect QR code modal
      if (wallet.type === WagmiWalletConnectType) {
        onRequestClose();
      }

      return connectEvmWallet(
        { connector: wallet, chainId: chainId },
        {
          onSuccess: () => {
            onConnectProp?.({ walletType: "evm" });
          },
          onError: (e) => {
            console.error("Error while connecting to wallet. Details: ", e);
          },
        }
      );
    };

    const onConnect: OnConnectWallet = async (param) => {
      if (!param.wallet) return;

      if (param.walletType === "cosmos" && rootWalletRepo) {
        return onConnectCosmosWallet({
          wallet: param.wallet,
          walletRepo: rootWalletRepo,
        });
      }

      if (param.walletType === "evm") {
        return onConnectWagmiWallet({
          wallet: param.wallet,
          chainId: param.chainId,
        }).catch(noop);
      }
    };

    const onRequestBack =
      modalView !== "list"
        ? () => {
            if (
              cosmosWalletStatus === WalletStatus.Connecting ||
              cosmosWalletStatus === WalletStatus.Rejected ||
              cosmosWalletStatus === WalletStatus.Error ||
              cosmosWalletStatus === WalletStatus.Connected
            ) {
              rootWalletRepo?.disconnect();
              rootWalletRepo?.activate();
            }

            if (
              modalView === "initializeOneClickTradingError" ||
              modalView === "initializingOneClickTrading"
            ) {
              reset1CTParams();
              // Clear the errors and loading states
              create1CTSession.reset();
              setIsInitializingOneClickTrading(false);
              setShow1CTConnectAWallet(false);
            }

            setModalView("list");
          }
        : undefined;

    return (
      <ModalBase
        isOpen={isOpen}
        onRequestClose={onClose}
        hideCloseButton
        className={classNames(
          "max-h-[90vh] w-full overflow-hidden !px-0 py-0 sm:max-h-[80vh]",
          {
            "max-w-[800px]": layout === "full",
            "max-w-[450px]": layout === "list",
          }
        )}
      >
        {layout === "list" && (
          <div className="relative h-full w-full">
            <Button
              aria-label="Go Back"
              size="icon"
              variant="ghost"
              className="absolute left-6 top-6 z-50 w-fit text-osmoverse-400 hover:text-white-full"
              onClick={() => {
                reset();
              }}
            >
              <Icon id="chevron-left" width={16} height={16} />
            </Button>
            <SimpleWalletList
              onConnect={onConnect}
              isMobile={isMobile}
              walletOptions={walletOptions}
            />
            {!isNil(variables?.connector) && (
              <div className="absolute inset-0 bg-osmoverse-800">
                <EvmWalletState
                  {...props}
                  connector={variables.connector as Connector}
                  status={status}
                  error={error}
                  onConnect={onConnect}
                />
              </div>
            )}
            <ModalCloseButton onClick={onClose} />
          </div>
        )}

        {layout === "full" && (
          <>
            <div
              className={classNames(
                "flex overflow-auto sm:max-h-full sm:flex-col",
                modalView === "qrCode" ? "max-h-[600px]" : "max-h-[530px]",
                hasInstalledWallets && featureFlags.oneClickTrading
                  ? "min-h-[73vh]"
                  : "min-h-[50vh]"
              )}
            >
              <ClientOnly
                className={classNames(
                  "w-full max-w-[284px] overflow-auto sm:max-w-none sm:shrink-0 sm:bg-[rgba(20,15,52,0.2)]",
                  "before:pointer-events-none before:absolute before:inset-0 before:max-w-[284px] before:bg-[rgba(20,15,52,0.2)] before:sm:hidden"
                )}
              >
                <FullWalletList
                  onConnect={onConnect}
                  walletRepo={rootWalletRepo}
                  isMobile={isMobile}
                  modalView={modalView}
                  walletOptions={walletOptions}
                />
              </ClientOnly>
              <div className="relative w-full overflow-auto py-8 sm:static">
                {onRequestBack && (
                  <Button
                    aria-label="Go Back"
                    size="icon"
                    variant="ghost"
                    className="absolute left-6 top-6 z-50 w-fit text-osmoverse-400 hover:text-white-full"
                    onClick={onRequestBack}
                  >
                    <Icon id="chevron-left" width={16} height={16} />
                  </Button>
                )}
                <CosmosWalletState
                  {...props}
                  onRequestClose={onClose}
                  modalView={modalView}
                  onConnect={onConnect}
                  lazyWalletInfo={lazyWalletInfo}
                  transaction1CTParams={transaction1CTParams}
                  setTransaction1CTParams={setTransaction1CTParams}
                  isLoading1CTParams={isLoading1CTParams}
                  walletRepo={rootWalletRepo}
                  onCreate1CTSession={() =>
                    onCreate1CTSession({
                      walletRepo: rootWalletRepo!,
                      transaction1CTParams,
                    })
                  }
                  show1CTConnectAWallet={show1CTConnectAWallet}
                  setShow1CTConnectAWallet={setShow1CTConnectAWallet}
                  show1CTEditParams={show1CTEditParams}
                  setShow1CTEditParams={setShow1CTEditParams}
                  walletOptions={walletOptions}
                />

                {/* Hide close button since 1CT edit params will include it */}
                {!show1CTEditParams && <ModalCloseButton onClick={onClose} />}
              </div>
            </div>
          </>
        )}
      </ModalBase>
    );
  });
