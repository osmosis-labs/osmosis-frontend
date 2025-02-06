import { createNodeQuery } from "../../create-node-query";
import { getQuerySmartContractPath } from "./contract";

export type QueryCosmWasmBalancesResponse = {
  data: {
    balance: string;
  };
};

export const queryCosmWasmContractBalance = createNodeQuery<
  QueryCosmWasmBalancesResponse,
  {
    contractAddress: string;
    userBech32Address: string;
  }
>({
  path: ({ userBech32Address, contractAddress }) =>
    getQuerySmartContractPath({
      contractAddress,
      msg: {
        balance: {
          address: userBech32Address,
        },
      },
    }),
});
