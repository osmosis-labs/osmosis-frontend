import { Dec } from "@keplr-wallet/unit";
import { useMemo } from "react";

import { useOrderbookByDenoms } from "~/hooks/limit-orders/use-orderbook";
import { useStore } from "~/stores";
import { api } from "~/utils/trpc";

export const useOrderbookPool = ({
  baseDenom,
  quoteDenom,
}: {
  baseDenom: string;
  quoteDenom: string;
}) => {
  const { orderbook } = useOrderbookByDenoms({
    baseDenom,
    quoteDenom,
  });
  const { accountStore } = useStore();
  const { makerFee, isLoading: isMakerFeeLoading } = useMakerFee({
    orderbookAddress: orderbook?.contractAddress ?? "",
  });
  const account = accountStore.getWallet(accountStore.osmosisChainId);
  const orderState = useOrders({
    orderbookAddress: orderbook?.contractAddress ?? "",
    userAddress: account?.address ?? "",
  });
  return {
    poolId: "1",
    baseDenom,
    quoteDenom,
    contractAddress: orderbook?.contractAddress ?? "",
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
