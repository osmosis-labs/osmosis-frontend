import { useAsync } from "react-use";

import { useStore } from "~/stores";

export const useIsOneClickTradingEnabled = () => {
  const { accountStore } = useStore();
  const { value } = useAsync(
    async () => accountStore.isOneCLickTradingEnabled(),
    [accountStore.oneClickTradingInfo]
  );

  return { isOneClickTradingEnabled: value };
};
