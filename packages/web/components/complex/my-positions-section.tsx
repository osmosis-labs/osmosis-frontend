import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState } from "react";

import { ShowMoreButton } from "~/components/buttons/show-more";
import { MyPositionCard } from "~/components/cards";
import { useStore } from "~/stores";

const INITIAL_POSITION_CNT = 3;

/** List of position cards for a user. Optionally show positions only for a give pool ID via `forPoolId` prop. */
export const MyPositionsSection: FunctionComponent<{ forPoolId?: string }> =
  observer(({ forPoolId }) => {
    const { accountStore, chainStore, queriesStore } = useStore();
    const { chainId } = chainStore.osmosis;
    const account = accountStore.getWallet(chainId);
    const osmosisQueries = queriesStore.get(chainId).osmosis!;
    const [viewMore, setViewMore] = useState(false);

    // positions filtered by pool ID if forPoolId is given
    const positions = osmosisQueries.queryAccountsPositions
      .get(account?.address ?? "")
      .positions.filter((position) => {
        if (Boolean(forPoolId) && position.poolId !== forPoolId) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (b.joinTime && a.joinTime) {
          return b.joinTime.getTime() - a.joinTime.getTime();
        }
        return 0;
      });

    const visiblePositions = positions.slice(
      0,
      viewMore ? undefined : INITIAL_POSITION_CNT
    );

    return (
      <div className="flex flex-col gap-3">
        {visiblePositions.map((position) => (
          <MyPositionCard
            key={position.id}
            position={position}
            showLinkToPool
          />
        ))}
        {visiblePositions.length > 0 &&
          positions.length > INITIAL_POSITION_CNT && (
            <ShowMoreButton
              className="mx-auto"
              isOn={viewMore}
              onToggle={() => setViewMore((v) => !v)}
            />
          )}
      </div>
    );
  });
