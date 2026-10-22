import { broadcastTransactionHandler } from "~/server/api-handlers/broadcast-transaction";

export default broadcastTransactionHandler;

export const config = {
  runtime: "edge",
  regions: ["cdg1"], // Only execute this function in the Paris region
};
