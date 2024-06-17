import { createNodeQuery } from "../../create-node-query";

interface MintingInflation {
  inflation: string;
}

export const queryInflation = createNodeQuery<MintingInflation>({
  path: "/cosmos/mint/v1beta1/inflation",
});
