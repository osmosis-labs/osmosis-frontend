import Image from "next/image";
import { FunctionComponent, useEffect, useState } from "react";
import Lottie from "react-lottie";
import classNames from "classnames";
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

  // constants
  const overlayedIconSize = { height: 45, width: 45 };

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
    <div className={classNames("relative h-[110px]", className)}>
      <span
        className={classNames(
          "absolute transition-opacity duration-300",
          bridge ? "left-[94px] top-[10px]" : "left-[116px]",
          { "opacity-30": bridge?.isLoading }
        )}
      >
        From {from.networkName}
      </span>
      {bridge?.bridgeName && (
        <span
          className={classNames(
            "absolute top-[10px]",
            bridge?.isLoading ? "left-[250px]" : "left-[270px]",
            {
              "animate-pulse duration-700": bridge?.isLoading,
            }
          )}
        >
          {bridge?.isLoading ? "Loading" : "via"} {bridge.bridgeName}
        </span>
      )}
      <span
        className={classNames(
          "absolute transition-opacity duration-300",
          bridge ? "left-[420px] top-[10px]" : "left-[405px]",
          { "opacity-30": bridge?.isLoading }
        )}
      >
        To {to.networkName}
      </span>
      <div className="absolute left-[105px] top-[20px]">
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
            height={bridge ? 100 : 85}
            width={400}
            {...props}
            isPaused={bridge?.isLoading || props.isPaused}
          />
        </div>
        {bridge?.isLoading && (
          <div className="absolute left-[120px] -top-[26px]">
            <Lottie
              options={{
                loop: true,
                animationData: loadingAnimData,
              }}
              {...props}
            />
          </div>
        )}
      </div>
      {from.iconUrl && (
        <div
          className={classNames(
            "absolute transition-opacity duration-300",
            bridge ? "left-[123px] top-[48px]" : "left-[139px] top-[40px]",
            { "opacity-30": bridge?.isLoading }
          )}
        >
          <Image alt="token icon" src={from.iconUrl} {...overlayedIconSize} />
        </div>
      )}
      {bridge?.bridgeIconUrl && (
        <div className="absolute left-[284px] top-[48px]">
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
            bridge ? "left-[440px] top-[48px]" : "left-[424px] top-[40px]",
            { "opacity-30": bridge?.isLoading }
          )}
        >
          <Image alt="token icon" src={to.iconUrl} {...overlayedIconSize} />
        </div>
      )}
    </div>
  );
};
