import { FE_CONTENT_COMMIT_HASH, OsmosisCmsRepo } from "~/config";
import { queryGithubFile } from "~/server/queries/github";

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
