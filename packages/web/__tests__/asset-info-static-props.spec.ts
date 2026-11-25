import { getAsset, superjson } from "@osmosis-labs/server";
import { hydrate, QueryClient } from "@tanstack/react-query";
import { getQueryKey } from "@trpc/react-query";

import { AssetLists } from "~/config/generated/asset-lists";
import { getStaticProps } from "~/pages/assets/[...denom]";
import { api } from "~/utils/trpc";

describe("pages/assets/[...denom] getStaticProps", () => {
  it("returns notFound for an unknown denom", async () => {
    const result = await getStaticProps({
      params: { denom: ["nonexistent-denom-xyz"] },
    });

    expect(result).toEqual({ notFound: true });
  });

  it("hydrates edge.assets.getUserAsset without leaking queries across calls", async () => {
    const osmoResult = await getStaticProps({
      params: { denom: ["uosmo"] },
    });
    expect("props" in osmoResult).toBe(true);
    if (!("props" in osmoResult) || !osmoResult.props) return;

    expect(osmoResult.revalidate).toBe(7200);

    const hydrated = superjson.deserialize(
      osmoResult.props.trpcState
    ) as Parameters<typeof hydrate>[1];
    expect(hydrated?.queries).toHaveLength(1);

    const queryClient = new QueryClient();
    hydrate(queryClient, hydrated);

    const key = getQueryKey(
      api.edge.assets.getUserAsset,
      { findMinDenomOrSymbol: "uosmo" },
      "query"
    );
    expect(queryClient.getQueryData(key)).toEqual(
      getAsset({ assetLists: AssetLists, anyDenom: "uosmo" })
    );

    // A second call for another denom should contain only that denom's query.
    const secondDenom = AssetLists[0].assets.find(
      (a) => a.coinMinimalDenom !== "uosmo"
    )?.coinMinimalDenom;
    expect(secondDenom).toBeDefined();
    if (!secondDenom) return;

    const secondResult = await getStaticProps({
      params: { denom: secondDenom.split("/") },
    });
    expect("props" in secondResult).toBe(true);
    if (!("props" in secondResult) || !secondResult.props) return;

    const secondHydrated = superjson.deserialize(
      secondResult.props.trpcState
    ) as Parameters<typeof hydrate>[1];
    expect(secondHydrated?.queries).toHaveLength(1);

    const secondClient = new QueryClient();
    hydrate(secondClient, secondHydrated);
    expect(
      secondClient.getQueryData(
        getQueryKey(
          api.edge.assets.getUserAsset,
          { findMinDenomOrSymbol: secondDenom },
          "query"
        )
      )
    ).toEqual(getAsset({ assetLists: AssetLists, anyDenom: secondDenom }));
    expect(secondClient.getQueryData(key)).toBeUndefined();
  });
});
