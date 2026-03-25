import { Asset } from "@osmosis-labs/types";
import classNames from "classnames";
import Image, { ImageProps } from "next/image";
import { useEffect, useState } from "react";

/**
 * Component to display an image for an entity, either a chain or a token, and a fallback for it.
 */
export function EntityImage({
  logoURIs,
  width = 24,
  height = 24,
  name,
  symbol,
  denom,
  isChain = false,
  circular = false,
  logoUsesFullBounds = false,
  ...imageProps
}: Omit<ImageProps, "src" | "alt"> &
  Pick<Asset, "logoURIs" | "name"> &
  Partial<Pick<Asset, "symbol">> & {
    isChain?: boolean;
    denom?: string;
    /**
     * When true, wraps the image in a circle. For logos whose content extends to
     * the edges of the image (logoUsesFullBounds), the clip is omitted so corner
     * content is not cut off.
     */
    circular?: boolean;
    /**
     * When true, skips the overflow-hidden circular clip even in circular mode.
     * Sourced from the asset's logoUsesFullBounds field in osmosis-labs/assetlists.
     */
    logoUsesFullBounds?: boolean;
  }) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(
    logoURIs?.svg || logoURIs?.png
  );
  const [err, setErr] = useState(false);

  // Update imgSrc when logoURIs prop changes
  useEffect(() => {
    setImgSrc(logoURIs?.svg || logoURIs?.png);
    setErr(false);
  }, [logoURIs?.png, logoURIs?.svg]);

  const handleError = () => {
    // Try PNG fallback if we were showing SVG
    if (imgSrc === logoURIs?.svg && logoURIs?.png) {
      setImgSrc(logoURIs.png);
    } else {
      // No more fallbacks, show text
      setErr(true);
    }
  };

  if (circular) {
    return (
      <div
        className={classNames(
          "flex items-center justify-center rounded-full bg-osmoverse-alpha-700",
          !logoUsesFullBounds && "overflow-hidden"
        )}
        style={{ width, height }}
      >
        {!imgSrc || err ? (
          <span
            className={classNames("text-sm text-osmoverse-400", {
              "text-xxs": +width <= 20,
            })}
          >
            {isChain ? name[0] : (symbol ?? denom)?.slice(0, 3) ?? "???"}
          </span>
        ) : (
          <Image
            {...imageProps}
            width={width}
            height={height}
            src={imgSrc}
            alt={name}
            onError={handleError}
            className="object-contain"
          />
        )}
      </div>
    );
  }

  if (!imgSrc || err) {
    return (
      <div
        className={classNames(
          "flex items-center justify-center rounded-full bg-osmoverse-alpha-700",
          {
            "rounded-lg": isChain,
          },
          imageProps.className
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
      {...imageProps}
      width={width}
      height={height}
      src={imgSrc}
      alt={name}
      onError={handleError}
      className={classNames("object-contain", imageProps.className)}
    />
  );
}
