import classNames from "classnames";
import dynamic from "next/dynamic";
import Image from "next/image";
import { FunctionComponent, useEffect, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { useWindowSize } from "~/hooks";

import { truncateString } from "../../../utils/string";
import { CustomClasses } from "../../types";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

/** Illustrates a bespoke or IBC bridge transfer for user info. */
export const BridgeAnimation: FunctionComponent<
  {
    transferPath: [
      { address: string; networkName: string; iconUrl?: string },
      { address: string; networkName: string; iconUrl?: string }
    ];
  } & CustomClasses
> = (props) => {
  const {
    transferPath: [from, to],
    className,
  } = props;
  const { isMobile } = useWindowSize();
  const t = useTranslation();

  const longFromName = from.networkName.length > 7;
  const longToName = to.networkName.length > 7;

  // constants
  const overlayedIconSize = isMobile
    ? { height: 36, width: 36 }
    : { height: 45, width: 45 };

  // dynamic load JSON animation data - keep base bundle small
  const [animData, setAnimData] = useState<object | null>(null);
  useEffect(() => {
    if (!animData) {
      import("./lottie-transfer.json").then(setAnimData);
    }
  }, [animData]);

  return (
    <div
      className={classNames(
        "relative h-[110px] w-[600px] md:w-[300px]",
        className
      )}
    >
      <div className="absolute left-[10%] h-full w-1/3 text-center md:left-[2.5%]">
        <span
          className={classNames(
            "whitespace-nowrap transition-opacity duration-300",
            longFromName || longToName
              ? isMobile
                ? "caption"
                : "subtitle1"
              : "md:subtitle2",
            longFromName
              ? "left-[90px] md:-left-[4px]"
              : "left-[122px] md:left-[10px]"
          )}
        >
          {t("assets.transfer.from")} {truncateString(from.networkName, 22)}
        </span>
      </div>
      <div className="absolute right-[10%] h-full w-1/3 text-center md:-right-[1%]">
        <span
          className={classNames(
            "w-fit whitespace-nowrap transition-opacity duration-300",
            longFromName || longToName
              ? isMobile
                ? "caption"
                : "subtitle1"
              : "md:subtitle2",
            "left-[405px] md:left-[210px]"
          )}
        >
          {t("assets.transfer.to")} {truncateString(to.networkName, 22)}
        </span>
      </div>
      <div className="absolute left-[105px] top-[20px] md:left-[30px]">
        <div className="transition-opacity duration-300">
          <Lottie
            style={{ height: isMobile ? 80 : 85, width: isMobile ? 255 : 400 }}
            animationData={animData}
            autoplay
            loop
          />
        </div>
      </div>
      {from.iconUrl && (
        <div className="absolute left-[139px] top-[40px] transition-opacity duration-300 md:left-[40px] md:top-[42px]">
          <Image alt="token icon" src={from.iconUrl} {...overlayedIconSize} />
        </div>
      )}
      {to.iconUrl && (
        <div className="absolute left-[424px] top-[40px] transition-opacity duration-300 md:left-[237px] md:top-[42px]">
          <Image alt="token icon" src={to.iconUrl} {...overlayedIconSize} />
        </div>
      )}
    </div>
  );
};
