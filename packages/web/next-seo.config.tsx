import { DefaultSeo, DefaultSeoProps } from "next-seo";
import { useTranslation } from "react-multi-lang";

import { IS_FRONTIER } from "~/config/index";
import spriteSVGURL from "~/public/icons/sprite.svg";

const SEO: React.FC = () => {
  const t = useTranslation();

  const SEO_VALUES = {
    SITE_URL: "https://osmosis.zone/",
    SITE_TITLE: IS_FRONTIER
      ? t("seo.default.titleFrontier")
      : t("seo.default.title"),
    SITE_DESCRIPTION: t("seo.default.description"),
    TWITTER_HANDLE: "@osmosiszone",
    IMAGE_PREVIEW: "/images/preview.jpg",
    FAVICON: "/favicon.ico",
    SHORTCUT_ICON: `${
      typeof window !== "undefined" ? window.origin : ""
    }/osmosis-logo-wc.png`,
  };

  const config: DefaultSeoProps = {
    title: SEO_VALUES.SITE_TITLE,
    description: SEO_VALUES.SITE_DESCRIPTION,
    canonical: SEO_VALUES.SITE_URL,
    additionalLinkTags: [
      {
        rel: "icon",
        href: SEO_VALUES.FAVICON,
      },
      {
        rel: "shortcut icon",
        href: SEO_VALUES.SHORTCUT_ICON,
      },
      {
        rel: "preload",
        as: "image/svg+xml",
        href: spriteSVGURL,
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
      url: SEO_VALUES.SITE_URL,
      title: SEO_VALUES.SITE_TITLE,
      description: SEO_VALUES.SITE_DESCRIPTION,
      images: [
        {
          url: SEO_VALUES.IMAGE_PREVIEW,
          width: 1920,
          height: 1080,
          alt: "Osmosis",
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      handle: SEO_VALUES.TWITTER_HANDLE,
      site: SEO_VALUES.TWITTER_HANDLE,
      cardType: "summary_large_image",
    },
  };

  return <DefaultSeo {...config} />;
};

export default SEO;
