/**
 * Integration test example for the swapRouter
 */
import { CreateContextOptions } from "../../trpc";
import { swapRouter } from "../swap-router";

test("routeTokenOutGivenIn", async () => {
  const opts: CreateContextOptions = {
    assetLists: [],
    chainList: [],
  };

  const reply = await swapRouter.routeTokenOutGivenIn({
    ctx: opts,
    rawInput: {
      tokenInDenom: "uatom",
      tokenInAmount: "1000000",
      tokenOutDenom: "uosmo",
      preferredRouter: "sidecar",
    },
    path: "routeTokenOutGivenIn",
    type: "query",
  });

  expect(reply).toThrowError();
});
