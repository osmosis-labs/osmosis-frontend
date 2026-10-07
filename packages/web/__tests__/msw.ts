/* eslint-disable import/no-extraneous-dependencies */
import { superjson } from "@osmosis-labs/server";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

export const dungeonAssetListUrl =
  "https://raw.githubusercontent.com/cosmos/chain-registry/master/dungeon1/assetlist.json";

// The generated registry includes the retired dungeon1 chain without an asset
// list. Cosmos Kit falls back to this URL for every test RootStore. Supply just
// its native currency, rather than contacting GitHub or mocking all registry URLs.
export const dungeonAssetList = {
  $schema: "../assetlist.schema.json",
  chain_name: "dungeon1",
  assets: [
    {
      description: "Dungeon Chain native token (test fixture)",
      denom_units: [
        { denom: "udgn", exponent: 0 },
        { denom: "dgn", exponent: 6 },
      ],
      base: "udgn",
      name: "Dungeon",
      display: "dgn",
      symbol: "DGN",
    },
  ],
};

export const server = setupServer(
  http.get(dungeonAssetListUrl, () => HttpResponse.json(dungeonAssetList))
);

export function trpcQuery<T>(procedure: string, getData: () => T) {
  return http.get(`http://localhost:3000/trpc/${procedure}`, () =>
    HttpResponse.json({ result: { data: superjson.serialize(getData()) } })
  );
}
