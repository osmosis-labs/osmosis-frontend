import classNames from "classnames";
import { rgba } from "polished";
import React from "react";

interface ChainLogoProps {
  color: string | undefined;
  logoUri: string | undefined;
  prettyName?: string;
  size?: "sm" | "lg";
}

export const ChainLogo: React.FC<ChainLogoProps> = ({
  color,
  logoUri,
  prettyName,
  size = "sm",
}) => {
  return (
    <div
      className={classNames(
        "flex items-center justify-center",
        !color && "bg-wosmongton-200/30",
        size === "sm" ? "h-6 w-6 rounded-md" : "h-12 w-12 rounded-xl"
      )}
      style={{
        background: color ? rgba(color, 0.3) : undefined,
      }}
    >
      {logoUri && (
        <img
          className={classNames(
            "object-contain",
            size === "sm" ? "h-4 w-4" : "h-8 w-8"
          )}
          src={logoUri}
          alt={`${prettyName} logo`}
        />
      )}
    </div>
  );
};
