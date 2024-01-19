import { apiClient } from "@osmosis-labs/utils";

export async function queryLatestCommitHash({
  repo,
  branch = "main",
  githubToken,
}: {
  repo: string;
  branch?: string;
  githubToken?: string;
}): Promise<string> {
  const url = `https://api.github.com/repos/${repo}/commits/${branch}`;
  const response = await apiClient<{ sha: string }>(url, {
    headers: githubToken
      ? { Authorization: `Bearer ${githubToken}` }
      : undefined,
  });
  return response.sha;
}
