import { NextPage } from "next";
import Image from "next/image";
import { NextSeo } from "next-seo";

import { useTranslation } from "~/hooks";

const Custom404: NextPage = () => {
  const { t } = useTranslation();
  return (
    <div className="flex h-screen items-center justify-center gap-3 bg-osmoverse-900">
      <NextSeo
        title={t("seo.404.title")}
        description={t("seo.404.description")}
      />
      <Image
        src={`${process.env.NEXT_PUBLIC_BASEPATH}/icons/warning.svg`}
        alt={t("404.title")}
        height={25}
        width={25}
      />
      <h6>{t("404.title")}</h6>
    </div>
  );
};

export default Custom404;
