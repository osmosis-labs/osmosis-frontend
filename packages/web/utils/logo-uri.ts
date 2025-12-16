import { Asset } from "@osmosis-labs/types";

/**
 * Converts a coin image URL to logoURIs object with SVG and PNG variants.
 * @param coinImageUrl - Optional URL to a coin image (can be .svg or .png)
 * @returns LogoURIs object with svg and png properties, or empty object if no URL provided
 */
export function getLogoURIs(
  coinImageUrl?: string
): Pick<Asset["logoURIs"], "svg" | "png"> {
  if (!coinImageUrl) {
    return {};
  }

  return {
    svg: coinImageUrl.replace(/\.(png|svg)$/, ".svg"),
    png: coinImageUrl.replace(/\.(png|svg)$/, ".png"),
  };
}
