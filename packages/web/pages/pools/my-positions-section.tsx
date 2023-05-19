import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";

import MyPositionCard, {
  PositionWithAssets,
} from "~/components/my-position-card";
import { useStore } from "~/stores";

const MyPositionsSection = observer(() => {
  const { accountStore, chainStore } = useStore();
  const { chainId } = chainStore.osmosis;
  const account = accountStore.getAccount(chainId);
  const [mergedPositions, setMergedPositions] = useState<{
    [key: string]: PositionWithAssets[];
  }>({});

  useEffect(() => {
    (async () => {
      console.log(account.bech32Address);
      if (!account.bech32Address) return;
      const resp = await fetch(
        `http://localhost:1317/osmosis/concentratedliquidity/v1beta1/positions/${account.bech32Address}`
      );
      const json: { positions: PositionWithAssets[] } = await resp.json();

      const mergedPositions: { [key: string]: PositionWithAssets[] } = {};

      json.positions?.forEach(({ asset0, asset1, position }) => {
        const { lower_tick, upper_tick, pool_id } = position;
        const key = `${pool_id}_${lower_tick}_${upper_tick}`;
        mergedPositions[key] = mergedPositions[key] || [];
        mergedPositions[key].push({ position, asset0, asset1 });
      });

      setMergedPositions(mergedPositions);
    })();
  }, [account.bech32Address]);

  if (!Object.keys(mergedPositions).length) return null;

  return (
    <div className="mx-auto flex flex-col flex-nowrap gap-5 pb-[3.75rem]">
      {/* TODO: add translation */}
      <h6 className="pl-6">Your Positions</h6>
      <div className="flex flex-col gap-3">
        {Object.keys(mergedPositions).map((key) => {
          const positions = mergedPositions[key];
          return <MyPositionCard key={key} positions={positions} />;
        })}
      </div>
    </div>
  );
});

export default MyPositionsSection;
