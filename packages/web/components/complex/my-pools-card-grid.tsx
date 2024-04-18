import { RatePretty } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo, useRef, useState } from "react";

import { PoolCard } from "~/components/cards";
import SkeletonLoader from "~/components/loaders/skeleton-loader";
import { ShowMoreButton } from "~/components/ui/button";
import { EventName } from "~/config";
import {
  useAmplitudeAnalytics,
  useHideDustUserSetting,
  useTranslation,
  useWindowSize,
} from "~/hooks";
import { useStore } from "~/stores";
import { formatPretty } from "~/utils/formatter";
import { api } from "~/utils/trpc";

export const MyPoolsCardsGrid = observer(() => {
  const { accountStore, chainStore } = useStore();
  const { t } = useTranslation();
  const { isMobile } = useWindowSize();
  const { logEvent } = useAmplitudeAnalytics();
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  const [showMoreMyPools, setShowMoreMyPools] = useState(false);

  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);

  const poolCountShowMoreThreshold = isMobile ? 3 : 6;
  const { data: allMyPoolDetails, isLoading: isLoadingMyPoolDetails } =
    api.edge.pools.getUserPools.useQuery(
      {
        userOsmoAddress: account?.address ?? "",
      },
      {
        enabled: Boolean(account?.address),

        // expensive query
        trpc: {
          context: {
            skipBatch: true,
          },
        },
      }
    );

  const myPoolDetails = useMemo(
    () =>
      showMoreMyPools
        ? allMyPoolDetails
        : allMyPoolDetails?.slice(0, poolCountShowMoreThreshold),
    [allMyPoolDetails, poolCountShowMoreThreshold, showMoreMyPools]
  );

  const dustFilteredPools = useHideDustUserSetting(
    myPoolDetails ?? [],
    useCallback((myPool) => myPool.userValue, [])
  );

  if (
    (!isLoadingMyPoolDetails && dustFilteredPools.length === 0) ||
    !account?.address
  ) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid-cards mt-5 grid md:gap-3">
        {isLoadingMyPoolDetails ? (
          <>
            {new Array(6).fill(undefined).map((_, i) => (
              <SkeletonLoader
                key={i}
                className="h-[226px] w-full rounded-4xl"
              />
            ))}
          </>
        ) : (
          <>
            {dustFilteredPools.map(
              ({
                id,
                type,
                apr = new RatePretty(0),
                poolLiquidity,
                userValue,
                reserveCoins,
                isSuperfluid,
              }) => {
                const poolLiqudity_ = formatPretty(poolLiquidity);

                let myPoolMetrics = [
                  {
                    label: t("pools.APR"),
                    value: isMobile ? (
                      apr.maxDecimals(0).toString()
                    ) : (
                      <h6>{apr.maxDecimals(2).toString()}</h6>
                    ),
                  },
                  {
                    label: t("pools.TVL"),
                    value: isMobile ? poolLiqudity_ : <h6>{poolLiqudity_}</h6>,
                  },
                  {
                    label:
                      type === "concentrated"
                        ? t("pools.myLiquidity")
                        : t("pools.bonded"),
                    value: isMobile ? (
                      userValue.toString()
                    ) : (
                      <h6>{formatPretty(userValue)}</h6>
                    ),
                  },
                ];

                return (
                  <PoolCard
                    key={id}
                    poolId={id}
                    poolAssets={reserveCoins.map((coin) => ({
                      coinImageUrl: coin.currency.coinImageUrl,
                      coinDenom: coin.currency.coinDenom,
                    }))}
                    poolMetrics={myPoolMetrics}
                    isSuperfluid={isSuperfluid}
                    isSupercharged={type === "concentrated"}
                    mobileShowFirstLabel
                    onClick={() =>
                      logEvent([
                        EventName.Pools.myPoolsCardClicked,
                        {
                          poolId: id,
                          poolName: reserveCoins
                            .map((coin) => coin.currency.coinDenom)
                            .join(" / "),
                          isSuperfluidPool: isSuperfluid,
                        },
                      ])
                    }
                  />
                );
              }
            )}
          </>
        )}
      </div>
      {(allMyPoolDetails?.length ?? 0) > poolCountShowMoreThreshold && (
        <div className="mx-auto">
          <ShowMoreButton
            isOn={showMoreMyPools}
            onToggle={() => {
              setShowMoreMyPools(!showMoreMyPools);
              if (showMoreMyPools) {
                titleRef.current?.scrollIntoView();
              }
            }}
          />
        </div>
      )}
    </div>
  );
});
