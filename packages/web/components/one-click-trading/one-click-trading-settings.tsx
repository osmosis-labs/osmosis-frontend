import { Dec, PricePretty } from "@keplr-wallet/unit";
import classNames from "classnames";
import dayjs from "dayjs";
import Image from "next/image";
import React from "react";
import { useState } from "react";

import { Icon } from "~/components/assets";
import { buttonCVA } from "~/components/buttons";
import { Switch } from "~/components/control";
import { useTranslation } from "~/hooks";
import { DEFAULT_VS_CURRENCY } from "~/server/queries/complex/assets/config";

interface OneClickTradingSettingsProps {
  className?: string;
}

const OneClickTradingSettings = ({
  className,
}: OneClickTradingSettingsProps) => {
  const { t } = useTranslation();

  const [parameters, setParameters] = useState({
    isOneClickEnabled: false,
    spendLimit: new PricePretty(DEFAULT_VS_CURRENCY, new Dec(5000)),
    networkFeeLimit: new Dec(0.000708),
    sessionPeriod: dayjs.duration(1, "hour"),
  });

  //   const {} =

  const isDisabled = !parameters.isOneClickEnabled;

  return (
    <div className={classNames("flex flex-col gap-12", className)}>
      <div className="px-8">
        <div className="flex gap-4 rounded-xl bg-osmoverse-825 px-4 py-3">
          <Image
            src="/images/1ct-mobile-icon.svg"
            alt="1ct icon"
            width={32}
            height={32}
            className="self-start"
          />
          <p className="text-body2 font-body2 text-osmoverse-300">
            1-Click Trading lets you securely trade on this device without the
            hassle of signing every transaction in your wallet.{" "}
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
          title="Enable 1-Click Trading"
          content={
            <Switch
              isOn={parameters.isOneClickEnabled}
              onToggle={() => {
                setParameters((params) => ({
                  ...params,
                  isOneClickEnabled: !params.isOneClickEnabled,
                }));
              }}
            />
          }
        />
        <SettingRow
          title="Spend Limit"
          content={
            <div className="flex items-center gap-2">
              <p className="text-wosmongton-200">
                {parameters.spendLimit.toString()}{" "}
                {parameters.spendLimit.fiatCurrency.currency.toUpperCase()}
              </p>
              <Icon
                id="chevron-right"
                width={18}
                height={18}
                className="text-osmoverse-500"
              />
            </div>
          }
          isDisabled={isDisabled}
        />
        <SettingRow
          title="Network fee limit"
          content={
            <div className="flex items-center gap-2">
              <p className="text-wosmongton-200">
                {parameters.networkFeeLimit.toString()} OSMO
              </p>
              <Icon
                id="chevron-right"
                width={18}
                height={18}
                className="text-osmoverse-500"
              />
            </div>
          }
          isDisabled={isDisabled}
        />
        <SettingRow
          title="Session period"
          content={
            <div className="flex items-center gap-2">
              <p className="text-wosmongton-200">
                {parameters.sessionPeriod.asHours()} hours
              </p>
              <Icon
                id="chevron-right"
                width={18}
                height={18}
                className="text-osmoverse-500"
              />
            </div>
          }
          isDisabled={isDisabled}
        />
      </div>
    </div>
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
        isDisabled && "pointer-events-none cursor-not-allowed opacity-50"
      )}
    >
      <p className="text-subtitle1 font-subtitle1">{title}</p>
      <div>{content}</div>
    </div>
  );
};

export default OneClickTradingSettings;
