import { Dec, Int } from "@keplr-wallet/unit";
import { tickToPrice } from "@osmosis-labs/math";
import {
  CursorPaginationSchema,
  getOrderbookActiveOrders,
  getOrderbookDenoms,
  getOrderbookHistoricalOrders,
  getOrderbookMakerFee,
  getOrderbookPools,
  getOrderbookState,
  getOrderbookTickState,
  getOrderbookTickUnrealizedCancels,
  HistoricalLimitOrder,
  LimitOrder,
  maybeCachePaginatedItems,
} from "@osmosis-labs/server";
import { dayjs } from "@osmosis-labs/server/build/utils/dayjs";
import { Chain } from "@osmosis-labs/types";
import { getAssetFromAssetList } from "@osmosis-labs/utils";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";
import { OsmoAddressSchema, UserOsmoAddressSchema } from "./parameter-types";

const GetInfiniteLimitOrdersInputSchema = CursorPaginationSchema.merge(
  z.object({
    userOsmoAddress: z.string().startsWith("osmo"),
  })
);

export type OrderStatus =
  | "open"
  | "partiallyFilled"
  | "filled"
  | "fullyClaimed"
  | "cancelled";

export type MappedLimitOrder = Omit<
  LimitOrder,
  "quantity" | "placed_quantity" | "placed_at"
> & {
  quantity: number;
  placed_quantity: number;
  percentClaimed: Dec;
  totalFilled: number;
  percentFilled: Dec;
  orderbookAddress: string;
  price: Dec;
  status: OrderStatus;
  output: Dec;
  quoteAsset: ReturnType<typeof getAssetFromAssetList>;
  baseAsset: ReturnType<typeof getAssetFromAssetList>;
  placed_at: number;
};

function mapOrderStatus(order: LimitOrder, percentFilled: Dec): OrderStatus {
  const quantInt = parseInt(order.quantity);
  if (quantInt === 0 || percentFilled.equals(new Dec(1))) return "filled";
  if (percentFilled.isZero()) return "open";
  if (percentFilled.lt(new Dec(1))) return "partiallyFilled";

  return "open";
}

function defaultSortOrders(
  orderA: MappedLimitOrder,
  orderB: MappedLimitOrder
): number {
  if (orderA.status === orderB.status) {
    return orderB.placed_at - orderA.placed_at;
  }
  if (orderA.status === "filled") return -1;
  if (orderB.status === "filled") return 1;
  return orderB.placed_at - orderA.placed_at;
}

async function getTickInfoAndTransformOrders(
  orderbookAddress: string,
  orders: LimitOrder[],
  chainList: Chain[],
  quoteAsset: ReturnType<typeof getAssetFromAssetList>,
  baseAsset: ReturnType<typeof getAssetFromAssetList>
): Promise<MappedLimitOrder[]> {
  const tickIds = [...new Set(orders.map((o) => o.tick_id))];
  const tickStates = await getOrderbookTickState({
    orderbookAddress,
    chainList,
    tickIds,
  });
  const unrealizedTickCancels = await getOrderbookTickUnrealizedCancels({
    orderbookAddress,
    chainList,
    tickIds,
  });

  const fullTickState = tickStates.map(({ tick_id, tick_state }) => ({
    tickId: tick_id,
    tickState: tick_state,
    unrealizedCancels: unrealizedTickCancels.find((c) => c.tick_id === tick_id),
  }));

  return orders.map((o) => {
    const { tickState, unrealizedCancels } = fullTickState.find(
      ({ tickId }) => tickId === o.tick_id
    ) ?? { tickState: undefined, unrealizedCancels: undefined };

    const quantity = parseInt(o.quantity);
    const placedQuantity = parseInt(o.placed_quantity);

    const percentClaimed = new Dec(
      (placedQuantity - quantity) / placedQuantity
    );
    const [tickEtas, tickUnrealizedCancelled] =
      o.order_direction === "bid"
        ? [
            parseInt(
              tickState?.bid_values.effective_total_amount_swapped ?? "0"
            ),
            parseInt(
              unrealizedCancels?.unrealized_cancels.bid_unrealized_cancels ??
                "0"
            ),
          ]
        : [
            parseInt(
              tickState?.ask_values.effective_total_amount_swapped ?? "0"
            ),
            parseInt(
              unrealizedCancels?.unrealized_cancels.ask_unrealized_cancels ??
                "0"
            ),
          ];
    const tickTotalEtas = tickEtas + tickUnrealizedCancelled;
    const totalFilled = Math.max(
      tickTotalEtas - (parseInt(o.etas) - (placedQuantity - quantity)),
      0
    );
    const percentFilled = new Dec(Math.min(totalFilled / placedQuantity, 1));
    const price = tickToPrice(new Int(o.tick_id));
    const status = mapOrderStatus(o, percentFilled);
    const output =
      o.order_direction === "bid"
        ? new Dec(placedQuantity).quo(price)
        : new Dec(placedQuantity).mul(price);
    return {
      ...o,
      price,
      quantity,
      placed_quantity: placedQuantity,
      percentClaimed,
      totalFilled,
      percentFilled,
      orderbookAddress,
      status,
      output,
      quoteAsset,
      baseAsset,
      placed_at: dayjs(parseInt(o.placed_at) / 1_000).unix(),
    };
  });
}

