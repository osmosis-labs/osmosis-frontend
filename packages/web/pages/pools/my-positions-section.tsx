import { Int } from "@keplr-wallet/unit";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-multi-lang";

import { ShowMoreButton } from "~/components/buttons/show-more";
import { MyPositionCard } from "~/components/cards";
import { useStore } from "~/stores";
import { ObservableMergedPositionByAddress } from "~/stores/derived-data";

const MyPositionsSection = observer(() => {
  const t = useTranslation();
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

  const len = Object.keys(queryAddress.mergedRanges).length;

  if (!len) return null;

  return (
    <div className="mx-auto flex flex-col flex-nowrap gap-5 pb-[3.75rem]">
      <h6 className="pl-6">{t("clPositions.yourPositions")}</h6>
      <div className="flex flex-col gap-3">
        {(viewMore
          ? queryAddress.mergedRanges
          : queryAddress.mergedRanges.slice(0, 3)
        ).map((mergedId, index) => {
          const [poolId, lowerTick, upperTick] = mergedId.split("_");
          const merge = queryAddress?.calculateMergedPosition(
            poolId,
            lowerTick,
            upperTick
          );

          if (!merge) return null;

          const { positionIds, baseAmount, quoteAmount, passive } = merge;
          return (
            <MyPositionCard
              key={index}
              poolId={poolId}
              lowerTick={new Int(lowerTick)}
              upperTick={new Int(upperTick)}
              positionIds={positionIds}
              baseAmount={baseAmount}
              quoteAmount={quoteAmount}
              passive={passive}
            />
          );
        })}
      </div>
      {len > 3 && !viewMore && (
        <ShowMoreButton
          isOn={viewMore}
          onToggle={() => setViewMore((v) => !v)}
        />
      )}
    </div>
  );
});

export default MyPositionsSection;
