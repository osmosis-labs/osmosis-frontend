import { broadcastTransactionHandler } from "~/server/api-handlers/broadcast-transaction";
import { toNodeApiHandler } from "~/utils/fetch-api-handler";

export default toNodeApiHandler(broadcastTransactionHandler);

export const config = {
  api: { bodyParser: false },
};
