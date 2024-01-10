import { Dec } from "@keplr-wallet/unit";

import { api } from "~/utils/trpc";

const getWeekDateRange = () => {
  // Numia APY rate calculated on a 7 day rolling average
  // end date is current day, start date is 7 days beforehand
  const currentDate = new Date();
  const endDate = currentDate.toISOString().split("T")[0]; // Format as 'YYYY-MM-DD'
  currentDate.setDate(currentDate.getDate() - 7); // Set to 7 days before
  const startDate = currentDate.toISOString().split("T")[0]; // Format as 'YYYY-MM-DD'
  return { startDate, endDate };
};

export const useGetApr = () => {
  const { startDate, endDate } = getWeekDateRange();

  const { data, isLoading: isLoadingApr } = api.edge.staking.getApr.useQuery({
    startDate,
    endDate,
  });

  const stakingAPR = data || new Dec(0);

  return { stakingAPR, isLoadingApr };
};
