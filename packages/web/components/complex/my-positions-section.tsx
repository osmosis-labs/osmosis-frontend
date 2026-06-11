import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState } from "react";

import { MyPositionCard } from "~/components/cards";
import { SectionPlaceholderCard } from "~/components/complex/section-placeholder-card";
import { SkeletonLoader } from "~/components/loaders/skeleton-loader";
import { ShowMoreButton } from "~/components/ui/button";
import { useTranslation, useWalletSelect } from "~/hooks";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

const INITIAL_POSITION_CNT = 3;

/** List of position cards for a user. Optionally show positions only for a give pool ID via `forPoolId` prop. */
export const MyPositionsSection: FunctionComponent<{
  forPoolId?: string;
  showRoi?: boolean;
  showSelectedRange?: boolean;
}> = observer(({ forPoolId, showRoi = true, showSelectedRange = true }) => {
  const { accountStore, chainStore } = useStore();
  const { t } = useTranslation();
  const { chainId } = chainStore.osmosis;
  const account = accountStore.getWallet(chainId);
  const { isLoading: isWalletLoading } = useWalletSelect();
  const [viewMore, setViewMore] = useState(false);

  const {
    data: positions,
    isLoading,
    isError,
  } = api.local.concentratedLiquidity.getUserPositions.useQuery(
    {
      userOsmoAddress: account?.address ?? "",
      forPoolId,
    },
    {
      enabled: Boolean(account?.address) && !isWalletLoading,

      // expensive query
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const visiblePositions = (positions ?? []).slice(
    0,
    viewMore ? undefined : INITIAL_POSITION_CNT
  );

  if (!account?.address) return null;

  // Per-pool callers (pool detail page) render their own surrounding context;
  // showing a global empty/error card there would imply the user has no
  // positions anywhere, which is misleading. Fall back to null in that case.
  //
  // The error branches only fire on a hard failure with no data: React Query
  // keeps the last good result during a failed background refetch (refocus,
  // flaky network), so a populated list isn't swapped for an error.
  if (forPoolId) {
    if (isError && !positions) return null;
    if (!isLoading && positions && !positions.length) return null;
  } else {
    if (isError && !positions) {
      return (
        <SectionPlaceholderCard
          className="my-2"
          heading={t("errors.uhOhSomethingWentWrong")}
          body={t("clPositions.errorFetchingPositions")}
          bodyClassName="whitespace-pre-line"
        />
      );
    }

    if (!isLoading && positions && !positions.length) {
      return (
        <SectionPlaceholderCard
          className="my-2"
          heading={t("clPositions.noPositions")}
          body={t("clPositions.noPositionsDescription")}
        />
      );
    }
  }

  return (
    <div className="my-5 flex flex-col gap-3">
      {isLoading ? (
        <>
          <SkeletonLoader className="h-[102px] w-full rounded-[20px]" />
          <SkeletonLoader className="h-[102px] w-full rounded-[20px]" />
          <SkeletonLoader className="h-[102px] w-full rounded-[20px]" />
        </>
      ) : (
        <>
          {visiblePositions.map((position) => (
            <MyPositionCard
              key={position.id}
              position={position}
              showLinkToPool={!Boolean(forPoolId)}
              showRoi={showRoi}
              showSelectedRange={showSelectedRange}
            />
          ))}
          {positions &&
            visiblePositions.length > 0 &&
            positions.length > INITIAL_POSITION_CNT && (
              <ShowMoreButton
                className="mx-auto"
                isOn={viewMore}
                onToggle={() => setViewMore((v) => !v)}
              />
            )}
        </>
      )}
    </div>
  );
});
