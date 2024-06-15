import { Dec } from "@keplr-wallet/unit";
import { useMemo, useState } from "react";

import { api } from "~/utils/trpc";

export const useOrderbookPool = ({
  baseDenom,
  quoteDenom,
}: {
  baseDenom: string;
  quoteDenom: string;
}) => {
  const [contractAddress] = useState<string>(
    "osmo1kgvlc4gmd9rvxuq2e63m0fn4j58cdnzdnrxx924mrzrjclcgqx5qxn3dga"
  );
  const { makerFee, isLoading: isMakerFeeLoading } = useMakerFee({
    orderbookAddress: contractAddress,
  });
  return {
    poolId: "1",
    baseDenom,
    quoteDenom,
    contractAddress,
    makerFee,
    isMakerFeeLoading,
  };
};

const useMakerFee = ({ orderbookAddress }: { orderbookAddress: string }) => {
  const { data: makerFeeData, isLoading } =
    api.edge.orderbooks.getMakerFee.useQuery({
      osmoAddress: orderbookAddress,
    });

  const makerFee = useMemo(() => {
    if (isLoading) return new Dec(0);
    return makerFeeData?.makerFee ?? new Dec(0);
  }, [isLoading, makerFeeData]);
  return {
    makerFee,
    isLoading,
  };
};
