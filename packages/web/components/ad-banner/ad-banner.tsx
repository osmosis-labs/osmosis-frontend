import classNames from "classnames";
import Image from "next/image";

import banners from "./ad-cms.json";

console.log("banners: ", banners);

import { ArrowButton } from "../buttons";
import PlaceLimitOrderSvg from "./place-limit-order.svg";

export const AdBanner = () => {
  return (
    <div
      className={classNames(
        "z-50 flex w-full gap-5 rounded-[24px] py-3 px-4"
        // "ml-auto mr-[15%] w-[27rem] lg:mx-auto md:mt-mobile-header"
      )}
      style={{
        background:
          "linear-gradient(90deg, #3B154F 0%, #10061C 47.66%, #0E2654 100%);",
      }}
    >
      <Image src={PlaceLimitOrderSvg} alt="Place Limit Order" />
      <div className="flex w-full flex-col gap-1 py-2.5">
        <h6>Place limit orders</h6>
        <div className="flex gap-3">
          <p className="text-sm font-light">
            New trading options with Autonomy
          </p>
          <div>
            <ArrowButton />
          </div>
        </div>
      </div>
    </div>
  );
};
