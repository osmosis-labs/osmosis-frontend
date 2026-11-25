import { superjson } from "@osmosis-labs/server";
import { createCallerFactory } from "@osmosis-labs/trpc";
import { hydrate, QueryClient } from "@tanstack/react-query";

import { AssetLists } from "~/config/generated/asset-lists";
import { ChainList } from "~/config/generated/chain-list";
import { getStaticProps } from "~/pages/assets/[...denom]";
import { edgeRouter } from "~/server/api/edge-router";

const ATOM_IBC_DENOM =
  "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2";

const edgeCaller = createCallerFactory(edgeRouter)({
  assetLists: AssetLists,
  chainList: ChainList,
});

function expectedQueryKey(findMinDenomOrSymbol: string) {
  return [
    ["edge", "assets", "getUserAsset"],
    { input: { findMinDenomOrSymbol }, type: "query" },
  ] as const;
}

describe("pages/assets/[...denom] getStaticProps", () => {
  it("returns notFound for an unknown denom", async () => {
    const result = await getStaticProps({
      params: { denom: ["nonexistent-denom-xyz"] },
    });

    expect(result).toEqual({ notFound: true });
  });

  it("matches edge.assets.getUserAsset and isolates cache across calls", async () => {
    const osmoResult = await getStaticProps({
      params: { denom: ["uosmo"] },
    });
    if (!("props" in osmoResult) || !osmoResult.props) {
      throw new Error("Expected props for uosmo");
    }

    expect(osmoResult.revalidate).toBe(7200);

    const hydrated = superjson.deserialize(
      osmoResult.props.trpcState
    ) as Parameters<typeof hydrate>[1];
    expect(hydrated?.queries).toHaveLength(1);

    const queryClient = new QueryClient();
    hydrate(queryClient, hydrated);

    const osmoKey = expectedQueryKey("uosmo");
    const expectedOsmo = await edgeCaller.assets.getUserAsset({
      findMinDenomOrSymbol: "uosmo",
    });
    expect(queryClient.getQueryData(osmoKey)).toEqual(expectedOsmo);

    // A second call for a multi-segment IBC denom should match the real
    // procedure and contain only that denom's query.
    const atomResult = await getStaticProps({
      params: { denom: ATOM_IBC_DENOM.split("/") },
    });
    if (!("props" in atomResult) || !atomResult.props) {
      throw new Error(`Expected props for ${ATOM_IBC_DENOM}`);
    }

    const atomHydrated = superjson.deserialize(
      atomResult.props.trpcState
    ) as Parameters<typeof hydrate>[1];
    expect(atomHydrated?.queries).toHaveLength(1);

    const atomClient = new QueryClient();
    hydrate(atomClient, atomHydrated);
    const expectedAtom = await edgeCaller.assets.getUserAsset({
      findMinDenomOrSymbol: ATOM_IBC_DENOM,
    });
    expect(atomClient.getQueryData(expectedQueryKey(ATOM_IBC_DENOM))).toEqual(
      expectedAtom
    );
    expect(atomClient.getQueryData(osmoKey)).toBeUndefined();
  });
});
