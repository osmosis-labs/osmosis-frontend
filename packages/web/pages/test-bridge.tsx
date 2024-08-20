import { NextPage } from "next";
import Image from "next/image";
import { NextSeo } from "next-seo";
import { useMount } from "react-use";

import { useTranslation } from "~/hooks";
import { useBridgeStore } from "~/hooks/bridge";

const TestBridge: NextPage = () => {
  const { t } = useTranslation();
  const bridgeAsset = useBridgeStore((state) => state.bridgeAsset);

  useMount(() => {
    bridgeAsset({
      direction: "deposit",
      anyDenom: "USDC",
    });
  });

  return (
    <div className="flex h-screen items-center justify-center gap-3 bg-osmoverse-900">
      <NextSeo
        title={t("seo.404.title")}
        description={t("seo.404.description")}
      />
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

export default TestBridge;
