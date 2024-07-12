import { createNodeQuery } from "../../create-node-query";

export type SuperfluidParams = {
  params: {
    minimum_risk_factor: string;
  };
};

export const querySuperfluidParams = createNodeQuery<SuperfluidParams>({
  path: "/osmosis/superfluid/v1beta1/params",
});
