import classNames from "classnames";
import Image from "next/image";
import { memo } from "react";

import { ArrowRightIcon } from "~/public/icons/arrow-right-icon";

interface AdBannerProps {
  name: string;
  header: string;
  subheader: string;
  externalUrl: string;
  iconImageUrl: string;
  iconImageAlt: string;
  gradient: string;
  fontColor: string;
  arrowColor: string;
}

export const AdBannerContent: React.FC<AdBannerProps> = memo(
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

    console.log("gradientStyle: ", gradientStyle);

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
            <ArrowRightIcon stroke={arrowColor} />
          </div>
        </div>
      </a>
    );
  }
);
