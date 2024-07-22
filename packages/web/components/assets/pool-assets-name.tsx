import { truncateString } from "@osmosis-labs/utils";
import classNames from "classnames";
import Link from "next/link";
import { Fragment, FunctionComponent } from "react";

export const PoolAssetsName: FunctionComponent<{
  size?: "sm" | "md";
  assetDenoms?: string[];
  className?: string;
}> = ({ size = "md", assetDenoms, className }) => {
  if (!assetDenoms) return null;

  const assetsName =
    assetDenoms.length >= 3 ? (
      `${assetDenoms.length} Token Pool`
    ) : (
      <>
        {assetDenoms.map((asset, index) => (
          <Fragment key={asset}>
            <Link href={`/assets/${asset}`}>
              {asset.startsWith("ibc/")
                ? truncateString(asset)
                : asset.includes("channel")
                ? truncateString(asset.split(" ")[0], 12)
                : truncateString(asset, 16)}
            </Link>
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
