import { getDeepValue } from "@osmosis-labs/utils";
import classNames from "classnames";
import Image from "next/image";
import { memo } from "react";

import { Icon } from "~/components/assets";
import { Step, Stepper } from "~/components/stepper/index";
import { useTranslation } from "~/hooks";
import { SwapAdBannerResponse } from "~/pages";

type Ad = SwapAdBannerResponse["banners"][number];
interface AdBannerProps {
  ads: Ad[];
  localization: SwapAdBannerResponse["localization"] | undefined;
}

export const AdBanner: React.FC<AdBannerProps> = memo(
  ({ ads, localization }) => {
    return (
      <Stepper autoplay={{ delayInMs: 12000, stopOnHover: true }}>
        {ads.map((ad: Ad) => (
          <Step
            key={`${ad.name} ${ad.headerOrTranslationKey} ${ad.subheaderOrTranslationKey}`}
          >
            <AdBannerContent {...ad} localization={localization} />
          </Step>
        ))}
      </Stepper>
    );
  }
);

export const AdBannerContent: React.FC<
  Ad & { localization: AdBannerProps["localization"] }
> = memo(
  ({
    headerOrTranslationKey,
    subheaderOrTranslationKey,
    iconImageUrl,
    externalUrl,
    iconImageAltOrTranslationKey,
    fontColor,
    arrowColor,
    gradient,
    localization,
  }) => {
    const { language } = useTranslation();

    const gradientStyle = { backgroundImage: gradient };
    const textContainerStyle = { color: fontColor };
    const arrowStyle = { color: arrowColor };
    const currentLocalization = localization?.[language];

    return (
      <a
        className="z-50 flex w-full gap-5 rounded-3xl py-3 px-4 hover:cursor-pointer"
        style={gradientStyle}
        target="_blank"
        rel="noopener noreferrer"
        href={externalUrl}
      >
        <Image
          src={iconImageUrl}
          alt={
            getDeepValue(currentLocalization, iconImageAltOrTranslationKey) ??
            iconImageAltOrTranslationKey
          }
          width={64}
          height={72}
          className="object-contain"
        />
        <div
          className={classNames("flex w-full flex-col gap-1 py-2.5")}
          // we pass this color in directly to avoid having to manually update our tailwind safelist with arbitrary values
          // https://stackoverflow.com/questions/73797433/custom-colors-with-tailwind-css-and-string-interpolation-react-app-with-api
          style={textContainerStyle}
        >
          <h6 className="font-semibold">
            {getDeepValue(currentLocalization, headerOrTranslationKey) ??
              headerOrTranslationKey}
          </h6>
          <div className="flex gap-3">
            <p className="text-sm font-light">
              {getDeepValue(currentLocalization, subheaderOrTranslationKey) ??
                subheaderOrTranslationKey}
            </p>
            <Icon id="arrow-right" style={arrowStyle} />
          </div>
        </div>
      </a>
    );
  }
);
