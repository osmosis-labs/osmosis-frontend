import { initTRPC } from "@trpc/server";

import { AssetLists } from "../../queries/__tests__/mock-asset-lists";
import { MockChains } from "../../queries/__tests__/mock-chains";
import { createInnerTRPCContext } from "../../trpc";
import { swapRouter } from "../swap-router";

const { createCallerFactory, router: createTRPCRouter } = initTRPC
  .context<typeof createInnerTRPCContext>()
  .create();
const createCaller = createCallerFactory(createTRPCRouter({ swapRouter }));
const caller = createCaller({
  assetLists: AssetLists,
  chainList: MockChains,
});

test("routeTokenOutGivenIn", async () => {
  const reply = await caller.swapRouter.routeTokenOutGivenIn({
    tokenInDenom:
      "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2", // "uatom"
    tokenInAmount: "1000000",
    tokenOutDenom: "uosmo",
    preferredRouter: "sidecar",
  });

  expect(reply).toThrowError();
});
