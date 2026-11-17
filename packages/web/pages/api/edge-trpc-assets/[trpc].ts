import { edgeTrpcAssetsHandler } from "~/server/api-handlers/edge-trpc-assets";

export default edgeTrpcAssetsHandler;

export const config = {
  runtime: "edge",
};
