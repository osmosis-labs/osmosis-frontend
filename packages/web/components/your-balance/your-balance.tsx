import { Dec, IntPretty, PricePretty } from "@keplr-wallet/unit";
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
import { formatPretty } from "~/utils/formatter";
import { api } from "~/utils/trpc";

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
        className={`${className} flex flex-col items-start gap-12 self-stretch rounded-5xl bg-osmoverse-850 p-8`}
      >
        <BalanceStats
          denom={denom}
          tokenDetailsByLanguage={tokenDetailsByLanguage}
        />
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

const BalanceStats = (props: YourBalanceProps) => {
  const { denom } = props;
  const { t } = useTranslation();
  const { chainStore, accountStore, priceStore } = useStore();
  const account = accountStore.getWallet(chainStore.osmosis.chainId);

  const fiat = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);

  const { data } = api.edge.assets.getAssetInfo.useQuery({
    findMinDenomOrSymbol: denom,
    userOsmoAddress: account?.address,
  });

  return (
    <div className="flex items-start justify-between gap-12 self-stretch 2xl:flex-col 2xl:items-stretch 2xl:gap-6">
      <div className="flex flex-col items-start gap-3">
        <h6 className="text-subtitle1 font-subtitle1 leading-6">
          {t("tokenInfos.yourBalance")}
        </h6>
        <div className="flex flex-col items-start gap-1">
          <h4 className="text-h4 font-h4 leading-9 text-osmoverse-100">
            {data?.currentPrice && data.amount && fiat
              ? formatPretty(
                  new PricePretty(fiat, data.currentPrice.mul(data.amount))
                )
              : formatPretty(new PricePretty(fiat!, new Dec(0)))}
          </h4>
          <p className="text-subtitle1 font-subtitle1 leading-6 text-osmoverse-300">
            {data?.amount ? formatPretty(data?.amount) : `0 ${denom}`}
          </p>
        </div>
      </div>
    </div>
  );
};
