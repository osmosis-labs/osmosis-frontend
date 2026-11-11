import { solanaRpcHandler } from "~/server/api-handlers/solana-rpc";
import { toNodeApiHandler } from "~/utils/fetch-api-handler";

export default toNodeApiHandler(solanaRpcHandler);

export const config = {
  api: { bodyParser: false },
};
