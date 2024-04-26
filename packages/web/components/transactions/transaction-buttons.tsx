import { Transition } from "@headlessui/react";
import Link from "next/link";
import { useState } from "react";

import { MenuDropdown } from "~/components/control";
import { Button } from "~/components/ui/button";
import { EventName } from "~/config";
import { useWindowSize } from "~/hooks";
import { useAmplitudeAnalytics, useTranslation } from "~/hooks";

export const TransactionButtons = ({
  open,
  address,
}: {
  open: boolean;
  address: string;
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { isLargeDesktop } = useWindowSize();

  const { logEvent } = useAmplitudeAnalytics();

  const { t } = useTranslation();

  return (
    <div className="relative flex gap-3">
      <Button variant="secondary" size="md" asChild>
        <Link
          passHref
          href={`https://www.mintscan.io/osmosis/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            logEvent([
              EventName.TransactionsPage.explorerClicked,
              {
                source: "top",
              },
            ]);
          }}
        >
          {t("transactions.explorer")} &#x2197;
        </Link>
      </Button>
      <Transition
        // shows full tax reports button when sidebar is closed only on large screen sizes
        show={isLargeDesktop && !open}
        enter="transition-opacity duration-75"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-75"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <Button variant="secondary" size="md" asChild>
          <Link
            passHref
            href="https://stake.tax/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              logEvent([EventName.TransactionsPage.taxReportsClicked]);
            }}
          >
            {t("transactions.taxReports")} &#x2197;
          </Link>
        </Button>
      </Transition>

      <Transition
        // shows ellipsis when sidebar is open or is smaller screen sizes
        show={!isLargeDesktop || (isLargeDesktop && open)}
        enter="transition-opacity duration-75"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-75"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="relative">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="!rounded-full text-base"
          >
            &#x22EF;
          </Button>
          <MenuDropdown
            className="top-12 right-0 !z-0"
            isOpen={isDropdownOpen}
            options={[
              {
                id: "tax-reports",
                display: (
                  <Link
                    className="whitespace-nowrap"
                    passHref
                    href="https://stake.tax/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("transactions.taxReports")} &#x2197;
                  </Link>
                ),
              },
            ]}
            // noop since links are used
            onSelect={() => {}}
            isFloating
          />
        </div>
      </Transition>
    </div>
  );
};
