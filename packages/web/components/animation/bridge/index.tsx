import dynamic from "next/dynamic";
import Image from "next/image";
import { FunctionComponent, useEffect, useState } from "react";
import classNames from "classnames";
import { CustomClasses, LoadingProps } from "../../types";
import { Animation as AnimationProps } from "../types";

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

  // constants
  const overlayedIconSize = { height: 45, width: 45 };

  // dynamic load JSON animation data - keep base bundle small
  const [animData, setAnimData] = useState<object | null>(null);
  useEffect(() => {
    const loadData = async () => {
      const data = bridge
        ? await import("./lottie-bridge.json")
        : await import("./lottie-ibc.json");
      setAnimData(data);
    };

    if (!animData) {
      loadData();
    }
  }, [animData, bridge]);

  return (
    <div className={classNames("relative h-[110px]", className)}>
      <span
        className={classNames(
          "absolute",
          bridge ? "left-[94px] top-[10px]" : "left-[116px]"
        )}
      >
        From {from.networkName}
      </span>
      {bridge?.bridgeName && (
        <span className="absolute left-[270px] top-[10px]">
          via {bridge.bridgeName}
        </span>
      )}
      <span
        className={classNames(
          "absolute",
          bridge ? "left-[420px] top-[10px]" : "left-[400px]"
        )}
      >
        To {to.networkName}
      </span>
      <div className="absolute left-[105px] top-[20px]">
        <Lottie
          options={{
            loop: true,
            animationData: animData,
          }}
          height={bridge ? 100 : 85}
          width={400}
          {...props}
        />
      </div>
      {from.iconUrl && (
        <div
          className={classNames(
            "absolute",
            bridge ? "left-[123px] top-[48px]" : "left-[139px] top-[40px]"
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
            "absolute",
            bridge ? "left-[440px] top-[48px]" : "left-[424px] top-[40px]"
          )}
        >
          <Image alt="token icon" src={to.iconUrl} {...overlayedIconSize} />
        </div>
      )}
    </div>
  );
};
