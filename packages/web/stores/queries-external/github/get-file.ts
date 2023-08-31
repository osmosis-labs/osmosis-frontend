import { KVStore } from "@keplr-wallet/common";
import { HasMapStore } from "@keplr-wallet/stores";
import { ObservableQueryExternalBase } from "@osmosis-labs/stores";

const GITHUB_RAW_DEFAULT_BASEURL = "https://raw.githubusercontent.com";

export class ObservableQueryFileInner<
  T
> extends ObservableQueryExternalBase<T> {
  constructor(
    kvStore: KVStore,
    protected readonly repo: string,
    protected readonly filePath: string,
    protected readonly commitHash?: string,
    protected readonly baseUrl = GITHUB_RAW_DEFAULT_BASEURL
  ) {
    super(
      kvStore,
      baseUrl,
      `/${repo}/${commitHash ? commitHash : "main"}/${filePath}`
    );
  }

  protected canFetch(): boolean {
    return this.repo !== "" && this.filePath !== "";
  }
}

export class ObservableQueryFile extends HasMapStore<
  ObservableQueryFileInner<any>
> {
  constructor(protected readonly kvStore: KVStore) {
    super((key: string) => {
      const [repo, filePath, commitHash] = key.split(",");
      return new ObservableQueryFileInner(
        this.kvStore,
        repo,
        filePath,
        commitHash
      );
    });
  }

  getFile<T>(params: {
    /**
     * The repository from which to fetch the file.
     * It should be in the format 'owner/repo'.
     * For example, 'osmosis-labs/apps-list'.
     */
    repo: `${string}/${string}`;
    /**
     * The path of the file to fetch.
     */
    filePath: string;
    /**
     * The commit hash of the file to fetch.
     * If not provided, the latest commit will be fetched.
     */
    commitHash?: string;
  }): ObservableQueryFileInner<T> {
    return this.get(
      `${params.repo},${params.filePath},${params?.commitHash ?? ""}`
    ) as ObservableQueryFileInner<T>;
  }
}
