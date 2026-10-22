import { poolsHandler } from "~/server/api-handlers/pools";
import { toNodeApiHandler } from "~/utils/fetch-api-handler";

export default toNodeApiHandler(poolsHandler);

export const config = {
  api: { bodyParser: false },
};
