import classNames from "classnames";
import Image from "next/image";

import { banners } from "./ad-cms.json";

console.log("banners: ", banners);

import { ArrowButton } from "../buttons";
import PlaceLimitOrderSvg from "./place-limit-order.svg";

interface AdBannerProps {
  name: string;
  header: string;
  subheader: string;
  external_URL: string;
  icon_image_URL: string;
  gradient: string;
  featured: boolean;
  internal_data: {
    icon_size: number;
    project_listing_date: string;
  };
}

export const AdBannerContainer = () => {
  const props = banners[0];
  return <AdBanner {...props} />;
};

export const AdBanner: React.FC<AdBannerProps> = ({ header, subheader }) => {
  return (
    <div
      className={classNames(
        "z-50 flex w-full gap-5 rounded-[24px] py-3 px-4",
        "bg-osmoverse-800"
      )}
      // "ml-auto mr-[15%] w-[27rem] lg:mx-auto md:mt-mobile-header"
      // style={{
      //   background:
      //     "linear-gradient(90deg, #3B154F 0%, #10061C 47.66%, #0E2654 100%);",
      // }}
    >
      <Image src={PlaceLimitOrderSvg} alt="Place Limit Order" />
      <div className="flex w-full flex-col gap-1 py-2.5">
        <h6>{header}</h6>
        <div className="flex gap-3">
          <p className="text-sm font-light">{subheader}</p>
          <div>
            <ArrowButton />
          </div>
        </div>
      </div>
    </div>
  );
};

{
  /* <Stepper autoplay={{ delayInMs: 4000, stopOnHover: true }}>
          <Step>
            <h4>Heading</h4>
            <div className="h-12 w-12 bg-osmoverse-500"></div>
            <p>test 1</p>
          </Step>

          <Step>
            <p>test 2</p>
          </Step>
          <StepsIndicator />
        </Stepper> */
}
