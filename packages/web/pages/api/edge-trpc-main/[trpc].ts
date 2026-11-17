import { edgeTrpcMainHandler } from "~/server/api-handlers/edge-trpc-main";

export default edgeTrpcMainHandler;

export const config = {
  runtime: "edge",
};
