import { NextPage } from "next";
import Image from "next/image";
import { NextSeo } from "next-seo";
import { useTranslation } from "react-multi-lang";

const Custom500: NextPage = () => {
  const t = useTranslation();
  return (
    <div className="flex h-screen items-center justify-center gap-3 bg-osmoverse-900">
      <NextSeo title="500 | Internal Server Error" />
      <Image
        src="/icons/error-x.svg"
        alt={t("500.title")}
        height={25}
        width={25}
      />
      <h6>{t("500.title")}</h6>
    </div>
  );
};

export default Custom500;
