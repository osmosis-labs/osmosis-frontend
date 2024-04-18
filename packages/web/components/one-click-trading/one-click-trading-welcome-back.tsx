import { OneClickTradingTransactionParams } from "@osmosis-labs/types";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";

import { Icon } from "~/components/assets";
import IconButton from "~/components/buttons/icon-button";
import { Spinner } from "~/components/loaders";
import { Switch } from "~/components/ui/switch";
import { useTranslation } from "~/hooks";

interface OneClickTradingWelcomeBackProps {
  transaction1CTParams: OneClickTradingTransactionParams | undefined;
  setTransaction1CTParams: Dispatch<
    SetStateAction<OneClickTradingTransactionParams | undefined>
  >;
  onClickEditParams?: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
}

const OneClickTradingWelcomeBack = ({
  transaction1CTParams,
  setTransaction1CTParams,
  onClickEditParams,
  isLoading,
  isDisabled,
}: OneClickTradingWelcomeBackProps) => {
  const { t } = useTranslation();

  const onEnableOneClickTrading = () => {
    setTransaction1CTParams((prev) => {
      if (!prev) throw new Error("transaction1CTParams is undefined");
      return { ...prev, isOneClickEnabled: !prev.isOneClickEnabled };
    });
  };

  const isInteractionDisabled = isLoading || isDisabled;

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-h5 font-h5">
        {t("oneClickTrading.welcomeBack.title")}
      </h1>

      <Image
        alt="1CT welcome back screen"
        src="/images/1ct-welcome-back.png"
        width={529}
        height={354}
      />

      <div className="relative flex w-full">
        {isInteractionDisabled && (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-osmoverse-900/40">
            {isLoading && <Spinner />}
          </div>
        )}

        <div
          className="flex flex-1 cursor-pointer justify-between rounded-l-2xl border-r border-r-osmoverse-800 bg-osmoverse-700 p-4"
          onClick={() => {
            if (isInteractionDisabled) return;
            onEnableOneClickTrading();
          }}
        >
          <button disabled={isInteractionDisabled} className="flex-1">
            <div className="flex items-center gap-3">
              <Image
                src="/images/1ct-small-icon.svg"
                alt="1ct icon"
                width={32}
                height={32}
                className="self-start"
              />
              <span className="text-button font-button text-osmoverse-100">
                {t("oneClickTrading.welcomeBack.toggleLabel")}
              </span>
            </div>
          </button>
          <Switch
            checked={transaction1CTParams?.isOneClickEnabled}
            onCheckedChange={onEnableOneClickTrading}
            className="pointer-events-none"
            disabled={isDisabled || isLoading}
          />
        </div>
        <IconButton
          aria-label={t("oneClickTrading.welcomeBack.editParamsAriaLabel")}
          icon={<Icon id="setting" />}
          className="!h-auto w-auto rounded-l-none rounded-r-2xl px-4"
          onClick={onClickEditParams}
        />
      </div>

      <p className="text-center text-caption font-caption text-osmoverse-300">
        {t("oneClickTrading.welcomeBack.description")}
      </p>
    </div>
  );
};

export default OneClickTradingWelcomeBack;
