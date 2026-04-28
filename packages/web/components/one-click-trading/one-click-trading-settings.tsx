import { InsufficientBalanceForFeeError } from "@osmosis-labs/stores";
import { makeRemoveAuthenticatorMsg } from "@osmosis-labs/tx";
import {
  DEFAULT_ENABLED_OPTIONAL_CATEGORIES,
  OneClickTradingTransactionParams,
  OPTIONAL_ONE_CLICK_CATEGORIES,
  OptionalOneClickCategory,
} from "@osmosis-labs/types";
import { Dec } from "@osmosis-labs/unit";
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
  OneClickTradingParamsChanges,
  useAmplitudeAnalytics,
  useDisclosure,
  useOneClickTradingSession,
  useTranslation,
} from "~/hooks";
import { formatSpendLimit } from "~/hooks/one-click-trading/use-one-click-trading-swap-review";
import { useEstimateTxFees } from "~/hooks/use-estimate-tx-fees";
import { ModalBase, ModalCloseButton } from "~/modals";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

type Classes = "root";

enum SettingsScreens {
  Main = "main",
  SpendLimit = "spendLimit",
  SessionPeriod = "sessionPeriod",
}

type BaseOneClickTradingSettingsProps = {
  classes?: Partial<Record<Classes, string>>;
  onGoBack: () => void;
  transaction1CTParams: OneClickTradingTransactionParams | undefined;
  setTransaction1CTParams: Dispatch<
    SetStateAction<OneClickTradingTransactionParams | undefined>
  >;
  onEndSession?: () => void;
  onClose: () => void;
  isLoading?: boolean;
  isSendingTx?: boolean;
  isEndingSession?: boolean;
  hideBackButton?: boolean;
  hasExistingSession?: boolean;
};

type StandaloneProps = BaseOneClickTradingSettingsProps & {
  /**
   * Whether component is in standalone mode.
   * When true or undefined, the component acts as a full settings page with start/edit functionality
   */
  standalone?: true;
  /** Required callback when user clicks start/edit trading button */
  onStartTrading: () => void;
  /** In standalone mode the changes are tracked internally. Initial changes are not accepted */
  externalChanges?: undefined;
  /** Not needed in standalone mode */
  setExternalChanges?: Dispatch<SetStateAction<OneClickTradingParamsChanges>>;
};

type NonStandaloneProps = BaseOneClickTradingSettingsProps & {
  /**
   * Whether component is in standalone mode.
   * When false, the component acts as a settings panel within another component
   */
  standalone: false;
  /** Start trading callback is not allowed in non-standalone mode */
  onStartTrading?: never;
  /** Initial changes to be applied to the settings */
  externalChanges: OneClickTradingParamsChanges;
  /** Callback to set initial changes */
  setExternalChanges: (value: OneClickTradingParamsChanges) => void;
};

type OneClickTradingSettingsProps = StandaloneProps | NonStandaloneProps;

/**
 * Compares the changes between two sets of OneClickTradingTransactionParams.
 * Useful for determining which parameters have changed and need to be updated.
 */
