import type { TokenOutGivenInRouter } from "@osmosis-labs/pools";
import { Chain } from "@osmosis-labs/types";
import { z } from "zod";

import { SIDECAR_BASE_URL } from "../../env";
import { routeTokenOutGivenIn } from "../complex/pools/route-token-out-given-in";
import { OsmosisSidecarRemoteRouter } from "../sidecar/router";

export const availableRoutersSchema = z.enum(["tfm", "sidecar", "legacy"]);
export type RouterKey = z.infer<typeof availableRoutersSchema>;

export function getRouters(chainList: Chain[]) {
  return [
    {
      name: "sidecar",
      router: new OsmosisSidecarRemoteRouter(
        SIDECAR_BASE_URL ?? "https://sqs.osmosis.zone"
      ),
    },
    {
      name: "legacy",
      router: {
        routeByTokenIn: async (tokenIn, tokenOutDenom, forcePoolId) =>
          (
            await routeTokenOutGivenIn({
              chainList,
              token: tokenIn,
              tokenOutDenom,
              forcePoolId,
            })
          ).quote,
      } as TokenOutGivenInRouter,
    },
  ] as {
    name: RouterKey;
    router: TokenOutGivenInRouter;
  }[];
}
