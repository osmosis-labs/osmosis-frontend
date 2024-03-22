import { PricePretty } from "@keplr-wallet/unit";
import { makeRemoveAuthenticatorMsg } from "@osmosis-labs/stores";
import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import { noop, runIfFn } from "@osmosis-labs/utils";
import classNames from "classnames";
import Image from "next/image";
import React, {
  Dispatch,
  FunctionComponent,
  SetStateAction,
  useEffect,
  useState,
} from "react";

import { Icon } from "~/components/assets";
import { Spinner } from "~/components/loaders";
import SkeletonLoader from "~/components/loaders/skeleton-loader";
import { NetworkFeeLimitScreen } from "~/components/one-click-trading/screens/network-fee-limit-screen";
import {
  getResetPeriodTranslationKey,
  ResetPeriodScreen,
} from "~/components/one-click-trading/screens/reset-period-screen";
import {
  getSessionPeriodTranslationKey,
  SessionPeriodScreen,
} from "~/components/one-click-trading/screens/session-period-screen";
import { SpendLimitScreen } from "~/components/one-click-trading/screens/spend-limit-screen";
import { Screen, ScreenManager } from "~/components/screen-manager";
import { Button, buttonVariants, IconButton } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import {
  useDisclosure,
  useOneClickTradingSession,
  useTranslation,
} from "~/hooks";
import { useEstimateTxFees } from "~/hooks/use-estimate-tx-fees";
import { ModalBase, ModalCloseButton } from "~/modals";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";
import { trimPlaceholderZeros } from "~/utils/number";
import { api } from "~/utils/trpc";

type Classes = "root";

enum SettingsScreens {
  Main = "main",
  SpendLimit = "spendLimit",
  NetworkFeeLimit = "networkFeeLimit",
  SessionPeriod = "sessionPeriod",
  ResetPeriod = "resetPeriod",
}

interface OneClickTradingSettingsProps {
  classes?: Partial<Record<Classes, string>>;
  onGoBack: () => void;
  transaction1CTParams: OneClickTradingTransactionParams | undefined;
  setTransaction1CTParams: Dispatch<
    SetStateAction<OneClickTradingTransactionParams | undefined>
  >;
  onStartTrading: () => void;
  onEndSession?: () => void;
  onClose: () => void;
  isLoading?: boolean;
  isSendingTx?: boolean;
  isEndingSession?: boolean;
  hideBackButton?: boolean;
  hasExistingSession?: boolean;
}

/**
 * Compares the changes between two sets of OneClickTradingTransactionParams.
 * Useful for determining which parameters have changed and need to be updated.
 */
export function compare1CTTransactionParams({
  prevParams,
  nextParams,
}: {
  prevParams: OneClickTradingTransactionParams;
  nextParams: OneClickTradingTransactionParams;
}): Array<"spendLimit" | "networkFeeLimit" | "resetPeriod" | "sessionPeriod"> {
  let changes = new Set<
    "spendLimit" | "networkFeeLimit" | "resetPeriod" | "sessionPeriod"
  >();

  if (prevParams?.spendLimit.toString() !== nextParams?.spendLimit.toString()) {
    changes.add("spendLimit");
  }

  if (
    prevParams?.networkFeeLimit.toString() !==
    nextParams?.networkFeeLimit.toString()
  ) {
    changes.add("networkFeeLimit");
  }

  if (prevParams?.resetPeriod !== nextParams?.resetPeriod) {
    changes.add("resetPeriod");
  }

  if (prevParams?.sessionPeriod.end !== nextParams?.sessionPeriod.end) {
    changes.add("sessionPeriod");
  }

  return Array.from(changes);
}

function formatSpendLimit(spendLimit: PricePretty | undefined) {
  return `${spendLimit?.symbol}${trimPlaceholderZeros(
    spendLimit?.toDec().toString(2) ?? ""
  )} ${spendLimit?.fiatCurrency.currency.toUpperCase()}`;
}

