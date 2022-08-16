import classNames from "classnames";
import dynamic from "next/dynamic";
import Image from "next/image";
import { FunctionComponent, useEffect, useState } from "react";
import { CustomClasses, LoadingProps } from "../../types";

const Lottie = dynamic(() => import("react-lottie"), { ssr: false });

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
  } & CustomClasses
> = ({ transferPath: [from, bridge, to], className }) => {
  // constants
  const overlayedIconSize = { height: 45, width: 45 };

  // dynamic load JSON animation data - keep base bundle small
  const [animData, setAnimData] = useState<object | null>(null);
  useEffect(() => {
    const loadData = async () => {
      const data = (await import("./lottie-bridge.json")) as object;
      setAnimData(data);
    };

    if (!animData) {
      loadData();
    }
  }, []);

  return (
    <div className={classNames("relative h-[110px]", className)}>
      <span className="absolute left-[94px] top-[10px]">
        From {from.networkName}
      </span>
      {bridge?.bridgeName && (
        <span className="absolute left-[270px] top-[10px]">
          via {bridge.bridgeName}
        </span>
      )}
      <span className="absolute left-[420px] top-[10px]">
        To {to.networkName}
      </span>
      <div className="absolute left-[105px] top-[20px]">
        <Lottie
          options={{
            loop: true,
            animationData: animData,
          }}
          height={100}
          width={400}
          isPaused={false}
          isStopped={false}
        />
      </div>
      {from.iconUrl && (
        <div className="absolute left-[127px] top-[48px]">
          <Image alt="token icon" src={from.iconUrl} {...overlayedIconSize} />
        </div>
      )}
      {bridge?.bridgeIconUrl && (
        <div className="absolute left-[286px] top-[48px]">
          <Image
            alt="token icon"
            src={bridge?.bridgeIconUrl}
            {...overlayedIconSize}
          />
        </div>
      )}
      {to.iconUrl && (
        <div className="absolute left-[440px] top-[48px]">
          <Image alt="token icon" src={to.iconUrl} {...overlayedIconSize} />
        </div>
      )}
    </div>
  );
};
