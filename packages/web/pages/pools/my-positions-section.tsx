import { ObservableQueryLiquidityPositionsByAddress } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";

import MyPositionCard from "~/components/my-position-card";
import { useStore } from "~/stores";

const MyPositionsSection = observer(() => {
  const { accountStore, chainStore, queriesStore } = useStore();
  const { chainId } = chainStore.osmosis;
  const account = accountStore.getAccount(chainId);
  const [viewMore, setViewMore] = useState(false);
  const [queryAddress, setQueryAddress] =
    useState<ObservableQueryLiquidityPositionsByAddress | null>(null);

  useEffect(() => {
    (async () => {
      if (!account.bech32Address) return;

      setQueryAddress(
        await queriesStore
          .get(chainId)
          .osmosis!.queryLiquidityPositions.getForAddress(account.bech32Address)
      );
    })();
  }, [account.bech32Address]);

  const onViewMore = useCallback(() => {
    setViewMore(true);
  }, []);

  if (!queryAddress) {
    return null;
  }

  const len = Object.keys(queryAddress.mergedPositionIds).length;

  if (!len) return null;

  return (
    <div className="mx-auto flex flex-col flex-nowrap gap-5 pb-[3.75rem]">
      {/* TODO: add translation */}
      <h6 className="pl-6">Your Positions</h6>
      <div className="flex flex-col gap-3">
        {(viewMore
          ? queryAddress.mergedPositionIds
          : queryAddress.mergedPositionIds.slice(0, 3)
        ).map((positionIds, index) => {
          return <MyPositionCard key={index} positionIds={positionIds} />;
        })}
      </div>
      {len > 3 && !viewMore && (
        <div
          className="inline-flex cursor-pointer flex-col items-center justify-center"
          onClick={onViewMore}
        >
          {/* TODO use translation */}
          <div className="text-subtitle1 font-subtitle1 text-wosmongton-200">
            View all
          </div>
          <Image src="/icons/caret-down.svg" alt="" width={16} height={16} />
        </div>
      )}
    </div>
  );
});

export default MyPositionsSection;
