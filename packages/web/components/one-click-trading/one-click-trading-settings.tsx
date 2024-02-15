import { Dec, PricePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import dayjs from "dayjs";
import Image from "next/image";
import React from "react";
import { useState } from "react";

import { Icon } from "~/components/assets";
import { Button, buttonCVA } from "~/components/buttons";
import IconButton from "~/components/buttons/icon-button";
import { NetworkFeeLimitScreen } from "~/components/one-click-trading/screens/network-fee-limit-screen";
import { SpendLimitScreen } from "~/components/one-click-trading/screens/spend-limit-screen";
import {
  Screen,
  ScreenGoBackButton,
  ScreenManager,
} from "~/components/screen-manager";
import { Switch } from "~/components/ui/switch";
import { useTranslation } from "~/hooks";
import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";

type Classes = "root";

enum SettingsScreens {
  Main = "main",
  SpendLimit = "spendLimit",
  NetworkFeeLimit = "networkFeeLimit",
  SessionPeriod = "sessionPeriod",
}

interface OneClickTradingSettingsProps {
  classes?: Partial<Record<Classes, string>>;
  onClose?: () => void;
  transaction1CTParams: any; // TODO: Define type for 1CT
  setTransaction1CTParams: (params: any) => void; // TODO: Define type for 1CT
}

const OneClickTradingSettings = ({
  classes,
  onClose,
  transaction1CTParams,
  setTransaction1CTParams,
}: OneClickTradingSettingsProps) => {
  const { t } = useTranslation();

  const [parameters, setParameters] = useState({
    isOneClickEnabled: false,
    spendLimit: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(5000)),
    networkFeeLimit: new Dec(0.000708),
    sessionPeriod: dayjs.duration(1, "hour"),
  });

  const isDisabled = !parameters.isOneClickEnabled;

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
                      checked={parameters.isOneClickEnabled}
                      onCheckedChange={(nextValue) => {
                        setParameters((params) => ({
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
                        {parameters.spendLimit.toString()}{" "}
                        {parameters.spendLimit.fiatCurrency.currency.toUpperCase()}
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
                      <p>{parameters.networkFeeLimit.toString()} OSMO</p>
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
                        setCurrentScreen(SettingsScreens.SpendLimit)
                      }
                      disabled={isDisabled}
                    >
                      <p>
                        {parameters.sessionPeriod.asHours()} hour
                        {parameters.sessionPeriod.asHours() > 1 ? "s" : ""}
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

              {parameters.isOneClickEnabled && (
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
              {screenGoBackButton}
              <h1 className="w-full text-center text-h6 font-h6 tracking-wider">
                {t("oneClickTrading.settings.sessionPeriodTitle")}
              </h1>
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
