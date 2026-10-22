import { swappedSignatureHandler } from "~/server/api-handlers/swapped-signature";
import { toNodeApiHandler } from "~/utils/fetch-api-handler";

export default toNodeApiHandler(swappedSignatureHandler);

// The handler reads the raw request, so Next must leave the body unparsed.
export const config = {
  api: { bodyParser: false },
};
