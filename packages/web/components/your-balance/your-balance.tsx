import { IntPretty } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import Link from "next/link";
import { ReactElement, useMemo } from "react";

import { EventName } from "~/config";
import { ChainList } from "~/config/generated/chain-list";
import {
  useAmplitudeAnalytics,
  useCurrentLanguage,
  useTranslation,
} from "~/hooks";
import { TokenCMSData } from "~/server/queries/external";
import { useStore } from "~/stores";

interface YourBalanceProps {
  denom: string;
  tokenDetailsByLanguage?: {
    [key: string]: TokenCMSData;
  } | null;
  className?: string;
}

const YourBalance = observer(
  ({ denom, tokenDetailsByLanguage, className }: YourBalanceProps) => {
    const { queriesStore } = useStore();
    const { t } = useTranslation();
    const language = useCurrentLanguage();

    const chain = useMemo(
      () =>
        ChainList.find((chain) =>
          chain.keplrChain.currencies.find(
            (currency) => currency.coinDenom === denom.toUpperCase()
          )
        ),
      [denom]
    );

    const inflationApr = chain
      ? queriesStore.get(chain.chain_id).cosmos.queryInflation.inflation
      : new IntPretty(0);

    const details = useMemo(() => {
      return tokenDetailsByLanguage
        ? tokenDetailsByLanguage[language]
        : undefined;
    }, [language, tokenDetailsByLanguage]);

    const { logEvent } = useAmplitudeAnalytics();

    return (
      <section
        className={`${
          details?.stakingURL ? "flex" : "hidden"
        } ${className} flex flex-col items-start gap-12 self-stretch rounded-5xl bg-osmoverse-850 p-8`}
      >
        {/* <BalanceStats /> */}
        {details?.stakingURL && (
          <div className="flex flex-col gap-6 self-stretch">
            <header>
              <h6 className="text-lg font-h6 leading-6 tracking-wide">
                {t("tokenInfos.earnWith", { denom })}
              </h6>
            </header>
            <div className="flex gap-6 self-stretch 1.5md:flex-col md:flex-row sm:flex-col">
              <Link
                href={details?.stakingURL}
                target="_blank"
                className="flex flex-[0.5]"
                passHref
                onClick={() =>
                  logEvent([
                    EventName.TokenInfo.cardClicked,
                    { tokenName: denom, title: "Stake" },
                  ])
                }
              >
                <ActionButton
                  title={t("menu.stake")}
                  sub={
                    inflationApr.toDec().isZero()
                      ? t("tokenInfos.stakeYourDenomToEarnNoAPR", { denom })
                      : t("tokenInfos.stakeYourDenomToEarn", {
                          denom,
                          apr: inflationApr.maxDecimals(1).toString(),
                        })
                  }
                  image={
                    <Image
                      src={"/images/staking-apr-full.svg"}
                      alt={`Stake image`}
                      className={`-rotate-[75deg] overflow-visible object-cover 2xl:object-contain`}
                      width={224}
                      height={140}
                    />
                  }
                />
              </Link>
              <Link
                href="/pools"
                passHref
                className="flex flex-[0.5]"
                onClick={() =>
                  logEvent([
                    EventName.TokenInfo.cardClicked,
                    { tokenName: denom, title: "Explore Pools" },
                  ])
                }
              >
                <ActionButton
                  title={t("tokenInfos.explorePools")}
                  sub={t("tokenInfos.provideLiquidity")}
                  image={
                    <Image
                      src={"/images/explore-pools.svg"}
                      alt={`Explore pools image`}
                      className={`overflow-visible object-cover 2xl:object-contain`}
                      width={189}
                      height={126}
                    />
                  }
                  needsPadding
                />
              </Link>
            </div>
          </div>
        )}
      </section>
    );
  }
);

export default YourBalance;

interface ActionButtonProps {
  title: string;
  sub: string;
  image: ReactElement;
  needsPadding?: boolean;
}

const ActionButton = ({
  title,
  sub,
  image,
  needsPadding,
}: ActionButtonProps) => {
  return (
    <div
      className={`relative flex flex-1 flex-row justify-between overflow-hidden rounded-[20px] bg-yourBalanceActionButton 2xl:items-center 2xl:pl-10 xs:pl-6`}
    >
      <div className="relative z-10 flex flex-col gap-1.5 py-9 pl-10 2xl:pl-0">
        <h6 className="text-lg font-h6 leading-6 tracking-wide text-osmoverse-100">
          {title}
        </h6>
        <p className="max-w-[165px] text-sm font-body2 font-medium leading-5 tracking-[0.25px] text-osmoverse-200">
          {sub}
        </p>
      </div>
      <div
        className={`z-0 flex h-full overflow-hidden 2xl:absolute 2xl:bottom-0 2xl:right-0 2xl:translate-x-20 2xl:translate-y-6 ${
          needsPadding ? "mt-auto pr-5 2xl:pr-0" : ""
        }`}
      >
        {image}
      </div>
    </div>
  );
};

/* const BalanceStats = () => {
  const { t } = useTranslation();

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
