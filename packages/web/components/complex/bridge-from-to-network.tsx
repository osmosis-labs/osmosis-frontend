import classNames from "classnames";
import Image from "next/image";

import { BridgeAnimation } from "~/components/animation/bridge";
import { CustomClasses } from "~/components/types";
import { useTranslation } from "~/hooks";
import { useWindowSize } from "~/hooks";
import { truncateString } from "~/utils/string";

interface BridgeFromToNetworkProps extends CustomClasses {
  transferPath: [
    { address: string; networkName: string; iconUrl?: string },
    { address: string; networkName: string; iconUrl?: string }
  ];
}

export const BridgeFromToNetwork = (props: BridgeFromToNetworkProps) => {
  const {
    transferPath: [from, to],
    className,
  } = props;
  const { isMobile } = useWindowSize();
  const { t } = useTranslation();

  // constants
  const overlayedIconSize = isMobile
    ? { height: 36, width: 36 }
    : { height: 45, width: 45 };

  return (
    <div
      className={classNames(
        "relative flex w-full flex-col text-osmoverse-400",
        className
      )}
    >
      <BridgeAnimation />

      <div className="flex flex-1 text-center">
        {/* From Network */}
        <div className="z-10 flex flex-1 flex-col items-center gap-4 pl-4 md:pl-8 sm:pl-0">
          <span
            className={classNames(
              "whitespace-nowrap text-osmoverse-100 transition-opacity duration-300",
              "md:subtitle2"
            )}
          >
            {t("assets.transfer.from")} {truncateString(from.networkName, 22)}
          </span>

          {from.iconUrl && (
            <div
              className="transition-opacity duration-300"
              style={overlayedIconSize}
            >
              <Image
                alt="token icon"
                src={from.iconUrl}
                {...overlayedIconSize}
              />
            </div>
          )}
        </div>

        {/* To Network */}
        <div className="z-10 flex flex-1 flex-col items-center gap-4 pr-5 text-center md:pr-8 sm:pr-0">
          <span
            className={classNames(
              "w-fit whitespace-nowrap text-osmoverse-100 transition-opacity duration-300",
              "md:subtitle2"
            )}
          >
            {t("assets.transfer.to")} {truncateString(to.networkName, 22)}
          </span>
          {to.iconUrl && (
            <div
              className="transition-opacity duration-300"
              style={overlayedIconSize}
            >
              <Image alt="token icon" src={to.iconUrl} {...overlayedIconSize} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
