import Image from "next/image";
import { useRouter } from "next/router";
import { FunctionComponent } from "react";

import { MyPoolsCardsGrid } from "~/components/complex/my-pools-card-grid";
import { MyPositionsSection } from "~/components/complex/my-positions-section";
import { Spinner } from "~/components/loaders";
import { Button } from "~/components/ui/button";
import { useTranslation } from "~/hooks";
import { api } from "~/utils/trpc";

export const UserPositionsSection: FunctionComponent<{ address?: string }> = ({
  address,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    hasPositions,
    hasPools,
    isLoading: isLoadingPositions,
  } = useUserPositionsData(address);

  if (isLoadingPositions) {
    return (
      <section className="mx-auto my-6 w-fit">
        <Spinner />
      </section>
    );
  }

  if (hasPositions || hasPools)
    return (
      <>
        {hasPositions && (
          <section>
            <span className="body2 text-osmoverse-200">
              {t("portfolio.yourSuperchargedPositions")}
            </span>
            <MyPositionsSection />
          </section>
        )}
        {hasPools && (
          <section>
            <span className="body2 text-osmoverse-200">
              {t("portfolio.yourLiquidityPools")}
            </span>
            <MyPoolsCardsGrid />
          </section>
        )}
      </>
    );

  return (
    <div className="mx-auto my-6 flex max-w-35 flex-col gap-6 text-center">
      <Image
        className="mx-auto"
        src="/images/coin-ring.svg"
        alt="no positions"
        width={240}
        height={160}
      />
      <div className="flex flex-col gap-2">
        <h6>{t("portfolio.noPositions")}</h6>
        <p className="body1 text-osmoverse-300">
          {t("portfolio.unlockPotential")}
        </p>
        <Button
          className="mx-auto flex !h-11 w-fit items-center gap-2 !rounded-full !py-1"
          onClick={() => router.push("/pools")}
        >
          <span className="subtitle1">{t("tokenInfos.explorePools")}</span>
        </Button>
      </div>
    </div>
  );
};

function useUserPositionsData(address: string | undefined) {
  const { data: positions, isLoading: isLoadingUserPositions } =
    api.local.concentratedLiquidity.getUserPositions.useQuery(
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

  const hasPositions = Boolean(positions?.length);

  const { data: allMyPoolDetails, isLoading: isLoadingMyPoolDetails } =
    api.edge.pools.getUserPools.useQuery(
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
  const hasPools = Boolean(allMyPoolDetails?.length);

  return {
    hasPositions,
    hasPools,
    isLoading: isLoadingUserPositions || isLoadingMyPoolDetails,
  };
}
