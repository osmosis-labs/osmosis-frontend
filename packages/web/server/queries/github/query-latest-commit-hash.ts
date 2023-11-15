import { apiClient } from "~/utils/api-client";

export async function queryLatestCommitHash({
  repo,
  branch = "main",
}: {
  repo: string;
  branch?: string;
}): Promise<string> {
  const url = `https://api.github.com/repos/${repo}/commits/${branch}`;
  const response = await apiClient<{ sha: string }>(url);
  return response.sha;
}