const OneClickTradingSettings = ({
  classes,
  onGoBack,
  transaction1CTParams,
  setTransaction1CTParams: setTransaction1CTParamsProp,
  onStartTrading,
  isSendingTx,
  isEndingSession,
  isLoading,
  hideBackButton,
  hasExistingSession,
  onEndSession,
  onClose,
}: OneClickTradingSettingsProps) => {
  const { t } = useTranslation();
  const [changes, setChanges] = useState<
    Array<"spendLimit" | "networkFeeLimit" | "resetPeriod" | "sessionPeriod">
  >([]);
  const [initialTransaction1CTParams, setInitialTransaction1CTParams] =
    useState<OneClickTradingTransactionParams>();

  const { chainStore } = useStore();

  const { isOneClickTradingEnabled, oneClickTradingInfo } =
    useOneClickTradingSession();
  const { data: amountSpentData } =
    api.local.oneClickTrading.getAmountSpent.useQuery(
      {
        authenticatorId: oneClickTradingInfo?.authenticatorId!,
        userOsmoAddress: oneClickTradingInfo?.userOsmoAddress!,
      },
      {
        enabled: !!oneClickTradingInfo && isOneClickTradingEnabled,
      }
    );

  const { data: estimateRemoveTxData, isLoading: isLoadingEstimateRemoveTx } =
    useEstimateTxFees({
      messages: oneClickTradingInfo
        ? [
            makeRemoveAuthenticatorMsg({
              id: BigInt(oneClickTradingInfo.authenticatorId),
              sender: oneClickTradingInfo.userOsmoAddress,
            }),
          ]
        : [],
      chainId: chainStore.osmosis.chainId,
      enabled: !!oneClickTradingInfo && isOneClickTradingEnabled,
    });

  useEffect(() => {
    if (!transaction1CTParams || initialTransaction1CTParams) return;
    setInitialTransaction1CTParams(transaction1CTParams);
  }, [initialTransaction1CTParams, transaction1CTParams]);

  const {
    isOpen: isDiscardDialogOpen,
    onOpen: onOpenDiscardDialog,
    onClose: onCloseDiscardDialog,
  } = useDisclosure();
  const {
    isOpen: isCloseConfirmDialogOpen,
    onOpen: openCloseConfirmDialog,
    onClose: closeCloseConfirmDialog,
  } = useDisclosure();

  const setTransaction1CTParams = (
    newParamsOrFn:
      | OneClickTradingTransactionParams
      | undefined
      | ((
          prev: OneClickTradingTransactionParams | undefined
        ) => OneClickTradingTransactionParams | undefined)
  ) => {
    setTransaction1CTParamsProp((prevParams) => {
      const nextParams = runIfFn(newParamsOrFn, prevParams);
      setChanges(
        compare1CTTransactionParams({
          prevParams: initialTransaction1CTParams!,
          nextParams: nextParams!,
        })
      );

      return nextParams;
    });
  };

  const isDisabled =
    !transaction1CTParams?.isOneClickEnabled || isSendingTx || isLoading;

  const remainingSpendLimit =
    initialTransaction1CTParams?.spendLimit && amountSpentData?.amountSpent
      ? `${formatSpendLimit(
          initialTransaction1CTParams.spendLimit.sub(
            amountSpentData.amountSpent
          )
        )} / ${formatSpendLimit(initialTransaction1CTParams.spendLimit)}`
      : undefined;

  return (
    <>
      <DiscardChangesConfirmationModal
        isOpen={isDiscardDialogOpen}
        onCancel={onCloseDiscardDialog}
        onDiscard={() => {
          setTransaction1CTParams(initialTransaction1CTParams);
          onGoBack();
        }}
      />
      <DiscardChangesConfirmationModal
        isOpen={isCloseConfirmDialogOpen}
        onCancel={closeCloseConfirmDialog}
        onDiscard={onClose!}
      />
      <ScreenManager defaultScreen={SettingsScreens.Main}>
        {({ setCurrentScreen }) => (
          <>
            <Screen screenName="main">
              {onClose && (
                <ModalCloseButton
                  onClick={() => {
                    if (changes.length > 0) {
                      return openCloseConfirmDialog();
                    }

                    onClose();
                  }}
                />
              )}

              <div className={classNames("flex flex-col gap-6", classes?.root)}>
                {!hideBackButton && (
                  <IconButton
                    onClick={() => {
                      if (changes.length > 0) {
                        return onOpenDiscardDialog();
                      }
                      onGoBack();
                    }}
                    className="absolute top-7 left-7 w-fit text-osmoverse-400 hover:text-osmoverse-100"
                    icon={<Icon id="chevron-left" width={16} height={16} />}
                    aria-label="Go Back"
                  />
                )}

                <h1 className="w-full text-center text-h6 font-h6 tracking-wider">
                  {t("oneClickTrading.settings.header")}
                </h1>

                <div className="px-8">
                  <div className="flex gap-4 rounded-xl bg-osmoverse-825 px-4 py-3">
                    <Image
                      src="/images/1ct-small-icon.svg"
                      alt="1ct icon"
                      width={32}
                      height={32}
                      className="self-start"
                    />
                    <p className="text-body2 font-body2 text-osmoverse-300">
                      {t("oneClickTrading.settings.description")}{" "}
                      <a
                        className={buttonVariants({
                          variant: "link",
                          className:
                            "!inline w-auto !px-0 !text-body2 !font-body2 text-wosmongton-300",
                        })}
                        // TODO: Add link
                      >
                        {t("oneClickTrading.introduction.learnMore")} ↗️
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-0">
                  <SettingRow
                    title={t("oneClickTrading.settings.enableTitle")}
                    onClick={() => {
                      if (hasExistingSession) onEndSession?.();
                      setTransaction1CTParams((params) => {
                        if (!params) throw new Error("1CT Params is undefined");
                        return {
                          ...params,
                          isOneClickEnabled: !params.isOneClickEnabled,
                        };
                      });
                    }}
                    content={
                      <div className="flex items-center gap-3">
                        {hasExistingSession && isEndingSession && (
                          <p className="text-wosmongton-200">
                            {t("oneClickTrading.settings.endingSession")}
                          </p>
                        )}
                        {(isLoading || isEndingSession) && (
                          <Spinner className="text-wosmongton-200" />
                        )}{" "}
                        <Switch
                          disabled={isSendingTx || isEndingSession || isLoading}
                          checked={
                            transaction1CTParams?.isOneClickEnabled ?? false
                          }
                        />
                      </div>
                    }
                    isDisabled={isSendingTx || isEndingSession}
                  />
                  <SettingRow
                    title={t("oneClickTrading.settings.spendLimitTitle")}
                    onClick={() => setCurrentScreen(SettingsScreens.SpendLimit)}
                    content={
                      <Button
                        variant="link"
                        size="sm"
                        className={classNames(
                          "flex items-center gap-2 px-0 !text-base text-wosmongton-200 transition-none hover:no-underline group-hover:text-white-full",
                          changes.includes("spendLimit") && "text-bullish-400"
                        )}
                        disabled={isDisabled}
                      >
                        <p>
                          {remainingSpendLimit &&
                          isOneClickTradingEnabled &&
                          !changes.includes("spendLimit")
                            ? remainingSpendLimit
                            : formatSpendLimit(
                                transaction1CTParams?.spendLimit
                              )}
                        </p>
                        <Icon
                          id="chevron-right"
                          width={18}
                          height={18}
                          className="text-osmoverse-500 group-hover:text-white-full"
                        />
                      </Button>
                    }
                    isDisabled={isDisabled}
                  />
                  <SettingRow
                    title={t("oneClickTrading.settings.networkFeeLimitTitle")}
                    onClick={() =>
                      setCurrentScreen(SettingsScreens.NetworkFeeLimit)
                    }
                    content={
                      <Button
                        variant="link"
                        size="sm"
                        className={classNames(
                          "flex items-center gap-2 px-0 !text-base text-wosmongton-200 transition-none hover:no-underline group-hover:text-white-full",
                          changes.includes("networkFeeLimit") &&
                            "text-bullish-400"
                        )}
                        disabled={isDisabled}
                      >
                        <p>
                          {transaction1CTParams
                            ? formatPretty(
                                transaction1CTParams?.networkFeeLimit
                              )
                            : ""}
                        </p>
                        <Icon
                          id="chevron-right"
                          width={18}
                          height={18}
                          className="text-osmoverse-500 group-hover:text-white-full"
                        />
                      </Button>
                    }
                    isDisabled={isDisabled}
                  />
                  <SettingRow
                    title={t("oneClickTrading.settings.sessionPeriodTitle")}
                    onClick={() =>
                      setCurrentScreen(SettingsScreens.SessionPeriod)
                    }
                    content={
                      <Button
                        variant="link"
                        size="sm"
                        className={classNames(
                          "flex items-center gap-2 px-0 !text-base text-wosmongton-200 transition-none hover:no-underline group-hover:text-white-full",
                          changes.includes("sessionPeriod") &&
                            "text-bullish-400"
                        )}
                        disabled={isDisabled}
                      >
                        <p>
                          {transaction1CTParams
                            ? t(
                                getSessionPeriodTranslationKey(
                                  transaction1CTParams.sessionPeriod.end
                                )
                              )
                            : ""}
                        </p>
                        <Icon
                          id="chevron-right"
                          width={18}
                          height={18}
                          className="text-osmoverse-500 group-hover:text-white-full"
                        />
                      </Button>
                    }
                    isDisabled={isDisabled}
                  />
                  <SettingRow
                    title={t("oneClickTrading.settings.resetPeriodTitle")}
                    onClick={() =>
                      setCurrentScreen(SettingsScreens.ResetPeriod)
                    }
                    content={
                      <Button
                        variant="link"
                        size="sm"
                        className={classNames(
                          "flex items-center gap-2 px-0 !text-base text-wosmongton-200 transition-none hover:no-underline group-hover:text-white-full",
                          changes.includes("resetPeriod") && "text-bullish-400"
                        )}
                        disabled={isDisabled}
                      >
                        <p>
                          {transaction1CTParams
                            ? t(
                                getResetPeriodTranslationKey(
                                  transaction1CTParams.resetPeriod
                                )
                              )
                            : ""}
                        </p>
                        <Icon
                          id="chevron-right"
                          width={18}
                          height={18}
                          className="text-osmoverse-500 group-hover:text-white-full"
                        />
                      </Button>
                    }
                    isDisabled={isDisabled}
                  />
                </div>

                {hasExistingSession &&
                  changes.length > 0 &&
                  (!isSendingTx || !isEndingSession) && (
                    <div className="px-8">
                      <Button
                        className="w-full"
                        onClick={onStartTrading}
                        isLoading={isSendingTx || isEndingSession}
                        loadingText={t(
                          "oneClickTrading.settings.editSessionButton"
                        )}
                      >
                        {t("oneClickTrading.settings.editSessionButton")}
                      </Button>
                    </div>
                  )}

                {!hasExistingSession &&
                  transaction1CTParams?.isOneClickEnabled && (
                    <div className="px-8">
                      <Button
                        className="w-full"
                        onClick={onStartTrading}
                        isLoading={isSendingTx}
                        loadingText={t("oneClickTrading.settings.startButton")}
                      >
                        {t("oneClickTrading.settings.startButton")}
                      </Button>
                    </div>
                  )}

                {isOneClickTradingEnabled &&
                  (isLoadingEstimateRemoveTx || !!estimateRemoveTxData) && (
                    <SkeletonLoader
                      className="self-center"
                      isLoaded={!isLoadingEstimateRemoveTx}
                    >
                      <p className="text-caption font-caption text-osmoverse-300">
                        {t("oneClickTrading.settings.feeToDisable")} ~
                        {estimateRemoveTxData?.gasAmount.toString() ??
                          "0.000000 OSMO"}{" "}
                        (
                        {estimateRemoveTxData?.gasUsdValueToPay.toString() ??
                          "(< $0.00)"}
                        )
                      </p>
                    </SkeletonLoader>
                  )}
              </div>
            </Screen>

            <Screen screenName={SettingsScreens.SpendLimit}>
              <div
                className={classNames(
                  "flex h-full flex-col gap-12",
                  classes?.root
                )}
              >
                <SpendLimitScreen
                  transaction1CTParams={transaction1CTParams!}
                  setTransaction1CTParams={setTransaction1CTParams}
                  subtitle={
                    isOneClickTradingEnabled ? remainingSpendLimit : undefined
                  }
                />
              </div>
            </Screen>

            <Screen screenName={SettingsScreens.NetworkFeeLimit}>
              <div
                className={classNames("flex flex-col gap-12", classes?.root)}
              >
                <NetworkFeeLimitScreen
                  transaction1CTParams={transaction1CTParams!}
                  setTransaction1CTParams={setTransaction1CTParams}
                />
              </div>
            </Screen>

            <Screen screenName={SettingsScreens.SessionPeriod}>
              <div
                className={classNames(
                  "flex w-full flex-col gap-12",
                  classes?.root
                )}
              >
                <SessionPeriodScreen
                  transaction1CTParams={transaction1CTParams!}
                  setTransaction1CTParams={setTransaction1CTParams}
                />
              </div>
            </Screen>

            <Screen screenName={SettingsScreens.ResetPeriod}>
              <div
                className={classNames(
                  "flex w-full flex-col gap-12",
                  classes?.root
                )}
              >
                <ResetPeriodScreen
                  transaction1CTParams={transaction1CTParams!}
                  setTransaction1CTParams={setTransaction1CTParams}
                />
              </div>
            </Screen>
          </>
        )}
      </ScreenManager>
    </>
  );
};

