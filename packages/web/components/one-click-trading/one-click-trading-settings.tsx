import { CoinPretty } from "@keplr-wallet/unit";
import { OneClickTradingPeriods } from "@osmosis-labs/types";
import classNames from "classnames";
import Image from "next/image";
import React, { Dispatch, SetStateAction } from "react";

import { Icon } from "~/components/assets";
import { Button, buttonCVA } from "~/components/buttons";
import IconButton from "~/components/buttons/icon-button";
import { NetworkFeeLimitScreen } from "~/components/one-click-trading/screens/network-fee-limit-screen";
import { SessionPeriodScreen } from "~/components/one-click-trading/screens/session-period-screen";
import { SpendLimitScreen } from "~/components/one-click-trading/screens/spend-limit-screen";
import {
  Screen,
  ScreenGoBackButton,
  ScreenManager,
} from "~/components/screen-manager";
import { Switch } from "~/components/ui/switch";
import { useTranslation } from "~/hooks";

type Classes = "root";

enum SettingsScreens {
  Main = "main",
  SpendLimit = "spendLimit",
  NetworkFeeLimit = "networkFeeLimit",
  SessionPeriod = "sessionPeriod",
}

interface OneClickTradingTransactionParams {
  isOneClickEnabled: boolean;
  spendLimit: CoinPretty;
  networkFeeLimit: CoinPretty;
  sessionPeriod: OneClickTradingPeriods;
}

interface OneClickTradingSettingsProps {
  classes?: Partial<Record<Classes, string>>;
  onClose?: () => void;
  transaction1CTParams: OneClickTradingTransactionParams;
  setTransaction1CTParams: Dispatch<
    SetStateAction<OneClickTradingTransactionParams>
  >;
}

const OneClickTradingSettings = ({
  classes,
  onClose,
  transaction1CTParams,
  setTransaction1CTParams,
}: OneClickTradingSettingsProps) => {
  const { t } = useTranslation();

  const isDisabled = !transaction1CTParams.isOneClickEnabled;

  const screenGoBackButton = (
    <ScreenGoBackButton className="absolute top-7 left-7" />
  );

  return (
    <ScreenManager defaultScreen={SettingsScreens.Main}>
      {({ setCurrentScreen }) => (
        <>
          <Screen screenName="main">
            <div className={classNames("flex flex-col gap-6", classes?.root)}>
              <IconButton
                onClick={onClose}
                className="absolute top-7 left-7 w-fit text-osmoverse-400 hover:text-osmoverse-100"
                icon={<Icon id="chevron-left" width={16} height={16} />}
                aria-label="Go Back"
                mode="unstyled"
              />

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
                      className={buttonCVA({
                        mode: "text",
                        className: "!inline w-auto px-0 text-body2 font-body2",
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
                    <Switch
                      checked={transaction1CTParams.isOneClickEnabled}
                      onCheckedChange={(nextValue) => {
                        setTransaction1CTParams((params) => ({
                          ...params,
                          isOneClickEnabled: nextValue,
                        }));
                      }}
                    />
                  }
                />
                <SettingRow
                  title={t("oneClickTrading.settings.spendLimitTitle")}
                  content={
                    <Button
                      mode="text"
                      className="flex items-center gap-2 text-wosmongton-200"
                      onClick={() =>
                        setCurrentScreen(SettingsScreens.SpendLimit)
                      }
                      disabled={isDisabled}
                    >
                      <p>
                        {/* {transaction1CTParams.spendLimit.toString()}{" "}
                        {transaction1CTParams.spendLimit.fiatCurrency.currency.toUpperCase()} */}
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
                      mode="text"
                      className="flex items-center gap-2 text-wosmongton-200"
                      onClick={() =>
                        setCurrentScreen(SettingsScreens.NetworkFeeLimit)
                      }
                      disabled={isDisabled}
                    >
                      <p>
                        {transaction1CTParams.networkFeeLimit.toString()} OSMO
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
                      mode="text"
                      className="flex items-center gap-2 text-wosmongton-200"
                      onClick={() =>
                        setCurrentScreen(SettingsScreens.SessionPeriod)
                      }
                      disabled={isDisabled}
                    >
                      <p>{transaction1CTParams.sessionPeriod}</p>
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

              {transaction1CTParams.isOneClickEnabled && (
                <div className="px-8">
                  <Button>{t("oneClickTrading.settings.startButton")}</Button>
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
                goBackButton={screenGoBackButton}
                transaction1CTParams={transaction1CTParams}
                setTransaction1CTParams={setTransaction1CTParams}
              />
            </div>
          </Screen>

          <Screen screenName={SettingsScreens.NetworkFeeLimit}>
            <div className={classNames("flex flex-col gap-12", classes?.root)}>
              <NetworkFeeLimitScreen
                goBackButton={screenGoBackButton}
                transaction1CTParams={transaction1CTParams}
                setTransaction1CTParams={setTransaction1CTParams}
              />
            </div>
          </Screen>

          <Screen screenName={SettingsScreens.SessionPeriod}>
            <div className={classNames("flex flex-col gap-12", classes?.root)}>
              <SessionPeriodScreen
                goBackButton={screenGoBackButton}
                transaction1CTParams={transaction1CTParams}
                setTransaction1CTParams={setTransaction1CTParams}
              />
            </div>
          </Screen>
        </>
      )}
    </ScreenManager>
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

export default OneClickTradingSettings;
