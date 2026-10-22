import { skipTxStatusHandler } from "~/server/api-handlers/skip-tx";
import { toNodeApiHandler } from "~/utils/fetch-api-handler";

export default toNodeApiHandler(skipTxStatusHandler);

// The handler reads the raw request, so Next must leave the body unparsed.
export const config = {
  api: { bodyParser: false },
};
