import { observer } from "mobx-react-lite";
import Image from "next/image";
import Link from "next/link";
import { ReactElement, useMemo } from "react";
import { useTranslation } from "react-multi-lang";

import { useStore } from "~/stores";

interface YourBalanceProps {
  denom: string;
}

function YourBalance({ denom }: YourBalanceProps) {
  const { chainStore, accountStore } = useStore();
  const t = useTranslation();

  const osmosisWallet = accountStore.getWallet(chainStore.osmosis.chainId);

  const isOsmosis = useMemo(
    () => denom === chainStore.osmosis.stakeCurrency.coinDenom,
    [chainStore.osmosis.stakeCurrency.coinDenom, denom]
  );

  return (
    <div
      className={`${
        isOsmosis ? "flex" : "hidden"
      } flex flex-col items-start gap-12 self-stretch rounded-5xl bg-osmoverse-850 p-8`}
    >
      {/* <BalanceStats /> */}
      {isOsmosis && (
        <div className="flex flex-col gap-6 self-stretch">
          <h6 className="text-lg font-h6 leading-6 tracking-wide">
            {t("tokenInfos.earnWith", { denom })}
          </h6>
          <div className="flex gap-6 self-stretch md:flex-col">
            <Link
              href={
                osmosisWallet?.walletInfo?.stakeUrl ??
                "https://wallet.keplr.app/chains/osmosis?tab=staking"
              }
              passHref
            >
              <a
                target="_blank"
                className="flex flex-[0.5] flex-row justify-between rounded-[20px] bg-yourBalanceActionButton 2xl:flex-wrap 2xl:justify-center 2xl:text-center"
              >
                <ActionButton
                  title={t("menu.stake")}
                  sub={t("tokenInfos.stakeYourDenomToEarn", {
                    denom,
                    apr: "27.9",
                  })}
                  image={
                    <Image
                      src={"/images/staking-apr-full.svg"}
                      alt={`Stake image`}
                      className={`-rotate-[75deg] overflow-visible object-cover`}
                      width={224}
                      height={140}
                    />
                  }
                />
              </a>
            </Link>
            <Link href="/pools" passHref>
              <a className="flex flex-[0.5]">
                <ActionButton
                  title={t("tokenInfos.explorePools")}
                  sub={t("tokenInfos.provideLiquidity")}
                  image={
                    <Image
                      src={"/images/explore-pools.svg"}
                      alt={`Explore pools image`}
                      className={`object-cover`}
                      width={189}
                      height={126}
                    />
                  }
                  needsPadding
                />
              </a>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default observer(YourBalance);

interface ActionButtonProps {
  title: string;
  sub: string;
  image: ReactElement;
  needsPadding?: boolean;
}

function ActionButton({ title, sub, image, needsPadding }: ActionButtonProps) {
  return (
    <div
      className={`flex flex-1 flex-row justify-between rounded-[20px] bg-yourBalanceActionButton 2xl:flex-wrap 2xl:justify-center 2xl:text-center`}
    >
      <div className="flex flex-col gap-1.5 py-9 pl-10 2xl:pl-0">
        <h6 className="text-lg font-h6 leading-6 tracking-wide text-osmoverse-100">
          {title}
        </h6>
        <p className="max-w-[165px] text-sm font-body2 font-medium leading-5 tracking-[0.25px] text-osmoverse-200">
          {sub}
        </p>
      </div>
      <div className={needsPadding ? "pr-5 2xl:pr-0" : ""}>{image}</div>
    </div>
  );
}

/* function BalanceStats() {
  const t = useTranslation();

  return (
    <div className="flex items-start justify-between gap-12 self-stretch 2xl:flex-col 2xl:items-stretch 2xl:gap-6">
      <div className="flex flex-col items-start gap-3">
        <h6 className="text-lg font-h6 leading-6">
          {t("tokenInfos.yourBalance")}
        </h6>
        <div className="flex flex-col items-start gap-1">
          <h4 className="text-2xl font-h4 leading-9 text-osmoverse-100">
            $52,967.23
          </h4>
          <p className="text-base font-subtitle1 leading-6 text-osmoverse-300">
            104,941 OSMO
          </p>
        </div>
      </div>
      <div className="mr-10 flex flex-1 flex-wrap items-start justify-between gap-12 2xl:mr-0 2xl:grid 2xl:grid-cols-tokenStats md:gap-8 1.5xs:flex-col">
        <div className="flex flex-grow flex-col gap-2">
          <p className="text-base font-subtitle1 leading-6 tracking-wide">
            {t("tokenInfos.pastDaysReturns")}
          </p>
          <div className="flex items-center gap-1">
            <RightArrowIcon
              classes={{
                container: "text-bullish-500 -rotate-45",
              }}
            />
            <h5 className="text-xl font-h5 leading-8 tracking-[0.18px] text-bullish-500">
              $184,17
            </h5>
          </div>
        </div>
        <div className="flex flex-grow flex-col gap-2">
          <p className="text-base font-subtitle1 leading-6 tracking-wide">
            {t("tokenInfos.allTimeReturns")}
          </p>
          <div className="flex items-center gap-1">
            <RightArrowIcon
              classes={{
                container: "text-error rotate-45",
              }}
            />
            <h5 className="text-xl font-h5 leading-8 tracking-[0.18px] text-error">
              $4,829.10
            </h5>
          </div>
        </div>
        <div className="flex flex-grow flex-col gap-2">
          <p className="text-base font-subtitle1 leading-6 tracking-wide">
            {t("tokenInfos.averagePrice")}
          </p>
          <h5 className="text-xl font-h5 leading-8 tracking-[0.18px]">$1.36</h5>
        </div>
        <div className="flex flex-grow flex-col gap-2">
          <p className="text-base font-subtitle1 leading-6 tracking-wide">
            Portfolio %
          </p>
          <h5 className="text-xl font-h5 leading-8 tracking-[0.18px]">
            51.28%
          </h5>
        </div>
      </div>
    </div>
  );
} */
