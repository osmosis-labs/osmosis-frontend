import { CoinPretty, Dec, DecUtils, PricePretty } from "@keplr-wallet/unit";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import React, { FunctionComponent, ReactNode } from "react";
import { useTranslation } from "react-multi-lang";

import { PromotedLBPPoolIds } from "../../config";
import { useStore } from "../../stores";

const BootstrapPage: NextPage = observer(() => {
  const t = useTranslation();
  return (
    <div className="h-full w-full bg-osmoverse-900">
      <NextSeo
        title={t("seo.bootstrap.title")}
        description={t("seo.bootstrap.description")}
      />
      <div className="px-5 pb-5 pt-10 md:p-10 md:pt-20">
        <div className="max-w-page mx-auto">
          <LBPOverview
            title="Liquidity Bootstrapping Pools"
            poolIds={PromotedLBPPoolIds.map((p) => p.poolId)}
          />
        </div>
      </div>
      <div className="bg-osmoverse-800 p-5 md:p-10">
        <div className="max-w-page mx-auto">
          <SynthesisList />
        </div>
      </div>
    </div>
  );
});

export const LBPOverview: FunctionComponent<{
  title: string;
  poolIds: string[];
}> = observer(({ title, poolIds }) => {
  const { chainStore, queriesStore, priceStore } = useStore();

  const queries = queriesStore.get(chainStore.osmosis.chainId).osmosis!;
  const pools = poolIds
    .map((poolId) => {
      return queries.queryPools.getPool(poolId);
    })
    .filter((pool): pool is ObservableQueryPool => pool !== undefined);

  const activePools = pools.filter((pool) => pool.smoothWeightChange != null);

  let totalPoolValue = new PricePretty(
    priceStore.getFiatCurrency("usd")!,
    new Dec(0)
  );
  for (const pool of activePools) {
    if (pool) {
      const tvl = pool.computeTotalValueLocked(priceStore);
      totalPoolValue = totalPoolValue.add(tvl);
    }
  }

  return (
    <section className="w-full">
      <div className="mb-4 flex items-center md:mb-6">
        <h4 className="leading-snug">{title}</h4>
      </div>
      <div className="md:gap-21.5 flex flex-col md:flex-row">
        <div className="md:gap-21.5 mb-2.5 flex items-center gap-10 md:mb-0">
          <OverviewLabelValue label="Active Pools">
            <h5 className="inline text-xl md:text-sm">{activePools.length}</h5>
          </OverviewLabelValue>
          <OverviewLabelValue label="Total Pools">
            <h5 className="inline text-xl md:text-sm">{poolIds.length}</h5>
          </OverviewLabelValue>
          <OverviewLabelValue label="Total Pool Value">
            <h5 className="inline text-xl md:text-sm">
              {totalPoolValue.toString()}
            </h5>
          </OverviewLabelValue>
        </div>
      </div>
    </section>
  );
});

const OverviewLabelValue: FunctionComponent<{
  label: string;
  children?: ReactNode;
}> = ({ label, children }) => {
  return (
    <div className="flex flex-col">
      <p className="mb-2.5 whitespace-nowrap text-sm text-white-mid md:mb-3 md:text-xs">
        {label}
      </p>
      {children}
    </div>
  );
};

export const SynthesisList: FunctionComponent = () => {
  return (
    <ul>
      {PromotedLBPPoolIds.map((pool) => {
        return (
          <SynthesisItem
            key={pool.poolId}
            poolId={pool.poolId}
            name={pool.name}
            baseDenom={pool.ibcHashDenom}
          />
        );
      })}
    </ul>
  );
};

const SynthesisItem: FunctionComponent<{
  poolId: string;
  name: string;
  baseDenom: string;
}> = observer(({ poolId, name, baseDenom }) => {
  const { chainStore, queriesStore, priceStore } = useStore();

  const queries = queriesStore.get(chainStore.osmosis.chainId).osmosis!;

  const pool = queries.queryPools.getPool(poolId);

  const router = useRouter();

  if (!pool || pool.smoothWeightChange == null) {
    return <React.Fragment />;
  }

  const baseCurrency = chainStore
    .getChain(chainStore.osmosis.chainId)
    .forceFindCurrency(baseDenom);

  return (
    <li
      className="md:px-7.5 w-full cursor-pointer rounded-xl border border-transparent border-opacity-40 bg-osmoverse-700 p-5 md:py-6"
      onClick={(e) => {
        e.preventDefault();

        router.push(`/pool/${poolId}`);
      }}
    >
      <section className="mb-5 flex items-center">
        <div className="mx-4 w-fit">
          <Image
            alt="image"
            src={baseCurrency?.coinImageUrl ?? "/images/bubbles.svg"}
            height={80}
            width={80}
          />
        </div>
        <div className="flex flex-col justify-between md:w-full md:md:items-center">
          <div className="mb-3 mr-2 flex flex-col md:mb-0">
            <p className="mb-2 text-sm font-semibold text-white-mid">
              {pool.smoothWeightChange.initialPoolWeights
                .map((w) => w.currency.coinDenom.toUpperCase())
                .join("/")}{" "}
              (Pool-{pool.id})
            </p>
            <h5 className="text-lg md:text-xl">{name}</h5>
          </div>
          <div className="flex flex-col">
            <p className="mb-2 text-sm font-semibold text-white-mid">
              Current Price
            </p>
            <h5 className="text-lg md:text-xl">
              {(baseCurrency
                ? priceStore
                    .calculatePrice(
                      new CoinPretty(
                        baseCurrency,
                        DecUtils.getTenExponentNInPrecisionRange(
                          baseCurrency.coinDecimals
                        )
                      )
                    )
                    ?.toString()
                : undefined) ?? "$0"}
            </h5>
          </div>
        </div>
      </section>
      <section className="flex flex-col gap-5">
        <ul className="flex items-center gap-5 md:gap-10">
          <LabelValue
            label={"Start Weight"}
            value={pool.smoothWeightChange.initialPoolWeights
              .map(
                (w) =>
                  `${w.ratio
                    .maxDecimals(2)
                    .trim(true)
                    .toString()} ${w.currency.coinDenom.toUpperCase()}`
              )
              .join(" : ")}
          />
          <LabelValue
            label={"End Weight"}
            value={pool.smoothWeightChange.targetPoolWeights
              .map(
                (w) =>
                  `${w.ratio
                    .maxDecimals(2)
                    .trim(true)
                    .toString()} ${w.currency.coinDenom.toUpperCase()}`
              )
              .join(" : ")}
          />
        </ul>
        <ul className="flex items-center gap-5 md:gap-10">
          <LabelValue
            label="Start Time"
            value={
              dayjs(pool.smoothWeightChange.startTime)
                .utc()
                .format("MMMM D, YYYY h:mm A") + " UTC"
            }
          />
          <LabelValue
            label="End Time"
            value={
              dayjs(pool.smoothWeightChange.endTime)
                .utc()
                .format("MMMM D, YYYY h:mm A") + " UTC"
            }
          />
        </ul>
      </section>
    </li>
  );
});

const LabelValue: FunctionComponent<{ label: string; value: string }> = ({
  label,
  value,
}) => {
  return (
    <li>
      <p className="font-semibold text-white-mid">{label}</p>
      <p className="mt-0.75">{value}</p>
    </li>
  );
};

export default BootstrapPage;
