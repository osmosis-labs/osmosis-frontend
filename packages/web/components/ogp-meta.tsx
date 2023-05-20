import Head from "next/head";
import { FunctionComponent } from "react";

/**
 * https://ogp.me/
 *
 * Head meta tags to provide preview images and text for sharing the app on iMessage, Twitter, etc.
 * Picks a random preview image amongst a selection
 */
export const OgpMeta: FunctionComponent = () => {
  const previewText = "Trade on Osmosis Zone";

  return (
    <Head>
      <meta property="og:title" content={previewText} />
      <meta property="og:image" content="/images/preview.jpg" />
    </Head>
  );
};
