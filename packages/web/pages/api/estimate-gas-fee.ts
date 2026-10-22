import { estimateGasFeeHandler } from "~/server/api-handlers/estimate-gas-fee";
import { toNodeApiHandler } from "~/utils/fetch-api-handler";

export default toNodeApiHandler(estimateGasFeeHandler);

// The handler reads the raw request, so Next must leave the body unparsed.
export const config = {
  api: { bodyParser: false },
};

// NOTE: `estimateGasFee` use of cosmjs-types makes it incompatible in edge runtime
// extend max duration to allow for more cache hits behind estimateGasFee
export const maxDuration = 300; // This function can run for a maximum of 300 seconds
