import dayjs from "dayjs";

import { api } from "~/utils/trpc";

const NEW_APPS_STALE_TIME_MS = 1000 * 60 * 60;
const emptyResult = {
  allApps: [],
  newApps: [],
};

export function useNewApps() {
  const { data } = api.local.cms.getAppStore.useQuery(undefined, {
    staleTime: NEW_APPS_STALE_TIME_MS,
    retry: false,
    select: ({ applications }) => {
      const allApps = applications ?? [];
      // Count apps as "new" from the start of the cutoff day through today.
      const start = dayjs().subtract(31, "days").startOf("day");
      const now = dayjs().endOf("day");
      const newApps = allApps.filter((app) => {
        const projectListingDate = app?.internal_data?.project_listing_date;
        if (projectListingDate === undefined) {
          return false;
        }

        const listingDate = dayjs(projectListingDate);

        // Ignore malformed CMS dates and dates scheduled for the future.
        if (!listingDate.isValid()) {
          return false;
        }

        return !listingDate.isBefore(start) && !listingDate.isAfter(now);
      });

      return {
        allApps,
        newApps,
      };
    },
  });

  return data ?? emptyResult;
}
