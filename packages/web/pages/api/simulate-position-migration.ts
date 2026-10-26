import { simulatePositionMigrationHandler } from "~/server/api-handlers/simulate-position-migration";
import { toNodeApiHandler } from "~/utils/fetch-api-handler";

export default toNodeApiHandler(simulatePositionMigrationHandler);

// The handler reads the raw request, so Next must leave the body unparsed.
export const config = {
  api: { bodyParser: false },
};
