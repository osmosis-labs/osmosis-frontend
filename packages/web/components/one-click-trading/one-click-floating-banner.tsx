import { Transition } from "@headlessui/react";
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import { Fragment } from "react";
import { useLocalStorage } from "react-use";

import { Icon } from "~/components/assets";
import { ArrowButton } from "~/components/buttons";
import IconButton from "~/components/buttons/icon-button";
import { Pill } from "~/components/indicators/pill";
import {
  useFeatureFlags,
  useIsOneClickTradingEnabled,
  useTranslation,
} from "~/hooks";
import { useGlobalIs1CTIntroModalOpen } from "~/modals";
import { useStore } from "~/stores";

export const OneClickFloatingBannerDoNotShowKey =
  "do-not-show-one-click-trading-floating-notification";

export const OneClickFloatingBanner = observer(() => {
  const { accountStore, chainStore } = useStore();
  const featureFlags = useFeatureFlags();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);
  const isConnected = !!account?.address;
  const { isOneClickTradingEnabled } = useIsOneClickTradingEnabled();

  if (!isConnected || !featureFlags.oneClickTrading || isOneClickTradingEnabled)
    return null;

  return <OneClickFloatingBannerContent />;
});

const OneClickFloatingBannerContent = () => {
  const { t } = useTranslation();
  const [doNotShowAgain, setDoNotShowAgain] = useLocalStorage(
    OneClickFloatingBannerDoNotShowKey,
    false
  );
  const [, setIs1CTIntroModalOpen] = useGlobalIs1CTIntroModalOpen();

  return (
    <Transition
      appear
      as={Fragment}
      show={!doNotShowAgain}
      enter="transform transition duration-300 ease-inOutBack"
      enterFrom="translate-x-[130%]"
      enterTo="translate-x-0 translate-y-0"
      leave="transform transition duration-300 ease-inOutBack"
      leaveFrom="translate-x-0 translate-y-0"
      leaveTo="translate-x-[120%]"
    >
      <div
        className={classNames(
          "fixed bottom-8 right-8 z-50 w-fit rounded-5xl bg-osmoverse-800",
          "sm:right-auto sm:left-1/2 sm:w-[90vw] sm:-translate-x-1/2 sm:transform sm:rounded-2xl"
        )}
      >
        <div
          className={classNames(
            "relative flex items-center pr-3",
            "sm:py-4 sm:pl-3"
          )}
        >
          <Image
            src="/images/1ct-intro-graphics.svg"
            alt="1ct intro"
            width={291.56}
            height={136}
            className={classNames("-ml-24", "sm:hidden")}
          />

          <Image
            src="/images/1ct-small-icon.svg"
            alt="1ct mobile icon"
            width={40}
            height={40}
            className={classNames("mr-3 hidden", "sm:block")}
          />

          <div
            className={classNames(
              "mr-3 flex flex-col gap-2",
              "sm:mr-0 sm:w-full sm:flex-row"
            )}
          >
            <Pill
              className={classNames(
                "!px-2",
                "sm:order-2 sm:self-center sm:py-1 sm:text-caption"
              )}
            >
              {t("oneClickTrading.floatingBanner.newPill")}
            </Pill>

            <div
              className={classNames(
                "flex flex-col gap-2",
                "sm:order-1 sm:flex-1 sm:gap-0"
              )}
            >
              <h1
                className={classNames(
                  "flex-shrink-0 text-h6 font-h6",
                  "sm:text-subtitle1 sm:font-subtitle1"
                )}
              >
                {t("oneClickTrading.floatingBanner.title")}
              </h1>
              <ArrowButton
                className={classNames(
                  "text-subtitle1 font-subtitle1",
                  "sm:text-left sm:text-caption sm:font-caption"
                )}
                onClick={() => setIs1CTIntroModalOpen(true)}
              >
                {t("oneClickTrading.floatingBanner.tradeFasterButton")}
              </ArrowButton>
            </div>
          </div>

          <IconButton
            aria-label="Close"
            mode="icon-primary"
            size="unstyled"
            className={classNames(
              "group mt-5 h-8 w-8 flex-shrink-0 self-start !rounded-full bg-osmoverse-600",
              "sm:mt-0 sm:ml-2 sm:self-center"
            )}
            icon={
              <Icon
                id="close-thin"
                className="ml-[1px] text-osmoverse-800 transition-colors duration-200 group-hover:text-osmoverse-100"
                width={24}
                height={24}
              />
            }
            onClick={() => {
              setDoNotShowAgain(true);
            }}
          />
        </div>
      </div>
    </Transition>
  );
};
