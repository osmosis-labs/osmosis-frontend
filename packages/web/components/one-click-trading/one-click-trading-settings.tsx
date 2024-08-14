import { Dec, PricePretty } from "@keplr-wallet/unit";
import { makeRemoveAuthenticatorMsg } from "@osmosis-labs/tx";
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
import { useAsync } from "react-use";

import { Icon } from "~/components/assets";
import { Spinner } from "~/components/loaders";
import { SkeletonLoader } from "~/components/loaders/skeleton-loader";
import {
  getSessionPeriodTranslationKey,
  SessionPeriodScreen,
} from "~/components/one-click-trading/screens/session-period-screen";
import { SpendLimitScreen } from "~/components/one-click-trading/screens/spend-limit-screen";
import { Screen, ScreenManager } from "~/components/screen-manager";
import { Button, buttonVariants, GoBackButton } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { EventName } from "~/config";
import {
  useAmplitudeAnalytics,
  useDisclosure,
  useOneClickTradingSession,
  useTranslation,
} from "~/hooks";
import { useEstimateTxFees } from "~/hooks/use-estimate-tx-fees";
import { ModalBase, ModalCloseButton } from "~/modals";
import { useStore } from "~/stores";
import { trimPlaceholderZeros } from "~/utils/number";
import { api } from "~/utils/trpc";

type Classes = "root";

enum SettingsScreens {
  Main = "main",
  SpendLimit = "spendLimit",
  SessionPeriod = "sessionPeriod",
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
}): Array<"spendLimit" | "resetPeriod" | "sessionPeriod"> {
  let changes = new Set<"spendLimit" | "resetPeriod" | "sessionPeriod">();

  if (prevParams?.spendLimit.toString() !== nextParams?.spendLimit.toString()) {
    changes.add("spendLimit");
  }

  if (prevParams?.sessionPeriod.end !== nextParams?.sessionPeriod.end) {
    changes.add("sessionPeriod");
  }

  return Array.from(changes);
}

function formatSpendLimit(spendLimit: PricePretty | undefined) {
  return `${spendLimit?.symbol}${trimPlaceholderZeros(
    spendLimit?.toDec().toString(2) ?? ""
  )}`;
}

export const OneClickTradingSettings = ({
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
    Array<"spendLimit" | "resetPeriod" | "sessionPeriod">
  >([]);
  const [initialTransaction1CTParams, setInitialTransaction1CTParams] =
    useState<OneClickTradingTransactionParams>();

  const { chainStore } = useStore();
  const { logEvent } = useAmplitudeAnalytics();

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

  const { value: removeAuthenticatorMsg } = useAsync(async () => {
    if (!oneClickTradingInfo) return;
    return await makeRemoveAuthenticatorMsg({
      id: BigInt(oneClickTradingInfo.authenticatorId),
      sender: oneClickTradingInfo.userOsmoAddress,
    });
  }, [oneClickTradingInfo]);

  const { data: estimateRemoveTxData, isLoading: isLoadingEstimateRemoveTx } =
    useEstimateTxFees({
      messages: removeAuthenticatorMsg ? [removeAuthenticatorMsg] : [],
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
      <ScreenManager defaultScreen={SettingsScreens.Main}>
        {({ setCurrentScreen }) => (
          <>
            <Screen screenName="main">
              <div className={classNames("flex flex-col gap-6", classes?.root)}>
                {!hideBackButton && (
                  <GoBackButton
                    className="absolute left-7 top-7"
                    onClick={() => {
                      if (changes.length > 0) {
                        return onOpenDiscardDialog();
                      }
                      onGoBack();
                    }}
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
                        href="https://support.osmosis.zone/tutorials/1clicktrading"
                        target="_blank"
                        rel="noopener noreferrer"
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

                        const nextValue = !params.isOneClickEnabled;
                        if (nextValue) {
                          logEvent([
                            EventName.OneClickTrading.enableOneClickTrading,
                          ]);
                        }

                        return {
                          ...params,
                          isOneClickEnabled: nextValue,
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
                              )}{" "}
                          {transaction1CTParams?.spendLimit.fiatCurrency.currency.toUpperCase()}
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
                </div>

                {hasExistingSession &&
                  changes.length > 0 &&
                  (!isSendingTx || !isEndingSession) && (
                    <div className="px-8">
                      <Button
                        className="w-full text-h6 font-h6"
                        onClick={onStartTrading}
                        isLoading={isSendingTx || isEndingSession}
                      >
                        {t("oneClickTrading.settings.editSessionButton")}
                      </Button>
                    </div>
                  )}

                {!hasExistingSession &&
                  transaction1CTParams?.isOneClickEnabled && (
                    <div className="px-8">
                      <Button
                        className="w-full text-h6 font-h6"
                        onClick={onStartTrading}
                        isLoading={isSendingTx}
                      >
                        {t("oneClickTrading.settings.startButton")}
                      </Button>
                    </div>
                  )}

                <div className="flex flex-col gap-2">
                  {isOneClickTradingEnabled &&
                    (isLoadingEstimateRemoveTx || !!estimateRemoveTxData) && (
                      <SkeletonLoader
                        className="h-5 self-center"
                        isLoaded={!isLoadingEstimateRemoveTx}
                      >
                        <p className="text-center text-caption font-caption text-osmoverse-300">
                          {t("oneClickTrading.settings.feeToDisable")} ~
                          {estimateRemoveTxData?.gasAmount.toString() ??
                            "0.000000 OSMO"}{" "}
                          (
                          {estimateRemoveTxData?.gasUsdValueToPay ? (
                            <>
                              {estimateRemoveTxData.gasUsdValueToPay
                                .toDec()
                                .lte(new Dec(0.001))
                                ? `< ${estimateRemoveTxData.gasUsdValueToPay.symbol}0.001`
                                : estimateRemoveTxData.gasUsdValueToPay.toString()}
                            </>
                          ) : (
                            "(< $0.00)"
                          )}
                          )
                        </p>
                      </SkeletonLoader>
                    )}

                  <p className="px-8 text-center text-caption text-osmoverse-300">
                    {t("oneClickTrading.introduction.ledgerComingSoon")}
                  </p>
                </div>
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
                    isOneClickTradingEnabled
                      ? `${remainingSpendLimit} ${t("remaining")}`
                      : undefined
                  }
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
        "group flex cursor-pointer items-center justify-between border-b border-osmoverse-700 px-8 py-3.5 last:border-none",
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
