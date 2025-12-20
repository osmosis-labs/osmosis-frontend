import { Asset } from "@osmosis-labs/types";
import classNames from "classnames";
import Image, { ImageProps } from "next/image";
import { useEffect, useState } from "react";

/**
 * Component to display an image for an entity, either a chain or a token, and a fallback for it.
 */
export function EntityImage({
  ...props
}: Omit<ImageProps, "src" | "alt"> &
  Pick<Asset, "logoURIs" | "name"> &
  Partial<Pick<Asset, "symbol">> & { isChain?: boolean; denom?: string }) {
  const {
    logoURIs,
    width = 24,
    height = 24,
    name,
    symbol,
    denom,
    isChain = false,
  } = props;
  const [imgSrc, setImgSrc] = useState<string | undefined>(
    logoURIs?.svg || logoURIs?.png
  );
  const [err, setErr] = useState(false);

  // Update imgSrc when logoURIs prop changes
  useEffect(() => {
    setImgSrc(logoURIs?.svg || logoURIs?.png);
    setErr(false);
  }, [logoURIs]);

  const handleError = () => {
    // Try PNG fallback if we were showing SVG
    if (imgSrc === logoURIs?.svg && logoURIs?.png) {
      setImgSrc(logoURIs.png);
    } else {
      // No more fallbacks, show text
      setErr(true);
    }
  };

  if (!imgSrc || err) {
    return (
      <div
        className={classNames(
          "flex items-center justify-center rounded-full bg-osmoverse-alpha-700",
          {
            "rounded-lg": isChain,
          },
          props.className
        )}
        style={{
          width,
          height,
        }}
      >
        <span
          className={classNames("text-sm text-osmoverse-400", {
            "text-xxs": +width <= 20,
          })}
        >
          {isChain ? name[0] : (symbol ?? denom)?.slice(0, 3) ?? "???"}
        </span>
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={name}
      onError={handleError}
      className={classNames("object-contain", props.className)}
    />
  );
}
