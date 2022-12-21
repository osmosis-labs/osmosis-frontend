import dynamic from "next/dynamic";
import Image from "next/image";
import { FunctionComponent, useEffect, useState } from "react";
import classNames from "classnames";
import { useWindowSize } from "../../../hooks";
import { CustomClasses, LoadingProps } from "../../types";
import { Animation as AnimationProps } from "../types";
import { useTranslation } from "react-multi-lang";
import { truncateString } from "../../../utils/string";

const Lottie = dynamic(() => import("react-lottie"), { ssr: false });

/** Illustrates a bespoke or IBC bridge transfer for user info. */
export const BridgeAnimation: FunctionComponent<
  {
    transferPath: [
      { address: string; networkName: string; iconUrl?: string },
      (
        | ({ bridgeName: string; bridgeIconUrl?: string } & LoadingProps)
        | undefined
      ),
      { address: string; networkName: string; iconUrl?: string }
    ];
  } & AnimationProps &
    CustomClasses
> = (props) => {
  const {
    transferPath: [from, bridge, to],
    className,
  } = props;
  const { isMobile } = useWindowSize();
  const t = useTranslation();

  const longFromName = from.networkName.length > 7;
  const longToName = to.networkName.length > 7;

  // constants
  const overlayedIconSize = isMobile
    ? bridge
      ? { height: 30, width: 30 }
      : { height: 36, width: 36 }
    : { height: 45, width: 45 };

  // dynamic load JSON animation data - keep base bundle small
  const [loadingAnimData, setLoadingAnimData] = useState<object | null>(null);
  const [animData, setAnimData] = useState<object | null>(null);
  useEffect(() => {
    if (!loadingAnimData && bridge) {
      (async () =>
        setLoadingAnimData(await import("./lottie-bridge-loading.json")))();
    }

    if (!animData) {
      (async () => {
        const data = bridge
          ? await import("./lottie-bridge.json")
          : await import("./lottie-ibc.json");
        setAnimData(data);
      })();
    }
  }, [loadingAnimData, animData, bridge]);

  return (
    <div
      className={classNames(
        "relative h-[110px] w-[600px] md:w-[300px]",
        className
      )}
    >
      <div
        className={classNames(
          "absolute h-full w-1/3 text-center",
          bridge ? "left-[8%] md:left-[2%]" : "left-[10%] md:left-[2.5%]"
        )}
      >
        <span
          className={classNames(
            "whitespace-nowrap transition-opacity duration-300",
            longFromName || longToName
              ? isMobile
                ? "caption"
                : "subtitle1"
              : "md:subtitle2",
            bridge
              ? longFromName
                ? "left-[82px] top-[10px] md:-left-[4px]"
                : "left-[94px] top-[10px] md:left-0"
              : longFromName
              ? "left-[90px] md:-left-[4px]"
              : "left-[122px] md:left-[10px]",
            { "opacity-30": bridge?.isLoading }
          )}
        >
          {t("assets.transfer.from")}{" "}
          {truncateString(from.networkName, bridge ? (isMobile ? 10 : 12) : 18)}
        </span>
      </div>
      {bridge?.bridgeName && (
        <div className="absolute left-[35%] h-full w-1/3 text-center">
          <span
            className={classNames(
              "top-[10px] w-fit whitespace-nowrap",
              longFromName || longToName
                ? isMobile
                  ? "caption"
                  : "subtitle1"
                : "md:subtitle2",
              bridge?.isLoading
                ? "left-[250px] md:left-[111px]"
                : "left-[270px] md:left-[126px]",
              {
                pulse: bridge?.isLoading,
              }
            )}
          >
            {bridge?.isLoading
              ? t("assets.transfer.loading")
              : t("assets.transfer.via")}{" "}
            {bridge.bridgeName}
          </span>
        </div>
      )}
      <div
        className={classNames(
          "absolute h-full w-1/3 text-center",
          bridge ? "right-[6%] md:-right-[2.5%]" : "right-[10%] md:-right-[1%]"
        )}
      >
        <span
          className={classNames(
            "w-fit whitespace-nowrap transition-opacity duration-300",
            longFromName || longToName
              ? isMobile
                ? "caption"
                : "subtitle1"
              : "md:subtitle2",
            bridge
              ? "left-[420px] top-[10px] md:left-[222px]"
              : "left-[405px] md:left-[210px]",
            { "opacity-30": bridge?.isLoading }
          )}
        >
          {t("assets.transfer.to")}{" "}
          {truncateString(to.networkName, bridge ? (isMobile ? 10 : 12) : 18)}
        </span>
      </div>
      <div className="absolute left-[105px] top-[20px] md:left-[30px]">
        <div
          className={classNames("transition-opacity duration-300", {
            "opacity-30": bridge?.isLoading,
          })}
        >
          <Lottie
            options={{
              loop: true,
              animationData: animData,
            }}
            height={isMobile ? 80 : bridge ? 100 : 85}
            width={isMobile ? 255 : 400}
            {...props}
            isPaused={bridge?.isLoading || props.isPaused}
          />
        </div>
        {bridge?.isLoading && (
          <div className="absolute left-[120px] -top-[26px] md:left-[78px] md:-top-[8px]">
            <Lottie
              options={{
                loop: true,
                animationData: loadingAnimData,
              }}
              {...props}
              width={isMobile ? 100 : undefined}
            />
          </div>
        )}
      </div>
      {from.iconUrl && (
        <div
          className={classNames(
            "absolute transition-opacity duration-300",
            bridge
              ? "left-[123px] top-[48px] md:left-[41px] md:top-[45px]"
              : "left-[139px] top-[40px] md:left-[40px] md:top-[42px]",
            { "opacity-30": bridge?.isLoading }
          )}
        >
          <Image alt="token icon" src={from.iconUrl} {...overlayedIconSize} />
        </div>
      )}
      {bridge?.bridgeIconUrl && (
        <div className="absolute left-[284px] top-[48px] md:left-[142px] md:top-[45px]">
          <Image
            alt="token icon"
            src={bridge?.bridgeIconUrl}
            {...overlayedIconSize}
          />
        </div>
      )}
      {to.iconUrl && (
        <div
          className={classNames(
            "absolute transition-opacity duration-300",
            bridge
              ? "left-[440px] top-[48px] md:left-[243px] md:top-[45px]"
              : "left-[424px] top-[40px] md:left-[237px] md:top-[42px]",
            { "opacity-30": bridge?.isLoading }
          )}
        >
          <Image alt="token icon" src={to.iconUrl} {...overlayedIconSize} />
        </div>
      )}
    </div>
  );
};
