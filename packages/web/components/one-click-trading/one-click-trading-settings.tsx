import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
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
import IconButton from "~/components/buttons/icon-button";
import { Spinner } from "~/components/loaders";
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
import { Button, buttonVariants } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { useDisclosure, useTranslation } from "~/hooks";
import { ModalBase } from "~/modals";
import { formatPretty } from "~/utils/formatter";
import { runIfFn } from "~/utils/function";

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
  isLoading?: boolean;
  isSendingTx?: boolean;
  hideBackButton?: boolean;
  hasExistingSession?: boolean;
}

const OneClickTradingSettings = ({
  classes,
  onGoBack,
  transaction1CTParams,
  setTransaction1CTParams: setTransaction1CTParamsProp,
  onStartTrading,
  isSendingTx,
  isLoading,
  hideBackButton,
  hasExistingSession,
}: OneClickTradingSettingsProps) => {
  const { t } = useTranslation();
  const [hasChanged, setHasChanged] = useState<
    Array<"spendLimit" | "networkFeeLimit" | "resetPeriod" | "sessionPeriod">
  >([]);
  const [initialTransaction1CTParams, setInitialTransaction1CTParams] =
    useState<OneClickTradingTransactionParams>();

  useEffect(() => {
    if (!transaction1CTParams) return;
    setInitialTransaction1CTParams(transaction1CTParams);
  }, [transaction1CTParams]);

  const {
    isOpen: isDiscardDialogOpen,
    onOpen: onOpenDiscardDialog,
    onClose: onCloseDiscardDialog,
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
      setHasChanged((prev) => {
        if (
          prevParams?.spendLimit.toString() !==
          nextParams?.spendLimit.toString()
        ) {
          return [...prev, "spendLimit"];
        }

        if (
          prevParams?.networkFeeLimit.toString() !==
          nextParams?.networkFeeLimit.toString()
        ) {
          return [...prev, "networkFeeLimit"];
        }

        if (prevParams?.resetPeriod !== nextParams?.resetPeriod) {
          return [...prev, "resetPeriod"];
        }

        if (prevParams?.sessionPeriod.end !== nextParams?.sessionPeriod.end) {
          return [...prev, "sessionPeriod"];
        }

        return [...prev];
      });

      return nextParams;
    });
  };

  const isDisabled =
    !transaction1CTParams?.isOneClickEnabled || isSendingTx || isLoading;

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
      <ScreenManager defaultScreen={SettingsScreens.Main}>
        {({ setCurrentScreen }) => (
          <>
            <Screen screenName="main">
              <div className={classNames("flex flex-col gap-6", classes?.root)}>
                {!hideBackButton && (
                  <IconButton
                    onClick={() => {
                      if (
                        JSON.stringify(initialTransaction1CTParams) !==
                        JSON.stringify(transaction1CTParams)
                      ) {
                        return onOpenDiscardDialog();
                      }
                      onGoBack();
                    }}
                    className="absolute top-7 left-7 w-fit text-osmoverse-400 hover:text-osmoverse-100"
                    icon={<Icon id="chevron-left" width={16} height={16} />}
                    aria-label="Go Back"
                    mode="unstyled"
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
                            "!inline w-auto px-0 text-body2 font-body2",
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
                    content={
                      <div className="flex items-center gap-3">
                        {hasExistingSession && isSendingTx && (
                          <>
                            <p className="text-wosmongton-200">
                              {t("oneClickTrading.settings.endingSession")}
                            </p>
                            <Spinner className="text-wosmongton-200" />
                          </>
                        )}
                        <Switch
                          disabled={hasExistingSession && isSendingTx}
                          checked={
                            transaction1CTParams?.isOneClickEnabled ?? false
                          }
                          onCheckedChange={(nextValue) => {
                            setTransaction1CTParams((params) => {
                              if (!params)
                                throw new Error("1CT Params is undefined");
                              return {
                                ...params,
                                isOneClickEnabled: nextValue,
                              };
                            });
                          }}
                        />
                      </div>
                    }
                  />
                  <SettingRow
                    title={t("oneClickTrading.settings.spendLimitTitle")}
                    content={
                      <Button
                        variant="link"
                        size="sm"
                        className={classNames(
                          "flex items-center gap-2 px-0 text-wosmongton-200",
                          hasChanged.includes("spendLimit") &&
                            "text-bullish-400"
                        )}
                        onClick={() =>
                          setCurrentScreen(SettingsScreens.SpendLimit)
                        }
                        disabled={isDisabled}
                      >
                        <p>
                          {transaction1CTParams?.spendLimit.toString()}{" "}
                          {transaction1CTParams?.spendLimit.fiatCurrency.currency.toUpperCase()}
                        </p>
                        <Icon
                          id="chevron-right"
                          width={18}
                          height={18}
                          className="text-osmoverse-500"
                        />
                      </Button>
                    }
                    isDisabled={isDisabled}
                  />
                  <SettingRow
                    title={t("oneClickTrading.settings.networkFeeLimitTitle")}
                    content={
                      <Button
                        variant="link"
                        size="sm"
                        className={classNames(
                          "flex items-center gap-2 px-0 text-wosmongton-200",
                          hasChanged.includes("networkFeeLimit") &&
                            "text-bullish-400"
                        )}
                        onClick={() =>
                          setCurrentScreen(SettingsScreens.NetworkFeeLimit)
                        }
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
                          className="text-osmoverse-500"
                        />
                      </Button>
                    }
                    isDisabled={isDisabled}
                  />
                  <SettingRow
                    title={t("oneClickTrading.settings.sessionPeriodTitle")}
                    content={
                      <Button
                        variant="link"
                        size="sm"
                        className={classNames(
                          "flex items-center gap-2 px-0 text-wosmongton-200",
                          hasChanged.includes("sessionPeriod") &&
                            "text-bullish-400"
                        )}
                        onClick={() =>
                          setCurrentScreen(SettingsScreens.SessionPeriod)
                        }
                        disabled={isDisabled}
                      >
                        <p className="capitalize">
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
                          className="text-osmoverse-500"
                        />
                      </Button>
                    }
                    isDisabled={isDisabled}
                  />
                  <SettingRow
                    title={t("oneClickTrading.settings.resetPeriodTitle")}
                    content={
                      <Button
                        variant="link"
                        size="sm"
                        className={classNames(
                          "flex items-center gap-2 px-0 text-wosmongton-200",
                          hasChanged.includes("resetPeriod") &&
                            "text-bullish-400"
                        )}
                        onClick={() =>
                          setCurrentScreen(SettingsScreens.ResetPeriod)
                        }
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
                          className="text-osmoverse-500"
                        />
                      </Button>
                    }
                    isDisabled={isDisabled}
                  />
                </div>

                {hasExistingSession && !isSendingTx && (
                  <div className="px-8">
                    <Button
                      className="w-full"
                      onClick={onStartTrading}
                      isLoading={isSendingTx}
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
  isDisabled?: boolean;
}

const SettingRow = ({ title, content, isDisabled }: SettingRowProps) => {
  return (
    <div
      className={classNames(
        "flex items-center justify-between border-b border-osmoverse-700 py-3.5 px-8 last:border-none",
        isDisabled && "pointer-events-none opacity-50"
      )}
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
