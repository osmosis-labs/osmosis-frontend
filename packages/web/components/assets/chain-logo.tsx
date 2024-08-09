import classNames from "classnames";
import { rgba } from "polished";
import { FunctionComponent } from "react";

interface ChainLogoProps {
  color: string | undefined;
  logoUri: string | undefined;
  prettyName?: string;
  size?: "xs" | "sm" | "lg";
  className?: string;
}

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
          lg: "h-12 w-12 rounded-xl",
        }[size],
        className
      )}
      style={{
        background: color ? rgba(color, 0.3) : undefined,
      }}
    >
      {logoUri && (
        <img
          className={classNames(
            "object-contain",
            size === "xs" ? "h-3 w-3" : size === "sm" ? "h-4 w-4" : "h-8 w-8"
          )}
          src={logoUri}
          alt={`${prettyName} logo`}
        />
      )}
    </div>
  );
};
