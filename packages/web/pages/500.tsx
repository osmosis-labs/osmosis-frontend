import { NextPage } from "next";
import Image from "next/image";
import { NextSeo } from "next-seo";

import { useTranslation } from "~/hooks";

const Custom500: NextPage = () => {
  const { t } = useTranslation();
  return (
    <div className="flex h-screen items-center justify-center gap-3 bg-osmoverse-900">
      <NextSeo
        title={t("seo.500.title")}
        description={t("seo.500.description")}
      />
      <Image
        src="/icons/error-x.svg"
        alt={t("seo.500.title")}
        height={25}
        width={25}
      />
      <h6>{t("seo.500.title")}</h6>
    </div>
  );
};

export default Custom500;
