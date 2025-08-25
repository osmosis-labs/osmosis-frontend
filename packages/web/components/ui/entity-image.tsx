import { Asset } from "@osmosis-labs/types";
import classNames from "classnames";
import Image, { ImageProps } from "next/image";

/**
 * Component to display an image for an entity, either a chain or a token, and a fallback for it.
 */
export function EntityImage({
  ...props
}: Omit<ImageProps, "src" | "alt"> &
  Pick<Asset, "logoURIs" | "symbol" | "name"> & { isChain?: boolean }) {
  const {
    logoURIs,
    width = 24,
    height = 24,
    name,
    symbol,
    isChain = false,
  } = props;

  if (!logoURIs.png || !logoURIs.svg) {
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
          className={classNames("text-osmoverse-400", {
            "text-xxs": +width <= 20,
          })}
        >
          {isChain ? name[0] : symbol.slice(0, 3)}
        </span>
      </div>
    );
  }

  return <Image {...props} src={logoURIs.png || logoURIs.svg} alt={name} />;
}
