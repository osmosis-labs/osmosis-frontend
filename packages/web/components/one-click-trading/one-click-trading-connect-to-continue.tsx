import Image from "next/image";
import React from "react";

import { useTranslation } from "~/hooks";

const OneClickTradingConnectToContinue = () => {
  const { t } = useTranslation();
  return (
    <div className="flex h-full flex-col items-center justify-center px-8">
      <Image
        alt={t("oneClickTrading.connectToContinue.altText")}
        src="/images/1ct-connect-to-continue.svg"
        width={217}
        height={80}
        className="mb-6"
      />

      <h1 className="mb-3 text-h5 font-h5">
        {t("oneClickTrading.connectToContinue.header")}
      </h1>
      <p className="text-center text-body2 font-body2 text-osmoverse-200">
        {t("oneClickTrading.connectToContinue.description")}
      </p>
    </div>
  );
};

export default OneClickTradingConnectToContinue;
