import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useEffect, useState } from "react";

import { ShowMoreButton } from "~/components/buttons/show-more";
import { MyPositionCard } from "~/components/cards";
import { useStore } from "~/stores";
import { ObservableMergedPositionByAddress } from "~/stores/derived-data";

const INITIAL_POSITION_CNT = 3;

export const MyPositionsSection: FunctionComponent<{ forPoolId?: string }> =
  observer(({ forPoolId }) => {
    const { accountStore, chainStore, derivedDataStore } = useStore();
    const { chainId } = chainStore.osmosis;
    const account = accountStore.getAccount(chainId);
    const [viewMore, setViewMore] = useState(false);
    const [queryAddress, setQueryAddress] =
      useState<ObservableMergedPositionByAddress | null>(null);

    useEffect(() => {
      (async () => {
        if (!account.bech32Address) return;

        setQueryAddress(
          derivedDataStore.mergedPositionsByAddress.get(account.bech32Address)
        );
      })();
    }, [account.bech32Address]);

    if (!queryAddress) {
      return null;
    }

    const filteredRanges = queryAddress.mergedRanges.filter((rangeKey) => {
      const [poolId] = rangeKey.split("_");

      if (forPoolId && forPoolId !== poolId) {
        return false;
      }

      return true;
    });

    const visiblePositions = viewMore
      ? filteredRanges
      : filteredRanges.slice(0, INITIAL_POSITION_CNT);
    const mergedPositions = visiblePositions
      .map((rangeKey) => {
        const [poolId, lowerTick, upperTick] = rangeKey.split("_");
        return queryAddress.calculateMergedPosition(
          poolId,
          lowerTick,
          upperTick
        );
      })
      .filter(
        (
          range
        ): range is ReturnType<typeof queryAddress.calculateMergedPosition> =>
          range !== undefined
      );

    console.log("mergedPositions", mergedPositions);

    return (
      <div className="flex flex-col gap-3">
        {mergedPositions.map((position, index) => {
          if (!position) return null;

          const {
            poolId,
            positionIds,
            baseAmount,
            quoteAmount,
            passive,
            lowerTick,
            upperTick,
          } = position;

          return (
            <MyPositionCard
              key={index}
              poolId={poolId}
              lowerTick={lowerTick}
              upperTick={upperTick}
              positionIds={positionIds}
              baseAmount={baseAmount}
              quoteAmount={quoteAmount}
              passive={passive}
            />
          );
        })}
        {mergedPositions.length >= INITIAL_POSITION_CNT && !viewMore && (
          <ShowMoreButton
            className="mx-auto"
            isOn={viewMore}
            onToggle={() => setViewMore((v) => !v)}
          />
        )}
      </div>
    );
  });
