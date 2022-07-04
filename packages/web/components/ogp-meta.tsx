import Head from "next/head";
import { FunctionComponent } from "react";
import { IS_FRONTIER } from "../config";

/**
 * https://ogp.me/
 *
 * Head meta tags to provide preview images and text for sharing the app on iMessage, Twitter, etc.
 * Picks a random preview image amongst a selection
 */
export const OgpMeta: FunctionComponent = () => {
  const origin =
    typeof window === "undefined"
      ? IS_FRONTIER
        ? "https://frontier.osmosis.zone"
        : "https://app.osmosis.zone"
      : window.origin;

  const previewText = IS_FRONTIER
    ? "The Osmosis Frontier"
    : "Trade on Osmosis Zone";

  const previewImages = IS_FRONTIER
    ? [origin + "/images/osmosis-cowboy-woz.png"]
    : [
        origin + "/images/osmosis-home-bg-low.png",
        origin + "/images/osmosis-liquidity-lab.png",
      ];

  return (
    <Head>
      <meta property="og:title" content={previewText} />
      <meta
        property="og:image"
        content={
          previewImages[Math.floor(Math.random() * previewImages.length)]
        }
      />
    </Head>
  );
};
