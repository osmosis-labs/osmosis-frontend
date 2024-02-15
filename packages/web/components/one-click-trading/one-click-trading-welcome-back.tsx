import Image from "next/image";

import { Icon } from "~/components/assets";
import IconButton from "~/components/buttons/icon-button";
import { Switch } from "~/components/ui/switch";
import { useTranslation } from "~/hooks";
import { noop } from "~/utils/function";

interface OneClickTradingWelcomeBackProps {
  transaction1CTParams: any; // TODO: Define type for 1CT
  setTransaction1CTParams: (params: any) => void; // TODO: Define type for 1CT
  onClickEditParams?: () => void;
}

const OneClickTradingWelcomeBack = ({
  transaction1CTParams,
  setTransaction1CTParams,
  onClickEditParams,
}: OneClickTradingWelcomeBackProps) => {
  const { t } = useTranslation();
  const is1CTEnabled = Boolean(transaction1CTParams);

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

      <div className="flex w-full">
        <button
          className="flex flex-1 justify-between rounded-l-2xl border-r border-r-osmoverse-800 bg-osmoverse-700 p-4"
          onClick={() => {
            if (is1CTEnabled) {
              return setTransaction1CTParams(null);
            }
            setTransaction1CTParams({});
          }}
        >
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
          <Switch
            checked={Boolean(transaction1CTParams)}
            onCheckedChange={noop}
            className="pointer-events-none"
          />
        </button>
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
