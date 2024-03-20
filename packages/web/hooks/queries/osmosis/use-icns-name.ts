import { queryICNSName } from "@osmosis-labs/server";
import { useQuery } from "@tanstack/react-query";

export const useICNSName = ({ address }: { address: string }) => {
  return useQuery({
    queryKey: ["icns-name", address],
    queryFn: () => queryICNSName({ address }),
    enabled: Boolean(address) && typeof address === "string",
    select: ({ data: { names, primary_name } }) => {
      return {
        names: names,
        primaryName: primary_name,
      };
    },
  });
};
