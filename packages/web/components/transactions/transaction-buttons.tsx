import { Popover, Transition } from "@headlessui/react";
import classNames from "classnames";
import Link from "next/link";

import { EventName } from "~/config";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";

export const TransactionButtons = ({
  address,
}: {
  open: boolean;
  address: string;
}) => {
  const { t } = useTranslation();
  const { logEvent } = useAmplitudeAnalytics();

  const options = [
    {
      id: "explorer",
      href: `https://www.mintscan.io/osmosis/address/${address}`,
      description: <>{t("transactions.explorer")} &#x2197;</>,
    },
    {
      id: "tax-reports",
      href: "https://stake.tax/",
      description: <>{t("transactions.taxReports")} &#x2197;</>,
    },
  ];

  return (
    <Popover>
      <Popover.Button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-osmoverse-825 text-wosmongton-200 focus:outline-none">
        &#x22EF;
      </Popover.Button>
      <Transition
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Popover.Panel className="absolute mt-2 flex w-max -translate-x-[calc(100%-40px)] flex-col rounded-xl border border-osmoverse-600 bg-osmoverse-900 focus:outline-none">
          {options.map(({ id, href, description }, i, original) => (
            <Link
              key={id}
              href={href}
              target="_blank"
              onClick={() => {
                if (id === "explorer") {
                  logEvent([
                    EventName.TransactionsPage.explorerClicked,
                    {
                      source: "top",
                    },
                  ]);
                }
              }}
              className={classNames(
                "px-4 py-1.5 transition-colors hover:bg-osmoverse-700",
                {
                  "rounded-t-xl": i === 0,
                  "rounded-b-xl": i === original.length - 1,
                }
              )}
            >
              <span className="text-osmoverse-200">{description}</span>
            </Link>
          ))}
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};
