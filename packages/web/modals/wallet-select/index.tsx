import { State, WalletRepo, WalletStatus } from "@cosmos-kit/core";
import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import { isNil } from "@osmosis-labs/utils";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";
import { useUpdateEffect } from "react-use";
import { Connector } from "wagmi";

import { Icon } from "~/components/assets";
import { ClientOnly } from "~/components/client-only";
import { Button } from "~/components/ui/button";
import { useFeatureFlags, WalletSelectParams } from "~/hooks";
import { useWindowSize } from "~/hooks";
import { useCreateOneClickTradingSession } from "~/hooks/mutations/one-click-trading";
import { useOneClickTradingParams } from "~/hooks/one-click-trading/use-one-click-trading-params";
import { useHasInstalledCosmosWallets } from "~/hooks/use-has-installed-wallets";
import { ModalBase, ModalBaseProps, ModalCloseButton } from "~/modals/base";
import { CosmosWalletState } from "~/modals/wallet-select/cosmos-wallet-state";
import { EvmWalletState } from "~/modals/wallet-select/evm-wallet-state";
import { FullWalletList } from "~/modals/wallet-select/full-wallet-list";
import { SimpleWalletList } from "~/modals/wallet-select/simple-wallet-list";
import { useConnectWallet } from "~/modals/wallet-select/use-connect-wallet";
import { getModalView, ModalView } from "~/modals/wallet-select/utils";
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
    const { accountStore } = useStore();
    const { isMobile } = useWindowSize();
    const featureFlags = useFeatureFlags();
    const hasInstalledWallets = useHasInstalledCosmosWallets();
    const [show1CTEditParams, setShow1CTEditParams] = useState(false);
    const [hasBroadcastedTx, setHasBroadcastedTx] = useState(false);

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

    const [show1CTConnectAWallet, setShow1CTConnectAWallet] = useState(false);

    const {
      transaction1CTParams,
      setTransaction1CTParams,
      isLoading: isLoading1CTParams,
      spendLimitTokenDecimals,
      reset: reset1CTParams,
    } = useOneClickTradingParams({
      defaultIsOneClickEnabled: accountStore.hasUsedOneClickTrading,
    });

    const {
      onConnect: onConnectWallet,
      wagmi: { variables, status, error, reset },
      cosmos: { walletRepo: rootWalletRepo, lazyWalletInfo },
    } = useConnectWallet({
      onConnecting: () => setModalView("connecting"),
      onRequestClose: onRequestClose,
      walletOptions,
      onConnect: onConnectProp,

      isOneClickEnabled: transaction1CTParams?.isOneClickEnabled,
      onCreate1CTSession: ({ walletRepo }) =>
        onCreate1CTSession({ walletRepo, transaction1CTParams }),
    });

    const currentCosmosWallet = rootWalletRepo?.current;
    const cosmosWalletStatus = currentCosmosWallet?.walletStatus;

    useEffect(() => {
      if (isOpen) {
        setModalView(
          getModalView({
            qrState,
            walletStatus: cosmosWalletStatus,
            isInitializingOneClickTrading,
            oneClickTradingError: create1CTSession.error as Error | null,
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
      hasBroadcastedTx,
      create1CTSession.error,
    ]);

    useUpdateEffect(() => {
      if (!isOpen) {
        setIsInitializingOneClickTrading(false);
      }
    }, [isOpen]);

    (currentCosmosWallet?.client as any)?.setActions?.({
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
              onConnect={onConnectWallet}
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
                  onConnect={onConnectWallet}
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
                  onConnect={onConnectWallet}
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
                  onConnect={onConnectWallet}
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
