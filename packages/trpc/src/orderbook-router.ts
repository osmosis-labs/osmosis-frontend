import { tickToPrice } from "@osmosis-labs/math";
import {
  CursorPaginationSchema,
  getOrderbookActiveOrders,
  getOrderbookActiveOrdersSQS,
  getOrderbookHistoricalOrders,
  getOrderbookMakerFee,
  getOrderbookPools,
  getOrderbookState,
  MappedLimitOrder,
  maybeCachePaginatedItems,
  OrderStatus,
} from "@osmosis-labs/server";
import { Dec, Int } from "@osmosis-labs/unit";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";
import { OsmoAddressSchema, UserOsmoAddressSchema } from "./parameter-types";

const GetInfiniteLimitOrdersInputSchema = CursorPaginationSchema.merge(
  UserOsmoAddressSchema.required()
).merge(
  z.object({
    filter: z.enum(["open", "filled", "historical", "active"]).optional(),
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
    .input(GetInfiniteLimitOrdersInputSchema)
    .query(async ({ input, ctx }) => {
      return maybeCachePaginatedItems({
        getFreshItems: async () => {
          const { userOsmoAddress } = input;
          const pools = await getOrderbookPools();
          const activePools = pools.filter((p) => parseInt(p.poolId) < 2065);
          const contractAddresses = activePools.map((p) => p.contractAddress);

          if (contractAddresses.length === 0 || userOsmoAddress.length === 0)
            return [];
          const promises = contractAddresses.map(
            async (contractOsmoAddress: string) => {
              const { baseDenom, quoteDenom } = pools.find(
                (p) => p.contractAddress === contractOsmoAddress
              )!;

              const quoteAsset = getAssetFromAssetList({
                coinMinimalDenom: quoteDenom,
                assetLists: ctx.assetLists,
              });
              const baseAsset = getAssetFromAssetList({
                coinMinimalDenom: baseDenom,
                assetLists: ctx.assetLists,
              });
              const orders = await getOrderbookActiveOrders({
                orderbookAddress: contractOsmoAddress,
                userOsmoAddress: userOsmoAddress,
                chainList: ctx.chainList,
                baseAsset,
                quoteAsset,
              });
              return orders;
            }
          );
          promises.push(
            getOrderbookHistoricalOrders({
              userOsmoAddress: input.userOsmoAddress,
              assetLists: ctx.assetLists,
              chainList: ctx.chainList,
            })
          );

          const ordersByContracts = await Promise.all(promises);
          const allOrders = ordersByContracts.flat();

          return allOrders.sort(defaultSortOrders);
        },
        cacheKey: `all-active-orders-${input.userOsmoAddress}`,
        ttl: 15000,
        cursor: input.cursor,
        limit: input.limit,
      });
    }),
  getAllOrdersSQS: publicProcedure
    .input(GetInfiniteLimitOrdersInputSchema)
    .query(async ({ input, ctx }) => {
      return maybeCachePaginatedItems({
        getFreshItems: async () => {
          const { userOsmoAddress, filter } = input;

          const shouldFetchActive =
            !filter ||
            filter === "open" ||
            filter === "filled" ||
            filter === "active";
          const shouldFetchHistorical = !filter || filter === "historical";
          const promises: Promise<MappedLimitOrder[]>[] = [];
          if (shouldFetchActive) {
            promises.push(
              getOrderbookActiveOrdersSQS({
                userOsmoAddress,
                assetList: ctx.assetLists,
              })
            );
          }
          if (shouldFetchHistorical) {
            promises.push(
              getOrderbookHistoricalOrders({
                userOsmoAddress,
                assetLists: ctx.assetLists,
                chainList: ctx.chainList,
              })
            );
          }
          const orders = await Promise.all(promises);
          const allOrders = orders.flat().sort(defaultSortOrders);
          if (filter === "filled") {
            return allOrders.filter((o) => o.status === "filled");
          }
          return allOrders;
        },
        cacheKey: `all-active-orders-sqs-${input.userOsmoAddress}`,
        ttl: 10000,
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
    .input(UserOsmoAddressSchema.required())
    .query(async ({ input, ctx }) => {
      const { userOsmoAddress } = input;
      const pools = await getOrderbookPools();
      const contractAddresses = pools.map((p) => p.contractAddress);

      if (contractAddresses.length === 0 || userOsmoAddress.length === 0)
        return [];

      const promises = contractAddresses.map(
        async (contractOsmoAddress: string) => {
          const { baseDenom, quoteDenom } = pools.find(
            (p) => p.contractAddress === contractOsmoAddress
          )!;

          const quoteAsset = getAssetFromAssetList({
            coinMinimalDenom: quoteDenom,
            assetLists: ctx.assetLists,
          });
          const baseAsset = getAssetFromAssetList({
            coinMinimalDenom: baseDenom,
            assetLists: ctx.assetLists,
          });
          const orders = await getOrderbookActiveOrders({
            orderbookAddress: contractOsmoAddress,
            userOsmoAddress: userOsmoAddress,
            chainList: ctx.chainList,
            baseAsset,
            quoteAsset,
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
