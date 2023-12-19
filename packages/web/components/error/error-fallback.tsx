import Image from "next/image";

import { useTranslation } from "~/hooks";

const ErrorFallback = () => {
  const { t } = useTranslation();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6 p-8 pt-4 text-center">
      <div className="flex gap-2">
        <Image
          src={`${process.env.NEXT_PUBLIC_BASEPATH}/icons/error-x.svg`}
          alt={t("500.title")}
          height={25}
          width={25}
        />
        <p className="text-lg font-bold">{t("errors.fallbackText1")}</p>
      </div>
      <p>
        {t("errors.fallbackText2")}{" "}
        <a
          href="https://bugs.osmosis.zone"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          {t("errors.fallbackBugReport")}
        </a>{" "}
        {t("errors.fallbackText3")}{" "}
        <a
          href="https://support.osmosis.zone"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          {t("errors.fallbackSupport")}
        </a>
      </p>
    </div>
  );
};

export default ErrorFallback;
