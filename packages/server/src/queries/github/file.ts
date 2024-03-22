import { apiClient } from "@osmosis-labs/utils";

import { GITHUB_RAW_DEFAULT_BASEURL } from "../../env";

export async function queryGithubFile<T>({
  repo,
  filePath,
  commitHash,
  baseUrl = GITHUB_RAW_DEFAULT_BASEURL,
}: {
  repo: string;
  filePath: string;
  commitHash?: string;
  baseUrl?: string;
}): Promise<T> {
  const url = new URL(
    `/${repo}/${commitHash ? commitHash : "main"}/${filePath}`,
    baseUrl
  );
  return await apiClient<T>(url.toString());
}
