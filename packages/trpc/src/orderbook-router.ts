import { Dec, Int } from "@keplr-wallet/unit";
import { tickToPrice } from "@osmosis-labs/math";
import {
  CursorPaginationSchema,
  getOrderbookActiveOrders,
  getOrderbookHistoricalOrders,
  getOrderbookMakerFee,
  getOrderbookPools,
  getOrderbookState,
  MappedLimitOrder,
  maybeCachePaginatedItems,
  OrderStatus,
} from "@osmosis-labs/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";
import { OsmoAddressSchema, UserOsmoAddressSchema } from "./parameter-types";

const GetInfiniteLimitOrdersInputSchema = CursorPaginationSchema.merge(
  z.object({
    userOsmoAddress: z.string().startsWith("osmo"),
  })
);

const orderStatusOrder: Record<OrderStatus, number> = {
  filled: 0,
  open: 1,
  partiallyFilled: 1,
  fullyClaimed: 2,
  cancelled: 2,
};

function defaultSortOrders(
  orderA: MappedLimitOrder,
  orderB: MappedLimitOrder
): number {
  if (orderA.status === orderB.status) {
    return orderB.placed_at - orderA.placed_at;
  }
  if (orderStatusOrder[orderA.status] < orderStatusOrder[orderB.status])
    return -1;
  if (orderStatusOrder[orderA.status] > orderStatusOrder[orderB.status])
    return 1;

  return orderB.placed_at - orderA.placed_at;
}

export const orderbookRouter = createTRPCRouter({
  getMakerFee: publicProcedure
    .input(OsmoAddressSchema.required())
    .query(async ({ input, ctx }) => {
      const { osmoAddress } = input;
      const makerFee = await getOrderbookMakerFee({
        orderbookAddress: osmoAddress,
        chainList: ctx.chainList,
      });
      return {
        makerFee,
      };
    }),
  getAllOrders: publicProcedure
    .input(
      GetInfiniteLimitOrdersInputSchema.merge(
        z.object({ contractAddresses: z.array(z.string().startsWith("osmo")) })
      )
    )
    .query(async ({ input, ctx }) => {
      return maybeCachePaginatedItems({
        getFreshItems: async () => {
          const { contractAddresses, userOsmoAddress } = input;
          if (contractAddresses.length === 0 || userOsmoAddress.length === 0)
            return [];

          const historicalOrders = await getOrderbookHistoricalOrders({
            userOsmoAddress: input.userOsmoAddress,
            assetLists: ctx.assetLists,
            chainList: ctx.chainList,
          });

          const promises = contractAddresses.map(
            async (contractOsmoAddress: string) => {
              const orders = await getOrderbookActiveOrders({
                orderbookAddress: contractOsmoAddress,
                userOsmoAddress: userOsmoAddress,
                chainList: ctx.chainList,
                assetLists: ctx.assetLists,
              });
              const historicalOrdersForContract = historicalOrders.filter(
                (o) => o.orderbookAddress === contractOsmoAddress
              );

              return [...orders, ...historicalOrdersForContract];
            }
          );
          const ordersByContracts = await Promise.all(promises);
          const allOrders = ordersByContracts.flatMap((p) => p);
          return allOrders.sort(defaultSortOrders);
        },
        cacheKey: JSON.stringify([
          "all-active-orders",
          input.contractAddresses,
          input.userOsmoAddress,
        ]),
        ttl: 500,
        cursor: input.cursor,
        limit: input.limit,
      });
    }),
  getOrderbookState: publicProcedure
    .input(OsmoAddressSchema.required())
    .query(async ({ input, ctx }) => {
      const { osmoAddress } = input;
      const orderbookState = await getOrderbookState({
        orderbookAddress: osmoAddress,
        chainList: ctx.chainList,
      });
      const askSpotPrice = tickToPrice(new Int(orderbookState.next_ask_tick));
      const bidSpotPrice = tickToPrice(new Int(orderbookState.next_bid_tick));
      return {
        ...orderbookState,
        askSpotPrice,
        bidSpotPrice,
      };
    }),
  getClaimableOrders: publicProcedure
    .input(
      z
        .object({ contractAddresses: z.array(z.string().startsWith("osmo")) })
        .required()
        .and(UserOsmoAddressSchema.required())
    )
    .query(async ({ input, ctx }) => {
      const { contractAddresses, userOsmoAddress } = input;
      const promises = contractAddresses.map(
        async (contractOsmoAddress: string) => {
          const orders = await getOrderbookActiveOrders({
            orderbookAddress: contractOsmoAddress,
            userOsmoAddress: userOsmoAddress,
            chainList: ctx.chainList,
            assetLists: ctx.assetLists,
          });

          if (orders.length === 0) return [];

          return orders.filter((o) => o.percentFilled.gte(new Dec(1)));
        }
      );
      const ordersByContracts = await Promise.all(promises);
      const allOrders = ordersByContracts.flatMap((p) => p);
      return allOrders;
    }),
  getHistoricalOrders: publicProcedure
    .input(UserOsmoAddressSchema.required())
    .query(async ({ input, ctx }) => {
      const { userOsmoAddress } = input;
      const historicalOrders = await getOrderbookHistoricalOrders({
        userOsmoAddress,
        assetLists: ctx.assetLists,
        chainList: ctx.chainList,
      });
      return historicalOrders;
    }),
  getPools: publicProcedure.query(async () => {
    const pools = await getOrderbookPools();
    return pools;
  }),
});
