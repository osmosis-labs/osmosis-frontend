import { Dec } from "@keplr-wallet/unit";
import { useMemo, useState } from "react";

import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export const useOrderbookPool = ({
  baseDenom,
  quoteDenom,
}: {
  baseDenom: string;
  quoteDenom: string;
}) => {
  const [contractAddress] = useState<string>(
    "osmo1svmdh0ega4jg44xc3gg36tkjpzrzlrgajv6v6c2wf0ul8m3gjajs0dps9w"
  );
  const { accountStore } = useStore();
  const { makerFee, isLoading: isMakerFeeLoading } = useMakerFee({
    orderbookAddress: contractAddress,
  });
  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const orderState = useOrders({
    orderbookAddress: contractAddress,
    userAddress: account?.address ?? "",
  });
  return {
    poolId: "1",
    baseDenom,
    quoteDenom,
    contractAddress,
    makerFee,
    isMakerFeeLoading,
    orderState,
  };
};

const useMakerFee = ({ orderbookAddress }: { orderbookAddress: string }) => {
  const { data: makerFeeData, isLoading } =
    api.local.orderbook.getMakerFee.useQuery({
      contractOsmoAddress: orderbookAddress,
    });

  const makerFee = useMemo(() => {
    if (isLoading) return new Dec(0);
    return new Dec(makerFeeData?.makerFee ?? 0);
  }, [isLoading, makerFeeData]);
  return {
    makerFee,
    isLoading,
  };
};

const useOrders = ({
  orderbookAddress,
  userAddress,
}: {
  orderbookAddress: string;
  userAddress: string;
}) => {
  const { data: orders, isLoading } =
    api.local.orderbook.getActiveOrders.useQuery({
      contractOsmoAddress: orderbookAddress,
      userOsmoAddress: userAddress,
    });
  return {
    orders,
    isLoading,
  };
};