interface SettingRowProps {
  title: string;
  content: React.ReactNode;
  onClick: () => void;
  isDisabled?: boolean;
}

const SettingRow = ({
  title,
  content,
  isDisabled,
  onClick,
}: SettingRowProps) => {
  return (
    <div
      className={classNames(
        "group flex cursor-pointer items-center justify-between border-b border-osmoverse-700 py-3.5 px-8 last:border-none",
        isDisabled && "pointer-events-none opacity-50"
      )}
      onClick={isDisabled ? noop : onClick}
    >
      <p className="text-subtitle1 font-subtitle1">{title}</p>
      <div>{content}</div>
    </div>
  );
};

const DiscardChangesConfirmationModal: FunctionComponent<{
  onDiscard: () => void;
  onCancel: () => void;
  isOpen: boolean;
}> = ({ onDiscard, onCancel, isOpen }) => {
  const { t } = useTranslation();

  return (
    <ModalBase
      isOpen={isOpen}
      onRequestClose={onCancel}
      hideCloseButton
      className="max-h-[90vh] w-full !max-w-[360px] overflow-hidden px-6 py-6 sm:max-h-[80vh]"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-center text-h6 font-h6">
            {t("oneClickTrading.settings.discardChanges.title")}
          </h1>
          <p className="text-center text-body2 font-body2 text-osmoverse-200">
            {t("oneClickTrading.settings.discardChanges.message")}
          </p>
        </div>

        <div className="flex gap-3">
          <Button onClick={onCancel} variant="link" className="!w-full">
            {t("oneClickTrading.settings.discardChanges.cancelButton")}
          </Button>
          <Button onClick={onDiscard} variant="destructive" className="!w-full">
            {t("oneClickTrading.settings.discardChanges.discardButton")}
          </Button>
        </div>
      </div>
    </ModalBase>
  );
};

export default OneClickTradingSettings;
