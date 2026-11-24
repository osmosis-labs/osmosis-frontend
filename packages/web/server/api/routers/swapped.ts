import {
  createTRPCRouter,
  OsmoAddressValueSchema,
  publicProcedure,
} from "@osmosis-labs/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  signSwappedUrl,
  SwappedSignUrlError,
} from "~/server/integrations/swapped/sign-swapped-url";

/**
 * Server-side Swapped.com URL signer for `local.swapped.getSignature`.
 * Signs directly with `SWAPPED_COM_SK` on the API Worker rather than making a
 * loopback HTTP request to `/api/swapped-signature`.
 */
export const swappedRouter = createTRPCRouter({
  getSignature: publicProcedure
    .input(
      z.object({
        walletAddress: OsmoAddressValueSchema,
      })
    )
    .query(({ input: { walletAddress } }) => {
      const secretKey = process.env.SWAPPED_COM_SK;
      if (!secretKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Swapped.com secret key not provided",
        });
      }
      try {
        return signSwappedUrl(walletAddress, secretKey);
      } catch (error) {
        if (error instanceof SwappedSignUrlError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.message,
          });
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sign Swapped URL",
        });
      }
    }),
});
