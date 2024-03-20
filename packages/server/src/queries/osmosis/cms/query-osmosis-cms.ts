import { FE_CONTENT_COMMIT_HASH } from "../../../env";
import { queryGithubFile } from "../../../queries/github";

export const OsmosisCmsRepo = "osmosis-labs/fe-content";

export async function queryOsmosisCMS<T>({
  commitHash = FE_CONTENT_COMMIT_HASH,
  filePath,
  repo = OsmosisCmsRepo,
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
