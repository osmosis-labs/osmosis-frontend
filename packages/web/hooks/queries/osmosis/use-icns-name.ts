import { queryICNSName } from "@osmosis-labs/server";
import { useQuery } from "@tanstack/react-query";

import { IS_TESTNET } from "~/config";
import { ChainList } from "~/config/generated/chain-list";

export const useICNSName = ({ address }: { address: string }) => {
  const enabled =
    !!IS_TESTNET && Boolean(address) && typeof address === "string";

  return useQuery({
    queryKey: ["icns-name", address],
    queryFn: () => queryICNSName({ address, chainList: ChainList }),
    enabled,
    select: ({ data: { names, primary_name } }) => {
      return {
        names: names,
        primaryName: primary_name,
      };
    },
  });
};