function mapHistoricalToMapped(
  historicalOrders: HistoricalLimitOrder[],
  userAddress: string,
  quoteAsset: ReturnType<typeof getAssetFromAssetList>,
  baseAsset: ReturnType<typeof getAssetFromAssetList>
): MappedLimitOrder[] {
  return historicalOrders.map((o) => {
    const quantityMin = parseInt(o.quantity);
    const placedQuantityMin = parseInt(o.quantity);
    const price = tickToPrice(new Int(o.tick_id));
    const percentClaimed = new Dec(1);
    const output =
      o.order_direction === "bid"
        ? new Dec(placedQuantityMin).quo(price)
        : new Dec(placedQuantityMin).mul(price);
    return {
      quoteAsset,
      baseAsset,
      etas: "0",
      order_direction: o.order_direction,
      order_id: parseInt(o.order_id),
      owner: userAddress,
      placed_at:
        dayjs(
          o.place_timestamp && o.place_timestamp.length > 0
            ? o.place_timestamp
            : 0
        ).unix() * 1000,
      placed_quantity: parseInt(o.quantity),
      placedQuantityMin,
      quantityMin,
      quantity: parseInt(o.quantity),
      price,
      status: o.status as OrderStatus,
      tick_id: parseInt(o.tick_id),
      output,
      percentClaimed,
      percentFilled: new Dec(1),
      totalFilled: parseInt(o.quantity),
      orderbookAddress: o.contract,
    };
  });
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
  getAllActiveOrders: publicProcedure
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
          });

          const promises = contractAddresses.map(
            async (contractOsmoAddress: string) => {
              const resp = await getOrderbookActiveOrders({
                orderbookAddress: contractOsmoAddress,
                userOsmoAddress: userOsmoAddress,
                chainList: ctx.chainList,
              });
              const historicalOrdersForContract = historicalOrders.filter(
                (o) => o.contract === contractOsmoAddress
              );

              if (
                resp.orders.length === 0 &&
                historicalOrdersForContract.length === 0
              )
                return [];
              const { base_denom, quote_denom } = await getOrderbookDenoms({
                orderbookAddress: contractOsmoAddress,
                chainList: ctx.chainList,
              });
              const quoteAsset = getAssetFromAssetList({
                assetLists: ctx.assetLists,
                coinMinimalDenom: quote_denom,
              });

              const baseAsset = getAssetFromAssetList({
                assetLists: ctx.assetLists,
                coinMinimalDenom: base_denom,
              });

              const mappedOrders = await getTickInfoAndTransformOrders(
                contractOsmoAddress,
                resp.orders,
                ctx.chainList,
                quoteAsset,
                baseAsset
              );

              const mappedHistoricalOrders = mapHistoricalToMapped(
                historicalOrdersForContract,
                input.userOsmoAddress,
                quoteAsset,
                baseAsset
              );

              return [...mappedOrders, ...mappedHistoricalOrders];
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
          const resp = await getOrderbookActiveOrders({
            orderbookAddress: contractOsmoAddress,
            userOsmoAddress: userOsmoAddress,
            chainList: ctx.chainList,
          });

          if (resp.orders.length === 0) return [];
          const { base_denom, quote_denom } = await getOrderbookDenoms({
            orderbookAddress: contractOsmoAddress,
            chainList: ctx.chainList,
          });
          // TODO: Use actual quote denom here
          const quoteAsset = getAssetFromAssetList({
            assetLists: ctx.assetLists,
            sourceDenom: quote_denom,
          });
          const baseAsset = getAssetFromAssetList({
            assetLists: ctx.assetLists,
            sourceDenom: base_denom,
          });
          const mappedOrders = await getTickInfoAndTransformOrders(
            contractOsmoAddress,
            resp.orders,
            ctx.chainList,
            quoteAsset,
            baseAsset
          );
          return mappedOrders.filter((o) => o.percentFilled.gte(new Dec(1)));
        }
      );
      const ordersByContracts = await Promise.all(promises);
      const allOrders = ordersByContracts.flatMap((p) => p);
      return allOrders;
    }),
  getHistoricalOrders: publicProcedure
    .input(UserOsmoAddressSchema.required())
    .query(async ({ input }) => {
      const { userOsmoAddress } = input;
      const historicalOrders = await getOrderbookHistoricalOrders({
        userOsmoAddress,
      });
      return historicalOrders;
    }),
  getPools: publicProcedure.query(async () => {
    const pools = await getOrderbookPools();
    return pools;
  }),
});
