import Image from "next/image";
import Link from "next/link";
import { FunctionComponent } from "react";

import { Icon } from "~/components/assets";
import { IconButton } from "~/components/ui/button";
import { useTranslation } from "~/hooks";

interface BabyBannerProps {
  onClose: () => void;
}

export const BabyBanner: FunctionComponent<BabyBannerProps> = ({ onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col rounded-3xl border-2 border-[rgba(9,5,36,0.4)] bg-osmoverse-900 p-5 gap-4">
      <div className="flex justify-between items-start w-full pr-8 relative">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-[3px]">
            <span className="subtitle1 text-white-full">
              {t("babyBanner.trade")}
            </span>
            <div className="flex items-center">
              <Image
                src="/tokens/generated/baby.svg"
                alt="BABY token"
                width={24}
                height={24}
              />
            </div>
            <span className="subtitle1 text-rust-600">BABY</span>
            <span className="subtitle1 text-white-full">
              {t("babyBanner.with")}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="subtitle1 text-white-full">
              {t("babyBanner.anyTokenOnAnyNetworkOn")}{" "}
              <Image
                src="/images/polaris-logo.svg"
                alt="Polaris"
                width={70}
                height={16}
                className="inline-block align-middle ml-1"
              />
            </span>
          </div>
        </div>
        <IconButton
          aria-label="Close"
          data-testid="close"
          className="absolute -right-2 -top-2 z-50 !h-10 !w-10 cursor-pointer !bg-transparent !py-0 text-wosmongton-400 hover:text-osmoverse-300"
          icon={<Icon id="close" width={16} height={16} />}
          onClick={onClose}
        />
      </div>
      <div className="flex justify-between items-end w-full sm:flex-col sm:gap-2 sm:items-start">
        <span className="text-osmoverse-300 body2">
          {t("babyBanner.limitedTimeOnly")}
        </span>
        <Link
          target="_blank"
          href="https://beta.polaris.app/tokens/BABY?toToken=ubbn&toChain=cosmos:bbn-1"
          className="flex items-center justify-center h-8 px-3 py-1 bg-wosmongton-100 rounded-full transition-colors duration-150 hover:bg-wosmongton-200"
        >
          <span className="text-osmoverse-1000 body2 gap-1 flex items-center">
            {t("babyBanner.skipWaitlist")}{" "}
            <Icon id="arrow-up-right" width={16} height={16} />
          </span>
        </Link>
      </div>
    </div>
  );
};
