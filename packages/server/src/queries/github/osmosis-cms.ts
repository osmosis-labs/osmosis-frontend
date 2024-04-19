import { FE_CONTENT_COMMIT_HASH } from "../../env";
import { queryGithubFile } from ".";

export async function queryOsmosisCMS<T>({
  commitHash = FE_CONTENT_COMMIT_HASH,
  filePath,
  repo = "osmosis-labs/fe-content",
}: {
  repo?: string;
  filePath: string;
  commitHash?: string;
}): Promise<T> {
  return await queryGithubFile<T>({
    filePath,
    repo,
    commitHash,
  });
}
