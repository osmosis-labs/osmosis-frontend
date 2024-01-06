import classNames from "classnames";
import Image from "next/image";
import { memo } from "react";

import { Icon } from "~/components/assets";
import { Step, Stepper } from "~/components/stepper/index";

export interface Ad {
  name: string;
  start_date: string;
  end_date: string;
  header: string;
  subheader: string;
  external_url: string;
  icon_image_url: string;
  icon_image_alt: string;
  gradient: string;
  font_color: string;
  arrow_color: string;
  featured: true;
}

interface AdBannerProps {
  ads: Ad[];
}

export const AdBanner: React.FC<AdBannerProps> = memo(({ ads }) => {
  // const randomAds = useMemo(() => shuffleArray(ads), [ads]);

  // temporarily disable random ads for Levana & milkTIA
  const randomAds = ads;

  return (
    <Stepper autoplay={{ delayInMs: 12000, stopOnHover: true }}>
      {randomAds.map((ad: Ad) => (
        <Step key={`${ad.name} ${ad.header} ${ad.subheader}`}>
          <AdBannerContent {...ad} />
        </Step>
      ))}
    </Stepper>
  );
});

export const AdBannerContent: React.FC<Ad> = memo(
  ({
    header,
    subheader,
    icon_image_url,
    external_url,
    icon_image_alt,
    font_color,
    arrow_color,
    gradient,
  }) => {
    const gradientStyle = { backgroundImage: gradient };
    const textContainerStyle = { color: font_color };
    const arrowStyle = { color: arrow_color };

    return (
      <a
        className="z-50 flex w-full gap-5 rounded-3xl py-3 px-4 hover:cursor-pointer"
        style={gradientStyle}
        target="_blank"
        rel="noopener noreferrer"
        href={external_url}
      >
        <Image
          src={icon_image_url}
          alt={icon_image_alt}
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
