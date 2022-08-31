import Image from "next/image";
import { FunctionComponent, useEffect, useState } from "react";
import Lottie from "react-lottie";
import classNames from "classnames";
import { useWindowSize } from "../../../hooks";
import { CustomClasses, LoadingProps } from "../../types";
import { Animation as AnimationProps } from "../types";

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
        "relative w-[600px] md:w-[300px] h-[110px]",
        className
      )}
    >
      <span
        className={classNames(
          "absolute text-center transition-opacity duration-300 md:subtitle2",
          bridge
            ? "left-[94px] md:left-0 top-[10px]"
            : "left-[116px] md:left-0",
          { "opacity-30": bridge?.isLoading }
        )}
      >
        From {from.networkName}
      </span>
      <style jsx>
        {`
          .pulse {
            animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }

          @keyframes pulse {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
      {bridge?.bridgeName && (
        <span
          className={classNames(
            "absolute text-center w-fit top-[10px] md:subtitle2",
            bridge?.isLoading
              ? "left-[250px] md:left-[111px]"
              : "left-[270px] md:left-[126px]",
            {
              pulse: bridge?.isLoading,
            }
          )}
        >
          {bridge?.isLoading ? "Loading" : "via"} {bridge.bridgeName}
        </span>
      )}
      <span
        className={classNames(
          "absolute text-center w-fit transition-opacity duration-300 md:subtitle2",
          bridge
            ? "left-[420px] md:left-[218px] top-[10px]"
            : "left-[405px] md:left-[210px]",
          { "opacity-30": bridge?.isLoading }
        )}
      >
        To {to.networkName}
      </span>
      <div className="absolute left-[105px] md:left-[30px] top-[20px]">
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
          <div className="absolute left-[120px] md:left-[78px] -top-[26px] md:-top-[8px]">
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
              ? "left-[123px] md:left-[41px] top-[48px] md:top-[45px]"
              : "left-[139px] md:left-[40px] top-[40px] md:top-[42px]",
            { "opacity-30": bridge?.isLoading }
          )}
        >
          <Image alt="token icon" src={from.iconUrl} {...overlayedIconSize} />
        </div>
      )}
      {bridge?.bridgeIconUrl && (
        <div className="absolute left-[284px] md:left-[142px] top-[48px] md:top-[45px]">
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
              ? "left-[440px] md:left-[243px] top-[48px] md:top-[45px]"
              : "left-[424px] md:left-[237px] top-[40px] md:top-[42px]",
            { "opacity-30": bridge?.isLoading }
          )}
        >
          <Image alt="token icon" src={to.iconUrl} {...overlayedIconSize} />
        </div>
      )}
    </div>
  );
};
