import { edgeTrpcPoolsHandler } from "~/server/api-handlers/edge-trpc-pools";
import { toNodeApiHandler } from "~/utils/fetch-api-handler";

export default toNodeApiHandler(edgeTrpcPoolsHandler);

export const config = {
  api: { bodyParser: false },
};
