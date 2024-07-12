import { createNodeQuery } from "../../create-node-query";

interface EpochProvisions {
  epoch_provisions: string;
}

export const queryEpochProvisions = createNodeQuery<EpochProvisions>({
  path: "/osmosis/mint/v1beta1/epoch_provisions",
});
