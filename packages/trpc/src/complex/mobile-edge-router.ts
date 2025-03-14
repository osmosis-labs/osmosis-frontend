import { createTRPCRouter } from "../api";
import { mobileSessionRouter } from "../mobile-session";
import { webRTCRouter } from "../web-rtc";

export const mobileEdgeRouter = createTRPCRouter({
  webRTC: webRTCRouter,
  mobileSession: mobileSessionRouter,
});
