import { DefaultSeoProps } from "next-seo";

import { IS_FRONTIER } from "~/config/index";

const SEO_SHARED_CONFIG = {
  SITE_URL: "https://osmosis.zone/",
  SITE_TITLE: IS_FRONTIER ? "The Osmosis Frontier" : "Trade on Osmosis Zone",
  SITE_DESCRIPTION:
    "Swap, earn, and build on the leading decentralized Cosmos exchange - The largest interchain DEX",
  TWITTER_HANDLE: "@osmosiszone",
  IMAGE_PREVIEW: "/images/preview.jpg",
  FAVICON: "/favicon.ico",
};

const config: DefaultSeoProps = {
  title: SEO_SHARED_CONFIG.SITE_TITLE,
  description: SEO_SHARED_CONFIG.SITE_DESCRIPTION,
  canonical: SEO_SHARED_CONFIG.SITE_URL,
  additionalLinkTags: [
    {
      rel: "icon",
      href: SEO_SHARED_CONFIG.FAVICON,
    },
  ],
  additionalMetaTags: [
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1, maximum-scale=1",
    },
  ],
  openGraph: {
    type: "website",
    url: SEO_SHARED_CONFIG.SITE_URL,
    title: SEO_SHARED_CONFIG.SITE_TITLE,
    description: SEO_SHARED_CONFIG.SITE_DESCRIPTION,
    locale: "en_US", // TODO add i18n,
    images: [
      {
        url: SEO_SHARED_CONFIG.IMAGE_PREVIEW,
        width: 1920,
        height: 1080,
        alt: "Osmososis",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    handle: SEO_SHARED_CONFIG.TWITTER_HANDLE,
    site: SEO_SHARED_CONFIG.TWITTER_HANDLE,
    cardType: "summary_large_image",
  },
};

export default config;
