import { superjson } from "@osmosis-labs/server";
import { dehydrate, hydrate, QueryClient } from "@tanstack/react-query";

import { shouldPersistQuery } from "~/utils/trpc-persist";

/** Persist a client the way the app does: dehydrate, then superjson. */
function persistAndRestore(source: QueryClient) {
  const stored = superjson.stringify(
    dehydrate(source, { shouldDehydrateQuery: shouldPersistQuery })
  );
  const target = new QueryClient();
  hydrate(target, superjson.parse(stored));
  return target;
}

describe("shouldPersistQuery", () => {
  it("restores a cache that had an in-flight query when it was persisted", () => {
    const source = new QueryClient();
    source.setQueryData([["edge", "assets", "getUserAsset"]], { denom: "a" });
    // Never resolves: stays pending, as a query does when the tab closes.
    void source.prefetchQuery({
      queryKey: [["edge", "quoteRouter", "routeTokenOutGivenIn"]],
      queryFn: () => new Promise(() => {}),
    });

    let target: QueryClient | undefined;
    expect(() => {
      target = persistAndRestore(source);
    }).not.toThrow();

    expect(target!.getQueryData([["edge", "assets", "getUserAsset"]])).toEqual({
      denom: "a",
    });
    expect(
      target!.getQueryState([["edge", "quoteRouter", "routeTokenOutGivenIn"]])
    ).toBeUndefined();
  });

  it("does not persist excluded procedures", () => {
    const source = new QueryClient();
    source.setQueryData([["bridgeTransfer", "getDepositAddress"]], {
      depositAddress: "addr",
    });

    const target = persistAndRestore(source);
    expect(
      target.getQueryData([["bridgeTransfer", "getDepositAddress"]])
    ).toBeUndefined();
  });

  it("does not persist errored queries", async () => {
    const source = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    await source.prefetchQuery({
      queryKey: [["edge", "assets", "getAssetPrice"]],
      queryFn: () => Promise.reject(new Error("down")),
    });

    const target = persistAndRestore(source);
    expect(
      target.getQueryState([["edge", "assets", "getAssetPrice"]])
    ).toBeUndefined();
  });
});
