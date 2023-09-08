import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { Icon } from "~/components/assets";
import { Button } from "~/components/buttons";
import LinkIconButton from "~/components/buttons/link-icon-button";
import { useFeatureFlags } from "~/hooks";

const AssetInfoPage: NextPage = () => {
  const featureFlags = useFeatureFlags();
  const router = useRouter();

  useEffect(() => {
    if (
      typeof featureFlags.tokenInfo !== "undefined" &&
      !featureFlags.tokenInfo
    ) {
      router.push("/assets");
    }
  }, [featureFlags.tokenInfo, router]);

  return (
    <div className="mx-auto flex max-w-container flex-col p-8 py-4">
      <Navigation />
    </div>
  );
};

const Navigation = () => {
  const router = useRouter();
  const denom = router.query.denom as string;

  const chain = "Osmosis";

  return (
    <nav className="flex w-full flex-wrap justify-between gap-2">
      <div className="flex items-baseline gap-3">
        <h1 className="text-h4 font-h4">{chain}</h1>
        <h2 className="text-h4 font-h4 text-osmoverse-300">
          {denom?.toUpperCase()}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <Button
          mode="unstyled"
          className="rounded-xl bg-[#201B43] px-4 py-2 font-semibold text-osmoverse-300 hover:bg-osmoverse-700 active:bg-osmoverse-800"
          aria-label="Add to watchlist"
        >
          <Icon id="star" className="text-wosmongton-300" />
          Watchlist
        </Button>
        <LinkIconButton
          href="/"
          mode="icon-social"
          size="md-icon-social"
          aria-label="View on X"
          icon={
            <Icon className="h-[16px] w-[16px] text-osmoverse-400" id="X" />
          }
        />
        <LinkIconButton
          href="/"
          mode="icon-social"
          size="md-icon-social"
          aria-label="View website"
          icon={
            <Icon className="h-[24px] w-[24px] text-osmoverse-400" id="web" />
          }
        />
        <LinkIconButton
          href="/"
          mode="icon-social"
          size="md-icon-social"
          aria-label="View on CoinGecko"
          icon={
            <Icon
              className="h-[42px] w-[42px] text-osmoverse-300"
              id="coingecko"
            />
          }
        />
      </div>
    </nav>
  );
};

export default AssetInfoPage;
