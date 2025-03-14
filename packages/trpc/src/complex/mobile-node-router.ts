import { createTRPCRouter } from "../api";
import { gasRouter } from "../gas";
import { swapRouter } from "../swap";

export const mobileNodeRouter = createTRPCRouter({
  gas: gasRouter,
  quote: swapRouter,
});
