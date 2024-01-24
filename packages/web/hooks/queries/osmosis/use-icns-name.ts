import { useQuery } from "@tanstack/react-query";

import { queryICNSName } from "~/server/queries/osmosis";

export const useICNSName = ({ address }: { address: string }) => {
  return useQuery({
    queryKey: ["icns-name", address],
    queryFn: () => queryICNSName({ address }),
    enabled: Boolean(address) && typeof address === "string",
    select: (response) => {
      return {
        names: response.names,
        primaryName: response.primary_name,
      };
    },
  });
};
