import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState } from "react";

import { MyPositionCard } from "~/components/cards";
import SkeletonLoader from "~/components/loaders/skeleton-loader";
import { ShowMoreButton } from "~/components/ui/button";
import { useWalletSelect } from "~/hooks";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

const INITIAL_POSITION_CNT = 3;

/** List of position cards for a user. Optionally show positions only for a give pool ID via `forPoolId` prop. */
export const MyPositionsSection: FunctionComponent<{ forPoolId?: string }> =
  observer(({ forPoolId }) => {
    const { accountStore, chainStore } = useStore();
    const { chainId } = chainStore.osmosis;
    const account = accountStore.getWallet(chainId);
    const { isLoading: isWalletLoading } = useWalletSelect();
    const [viewMore, setViewMore] = useState(false);

    const { data: positions, isLoading } =
      api.local.concentratedLiquidity.getUserPositions.useQuery(
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
    if (!isLoading && positions && !positions.length) return null;

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
