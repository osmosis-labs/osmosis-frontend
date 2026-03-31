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
      const newApps = allApps.filter((app) => {
        if (app?.internal_data?.project_listing_date === undefined)
          return false;
        return (
          dayjs().diff(
            dayjs(app?.internal_data?.project_listing_date),
            "days"
          ) <= 31
        );
      });

      return {
        allApps,
        newApps,
      };
    },
  });

  return data ?? emptyResult;
}
