import { DefaultSeo, DefaultSeoProps } from "next-seo";
import { useEffect, useState } from "react";

import { useTranslation } from "~/hooks";
import spriteSVGURL from "~/public/icons/sprite.svg";

const SEO_VALUES = {
  SITE_URL: "https://osmosis.zone/",
  TWITTER_HANDLE: "@osmosiszone",
  IMAGE_PREVIEW: `${process.env.NEXT_PUBLIC_BASEPATH}/images/preview.jpg`,
  FAVICON: `${process.env.NEXT_PUBLIC_BASEPATH}/favicon.ico`,
};

const SEO: React.FC = () => {
  const { t } = useTranslation();

  const [shortcutIcon, setShortcutIcon] = useState<string>("");

  useEffect(() => {
    setShortcutIcon(
      `${window?.origin || ""}${
        process.env.NEXT_PUBLIC_BASEPATH
      }/osmosis-logo-wc.png`
    );
  }, []);

  const config: DefaultSeoProps = {
    title: t("seo.default.title"),
    description: t("seo.default.description"),
    canonical: SEO_VALUES.SITE_URL,
    additionalLinkTags: [
      {
        rel: "icon",
        href: SEO_VALUES.FAVICON,
      },
      {
        rel: "shortcut icon",
        href: shortcutIcon,
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
      title: t("seo.default.title"),
      description: t("seo.default.description"),
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
