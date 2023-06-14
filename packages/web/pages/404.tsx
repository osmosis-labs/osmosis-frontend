import { NextPage } from "next";
import Image from "next/image";
import { useTranslation } from "react-multi-lang";

import SEO from "~/components/seo/seo";

const Custom404: NextPage = () => {
  const t = useTranslation();
  return (
    <div className="flex h-screen items-center justify-center gap-3 bg-osmoverse-900">
      <SEO title="404 | Error" />
      <Image
        src="/icons/warning.svg"
        alt={t("404.title")}
        height={25}
        width={25}
      />
      <h6>{t("404.title")}</h6>
    </div>
  );
};

export default Custom404;
