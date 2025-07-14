import Image from "next/image";
import Link from "next/link";

import { Icon } from "~/components/assets/icon";
import { useTranslation } from "~/hooks";
import { useSwap } from "~/hooks/use-swap";

export const PolarisBanner = ({ onClose }: { onClose: () => void }) => {
  const { fromAsset } = useSwap();
  const { t } = useTranslation();

  if (!fromAsset) return null;

  return (
    <div className="relative overflow-hidden flex flex-col my-3 gap-2 bg-[#653026] p-5 rounded-3xl">
      <div className="flex flex-col gap-2 max-w-[290px]">
        <h6 className="inline-flex items-center gap-1 text-[#FFFFFF70] font-semibold">
          {t("polarisBanner.tradeYour")}
          <div className="px-1">
            <Image
              src={fromAsset?.coinImageUrl ?? ""}
              alt={fromAsset?.coinDenom ?? ""}
              width={24}
              height={24}
              className="rounded-full"
            />
          </div>
          <span className="text-[#F8F6F2]">{fromAsset?.coinDenom ?? ""}</span>
          {t("babyBanner.with")}
        </h6>
        <h6 className="inline-flex items-center gap-1 text-[#FFFFFF70] font-semibold">
          <div className="px-1">
            <Image
              src="/tokens/generated/sol.svg"
              alt="SOL"
              width={24}
              height={24}
            />
          </div>
          <span className="text-[#F8F6F2]">SOL,</span>
          <div className="px-1">
            <Image
              src="/logos/hype-logo.png"
              alt="HYPE"
              width={24}
              height={24}
            />
          </div>
          <span className="text-[#F8F6F2]">HYPE,</span>
        </h6>
        <h6 className="inline-flex items-center gap-1 text-[#FFFFFF70] font-semibold">
          <div className="px-1">
            <Image
              src="/logos/polaris-banner-logos.png"
              alt="GOOGL - 1TSLA - AAPL logos"
              width={52}
              height={24}
              className="min-w-[52px]"
            />
          </div>
          <span>{t("polarisBanner.andSoMuchMore")}</span>
        </h6>
        <Link
          href="https://polaris.app"
          target="_blank"
          className="py-3 px-4 bg-[#F99E53] rounded-3xl mt-6 flex items-center gap-1 text-[#0A0F0D] w-fit hover:bg-[#F78425] transition-colors"
        >
          <span className="subtitle1">
            {t("polarisBanner.tradeAnythingOnPolaris")}
          </span>
          <Icon id="arrow-up-right" width={16} height={16} className="mb-1" />
        </Link>
      </div>
      <Image
        src="/images/polaris-compass.png"
        alt=""
        width={131}
        height={189}
        className="absolute right-0 top-2"
      />
      <button
        type="button"
        className="rounded-full absolute top-3 right-3 z-10 h-8 w-8 flex items-center justify-center bg-osmoverse-alpha-850 backdrop-blur-xl"
        onClick={onClose}
      >
        <Icon id="close" width={16} height={16} className="text-[#F99E53]" />
      </button>
    </div>
  );
};
