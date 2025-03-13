import { createTRPCRouter } from "../api";
import { gasRouter } from "../gas";
import { mobileSessionRouter } from "../mobile-session";
import { swapRouter } from "../swap";
import { webRTCRouter } from "../web-rtc";

export const mobileNodeRouter = createTRPCRouter({
  gas: gasRouter,
  quote: swapRouter,
});

export const mobileEdgeRouter = createTRPCRouter({
  webRTC: webRTCRouter,
  mobileSession: mobileSessionRouter,
});
