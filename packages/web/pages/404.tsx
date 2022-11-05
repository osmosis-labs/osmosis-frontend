import Image from "next/image";
import { NextPage } from "next";
import { useTranslation } from "react-multi-lang";

const Custom404: NextPage = () => {
  const t = useTranslation();
  return (
    <div className="bg-osmoverse-900 flex gap-3 justify-center items-center h-screen">
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
