import classNames from "classnames";
import Image from "next/image";
import { memo } from "react";

import { Ad } from "~/components/ad-banner/ad-banner-types";
import { Icon } from "~/components/assets";

type AdBannerContentProps = Ad;

export const AdBannerContent: React.FC<AdBannerContentProps> = memo(
  ({
    header,
    subheader,
    iconImageUrl,
    externalUrl,
    iconImageAlt,
    fontColor,
    arrowColor,
    gradient,
  }) => {
    const gradientStyle = { backgroundImage: gradient };
    const textContainerStyle = { color: fontColor };
    const arrowStyle = { color: arrowColor };

    return (
      <a
        className="z-50 flex w-full gap-5 rounded-[24px] py-3 px-4 hover:cursor-pointer"
        style={gradientStyle}
        target="_blank"
        rel="noopener noreferrer"
        href={externalUrl}
      >
        <Image src={iconImageUrl} alt={iconImageAlt} width={80} height={80} />
        <div
          className={classNames("flex w-full flex-col gap-1 py-2.5")}
          // we pass this color in directly to avoid having to manually update our tailwind safelist with arbitrary values
          // https://stackoverflow.com/questions/73797433/custom-colors-with-tailwind-css-and-string-interpolation-react-app-with-api
          style={textContainerStyle}
        >
          <h6 className="font-semibold">{header}</h6>
          <div className="flex gap-3">
            <p className="text-sm font-light">{subheader}</p>
            <Icon id="arrow-right" style={arrowStyle} />
          </div>
        </div>
      </a>
    );
  }
);
