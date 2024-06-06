import { CoinPretty } from "@keplr-wallet/unit";
import {
  getAsset,
  getShareDenomPoolId,
  makeGammShareCurrency,
  queryBalances,
} from "@osmosis-labs/server";
import z from "zod";

import { createTRPCRouter, publicProcedure } from "./api";

export const balancesRouter = createTRPCRouter({
  getUserBalances: publicProcedure
    .input(
      z.object({ bech32Address: z.string(), chainId: z.string().optional() })
    )
    .query(({ input, ctx }) =>
      queryBalances({
        ...input,
        ...ctx,
      }).then((res) =>
        res.balances.map(({ denom, amount }) =>
          denom.startsWith("gamm")
            ? {
                denom,
                amount,
                coin: new CoinPretty(
                  makeGammShareCurrency(getShareDenomPoolId(denom)),
                  amount
                ),
              }
            : {
                denom,
                amount,
                coin: new CoinPretty(
                  getAsset({ ...ctx, anyDenom: denom }),
                  amount
                ),
              }
        )
      )
    ),
});
