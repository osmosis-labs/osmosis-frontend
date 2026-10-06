import { superjson } from "@osmosis-labs/server";
import { makeIndexedKVStore } from "@osmosis-labs/stores";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import {
  persistQueryClientRestore,
  persistQueryClientSave,
} from "@tanstack/react-query-persist-client";

import { PERSIST_BUSTER, shouldPersistQuery } from "~/utils/trpc-persist";

/** The persister utils/trpc.ts builds: IndexedDB KV store + superjson. */
function makePersister(name: string) {
  const storage = makeIndexedKVStore(name);
  return createAsyncStoragePersister({
    storage: {
      getItem: async (key) =>
        ((await storage.get(key)) as string | undefined) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.set(key, undefined),
    },
    serialize: (client) => superjson.stringify(client),
    deserialize: (cachedString) => superjson.parse(cachedString),
    throttleTime: 0,
  });
}

function save(
  queryClient: QueryClient,
  persister: ReturnType<typeof makePersister>,
  buster = PERSIST_BUSTER
) {
  return persistQueryClientSave({
    queryClient,
    persister,
    buster,
    dehydrateOptions: { shouldDehydrateQuery: shouldPersistQuery },
  });
}

async function restore(persister: ReturnType<typeof makePersister>) {
  const queryClient = new QueryClient();
  await persistQueryClientRestore({
    queryClient,
    persister,
    buster: PERSIST_BUSTER,
  });
  return queryClient;
}

const ASSET_KEY = [["edge", "assets", "getUserAsset"]];
const QUOTE_KEY = [["edge", "quoteRouter", "routeTokenOutGivenIn"]];

describe("persisted query cache", () => {
  it("restores a cache saved while a query was in flight", async () => {
    const persister = makePersister("persist-spec-in-flight");
    const source = new QueryClient();
    source.setQueryData(ASSET_KEY, { denom: "uosmo" });
    // Never resolves: stays pending, as a query does when the tab closes.
    void source.prefetchQuery({
      queryKey: QUOTE_KEY,
      queryFn: () => new Promise(() => {}),
    });
    await save(source, persister);

    const target = await restore(persister);
    expect(target.getQueryData(ASSET_KEY)).toEqual({ denom: "uosmo" });
    expect(target.getQueryState(QUOTE_KEY)).toBeUndefined();
    // A failed restore removes the stored cache; this one must survive.
    expect(await persister.restoreClient()).toBeDefined();
  });

  it("does not persist excluded procedures", async () => {
    const persister = makePersister("persist-spec-excluded");
    const source = new QueryClient();
    source.setQueryData([["bridgeTransfer", "getDepositAddress"]], {
      depositAddress: "addr",
    });
    await save(source, persister);

    const target = await restore(persister);
    expect(
      target.getQueryData([["bridgeTransfer", "getDepositAddress"]])
    ).toBeUndefined();
  });

  it("does not persist errored queries", async () => {
    const persister = makePersister("persist-spec-errored");
    const source = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    await source.prefetchQuery({
      queryKey: [["edge", "assets", "getAssetPrice"]],
      queryFn: () => Promise.reject(new Error("down")),
    });
    await save(source, persister);

    const target = await restore(persister);
    expect(
      target.getQueryState([["edge", "assets", "getAssetPrice"]])
    ).toBeUndefined();
  });

  it("drops a cache saved under an older buster", async () => {
    const persister = makePersister("persist-spec-buster");
    const source = new QueryClient();
    source.setQueryData(ASSET_KEY, { denom: "uosmo" });
    await save(source, persister, "v3");

    const target = await restore(persister);
    expect(target.getQueryData(ASSET_KEY)).toBeUndefined();
    expect(await persister.restoreClient()).toBeUndefined();
  });
});
