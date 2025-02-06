import { Transition } from "@headlessui/react";
import classNames from "classnames";
import Image from "next/image";
import { useRouter } from "next/router";
import { parseAsString, useQueryState } from "nuqs";
import { Fragment } from "react";
import { useLocalStorage } from "react-use";

import { Icon } from "~/components/assets";
import { Pill } from "~/components/indicators/pill";
import { IconButton } from "~/components/ui/button";
import { Breakpoint, useTranslation, useWindowSize } from "~/hooks";
import { useOrderbook } from "~/hooks/limit-orders/use-orderbook";

export const LimitOrdersFloatingBannerDoNotShowKey =
  "limit-orders-floating-banner-do-not-show";

export function LimitOrdersToast() {
  const { t } = useTranslation();
  const [from] = useQueryState("from", parseAsString.withDefault("OSMO"));
  const router = useRouter();
  const [doNotShowAgain, setDoNotShowAgain] = useLocalStorage(
    LimitOrdersFloatingBannerDoNotShowKey,
    false
  );
  const { isMobile } = useWindowSize(Breakpoint.sm);

  const { orderbook, isOrderbookLoading } = useOrderbook({
    baseDenom: from,
    quoteDenom: "USDC",
  });

  const fromDenom = orderbook ? from : "OSMO";
  const quoteDenom = "USDC";

  const onClose = () => {
    setDoNotShowAgain(true);
  };

  return (
    <Transition
      appear
      as={Fragment}
      show={!doNotShowAgain && !isOrderbookLoading}
      enter="transform transition duration-300 ease-inOutBack"
      enterFrom="translate-x-[130%]"
      enterTo="translate-x-0 translate-y-0"
      leave="transform transition duration-300 ease-inOutBack"
      leaveFrom="translate-x-0 translate-y-0"
      leaveTo="translate-x-[120%]"
    >
      <div
        className={classNames(
          "fixed bottom-8 right-8 z-50 w-fit cursor-pointer overflow-hidden rounded-5xl bg-osmoverse-800 ",
          "sm:left-1/2 sm:right-auto sm:w-[90vw] sm:-translate-x-1/2 sm:transform sm:rounded-2xl"
        )}
        onClick={() => {
          router.push(
            `/?tab=buy&from=${fromDenom}&quote=${quoteDenom}&type=limit`
          );
          onClose();
        }}
      >
        <div
          className={classNames(
            "relative flex items-center gap-6 pr-3",
            "sm:gap-3 sm:py-4 sm:pl-3"
          )}
        >
          <Image
            src="/images/limit-orders-intro.svg"
            alt="limit orders intro"
            width={136}
            height={136}
            className={classNames("sm:hidden")}
          />

          <Image
            src="/images/limit-orders-intro-small.svg"
            alt="limit orders intro"
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
                {t("limitOrders.floatingBanner.title")}
              </h1>
              <div
                className={classNames(
                  "text-subtitle1 font-subtitle1 text-wosmongton-300",
                  "sm:text-left sm:text-caption sm:font-caption"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(
                    `/?tab=buy&from=${fromDenom}&quote=${quoteDenom}&type=limit`
                  );
                  onClose();
                }}
              >
                {t("limitOrders.floatingBanner.tryLimitOrders")}
              </div>
            </div>
          </div>

          <IconButton
            aria-label="Close"
            variant="default"
            size={null}
            className={classNames(
              "group mr-0.5 mt-3 h-8 w-8 flex-shrink-0 self-start !rounded-full !bg-osmoverse-600",
              "sm:mt-0 sm:h-6 sm:w-6 sm:self-center"
            )}
            icon={
              <Icon
                id="close-thin"
                className="ml-[1px] text-osmoverse-800 transition-colors duration-200 group-hover:text-osmoverse-100"
                width={isMobile ? 16 : 24}
                height={isMobile ? 16 : 24}
              />
            }
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          />
        </div>
      </div>
    </Transition>
  );
}
