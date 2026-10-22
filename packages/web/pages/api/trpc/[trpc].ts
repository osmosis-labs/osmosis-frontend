import { trpcHandler } from "~/server/api-handlers/trpc";
import { toNodeApiHandler } from "~/utils/fetch-api-handler";

export default toNodeApiHandler(trpcHandler);

// The handler reads the raw request, so Next must leave the body unparsed.
export const config = {
  api: { bodyParser: false },
};
