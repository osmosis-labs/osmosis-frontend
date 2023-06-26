import classNames from "classnames";

import adCMS from "./ad-cms.json";

console.log("adCMS: ", adCMS);

import Image from "next/image";

import { Step, Stepper, StepsIndicator } from "~/components/stepper/index";

import { ArrowRightIcon } from "../../public/icons/arrow-right-icon";

interface AdBannerProps {
  name: string;
  header: string;
  subheader: string;
  externalUrl: string;
  iconImageUrl: string;
  iconImageAlt: string;
  gradient: string;
  featured: boolean;
  fontColor: string;
  arrowColor: string;
}

const shuffleArray = (array: any[]) =>
  array.sort((a, b) => 0.5 - Math.random());

export const AdBannerContainer = () => {
  const ads: AdBannerProps[] = shuffleArray(adCMS.banners);

  return (
    <Stepper autoplay={{ delayInMs: 4000, stopOnHover: true }}>
      {ads.map((ad) => (
        <Step key={`${ad.name} ${ad.header} ${ad.subheader}`}>
          <AdBanner {...ad} />
        </Step>
      ))}
      <StepsIndicator />
    </Stepper>
  );
};

export const AdBanner: React.FC<AdBannerProps> = ({
  header,
  subheader,
  iconImageUrl,
  externalUrl,
  iconImageAlt,
  fontColor,
  arrowColor,
}) => {
  return (
    <a
      className={classNames(
        "z-50 flex w-full gap-5 rounded-[24px] py-3 px-4",
        "bg-osmoverse-800",
        "hover:cursor-pointer"
      )}
      target="_blank"
      rel="noopener noreferrer"
      href={externalUrl}
      // "ml-auto mr-[15%] w-[27rem] lg:mx-auto md:mt-mobile-header"
      // style={{
      //   background:
      //     "linear-gradient(90deg, #3B154F 0%, #10061C 47.66%, #0E2654 100%);",
      // }}
    >
      <Image src={iconImageUrl} alt={iconImageAlt} width={80} height={80} />
      <div
        className={classNames("flex w-full flex-col gap-1 py-2.5")}
        // we pass this color in directly to avoid having to manually update our tailwind safelist with arbitrary values
        // https://stackoverflow.com/questions/73797433/custom-colors-with-tailwind-css-and-string-interpolation-react-app-with-api
        style={{ color: fontColor }}
      >
        <h6 className="font-semibold">{header}</h6>
        <div className="flex gap-3">
          <p className="text-sm font-light">{subheader}</p>
          <ArrowRightIcon stroke={arrowColor} />
        </div>
      </div>
    </a>
  );
};
