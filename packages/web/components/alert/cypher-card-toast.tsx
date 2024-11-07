import { Transition } from "@headlessui/react";
import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { useLocalStorage } from "react-use";

import { Icon } from "~/components/assets";
import { CYPHER_CARD_URL } from "~/components/complex/portfolio/cypher-card";
import { Pill } from "~/components/indicators/pill";
import { IconButton } from "~/components/ui/button";
import { Breakpoint, useTranslation, useWindowSize } from "~/hooks";

const CypherCardFloatingBannerDoNotShowKey =
  "cypher-card-floating-banner-do-not-show";

export function CypherCardToast() {
  const { t } = useTranslation();

  const [doNotShowAgain, setDoNotShowAgain] = useLocalStorage(
    CypherCardFloatingBannerDoNotShowKey,
    false
  );
  const { isMobile } = useWindowSize(Breakpoint.sm);

  const onClose = () => {
    setDoNotShowAgain(true);
  };

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
          "fixed bottom-8 right-8 z-50 h-40 max-w-[28rem] cursor-pointer overflow-hidden rounded-5xl bg-osmoverse-800",
          "sm:left-1/2 sm:right-auto sm:w-[90vw] sm:-translate-x-1/2 sm:transform sm:rounded-2xl"
        )}
      >
        <div className="relative flex h-full items-center px-[1.125rem] sm:gap-3 sm:py-4 sm:pl-3">
          <Image
            src="/images/cypher-card-intro.svg"
            alt={t("cypherCard.cypherSpend")}
            width={isMobile ? 100 : 136}
            height={isMobile ? 100 : 136}
          />

          <div className="mr-3 flex flex-col gap-2">
            <Pill className={classNames("!px-2", "sm:py-1 sm:text-caption")}>
              {t("cypherCard.newPill")}
            </Pill>

            <div className="flex w-[16.875rem] max-w-[16.875rem] items-center justify-between sm:w-fit sm:max-w-fit">
              <div className="flex flex-col gap-2">
                <h1
                  className={classNames(
                    "flex-shrink-0 text-h6 font-h6",
                    "sm:text-subtitle1 sm:font-subtitle1"
                  )}
                >
                  {t("cypherCard.cypherSpend")}
                </h1>
                <Link
                  href={CYPHER_CARD_URL}
                  className={classNames(
                    "text-wrap text-subtitle1 font-subtitle1 text-wosmongton-300 hover:underline",
                    "sm:text-left sm:text-caption sm:font-caption"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("cypherCard.acceptedEverywhere")}{" "}
                  <Icon
                    id="arrow-right"
                    className="inline-block"
                    width={16}
                    height={16}
                  />
                </Link>
              </div>
            </div>
          </div>

          <IconButton
            aria-label="Close"
            variant="default"
            size={null}
            className="group absolute right-4 top-4 h-8 w-8 flex-shrink-0 !rounded-full !bg-osmoverse-600 sm:h-6 sm:w-6"
            icon={
              <Icon
                id="close-thin"
                className="ml-px text-osmoverse-800 transition-colors duration-200 group-hover:text-osmoverse-100"
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
