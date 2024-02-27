import { createNodeQuery } from "~/server/queries/base-utils";

import { ICNS_RESOLVER_CONTRACT_ADDRESS } from ".";

interface ICNSNameResponse {
  data: {
    names: string[];
    primary_name: string;
  };
}

export const queryICNSName = createNodeQuery<
  ICNSNameResponse,
  {
    address: string;
  }
>({
  path: ({ address }) => {
    const msg = JSON.stringify({
      icns_names: { address: address },
    });
    const encodedMsg = Buffer.from(msg).toString("base64");

    return `/cosmwasm/wasm/v1/contract/${ICNS_RESOLVER_CONTRACT_ADDRESS}/smart/${encodedMsg}`;
  },
});
