import { truncate } from "@osmosis-labs/utils";
import classNames from "classnames";
import Link from "next/link";
import { Fragment, FunctionComponent, useMemo } from "react";

interface PoolAsset {
  symbol: string;
  minDenom: string;
}

export const PoolAssetsName: FunctionComponent<{
  size?: "sm" | "md";
  assetDenoms?: PoolAsset[];
  className?: string;
  withAssetInfoLink?: boolean;
}> = ({ size = "md", assetDenoms, className, withAssetInfoLink = true }) => {
  const formatAssetName = useMemo(() => {
    return (asset: string) => {
      if (asset.startsWith("ibc/")) return truncate(asset);
      if (asset.includes("channel")) return truncate(asset.split(" ")[0], 12);
      return truncate(asset, 16);
    };
  }, []);

  if (!assetDenoms) return null;

  const assetsName =
    assetDenoms.length >= 3 ? (
      `${assetDenoms.length} Token Pool`
    ) : (
      <>
        {assetDenoms.map(({ minDenom, symbol }, index) => (
          <Fragment key={minDenom}>
            {withAssetInfoLink ? (
              <Link href={`/assets/${minDenom}`}>
                {formatAssetName(symbol)}
              </Link>
            ) : (
              formatAssetName(symbol)
            )}
            {index < assetDenoms.length - 1 && (size === "sm" ? "/" : " / ")}
          </Fragment>
        ))}
      </>
    );

  return size === "sm" ? (
    <span className={classNames("subtitle1 md:subtitle2", className)}>
      {assetsName}
    </span>
  ) : (
    <h6 className={className}>{assetsName}</h6>
  );
};
