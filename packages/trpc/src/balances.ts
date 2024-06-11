import { CoinPretty } from "@keplr-wallet/unit";
import {
  captureIfError,
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
        res.balances.map(({ denom, amount }) => {
          if (denom.startsWith("gamm")) {
            return {
              denom,
              amount,
              coin: new CoinPretty(
                makeGammShareCurrency(getShareDenomPoolId(denom)),
                amount
              ),
            };
          } else {
            const asset = captureIfError(() =>
              getAsset({ ...ctx, anyDenom: denom })
            );

            return {
              denom,
              amount,
              coin: asset ? new CoinPretty(asset, amount) : undefined,
            };
          }
        })
      )
    ),
});
