import classNames from "classnames";
import { rgba } from "polished";
import { FunctionComponent } from "react";

import { FallbackImg } from "~/components/assets/fallback-img";
interface ChainLogoProps {
  color: string | undefined;
  logoUri: string | undefined;
  prettyName?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const getImageClasses = (size: ChainLogoProps["size"]) => {
  switch (size) {
    case "xs":
      return "h-3 w-3";
    case "sm":
      return "h-4 w-4";
    case "md":
      return "h-5 w-5";
    default:
      return "h-6 w-6";
  }
};

export const ChainLogo: FunctionComponent<ChainLogoProps> = ({
  color,
  logoUri,
  prettyName,
  size = "sm",
  className,
}) => {
  return (
    <div
      className={classNames(
        "flex items-center justify-center",
        !color && "bg-wosmongton-200/30",
        {
          xs: "h-4 w-4 rounded-sm",
          sm: "h-6 w-6 rounded-md",
          md: "h-8 w-8 rounded-lg",
          lg: "h-12 w-12 rounded-xl",
        }[size],
        className
      )}
      style={{
        background: color ? rgba(color, 0.3) : undefined,
      }}
    >
      {logoUri && (
        <FallbackImg
          className={classNames("object-contain", getImageClasses(size))}
          src={logoUri}
          alt={`${prettyName} logo`}
          fallbacksrc="/icons/question-mark.svg"
        />
      )}
    </div>
  );
};
