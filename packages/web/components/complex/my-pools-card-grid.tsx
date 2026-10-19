import { useCallback, useMemo, useRef, useState } from "react";

import { PoolCard } from "~/components/cards";
import { SectionPlaceholderCard } from "~/components/complex/section-placeholder-card";
import { SkeletonLoader } from "~/components/loaders/skeleton-loader";
import { ShowMoreButton } from "~/components/ui/button";
import { useHideDustUserSetting, useTranslation, useWindowSize } from "~/hooks";
import { useWallet } from "~/hooks/use-wallet";
import { formatPretty } from "~/utils/formatter";
import { api } from "~/utils/trpc";

export const MyPoolsCardsGrid = () => {
  const { t } = useTranslation();
  const { isMobile } = useWindowSize();
  const titleRef = useRef<HTMLHeadingElement | null>(null);

  const [showMoreMyPools, setShowMoreMyPools] = useState(false);

  const { address } = useWallet();

  const poolCountShowMoreThreshold = isMobile ? 3 : 6;
  const {
    data: allMyPoolDetails,
    isLoading: isLoadingMyPoolDetails,
    isError,
  } = api.edge.pools.getUserPools.useQuery(
    {
      userOsmoAddress: address ?? "",
    },
    {
      enabled: Boolean(address),

      // expensive query
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  // Apply the dust filter to the full user-pool list, then slice for display.
  // Empty state and the Show More button key off this filtered length so the
  // two stay consistent: a wallet holding only sub-penny LP (hide-dust on)
  // shows the empty card (not an empty grid + orphan Show More), and a wallet
  // with real pools never shows a false "no pools found".
  const dustFilteredPools = useHideDustUserSetting(
    allMyPoolDetails ?? [],
    // An unknown value is kept: hiding it as dust would look like missing funds.
    useCallback(
      (myPool) => (myPool.userValueUnknown ? undefined : myPool.userValue),
      []
    )
  );

  const visiblePools = useMemo(
    () =>
      showMoreMyPools
        ? dustFilteredPools
        : dustFilteredPools.slice(0, poolCountShowMoreThreshold),
    [dustFilteredPools, poolCountShowMoreThreshold, showMoreMyPools]
  );

  if (!address) {
    return null;
  }

  // Only surface the error card on a hard failure with no data to show. React
  // Query keeps the last good result during a failed background refetch (e.g.
  // on window refocus or a flaky network), so don't swap a populated list for
  // an error in that case.
  if (isError && !allMyPoolDetails) {
    return (
      <SectionPlaceholderCard
        heading={t("errors.uhOhSomethingWentWrong")}
        body={t("pools.errorFetchingPools")}
      />
    );
  }

  if (!isLoadingMyPoolDetails && dustFilteredPools.length === 0) {
    return (
      <SectionPlaceholderCard
        heading={t("pools.noPoolsFound")}
        body={t("pools.noPoolsFoundDescription")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid-cards mt-5 grid grid-cols-2 1.5md:grid-cols-1 md:gap-2">
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
            {visiblePools.map(
              ({
                id,
                type,
                apr,
                poolLiquidity,
                userValue,
                userValueUnknown,
                reserveCoins,
                isSuperfluid,
              }) => {
                const poolLiqudity_ = poolLiquidity
                  ? formatPretty(poolLiquidity)
                  : "–";

                const myPoolMetrics = [
                  {
                    label: t("pools.APR"),
                    value: isMobile ? (
                      (apr?.upper?.maxDecimals(0).toString() ?? "–")
                    ) : (
                      <h6>{apr?.upper?.maxDecimals(2).toString() ?? "–"}</h6>
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
                    value: userValueUnknown ? (
                      "–"
                    ) : isMobile ? (
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
                      coinMinimalDenom: coin.currency.coinMinimalDenom,
                    }))}
                    poolMetrics={myPoolMetrics}
                    isSuperfluid={isSuperfluid}
                    isSupercharged={type === "concentrated"}
                    mobileShowFirstLabel
                  />
                );
              }
            )}
          </>
        )}
      </div>
      {dustFilteredPools.length > poolCountShowMoreThreshold && (
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
};
