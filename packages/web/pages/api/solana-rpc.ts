import { solanaRpcHandler } from "~/server/api-handlers/solana-rpc";

export default solanaRpcHandler;

export const config = {
  runtime: "edge",
};
