import { cspReportHandler } from "~/server/api-handlers/csp-report";
import { toNodeApiHandler } from "~/utils/fetch-api-handler";

export default toNodeApiHandler(cspReportHandler);

// The handler reads the raw request, so Next must leave the body unparsed.
export const config = {
  api: { bodyParser: false },
};
