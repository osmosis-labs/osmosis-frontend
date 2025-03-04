import { createTRPCRouter, webRTCRouter } from "@osmosis-labs/trpc";

export const osmosisFeRouter = createTRPCRouter({
  webRTC: webRTCRouter,
});
