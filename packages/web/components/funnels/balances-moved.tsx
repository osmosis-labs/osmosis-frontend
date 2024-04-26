import classNames from "classnames";
import Image from "next/image";
import { useRouter } from "next/router";
import { forwardRef } from "react";
import { useLocalStorage } from "react-use";

import { useTranslation } from "~/hooks";

import { Icon } from "../assets";
import { CustomClasses } from "../types";

export const BalancesMoved = forwardRef<HTMLDivElement, CustomClasses>(
  function BalancesMoved({ className }, ref) {
    const { t } = useTranslation();
    const router = useRouter();

    const [isClosed, setIsClosed] = useLocalStorage(
      "assets-page-balances-moved-user-ack",
      false
    );

    if (isClosed) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={classNames(
          "grid h-32 w-full cursor-pointer grid-cols-2 overflow-clip rounded-[1.25rem] bg-osmoverse-800 1.5lg:grid-cols-1",
          className
        )}
        onClick={() => router.push("/portfolio")}
      >
        <div className="relative 1.5lg:hidden">
          <Image
            className="absolute left-0"
            alt="portfolio page screenshot"
            src="/images/new-portfolio-page.svg"
            width={526}
            height={128}
          />
        </div>
        <div className="flex items-start gap-2 p-6 1.5lg:place-content-between">
          <div className="flex flex-col gap-2">
            <h6>{t("assets.balancesMovedTitle")}</h6>
            <p className="body2 group text-osmoverse-300 transition-colors duration-100 ease-out hover:text-white-full">
              {t("assets.balancesMovedDescription")} →
            </p>
          </div>
          <div className="flex items-start gap-2 p-6 1.5lg:place-content-between">
            <div className="flex flex-col gap-2">
              <h6>{t("assets.balancesMovedTitle")}</h6>
              <p className="body2 group text-osmoverse-300 transition-colors duration-100 ease-out hover:text-white-full">
                {t("assets.balancesMovedDescription")} →
              </p>
            </div>
            <button
              className="p-1.5 text-osmoverse-500"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();

                setIsClosed(true);
              }}
            >
              <Icon id="thin-x" height={24} width={24} />
            </button>
          </div>
        </div>
      </div>
    );
  }
);
