import { evmRpcHandler } from "~/server/api-handlers/evm-rpc";
import { toNodeApiHandler } from "~/utils/fetch-api-handler";

export default toNodeApiHandler(evmRpcHandler);

export const config = {
  api: { bodyParser: false },
};
