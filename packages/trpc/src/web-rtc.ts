import { getRedisClient } from "@osmosis-labs/server";
import { z } from "zod";

import { createTRPCRouter, rateLimitedProcedure } from "./api";

export const WebRTCSessionDataSchema = z.object({
  offerSDP: z.string(),
  createdAt: z.number(),
});

export type WebRTCSessionData = z.infer<typeof WebRTCSessionDataSchema>;

// Time before offer expires
const TTL_FIVE_MINUTES = 5 * 60; // 5 minutes

function getSessionKey(sessionToken: string) {
  return `session:${sessionToken}:offer`;
}

function getAnswerKey(sessionToken: string) {
  return `session:${sessionToken}:answer`;
}

function getCandidatesKey(sessionToken: string) {
  return `session:${sessionToken}:candidates`;
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
      const answerKey = getAnswerKey(input.sessionToken);
      await getRedisClient().set(answerKey, input.answerSDP, {
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
      const answerKey = getAnswerKey(input.sessionToken);
      const answerSDP = await getRedisClient().get<string>(answerKey);
      return { answerSDP: answerSDP ?? null };
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
      const candidatesKey = getCandidatesKey(input.sessionToken);
      await getRedisClient().rpush(candidatesKey, input.candidate);
      await getRedisClient().expire(candidatesKey, TTL_FIVE_MINUTES);
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
      const candidatesKey = getCandidatesKey(input.sessionToken);
      const candidates = await getRedisClient().lrange<{
        candidate: string;
        sdpMid: string;
        sdpMLineIndex: number;
        usernameFragment: string;
      }>(candidatesKey, 0, -1);
      return { candidates: candidates ?? [] };
    }),
});
