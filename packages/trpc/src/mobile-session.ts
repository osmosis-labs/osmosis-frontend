import { getRedisClient } from "@osmosis-labs/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure, rateLimitedProcedure } from "./api";

export const MobileSessionMetadataSchema = z.object({
  deviceBrand: z.string(),
  deviceModel: z.string(),
  createdAt: z.number(),
});

export type MobileSessionMetadata = z.infer<typeof MobileSessionMetadataSchema>;

function getSessionMetadataKey(
  accountAddress: string,
  authenticatorId: string
) {
  return `${accountAddress}:${authenticatorId}`;
}

export const mobileSessionRouter = createTRPCRouter({
  storeMetadata: rateLimitedProcedure
    .input(
      z.object({
        accountAddress: z.string(),
        authenticatorId: z.string(),
        deviceBrand: z.string(),
        deviceModel: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const metadataKey = getSessionMetadataKey(
        input.accountAddress,
        input.authenticatorId
      );
      const metadata = MobileSessionMetadataSchema.parse({
        deviceBrand: input.deviceBrand,
        deviceModel: input.deviceModel,
        createdAt: Date.now(),
      });

      await getRedisClient().set(metadataKey, JSON.stringify(metadata));
      return { success: true };
    }),

  fetchMetadata: publicProcedure
    .input(
      z.object({
        accountAddress: z.string(),
        authenticatorId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const metadataKey = getSessionMetadataKey(
        input.accountAddress,
        input.authenticatorId
      );
      const data = await getRedisClient().get<MobileSessionMetadata>(
        metadataKey
      );
      if (!data) return { metadata: null };

      const validatedData = MobileSessionMetadataSchema.parse(data);
      return { metadata: validatedData };
    }),
});
