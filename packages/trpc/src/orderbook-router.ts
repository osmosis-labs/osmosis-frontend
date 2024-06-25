import { Dec, Int } from "@keplr-wallet/unit";
import { tickToPrice } from "@osmosis-labs/math";
import {
  CursorPaginationSchema,
  getOrderbookActiveOrders,
  getOrderbookMakerFee,
  getOrderbookSpotPrice,
  getOrderbookTickState,
  getOrderbookTickUnrealizedCancels,
  LimitOrder,
  maybeCachePaginatedItems,
} from "@osmosis-labs/server";
import { Chain } from "@osmosis-labs/types";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "./api";
import { OsmoAddressSchema } from "./parameter-types";

const GetInfiniteLimitOrdersInputSchema = CursorPaginationSchema.merge(
  z.object({
    userOsmoAddress: z.string().startsWith("osmo"),
  })
);

export type MappedLimitOrder = Omit<
  LimitOrder,
  "quantity" | "placed_quantity"
> & {
  quantity: number;
  placed_quantity: number;
  percentClaimed: Dec;
  totalFilled: number;
  percentFilled: Dec;
  orderbookAddress: string;
  price: Dec;
};

async function getTickInfoAndTransformOrders(
  orderbookAddress: string,
  orders: LimitOrder[],
  chainList: Chain[]
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

  return orders
    .map((o) => {
      const { tickState, unrealizedCancels } = fullTickState.find(
        ({ tickId }) => tickId === o.tick_id
      ) ?? { tickState: undefined, unrealizedCancels: undefined };
      const quantity = parseInt(o.quantity);
      const placedQuantity = parseInt(o.placed_quantity);

      const percentClaimed = new Dec(
        (placedQuantity - quantity) / placedQuantity
      );
      const [tickEtas, tickCumulativeCancelled, tickUnrealizedCancelled] =
        o.order_direction === "bid"
          ? [
              parseInt(
                tickState?.bid_values.effective_total_amount_swapped ?? "0"
              ),
              parseInt(
                tickState?.bid_values.cumulative_realized_cancels ?? "0"
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
                tickState?.ask_values.cumulative_realized_cancels ?? "0"
              ),
              parseInt(
                unrealizedCancels?.unrealized_cancels.ask_unrealized_cancels ??
                  "0"
              ),
            ];
      const tickTotalEtas =
        tickEtas + (tickUnrealizedCancelled - tickCumulativeCancelled);
      const totalFilled = Math.max(tickTotalEtas - parseInt(o.etas), 0);
      const percentFilled = new Dec(totalFilled / placedQuantity);
      const price = tickToPrice(new Int(o.tick_id));
      return {
        ...o,
        price,
        quantity,
        placed_quantity: placedQuantity,
        percentClaimed,
        totalFilled,
        percentFilled,
        orderbookAddress,
      };
    })
    .sort((a, b) => a.order_id - b.order_id);
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
  getActiveOrders: publicProcedure
    .input(
      GetInfiniteLimitOrdersInputSchema.merge(
        z.object({ contractOsmoAddress: z.string().startsWith("osmo") })
      )
    )
    .query(async ({ input, ctx }) => {
      return maybeCachePaginatedItems({
        getFreshItems: async () => {
          const { contractOsmoAddress, userOsmoAddress } = input;
          if (contractOsmoAddress.length === 0 || userOsmoAddress.length === 0)
            return [];
          const resp = await getOrderbookActiveOrders({
            orderbookAddress: contractOsmoAddress,
            userOsmoAddress: userOsmoAddress,
            chainList: ctx.chainList,
          });

          if (resp.orders.length === 0) return [];

          return getTickInfoAndTransformOrders(
            contractOsmoAddress,
            resp.orders,
            ctx.chainList
          );
        },
        cacheKey: JSON.stringify([
          "active-orders",
          input.contractOsmoAddress,
          input.userOsmoAddress,
        ]),
      });
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
          const promises = contractAddresses.map(
            async (contractOsmoAddress) => {
              const resp = await getOrderbookActiveOrders({
                orderbookAddress: contractOsmoAddress,
                userOsmoAddress: userOsmoAddress,
                chainList: ctx.chainList,
              });

              if (resp.orders.length === 0) return [];

              const mappedOrders = await getTickInfoAndTransformOrders(
                contractOsmoAddress,
                resp.orders,
                ctx.chainList
              );
              return mappedOrders;
            }
          );
          const ordersByContracts = await Promise.all(promises);
          const allOrders = ordersByContracts.flatMap((p) => p);
          return allOrders;
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
  getSpotPrice: publicProcedure
    .input(
      z
        .object({
          quoteAssetDenom: z.string(),
          baseAssetDenom: z.string(),
        })
        .required()
        .and(OsmoAddressSchema.required())
    )
    .query(async ({ input, ctx }) => {
      const { quoteAssetDenom, baseAssetDenom, osmoAddress } = input;
      const spotPrice = await getOrderbookSpotPrice({
        orderbookAddress: osmoAddress,
        quoteAssetDenom: quoteAssetDenom,
        baseAssetDenom: baseAssetDenom,
        chainList: ctx.chainList,
      });
      return spotPrice;
    }),
});
