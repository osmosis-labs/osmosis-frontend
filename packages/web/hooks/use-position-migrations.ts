import { queryOsmosisCMS } from "@osmosis-labs/server";
import { useQuery } from "@tanstack/react-query";

import { useFeatureFlags } from "~/hooks";
import {
  PositionMigrationsResponse,
  validatePositionMigrationsResponse,
} from "~/utils/position-migrations";

/** The fe-content file the migration map lives in; also read fresh at
 * confirm time by the revalidation path. */
export const POSITION_MIGRATIONS_FILE_PATH = "cms/position-migrations.json";

/**
 * Returns the `USDC.noble` to alloyed-`USDC` position migration map from the
 * fe-content repo, or `undefined` while it is loading, unavailable, or the
 * `positionMigration` feature flag is off.
 *
 * The map is the kill switch: an absent, empty, or unreachable list means no
 * position is offered a migration, so a fetch failure degrades to the feature
 * simply not appearing rather than to an error state. It is polled rather
 * than only fetched on focus, so pulling an entry reaches sessions that
 * already have the page open within a minute. The response is validated
 * before anything trusts it - the file deploys live from `main`, and a
 * malformed edit must fail closed instead of weakening the safety gates.
 *
 * @see https://github.com/osmosis-labs/fe-content/blob/main/cms/position-migrations.json
 */
export const usePositionMigrations = () => {
  const { positionMigration } = useFeatureFlags();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["osmosis-position-migrations"],
    queryFn: () =>
      queryOsmosisCMS<PositionMigrationsResponse>({
        filePath: POSITION_MIGRATIONS_FILE_PATH,
      }),
    refetchInterval: 1000 * 60, // the kill-switch propagation bound
    staleTime: 1000 * 60,
    cacheTime: 1000 * 60 * 5, // 5 minutes
    enabled: positionMigration,
  });

  // Ignore cached data the moment the flag flips off or the map becomes
  // unreachable: react-query keeps stale data through both, and the map is
  // the kill switch, so it must fail closed rather than serve from cache.
  if (!positionMigration || isError)
    return { migrations: undefined, isLoading: false };

  const validated = validatePositionMigrationsResponse(data);

  return {
    migrations: validated?.migrations,
    priceDivergenceTiers: validated?.priceDivergenceTiers,
    minAmountTolerance: validated?.minAmountTolerance,
    isLoading,
  };
};
