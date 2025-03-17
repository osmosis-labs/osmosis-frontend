import {
  createTRPCRouter,
  mobileSessionRouter,
  webRTCRouter,
} from "@osmosis-labs/trpc";

export const osmosisFeRouter = createTRPCRouter({
  webRTC: webRTCRouter,
  mobileSession: mobileSessionRouter,
});
