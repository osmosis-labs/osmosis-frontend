import { FunctionComponent } from "react";
import { truncateString } from "../utils";

export const PoolAssetsName: FunctionComponent<{
  size: "sm" | "md";
  assetDenoms?: string[];
  className?: string;
}> = ({ size, assetDenoms, className }) => {
  if (!assetDenoms) return null;

  const assetsName =
    assetDenoms.length >= 3
      ? `${assetDenoms.length} Token Pool`
      : assetDenoms
          .map((asset) =>
            asset.startsWith("ibc/") ? truncateString(asset) : asset
          )
          .join(size === "sm" ? "/" : " / ");
  return size === "sm" ? (
    <span className={className}>{assetsName}</span>
  ) : (
    <h5 className={className}>{assetsName}</h5>
  );
};
