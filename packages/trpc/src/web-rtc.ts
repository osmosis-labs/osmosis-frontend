import { getRedisClient } from "@osmosis-labs/server";
import { z } from "zod";

import { createTRPCRouter, rateLimitedProcedure } from "./api";

export const WebRTCSessionDataSchema = z.object({
  offerSDP: z.string().optional(),
  answerSDP: z.string().optional(),
  candidates: z.array(z.string()).optional(),
  createdAt: z.number(),
});

export type WebRTCSessionData = z.infer<typeof WebRTCSessionDataSchema>;

// Time before offer expires
const TTL_FIVE_MINUTES = 5 * 60; // 5 minutes

function getSessionKey(sessionToken: string) {
  return `session:${sessionToken}`;
}

export const webRTCRouter = createTRPCRouter({
  // 1. Desktop: create offer
  createOffer: rateLimitedProcedure
    .input(
      z.object({
        sessionToken: z.string(),
        offerSDP: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const sessionKey = getSessionKey(input.sessionToken);
      const sessionData = WebRTCSessionDataSchema.parse({
        offerSDP: input.offerSDP,
        candidates: [],
        createdAt: Date.now(),
      });

      await getRedisClient().set(sessionKey, JSON.stringify(sessionData), {
        ex: TTL_FIVE_MINUTES,
      });
      return { success: true };
    }),

  // 2. Mobile: fetch offer
  fetchOffer: rateLimitedProcedure
    .input(
      z.object({
        sessionToken: z.string(),
      })
    )
    .query(async ({ input }) => {
      const sessionKey = getSessionKey(input.sessionToken);
      const data = await getRedisClient().get<WebRTCSessionData>(sessionKey);
      if (!data) return { offerSDP: null };

      const validatedData = WebRTCSessionDataSchema.parse(data);
      return { offerSDP: validatedData.offerSDP ?? null };
    }),

  // 3. Mobile: post answer
  postAnswer: rateLimitedProcedure
    .input(
      z.object({
        sessionToken: z.string(),
        answerSDP: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const sessionKey = getSessionKey(input.sessionToken);
      const existingData = await getRedisClient().get<WebRTCSessionData>(
        sessionKey
      );
      if (!existingData) {
        return { success: false, error: "Session not found" };
      }

      const validatedExistingData = WebRTCSessionDataSchema.parse(existingData);
      const updatedData = WebRTCSessionDataSchema.parse({
        ...validatedExistingData,
        answerSDP: input.answerSDP,
      });

      await getRedisClient().set(sessionKey, JSON.stringify(updatedData), {
        ex: TTL_FIVE_MINUTES,
      });
      return { success: true };
    }),

  // 4. Desktop: fetch answer
  fetchAnswer: rateLimitedProcedure
    .input(
      z.object({
        sessionToken: z.string(),
      })
    )
    .query(async ({ input }) => {
      const sessionKey = getSessionKey(input.sessionToken);
      const data = await getRedisClient().get<WebRTCSessionData>(sessionKey);
      if (!data) return { answerSDP: null };

      const validatedData = WebRTCSessionDataSchema.parse(data);
      return { answerSDP: validatedData.answerSDP ?? null };
    }),

  // 5. Either side: post ICE candidate
  postCandidate: rateLimitedProcedure
    .input(
      z.object({
        sessionToken: z.string(),
        candidate: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const sessionKey = getSessionKey(input.sessionToken);
      const existingData = await getRedisClient().get<WebRTCSessionData>(
        sessionKey
      );
      if (!existingData) {
        return { success: false, error: "Session not found" };
      }

      const validatedExistingData = WebRTCSessionDataSchema.parse(existingData);
      const updatedData = WebRTCSessionDataSchema.parse({
        ...validatedExistingData,
        candidates: [
          ...(validatedExistingData.candidates ?? []),
          input.candidate,
        ],
      });

      await getRedisClient().set(sessionKey, JSON.stringify(updatedData), {
        ex: TTL_FIVE_MINUTES,
      });
      return { success: true };
    }),

  // 6. Either side: fetch ICE candidates
  fetchCandidates: rateLimitedProcedure
    .input(
      z.object({
        sessionToken: z.string(),
      })
    )
    .query(async ({ input }) => {
      const sessionKey = getSessionKey(input.sessionToken);
      const data = await getRedisClient().get<WebRTCSessionData>(sessionKey);
      if (!data) return { candidates: [] };

      const validatedData = WebRTCSessionDataSchema.parse(data);
      return { candidates: validatedData.candidates ?? [] };
    }),
});
