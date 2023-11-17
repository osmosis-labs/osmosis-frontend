import dayjs from "dayjs";
import { useMemo } from "react";

import {
  App,
  OsmosisAppListFilePath,
  OsmosisAppListRepoName,
} from "~/pages/apps";
import { useStore } from "~/stores";

export function useNewApps() {
  const { queriesExternalStore } = useStore();

  const currentFile = queriesExternalStore.queryGitHubFile.getFile<{
    applications: App[];
  }>({
    repo: OsmosisAppListRepoName,
    filePath: OsmosisAppListFilePath,
  });

  const newApps = useMemo(() => {
    if (currentFile.response?.data.applications === undefined) {
      return [];
    }

    return currentFile.response?.data.applications.filter((app) => {
      if (app?.internal_data?.project_listing_date === undefined) return false;
      return (
        dayjs().diff(dayjs(app?.internal_data?.project_listing_date), "days") <=
        31
      );
    });
  }, [currentFile.response?.data.applications]);

  return { newApps, allApps: currentFile.response?.data.applications ?? [] };
}
