import Head from "next/head";

const SEO_CONFIG = {
  SITE_URL: "https://osmosis.zone/",
  SITE_DESCRIPTION:
    "Swap, earn, and build on the leading decentralized Cosmos exchange - The largest interchain DEX",
  TWITTER_HANDLE: "@osmosiszone",
  IMAGE_PREVIEW:
    "https://uploads-ssl.webflow.com/623a0c9828949e55356286f9/63901363f1ad117475ea565e_osmosis%20logo.svg",
  FAVICON: "/favicon.ico",
};

interface SEOProps {
  title: string;
  imagePreview?: string;
}

const SEO = ({ title, imagePreview = SEO_CONFIG.IMAGE_PREVIEW }: SEOProps) => {
  return (
    <Head>
      {/* Meta Info */}
      <title>{title}</title>
      <meta charSet="utf-8" />
      <link rel="canonical" href={SEO_CONFIG.SITE_URL} />
      <link rel="icon" href={SEO_CONFIG.FAVICON} />
      <meta
        name="description"
        content={SEO_CONFIG.SITE_DESCRIPTION}
        key="description"
      />
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" key="twcard" />
      <meta name="twitter:title" content={title} key="twtitle" />
      <meta
        name="twitter:description"
        content={SEO_CONFIG.SITE_DESCRIPTION}
        key="twdesc"
      ></meta>
      <meta
        name="twitter:creator"
        content={SEO_CONFIG.TWITTER_HANDLE}
        key="twhandle"
      />
      {/* Open Graph */}
      <meta property="og:title" content={title} key="ogtitle" />
      <meta
        property="og:site_name"
        content={SEO_CONFIG.SITE_URL}
        key="ogsitename"
      />
      <meta property="og:url" content={SEO_CONFIG.SITE_URL} key="ogurl" />
      <meta
        property="og:description"
        content={SEO_CONFIG.SITE_URL}
        key="ogdesc"
      />
      <meta property="og:image" content={imagePreview} key="ogimage" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1"
      />
    </Head>
  );
};

export default SEO;
