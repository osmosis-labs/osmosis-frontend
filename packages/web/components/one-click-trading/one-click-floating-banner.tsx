import { Transition } from "@headlessui/react";
import classNames from "classnames";
import { Fragment } from "react";
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
          <IntroOneClickSvg
            width={291.56}
            height={136}
            className={classNames("-ml-24", "sm:hidden")}
          />
          <FloatingBannerMobileSvg
            className={classNames("mr-3 hidden", "sm:block")}
          />

          <div
            className={classNames(
              "mr-3 flex flex-col gap-2",
              "sm:mr-0 sm:w-full sm:flex-row"
            )}
          >
            <Pill className={classNames("!px-2", "sm:order-2 sm:self-center")}>
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
                  "sm:text-caption sm:font-caption"
                )}
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
              "group mt-5 h-8 w-8 flex-shrink-0 self-start rounded-full bg-osmoverse-600",
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

const FloatingBannerMobileSvg = (props: JSX.IntrinsicElements["svg"]) => {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width="40" height="40" rx="20" fill="#CA2EBD" />
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M16.4333 27.1939L8.74854 8.74829L27.1941 16.433L20.3005 18.7745C20.3299 18.7983 20.3583 18.8239 20.3857 18.8512L26.9074 25.3729C27.3319 25.7974 27.3319 26.4856 26.9074 26.9101C26.4829 27.3346 25.7947 27.3346 25.3702 26.9101L18.8485 20.3884C18.8217 20.3616 18.7965 20.3337 18.7731 20.3049L16.4333 27.1939ZM21.7312 29.2295C22.1556 28.8051 22.8439 28.8051 23.2683 29.2295L25.7683 31.7295C26.1928 32.154 26.1928 32.8422 25.7683 33.2667C25.3438 33.6912 24.6556 33.6912 24.2311 33.2667L21.7312 30.7667C21.3067 30.3422 21.3067 29.654 21.7312 29.2295ZM30.7683 21.7296C30.3439 21.3051 29.6556 21.3051 29.2312 21.7296C28.8067 22.1541 28.8067 22.8423 29.2312 23.2668L31.7311 25.7668C32.1556 26.1913 32.8438 26.1913 33.2683 25.7668C33.6928 25.3423 33.6928 24.6541 33.2683 24.2296L30.7683 21.7296Z"
        fill="#F8DEF3"
      />
    </svg>
  );
};
