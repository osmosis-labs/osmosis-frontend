import { useLocalStorage } from "react-use";

import { Icon } from "~/components/assets";
import { ArrowButton } from "~/components/buttons";
import IconButton from "~/components/buttons/icon-button";
import { Pill } from "~/components/indicators/pill";
import { IntroOneClickSvg } from "~/components/one-click-trading/intro-one-click-svg";
import { useFeatureFlags, useTranslation } from "~/hooks";
import { useStore } from "~/stores";

export const OneClickFloatingBannerDoNotShowKey =
  "do-not-show-one-click-trading-floating-notification";

export const OneClickFloatingBanner = () => {
  const { accountStore, chainStore } = useStore();
  const featureFlags = useFeatureFlags();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const isConnected = !!account?.address;

  if (!isConnected || !featureFlags.oneClickTrading) return null;

  return <OneClickFloatingBannerContent />;
};

const OneClickFloatingBannerContent = () => {
  const { t } = useTranslation();
  const [doNotShowAgain, setDoNotShowAgain] = useLocalStorage(
    OneClickFloatingBannerDoNotShowKey,
    false
  );

  if (doNotShowAgain) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="relative flex h-full justify-center">
        <div className="absolute bottom-8 right-8 z-50 w-fit transform animate-[slideInUpExtreme_0.3s_cubic-bezier(0.46,0.47,0.4,1.5)] rounded-5xl bg-osmoverse-800 pr-3">
          <div className="relative flex items-center pr-8">
            <IconButton
              aria-label="Close"
              mode="unstyled"
              size="unstyled"
              className="absolute top-0 right-0 w-fit"
              icon={
                <Icon
                  id="close"
                  className="text-osmoverse-400 hover:text-white-full"
                  width={32}
                  height={32}
                />
              }
              onClick={() => {
                setDoNotShowAgain(true);
              }}
            />
            <IntroOneClickSvg width={291.56} height={136} className="-ml-24" />
            <div className="flex flex-col gap-2">
              <Pill className="!px-2">
                {t("oneClickTrading.floatingBanner.newPill")}
              </Pill>
              <h1 className="text-h6 font-h6">
                {t("oneClickTrading.floatingBanner.title")}
              </h1>
              <ArrowButton className="text-subtitle1 font-subtitle1">
                {t("oneClickTrading.floatingBanner.tradeFasterButton")}
              </ArrowButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
