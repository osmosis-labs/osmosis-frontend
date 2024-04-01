import { SwapAdBannerResponse } from "@osmosis-labs/server";
import { getDeepValue } from "@osmosis-labs/utils";
import Image from "next/image";
import { memo } from "react";

import { Icon } from "~/components/assets";
import { Step, Stepper } from "~/components/stepper/index";
import { useTranslation } from "~/hooks";

export type Ad = SwapAdBannerResponse["banners"][number] & {
  onClick?: () => void;
};
interface AdBannersProps {
  ads: Ad[];
  localization: SwapAdBannerResponse["localization"] | undefined;
}

export const AdBanners: React.FC<AdBannersProps> = memo(
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
  Ad & { localization: AdBannersProps["localization"] }
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
    onClick,
  }) => {
    const { language } = useTranslation();

    const gradientStyle = { backgroundImage: gradient };
    const textContainerStyle = { color: fontColor };
    const arrowStyle = { color: arrowColor };
    const currentLocalization = localization?.[language];

    const isButton = !!onClick;
    const Component = isButton ? "button" : "a";

    return (
      <Component
        className="z-50 flex w-full items-center gap-5 rounded-3xl py-3 px-4 hover:cursor-pointer"
        style={gradientStyle}
        target="_blank"
        rel="noopener noreferrer"
        {...(isButton ? { onClick } : { href: externalUrl })}
      >
        {iconImageUrl && (
          <Image
            src={iconImageUrl}
            alt={
              getDeepValue(currentLocalization, iconImageAltOrTranslationKey) ??
              iconImageAltOrTranslationKey ??
              ""
            }
            width={64}
            height={72}
            className="object-contain"
          />
        )}
        <div className="flex items-center gap-4">
          <div
            className="flex w-full flex-col gap-1 py-2.5 text-left"
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
            </div>
          </div>
          <Icon id="arrow-right" style={arrowStyle} width={40} height={40} />
        </div>
      </Component>
    );
  }
);
