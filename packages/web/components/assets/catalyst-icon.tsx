import Image from "next/image";
import { FunctionComponent } from "react";
import classNames from "classnames";
import { CustomClasses, LoadingProps, MobileProps } from "../types";
import { generateRandom } from "../utils";

export const CatalystIcon: FunctionComponent<
  {
    size?: "sm" | "md";
    gradientKey?: number;
  } & CustomClasses &
    LoadingProps &
    MobileProps
> = ({ size = "md", gradientKey, className, isLoading, isMobile }) => (
  <div
    className={classNames(
      "relative flex shrink-0 items-center justify-center rounded-full",
      {
        "h-20 w-20": size === "md" && !isMobile,
        "h-16 w-16": size === "sm" && !isMobile,
        "h-14 w-14": isMobile,
        "border border-enabledGold": !isLoading,
      },
      className
    )}
  >
    <div
      className={classNames("h-[90%] w-[90%] rounded-full", {
        "bg-loading-bar": isLoading,
      })}
      style={
        !isLoading
          ? { backgroundImage: generateRandom(gradientKey) }
          : undefined
      }
    >
      {!isLoading && (
        <div className="absolute inset-5 md:inset-4">
          <Image alt="" src="/images/bubbles.svg" height={45} width={45} />
        </div>
      )}
    </div>
  </div>
);
