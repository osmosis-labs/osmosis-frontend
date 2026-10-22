import { poolHandler } from "~/server/api-handlers/pool";
import { toNodeApiHandler } from "~/utils/fetch-api-handler";

export default toNodeApiHandler(poolHandler);

export const config = {
  api: { bodyParser: false },
};
