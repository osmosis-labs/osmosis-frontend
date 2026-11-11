import { edgeTrpcMainHandler } from "~/server/api-handlers/edge-trpc-main";
import { toNodeApiHandler } from "~/utils/fetch-api-handler";

export default toNodeApiHandler(edgeTrpcMainHandler);

export const config = {
  api: { bodyParser: false },
};
