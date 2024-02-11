import { Dec, RatePretty } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import { useCallback, useState } from "react";

import { ShowMoreButton } from "~/components/buttons/show-more";
import { PoolCard } from "~/components/cards";
import SkeletonLoader from "~/components/loaders/skeleton-loader";
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

export const MyPoolsSection = observer(() => {
  const { accountStore, chainStore } = useStore();
  const { t } = useTranslation();
  const { isMobile } = useWindowSize();
  const { logEvent } = useAmplitudeAnalytics();

  // Mobile only - pools (superfluid) pools sorting/filtering
  const [showMoreMyPools, setShowMoreMyPools] = useState(false);

  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);

  const poolCountShowMoreThreshold = isMobile ? 3 : 6;
  const { data: myPoolDetails, isLoading: isLoadingMyPoolDetails } =
    api.edge.pools.getUserPools.useQuery(
      {
        userOsmoAddress: account?.address ?? "",
      },
      {
        enabled: Boolean(account?.address),
        select: (data) => data.slice(0, poolCountShowMoreThreshold),
      }
    );

  const dustFilteredPools = useHideDustUserSetting(
    myPoolDetails ?? [],
    useCallback((myPool) => myPool.userValue, [])
  );

  if (!isLoadingMyPoolDetails && dustFilteredPools.length === 0) return null;

  return (
    <div className="pb-[3.75rem]">
      <h5 className="md:px-3">{t("pools.myPools")}</h5>
      <div className="flex flex-col gap-4">
        <div className="grid-cards mt-5 grid md:gap-3">
          {isLoadingMyPoolDetails ? (
            <>
              {new Array(6).fill(undefined).map((_, i) => (
                <SkeletonLoader
                  key={i}
                  className="h-[226px] w-[341px] rounded-4xl"
                />
              ))}
            </>
          ) : (
            <>
              {dustFilteredPools.map(
                ({
                  id,
                  type,
                  apr = new RatePretty(new Dec(0)),
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
                      value: isMobile ? (
                        poolLiqudity_
                      ) : (
                        <h6>{poolLiqudity_}</h6>
                      ),
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
                            // poolWeight: queryPool.weightedPoolInfo?.assets
                            //   .map((poolAsset) =>
                            //     poolAsset.weightFraction?.toString()
                            //   )
                            //   .join(" / "),
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
        {isMobile &&
          (myPoolDetails?.length ?? 0) > poolCountShowMoreThreshold && (
            <div className="mx-auto">
              <ShowMoreButton
                isOn={showMoreMyPools}
                onToggle={() => setShowMoreMyPools(!showMoreMyPools)}
              />
            </div>
          )}
      </div>
    </div>
  );
});
