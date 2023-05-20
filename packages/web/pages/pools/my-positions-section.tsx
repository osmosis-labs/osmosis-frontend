import { ObservableQueryLiquidityPositionsByAddress } from "@osmosis-labs/stores";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";

import MyPositionCard from "~/components/my-position-card";
import { useStore } from "~/stores";

const MyPositionsSection = observer(() => {
  const { accountStore, chainStore, queriesStore } = useStore();
  const { chainId } = chainStore.osmosis;
  const account = accountStore.getAccount(chainId);
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

  if (!queryAddress || !Object.keys(queryAddress.mergedPositionIds).length) {
    return null;
  }

  return (
    <div className="mx-auto flex flex-col flex-nowrap gap-5 pb-[3.75rem]">
      {/* TODO: add translation */}
      <h6 className="pl-6">Your Positions</h6>
      <div className="flex flex-col gap-3">
        {queryAddress.mergedPositionIds.map((positionIds, index) => {
          return <MyPositionCard key={index} positionIds={positionIds} />;
        })}
      </div>
    </div>
  );
});

export default MyPositionsSection;
