import { Dec } from "@osmosis-labs/unit";

import { api } from "~/utils/trpc";

const getAprDateRange = () => {
  // average Numia's daily APR over the last 30 days
  // end date is current day, start date is 30 days beforehand
  const currentDate = new Date();
  const endDate = currentDate.toISOString().split("T")[0]; // Format as 'YYYY-MM-DD'
  currentDate.setDate(currentDate.getDate() - 30); // Set to 30 days before
  const startDate = currentDate.toISOString().split("T")[0]; // Format as 'YYYY-MM-DD'
  return { startDate, endDate };
};

export function useGetApr() {
  const { startDate, endDate } = getAprDateRange();

  const { data, isLoading: isLoadingApr } = api.edge.staking.getApr.useQuery({
    startDate,
    endDate,
  });

  const stakingAPR = data || new Dec(0);

  return { stakingAPR, isLoadingApr };
}