export function compare1CTTransactionParams({
  prevParams,
  nextParams,
}: {
  prevParams?: OneClickTradingTransactionParams;
  nextParams?: OneClickTradingTransactionParams;
}): OneClickTradingParamsChanges {
  let changes: OneClickTradingParamsChanges = [];

  if (prevParams?.spendLimit.toString() !== nextParams?.spendLimit.toString()) {
    changes.push("spendLimit");
  }

  if (prevParams?.sessionPeriod.end !== nextParams?.sessionPeriod.end) {
    changes.push("sessionPeriod");
  }

  if (prevParams?.isOneClickEnabled !== nextParams?.isOneClickEnabled) {
    changes.push("isEnabled");
  }

  if (prevParams?.networkFeeLimit !== nextParams?.networkFeeLimit) {
    changes.push("networkFeeLimit");
  }

  const prevCategories = prevParams?.enabledOptionalCategories;
  const nextCategories = nextParams?.enabledOptionalCategories;
  if (
    prevCategories &&
    nextCategories &&
    OPTIONAL_ONE_CLICK_CATEGORIES.some(
      (category) => prevCategories[category] !== nextCategories[category]
    )
  ) {
    changes.push("enabledOptionalCategories");
  }

  return changes;
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
  standalone = true,
  externalChanges = [],
  setExternalChanges,
}: OneClickTradingSettingsProps) => {
  const { t } = useTranslation();

  const [changes, setChanges] = useState<OneClickTradingParamsChanges>([]);

  const [initialChanges, setInitialChanges] =
    useState<OneClickTradingParamsChanges>([]);
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

  const {
    data: estimateRemoveTxData,
    isLoading: isLoadingEstimateRemoveTx,
    error: estimateRemoveTxError,
  } = useEstimateTxFees({
    messages: removeAuthenticatorMsg ? [removeAuthenticatorMsg] : [],
    chainId: chainStore.osmosis.chainId,
    enabled: !!oneClickTradingInfo && isOneClickTradingEnabled,
  });

  // Scoped to the remove path only: `useEstimateTxFees` above is gated on
  // `oneClickTradingInfo` being present (i.e. an existing session is being
  // ended/edited), so this signal is meaningful for the edit-session button
  // but not for the start-session button. Plumbing fee estimation into the
  // start path requires a deterministic equivalent of
  // `makeCreate1CTSessionMessage` (it currently generates a fresh privKey and
  // a clock-dependent session period on every call), which is out of scope
  // here.
  const hasInsufficientFeeTokensForRemove =
    estimateRemoveTxError instanceof InsufficientBalanceForFeeError;

  useEffect(() => {
    if (!transaction1CTParams || initialTransaction1CTParams) return;
    setInitialTransaction1CTParams(transaction1CTParams);
    setChanges(externalChanges);
    setInitialChanges(externalChanges);
  }, [externalChanges, initialTransaction1CTParams, transaction1CTParams]);

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

      if (!initialTransaction1CTParams || !nextParams) {
        console.error("Transaction params are undefined");
        return prevParams;
      }

      setChanges(
        Array.from(
          new Set([
            /**
             * Spreading the changes and then merging with the new changes
             * ensures that the changes from the previous modal open are not overwritten
             *
             * If I have already made a change, and returned to the review order modal,
             * then I start editing again I expect my previous changes to be in the state
             * and the previously changed parameters displayed the same way as current change
             */
            ...changes,
            ...compare1CTTransactionParams({
              prevParams: initialTransaction1CTParams!,
              nextParams: nextParams!,
            }),
          ])
        )
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

  const changesWithoutIsEnabled = changes.filter((c) => c !== "isEnabled");

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
            if (standalone) {
              if (changesWithoutIsEnabled.length > 0) {
                return openCloseConfirmDialog();
              }
            } else {
              setTransaction1CTParams(initialTransaction1CTParams);
              setExternalChanges?.(initialChanges);
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
                      if (standalone && changesWithoutIsEnabled.length > 0) {
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

                {standalone && hasInsufficientFeeTokensForRemove && (
                  <div className="px-8">
                    <div className="flex gap-3 rounded-2xl border border-osmoverse-700 p-4">
                      <Icon
                        id="alert-triangle"
                        width={20}
                        height={20}
                        className="mt-1 min-w-[20px] text-rust-600"
                      />
                      <div className="flex flex-col gap-1">
                        <span className="body2 text-base text-rust-500">
                          {t("errors.insufficientFeeTokens.title")}
                        </span>
                        <span className="subtitle2 text-osmoverse-400">
                          {t("errors.insufficientFeeTokens.body")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-0">
                  {standalone && (
                    <SettingRow
                      title={t("oneClickTrading.settings.enableTitle")}
                      onClick={() => {
                        // Block toggle-off during the
                        // "no fee token with sufficient balance to sign the
                        // remove-authenticator tx" state — otherwise the
                        // SettingRow click immediately fires onEndSession() and
                        // the chain rejects the tx after signing. The inline
                        // warning rendered above explains the disabled state.
                        if (hasInsufficientFeeTokensForRemove) return;
                        if (hasExistingSession) onEndSession?.();
                        setTransaction1CTParams((params) => {
                          if (!params)
                            throw new Error("1CT Params is undefined");

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
                            disabled={
                              isSendingTx ||
                              isEndingSession ||
                              isLoading ||
                              hasInsufficientFeeTokensForRemove
                            }
                            checked={
                              transaction1CTParams?.isOneClickEnabled ?? false
                            }
                          />
                        </div>
                      }
                      isDisabled={
                        isSendingTx ||
                        isEndingSession ||
                        hasInsufficientFeeTokensForRemove
                      }
                    />
                  )}
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

                <PermissionsSection
                  enabledOptionalCategories={
                    transaction1CTParams?.enabledOptionalCategories ??
                    DEFAULT_ENABLED_OPTIONAL_CATEGORIES
                  }
                  onChange={(category, enabled) =>
                    setTransaction1CTParams((prev) =>
                      prev
                        ? {
                            ...prev,
                            enabledOptionalCategories: {
                              ...prev.enabledOptionalCategories,
                              [category]: enabled,
                            },
                          }
                        : prev
                    )
                  }
                  isDisabled={isDisabled}
                />

                {standalone &&
                  hasExistingSession &&
                  changes.filter((c) => c !== "isEnabled").length > 0 &&
                  (!isSendingTx || !isEndingSession) && (
                    <div className="px-8">
                      <Button
                        className="w-full text-h6 font-h6"
                        onClick={onStartTrading}
                        isLoading={isSendingTx || isEndingSession}
                        disabled={hasInsufficientFeeTokensForRemove}
                      >
                        {hasInsufficientFeeTokensForRemove
                          ? t("errors.insufficientFeeTokens.buttonLabel")
                          : t("oneClickTrading.settings.editSessionButton")}
                      </Button>
                    </div>
                  )}

                {standalone &&
                  !hasExistingSession &&
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

                {standalone &&
                  isOneClickTradingEnabled &&
                  !hasInsufficientFeeTokensForRemove &&
                  (isLoadingEstimateRemoveTx || !!estimateRemoveTxData) && (
                    <div className="flex flex-col gap-2">
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

interface PermissionsSectionProps {
  enabledOptionalCategories: Record<OptionalOneClickCategory, boolean>;
  onChange: (category: OptionalOneClickCategory, enabled: boolean) => void;
  isDisabled?: boolean;
}

/** Literal translation keys per category, kept here so the localizations
 *  key-usage test (which grep's tsx source for the literal string) sees
 *  every key. Adding a new optional category requires extending this map. */
const CATEGORY_TRANSLATION_KEYS: Record<
  OptionalOneClickCategory,
  { label: string; caption: string }
> = {
  poolManagement: {
    label: "oneClickTrading.settings.permissions.poolManagement.label",
    caption: "oneClickTrading.settings.permissions.poolManagement.caption",
  },
  limitOrders: {
    label: "oneClickTrading.settings.permissions.limitOrders.label",
    caption: "oneClickTrading.settings.permissions.limitOrders.caption",
  },
};

/** Renders one toggle per optional category. Forced categories (swaps,
 *  rewards) are not exposed - they're always on. */
const PermissionsSection: FunctionComponent<PermissionsSectionProps> = ({
  enabledOptionalCategories,
  onChange,
  isDisabled,
}) => {
  const { t } = useTranslation();
  return (
    <div
      className={classNames(
        "flex flex-col gap-2 px-8 pt-2",
        isDisabled && "pointer-events-none opacity-50"
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-subtitle1 font-subtitle1">
          {t("oneClickTrading.settings.permissions.title")}
        </p>
      </div>
      <p className="text-caption font-caption text-osmoverse-300">
        {t("oneClickTrading.settings.permissions.caption")}
      </p>
      <div className="flex flex-col">
        {OPTIONAL_ONE_CLICK_CATEGORIES.map((category) => {
          const keys = CATEGORY_TRANSLATION_KEYS[category];
          return (
            <div
              key={category}
              className="flex items-start justify-between gap-4 border-b border-osmoverse-700 py-3.5 last:border-none"
            >
              <div className="flex flex-col">
                <p className="text-subtitle2 font-subtitle2">{t(keys.label)}</p>
                <p className="text-caption font-caption text-osmoverse-400">
                  {t(keys.caption)}
                </p>
              </div>
              <Switch
                checked={enabledOptionalCategories[category]}
                onCheckedChange={(checked) => onChange(category, checked)}
                disabled={isDisabled}
              />
            </div>
          );
        })}
      </div>
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
