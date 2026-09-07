import { queryOsmosisCMS } from "@osmosis-labs/server";
import { useQuery } from "@tanstack/react-query";

import { useFeatureFlags } from "~/hooks";
import { PositionMigrationsResponse } from "~/utils/position-migrations";

/**
 * Returns the `USDC.noble` to alloyed-`USDC` position migration map from the
 * fe-content repo, or `undefined` while it is loading, unavailable, or the
 * `positionMigration` feature flag is off.
 *
 * The map is the kill switch: an absent, empty, or unreachable list means no
 * position is offered a migration, so a fetch failure degrades to the feature
 * simply not appearing rather than to an error state.
 *
 * @see https://github.com/osmosis-labs/fe-content/blob/main/cms/position-migrations.json
 */
export const usePositionMigrations = () => {
  const { positionMigration } = useFeatureFlags();

  const { data, isLoading } = useQuery({
    queryKey: ["osmosis-position-migrations"],
    queryFn: () =>
      queryOsmosisCMS<PositionMigrationsResponse>({
        filePath: "cms/position-migrations.json",
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 5, // 5 minutes
    enabled: positionMigration,
  });

  // Ignore cached data the moment the flag flips off: react-query's `enabled`
  // stops fetching but keeps whatever it already holds.
  if (!positionMigration) return { migrations: undefined, isLoading: false };

  return {
    migrations: data?.migrations,
    priceDivergenceTiers: data?.priceDivergenceTiers,
    minAmountTolerance: data?.minAmountTolerance,
    isLoading,
  };
};
