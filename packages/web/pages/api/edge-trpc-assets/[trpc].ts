import { edgeTrpcAssetsHandler } from "~/server/api-handlers/edge-trpc-assets";
import { toNodeApiHandler } from "~/utils/fetch-api-handler";

export default toNodeApiHandler(edgeTrpcAssetsHandler);

export const config = {
  api: { bodyParser: false },
};
